// Erzeugt texte.md aus texte.ts: der vollständige Text des Videos für den
// Vorführenden, Kapitel für Kapitel. Aufruf: npm run texte
//
// Node liest die TypeScript-Datei direkt (Type Stripping, Node 22.18+);
// es gibt keine zweite Fassung des Wortlauts, die auseinanderlaufen könnte.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AKTE, KAPITEL, TITEL } from './texte.ts';

const hier = path.dirname(fileURLToPath(import.meta.url));
const ziel = path.join(hier, 'texte.md');

const heute = new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
const zeilen = [];
const z = (s = '') => zeilen.push(s);

z('# Der Text des Videos');
z();
z(`Wortlaut aller Karten und Untertitel, Kapitel für Kapitel, erzeugt aus \`texte.ts\` am ${heute}.`);
z('Was hier steht, steht so im Video; eine Änderung am Wortlaut geschieht in `texte.ts`,');
z('danach erzeugt `npm run texte` dieses Dokument neu.');
z();
z(`**Botschaft:** ${TITEL.haupt} – ${TITEL.neben}`);
z();
z('Die Spalte *Kurzfassung* sagt, ob das Kapitel in die etwa sechsminütige Fassung kommt;');
z('Kürzungen innerhalb eines Kapitels (K2, K7, K11) nimmt der Schnitt vor.');
z();

let akt = 0;
for (const [id, k] of Object.entries(KAPITEL)) {
  if (k.akt !== akt) {
    akt = k.akt;
    z('---');
    z();
    z(`## Akt ${akt} · ${AKTE[akt]}`);
    z();
  }
  z(`### ${id} · ${k.titel}`);
  z();
  z(`*Kurzfassung: ${k.kurz ? 'ja' : 'nein'}*`);
  z();
  if (id === 'K1') {
    z('**Titelkarte**');
    z();
    z(`> ${TITEL.haupt}`);
    z('>');
    z(`> ${TITEL.neben}`);
    z();
  }
  if (k.karte) {
    z(id === 'K1' ? '**Darunter**' : id === 'K22' ? '**Schlusskarte**' : '**Kapitelkarte**');
    z();
    for (const satz of k.karte) {
      z(`> ${satz}`);
      z('>');
    }
    zeilen.pop();
    z();
  }
  const texte = Object.values(k.text);
  texte.forEach((t, i) => {
    z(texte.length > 1 ? `**Untertitel ${i + 1}**` : '**Untertitel**');
    z();
    z(t);
    z();
  });
}

fs.writeFileSync(ziel, zeilen.join('\n') + '\n', 'utf8');
console.log(`texte.md geschrieben: ${Object.keys(KAPITEL).length} Kapitel`);
