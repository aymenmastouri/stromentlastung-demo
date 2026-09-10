# Anleitung für die Vorführung

Referenzverfahren `stromentlastung` und SDLC Pilot. Diese Anleitung enthält alles, was für
eine Vorführung gebraucht wird: die Fachlichkeit zum Sprechen, die Zugänge, jeden Schritt
mit der genauen Seite und Tabelle, die zu erwartenden Fragen und die Fehlersuche.

Aufbau der Vorführung: **die Anwendung mit dem Mangel, der Lauf des Werkzeugs, die Anwendung
mit der gelieferten Änderung.** Zwei Durchgänge stehen bereit, ein Fehler und eine
Gesetzesänderung.

---

## 1 · Die Fachlichkeit, in fünf Sätzen

Strom ist mit 20,50 Euro je Megawattstunde besteuert. Unternehmen des Produzierenden
Gewerbes und der Land- und Forstwirtschaft bekommen davon einen Teil zurück, wenn sie den
Strom für betriebliche Zwecke entnommen haben; das ist die Steuerentlastung nach § 9b
Stromsteuergesetz. Beantragt wird sie beim Hauptzollamt, für ein Kalenderjahr, das
Entnahmejahr; der Antragsteller rechnet selbst, das Hauptzollamt rechnet nach und setzt
fest. Stellt sich später heraus, dass zu viel ausgezahlt wurde, etwa nach einer
Außenprüfung, ergeht ein Änderungsbescheid und der Unterschiedsbetrag wird zurückgefordert.
Zahlt das Unternehmen den zurückgeforderten Betrag nicht bis zur Fälligkeit, entstehen
Säumniszuschläge.

Diese fünf Sätze reichen dem Publikum. Alles Weitere steht im
[Fachkonzept](fachkonzept.md), das jede Regel mit ihrer Fundstelle nennt.

Das Verfahren ist nachgebaut und bewusst vereinfacht. Es ist kein Verfahren der
Zollverwaltung. Die Anwendung sagt das in jeder Ansicht im Kopfband: *Referenzverfahren –
kein Echtbetrieb.* Diesen Satz einmal am Anfang aussprechen, danach die Anwendung nie wieder
verteidigen.

Im selben Kopfband steht rechts daneben, auf welchem Quellzweig die Dienste laufen. Auf
`main` steht dort **main**, in der zweiten Welt **main + codegen/STROM-4**. Damit ist auf
jeder Seite und auf jedem Foto vom Beamer zu erkennen, welche der beiden Welten zu sehen
ist. Die Angabe kommt aus den Meldungen der Dienste selbst; ein Klick darauf führt zur
Seite **Stand** mit allen Einzelheiten.

---

## 2 · Durchgang eins: der Fehler, Ticket STROM-4

### Der Fehler, fachlich erklärt

Der Säumniszuschlag beträgt für jeden angefangenen Monat der Säumnis ein Prozent des
rückständigen Betrags. Entscheidend ist ein Zwischenschritt, den § 240 Absatz 1 Satz 1 der
Abgabenordnung vorschreibt: **der rückständige Betrag wird vorher auf den nächsten durch 50
Euro teilbaren Betrag abgerundet.** Diese Abrundung wirkt immer zugunsten des Schuldners.

Die Anwendung überspringt diesen Schritt und rechnet ein Prozent vom ungerundeten Betrag.

| | Bemessungsgrundlage | je Monat | nach sechs Monaten |
| --- | --- | --- | --- |
| Anwendung | 6.230,00 € | 62,30 € | **373,80 €** |
| Gesetz | 6.200,00 € | 62,00 € | **372,00 €** |

Der Unterschied beträgt 1,80 Euro. Er ist klein, aber die Behörde erhebt damit mehr, als das
Gesetz erlaubt, und zwar bei jeder Rückforderung, deren Betrag nicht glatt durch 50 teilbar
ist. In einem Fachverfahren ist das keine Ungenauigkeit, sondern eine Rechtsverletzung.

### Woran ein Sachbearbeiter das merkt

Drei Wege, und der erste ist der, den man im Raum sagt.

**Die Zahl kann nicht stimmen.** Ein Säumniszuschlag ist ein Prozent eines Betrags, der
durch 50 teilbar ist. Er ist deshalb immer ein Vielfaches von 50 Cent: 62,00 oder 62,50 oder
63,00. *Ein Säumniszuschlag endet nie auf 80 Cent.* Das sieht ein erfahrener Sachbearbeiter
so, wie man ein Datum „31. Februar" sieht.

**Der Betroffene rechnet nach.** In der Praxis kommt so ein Fehler meist über den Einspruch.
Die 50-Euro-Abrundung ist Standardhandwerk jedes Steuerberaters.

**Der Prüfdienst vergleicht.** Regel R-13 des Fachkonzepts rechnet genau diesen Fall vor.
Wer die Anwendung danebenlegt, sieht die Abweichung.

### Was der Fehler nicht ist

Kein Datenfehler: die gespeicherte Rückforderung von 6.230,00 Euro ist richtig. Kein
Anzeigefehler: die Oberfläche zeigt genau das, was der Dienst liefert. Kein Zählfehler: sechs
angefangene Monate sind korrekt. Der Fehler steckt in der Rechenregel, und deshalb braucht es
eine Codeänderung und keine Datenkorrektur.

### Was gezeigt wird

| | vor der Änderung | nach der Änderung |
| --- | --- | --- |
| Säumniszuschlag der Ostsee Werft | 373,80 € | 372,00 € |

---

## 3 · Durchgang zwei: die Gesetzesänderung, Ticket STROM-2

### Die Änderung, fachlich erklärt

Die Entlastung betrug lange 5,13 Euro je Megawattstunde. Mit dem Strompreispaket wurde sie
für Strom, der 2024 und 2025 entnommen wurde, auf 20 Euro angehoben, befristet, geregelt in
einem eigenen Absatz 2a. Diese Befristung ist mit dem Dritten Gesetz zur Änderung des
Energiesteuer- und des Stromsteuergesetzes entfallen: seit dem 1. Januar 2026 stehen die 20
Euro dauerhaft im Absatz 2, und Absatz 2a ist gestrichen.

Das Verfahren steht auf dem Rechtsstand 31. Dezember 2025 und rechnet für Entnahmejahre ab
2026 deshalb noch mit 5,13 Euro.

### Warum das kein Suchen-und-Ersetzen ist

Der anzuwendende Satz hängt am **Entnahmejahr**, nicht am Antragsdatum. Ein Antrag, der 2027
für das Entnahmejahr 2025 gestellt wird, rechnet weiter mit dem Recht von 2025. Wer die
Zahl einfach überall austauscht, ändert damit auch die Vergangenheit und produziert falsche
Bescheide für abgeschlossene Jahre.

Genau das ist der Prüfstein dieses Durchgangs, und deshalb gehören zwei Vorgänge auf den
Schirm, nicht einer.

### Was gezeigt wird

| | vor der Änderung | nach der Änderung |
| --- | --- | --- |
| Weserland Kunststoffe, Entwurf für 2026 | 5,13 €/MWh, festzusetzen **3.341,00 €** | 20,00 €/MWh, festzusetzen **13.750,00 €** |
| Ostsee Werft, Entnahmejahr 2024 | 20,00 €/MWh, zitiert § 9b Abs. 2a | **unverändert** |

Die zweite Zeile trägt den Durchgang. Dass das alte Jahr stehen bleibt und weiterhin die
alte Fundstelle nennt, kann nur eine Änderung leisten, die den zeitlichen Geltungsbereich
verstanden hat.

**Stand:** Dieser Durchgang braucht noch einen Lauf der Kette. Die Zahlen oben sind
nachgerechnet, die Anwendung zeigt heute die linke Spalte.

---

## 4 · Vorbereitung

### Voraussetzungen

Docker läuft, und es hat Platz. Hier werden mehrere Gigabyte an Abbildern gebaut; eine volle
Platte zeigt sich darin, dass Keycloak nicht startet.

```bash
docker system df
```

### Starten

Ein Befehl nimmt das Ticket und macht den Rest. Er holt den gelieferten Branch, ermittelt,
welche Repositories er tatsächlich berührt hat, baut genau diese ein zweites Mal und stellt
einen zweiten Eingang davor.

```bash
cd ~/stromentlastung/stromentlastung-platform
./scripts/demo.sh up STROM-4
```

Der erste Lauf dauert einige Minuten, weil die Dienste in den Abbildern übersetzt werden.
Danach greift der Zwischenspeicher. Das Skript meldet je Repository, ob es abweicht, und
warnt, wenn der Branch noch nicht auf dem Server liegt.

Warten, bis alles antwortet; Keycloak braucht am längsten:

```bash
until curl -fsS -o /dev/null http://localhost:9091/realms/stromentlastung \
   && curl -fsS -o /dev/null http://localhost:8090/api/unternehmen/v3/api-docs \
   && curl -fsS -o /dev/null http://localhost:8095/ \
   && curl -fsS -o /dev/null http://localhost:8090/; do sleep 3; done; echo bereit
```

### Die zwei Adressen

| Adresse | Welt |
| --- | --- |
| http://localhost:8090 | die Anwendung, wie sie auf `main` steht |
| http://localhost:8095 | dieselbe Anwendung mit dem gelieferten Branch |

Doppelt vorhanden ist nur, was der Branch berührt hat. Bei STROM-4 ist das allein die
Erhebung; Register, Vorgang, Bescheide und Oberfläche sind in beiden Welten derselbe
Container. Jeder verdoppelte Dienst führt seine eigene Datenbank mit derselben Saat. Das ist
die Aussage für den Raum: **gleiche Daten, andere Regel.**

### Die Zugänge

Passwort überall `stromentlastung`.

| Konto | Rolle | Wofür in der Vorführung |
| --- | --- | --- |
| `mastouri@stromentlastung.dev` | Sachbearbeitung und Zeichnung, Hauptzollamt Nord | Durchgang eins, alle Ansichten der Dienststelle |
| `weserland@stromentlastung.dev` | Unternehmen Weserland Kunststoffe | Durchgang zwei, der Entwurf für 2026 |
| `wagner@`, `demir@` | Sachbearbeitung Nord | weitere Bearbeiter |
| `becker@` | Zeichnung Nord | Freigabe im Vier-Augen-Prinzip |
| `roth@` | Prüfdienst | Prüfvermerk und Änderung |
| `ostsee-werft@` | Unternehmen mit der offenen Rückforderung | Sicht des Betroffenen |

Vollständige Liste im [README](../README.md).

### Was vorher zu prüfen ist

Vor der Vorführung einmal beide Adressen öffnen, in beiden anmelden und die Zahl ansehen.
Der schnelle Weg ohne Browser:

```bash
./scripts/demo.sh status
```

Die letzten zwei Zeilen zeigen den Säumniszuschlag hinter beiden Eingängen, in Cent.

---

## 5 · Akt eins: die Anwendung mit dem Mangel

**Adresse:** http://localhost:8090
**Anmeldung:** `mastouri@stromentlastung.dev`

1. Im Kopfmenü **Rückforderungen** wählen.
2. Die Tabelle **Offene Rückforderungen** hat eine Zeile. Spalten von links nach rechts:
   Aktenzeichen, Unternehmen, Rückforderung, Fälligkeit, Rückständig, Angefangene Monate,
   Säumniszuschlag.
3. Zu zeigen ist die letzte Spalte: **373,80 €**, bei sechs angefangenen Monaten und einer
   Rückforderung von 6.230,00 Euro.

Zu sagen: der Fall ist eine Werft, bei der die Außenprüfung festgestellt hat, dass Strom für
Ladepunkte nicht abgezogen war. Der Änderungsbescheid fordert 6.230,00 Euro zurück, fällig
am 13. März 2026, seither unbezahlt. Und dann der Satz, der den Akt trägt: *ein
Säumniszuschlag ist ein Prozent eines durch 50 teilbaren Betrags, er endet nie auf 80 Cent.*

### Wenn das Publikum mehr sehen will

**Der Vorgang.** Das Aktenzeichen `HZA-N-9b-2024-000002` anklicken. Die Seite hat Karten in
dieser Reihenfolge: Handlungen, Strommengen, Fristen, Berechnungsprotokoll, Nachweise,
Bescheide, Zahlungen, Vorgangsprotokoll. In der Karte **Zahlungen** steht unten die
Rückforderung mit Bemessungsgrundlage, angefangenen Monaten und Zuschlag. Das
**Vorgangsprotokoll** ganz unten erzählt den ganzen Fall von der Antragstellung 2025 über
Bescheid, Auszahlung, Außenprüfung und Änderungsbescheid bis zur Übernahme durch dich.

**Die Daten.** Wer wissen will, ob die Daten falsch sind: die gespeicherte Rückforderung
beträgt 6.230,00 Euro und ist richtig. Der Säumniszuschlag steht überhaupt nicht in der
Datenbank, er wird bei jedem Lesen berechnet. *Die Daten waren nie falsch. Die Regel war es.*
Wer das in der Datenbank selbst zeigen will, findet die Abfragen in Abschnitt 5a.

**Welcher Stand läuft.** Im Menü **Stand**. Die Tabelle nennt je Dienst Fassung, Quellzweig,
Quellstand und Bauzeitpunkt. Hier stehen alle vier auf `main`, und die Zeile darüber sagt
das ausdrücklich. Das ist der ehrliche Ausgangspunkt.

---

## 5a · Der Blick in die Datenbank

Dieser Abschnitt ist der stärkste Beleg dafür, dass es sich um einen Regelfehler handelt und
nicht um verdorbene Daten. Er ist optional; wer ihn zeigt, sollte die drei Abfragen vorher
einmal selbst abgesetzt haben.

### Zugang

Jeder Dienst bringt eine Datenbank-Konsole mit, erreichbar unter seinem eigenen Port. Die
Ports hören nur auf dem eigenen Rechner.

| Datenbank | Welt | Adresse |
| --- | --- | --- |
| Unternehmensregister | beide | http://localhost:8091/api/unternehmen/h2-console |
| Vorgang | beide | http://localhost:8092/api/antraege/h2-console |
| Bescheide | beide | http://localhost:8093/api/bescheide/h2-console |
| Erhebung, `main` | vorher | http://localhost:8094/api/zahlungen/h2-console |
| Erhebung, Branch | nachher | http://localhost:8194/api/zahlungen/h2-console |

Verdoppelte Dienste sind nach außen um 100 versetzt; `demo.sh up` nennt die Ports beim
Start. In der Anmeldemaske einzutragen:

| Feld | Wert |
| --- | --- |
| JDBC URL | `jdbc:h2:file:/app/data/zahlung;AUTO_SERVER=TRUE` |
| User Name | `sa` |
| Password | leer lassen |

Der Dateiname am Ende der URL ist der Name des Dienstes: `unternehmen`, `antrag`,
`bescheid` oder `zahlung`. Dann **Connect**.

### Was in welcher Datenbank steht

| Dienst | Tabellen |
| --- | --- |
| Unternehmensregister | `HAUPTZOLLAMT`, `UNTERNEHMEN`, `ZUORDNUNG` |
| Vorgang | `ANTRAG`, `NACHWEIS`, `VORGANGSEREIGNIS` |
| Bescheide | `BESCHEID` |
| Erhebung | `ZAHLUNG`, `RUECKFORDERUNG` |

### Abfrage eins: die Rückforderung, in beiden Welten dieselbe

In der Erhebung auf Port 8094 und danach auf Port 8194:

```sql
SELECT AKTENZEICHEN, BETRAG_CENT, FAELLIGKEIT, ZUSTAND, SAEUMNISZUSCHLAG_FESTGESETZT_CENT
FROM RUECKFORDERUNG;
```

Beide Male dieselbe Zeile: `HZA-N-9b-2024-000002`, 623000 Cent, fällig am 13. März 2026,
Zustand `OFFEN`, und in der letzten Spalte **null**.

Das ist die Pointe. Der Säumniszuschlag steht in keiner der beiden Datenbanken. Er wird bei
jedem Lesen berechnet, weil er mit jedem Tag wächst. Gespeichert wird er erst, wenn die
Rückforderung beglichen ist; bis dahin gibt es nichts zu speichern und nichts zu
korrigieren. **Die Daten waren nie falsch, in keiner der beiden Welten. Die Regel war es.**

### Abfrage zwei: das Vorgangsprotokoll lässt sich nicht ändern

Im Vorgang auf Port 8092:

```sql
UPDATE VORGANGSEREIGNIS SET BEMERKUNG = 'manipuliert' WHERE ID = 1;
```

Die Datenbank lehnt ab: *Vorgangsereignisse sind unveränderlich: weder Änderung noch
Löschung zulässig.* Der Schutz sitzt in der Datenbank, nicht in der Anwendung, und gilt
deshalb auch für den, der mit einem Werkzeug daran vorbeigeht. Dasselbe gilt für `DELETE`.

Das ist die Revisionssicherheit, die ein Fachverfahren braucht, und sie lässt sich in zehn
Sekunden vorführen.

### Abfrage drei: der Vorgang von vorn bis hinten

Ebenfalls im Vorgang:

```sql
SELECT ZEITPUNKT, AKTEUR, ROLLE, ART, ZUSTAND_VORHER, ZUSTAND_NACHHER, BEMERKUNG
FROM VORGANGSEREIGNIS
WHERE AKTENZEICHEN = 'HZA-N-9b-2024-000002'
ORDER BY ZEITPUNKT;
```

Elf Zeilen von der Antragstellung im März 2025 über Bescheid, Auszahlung, Prüfvermerk der
Außenprüfung, Änderungsbescheid bis zur Übernahme der Bearbeitung. Wer wissen will, wer
wann was entschieden hat, liest es hier.

---

## 6 · Akt zwei: der Lauf

Gezeigt in der Desktop-Anwendung von SDLC Pilot, Ticket STROM-4 im Projekt
`stromentlastung@main`.

Die Kette liest das Ticket, findet § 240 der Abgabenordnung und Regel R-13 des
Fachkonzepts, plant die Änderung, bearbeitet den Code, führt die Tests aus und hält vor der
Lieferung an, weil ein Mensch entscheiden muss. Dieses Halten ist der Kern des Akts: **das
Werkzeug bereitet vor, ein Mensch entscheidet.**

Zum Nachschlagen während der Vorführung, was der Lauf hervorgebracht hat:

| | |
| --- | --- |
| Branch | `codegen/STROM-4` |
| Berührte Repositories | `stromentlastung-zahlung` und `stromentlastung-e2e` |
| Änderung | ein Abrundungsschritt im Säumnisrechner, auf allen drei Rückgabepfaden angewandt |
| Ergänzte Tests | ein Test für einen nicht durch 50 teilbaren Betrag, ein Playwright-Fall |
| Prüfung | ausgeführt, bestanden, Rückgabewert 0 |

---

## 7 · Akt drei: die Anwendung mit der Änderung

**Adresse:** http://localhost:8095
**Anmeldung:** dieselbe

1. Im Kopfmenü **Rückforderungen** wählen.
2. Dieselbe Zeile, dieselben sechs Monate, dieselbe Rückforderung von 6.230,00 Euro.
3. In der letzten Spalte steht **372,00 €**.

Zwei Browser-Fenster nebeneinander machen den Punkt ohne ein weiteres Wort.

**Der Beweis, dass wirklich ein anderer Stand läuft:** oben im Kopfband steht jetzt
**main + codegen/STROM-4** statt **main**. Wer es genauer will: im Menü **Stand**. Auf 8090 meldet
jeder Dienst `main`; auf 8095 meldet die Erhebung `codegen/STROM-4` und ihren Commit, und
die Zeile darüber sagt, dass die Dienste nicht mehr alle auf demselben Quellzweig laufen.
Diese Angaben stammen aus dem Bau der Abbilder, nicht aus einer Einstellung; sie lassen sich
im Betrieb nicht anders behaupten.

**Der Code, für die, die ihn sehen wollen:**
https://github.com/aymenmastouri/stromentlastung-zahlung/compare/main...codegen/STROM-4

---

## 8 · Fragen, die kommen werden

**„Das ist doch nur eine Zeile."** Richtig, und das ist der Punkt. Ein Fix, der mehr ändert
als nötig, wäre der schlechtere Fix. Interessant ist nicht die Zeile, sondern der Weg
dorthin: aus „falscher Betrag" auf die Fundstelle im Gesetz, von dort auf die Stelle im
Code, dazu ein Test, der den Fehler künftig verhindert, und der Nachweis, dass die
vorhandenen Tests grün bleiben.

**„Woher weiß ich, dass da wirklich ein anderer Stand läuft?"** Das Kopfband nennt den
Quellzweig auf jeder Seite, und das Menü **Stand** zeigt ihn je Dienst mit Commit und
Bauzeitpunkt. Die Angaben kommen aus dem Bau der Abbilder, nicht aus einer Einstellung.

**„Kann das auch Neues bauen, nicht nur reparieren?"** Ja, und das ist der zweite Durchgang:
eine Gesetzesänderung, die durch drei Repositories wandert und dabei die alten Entnahmejahre
unangetastet lässt.

**„Was, wenn das Werkzeug falsch liegt?"** Dann liefert es nichts aus. Die Kette hält vor
der Lieferung an, ein Mensch entscheidet, und die Prüfung läuft davor. Im Zweifel steht am
Ende ein Branch, den ein Entwickler liest wie den eines Kollegen.

**„Sind das Ihre echten Verfahren?"** Nein. Das Verfahren ist nachgebaut und bewusst
vereinfacht, gebaut aus öffentlich zugänglichen Rechtstexten. Gezeigt wird nicht das
Verfahren, sondern was das Werkzeug damit macht.

**„Wie lange hat das gedauert?"** Die Zahlen zum Lauf stehen in der Desktop-Anwendung; sie
werden hier nicht aus dem Gedächtnis genannt.

---

## 9 · Aufräumen

Beide Welten anhalten, Daten behalten, damit eine zweite Vorführung dort weitermacht:

```bash
./scripts/demo.sh down
```

Zurück auf den gesäten Ausgangszustand, Datenbanken und erzeugte Konfiguration weg:

```bash
./scripts/demo.sh reset
```

Nach `reset` ist die nächste Vorführung wieder in dem Zustand, den diese Anleitung
beschreibt.

---

## 10 · Wenn etwas schiefgeht

**Eine Seite antwortet mit 502.** Ein Dienst wurde neu gestartet. Beide Eingänge schlagen
ihre Ziele bei jeder Anfrage neu nach, das sollte also nicht vorkommen; wenn doch:
`docker compose -p stromentlastung restart gateway gateway-fixed`.

**Die Anmeldung schlägt fehl.** Der Realm wird nur beim ersten Start eingespielt. Keycloak
neu erzeugen: `docker compose -p stromentlastung up -d --force-recreate keycloak`.

**Beide Welten zeigen dieselbe Zahl.** `./scripts/demo.sh status` zeigt, welche Dienste
doppelt vorhanden sind und was hinter beiden Eingängen herauskommt.

**Keycloak startet nicht, im Protokoll steht „no space left on device".** Die Platte der
Docker-Maschine ist voll. Den Bau-Zwischenspeicher freigeben ist immer unkritisch und meist
genug: `docker builder prune -f`, danach Keycloak neu erzeugen.

**Ein Port ist belegt.** Möglicherweise läuft noch der Entwicklungsbetrieb aus
`scripts/stromentlastung.sh`. Mit `scripts/stromentlastung.sh stop` beenden. Beide Aufbauten
führen getrennte Datenbanken und dürfen nicht gleichzeitig laufen.

**Das Skript sagt, kein Repository weiche ab.** Der Branch existiert, hat aber nichts
geändert, was in einem Container läuft, etwa nur Dokumentation oder Tests. Dann gibt es
nichts zu vergleichen.

---

## 11 · Alle Verweise

**Adressen im Betrieb**

| | |
| --- | --- |
| Anwendung auf `main` | http://localhost:8090 |
| Anwendung mit dem Branch | http://localhost:8095 |
| Keycloak | http://localhost:9091 (Verwaltung `admin` / `admin`) |
| Datenbank der Erhebung, `main` | http://localhost:8094/api/zahlungen/h2-console |
| Datenbank der Erhebung, Branch | http://localhost:8194/api/zahlungen/h2-console |
| Datenbank des Vorgangs | http://localhost:8092/api/antraege/h2-console |

**Tickets in Jira**

| | |
| --- | --- |
| Epic | https://sdlcpilot-demo.atlassian.net/browse/STROM-1 |
| Entfristung, Durchgang zwei | https://sdlcpilot-demo.atlassian.net/browse/STROM-2 |
| Fristenmonitor im Portal | https://sdlcpilot-demo.atlassian.net/browse/STROM-3 |
| Säumniszuschlag, Durchgang eins | https://sdlcpilot-demo.atlassian.net/browse/STROM-4 |
| Aktualisierung Spring Boot | https://sdlcpilot-demo.atlassian.net/browse/STROM-5 |
| Fristenmonitor in der Fachanwendung | https://sdlcpilot-demo.atlassian.net/browse/STROM-6 |
| Vorgangsbrett | https://sdlcpilot-demo.atlassian.net/jira/software/projects/STROM/boards/34 |

**Repositories**

| | |
| --- | --- |
| Plattform, Fachkonzept, Fahrstand | https://github.com/aymenmastouri/stromentlastung-platform |
| Unternehmensregister | https://github.com/aymenmastouri/stromentlastung-unternehmen |
| Vorgang | https://github.com/aymenmastouri/stromentlastung-antrag |
| Bescheide | https://github.com/aymenmastouri/stromentlastung-bescheid |
| Erhebung | https://github.com/aymenmastouri/stromentlastung-zahlung |
| Oberfläche | https://github.com/aymenmastouri/stromentlastung-ui |
| Ende-zu-Ende-Tests | https://github.com/aymenmastouri/stromentlastung-e2e |

**Dokumente**

| | |
| --- | --- |
| Fachkonzept, jede Regel mit Fundstelle | [docs/fachkonzept.md](fachkonzept.md) |
| Architektur und Bauplan | [docs/architektur.md](architektur.md) |
| Betrieb, Konten, Datenbanken | [README](../README.md) |

**Rechtstexte**

| | |
| --- | --- |
| § 9b Stromsteuergesetz | https://www.gesetze-im-internet.de/stromstg/__9b.html |
| § 240 Abgabenordnung, Säumniszuschläge | https://www.gesetze-im-internet.de/ao_1977/__240.html |
| § 17b Stromsteuer-Durchführungsverordnung | https://www.gesetze-im-internet.de/stromstv/__17b.html |
