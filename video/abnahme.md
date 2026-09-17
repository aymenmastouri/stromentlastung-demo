# Abnahme der Aufnahme vom 15. September 2026

Prüfung gegen Abschnitt 6 des Drehbuchs. Was hier steht, wurde gemessen, nicht angenommen.
Der Bericht wird nach der Aufnahme vervollständigt; die ersten Abschnitte halten fest, was
vor der Aufnahme geprüft und behoben wurde.

## 1 · Was vor der Aufnahme gefunden und behoben wurde

| Befund | Wirkung im Video | Behebung | Nachweis |
| --- | --- | --- | --- |
| Die Demo-Welten rechneten mit dem Tagesdatum: sieben angefangene Monate, 436,10 € statt 373,80 € | Bildschirm widerspricht Ticket, Konzept und Anleitung | `demo.sh` setzt `STROMENTLASTUNG_HEUTE` in beide Welten (Demo-Repo) | API beider Welten: sechs Monate, 37380 und 37200 Cent |
| Zwei tote Läufe vom 8. und 9. September standen im Verlauf ganz oben | K20 begänne mit Fehlschlägen | Verlauf nach Startzeit sortiert (`6f6ee8a`) | Unit-Test, Verlauf in der installierten App |
| „In Pipeline verwenden" stempelte den Ticket-Eintrag neu, Triage rechnete erneut (8 von 9 übernommen) | K10 zeigte Triage mit „3s" statt „aktuell" | Unverändertes Ticket behält seinen Stempel (`73e3947`) | Stempel vor und nach dem Staging gleich |
| „Lösungskonzept erzeugen" schrieb die Triage-Artefakte neu; die Konzept-Entscheidung wurde „seit der Entscheidung geändert", der Startknopf gesperrt | K8/K9 mit „Trotzdem starten", K13 ohne sauberen Wartepunkt | Der Konzept-Job fragt das Reuse-Gate der Triage und gibt das stehende Konzept zurück (`73e3947`, Schreibweise des Laufs `d776dba`) | Backend-Log: „STROM-4 stands — the recorded triage is reused, nothing is rewritten"; Full Pipeline danach 9 von 9 „aktuell" |
| Mit beiseitegelegten Entscheidungen lief die Kette ohne Halt durch: der Wartepunkt saß in der Ausführung, die eine übernommene Phase nie erreicht | Keine der drei Entscheidungen im Video | Der Wartepunkt wird vor dem Reuse-Gate gefragt (Commit nach `d776dba`) | Unit-Tests; Probe mit `entscheidungen.sh probe` (siehe Abschnitt 2) |
| Chromium-Download für Playwright im Netz blockiert | Keine Aufnahme möglich | Playwright steuert das installierte Google Chrome (`channel: chrome`) | Trockenläufe und Aufnahme damit |
| Ein Kommentar bei der Freigabe ist ein Signal im Reuse-Schlüssel von Plan und Umsetzung | Mit Kommentar rechneten diese Phasen neu | Freigaben im Video ohne Kommentar (Drehbuch Abschnitt 4) | Probe |
| Die Run-Seite bot „Kette fortsetzen" nicht an, sobald irgendeine Entscheidung wartete; mit stehenden Artefakten werden Plan und Lieferung nach der Konzeptfreigabe sofort entscheidbar | Erste Aufnahme: nach Wartepunkt 1 keine Fortsetzung, 20 Minuten Wartezeit, keine Kette im Bild | Nur die Entscheidung zählt, die die pausierte Phase freigibt (Frontend-Fix `2f1c644`); der Spec setzt zur Sicherheit über die API fort, wenn die Karte ausbleibt | zweite Aufnahme: Konzept und Plan freigegeben und fortgesetzt |
| Die Lieferfreigabe steht sofort als „ausgeführt", weil die Lieferung schon einmal unter derselben Freigabe lief; die Seite zeigt dafür keine „Freigegeben"-Meldung, auf die der Spec wartete | Zweite Aufnahme: Lieferung freigegeben, aber nicht fortgesetzt, fünf Minuten Wartezeit | Der Spec nimmt auch den Zustandswechsel der Stufe als Freigabe | dritte Aufnahme |
| Nach der Kette zeigte die Berichte-Seite acht Phasen als gerechnet und nur die letzte als „aktuell": die Statusdatei einer Fortsetzung nennt nur deren eigene Phasen, für die übrigen entschieden die Artefakte, und die wissen nur, dass etwas da ist, nicht dass es übernommen wurde | Der Bericht widerspricht der Aussage des Films | Der Status folgt der Kette über `resumed_from` zurück; das jüngere Wort gilt (Commit nach `55e7935`) | pinned Abfrage: neun Phasen, jede mit ihrem eigenen Vermerk |
| Im Stepper stand bei übernommenen Phasen nur „stand vor der Pause", nie „aktuell" — auf einer vollständig übernommenen Kette sagte nichts auf der Seite, dass wiederverwendet wurde | Genau die Botschaft des Videos fehlte im Bild | Eine übernommene Phase, die übernommen wurde, sagt „aktuell"; woher sie stammt, steht im Hover | neue Aufnahme |
| Vor dem Start meldet die Run-Seite „ein Wartepunkt ist offen" und verlangt „Trotzdem starten", weil das Konzept steht und noch niemand entschieden hat | Ein zusätzlicher Klick in K9, für eine Sekunde im Bild | Belassen: Produktverhalten, die Seite sagt wahrheitsgemäß, wo der Lauf anhalten wird | – |

## 2 · Probe der Wartepunkte

Werkzeug: `scripts/entscheidungen.sh probe` gegen die installierte App (Build `eb6a8f3`), nach
`scripts/entscheidungen.sh beiseite` (Entscheidungen des Tickets beiseitegelegt nach
`~/sdlcpilot-local-backups/entscheidungen-<stamp>/`).

| Lauf | Phasen | Halt | Freigabe |
| --- | --- | --- | --- |
| `b80b1355` | discover, extract, analyze, document, triage: alle übernommen | plan | Konzept, ohne Kommentar, Kette fortgesetzt |
| `6bda8756` | plan: übernommen | implement | Plan, ohne Kommentar, Kette fortgesetzt |
| `bb13b4d0` | implement, verify: übernommen | deliver | Lieferung, ohne Kommentar, Kette fortgesetzt |
| `fcdc33e9` | deliver: übernommen | – | Ergebnis `all_skipped` |

Ergebnis: drei Halte, drei Freigaben, keine Phase gerechnet, Branch-Stände der sieben Klone
unverändert. Der Weg dorthin brauchte zwei Anläufe: Beim ersten (Build `84143de`) hielt die
Kette an Plan und Lieferung, nicht am Konzept, weil die aufgeschobene Plan-Phase ihren Wächter
erst beim Rechnen baute (`eb6a8f3`). Davor (Build `d776dba`) hielt sie gar nicht.

Beobachtung am Rande: Der Record eines pausierten Laufs bekommt sein `paused_at` einen Moment
nach dem Ende des Laufs; die Statuszeilen tragen den Halt sofort (`awaiting_decision`). Die
Probe fragt beides, der Spec ebenso.

## 3 · Aufnahme

Drei Aufnahmen, die dritte ist der Film. Alle gegen die installierte App, Playwright über das
installierte Google Chrome, 1920×1080, Oberfläche de-DE, Plattform-Modus für die Aufnahme auf
„SovAI", danach zurück auf „Automatisch".

| Aufnahme | Build | Dauer | Ergebnis |
| --- | --- | --- | --- |
| 1 (`out/aufnahme-1/`) | `eb6a8f3` | 36:29 | Konzept freigegeben, keine Fortsetzung angeboten (Run-Seite zählte jede wartende Entscheidung); 20 Minuten Wartezeit |
| 2 (`out/aufnahme-2/`) | `2f1c644` | 17:06 | Konzept und Plan freigegeben und fortgesetzt; Lieferung freigegeben, aber der Spec wartete auf eine Meldung, die es bei „ausgeführt" nicht gibt; fünf Minuten Wartezeit |
| 3 (`out/aufnahme-3/`) | `2f1c644` | 11:50 | wie geplant, aber: übernommene Phasen sagten „stand vor der Pause" statt „aktuell", und die Berichte-Seite zeigte acht Phasen als gerechnet |
| 4 (`out/aufnahme-4/`) | `cf81e3e` | 13:39 | „aktuell" an jeder übernommenen Phase, das Dossier mit drei Kapiteln im Durchlauf; der Lieferbericht wiederholte denselben Pull Request siebenmal |
| **5** (`out/roh/…`) | `7a29116` | **13:41** | der Film: Vorgangsliste in Kapitel 3, Dossier mit sechzehn Kapiteln beziffert, Lieferbericht als eine Tabelle |

Die Kette der vierten Aufnahme: `84047ad3` (discover bis triage übernommen, Halt am Konzept) →
`ea8c521d` (plan übernommen, Halt am Plan) → `7b81d3e7` (implement und verify übernommen, Halt an
der Lieferung) → `b2a01a5d` (deliver übernommen, Ergebnis `all_skipped`, neun von neun Phasen
übernommen). Drei Freigaben ohne Kommentar, drei Mal „Kette fortsetzen" im Bild; der Stepper
nennt jede übernommene Phase „aktuell". Wartespannen: 20 Sekunden für das Lösungskonzept,
13 Sekunden bis die fünf Phasen standen, 11 Sekunden an der Lieferung. Kapitelmarken in
`out/timeline.json` (22 Kapitel plus zwei Aktkarten).

Das Dossier-Kapitel K11 dauert jetzt 2:39 statt 1:08: nach dem Bericht werden drei Kapitel von
der Überschrift bis zum Fuß gescrollt — C4 Ebene 1 (Systemkontext), arc42 Bausteinsicht (fünf
Diagramme) und arc42 Laufzeitsicht (vier Diagramme). Kontrollbilder `12-k11-c4-kontext.png`,
`13-k11-bausteinsicht.png`, `14-k11-laufzeitsicht.png`.

### Die fünfte Aufnahme

Kette `8f8d25f2` → … → `df422d36`, wieder drei Halte und drei Freigaben ohne Kommentar, neun
von neun Phasen übernommen. Neu gegenüber der vierten:

- **Kapitel 3 zeigt die Vorgänge der Dienststelle** (Kopfmenü → Vorgänge): elf Fälle mit
  Aktenzeichen, Unternehmen, Entnahmejahr, Zustand, Bearbeitung und festgesetztem Betrag —
  Rückforderung offen, Eingereicht, Entwurf, Festgesetzt, Rückfrage, Ausgezahlt,
  Zurückgenommen, Abgelehnt. Kontrollbild `02-k3-vorgaenge.png`.
- **Das Dossier wird beziffert:** der Untertitel nennt sechzehn Kapitel, C4 Ebene 1 bis 4 und
  arc42 §1 bis §12, und sagt, dass drei davon als Beispiel gelesen werden.
- **Der Lieferbericht** zeigt eine Branches-Tabelle mit sieben Quellen, einen Pull-Request-
  Eintrag mit der Zahl sieben und einen Text — vorher siebenmal derselbe Block (`7a29116`).

Zwei Kleinigkeiten aus dieser Aufnahme, beide im Spec behoben und erst in der nächsten
Aufnahme wirksam: die Notiz zählte die Vorgangsliste zu früh und schrieb „1 Zeile", und der
Dossier-Kopf wurde nicht gerahmt, weil das Muster verankert war und die schlichte Überschrift
Leerraum trägt. Beides betrifft nur Rahmen und Notiz, nicht den Inhalt des Films.

## 4 · Prüfung gegen Abschnitt 6 des Drehbuchs

- [x] Beide Fassungen liegen unter `video/out/` vor (`langfassung.mp4`, `kurzfassung.mp4`), 1920×1080, Untertitel eingebrannt, Oberfläche auf Deutsch.
- [x] Alle 22 Kapitel sind im Bild, in dieser Reihenfolge; die Kurzfassung lässt K5 weg (das einzige „Kurz: nein"). Die Kürzungen innerhalb K2, K7 und K11 sind nicht geschnitten; die Kurzfassung ist damit 13:28 gegenüber 13:41 der Langfassung, nicht die geplanten sechs Minuten.
- [x] Der Lauf im Video: neun Phasen „aktuell", keine gerechnet, drei Halte, drei Freigaben ohne Kommentar, drei Fortsetzungen, am Ende ein Stepper mit allen neun Phasen der Kette.
- [x] Die Zahlen: 373,80 € vorher auf :8090, 372,00 € nachher auf :8095; Kopfband „main" bzw. „main + codegen/STROM-4".
- [x] Der Branch liegt auf origin mit denselben Ständen wie vor der Aufnahme (`add5aa6` im Erhebungsdienst); der Vergleich zeigt zwei Dateien im Erhebungsdienst und einen Test im Prüfpaket.
- [x] Jeder Untertitel steht so in `texte.ts` und `texte.md`; die Begriffe der Folien kommen vor.
- [x] Der gesicherte Stand vom 15. September (`strom4-delivered-2026-09-15`) ist unverändert; die Entscheidungen des Videos liegen als neue Dateien unter `approvals/STROM-4/`, die vorherigen unter `~/sdlcpilot-local-backups/entscheidungen-*/`.
- [x] Alles Material liegt in `stromentlastung-demo/video/`; im Produkt nur die fünf Fehlerbehebungen mit Tests, nichts in einem registrierten Quell-Repository.

## 5 · Offen

- Der Vorführende hat den Wortlaut noch nicht freigegeben; eine Änderung ist eine Ein-Datei-Änderung in `texte.ts` (danach `npm run texte`) und eine neue Aufnahme von zwölf Minuten.
- Die Kurzfassung ist nur die Langfassung ohne K5; die im Drehbuch vorgesehenen Kürzungen innerhalb der Kapitel sind Handschnitt.
- Die K9-Meldung „ein Wartepunkt ist offen" mit „Trotzdem starten" bleibt im Bild (Produktverhalten).
- Der Verlauf (K20) zeigt unter der Kette des Videos die Probeläufe dieses Abends.
- Die Wartepunkt-Zeile im Stepper heißt weiterhin „teilweise"; ein eigener Zustand „wartet auf Freigabe" ist eine Produktentscheidung.
- Vor einer neuen Aufnahme: `scripts/entscheidungen.sh beiseite`, Plattform-Modus auf SovAI, `SDLC_URL` auf den aktuellen Port der App.
