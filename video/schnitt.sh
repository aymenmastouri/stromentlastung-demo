#!/usr/bin/env bash
# Schnitt des Vorführvideos aus dem Rohmaterial und der Zeitachse.
#
#   Langfassung  out/langfassung.mp4  das ganze Rohvideo als MP4 1080p (H.264, stille AAC-Tonspur)
#   Kurzfassung  out/kurzfassung.mp4  nur die Kapitel, die in out/timeline.json `kurz: true` tragen,
#                                     aneinandergeschnitten in Drehbuch-Reihenfolge
#
# Aufruf:  ./schnitt.sh [rohvideo.webm] [timeline.json]
#          ohne Argumente: das jüngste out/roh/*/video.webm und out/timeline.json
# Umgebung: OFFSET  Sekunden, um die die Kapitelmarken gegenüber dem Video verschoben
#                   sind (die Aufzeichnung beginnt wenige Zehntel vor der Zeitachse; Vorgabe 0)
#           CRF     Qualität von x264 (Vorgabe 20)
set -euo pipefail
cd "$(dirname "$0")"

for werkzeug in ffmpeg ffprobe python3; do
  if ! command -v "$werkzeug" >/dev/null 2>&1; then
    echo "schnitt.sh: $werkzeug fehlt (ffmpeg und ffprobe etwa über 'brew install ffmpeg')." >&2
    exit 2
  fi
done

ROH="${1:-}"
if [[ -z "$ROH" ]]; then
  ROH="$(ls -t out/roh/*/video.webm 2>/dev/null | head -1 || true)"
fi
ZEIT="${2:-out/timeline.json}"
OFFSET="${OFFSET:-0}"
CRF="${CRF:-20}"

if [[ -z "$ROH" || ! -f "$ROH" ]]; then
  echo "schnitt.sh: kein Rohvideo gefunden (erwartet out/roh/*/video.webm oder ein Argument)." >&2
  exit 2
fi
if [[ ! -f "$ZEIT" ]]; then
  echo "schnitt.sh: Zeitachse $ZEIT fehlt." >&2
  exit 2
fi

dauer="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$ROH")"
echo "Rohmaterial: $ROH (${dauer%.*} s)"
echo "Zeitachse:   $ZEIT"

# Gemeinsame Bildeinstellungen: 1080p, 25 Bilder je Sekunde, ein Pixelformat, das jeder Player kann.
BILD=(-vf "scale=1920:1080:flags=lanczos,fps=25,format=yuv420p")
CODEC=(-c:v libx264 -preset medium -crf "$CRF" -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 64k)

# ── Langfassung ──────────────────────────────────────────────────────────────
echo "Langfassung …"
ffmpeg -y -v error -stats \
  -i "$ROH" \
  -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=48000" \
  -map 0:v:0 -map 1:a:0 -shortest \
  "${BILD[@]}" "${CODEC[@]}" \
  out/langfassung.mp4
echo "  out/langfassung.mp4"

# ── Kurzfassung ──────────────────────────────────────────────────────────────
# Die Kapitel mit kurz=true, benachbarte zu einem Stück verschmolzen; Kapitel ohne Dauer
# (übersprungen) fallen weg. Python baut daraus den ffmpeg-Filter: je Stück ein trim, dann concat.
FILTER="$(python3 - "$ZEIT" "$OFFSET" "$dauer" <<'PY'
import json, sys
zeit = json.load(open(sys.argv[1]))
offset = float(sys.argv[2])
dauer = float(sys.argv[3])
stuecke = []
for k in zeit.get("chapters", []):
    if not k.get("kurz"):
        continue
    a, b = k.get("t_start"), k.get("t_end")
    if a is None or b is None or b - a < 0.5:
        continue
    a = max(0.0, a + offset)
    b = min(dauer, b + offset)
    if b <= a:
        continue
    if stuecke and abs(stuecke[-1][1] - a) < 0.05:
        stuecke[-1][1] = b
    else:
        stuecke.append([a, b])
if not stuecke:
    sys.exit("keine Kapitel mit kurz=true in der Zeitachse")
teile = []
for i, (a, b) in enumerate(stuecke):
    teile.append(f"[0:v]trim=start={a:.3f}:end={b:.3f},setpts=PTS-STARTPTS[v{i}]")
kette = "".join(f"[v{i}]" for i in range(len(stuecke)))
# Bildeinstellungen gehören hier in die Filterkette: ein -vf neben einem
# komplexen Filtergraphen lehnt ffmpeg ab.
teile.append(f"{kette}concat=n={len(stuecke)}:v=1:a=0,scale=1920:1080:flags=lanczos,fps=25,format=yuv420p[kurz]")
laenge = sum(b - a for a, b in stuecke)
sys.stderr.write(f"  {len(stuecke)} Stücke, {laenge:.0f} s\n")
print(";".join(teile))
PY
)"

echo "Kurzfassung …"
ffmpeg -y -v error -stats \
  -i "$ROH" \
  -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=48000" \
  -filter_complex "$FILTER" \
  -map "[kurz]" -map 1:a:0 -shortest \
  "${CODEC[@]}" \
  out/kurzfassung.mp4
echo "  out/kurzfassung.mp4"

for datei in out/langfassung.mp4 out/kurzfassung.mp4; do
  d="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$datei")"
  printf '%s: %s s\n' "$datei" "${d%.*}"
done
