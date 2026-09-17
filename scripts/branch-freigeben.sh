#!/usr/bin/env bash
# Gibt den Branchnamen eines Tickets wieder frei, damit die nächste Auslieferung
# wieder auf `codegen/<TICKET>` landet statt auf einen Namen mit Zeitstempel
# auszuweichen.
#
#   branch-freigeben.sh <TICKET>          zeigt, was entfernt würde, und fragt nach
#   branch-freigeben.sh <TICKET> --zeigen zeigt nur, entfernt nichts
#
# Warum es diesen Befehl gibt: ein ausgelieferter Branch ist auf dem Remote, dort
# kann ein Merge Request hängen und jemand kann mitlesen. Deshalb entfernt ihn
# keine Phase von selbst — sie weicht aus und sagt es. Ihn wegzuräumen ist eine
# Entscheidung eines Menschen, und dieser Befehl ist die Stelle, an der sie
# getroffen wird.
#
# Entfernt wird in den Klonen der Pipeline und auf deren `origin`:
#   - `codegen/<TICKET>`
#   - jeder Ausweichname `codegen/<TICKET>-<zeitstempel>`
# Nicht angefasst: die Arbeitskopien unter ~/stromentlastung, der Wissensbaum,
# die Sicherungen.
#
# VOR EINER VORFÜHRUNG NICHT AUSFÜHREN. Die zweite Welt wird aus dem
# ausgelieferten Branch gebaut; ist er weg, baut `demo.sh up` sie nicht mehr.
# Der richtige Zeitpunkt ist, wenn ein Ticket bewusst neu ausgeliefert werden
# soll — und danach läuft die Kette bis zur Auslieferung durch.
#
# Umgebung:
#   SDLCPILOT_CACHE  Klone der Pipeline   $HOME/sdlcpilot/.cache/repos/stromentlastung
set -euo pipefail

CLONE="${SDLCPILOT_CACHE:-$HOME/sdlcpilot/.cache/repos/stromentlastung}"

say()  { printf '\033[0;36m%s\033[0m\n' "$*"; }
ok()   { printf '  \033[0;32m%s\033[0m\n' "$*"; }
warn() { printf '  \033[0;33m%s\033[0m\n' "$*"; }
die()  { printf '  \033[0;31m%s\033[0m\n' "$*"; exit 1; }

TICKET="${1:-}"
NUR_ZEIGEN="${2:-}"
[ -n "$TICKET" ] || die "Aufruf: branch-freigeben.sh <TICKET> [--zeigen]"
[ -d "$CLONE" ] || die "Klone nicht gefunden: $CLONE"

PRAEFIX="codegen/$TICKET"

# Erst sehen, dann entscheiden: jede Zeile ist ein Klon, ein Branch, eine Seite.
say "Was $PRAEFIX heute hat"
GEFUNDEN=0
declare -a LOKAL=() ENTFERNT=()
for verzeichnis in "$CLONE"/*/; do
  [ -d "$verzeichnis/.git" ] || continue
  name="$(basename "$verzeichnis")"
  while read -r zweig; do
    [ -n "$zweig" ] || continue
    LOKAL+=("$name|$zweig")
    GEFUNDEN=1
    ok "$name  lokal   $zweig  $(git -C "$verzeichnis" rev-parse --short "$zweig")"
  done < <(git -C "$verzeichnis" for-each-ref --format='%(refname:short)' \
             "refs/heads/$PRAEFIX" "refs/heads/$PRAEFIX-*" 2>/dev/null)
  while read -r zweig; do
    [ -n "$zweig" ] || continue
    kurz="${zweig#origin/}"
    ENTFERNT+=("$name|$kurz")
    GEFUNDEN=1
    ok "$name  remote  $kurz  $(git -C "$verzeichnis" rev-parse --short "$zweig")"
  done < <(git -C "$verzeichnis" for-each-ref --format='%(refname:short)' \
             "refs/remotes/origin/$PRAEFIX" "refs/remotes/origin/$PRAEFIX-*" 2>/dev/null)
done

if [ "$GEFUNDEN" -eq 0 ]; then
  ok "nichts vorhanden — die nächste Auslieferung nimmt $PRAEFIX"
  exit 0
fi

if [ "$NUR_ZEIGEN" = "--zeigen" ]; then
  warn "nur gezeigt, nichts entfernt"
  exit 0
fi

say "Entfernen"
warn "Ein Branch auf dem Remote kann eine Durchsicht sein. Entfernt ist entfernt."
printf '  Zum Bestätigen das Ticket eingeben (%s): ' "$TICKET"
read -r antwort
[ "$antwort" = "$TICKET" ] || die "abgebrochen"

# Erst der Remote, dann lokal: bricht der Remote ab, steht lokal noch alles da.
for eintrag in "${ENTFERNT[@]}"; do
  name="${eintrag%%|*}"; zweig="${eintrag#*|}"
  if git -C "$CLONE/$name" push -q origin --delete "$zweig" 2>/dev/null; then
    ok "$name  remote  $zweig entfernt"
  else
    warn "$name  remote  $zweig nicht entfernt (kein Zugriff? schon weg?)"
  fi
done
for eintrag in "${LOKAL[@]}"; do
  name="${eintrag%%|*}"; zweig="${eintrag#*|}"
  if git -C "$CLONE/$name" branch -D "$zweig" >/dev/null 2>&1; then
    ok "$name  lokal   $zweig entfernt"
  else
    warn "$name  lokal   $zweig nicht entfernt (ausgecheckt?)"
  fi
done

say "Fertig"
ok "die nächste Auslieferung landet wieder auf $PRAEFIX"
