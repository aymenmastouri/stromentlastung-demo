#!/usr/bin/env bash
# Sicherung und Wiederherstellung des Vorführungsstands von SDLC Pilot für das
# Referenzverfahren `stromentlastung`.
#
#   sicherung.sh save <name> [run-id]   sichert die Kette von Läufen, die in run-id endet
#                                       (ohne Angabe: der jüngste beendete Lauf des Projekts),
#                                       nach $SDLCPILOT_BACKUPS/<name>/; ein vorhandenes Ziel
#                                       wird nie überschrieben
#   sicherung.sh restore <name>         spielt eine Sicherung in den State-Root zurück, in
#                                       sicherer Reihenfolge: erst die Quelle prüfen, dann den
#                                       jetzigen Stand beiseitelegen, erst dann tauschen
#   sicherung.sh list                   zeigt die Sicherungen unter $SDLCPILOT_BACKUPS
#
# Eine Sicherung hält den Wissensbaum des Projekts, die Run-Records und Phasenstände der
# Kette, ihre Log-Ordner, ihre Zeilen der Verlaufsdatei und die Branches `codegen/*` der
# Pipeline-Klone als Git-Bundles. Nicht enthalten: Qdrant, Neo4j, die Branches auf GitHub,
# die Einstellungen der App und die Klone selbst.
#
# Umgebung (alle überschreibbar):
#   SDLCPILOT_STATE    State-Root der App             $HOME/sdlcpilot
#   SDLCPILOT_BACKUPS  Ablage der Sicherungen         $HOME/sdlcpilot-local-backups
#   SDLCPILOT_CACHE    Klone der Pipeline             $SDLCPILOT_STATE/.cache/repos/stromentlastung
#   SDLCPILOT_API      Backend der laufenden App      http://127.0.0.1:8000
#
# Nach einer Wiederherstellung muss die App neu gestartet werden:
#   osascript -e 'quit app "SDLC Pilot"'; sleep 5; open -a "SDLC Pilot"
set -euo pipefail

STATE="${SDLCPILOT_STATE:-$HOME/sdlcpilot}"
BACKUPS="${SDLCPILOT_BACKUPS:-$HOME/sdlcpilot-local-backups}"
CLONE="${SDLCPILOT_CACHE:-$STATE/.cache/repos/stromentlastung}"
API="${SDLCPILOT_API:-http://127.0.0.1:8000}"
PROJECT=stromentlastung
BRANCH=main
REPOS=(platform unternehmen antrag bescheid zahlung ui e2e)

KNOWLEDGE="$STATE/knowledge/apps/codegen/$PROJECT/$BRANCH"
RUNS="$STATE/state/runs"
ACCOUNTS="$STATE/logs/apps/codegen/accounts"
HISTORY="$STATE/logs/run_history.jsonl"
STAMP=$(date +%Y%m%d-%H%M%S)

say()  { printf '\033[0;36m%s\033[0m\n' "$*"; }
ok()   { printf '  \033[0;32m%s\033[0m\n' "$*"; }
warn() { printf '  \033[0;33m%s\033[0m\n' "$*"; }
die()  { printf '  \033[0;31m%s\033[0m\n' "$*"; exit 1; }

[ "${BASH_VERSINFO[0]}" -ge 4 ] || die "bash 4 oder neuer nötig (brew install bash)"

# Ein Pfad, aufgelöst auch wenn er noch nicht existiert.
abspath() { python3 -c 'import os, sys; print(os.path.realpath(sys.argv[1]))' "$1"; }
# Liegt $1 in $2 oder ist es $2 selbst?
inside()  { [ "$1" = "$2" ] || [[ "$1" == "$2"/* ]]; }
count_files() { find "$1" -type f | wc -l | tr -d ' '; }
size_of() { du -sh "$1" | cut -f1 | tr -d ' '; }

check_name() {
  [[ "${1:-}" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] \
    || die "unzulässiger Name '${1:-}': Buchstaben, Ziffern, Punkt, Bindestrich und Unterstrich, nicht mit Punkt beginnend"
}

# Der State-Root muss einer sein, und die Ablage darf nicht darin liegen: sonst sicherte man
# in den Baum hinein, den man wiederherstellt.
check_layout() {
  [ -d "$RUNS" ] || die "kein State-Root unter $STATE (state/runs fehlt)"
  local s b
  s=$(abspath "$STATE"); b=$(abspath "$BACKUPS")
  inside "$b" "$s" && die "die Ablage der Sicherungen darf nicht im State-Root liegen: $BACKUPS"
  return 0
}

# Was das Backend über die Pipeline sagt; leer, wenn die App nicht antwortet.
pipeline_state() {
  local body
  body=$(curl -s --max-time 3 "$API/api/pipeline/status" 2>/dev/null || true)
  python3 - "$body" <<'EOF'
import json, sys
try:
    print(json.loads(sys.argv[1]).get("state") or "")
except Exception:
    print("")
EOF
}

# Ohne App bleibt der Blick in die Records: ein Lauf des Projekts mit status=running, dessen
# Prozess noch lebt, zählt als laufend.
running_records() {
  python3 - "$RUNS" "$PROJECT@$BRANCH" <<'EOF'
import glob, json, os, sys
runs, project = sys.argv[1], sys.argv[2]
for path in glob.glob(os.path.join(runs, "*.json")):
    try:
        with open(path) as fh:
            rec = json.load(fh)
    except Exception:
        continue
    if rec.get("project") != project or rec.get("status") != "running":
        continue
    pid = rec.get("pid")
    try:
        if pid:
            os.kill(int(pid), 0)
    except OSError:
        continue
    print(os.path.basename(path)[:-5])
EOF
}

refuse_if_running() {
  local state live
  state=$(pipeline_state)
  case "$state" in
    running) die "es läuft eine Pipeline ($API meldet '$state'); erst abwarten" ;;
    "")
      warn "App unter $API nicht erreichbar; prüfe die Records"
      live=$(running_records)
      [ -z "$live" ] || die "Lauf mit status=running und lebendem Prozess: $live"
      ok "kein laufender Prozess in den Records" ;;
    *) ok "keine Pipeline aktiv ($state)" ;;
  esac
}

app_build() {
  local body
  body=$(curl -s --max-time 3 "$API/api/health" 2>/dev/null || true)
  python3 - "$body" <<'EOF'
import json, sys
try:
    print(json.loads(sys.argv[1]).get("build") or "")
except Exception:
    print("")
EOF
}

# Der jüngste beendete Lauf des Projekts: kein Reset-Record, nicht running, größtes started_at.
newest_run() {
  python3 - "$RUNS" "$PROJECT@$BRANCH" <<'EOF'
import glob, json, os, sys
runs, project = sys.argv[1], sys.argv[2]
best = None
for path in glob.glob(os.path.join(runs, "*.json")):
    rid = os.path.basename(path)[:-5]
    if rid.startswith("reset_"):
        continue
    try:
        with open(path) as fh:
            rec = json.load(fh)
    except Exception:
        continue
    if rec.get("project") != project or rec.get("status") == "running":
        continue
    key = rec.get("started_at") or ""
    if best is None or key > best[0]:
        best = (key, rid)
if best is None:
    sys.stderr.write("  \033[0;31mkein beendeter Lauf von %s unter %s\033[0m\n" % (project, runs))
    sys.exit(1)
print(best[1])
EOF
}

# Die Kette: vom gegebenen Lauf rückwärts über resumed_from, bis es leer oder unbekannt ist;
# eine Schleife bricht ab. Ausgabe älteste → jüngste.
chain_of() {
  python3 - "$RUNS" "$PROJECT@$BRANCH" "$1" <<'EOF'
import json, os, sys
runs, project, cur = sys.argv[1], sys.argv[2], sys.argv[3]
def warn(msg): sys.stderr.write("  \033[0;33m%s\033[0m\n" % msg)
def fail(msg): sys.stderr.write("  \033[0;31m%s\033[0m\n" % msg); sys.exit(1)
chain, seen = [], set()
while cur:
    if cur in seen:
        warn("Schleife in resumed_from bei %s; die Kette endet davor" % cur)
        break
    try:
        with open(os.path.join(runs, cur + ".json")) as fh:
            rec = json.load(fh)
    except Exception as exc:
        if not chain:
            fail("Record %s nicht lesbar: %s" % (cur, exc))
        warn("resumed_from zeigt auf den unbekannten Lauf %s; die Kette endet davor" % cur)
        break
    if rec.get("project") != project:
        if not chain:
            fail("Lauf %s gehört zu %s, nicht zu %s" % (cur, rec.get("project"), project))
        warn("resumed_from zeigt auf %s aus %s; die Kette endet davor" % (cur, rec.get("project")))
        break
    if rec.get("status") == "running":
        fail("Lauf %s läuft noch" % cur)
    seen.add(cur)
    chain.append(cur)
    cur = rec.get("resumed_from") or ""
print(" ".join(reversed(chain)))
EOF
}

# Der Log-Ordner eines Laufs; der Account wird gesucht, nie festgeschrieben.
log_dir_of() {
  local d
  for d in "$ACCOUNTS"/*/"projects/$PROJECT/$BRANCH/runs/$1"; do
    [ -d "$d" ] && { echo "$d"; return 0; }
  done
  return 1
}

# Wohin ein gesicherter Log-Ordner zurückgeht: an seine lebende Stelle, sonst in den einzigen
# Projektordner, sonst unter den Account, unter dem er gesichert wurde.
log_dest_for() {
  local id=$1 saved_account=$2 d
  if d=$(log_dir_of "$id"); then echo "$d"; return 0; fi
  local candidates=()
  for d in "$ACCOUNTS"/*/"projects/$PROJECT/$BRANCH/runs"; do
    [ -d "$d" ] && candidates+=("$d")
  done
  if [ ${#candidates[@]} -eq 1 ]; then echo "${candidates[0]}/$id"; return 0; fi
  echo "$ACCOUNTS/$saved_account/projects/$PROJECT/$BRANCH/runs/$id"
}

history_extract() {   # $1 Quelle, $2 Ziel, dann die Lauf-Ids; gibt die Zeilenzahl aus
  python3 - "$@" <<'EOF'
import json, sys
src, dst, ids = sys.argv[1], sys.argv[2], set(sys.argv[3:])
n = 0
with open(dst, "w") as out:
    try:
        with open(src) as fh:
            for line in fh:
                s = line.strip()
                if not s:
                    continue
                try:
                    rid = json.loads(s).get("run_id")
                except Exception:
                    continue
                if rid in ids:
                    out.write(s + "\n")
                    n += 1
    except FileNotFoundError:
        pass
print(n)
EOF
}

# Zusammenführung nach run_id: die lebenden Zeilen der Kette fallen weg, die gesicherten
# kommen ans Ende, alle anderen bleiben, wie sie sind.
history_merge() {   # $1 lebende Datei, $2 gesicherte Zeilen, dann die Lauf-Ids
  python3 - "$@" <<'EOF'
import json, os, sys
live, saved, ids = sys.argv[1], sys.argv[2], set(sys.argv[3:])
kept, dropped = [], 0
if os.path.exists(live):
    with open(live) as fh:
        for line in fh:
            s = line.rstrip("\n")
            if not s.strip():
                continue
            try:
                rid = json.loads(s).get("run_id")
            except Exception:
                rid = None
            if rid in ids:
                dropped += 1
            else:
                kept.append(s)
added = []
if os.path.exists(saved):
    with open(saved) as fh:
        added = [l.rstrip("\n") for l in fh if l.strip()]
tmp = live + ".sicherung-tmp"
os.makedirs(os.path.dirname(live), exist_ok=True)
with open(tmp, "w") as out:
    for s in kept + added:
        out.write(s + "\n")
os.replace(tmp, live)
print("%d %d %d" % (len(kept), dropped, len(added)))
EOF
}

# Schreibt manifest.json und README.md einer Sicherung. Die Klone kommen als TSV
# (repo, head, branch, sha) über CLONES_TSV, eine Anmerkung über NOTE.
write_manifest() {   # $1 dir, $2 name, $3 knowledge_files, $4 history_lines, dann die Lauf-Ids
  python3 - "$1" "$2" "$3" "$4" "$PROJECT@$BRANCH" "$(abspath "$STATE")" "$(app_build)" "${@:5}" <<'EOF'
import datetime, json, os, sys
snap, name, kfiles, hlines, project, state_root, build = sys.argv[1:8]
ids = sys.argv[8:]
created = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
runs = []
for rid in ids:
    with open(os.path.join(snap, "state-runs", rid + ".json")) as fh:
        rec = json.load(fh)
    runs.append({k: rec.get(k) for k in
                 ("run_id", "status", "run_outcome", "paused_at", "resumed_from", "started_at", "phases")})
clones = {}
for line in os.environ.get("CLONES_TSV", "").splitlines():
    repo, head, branch, sha = (line.split("\t") + ["", "", "", ""])[:4]
    if not repo:
        continue
    entry = clones.setdefault(repo, {"name": repo, "head": head, "branches": {}})
    if branch:
        entry["branches"][branch] = sha
manifest = {
    "name": name,
    "created_at": created,
    "project": project,
    "state_root": state_root,
    "app_build": build or None,
    "runs": runs,
    "knowledge_files": int(kfiles),
    "clones": list(clones.values()),
    "history_lines": int(hlines),
    "note": os.environ.get("NOTE") or None,
}
with open(os.path.join(snap, "manifest.json"), "w") as fh:
    json.dump(manifest, fh, indent=2, ensure_ascii=False)
    fh.write("\n")

def phases(r):
    p = r.get("phases") or []
    return "%s … %s" % (p[0], p[-1]) if len(p) > 2 else ", ".join(p) or "—"
rows = "\n".join("| %s | %s | %s | %s | %s |" % (
    r["run_id"], phases(r), r.get("run_outcome") or r.get("status") or "—",
    r.get("paused_at") or "—", r.get("resumed_from") or "—") for r in runs) or "| — | — | — | — | — |"
bundles = "\n".join("  - `repos/%s.bundle` — %s" % (
    c["name"], ", ".join("`%s` @ %s" % (b, s[:7]) for b, s in c["branches"].items()))
    for c in clones.values() if c["branches"]) or "  - keine Branches `codegen/*` in den Klonen"
note = ("\n%s\n" % manifest["note"]) if manifest["note"] else ""
build_text = build or "unbekannt (App nicht erreichbar)"
slug, branch = project.split("@", 1)
readme = f"""# Sicherung `{name}`

Angelegt am {created} aus dem State-Root `{state_root}`, Projekt `{project}`,
App-Build {build_text}.
{note}
## Inhalt

- `knowledge/` — der Wissensbaum des Projekts (`knowledge/apps/codegen/{slug}/{branch}/`)
  mit `.reuse/`, `approvals/`, `archive/`, `work/`, `run_report.json` und einem Ordner je Phase;
  {kfiles} Dateien.
- `state-runs/` — die Run-Records `<run_id>.json` und die Phasenstände `<run_id>/phase_state.json`
  der Kette, ohne Lock-Dateien.
- `logs/<account>/<run_id>/` — die Log-Ordner der Läufe (Sitzungsprotokoll, `run.log`,
  `archive/*_metrics.jsonl`).
- `history/run_history.records.jsonl` — die {hlines} Zeilen der Verlaufsdatei
  `logs/run_history.jsonl`, die zur Kette gehören; die Seite „History“ liest diese Datei.
- `repos/<repo>.bundle` — die Branches `codegen/*` der Pipeline-Klone als Git-Bundles:
{bundles}
- `manifest.json` — die Kette, die Zählwerte und die Klone, gegen die `restore` prüft.

## Die Kette

Älteste zuerst; jeder Lauf setzt den vorigen fort (`resumed_from`).

| Lauf | Phasen | Ausgang | angehalten bei | setzt fort |
|---|---|---|---|---|
{rows}

## Wiederherstellen

    scripts/sicherung.sh restore {name}

Das Skript prüft zuerst die Sicherung (Manifest, Dateizahl des Wissensbaums, Records,
Verlaufszeilen, Bundles) und verweigert, solange eine Pipeline läuft. Dann legt es den
jetzigen Stand als eigene Sicherung unter `$SDLCPILOT_BACKUPS/vor-wiederherstellung-<stamp>/`
beiseite; der Weg zurück ist `scripts/sicherung.sh restore vor-wiederherstellung-<stamp>`.
Erst danach tauscht es: den Wissensbaum über eine Zwischenablage neben dem Ziel, die Records
und Log-Ordner der Kette, die Verlaufsdatei durch Zusammenführung nach `run_id`, die Branches
der Klone per `git fetch` aus den Bundles.

Danach muss die App neu gestartet werden, damit sie den zurückgespielten Stand liest:

    osascript -e 'quit app "SDLC Pilot"'; sleep 5; open -a "SDLC Pilot"

## Nicht enthalten

- der Vektorspeicher Qdrant und der Graph Neo4j (Docker-Container `platform-qdrant` und
  `platform-neo4j`); discover und extract bauen sie neu auf, wenn sie fehlen
- die Branches auf GitHub, also `origin` der sieben Repositories
- die Einstellungen der App
- die Pipeline-Klone selbst unter `.cache/repos/{slug}/` samt `node_modules`
  und `target`; der nächste Lauf klont neu von origin, und nur ihre Branches `codegen/*`
  liegen hier als Bundles
- die alten Caches unter `.cache/triage`, `.cache/synthesis`, `.cache/reviews` und `.cache/trivy`
- Records, Phasenstände und Logs anderer Läufe und anderer Projekte sowie
  `logs/run_events.jsonl`, `logs/phase_history.json` und `logs/metrics.jsonl`
"""
with open(os.path.join(snap, "README.md"), "w") as fh:
    fh.write(readme)
EOF
}

# Die Prüfung einer Sicherung, bevor irgendetwas angefasst wird. Gibt bei Erfolg zwei Zeilen
# aus: die erwartete Dateizahl des Wissensbaums und die Lauf-Ids; sonst den Grund.
snapshot_check() {
  python3 - "$1" "$PROJECT@$BRANCH" <<'EOF'
import json, os, sys
snap, project = sys.argv[1], sys.argv[2]
def fail(msg): sys.stderr.write("  \033[0;31m%s\033[0m\n" % msg); sys.exit(1)
mp = os.path.join(snap, "manifest.json")
if not os.path.isfile(mp):
    fail("kein manifest.json in %s" % snap)
try:
    with open(mp) as fh:
        m = json.load(fh)
except Exception as exc:
    fail("manifest.json nicht lesbar: %s" % exc)
for key in ("name", "created_at", "project", "runs", "knowledge_files", "history_lines", "clones"):
    if key not in m:
        fail("manifest.json ohne Feld '%s'" % key)
if m["project"] != project:
    fail("die Sicherung gehört zu %s, nicht zu %s" % (m["project"], project))
if not os.path.isdir(os.path.join(snap, "knowledge")):
    fail("knowledge/ fehlt in der Sicherung")
if not m["runs"]:
    fail("manifest.json nennt keinen Lauf")
for r in m["runs"]:
    rid = r.get("run_id") or ""
    path = os.path.join(snap, "state-runs", rid + ".json")
    if not rid or not os.path.isfile(path):
        fail("Record fehlt: state-runs/%s.json" % rid)
    try:
        with open(path) as fh:
            rec = json.load(fh)
    except Exception as exc:
        fail("Record %s nicht lesbar: %s" % (rid, exc))
    if rec.get("run_id") != rid:
        fail("Record %s trägt die run_id %s" % (rid, rec.get("run_id")))
hlines = int(m["history_lines"])
hp = os.path.join(snap, "history", "run_history.records.jsonl")
if not os.path.isfile(hp):
    fail("history/run_history.records.jsonl fehlt")
with open(hp) as fh:
    got = sum(1 for line in fh if line.strip())
if got != hlines:
    fail("Verlaufszeilen: %d erwartet, %d vorhanden" % (hlines, got))
for c in m["clones"]:
    if c.get("branches") and not os.path.isfile(os.path.join(snap, "repos", c["name"] + ".bundle")):
        fail("Bundle fehlt: repos/%s.bundle" % c["name"])
print(int(m["knowledge_files"]))
print(" ".join(r["run_id"] for r in m["runs"]))
EOF
}

# Schreibt eine Sicherung nach $1: der Wissensbaum, Records und Phasenstände, Log-Ordner,
# Verlaufszeilen und Bundles der Läufe $4…, dann Manifest und README. Streng ($3 = 1) bricht
# ab, was fehlt; nachsichtig ($3 = 0) wird es übersprungen, damit die Sicherheitskopie vor
# einer Wiederherstellung auch einen unvollständigen Stand festhält.
write_snapshot() {
  local dir=$1 name=$2 strict=$3; shift 3
  local ids=("$@") present=() id n_src n_copy logdir acct
  mkdir -p "$dir/knowledge" "$dir/state-runs" "$dir/logs" "$dir/history" "$dir/repos"

  say "Wissensbaum"
  if [ -d "$KNOWLEDGE" ]; then
    n_src=$(count_files "$KNOWLEDGE")
    ditto "$KNOWLEDGE" "$dir/knowledge"
    n_copy=$(count_files "$dir/knowledge")
    [ "$n_src" = "$n_copy" ] \
      || die "der Wissensbaum hat sich während des Kopierens geändert: $n_src Dateien gezählt, $n_copy kopiert"
    ok "$n_copy Dateien, $(size_of "$dir/knowledge")"
  elif [ "$strict" = 1 ]; then
    die "kein Wissensbaum unter $KNOWLEDGE"
  else
    n_copy=0
    warn "kein Wissensbaum unter $KNOWLEDGE; die Sicherung hält einen leeren"
  fi

  say "Läufe"
  for id in "${ids[@]}"; do
    if [ ! -f "$RUNS/$id.json" ]; then
      [ "$strict" = 1 ] && die "Record fehlt: $RUNS/$id.json"
      warn "$id: kein Record, übersprungen"
      continue
    fi
    cp "$RUNS/$id.json" "$dir/state-runs/$id.json"
    if [ -d "$RUNS/$id" ]; then
      ditto "$RUNS/$id" "$dir/state-runs/$id"
      find "$dir/state-runs/$id" -name '*.lock' -delete
    fi
    present+=("$id")
    if logdir=$(log_dir_of "$id"); then
      acct=${logdir#"$ACCOUNTS"/}; acct=${acct%%/*}
      ditto "$logdir" "$dir/logs/$acct/$id"
      ok "$id: Record$([ -d "$RUNS/$id" ] && echo ", Phasenstand"), Logs $(size_of "$logdir") unter $acct"
    else
      warn "$id: Record gesichert, aber kein Log-Ordner unter $ACCOUNTS/*/projects/$PROJECT/$BRANCH/runs/$id"
    fi
  done
  if [ ${#present[@]} -eq 0 ]; then
    [ "$strict" = 1 ] && die "kein einziger Record der Kette vorhanden"
    warn "kein Record der Kette vorhanden; diese Sicherung lässt sich nicht zurückspielen, der Wissensbaum liegt aber darin"
  fi

  say "Verlaufsdatei"
  local n_hist
  n_hist=$(history_extract "$HISTORY" "$dir/history/run_history.records.jsonl" "${present[@]}")
  if [ -f "$HISTORY" ]; then
    ok "$n_hist Zeilen der Kette aus $HISTORY"
  else
    warn "keine Verlaufsdatei unter $HISTORY"
  fi
  if [ "$strict" = 0 ] && [ -f "$HISTORY" ]; then
    cp "$HISTORY" "$dir/history/run_history.jsonl"
    ok "die ganze Verlaufsdatei liegt daneben ($(wc -l < "$HISTORY" | tr -d ' ') Zeilen)"
  fi

  say "Klone"
  local repo clone head branches tsv=""
  for repo in "${REPOS[@]}"; do
    clone="$CLONE/$repo"
    if [ ! -d "$clone/.git" ]; then
      warn "$repo: kein Klon unter $clone"
      continue
    fi
    head=$(git -C "$clone" rev-parse HEAD)
    mapfile -t branches < <(git -C "$clone" for-each-ref --format='%(refname:short)' 'refs/heads/codegen/*')
    if [ ${#branches[@]} -eq 0 ]; then
      tsv+="$repo"$'\t'"$head"$'\t\t\n'
      ok "$repo: keine Branches codegen/*"
      continue
    fi
    git -C "$clone" bundle create -q "$dir/repos/$repo.bundle" "${branches[@]}"
    git -C "$clone" bundle verify -q "$dir/repos/$repo.bundle" >/dev/null 2>&1 \
      || die "$repo: das Bundle besteht die Prüfung nicht"
    local b
    for b in "${branches[@]}"; do
      tsv+="$repo"$'\t'"$head"$'\t'"$b"$'\t'"$(git -C "$clone" rev-parse "refs/heads/$b")"$'\n'
    done
    ok "$repo: ${branches[*]} → $repo.bundle ($(size_of "$dir/repos/$repo.bundle"))"
  done

  CLONES_TSV="$tsv" write_manifest "$dir" "$name" "$n_copy" "$n_hist" "${present[@]}"
}

cmd_save() {
  local name=${1:-} start=${2:-}
  check_name "$name"
  check_layout
  local snap="$BACKUPS/$name"
  [ -e "$snap" ] && die "gibt es schon: $snap (kein stilles Überschreiben; anderen Namen wählen)"

  say "Sicherung $name"
  refuse_if_running
  if [ -z "$start" ]; then
    start=$(newest_run) || exit 1
    ok "jüngster beendeter Lauf: $start"
  fi
  local ids_line ids
  ids_line=$(chain_of "$start") || exit 1
  read -r -a ids <<< "$ids_line"
  ok "Kette (älteste → jüngste): ${ids[*]}"

  mkdir -p "$BACKUPS"
  # Bricht die Sicherung ab, bleibt kein halbes Ziel unter dem Namen zurück; die Falle
  # braucht eine globale Variable, weil sie beim Verlassen der Shell läuft.
  SAVE_TMP="$BACKUPS/.$name.unfertig-$STAMP"
  rm -rf "$SAVE_TMP"
  trap 'rm -rf "$SAVE_TMP"' EXIT
  NOTE="" write_snapshot "$SAVE_TMP" "$name" 1 "${ids[@]}"
  mv "$SAVE_TMP" "$snap"
  trap - EXIT

  say "Fertig"
  ok "$snap ($(size_of "$snap"))"
  ok "zurückspielen mit: $0 restore $name"
}

cmd_restore() {
  local name=${1:-}
  check_name "$name"
  check_layout
  local snap="$BACKUPS/$name"
  [ -d "$snap" ] || die "keine Sicherung unter $snap"
  inside "$(abspath "$snap")" "$(abspath "$STATE")" && die "die Sicherung liegt im State-Root: $snap"

  # 1. Die Quelle, bevor irgendetwas angefasst wird.
  say "Prüfe die Sicherung $name"
  local check n_expect ids_line ids n_have
  check=$(snapshot_check "$snap") || die "die Sicherung ist unbrauchbar; nichts angefasst"
  n_expect=${check%%$'\n'*}; ids_line=${check#*$'\n'}
  read -r -a ids <<< "$ids_line"
  n_have=$(count_files "$snap/knowledge")
  [ "$n_have" = "$n_expect" ] \
    || die "knowledge/ der Sicherung hat $n_have Dateien, das Manifest nennt $n_expect; nichts angefasst"
  ok "Manifest stimmt: ${#ids[@]} Läufe (${ids[*]}), $n_expect Dateien im Wissensbaum"

  # 2. Keine laufende Pipeline.
  say "Pipeline"
  refuse_if_running

  # 3. Den jetzigen Stand beiseitelegen, als Sicherung mit Weg zurück.
  local safety_name="vor-wiederherstellung-$STAMP" safety
  safety="$BACKUPS/$safety_name"
  [ -e "$safety" ] && die "gibt es schon: $safety"
  say "Lege den jetzigen Stand beiseite: $safety"
  NOTE="Sicherheitskopie des Stands vor \`restore $name\`; die ganze Verlaufsdatei liegt unter \`history/run_history.jsonl\`." \
    write_snapshot "$safety" "$safety_name" 0 "${ids[@]}"
  ok "Weg zurück: $0 restore $safety_name"

  # 4. Der Wissensbaum in eine Zwischenablage neben dem Ziel, gezählt gegen das Manifest.
  say "Wissensbaum"
  local parent n_staged
  parent=$(dirname "$KNOWLEDGE")
  RESTORE_STAGING="$parent/.restore-$STAMP"
  mkdir -p "$parent"
  rm -rf "$RESTORE_STAGING"
  trap 'rm -rf "$RESTORE_STAGING"' EXIT
  ditto "$snap/knowledge" "$RESTORE_STAGING"
  n_staged=$(count_files "$RESTORE_STAGING")
  [ "$n_staged" = "$n_expect" ] \
    || die "Zwischenablage hat $n_staged Dateien, das Manifest nennt $n_expect; Ziel unangetastet"
  # 5. Erst jetzt der Tausch. Die Falle fällt vorher, damit ein Fehlschlag die Ablage nicht löscht.
  trap - EXIT
  rm -rf "$KNOWLEDGE"
  mv "$RESTORE_STAGING" "$KNOWLEDGE"
  ok "getauscht: $n_staged Dateien unter $KNOWLEDGE"

  # 6. Records, Phasenstände und Log-Ordner der Kette.
  say "Läufe"
  local id src acct dest live
  for id in "${ids[@]}"; do
    rm -f "$RUNS/$id.json" "$RUNS/$id.json.lock"
    rm -rf "$RUNS/$id"
    cp "$snap/state-runs/$id.json" "$RUNS/$id.json"
    [ -d "$snap/state-runs/$id" ] && ditto "$snap/state-runs/$id" "$RUNS/$id"
    # Der lebende Log-Ordner geht in jedem Fall; hatte die Sicherung keinen, gab es zu
    # ihrer Zeit auch keinen.
    if live=$(log_dir_of "$id"); then rm -rf "$live"; fi
    for src in "$snap"/logs/*/"$id"; do
      [ -d "$src" ] || continue
      acct=$(basename "$(dirname "$src")")
      dest=$(log_dest_for "$id" "$acct")
      rm -rf "$dest"
      mkdir -p "$(dirname "$dest")"
      ditto "$src" "$dest"
    done
    ok "$id: Record$([ -d "$RUNS/$id" ] && echo ", Phasenstand")$(log_dir_of "$id" >/dev/null && echo ", Logs")"
  done

  # 7. Die Verlaufsdatei, zusammengeführt nach run_id.
  say "Verlaufsdatei"
  local counts kept dropped added
  counts=$(history_merge "$HISTORY" "$snap/history/run_history.records.jsonl" "${ids[@]}")
  read -r kept dropped added <<< "$counts"
  ok "$dropped Zeilen der Kette entfernt, $added aus der Sicherung angehängt, $kept andere unangetastet"

  # 8. Die Branches der Klone aus den Bundles.
  say "Klone"
  local bundle repo clone current sha ref got
  for bundle in "$snap"/repos/*.bundle; do
    [ -f "$bundle" ] || continue
    repo=$(basename "$bundle" .bundle)
    clone="$CLONE/$repo"
    if [ ! -d "$clone/.git" ]; then
      warn "$repo: kein Klon unter $clone; der nächste Lauf klont neu von origin, und die Branches liegen auch dort, sofern sie nicht gelöscht wurden"
      continue
    fi
    current=$(git -C "$clone" symbolic-ref -q HEAD || true)
    while read -r sha ref; do
      if [ "$ref" = "$current" ]; then
        warn "$repo: $ref ist ausgecheckt und bleibt unangetastet (von Hand: git -C $clone reset --hard $sha)"
        continue
      fi
      if ! git -C "$clone" fetch -q --force "$bundle" "$ref:$ref"; then
        warn "$repo: $ref ließ sich nicht aus dem Bundle holen"
        continue
      fi
      got=$(git -C "$clone" rev-parse -q --verify "$ref" || true)
      if [ "$got" = "$sha" ]; then
        ok "$repo: ${ref#refs/heads/} → ${sha:0:7}"
      else
        warn "$repo: ${ref#refs/heads/} steht auf ${got:0:7}, erwartet ${sha:0:7}"
      fi
    done < <(git -C "$clone" bundle list-heads "$bundle")
  done

  # 9. Der Blick zurück auf das Ergebnis.
  say "Abschluss"
  local n_final
  n_final=$(count_files "$KNOWLEDGE")
  [ "$n_final" = "$n_expect" ] || die "der Wissensbaum hat nach dem Tausch $n_final Dateien, erwartet $n_expect"
  ok "Wissensbaum: $n_final Dateien, wie im Manifest"
  ok "die Seite „History“ zeigt die Kette ${ids[*]}; der jüngste Lauf ist ${ids[${#ids[@]}-1]}"
  ok "der vorige Stand liegt unter $safety"
  ok "jetzt die App neu starten: osascript -e 'quit app \"SDLC Pilot\"'; sleep 5; open -a \"SDLC Pilot\""
}

cmd_list() {
  if [ ! -d "$BACKUPS" ]; then
    warn "keine Ablage unter $BACKUPS"
    return 0
  fi
  python3 - "$BACKUPS" <<'EOF'
import json, os, subprocess, sys
root = sys.argv[1]
rows = []
for entry in sorted(os.listdir(root)):
    path = os.path.join(root, entry)
    if entry.startswith(".") or not os.path.isdir(path):
        continue
    size = subprocess.run(["du", "-sh", path], capture_output=True, text=True).stdout.split("\t")[0].strip()
    try:
        with open(os.path.join(path, "manifest.json")) as fh:
            m = json.load(fh)
        runs = m.get("runs") or []
        rows.append((m.get("created_at") or "", entry, runs[-1]["run_id"] if runs else "—", size, str(len(runs))))
    except Exception:
        rows.append(("", entry, "(kein Manifest)", size, "—"))
if not rows:
    print("  keine Sicherungen unter %s" % root)
    sys.exit(0)
w = max(len(r[1]) for r in rows)
print("  %-*s  %-25s  %-14s  %-7s  %s" % (w, "Name", "Erstellt", "Letzter Lauf", "Umfang", "Läufe"))
for created, name, last, size, n in sorted(rows):
    print("  %-*s  %-25s  %-14s  %-7s  %s" % (w, name, created or "—", last, size, n))
EOF
}

case "${1:-}" in
  save) shift; cmd_save "${1:-}" "${2:-}" ;;
  restore) shift; cmd_restore "${1:-}" ;;
  list) cmd_list ;;
  *) sed -n '2,26p' "$0"; exit 1 ;;
esac
