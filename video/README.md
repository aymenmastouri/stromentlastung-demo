# Vorführvideo: Aufnahme mit Playwright

Dieses Verzeichnis ist ein eigenes Playwright-Projekt, unabhängig vom Produkt und von
den Repositories des Verfahrens. Es nimmt das Vorführvideo nach [drehbuch.md](drehbuch.md)
auf: 22 Kapitel in drei Akten, Untertitel und Karten als Einblendungen in der Seite,
1920×1080, eine Datei.

| Datei | Inhalt |
| --- | --- |
| `drehbuch.md` | der Plan der Aufnahme: Wortlaut, Ausgangszustand, Abnahme |
| `texte.ts` | alle Karten und Untertitel, eine Tabelle je Kapitel (`K4.a`, `K4.b` …); eine Wortlautänderung ist eine Änderung in dieser Datei |
| `texte.md` | der vollständige Text des Videos für den Vorführenden, erzeugt aus `texte.ts` mit `npm run texte` |
| `drehbuch.spec.ts` | die 22 Kapitel in Reihenfolge, jedes eine kleine Funktion |
| `overlays.ts` | Titel- und Kapitelkarten, Untertitelleiste, Kapitel-Marke, Rahmen, Zoom |
| `timeline.ts` | schreibt `out/timeline.json` mit Kapitelmarken und Wartespannen |
| `schnitt.sh` | Lang- und Kurzfassung als MP4 aus dem Rohvideo und der Zeitachse (`npm run schnitt`) |
| `playwright.config.ts` | ein Projekt `aufnahme`: Chromium, 1920×1080, Video an, lange Zeitgrenzen |

## Einrichten

```bash
cd stromentlastung-demo/video
npm install
npm run install-browser        # lädt den Chromium-Build von cdn.playwright.dev
```

Ist der Download nicht möglich (das Netz lässt `cdn.playwright.dev` nicht durch), nimmt
die Konfiguration von selbst den installierten Google Chrome. Das ist derselbe Browserkern;
die Videoaufzeichnung läuft über das ffmpeg, das Playwright mitbringt. `BROWSER_CHANNEL=chrome`
erzwingt Chrome, `BROWSER_CHANNEL=chromium` den Build.

## Umgebung

Der Spec liest alles aus der Umgebung. Nur `SDLC_URL` ist Pflicht: ohne sie bricht der Test
mit einer klaren Meldung ab, denn die Adresse der Oberfläche wechselt mit jedem Start der
Desktop-Anwendung.

| Variable | Bedeutung | Vorgabe |
| --- | --- | --- |
| `MODUS` | `trockenlauf` oder `aufnahme` (siehe unten) | `trockenlauf` |
| `SDLC_URL` | Oberfläche von SDLC Pilot, der App-Server der Desktop-Anwendung | keine; `lsof -nP -iTCP -sTCP:LISTEN \| grep '^SDLC'` nennt den Port |
| `SDLC_API` | Backend für die Statusabfragen | `http://127.0.0.1:8000` |
| `FACH_MAIN` | Fachanwendung auf `main` | `http://localhost:8090` |
| `FACH_FIXED` | Fachanwendung mit dem gelieferten Branch | `http://localhost:8095` |
| `FACH_USER` | Vorführkonto der Fachanwendung | `mastouri@stromentlastung.dev` |
| `FACH_PASS` | dessen veröffentlichtes Passwort (README des Verfahrens) | `stromentlastung` |
| `JIRA_URL` | das Ticket im Browser | `https://sdlcpilot-demo.atlassian.net/browse/STROM-4` |
| `GITHUB_COMPARE` | der Vergleich `main...codegen/STROM-4` im Erhebungsdienst | `https://github.com/aymenmastouri/stromentlastung-zahlung/compare/main...codegen/STROM-4` |
| `BROWSER_CHANNEL` | `chrome` oder `chromium`, siehe oben | automatisch |

Andere Zugangsdaten als das Vorführkonto der Fachanwendung tippt der Spec nie.

## Jira-Sitzung

Kapitel 6 zeigt das Ticket in Jira. Der Spec lädt dafür eine gespeicherte Browsersitzung aus
`auth/jira.json`. Fehlt die Datei, wird das Kapitel mit einer Notiz in der Konsole und in der
Zeitachse übersprungen; die Aufnahme läuft weiter. Die Datei entsteht einmal durch den
Vorführenden, der sich im geöffneten Browser anmeldet und ihn danach schließt:

```bash
npx playwright codegen --save-storage=auth/jira.json https://sdlcpilot-demo.atlassian.net/browse/STROM-4
```

`auth/` ist von Git ausgeschlossen.

## Trockenlauf

```bash
MODUS=trockenlauf SDLC_URL=http://127.0.0.1:61972 npx playwright test
```

Alles wie in der Aufnahme, aber der Spec duldet, dass der Lauf ganz übernommen wird und die
drei Wartepunkte schon entschieden sind: An einem Wartepunkt öffnet er die Seite
Entscheidungen, zeigt den Stand der Stufe mit dem Untertitel und geht weiter, ohne etwas zu
klicken, wenn nichts offen ist. Lange Wartezeiten fallen weg, wenn die Phasen sofort fertig
sind. Zweck: jede Seite, jeden Locator, jedes Overlay und die Videokette in wenigen Minuten
beweisen. Der Trockenlauf startet den Laufsatz *Full Pipeline* in der App; auf dem Stand vom
15. September wird er ganz übernommen und ist in Sekunden durch.

## Aufnahme

```bash
MODUS=aufnahme SDLC_URL=http://127.0.0.1:61972 npx playwright test
```

Voraussetzung ist der Ausgangszustand aus Abschnitt 2 des Drehbuchs; insbesondere sind die
Entscheidungsdateien des Tickets entfernt, damit jeder Wartepunkt anhält. Der Spec startet
das Laufset *Gesamte Pipeline* (im Backend `full`), wartet, bis der Lauf am ersten
Wartepunkt hält (Status `run_outcome = paused`, `paused_at` nennt die Phase; die Seite
Entscheidungen zeigt *wartet auf dich*), gibt ohne Kommentar frei, geht zurück zur
Run-Seite, klickt *Kette fortsetzen* und wartet auf den nächsten Halt, bis die Lieferung
steht. Ein Kommentar wäre eine neue Eingabe für Plan und Umsetzung; mit ihm rechneten genau
diese Phasen neu. Je Halt sind bis zu fünf Minuten Wartezeit vorgesehen; erwartet werden
Sekunden.

Steht vor dem Start eine Entscheidung offen, sperrt die Run-Seite den Startknopf mit dem
Hinweis auf die offene Entscheidung; der Spec klickt dann *Trotzdem starten* und startet.
Das ist in der Aufnahme der Normalfall, weil das Konzept ohne Entscheidungsdatei bereits
*wartet auf dich* zeigt.

Hält der Lauf an einem Wartepunkt nicht an (die Entscheidung stand noch), zeigt der Spec den
Stand und geht weiter; ein Kapitel, das im jetzigen Zustand nicht gefilmt werden kann,
schreibt den Grund in die Zeitachse, und die Aufnahme läuft weiter.

## Ergebnis

| Pfad | Inhalt |
| --- | --- |
| `out/roh/<test>/video.webm` | das Rohmaterial, 1920×1080, WebM (VP8); die Datei erscheint nach dem Ende des Tests |
| `out/timeline.json` | Kapitelmarken (`chapter`, `title`, `t_start`, `t_end`, `note`, `kurz`), Wartespannen ab acht Sekunden, Notizen und der Befund zum Lauf (Zustand der neun Phasen, jüngster Verlauf) |
| `out/kontrolle/*.png` | Standbilder an den Kapitelpunkten, um Einblendungen und Bildausschnitte zu beurteilen |
| `out/kontrolle/lauf-<run_id>.log` | die Live-Ausgabe des gestarteten Laufs |

Die Zeiten der Zeitachse zählen ab dem Start des Tests; die Videoaufzeichnung beginnt
wenige Zehntelsekunden davor mit der ersten Seite. Länge und Bildrate prüft `ffprobe`:

```bash
ffprobe -v error -show_entries format=duration -of default=nw=1 out/roh/*/video.webm
```

`out/`, `node_modules/` und `auth/` sind von Git ausgeschlossen.

## Schnitt

```bash
npm run schnitt                      # jüngstes out/roh/*/video.webm und out/timeline.json
./schnitt.sh pfad/zum/video.webm pfad/zur/timeline.json
```

`schnitt.sh` braucht `ffmpeg` und `ffprobe` (etwa `brew install ffmpeg`) und schreibt zwei
Dateien: `out/langfassung.mp4` ist das ganze Rohvideo als MP4 1080p (H.264, 25 Bilder je
Sekunde, eine stille AAC-Tonspur, damit jeder Player und jedes Präsentationsprogramm die
Datei nimmt); `out/kurzfassung.mp4` enthält nur die Kapitel, die in der Zeitachse `kurz: true`
tragen, in Drehbuch-Reihenfolge aneinandergeschnitten. Kürzungen innerhalb eines Kapitels
(K2, K7, K11 laut Drehbuch) macht das Skript nicht; sie bleiben Handarbeit im Schnittprogramm.
`OFFSET=0.3` verschiebt die Kapitelmarken um Sekunden, falls Video und Zeitachse gegeneinander
versetzt sind; `CRF=18` hebt die Qualität.

## Text für den Vorführenden

`npm run texte` erzeugt `texte.md` aus `texte.ts`: der vollständige Wortlaut aller Karten
und Untertitel, Kapitel für Kapitel, mit der Markierung für die Kurzfassung. Video und
Dokument können nicht auseinanderlaufen, weil beide aus derselben Tabelle kommen.

## Was der Spec voraussetzt

- Die Desktop-Anwendung SDLC Pilot läuft mit dem Projekt `stromentlastung@main`, Oberfläche
  de-DE (der Spec setzt `sdlcpilot.ui-language` selbst), Jira verbunden.
- Beide Welten der Fachanwendung laufen mit dem festen Stichtag (`STROMENTLASTUNG_HEUTE=2026-09-08`).
- Kein anderer Lauf ist aktiv; die Parallelverarbeitung schaltet der Spec aus, falls sie an ist.
- Der Rechner erreicht GitHub für Kapitel 19; sonst wird das Kapitel mit Notiz übersprungen.
