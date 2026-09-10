#!/usr/bin/env bash
# Demonstration driver for the reference procedure `stromentlastung`.
#
#   demo.sh up <TICKET|branch>   start both worlds: the application as it stands on main,
#                                and a second one in which every repository the delivered
#                                branch touched is replaced by its branch build
#   demo.sh status               what is running, and which services differ
#   demo.sh down                 stop both worlds, keep the databases
#   demo.sh reset                stop both worlds and drop the databases; the next start seeds again
#
# A ticket id is expanded to `codegen/<TICKET>`. The branch is taken from `origin`; if it
# has not been delivered yet, the pipeline clone under the SDLC Pilot cache is used as a
# fallback and the run says so.
#
# Only repositories that actually differ from main are duplicated. Everything else is the
# very same container in both worlds, and each duplicated service keeps its own database
# with the identical seed.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLATFORM="$ROOT/stromentlastung-platform"
DEMO="$ROOT/.demo"
CLONE="${SDLCPILOT_CACHE:-$HOME/sdlcpilot/.cache/repos/stromentlastung}"
PROJECT=stromentlastung
MAIN_PORT=${STROMENTLASTUNG_GATEWAY_PORT:-8090}
FIXED_PORT=${STROMENTLASTUNG_FIXED_PORT:-8095}
OVERRIDE="$PLATFORM/docker-compose.demo.yml"
NGINX_FIXED="$PLATFORM/gateway/nginx-fixed.conf"

# repository -> container port; the user interface has no port of its own, it is served by nginx
declare -A PORTS=([unternehmen]=8091 [antrag]=8092 [bescheid]=8093 [zahlung]=8094)
declare -A PREFIX=([unternehmen]=/api/unternehmen [antrag]=/api/antraege [bescheid]=/api/bescheide [zahlung]=/api/zahlungen)
RUNTIME=(unternehmen antrag bescheid zahlung ui)

say()  { printf '\033[0;36m%s\033[0m\n' "$*"; }
ok()   { printf '  \033[0;32m%s\033[0m\n' "$*"; }
warn() { printf '  \033[0;33m%s\033[0m\n' "$*"; }
die()  { printf '  \033[0;31m%s\033[0m\n' "$*"; exit 1; }

compose() {
  if [ -f "$OVERRIDE" ]; then
    (cd "$PLATFORM" && docker compose -p "$PROJECT" -f docker-compose.yml -f docker-compose.demo.yml --profile full "$@")
  else
    (cd "$PLATFORM" && docker compose -p "$PROJECT" --profile full "$@")
  fi
}

resolve_branch() {
  case "$1" in */*) echo "$1" ;; *) echo "codegen/$1" ;; esac
}

# Where the branch comes from, in order of authority: the remote, then a local branch of
# the same name, then the pipeline clone of a run that has not been delivered yet. Prints
# the commit and sets ORIGIN_OF_BRANCH; returns non-zero when the branch is nowhere.
ORIGIN_OF_BRANCH=""
fetch_branch() {
  local repo=$1 branch=$2 dir="$ROOT/stromentlastung-$repo"
  if git -C "$dir" fetch -q origin "+refs/heads/$branch:refs/remotes/origin/$branch" 2>/dev/null; then
    ORIGIN_OF_BRANCH=origin; git -C "$dir" rev-parse "origin/$branch"; return 0
  fi
  if git -C "$dir" show-ref -q --verify "refs/heads/$branch"; then
    ORIGIN_OF_BRANCH=local; git -C "$dir" rev-parse "$branch"; return 0
  fi
  if [ -d "$CLONE/$repo/.git" ] \
     && git -C "$dir" fetch -q "$CLONE/$repo" "+refs/heads/$branch:refs/remotes/pipeline/$branch" 2>/dev/null; then
    ORIGIN_OF_BRANCH=pipeline; git -C "$dir" rev-parse "pipeline/$branch"; return 0
  fi
  return 1
}

cmd_up() {
  local ticket=${1:-}
  [ -z "$ticket" ] && die "usage: demo.sh up <TICKET|branch>"
  local branch; branch=$(resolve_branch "$ticket")
  say "Branch $branch"

  # Decide first, change nothing yet: a branch that touches nothing must leave a running
  # demonstration alone.
  local changed=() shas=() from_clone=0
  for repo in "${RUNTIME[@]}"; do
    local dir="$ROOT/stromentlastung-$repo" sha main_sha
    ORIGIN_OF_BRANCH=""
    if ! sha=$(fetch_branch "$repo" "$branch"); then ok "$repo: not on the branch"; continue; fi
    git -C "$dir" fetch -q origin main
    main_sha=$(git -C "$dir" rev-parse origin/main)
    # Content decides, not the commit. A cascade branch that merely points at an older
    # main carries no change and must not become a second container.
    if [ "$sha" = "$main_sha" ] || git -C "$dir" diff --quiet "origin/main...$sha"; then
      ok "$repo: nothing changed against main"; continue
    fi
    changed+=("$repo"); shas+=("$sha")
    [ "$ORIGIN_OF_BRANCH" = origin ] || from_clone=1
    ok "$repo: differs, built from ${sha:0:7} ($ORIGIN_OF_BRANCH)"
  done
  [ ${#changed[@]} -eq 0 ] && die "no runtime repository differs from main on $branch — nothing to compare"
  [ $from_clone -eq 1 ] && warn "the branch is not on origin yet; it was taken from the working copy or the pipeline clone"

  # Jeder Dienst soll melden können, woraus er gebaut wurde. Die Hauptwelt bekommt den
  # Stand von origin/main, die zweite Welt den des Branches.
  for repo in unternehmen antrag bescheid zahlung; do
    local dir="$ROOT/stromentlastung-$repo" key=${repo^^}
    export "${key}_REVISION=$(git -C "$dir" rev-parse --short origin/main)"
    export "${key}_REF=main"
  done

  rm -rf "$DEMO"; mkdir -p "$DEMO"
  local i
  for i in "${!changed[@]}"; do
    local dir="$ROOT/stromentlastung-${changed[$i]}"
    git -C "$dir" worktree prune
    git -C "$dir" worktree add -q --detach "$DEMO/${changed[$i]}" "${shas[$i]}"
  done

  generate_override "$branch" "${changed[@]}"
  generate_nginx "${changed[@]}"
  say "Build and start"
  compose --profile fixed up -d --build
  wait_ready
  say "Ready"
  ok "before:  http://localhost:$MAIN_PORT"
  ok "fixed:   http://localhost:$FIXED_PORT   (${changed[*]})"
  for repo in "${changed[@]}"; do
    [ "$repo" = ui ] || ok "         database of the second $repo on port $((PORTS[$repo] + 100))"
  done
  ok "sign in with mastouri@stromentlastung.dev / stromentlastung"
}

# One service per changed repository, plus the second entrance. Anchors do not cross
# compose files, so the environment is written out in full.
generate_override() {
  local branch=$1; shift
  local changed=("$@")
  local has_fixed=""
  { echo "# Generated by scripts/demo.sh. Do not edit; it is rewritten on every start."
    echo "services:"
    for repo in "${changed[@]}"; do
      echo "  ${repo}-fixed:"
      echo "    profiles: [fixed]"
      echo "    build:"
      echo "      context: ../.demo/$repo"
      echo "      args:"
      echo "        BUILD_REVISION: $(git -C "$DEMO/$repo" rev-parse --short HEAD)"
      echo "        BUILD_REF: $branch"
      echo "    networks: [stromentlastung]"
      if [ "$repo" != ui ]; then
        # Die zweite Welt hört auf denselben Port im Container, nach außen um 100 versetzt,
        # damit sich beide Datenbanken nebeneinander ansehen lassen.
        echo "    ports: [\"127.0.0.1:$((PORTS[$repo] + 100)):${PORTS[$repo]}\"]"
        echo "    depends_on: [keycloak]"
        echo "    volumes: [\"${repo}-fixed-data:/app/data\"]"
        echo "    environment:"
        echo "      STROMENTLASTUNG_ISSUER: http://localhost:9091/realms/stromentlastung"
        echo "      STROMENTLASTUNG_JWKS_URI: http://keycloak:8080/realms/stromentlastung/protocol/openid-connect/certs"
        echo "      STROMENTLASTUNG_H2_CONSOLE_REMOTE: \"true\""
        for dep in unternehmen bescheid zahlung; do
          local host=$dep
          [[ " ${changed[*]} " == *" $dep "* ]] && host="${dep}-fixed"
          echo "      STROMENTLASTUNG_$(echo "$dep" | tr a-z A-Z)_URL: http://$host:${PORTS[$dep]}${PREFIX[$dep]}"
        done
      fi
    done
    echo "  gateway-fixed:"
    echo "    profiles: [fixed]"
    echo "    image: nginx:1.27-alpine"
    echo "    volumes:"
    echo "      - ./gateway/nginx-fixed.conf:/etc/nginx/conf.d/default.conf:ro"
    echo "      - ./gateway/proxy_params_stromentlastung:/etc/nginx/proxy_params_stromentlastung:ro"
    echo "    ports: [\"$FIXED_PORT:80\"]"
    echo "    networks: [stromentlastung]"
    echo "    depends_on: [ui, unternehmen, antrag, bescheid, zahlung]"
    echo "volumes:"
    for repo in "${changed[@]}"; do
      if [ "$repo" != ui ]; then echo "  ${repo}-fixed-data:"; has_fixed=1; fi
    done
    if [ -z "$has_fixed" ]; then echo "  demo-placeholder:"; fi
  } > "$OVERRIDE"
  return 0
}

# The second entrance routes each prefix to the branch container where one exists.
generate_nginx() {
  local changed=("$@") ui_host=ui
  [[ " ${changed[*]} " == *" ui "* ]] && ui_host=ui-fixed
  { echo "# Generated by scripts/demo.sh. Second entrance for the demonstration: identical to the"
    echo "# main one except for the services the delivered branch touched."
    echo "#"
    echo "# Targets are held in variables so that nginx resolves them per request through Docker"
    echo "# DNS; otherwise a restarted service leaves nginx pointing at a dead address."
    echo "server {"
    echo "    listen 80;"
    echo "    client_max_body_size 10m;"
    echo "    resolver 127.0.0.11 valid=10s ipv6=off;"
    echo
    for repo in unternehmen antrag bescheid zahlung; do
      local host=$repo
      [[ " ${changed[*]} " == *" $repo "* ]] && host="${repo}-fixed"
      printf '    location %s/ { set $ziel %s:%s; proxy_pass http://$ziel; include /etc/nginx/proxy_params_stromentlastung; }\n' \
        "${PREFIX[$repo]}" "$host" "${PORTS[$repo]}"
    done
    echo
    printf '    location / { set $ziel %s:80; proxy_pass http://$ziel; include /etc/nginx/proxy_params_stromentlastung; }\n' "$ui_host"
    echo "}"
  } > "$NGINX_FIXED"
  return 0
}

wait_ready() {
  local i
  for i in $(seq 1 60); do
    curl -fsS -o /dev/null --max-time 3 "http://localhost:9091/realms/stromentlastung" 2>/dev/null \
      && curl -fsS -o /dev/null --max-time 3 "http://localhost:$MAIN_PORT/api/unternehmen/v3/api-docs" 2>/dev/null \
      && curl -fsS -o /dev/null --max-time 3 "http://localhost:$MAIN_PORT/" 2>/dev/null \
      && { [ -f "$OVERRIDE" ] || return 0; curl -fsS -o /dev/null --max-time 3 "http://localhost:$FIXED_PORT/" 2>/dev/null && return 0; }
    sleep 3
  done
  warn "not everything answered in time; try scripts/demo.sh status"
}

cmd_status() {
  say "Containers"
  compose --profile fixed ps --format '{{.Service}}: {{.Status}}' 2>/dev/null | sort | sed 's/^/  /'
  if [ -f "$OVERRIDE" ]; then
    say "Second world"
    grep -E '^  [a-z-]+-fixed:' "$OVERRIDE" | tr -d ' :' | sed 's/^/  /'
  else
    warn "no second world configured; run demo.sh up <TICKET>"
  fi
  say "Numbers"
  local t
  t=$(curl -s --max-time 5 -d 'client_id=stromentlastung-web&grant_type=password&username=mastouri@stromentlastung.dev&password=stromentlastung' \
      http://localhost:9091/realms/stromentlastung/protocol/openid-connect/token | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
  [ -z "$t" ] && { warn "no token; is Keycloak up?"; return 0; }
  for port in "$MAIN_PORT" "$FIXED_PORT"; do
    curl -fsS --max-time 5 -H "Authorization: Bearer $t" "http://localhost:$port/api/zahlungen/rueckforderungen" 2>/dev/null \
      | sed -n 's/.*"zuschlagCent":\([0-9]*\).*/  '"$port"': surcharge \1 cent/p' || warn "$port: no answer"
  done
}

cmd_down()  { say "Stop"; compose --profile fixed stop; }
cmd_reset() { say "Stop and drop the databases"; compose --profile fixed down -v --remove-orphans; rm -f "$OVERRIDE" "$NGINX_FIXED"; rm -rf "$DEMO"; }

case "${1:-}" in
  up) shift; cmd_up "${1:-}" ;;
  status) cmd_status ;;
  down) cmd_down ;;
  reset) cmd_reset ;;
  *) sed -n '2,16p' "$0"; exit 1 ;;
esac
