# Der Text des Videos

Wortlaut aller Karten und Untertitel, Kapitel für Kapitel, erzeugt aus `texte.ts` am 17. September 2026.
Was hier steht, steht so im Video; eine Änderung am Wortlaut geschieht in `texte.ts`,
danach erzeugt `npm run texte` dieses Dokument neu.

**Botschaft:** Von der Anforderung bis zur Auslieferung – ein durchgängiger, gesteuerter, nachweisbarer Prozess.

Die Spalte *Kurzfassung* sagt, ob das Kapitel in die etwa sechsminütige Fassung kommt;
Kürzungen innerhalb eines Kapitels (K2, K7, K11) nimmt der Schnitt vor.

---

## Akt 1 · Der Auftrag

### K1 · Titelkarte

*Kurzfassung: ja*

**Titelkarte**

> Von der Anforderung bis zur Auslieferung
>
> ein durchgängiger, gesteuerter, nachweisbarer Prozess.

**Darunter**

> Ein Fachverfahren. Ein Ticket. Eine Kette bis zum Branch.

### K2 · Das Verfahren

*Kurzfassung: ja*

**Kapitelkarte**

> Strom ist besteuert.
>
> Unternehmen des Produzierenden Gewerbes bekommen einen Teil zurück: die Steuerentlastung nach § 9b Stromsteuergesetz, beantragt beim Hauptzollamt für ein Entnahmejahr.
>
> Wurde zu viel ausgezahlt, ergeht ein Änderungsbescheid, und der Unterschied wird zurückgefordert.
>
> Wer die Rückforderung nicht bis zur Fälligkeit zahlt, schuldet Säumniszuschläge.

**Untertitel**

Das Referenzverfahren ist nachgebaut und vereinfacht: von KI allein aus öffentlichen Quellen erstellt. Kein Verfahren der Zollverwaltung, kein Bezug zu einem Kundenprojekt von Capgemini.

### K3 · Anmeldung und Vorgänge

*Kurzfassung: ja*

**Untertitel 1**

Die Sachbearbeitung der Dienststelle meldet sich an. Das Kopfband nennt den Stand, auf dem die Dienste laufen: main.

**Untertitel 2**

Die Dienststelle führt ihre Vorgänge in einer Liste: Aktenzeichen, Unternehmen, Entnahmejahr, Zustand und festgesetzter Betrag, filterbar nach Zustand. Der Fall von gleich ist einer von vielen.

### K4 · Rückforderungen

*Kurzfassung: ja*

**Untertitel 1**

Eine offene Rückforderung: 6.230,00 €, fällig im März, seit sechs angefangenen Monaten säumig — gerechnet auf den Tag, den das Ticket nennt. Säumniszuschlag: 373,80 €.

**Untertitel 2**

Die Zahl kann nicht stimmen. Ein Säumniszuschlag ist ein Prozent je Monat von einem Betrag, der vorher auf volle 50 Euro abgerundet wird. Er endet nie auf 80 Cent.

### K5 · Vorgang

*Kurzfassung: nein*

**Untertitel**

Im Vorgang unter Zahlungen steht derselbe Betrag. Mehr weiß die Sachbearbeitung nicht, und mehr muss sie nicht wissen: Sie meldet, was sie sieht.

### K6 · Das Ticket im Browser

*Kurzfassung: ja*

**Untertitel 1**

Die Meldung wird zum Auftrag: ein Ticket, wie das Team es immer schreibt — Anwendungsfall, beobachteter Betrag, die Vorschrift, Akzeptanzkriterien. Kein Prompt.

**Untertitel 2**

Was hier steht: ein Betrag und eine Norm. Was hier nicht steht: wo der Fehler sitzt und wie hoch er ist. Genau das ist gleich die Arbeit.

---

## Akt 2 · Der Lauf

### K7 · Einstellungen

*Kurzfassung: ja*

**Untertitel 1**

Eigene Daten. Eigene Regeln. Eigene KI. Der Plattform-Modus wird einmal am Start des Laufs entschieden: SovAI, die souveräne Plattform von Capgemini. Offline wäre die lokale Plattform auf diesem Rechner, mit denselben Regeln.

**Untertitel 2**

Wiederverwendung fertiger Arbeit: Arbeit, deren Eingaben seit dem letzten Lauf unverändert sind, wird übernommen und nicht neu gerechnet. Der Lauf gleich zeigt, was das heißt.

### K8 · Das Ticket im Werkzeug

*Kurzfassung: ja*

**Untertitel 1**

Das Ticket kommt live aus Jira, mit seinen Verknüpfungen. Von hier ließe sich direkt ein erstes Lösungskonzept aus dem Bestand entwerfen — das überlassen wir gleich der Pipeline.

**Untertitel 2**

In Pipeline verwenden: Das Ticket ist jetzt die Aufgabe des Laufs. Eine Aufgabe, ein Lauf, nichts parallel.

### K9 · Der Lauf wird gestartet

*Kurzfassung: ja*

**Untertitel**

Vor dem Lauf: sieben Repositories auf main, jedes mit seinem Stand. Modelldienste und Vektorspeicher antworten. Der ganze Weg: neun Phasen, linear, ein Ticket.

### K10 · Das Wissen steht

*Kurzfassung: ja*

**Untertitel 1**

Zuerst die Fakten – ohne KI. Bestand, Fakten, Verständnis und Dossier stehen aus dem ersten Kontakt mit dem Code und werden übernommen.

**Untertitel 2**

Was sich nicht geändert hat, wird nicht neu gerechnet. Ändert sich der Bestand, rechnet das Werkzeug genau das neu, und zu jedem Ergebnis steht, aus welchen Eingaben es stammt.

### K11 · Rundgang durch das Wissen

*Kurzfassung: ja*

**Untertitel 1**

Architekturfakten: ohne KI aus dem Code gelesen. Jede Beziehung mit Datei und Zeile.

**Untertitel 2**

Architektursynthese: Die KI erklärt den Bestand, geprüft gegen die Fakten. Wo die Fakten schweigen, sagt sie es.

**Untertitel 3**

Architekturdossier: sechzehn Kapitel — C4 Ebene 1 bis 4 und arc42 §1 bis §12 —, jedes mit Belegen und von einem getrennten Prüfer bewertet. Die KI schreibt. Geprüft wird getrennt. Drei Kapitel stehen hier als Beispiel.

**Untertitel 4**

C4, Ebene 1: der Systemkontext. Wer mit dem Verfahren spricht, was es von außen braucht — ein ganzes Dokument, nicht eine Folie.

**Untertitel 5**

arc42, Bausteinsicht: aus welchen Diensten das Verfahren besteht und wie sie ineinandergreifen. Gelesen aus dem Code, nicht aus einer Zeichnung von gestern.

**Untertitel 6**

arc42, Laufzeitsicht: wie ein Vorgang durch die Dienste läuft. Auf diesem Verständnis sucht die Triage gleich die Ursache.

### K12 · Solution Triage

*Kurzfassung: ja*

**Untertitel 1**

Zuerst das Ticketverständnis: Ziel, Ist-Zustand gegen Soll-Zustand, betroffener Umfang — aufgeschrieben, bevor irgendetwas vorgeschlagen wird.

**Untertitel 2**

Dazu der technische Kontext: welche Dienste, welche Klassen, welche Verträge der Fall berührt. Das ist die Grundlage, auf der gleich das Konzept steht.

**Untertitel 3**

Solution Triage: Das Ticket wird gegen den Bestand gelesen. Hier treffen sich zum ersten Mal die Vorschrift aus dem Ticket und die Methode aus dem Bestand — darin besteht die Arbeit.

**Untertitel 4**

Ursache: SaeumnisRechner.berechne rechnet ein Prozent vom ungerundeten Betrag, 6 × 6.230,00 € / 100 = 373,80 €. Die Abrundung auf volle 50 Euro nach § 240 AO fehlt.

**Untertitel 5**

Fix: vor der Prozentrechnung abrunden. Aus 6.230,00 € werden 6.200,00 €, der Zuschlag 372,00 €. Ein neuer Test sichert einen nicht durch 50 teilbaren Betrag ab.

**Untertitel 6**

Jede Aussage trägt ihren Beleg: Datei und Zeile. Die Leitplanken prüfen Belege, Änderungsorte und die Abdeckung der Akzeptanzkriterien, bevor ein Mensch das Konzept sieht.

### K13 · Wartepunkt 1: das Konzept

*Kurzfassung: ja*

**Untertitel 1**

Der Lauf hält an, wo entschieden wird. Die KI schlägt vor. Der Nachweis prüft. Der Mensch entscheidet – und trägt die Verantwortung.

**Untertitel 2**

Kette fortsetzen: Die Phasen davor stehen, der Plan wird übernommen. Was entschieden ist, bleibt entschieden; was steht, wird nicht neu gerechnet.

### K14 · Delivery Plan und Wartepunkt 2

*Kurzfassung: ja*

**Untertitel**

Der Plan nennt die Stellen, die Reihenfolge und die Tests. Zweite Entscheidung, bevor ein Agent Code schreibt.

### K15 · Controlled Execution

*Kurzfassung: ja*

**Untertitel**

Agenten handeln – die Ausführung beweist. Der Agent hat auf einem Branch in einem eingezäunten Arbeitsbereich geschrieben: nur die geplanten Stellen, Build und Tests liefen mit. Der Bericht hält es fest.

### K16 · Validation Gate

*Kurzfassung: ja*

**Untertitel**

Validation Gate: Nicht der Agent sagt, dass es geht. Die Tests liefen gegen die laufende Anwendung, der Lauf hat es gezeigt.

### K17 · Wartepunkt 3 und Lieferung

*Kurzfassung: ja*

**Untertitel 1**

Dritte Entscheidung: Die Lieferung bleibt eine Ingenieursentscheidung.

**Untertitel 2**

Delivery Readiness: Der Branch liegt auf origin, der Pull Request ist vorbereitet. Neun Phasen, drei Entscheidungen, eine Kette, und nichts wurde zweimal gerechnet.

---

## Akt 3 · Das Ergebnis

### K18 · Änderungen

*Kurzfassung: ja*

**Untertitel**

Das Ergebnis ist kein Chat. Es ist ein Branch mit Diff, Tests und Bericht: im Werkzeug lesbar, im Editor weiterführbar.

### K19 · GitHub

*Kurzfassung: ja*

**Untertitel**

Auf origin: zwei Dateien im Erhebungsdienst, ein Test im Prüfpaket. Nachvollziehbar bis zur Zeile, prüfbar wie jede andere Änderung.

### K20 · Verlauf

*Kurzfassung: ja*

**Untertitel**

Der Verlauf hält die Kette: jeder Lauf, jede Entscheidung, jede Dauer. Einmal gerechnet, heute in Sekunden übernommen.

### K21 · Die zweite Welt

*Kurzfassung: ja*

**Untertitel 1**

Dieselbe Anwendung, der Erhebungsdienst aus dem gelieferten Branch gebaut. Das Kopfband sagt es: main + codegen/STROM-4.

**Untertitel 2**

Vorher 373,80 €. Nachher 372,00 €. Gleiche Daten, andere Regel.

### K22 · Schlusskarte

*Kurzfassung: ja*

**Schlusskarte**

> Die KI schlägt vor. Der Nachweis prüft. Der Mensch entscheidet – und trägt die Verantwortung.
>
> Der Ansatz ist übertragbar. Die Erfahrung liegt vor.

