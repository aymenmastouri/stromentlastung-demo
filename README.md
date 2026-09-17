# Vorführung des Referenzverfahrens

Dieses Repository enthält das Drehbuch und den Fahrstand für die Vorführung des
Referenzverfahrens `stromentlastung` mit SDLC Pilot. Es enthält **keinen Anwendungscode**.

- [docs/anleitung.md](docs/anleitung.md) — das Drehbuch: Fachlichkeit zum Sprechen, die
  Zugänge, jeder Akt mit Seite und Tabelle, die Abfragen in den Datenbanken, die zu
  erwartenden Fragen und die Fehlersuche.
- [scripts/demo.sh](scripts/demo.sh) — nimmt ein Ticket, holt den gelieferten Branch, baut
  genau die Dienste ein zweites Mal, die er berührt hat, und stellt einen zweiten Eingang
  davor.
- [scripts/sicherung.sh](scripts/sicherung.sh) — sichert den Stand von SDLC Pilot nach einer
  gelaufenen Kette (Wissensbaum, Läufe, Logs, Verlauf, die gelieferten Branches als
  Bundles) und spielt ihn in sicherer Reihenfolge zurück: erst die Quelle prüfen, dann den
  jetzigen Stand beiseitelegen, erst dann tauschen.
- [video/drehbuch.md](video/drehbuch.md) — das Drehbuch des Vorführvideos: Ausgangszustand,
  die Kapitel mit Wortlaut, der Produktionsplan und die Abnahme.

```bash
scripts/demo.sh up STROM-4
scripts/demo.sh status
scripts/demo.sh reset
scripts/sicherung.sh save strom4-delivered-2026-09-15
scripts/sicherung.sh list
```

Den Tag, an dem beide Welten rechnen, hält die Datei [`stichtag`](stichtag); er steht dort,
damit ein Start ihn nicht vergessen kann, und `up` schreibt hin, woher er stammt.
`STROMENTLASTUNG_HEUTE=YYYY-MM-DD` übersteuert ihn. Der feste Tag hält den Säumniszuschlag
auf den Beträgen des Tickets; ohne ihn rechnen die Dienste mit dem Datum der Vorführung und
zählen andere Monate. Ebenso entscheidet er, ob eine Frist als abgelaufen gilt.

Das Skript setzt voraus, dass die sieben Repositories des Verfahrens nebeneinander in
einem Arbeitsbereich liegen; es findet sie über seinen eigenen Ort.

## Warum das hier liegt und nicht beim Verfahren

Dieses Repository darf **niemals als Quelle eines Projekts in SDLC Pilot registriert
werden.**

Das Drehbuch nennt das Ticket, den Branch, die berührten Dateien und die erwarteten
Beträge. Läge es bei den Repositories des Verfahrens, würde die Kette es lesen wie
Systemdokumentation und die Antwort dort finden, statt sie herzuleiten. Der Lauf wäre dann
kein Beweis mehr, sondern ein Abschreiben.

Aus demselben Grund gehört auch keine Beschreibung der Vorführung in die READMEs oder
Dokumente des Verfahrens. Dort steht nur, was das Verfahren selbst betrifft.
