import fs from 'node:fs';
import path from 'node:path';

/**
 * Kapitelmarken für den Schnitt.
 *
 * Jede Marke trägt den Abstand zur Startzeit der Aufnahme in Sekunden. Die
 * Videoaufzeichnung beginnt mit der ersten Seite des Browsers, wenige
 * Zehntelsekunden vor `start()`; für den Schnitt ist das genau genug.
 * Wartespannen (ein Lauf rechnet, eine Seite lädt lange) werden getrennt
 * geführt, damit der Schnitt sie raffen kann. Die Datei wird nach jeder
 * Marke neu geschrieben: ein Abbruch hinterlässt trotzdem eine Zeitachse.
 */

export interface KapitelMarke {
  chapter: string;
  title: string;
  t_start: number;
  t_end: number | null;
  note: string;
  /** Kommt in die Kurzfassung. */
  kurz?: boolean;
}

export interface WarteMarke {
  label: string;
  t_start: number;
  t_end: number | null;
}

export interface Zeitachsendatei {
  modus: string;
  started_at: string;
  finished_at: string | null;
  duration_s: number | null;
  chapters: KapitelMarke[];
  waits: WarteMarke[];
  notes: { t: number; text: string }[];
  /** Freie Beobachtungen am Ende, etwa der Stand der neun Phasen. */
  befund: Record<string, unknown>;
}

export class Zeitachse {
  private t0 = Date.now();
  private readonly daten: Zeitachsendatei;
  private offeneWarte: WarteMarke | null = null;

  constructor(
    private readonly datei: string,
    modus: string,
  ) {
    this.daten = {
      modus,
      started_at: new Date(this.t0).toISOString(),
      finished_at: null,
      duration_s: null,
      chapters: [],
      waits: [],
      notes: [],
      befund: {},
    };
  }

  /** Sekunden seit Start, eine Nachkommastelle. */
  jetzt(): number {
    return Math.round((Date.now() - this.t0) / 100) / 10;
  }

  start(): void {
    this.t0 = Date.now();
    this.daten.started_at = new Date(this.t0).toISOString();
    this.schreiben();
  }

  kapitel(id: string, titel: string, kurz?: boolean): void {
    this.kapitelSchliessen();
    this.daten.chapters.push({ chapter: id, title: titel, t_start: this.jetzt(), t_end: null, note: '', kurz });
    console.log(`[${this.stempel()}] ${id} · ${titel}`);
    this.schreiben();
  }

  /** Ein Kapitel, das nicht gefilmt werden konnte: Marke mit Grund, ohne Dauer. */
  uebersprungen(id: string, titel: string, grund: string, kurz?: boolean): void {
    this.kapitelSchliessen();
    const t = this.jetzt();
    this.daten.chapters.push({ chapter: id, title: titel, t_start: t, t_end: t, note: `übersprungen: ${grund}`, kurz });
    console.log(`[${this.stempel()}] ${id} · ${titel} — ÜBERSPRUNGEN: ${grund}`);
    this.schreiben();
  }

  /** Beobachtung zum laufenden Kapitel; landet in dessen Notiz und in der Liste. */
  notiz(textInhalt: string): void {
    const t = this.jetzt();
    this.daten.notes.push({ t, text: textInhalt });
    const aktuell = this.daten.chapters[this.daten.chapters.length - 1];
    if (aktuell && aktuell.t_end === null) {
      aktuell.note = aktuell.note ? `${aktuell.note} | ${textInhalt}` : textInhalt;
    }
    console.log(`[${this.stempel()}]   ${textInhalt}`);
    this.schreiben();
  }

  warteStart(label: string): void {
    this.warteEnde();
    this.offeneWarte = { label, t_start: this.jetzt(), t_end: null };
  }

  /** Spannen unter acht Sekunden sind kein Zeitraffer wert und werden verworfen. */
  warteEnde(): void {
    if (!this.offeneWarte) return;
    const w = this.offeneWarte;
    w.t_end = this.jetzt();
    this.offeneWarte = null;
    if (w.t_end - w.t_start >= 8) {
      this.daten.waits.push(w);
      console.log(`[${this.stempel()}]   Wartespanne „${w.label}“: ${(w.t_end - w.t_start).toFixed(1)} s`);
    }
    this.schreiben();
  }

  befund(schluessel: string, wert: unknown): void {
    this.daten.befund[schluessel] = wert;
    this.schreiben();
  }

  ende(): void {
    this.warteEnde();
    this.kapitelSchliessen();
    this.daten.finished_at = new Date().toISOString();
    this.daten.duration_s = this.jetzt();
    this.schreiben();
  }

  private kapitelSchliessen(): void {
    const aktuell = this.daten.chapters[this.daten.chapters.length - 1];
    if (aktuell && aktuell.t_end === null) aktuell.t_end = this.jetzt();
  }

  private stempel(): string {
    const s = this.jetzt();
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(1).padStart(4, '0')}`;
  }

  private schreiben(): void {
    fs.mkdirSync(path.dirname(this.datei), { recursive: true });
    fs.writeFileSync(this.datei, JSON.stringify(this.daten, null, 2) + '\n', 'utf8');
  }
}
