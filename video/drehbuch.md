# Drehbuch: Von der Anforderung bis zur Auslieferung

Stand 15. September 2026, Fassung 2. Dieses Dokument ist der Plan der Aufnahme. Was hier
steht, wird gebaut, aufgenommen und am Ende gegen Abschnitt 6 geprüft. Änderungen am
Wortlaut werden hier eingetragen, nicht im Spec.

---

## 1 · Botschaft und Form

**Botschaft** (Titel der Folie): *Von der Anforderung bis zur Auslieferung – ein
durchgängiger, gesteuerter, nachweisbarer Prozess.*

**Form.** Bildschirmaufnahme, von Playwright gesteuert wie das TestGen-Video. Keine
Stimme. Untertitel und Kapitelkarten tragen den Text, auf Deutsch, mit den Begriffen der
Folien. Die Oberfläche des Werkzeugs läuft auf Deutsch. Zwei Fassungen: die Langfassung
ist der ganze Film (etwa 15 Minuten), die Kurzfassung etwa sechs.

**Drei Akte** wie auf der Demonstrator-Folie: *Der Auftrag · Der Lauf · Das Ergebnis.*
Der Zuschauer folgt der Sachbearbeitung, die einen Betrag sieht, der nicht stimmen kann,
dann dem Ticket des Teams, dann dem Werkzeug, und am Ende demselben Bildschirm mit dem
richtigen Betrag.

**Der Fall beruht auf Wiederverwendung, ganz.** Die Kette für dieses Ticket ist am
15. September einmal durchgelaufen, mit drei Entscheidungen, bis zur Lieferung. Der Lauf
im Video übernimmt alle neun Phasen aus diesem Stand: keine Phase rechnet neu, jede steht
in Sekunden als *aktuell*. Was live geschieht, sind die drei Entscheidungen: Der Lauf
hält am Konzept, am Plan und an der Lieferung an, ein Mensch gibt frei, die Kette läuft
mit *Kette fortsetzen* weiter, wieder als Übernahme. Das ist die Aussage: Was steht, wird
nicht zweimal gerechnet; was entschieden werden muss, wird entschieden.

---

## 2 · Ausgangszustand vor der Aufnahme (Soll)

| Bereich | Soll | Hergestellt durch | Geprüft durch |
| --- | --- | --- | --- |
| Werkzeug | Build `318c24a` installiert, Oberfläche de-DE, Plattform-Modus *SovAI – die konfigurierte Plattform*, Verbindungen grün, *Wiederverwendung fertiger Arbeit: unverändert übernehmen*, Parallelverarbeitung aus | Einstellungen | Seite Einstellungen im Trockenlauf |
| Wissen und Kette | alle neun Phasen stehen aus der Kette vom 15. September (`d05701b9` → `049de062` → `41d85bef` → `ae94f258`) und werden übernommen; nichts wird zurückgesetzt | nichts tun | Trockenlauf: neun Zeilen *aktuell* |
| Entscheidungen | die Entscheidungsdateien des Tickets sind entfernt (`approvals/STROM-4/{concept,plan,delivery}/*.json`, beiseitegelegt, die Sicherung hält sie), damit jeder der drei Wartepunkte anhält | Ordner leeren, unmittelbar vor der Aufnahme | Entscheidungen: Konzept *wartet auf dich*, Plan und Lieferung *noch nicht so weit* |
| Freigaben im Video | ohne Kommentar. Ein Kommentar ist eine neue Eingabe für Plan und Umsetzung; mit ihm rechneten genau diese Phasen neu, und das Video zeigte keine Übernahme mehr | Spec gibt ohne Text frei | Trockenlauf mit entfernten Entscheidungen: Plan, Umsetzung, Prüfung, Lieferung weiter *aktuell* |
| Quellcode | sieben Repositories auf main; die Branches `codegen/STROM-4` bleiben auf origin und in den Klonen (die Lieferung wird übernommen und pusht nichts) | nichts tun | Stände der Branches vor und nach der Aufnahme gleich |
| Fachanwendung | beide Welten mit festem Stichtag: `STROMENTLASTUNG_HEUTE=2026-09-08 scripts/demo.sh up STROM-4`; :8090 zeigt 373,80 €, :8095 zeigt 372,00 € | demo.sh | API beider Welten: sechs Monate, 37380 bzw. 37200 Cent |
| Meldung | Jira STROM-4 im Browser erreichbar, Sitzung gespeichert | einmalige Anmeldung durch den Vorführenden | Spec öffnet das Ticket ohne Anmeldemaske |
| Sicherung | Stand vom 15. September gesichert, Rückweg bekannt | `scripts/sicherung.sh save` | `scripts/sicherung.sh list` |

Der Stichtag ist nötig: Ein Säumniszuschlag zählt die angefangenen Monate seit der
Fälligkeit. Ohne festen Tag zeigt die Anwendung am Aufnahmetag sieben Monate und andere
Beträge als Ticket, Lösungskonzept und Anleitung. Das Ticket selbst nennt den
8. September 2026.

---

## 3 · Storyline

Je Kapitel: Bild, Handlung, Untertitel (Wortlaut zur Freigabe), Beleg im Bild, und ob es
in die Kurzfassung kommt.

### Akt 1 · Der Auftrag (Fachanwendung auf main, http://localhost:8090)

**K1 · Titelkarte.** Karte mit dem Titel; darunter: *Ein Fachverfahren. Ein Ticket. Eine
Kette bis zum Branch.* Kurz: ja.

**K2 · Das Verfahren.** Kapitelkarte, vier Sätze: *Strom ist besteuert. Unternehmen des
Produzierenden Gewerbes bekommen einen Teil zurück: die Steuerentlastung nach § 9b
Stromsteuergesetz, beantragt beim Hauptzollamt für ein Entnahmejahr. Wurde zu viel
ausgezahlt, ergeht ein Änderungsbescheid, und der Unterschied wird zurückgefordert. Wer
die Rückforderung nicht bis zur Fälligkeit zahlt, schuldet Säumniszuschläge.* Danach als
Untertitel: *Das Referenzverfahren ist nachgebaut und vereinfacht: von KI allein aus
öffentlichen Quellen erstellt. Kein Verfahren der Zollverwaltung, kein Bezug zu einem
Kundenprojekt von Capgemini.* Kurz: ja, gekürzt.

**K3 · Anmeldung und Vorgänge.** Bild: Anmeldung, Startseite, Kopfband
*Referenzverfahren – kein Echtbetrieb · main*; danach im Kopfmenü **Vorgänge**: die Liste
der Fälle mit Aktenzeichen, Unternehmen, Entnahmejahr, Zustand und festgesetztem Betrag,
dazu der Filter nach Zustand. Untertitel 1: *Die Sachbearbeitung der Dienststelle meldet
sich an. Das Kopfband nennt den Stand, auf dem die Dienste laufen: main.* Untertitel 2:
*Die Dienststelle führt ihre Vorgänge in einer Liste: Aktenzeichen, Unternehmen,
Entnahmejahr, Zustand und festgesetzter Betrag, filterbar nach Zustand. Der Fall von
gleich ist einer von vielen.* Kurz: ja.

**K4 · Rückforderungen.** Bild: Liste, Zeile Ostsee Werft GmbH, Aktenzeichen
HZA-N-9b-2024-000002, 6.230,00 €, fällig 13.03.2026, offen, Säumniszuschlag 373,80 €.
Untertitel 1: *Eine offene Rückforderung: 6.230,00 €, fällig im März, seit sechs
angefangenen Monaten säumig. Säumniszuschlag: 373,80 €.* Untertitel 2: *Die Zahl kann
nicht stimmen. Ein Säumniszuschlag ist ein Prozent je Monat von einem Betrag, der vorher
auf volle 50 Euro abgerundet wird. Er endet nie auf 80 Cent.* Beleg: Zoom auf die Zelle.
Kurz: ja.

**K5 · Vorgang.** Bild: Vorgang öffnen, Zahlungen: derselbe Zuschlag. Untertitel: *Im
Vorgang unter Zahlungen steht derselbe Betrag. Mehr weiß die Sachbearbeitung nicht, und
mehr muss sie nicht wissen: Sie meldet, was sie sieht.* Kurz: nein.

**K6 · Das Ticket im Browser.** Bild: Jira, STROM-4 *Säumniszuschlag wird auf den
ungerundeten Betrag berechnet*, Typ Bug: Ist (8. September 2026, sechs angefangene
Monate, 373,80 €), Soll (Abrundung auf 50 Euro, 372,00 €, Bemessungsgrundlage
6.200,00 €), Akzeptanzkriterien (372,00 € ausgewiesen; ein Test für einen nicht durch
50 Euro teilbaren Betrag; Schonfrist und Monatszählung unverändert). Untertitel: *Die
Meldung wird zum Auftrag: ein Ticket mit Ist, Soll und Akzeptanzkriterien, so
geschrieben, wie das Team es immer schreibt. Kein Prompt.* Kurz: ja.

### Akt 2 · Der Lauf (SDLC Pilot)

**K7 · Einstellungen.** Bild: Ausführungsplattform mit Plattform-Modus *SovAI – die
konfigurierte Plattform*, Verbindungen grün; darunter *Wiederverwendung fertiger Arbeit:
unverändert übernehmen*. Untertitel 1: *Eigene Daten. Eigene Regeln. Eigene KI. Der
Plattform-Modus wird einmal am Start des Laufs entschieden: SovAI, die souveräne
Plattform von Capgemini. Offline wäre die lokale Plattform auf diesem Rechner, mit
denselben Regeln.* Untertitel 2: *Wiederverwendung fertiger Arbeit: Arbeit, deren
Eingaben seit dem letzten Lauf unverändert sind, wird übernommen und nicht neu gerechnet.
Der Lauf gleich zeigt, was das heißt.* Kurz: ja, Untertitel 1 gekürzt.

**K8 · Das Ticket im Werkzeug.** Bild: Jira / Confluence, STROM-4 laden; Big Picture mit
Ziel, AS-IS und TO-BE, betroffene Komponenten; der Knopf *Lösungskonzept erzeugen* wird
gerahmt gezeigt, aber **nicht gedrückt**; *In Pipeline verwenden*; Meldung, dass STROM-4 die
Aufgabe des Laufs ist. Untertitel 1: *Das Ticket kommt live aus Jira, mit seinen
Verknüpfungen. Von hier ließe sich direkt ein erstes Lösungskonzept aus dem Bestand
entwerfen — das überlassen wir gleich der Pipeline.* Untertitel 2: *In Pipeline verwenden:
Das Ticket ist jetzt die Aufgabe des Laufs. Eine Aufgabe, ein Lauf, nichts parallel.* Kurz:
ja, kurz.

Der Knopf bleibt im Bild, weil die Möglichkeit zur Vorführung gehört; gedrückt wird er
nicht. Ein hier erzeugtes Konzept nähme der Triage vorweg, was der Film in K12 als ihre
Arbeit zeigt — und seit das Ticket nur noch das Symptom meldet, ist genau das der Beweis.

**K9 · Der Lauf wird gestartet.** Bild: Run-Seite, *Vor dem Lauf*: sieben Repositories
auf main mit Stand, Dateien und Symbole, Modelldienste, Vektorspeicher; Laufset *Full
Pipeline* (neun Phasen); Parallelverarbeitung aus; Start. Untertitel: *Vor dem Lauf:
sieben Repositories auf main, jedes mit seinem Stand. Modelldienste und Vektorspeicher
antworten. Der ganze Weg: neun Phasen, linear, ein Ticket.* Kurz: ja.

**K10 · Das Wissen steht.** Bild: Stepper, fünf Phasen in Sekunden *aktuell* (Bestand
sichten, Architekturfakten, Architektursynthese, Architekturdossier, Solution Triage),
dann hält der Lauf am ersten Wartepunkt; Live-Output mit den Zeilen *reused — inputs
unchanged since … (version 1)*. Untertitel 1: *Zuerst die Fakten – ohne KI. Bestand,
Fakten, Verständnis und Dossier stehen aus dem ersten Kontakt mit dem Code und werden
übernommen.* Untertitel 2: *Was sich nicht geändert hat, wird nicht neu gerechnet. Ändert
sich der Bestand, rechnet das Werkzeug genau das neu, und zu jedem Ergebnis steht, aus
welchen Eingaben es stammt.* Beleg: Zoom auf die Zeilen und den Log-Satz. Kurz: ja.

**K11 · Rundgang durch das Wissen.** Muster: der Bericht der Phase auf der Seite
Berichte; nur für Architekturfakten und Architektursynthese von dort der Sprung auf die
Beleg-Seite der Phase, Erklärung, zurück zum Bericht. Bestand sichten hat keine eigene
Seite und bekommt keinen Halt. Triage, Plan, Umsetzung, Prüfung und Lieferung bleiben auf
der Seite Berichte; dort wird der wichtige Output gezeigt und erklärt.

- Berichte → Architekturfakten, dann die Seite *Architekturfakten*: Komponenten,
  Aufrufe, Abhängigkeiten mit Datei und Zeile; zurück. *Architekturfakten: ohne KI aus
  dem Code gelesen. Jede Beziehung mit Datei und Zeile.*
- Berichte → Architektursynthese, dann die Seite *Architektursynthese*: Makro- und
  Mikroarchitektur, Entscheidungstreiber, Konfidenz; zurück. *Architektursynthese: Die KI
  erklärt den Bestand, geprüft gegen die Fakten. Wo die Fakten schweigen, sagt sie es.*
- Berichte → Architekturdossier: zuerst der Kopf mit der Zahl der Kapitel und der
  Bewertung. *Architekturdossier: sechzehn Kapitel — C4 Ebene 1 bis 4 und arc42 §1 bis
  §12 —, jedes mit Belegen und von einem getrennten Prüfer bewertet. Die KI schreibt.
  Geprüft wird getrennt. Drei Kapitel stehen hier als Beispiel.* Danach drei Kapitel im Durchlauf, jedes von seiner Überschrift bis zum Fuß
  gescrollt: **C4 Ebene 1, der Systemkontext** (*C4, Ebene 1: der Systemkontext. Wer mit
  dem Verfahren spricht, was es von außen braucht — ein ganzes Dokument, nicht eine
  Folie.*), **arc42 Bausteinsicht** (*arc42, Bausteinsicht: aus welchen Diensten das
  Verfahren besteht und wie sie ineinandergreifen. Gelesen aus dem Code, nicht aus einer
  Zeichnung von gestern.*) und **arc42 Laufzeitsicht** (*arc42, Laufzeitsicht: wie ein
  Vorgang durch die Dienste läuft. Auf diesem Verständnis sucht die Triage gleich die
  Ursache.*)

Kurz: nur Fakten und Dossier, je ein Satz.

**K12 · Solution Triage.** Bild: Berichte → Solution Triage. Zuerst der Abschnitt
*Ticket Understanding* — Ziel, *AS-IS → TO-BE*, *Technical Context*, Umfang —, dann das
Lösungskonzept mit Abschnitt *Root Cause Analysis*, Abschnitt *Fix*, Tabelle *Key Changes*
mit Änderungsorten und *Grounded on*, Leitplanken grün; alles auf der Seite Berichte, der
wichtige Output im Bild: Verständnis, technischer Kontext, Ursache, Fix, Änderungsorte.
Untertitel V: *Zuerst das Ticketverständnis: Ziel, Ist-Zustand gegen Soll-Zustand,
betroffener Umfang — aufgeschrieben, bevor irgendetwas vorgeschlagen wird.* Untertitel T:
*Dazu der technische Kontext: welche Dienste, welche Klassen, welche Verträge der Fall
berührt. Das ist die Grundlage, auf der gleich das Konzept steht.* Untertitel 1: *Solution
Triage: Das Ticket wird gegen den Bestand gelesen. Hier treffen sich zum ersten Mal die
Vorschrift aus dem Ticket und die Methode aus dem Bestand — darin besteht die Arbeit.*
Untertitel 1b: *Ursache: SaeumnisRechner.berechne rechnet ein Prozent vom ungerundeten Betrag,
6 × 6.230,00 € / 100 = 373,80 €. Die Abrundung auf volle 50 Euro nach § 240 AO fehlt.*
Untertitel 2: *Fix: vor der Prozentrechnung abrunden. Aus 6.230,00 € werden 6.200,00 €,
der Zuschlag 372,00 €. Ein neuer Test sichert einen nicht durch 50 teilbaren Betrag ab.*
Untertitel 3: *Jede Aussage trägt ihren Beleg: Datei und Zeile. Die Leitplanken prüfen
Belege, Änderungsorte und die Abdeckung der Akzeptanzkriterien, bevor ein Mensch das
Konzept sieht.* Kurz: ja.

**K13 · Wartepunkt 1: das Konzept.** Bild: Stepper hält; Entscheidungen: Konzept *wartet
auf dich*, Dokument geöffnet, ohne Kommentar *die Planung freigeben*, Meldung
*Freigegeben — die Planung darf laufen*; Run-Seite *Alles entschieden — die Kette kann
weiterlaufen*, *Kette fortsetzen*; der Plan steht in Sekunden *aktuell*, der Lauf hält am
zweiten Wartepunkt. Untertitel 1: *Der Lauf hält an, wo entschieden wird. Die KI schlägt
vor. Der Nachweis prüft. Der Mensch entscheidet – und trägt die Verantwortung.*
Untertitel 2: *Kette fortsetzen: Die Phasen davor stehen, der Plan wird übernommen. Was
entschieden ist, bleibt entschieden; was steht, wird nicht neu gerechnet.* Kurz: ja.

**K14 · Delivery Plan und Wartepunkt 2.** Bild: Berichte → Delivery Plan: Arbeitspaket
STROM-4-T01 mit Änderungsorten (SaeumnisRechner.java, SaeumnisRechnerTest.java), Schritten
und Tests, auf der Seite Berichte. Entscheidungen: ohne Kommentar *die Umsetzung
freigeben*; *Kette fortsetzen*; Umsetzung und Prüfung stehen in Sekunden *aktuell*, der
Lauf hält am dritten Wartepunkt. Untertitel: *Der Plan nennt die Stellen, die Reihenfolge
und die Tests. Zweite Entscheidung, bevor ein Agent Code schreibt.* Kurz: ja, kurz.

**K15 · Controlled Execution.** Bild: Berichte → Controlled Execution: der
Ausführungsbericht des Arbeitspakets: Branch codegen/STROM-4, geänderte Dateien, Build,
Tests, Dauer. Untertitel: *Agenten handeln – die Ausführung beweist. Der Agent hat auf
einem Branch in einem eingezäunten Arbeitsbereich geschrieben: nur die geplanten Stellen,
Build und Tests liefen mit. Der Bericht hält es fest.* Kurz: ja.

**K16 · Validation Gate.** Bild: Berichte → Validation Gate: die Fälle des Testers, der
hochgefahrene Stack, *1 von 1 Arbeitspaket verifiziert*. Untertitel: *Validation Gate:
Nicht der Agent sagt, dass es geht. Die Tests liefen gegen die laufende Anwendung, der
Lauf hat es gezeigt.* Kurz: ja.

**K17 · Wartepunkt 3 und Lieferung.** Bild: Entscheidungen: Lieferung *wartet auf dich*,
ohne Kommentar *die Lieferung freigeben*; *Kette fortsetzen*; Delivery Readiness steht
*aktuell*; Stepper mit allen neun Phasen der Kette; Berichte → Delivery Readiness: sieben
Branches auf origin, Pull Requests vorbereitet, Bewertung. Untertitel 1: *Dritte
Entscheidung: Die Lieferung bleibt eine Ingenieursentscheidung.* Untertitel 2: *Delivery
Readiness: Der Branch liegt auf origin, der Pull Request ist vorbereitet. Neun Phasen,
drei Entscheidungen, eine Kette, und nichts wurde zweimal gerechnet.* Kurz: ja.

### Akt 3 · Das Ergebnis

**K18 · Änderungen.** Bild: Seite Änderungen: SaeumnisRechner.java geändert,
SaeumnisRechnerTest.java neu, ein e2e-Spec neu, je mit Phase und Diff; Zoom auf die
Abrundung. Untertitel: *Das Ergebnis ist kein Chat. Es ist ein Branch mit Diff, Tests und
Bericht: im Werkzeug lesbar, im Editor weiterführbar.* Kurz: ja.

**K19 · GitHub.** Bild: Vergleich main gegen codegen/STROM-4 im Erhebungsdienst, zwei
Dateien; im Prüfpaket ein Test. Untertitel: *Auf origin: zwei Dateien im Erhebungsdienst,
ein Test im Prüfpaket. Nachvollziehbar bis zur Zeile, prüfbar wie jede andere Änderung.*
Kurz: ja.

**K20 · Verlauf.** Bild: Verlauf mit den verketteten Läufen: der Lauf des Videos, seine
drei Fortsetzungen, die Wartepunkte, die Dauern in Sekunden; darunter die Kette vom
15. September mit ihren Minuten. Untertitel: *Der Verlauf hält die Kette: jeder Lauf, jede
Entscheidung, jede Dauer. Einmal gerechnet, heute in Sekunden übernommen.* Kurz: ja.

**K21 · Die zweite Welt.** Bild: http://localhost:8095, Anmeldung, Kopfband *main +
codegen/STROM-4*, Seite Stand: der Erhebungsdienst aus dem Branch, die anderen Dienste
unverändert; Rückforderungen: Ostsee Werft 372,00 €; Vorgang, Zahlungen: 372,00 €.
Untertitel 1: *Dieselbe Anwendung, der Erhebungsdienst aus dem gelieferten Branch gebaut.
Das Kopfband sagt es: main + codegen/STROM-4.* Untertitel 2: *Vorher 373,80 €. Nachher
372,00 €. Gleiche Daten, andere Regel.* Kurz: ja.

**K22 · Schlusskarte.** *Die KI schlägt vor. Der Nachweis prüft. Der Mensch entscheidet –
und trägt die Verantwortung.* Danach: *Der Ansatz ist übertragbar. Die Erfahrung liegt
vor.* Kurz: ja.

**Laufzeit.** Der Lauf selbst braucht Sekunden je Abschnitt; die Zeit geht in die
Erklärungen. Akt 1 etwa 3 Minuten, Akt 2 etwa 9, Akt 3 etwa 3. Rohmaterial etwa
15 Minuten, kein Zeitraffer nötig.

---

## 4 · Wiederverwendung: was gezeigt und gesagt wird

Vier Stellen tragen das Thema. In K7 die Einstellung *Wiederverwendung fertiger Arbeit*
mit ihrem Hinweistext. In K10 die fünf Phasen, die in Sekunden *aktuell* stehen, und der
Log-Satz, der nennt, seit wann die Eingaben unverändert sind. In K13, K14 und K17 die
Fortsetzungen: Nach jeder Entscheidung läuft die Kette weiter, und wieder steht jede
Phase in Sekunden. In K20 der Verlauf: die Kette vom 15. September in Minuten, der Lauf
des Videos in Sekunden.

Der Satz, der das Prinzip trägt: *Was sich nicht geändert hat, wird nicht neu gerechnet.
Ändert sich der Bestand, rechnet das Werkzeug genau das neu, und zu jedem Ergebnis steht,
aus welchen Eingaben es stammt.* Das ist Folie 100 in einem Satz: Das Wissen liegt im
Bestand, nicht bei Personen.

Die Regel gilt auch für Entscheidungen: Eine Auflage im Kommentar wäre eine neue Eingabe
für Plan und Umsetzung, und genau diese Phasen rechneten neu. Deshalb gibt das Video ohne
Kommentar frei; die Entscheidung selbst ist das, was zählt.

Der Plattform-Modus gehört daneben: *SovAI* rechnet auf der konfigurierten Plattform,
*Offline* auf der lokalen Plattform dieses Rechners, *Automatisch* nimmt SovAI, wenn es
antwortet, sonst lokal. Entschieden wird einmal am Start eines Laufs, nie mittendrin.

---

## 5 · Produktionsplan

| Schritt | Inhalt | Prüfpunkt |
| --- | --- | --- |
| 1 Sicherung | Stand vom 15. September mit `scripts/sicherung.sh save` sichern | `list` zeigt den Stand; Probe-Restore an einer Wegwerfkopie bestanden |
| 2 Stichtag | beide Welten mit `STROMENTLASTUNG_HEUTE=2026-09-08` starten | API :8090 sechs Monate, 37380 Cent; :8095 37200 Cent |
| 3 Spec | `video/` als eigenes Playwright-Projekt: `package.json`, `playwright.config.ts` (chromium 1920×1080, Video an), `drehbuch.spec.ts`, `texte.ts` (alle Texte), `overlays.ts`, `timeline.json` mit Kapitelmarken; URLs und Konten aus der Umgebung | Trockenlauf mit stehenden Entscheidungen: jede Seite erreicht, jedes Overlay sichtbar, Videodatei entsteht |
| 4 Reuse mit Wartepunkten | Entscheidungsdateien entfernen, Full Pipeline starten, dreimal ohne Kommentar freigeben und fortsetzen | alle neun Phasen *aktuell*, drei Halte, keine Phase gerechnet, Branch-Stände unverändert |
| 5 Jira-Sitzung | einmalige Anmeldung durch den Vorführenden, Sitzungsdatei für den Spec | der Spec öffnet STROM-4 ohne Anmeldemaske |
| 6 Generalprobe | Ausgangszustand aus Abschnitt 2, volle Aufnahme, etwa 15 Minuten | Video vollständig; Kapitelmarken vorhanden; Fehlerliste geschrieben |
| 7 Korrekturen | Fehler beheben, Ausgangszustand erneut, finale Aufnahme | wie 6, ohne Fehlerliste |
| 8 Schnitt | Langfassung mit Kapitelkarten, Kurzfassung nach den Kurz-Markierungen, Untertitel eingebrannt, MP4 1080p | beide Dateien liegen unter `video/out/` |
| 9 Abnahme | beide Fassungen dem Vorführenden zeigen | Freigabe |

Die drei Freigaben klickt der Spec, ohne Kommentar, damit die Aufnahme ohne Eingriff
durchläuft. Will der Vorführende live klicken, bekommt er einen Stichwortzettel mit den
drei Stellen und dem Hinweis, keinen Kommentar zu schreiben.

---

## 6 · Soll-Zustand am Ende (Abnahme)

- [ ] Beide Fassungen liegen unter `video/out/` vor, 1920×1080, Untertitel eingebrannt, Oberfläche auf Deutsch.
- [ ] Alle Kapitel aus Abschnitt 3 sind im Bild, in dieser Reihenfolge; die Kurzfassung enthält die mit *Kurz: ja* markierten.
- [ ] Der Lauf im Video: neun Phasen *aktuell*, keine gerechnet, drei Halte an den Wartepunkten, drei Freigaben ohne Kommentar, drei Fortsetzungen, am Ende ein Stepper mit allen neun Phasen.
- [ ] Die Zahlen: 373,80 € vorher auf :8090, 372,00 € nachher auf :8095; Kopfband *main* bzw. *main + codegen/STROM-4*.
- [ ] Der Branch liegt auf origin mit denselben Ständen wie vor der Aufnahme; der Vergleich zeigt zwei Dateien im Erhebungsdienst und einen Test im Prüfpaket.
- [ ] Jeder Untertitel steht so im Drehbuch; die Begriffe der Folien kommen vor.
- [ ] Der gesicherte Stand vom 15. September ist unverändert; die Entscheidungen des Videos liegen als neue Dateien vor.
- [ ] Alles Material liegt in `stromentlastung-demo/video/`; nichts im Produkt, nichts in einem registrierten Quell-Repository.

---

## 7 · Offene Punkte

- Go für den Wortlaut der Untertitel und Karten.
- Jira-Sitzung: einmalige Anmeldung.
- Freigaben im Video: der Spec (Vorschlag) oder der Vorführende live.
- Länge der Kurzfassung.
- Die Wartepunkt-Zeile im Stepper heißt *teilweise*; ein eigener Zustand *wartet auf Freigabe* ist eine Produktentscheidung.
