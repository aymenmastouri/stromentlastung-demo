# Ticket STROM-4 — Fassung für die Vorführung

Dieser Text ist die vorgeschlagene Neufassung des Bug-Tickets in
`sdlcpilot-demo.atlassian.net`. Er wird von Hand dort eingetragen; die Datei ist
nur die Vorlage zum Kopieren und liegt bewusst in diesem Repository, weil es
keine Quelle eines registrierten Projekts ist — die Pipeline liest es nie.

## Warum die Neufassung

Die bisherige Fassung nennt im Titel die Ursache („wird auf den ungerundeten
Betrag berechnet") und in der Beschreibung zusätzlich den Sollwert 372,00 Euro,
die Bemessungsgrundlage 6.200,00 Euro und die zu schreibende Testabdeckung. Die
Vorführung behauptet damit eine Leistung, die im Ticket bereits steht.

Die Neufassung meldet einen Defekt so, wie eine Sachbearbeitung ihn meldet: was
getan wurde, was zu sehen war, welche Norm gilt, welche Wirkung das hat. Sie
nennt die Regel, aber weder das Ergebnis noch die Stelle im Code.

| Gibt das Ticket | Leistet die Pipeline |
| --- | --- |
| die Norm und die Abrundungsregel | die Stelle im Code, in einem von sieben Repositories |
| die Beobachtung 373,80 Euro | die Bemessungsgrundlage 6.200,00 Euro |
| die Abweichung als Tatsache | den Sollwert 372,00 Euro |
| prüfbare Akzeptanzkriterien | Rechenweg, Fix, Test, Auslieferung |

Datenschutz: das Ticket nennt das Aktenzeichen als pseudonymen Verweis, aber
weder Unternehmen noch Nutzerkonto noch Anmeldedaten.

## Titel

```text
Säumniszuschlag lässt sich nicht nachvollziehen
```

## Beschreibung

```text
*Kurz gesagt.* Der Säumniszuschlag muss auf den nächsten durch 50 Euro teilbaren
Betrag abrunden — § 240 Absatz 1 Satz 1 AO: für jeden angefangenen Monat der
Säumnis 1 Prozent des abgerundeten rückständigen Betrags.

h2. Anwendungsfall

*Akteur.* Sachbearbeitung Erhebung.

*Vorbedingung.* Vorgang HZA-N-9b-2024-000002. Die Rückforderung über 6.230,00
Euro war am 13. März 2026 fällig und ist bis heute nicht bezahlt.

*Ablauf.*
# Anmelden als Sachbearbeitung Erhebung.
# „Rückforderungen" öffnen, Zeile zum genannten Aktenzeichen.
# Den ausgewiesenen Säumniszuschlag prüfen.

*Tatsächliches Ergebnis.* Die Anwendung weist am 8. September 2026 sechs
angefangene Monate und einen Säumniszuschlag von 373,80 Euro aus.

*Befund.* Der ausgewiesene Betrag entspricht dieser Berechnung nicht. Die
Abweichung tritt in jedem geprüften Vorgang mit Säumniszuschlag auf.

h2. Fachliche Auswirkung

Der Betrag geht unverändert in den Rückforderungsbescheid. Ein zu hoch
festgesetzter Säumniszuschlag ist angreifbar.

h2. Akzeptanzkriterien

# Der ausgewiesene Säumniszuschlag entspricht der Berechnung nach § 240 Absatz 1
Satz 1 AO und ist im Bescheid nachvollziehbar.
# Die Schonfrist und die Zählung angefangener Monate bleiben unverändert.
# Die vorhandenen Tests bleiben grün.
```

## Was die Änderung auslöst

Der Ticketinhalt ist eine Eingabe der Phase Triage. Ändert er sich, ändert sich
ihr Wiederverwendungsschlüssel: Triage, Plan, Umsetzung, Prüfung und
Auslieferung rechnen neu. Discover, Extract, Analyze und Document bleiben
stehen, sie kennen nur das Repository.

Die Reihenfolge:

1. `scripts/sicherung.sh save strom4-vor-ticketaenderung`
2. Titel und Beschreibung in Jira ersetzen.
3. In der Anwendung unter *Jira / Confluence* das Ticket erneut übernehmen.
4. Laufset `full` starten und an den drei Toren entscheiden.
5. Am ersten Tor prüfen: nennt das Lösungskonzept 6.200,00 Euro als
   Bemessungsgrundlage, 372,00 Euro als Sollwert und `SaeumnisRechner.berechne`
   als Fundstelle? Dann trägt der Text.
6. Trägt er nicht: `scripts/sicherung.sh restore strom4-delivered-2026-09-15`.

Die vorhandene Aufnahme zeigt die Jira-Seite mit dem alten Titel. Mit der
Änderung ist sie inhaltlich überholt; sie gilt bis zur nächsten Aufnahme
unverändert weiter.
