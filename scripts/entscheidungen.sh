#!/usr/bin/env bash
# Die Entscheidungen eines Tickets in SDLC Pilot: beiseitelegen, zurücklegen, und den Ablauf
# der Vorführung proben, in dem alles übernommen wird und nur die Menschen entscheiden.
#
#   entscheidungen.sh status            je Wartepunkt: wie viele Entscheidungen liegen, die letzte
#   entscheidungen.sh beiseite          legt die Entscheidungsdateien des Tickets beiseite, nach
#                                       $SDLCPILOT_BACKUPS/entscheidungen-<stamp>/, damit jeder
#                                       Wartepunkt wieder anhält; die Phasenausgaben bleiben
#   entscheidungen.sh zurueck [<name>]  legt die zuletzt (oder die genannte) Ablage zurück
#   entscheidungen.sh probe             startet das Laufset „full", gibt an jedem Wartepunkt ohne
#                                       Kommentar frei und setzt die Kette fort; prüft am Ende,
#                                       dass keine Phase gerechnet hat, dass es drei Halte gab und
#                                       dass die gelieferten Branches unverändert sind
#
# Ein Kommentar bei der Freigabe wäre eine neue Eingabe für Plan und Umsetzung; mit ihm rechneten
# genau diese Phasen neu. Die Probe gibt deshalb ohne Text frei, so wie es die Aufnahme tut.
#
# Umgebung (alle überschreibbar):
#   SDLCPILOT_STATE    State-Root der App             $HOME/sdlcpilot
#   SDLCPILOT_BACKUPS  Ablage                         $HOME/sdlcpilot-local-backups
#   SDLCPILOT_CACHE    Klone der Pipeline             $SDLCPILOT_STATE/.cache/repos/stromentlastung
#   SDLCPILOT_API      Backend der laufenden App      http://127.0.0.1:8000
#   TICKET             das Ticket                     STROM-4
set -euo pipefail

STATE="${SDLCPILOT_STATE:-$HOME/sdlcpilot}"
BACKUPS="${SDLCPILOT_BACKUPS:-$HOME/sdlcpilot-local-backups}"
CLONE="${SDLCPILOT_CACHE:-$STATE/.cache/repos/stromentlastung}"
API="${SDLCPILOT_API:-http://127.0.0.1:8000}"
TICKET="${TICKET:-STROM-4}"
PROJECT=stromentlastung
BRANCH=main
APPROVALS="$STATE/knowledge/apps/codegen/$PROJECT/$BRANCH/approvals/$TICKET"
STAGES=(concept plan delivery)

say()  { printf '\033[0;36m%s\033[0m\n' "$*"; }
ok()   { printf '  \033[0;32m%s\033[0m\n' "$*"; }
warn() { printf '  \033[0;33m%s\033[0m\n' "$*"; }
die()  { printf '  \033[0;31m%s\033[0m\n' "$*"; exit 1; }

# Ein Lauf, der gerade rechnet, darf weder seine Entscheidungen verlieren noch einen zweiten
# Lauf neben sich bekommen.
refuse_while_running() {
  local state
  state=$(curl -s --max-time 5 "$API/api/pipeline/status" 2>/dev/null \
    | python3 -c 'import json,sys; print(json.load(sys.stdin).get("state",""))' 2>/dev/null || echo "")
  [ "$state" = "running" ] && die "Es läuft gerade eine Pipeline. Erst beenden oder abwarten."
  return 0
}

cmd_status() {
  say "Entscheidungen zu $TICKET"
  [ -d "$APPROVALS" ] || { warn "kein Ordner $APPROVALS"; return 0; }
  APPROVALS="$APPROVALS" python3 - <<'PY'
import json, os, pathlib
root = pathlib.Path(os.environ["APPROVALS"])
for stage in ("concept", "plan", "delivery"):
    files = sorted(p for p in (root / stage).glob("*.json")) if (root / stage).is_dir() else []
    if not files:
        print(f"  {stage:9s} keine Entscheidung — der Wartepunkt hält an")
        continue
    last = json.loads(files[-1].read_text(encoding="utf-8"))
    note = (last.get("note") or "").strip()
    print(f"  {stage:9s} {len(files)} Datei(en), zuletzt {last.get('decision')} am {last.get('decided_at','?')[:19]}"
          f"{' mit Kommentar' if note else ' ohne Kommentar'}")
PY
}

cmd_beiseite() {
  refuse_while_running
  [ -d "$APPROVALS" ] || die "kein Ordner $APPROVALS"
  local stamp target n=0
  stamp="$(date '+%Y%m%d-%H%M%S')"
  target="$BACKUPS/entscheidungen-$stamp"
  mkdir -p "$target"
  printf '%s\n' "$APPROVALS" > "$target/herkunft.txt"
  for stage in "${STAGES[@]}"; do
    [ -d "$APPROVALS/$stage" ] || continue
    mkdir -p "$target/$stage"
    for f in "$APPROVALS/$stage"/*.json; do
      [ -e "$f" ] || continue
      mv "$f" "$target/$stage/"
      n=$((n + 1))
    done
  done
  say "Beiseitegelegt: $n Datei(en) nach $target"
  ok "zurück mit: scripts/entscheidungen.sh zurueck entscheidungen-$stamp"
  cmd_status
}

cmd_zurueck() {
  refuse_while_running
  local name=${1:-}
  local source
  if [ -n "$name" ]; then
    source="$BACKUPS/$name"
  else
    source=$(ls -d "$BACKUPS"/entscheidungen-* 2>/dev/null | sort | tail -1 || true)
  fi
  [ -n "$source" ] && [ -d "$source" ] || die "keine Ablage gefunden unter $BACKUPS"
  [ -f "$source/herkunft.txt" ] || die "$source ist keine Ablage dieses Skripts"
  local n=0
  for stage in "${STAGES[@]}"; do
    [ -d "$source/$stage" ] || continue
    mkdir -p "$APPROVALS/$stage"
    for f in "$source/$stage"/*.json; do
      [ -e "$f" ] || continue
      [ -e "$APPROVALS/$stage/$(basename "$f")" ] && { warn "$(basename "$f") liegt schon, bleibt"; continue; }
      mv "$f" "$APPROVALS/$stage/"
      n=$((n + 1))
    done
  done
  say "Zurückgelegt: $n Datei(en) aus $source"
  cmd_status
}

cmd_probe() {
  refuse_while_running
  say "Probe: alles übernommen, drei Entscheidungen ohne Kommentar"
  API="$API" CLONE="$CLONE" TICKET="$TICKET" python3 - <<'PY'
import json, os, subprocess, sys, time, urllib.request

API = os.environ["API"].rstrip("/")
CLONE = os.environ["CLONE"]
TICKET = os.environ["TICKET"]
STAGE_OF = {"plan": "concept", "implement": "plan", "deliver": "delivery"}

def call(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode() or "null")

def branch_shas():
    out = {}
    for repo in sorted(os.listdir(CLONE)):
        path = os.path.join(CLONE, repo)
        if not os.path.isdir(os.path.join(path, ".git")):
            continue
        lines = subprocess.run(["git", "-C", path, "for-each-ref", "--format=%(refname:short) %(objectname:short)",
                                "refs/heads/codegen/"], capture_output=True, text=True).stdout.split("\n")
        out[repo] = {l.split()[0]: l.split()[1] for l in lines if l.strip()}
    return out

def wait_for(run_id, budget=900):
    t0 = time.time()
    last = None
    while time.time() - t0 < budget:
        st = call("GET", "/api/pipeline/status")
        if st.get("run_id") == run_id and st.get("state") not in ("running", "starting", "queued"):
            return st
        last = st
        time.sleep(2)
    raise SystemExit(f"Lauf {run_id} nach {budget}s nicht beendet (zuletzt {last and last.get('state')})")

before = branch_shas()
started = call("POST", "/api/pipeline/run", {"preset": "full"})
run_id = started["run_id"]
chain, computed, pauses = [run_id], [], []
print(f"  gestartet {run_id}")
while True:
    st = wait_for(run_id)
    rows = st.get("phase_progress") or []
    for r in rows:
        line = f"    {r.get('phase_id'):9s} {r.get('status'):9s} {r.get('skip_kind') or ''} {(r.get('skip_reason') or '')[:70]}"
        print(line)
        # Gerechnet hat nur, was „completed" meldet; die Zeile des Halts ist „partial",
        # die Phasen dahinter sind „pending" — beides ist kein Rechnen.
        if r.get("status") == "completed":
            computed.append((run_id, r.get("phase_id"), r.get("status")))
    # Der Record bekommt seinen Halt kurz nach dem Ende des Laufs; die Statuszeilen
    # tragen ihn sofort (awaiting_decision). Beides fragen, den Record mit Geduld.
    paused_at = next((r.get("phase_id") for r in rows if r.get("awaiting_decision")), None)
    outcome = st.get("run_outcome")
    for _ in range(10):
        detail = call("GET", f"/api/pipeline/history/{run_id}")
        outcome = detail.get("run_outcome") or outcome
        paused_at = detail.get("paused_at") or paused_at
        if outcome != "paused" or paused_at:
            break
        time.sleep(1)
    if outcome == "paused" and paused_at:
        stage = STAGE_OF.get(paused_at)
        pauses.append(paused_at)
        print(f"  hält an bei {paused_at} → Freigabe {stage} ohne Kommentar")
        call("POST", f"/api/codegen/approvals/{TICKET}",
             {"stage": stage, "decision": "approved", "note": "", "keep_as_lesson": False})
        cont = call("POST", "/api/pipeline/run", {"resume_from": run_id})
        run_id = cont["run_id"]
        chain.append(run_id)
        print(f"  fortgesetzt als {run_id}")
        continue
    print(f"  Ergebnis {outcome} ({run_id})")
    break

after = branch_shas()
changed = [(repo, ref) for repo in before for ref in before[repo] if after.get(repo, {}).get(ref) != before[repo][ref]]
print()
print(f"  Kette: {' → '.join(chain)}")
print(f"  Halte: {len(pauses)} ({', '.join(pauses) or 'keine'})")
print(f"  gerechnet: {len(computed)} Phase(n)" + (": " + ", ".join(f'{p} ({s}, {r})' for r, p, s in computed) if computed else ""))
print(f"  Branch-Stände unverändert: {'ja' if not changed else 'NEIN: ' + ', '.join(f'{r}/{b}' for r, b in changed)}")
bad = bool(computed) or len(pauses) != 3 or bool(changed)
sys.exit(1 if bad else 0)
PY
}

case "${1:-}" in
  status)   cmd_status ;;
  beiseite) cmd_beiseite ;;
  zurueck)  shift; cmd_zurueck "${1:-}" ;;
  probe)    cmd_probe ;;
  *) sed -n '2,24p' "$0"; exit 1 ;;
esac
