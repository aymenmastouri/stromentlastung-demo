/**
 * Alle Karten und Untertitel des Vorführvideos, Wortlaut aus video/drehbuch.md
 * (Fassung 2, Abschnitt 3). Eine Änderung am Wortlaut ist eine Änderung hier;
 * der Spec kennt nur Kapitel und Schlüssel.
 *
 * Schlüssel: a, b, c … in der Reihenfolge, in der die Texte im Kapitel
 * erscheinen. `karte` ist der Text einer Vollbildkarte, `text` sind die
 * Untertitel. `kurz` markiert, ob das Kapitel in die Kurzfassung kommt.
 */

export type Akt = 1 | 2 | 3;

export interface Kapitel {
  nr: number;
  akt: Akt;
  titel: string;
  kurz: boolean;
  /** Zeilen einer Vollbildkarte, falls das Kapitel eine trägt. */
  karte?: readonly string[];
  /** Untertitel in Reihenfolge. */
  text: Readonly<Record<string, string>>;
}

export const AKTE: Readonly<Record<Akt, string>> = {
  1: "Der Auftrag",
  2: "Der Lauf",
  3: "Das Ergebnis",
};

/** Die Botschaft, Titel der Folie. */
export const TITEL = {
  haupt: "Von der Anforderung bis zur Auslieferung",
  neben: "ein durchgängiger, gesteuerter, nachweisbarer Prozess.",
} as const;

export const KAPITEL = {
  K1: {
    nr: 1,
    akt: 1,
    titel: "Titelkarte",
    kurz: true,
    karte: ["Ein Fachverfahren. Ein Ticket. Eine Kette bis zum Branch."],
    text: {},
  },
  K2: {
    nr: 2,
    akt: 1,
    titel: "Das Verfahren",
    kurz: true,
    karte: [
      "Strom ist besteuert.",
      "Unternehmen des Produzierenden Gewerbes bekommen einen Teil zurück: die Steuerentlastung nach § 9b Stromsteuergesetz, beantragt beim Hauptzollamt für ein Entnahmejahr.",
      "Wurde zu viel ausgezahlt, ergeht ein Änderungsbescheid, und der Unterschied wird zurückgefordert.",
      "Wer die Rückforderung nicht bis zur Fälligkeit zahlt, schuldet Säumniszuschläge.",
    ],
    text: {
      a: "Das Referenzverfahren ist nachgebaut und vereinfacht: von KI allein aus öffentlichen Quellen erstellt. Kein Verfahren der Zollverwaltung, kein Bezug zu einem Kundenprojekt von Capgemini.",
    },
  },
  K3: {
    nr: 3,
    akt: 1,
    titel: "Anmeldung und Vorgänge",
    kurz: true,
    text: {
      a: "Die Sachbearbeitung der Dienststelle meldet sich an. Das Kopfband nennt den Stand, auf dem die Dienste laufen: main.",
      b: "Die Dienststelle führt ihre Vorgänge in einer Liste: Aktenzeichen, Unternehmen, Entnahmejahr, Zustand und festgesetzter Betrag, filterbar nach Zustand. Der Fall von gleich ist einer von vielen.",
    },
  },
  K4: {
    nr: 4,
    akt: 1,
    titel: "Rückforderungen",
    kurz: true,
    text: {
      a: "Eine offene Rückforderung: 6.230,00 €, fällig im März, seit sechs angefangenen Monaten säumig — gerechnet auf den Tag, den das Ticket nennt. Säumniszuschlag: 373,80 €.",
      b: "Die Zahl kann nicht stimmen. Ein Säumniszuschlag ist ein Prozent je Monat von einem Betrag, der vorher auf volle 50 Euro abgerundet wird. Er endet nie auf 80 Cent.",
    },
  },
  K5: {
    nr: 5,
    akt: 1,
    titel: "Vorgang",
    kurz: false,
    text: {
      a: "Im Vorgang unter Zahlungen steht derselbe Betrag. Mehr weiß die Sachbearbeitung nicht, und mehr muss sie nicht wissen: Sie meldet, was sie sieht.",
    },
  },
  K6: {
    nr: 6,
    akt: 1,
    titel: "Das Ticket im Browser",
    kurz: true,
    text: {
      a: "Die Meldung wird zum Auftrag: ein Ticket, wie das Team es immer schreibt — Anwendungsfall, beobachteter Betrag, die Vorschrift, Akzeptanzkriterien. Kein Prompt.",
      b: "Was hier steht: ein Betrag und eine Norm. Was hier nicht steht: wo der Fehler sitzt und wie hoch er ist. Genau das ist gleich die Arbeit.",
    },
  },
  K7: {
    nr: 7,
    akt: 2,
    titel: "Einstellungen",
    kurz: true,
    text: {
      a: "Eigene Daten. Eigene Regeln. Eigene KI. Der Plattform-Modus wird einmal am Start des Laufs entschieden: SovAI, die souveräne Plattform von Capgemini. Offline wäre die lokale Plattform auf diesem Rechner, mit denselben Regeln.",
      b: "Wiederverwendung fertiger Arbeit: Arbeit, deren Eingaben seit dem letzten Lauf unverändert sind, wird übernommen und nicht neu gerechnet. Der Lauf gleich zeigt, was das heißt.",
    },
  },
  K8: {
    nr: 8,
    akt: 2,
    titel: "Das Ticket im Werkzeug",
    kurz: true,
    text: {
      a: "Das Ticket kommt live aus Jira, mit seinen Verknüpfungen. Von hier ließe sich direkt ein erstes Lösungskonzept aus dem Bestand entwerfen — das überlassen wir gleich der Pipeline.",
      b: "In Pipeline verwenden: Das Ticket ist jetzt die Aufgabe des Laufs. Eine Aufgabe, ein Lauf, nichts parallel.",
    },
  },
  K9: {
    nr: 9,
    akt: 2,
    titel: "Der Lauf wird gestartet",
    kurz: true,
    text: {
      a: "Vor dem Lauf: sieben Repositories auf main, jedes mit seinem Stand. Modelldienste und Vektorspeicher antworten. Der ganze Weg: neun Phasen, linear, ein Ticket.",
    },
  },
  K10: {
    nr: 10,
    akt: 2,
    titel: "Das Wissen steht",
    kurz: true,
    text: {
      a: "Zuerst die Fakten – ohne KI. Bestand, Fakten, Verständnis und Dossier stehen aus dem ersten Kontakt mit dem Code und werden übernommen.",
      b: "Was sich nicht geändert hat, wird nicht neu gerechnet. Ändert sich der Bestand, rechnet das Werkzeug genau das neu, und zu jedem Ergebnis steht, aus welchen Eingaben es stammt.",
    },
  },
  K11: {
    nr: 11,
    akt: 2,
    titel: "Rundgang durch das Wissen",
    kurz: true,
    text: {
      a: "Architekturfakten: ohne KI aus dem Code gelesen. Jede Beziehung mit Datei und Zeile.",
      b: "Architektursynthese: Die KI erklärt den Bestand, geprüft gegen die Fakten. Wo die Fakten schweigen, sagt sie es.",
      c: "Architekturdossier: sechzehn Kapitel — C4 Ebene 1 bis 4 und arc42 §1 bis §12 —, jedes mit Belegen und von einem getrennten Prüfer bewertet. Die KI schreibt. Geprüft wird getrennt. Drei Kapitel stehen hier als Beispiel.",
      d: "C4, Ebene 1: der Systemkontext. Wer mit dem Verfahren spricht, was es von außen braucht — ein ganzes Dokument, nicht eine Folie.",
      e: "arc42, Bausteinsicht: aus welchen Diensten das Verfahren besteht und wie sie ineinandergreifen. Gelesen aus dem Code, nicht aus einer Zeichnung von gestern.",
      f: "arc42, Laufzeitsicht: wie ein Vorgang durch die Dienste läuft. Auf diesem Verständnis sucht die Triage gleich die Ursache.",
    },
  },
  K12: {
    nr: 12,
    akt: 2,
    titel: "Solution Triage",
    kurz: true,
    text: {
      v: "Zuerst das Ticketverständnis: Ziel, Ist-Zustand gegen Soll-Zustand, betroffener Umfang — aufgeschrieben, bevor irgendetwas vorgeschlagen wird.",
      t: "Dazu der technische Kontext: welche Dienste, welche Klassen, welche Verträge der Fall berührt. Das ist die Grundlage, auf der gleich das Konzept steht.",
      a: "Solution Triage: Das Ticket wird gegen den Bestand gelesen. Hier treffen sich zum ersten Mal die Vorschrift aus dem Ticket und die Methode aus dem Bestand — darin besteht die Arbeit.",
      a2: "Ursache: SaeumnisRechner.berechne rechnet ein Prozent vom ungerundeten Betrag, 6 × 6.230,00 € / 100 = 373,80 €. Die Abrundung auf volle 50 Euro nach § 240 AO fehlt.",
      b: "Fix: vor der Prozentrechnung abrunden. Aus 6.230,00 € werden 6.200,00 €, der Zuschlag 372,00 €. Ein neuer Test sichert einen nicht durch 50 teilbaren Betrag ab.",
      c: "Jede Aussage trägt ihren Beleg: Datei und Zeile. Die Leitplanken prüfen Belege, Änderungsorte und die Abdeckung der Akzeptanzkriterien, bevor ein Mensch das Konzept sieht.",
    },
  },
  K13: {
    nr: 13,
    akt: 2,
    titel: "Wartepunkt 1: das Konzept",
    kurz: true,
    text: {
      a: "Der Lauf hält an, wo entschieden wird. Die KI schlägt vor. Der Nachweis prüft. Der Mensch entscheidet – und trägt die Verantwortung.",
      b: "Kette fortsetzen: Die Phasen davor stehen, der Plan wird übernommen. Was entschieden ist, bleibt entschieden; was steht, wird nicht neu gerechnet.",
    },
  },
  K14: {
    nr: 14,
    akt: 2,
    titel: "Delivery Plan und Wartepunkt 2",
    kurz: true,
    text: {
      a: "Der Plan nennt die Stellen, die Reihenfolge und die Tests. Zweite Entscheidung, bevor ein Agent Code schreibt.",
    },
  },
  K15: {
    nr: 15,
    akt: 2,
    titel: "Controlled Execution",
    kurz: true,
    text: {
      a: "Agenten handeln – die Ausführung beweist. Der Agent hat auf einem Branch in einem eingezäunten Arbeitsbereich geschrieben: nur die geplanten Stellen, Build und Tests liefen mit. Der Bericht hält es fest.",
    },
  },
  K16: {
    nr: 16,
    akt: 2,
    titel: "Validation Gate",
    kurz: true,
    text: {
      a: "Validation Gate: Nicht der Agent sagt, dass es geht. Die Tests liefen gegen die laufende Anwendung, der Lauf hat es gezeigt.",
    },
  },
  K17: {
    nr: 17,
    akt: 2,
    titel: "Wartepunkt 3 und Lieferung",
    kurz: true,
    text: {
      a: "Dritte Entscheidung: Die Lieferung bleibt eine Ingenieursentscheidung.",
      b: "Delivery Readiness: Der Branch liegt auf origin, der Pull Request ist vorbereitet. Neun Phasen, drei Entscheidungen, eine Kette, und nichts wurde zweimal gerechnet.",
    },
  },
  K18: {
    nr: 18,
    akt: 3,
    titel: "Änderungen",
    kurz: true,
    text: {
      a: "Das Ergebnis ist kein Chat. Es ist ein Branch mit Diff, Tests und Bericht: im Werkzeug lesbar, im Editor weiterführbar.",
    },
  },
  K19: {
    nr: 19,
    akt: 3,
    titel: "GitHub",
    kurz: true,
    text: {
      a: "Auf origin: zwei Dateien im Erhebungsdienst, ein Test im Prüfpaket. Nachvollziehbar bis zur Zeile, prüfbar wie jede andere Änderung.",
    },
  },
  K20: {
    nr: 20,
    akt: 3,
    titel: "Verlauf",
    kurz: true,
    text: {
      a: "Der Verlauf hält die Kette: jeder Lauf, jede Entscheidung, jede Dauer. Einmal gerechnet, heute in Sekunden übernommen.",
    },
  },
  K21: {
    nr: 21,
    akt: 3,
    titel: "Die zweite Welt",
    kurz: true,
    text: {
      a: "Dieselbe Anwendung, der Erhebungsdienst aus dem gelieferten Branch gebaut. Das Kopfband sagt es: main + codegen/STROM-4.",
      b: "Vorher 373,80 €. Nachher 372,00 €. Gleiche Daten, andere Regel.",
    },
  },
  K22: {
    nr: 22,
    akt: 3,
    titel: "Schlusskarte",
    kurz: true,
    karte: [
      "Die KI schlägt vor. Der Nachweis prüft. Der Mensch entscheidet – und trägt die Verantwortung.",
      "Der Ansatz ist übertragbar. Die Erfahrung liegt vor.",
    ],
    text: {},
  },
} as const satisfies Record<string, Kapitel>;

export type KapitelId = keyof typeof KAPITEL;

/** Ein Untertitel des Drehbuchs; ein fehlender Schlüssel ist ein Fehler im Spec, kein leerer Text. */
export function text(id: KapitelId, key: string): string {
  const kapitel: Kapitel = KAPITEL[id];
  const wert = kapitel.text[key];
  if (!wert) throw new Error(`texte.ts kennt keinen Untertitel ${id}.${key}`);
  return wert;
}

/** Die Zeilen der Vollbildkarte eines Kapitels. */
export function karte(id: KapitelId): readonly string[] {
  const kapitel: Kapitel = KAPITEL[id];
  if (!kapitel.karte) throw new Error(`texte.ts kennt keine Karte für ${id}`);
  return kapitel.karte;
}

/** Kapitel in Drehbuch-Reihenfolge. */
export const REIHENFOLGE = Object.keys(KAPITEL) as KapitelId[];
