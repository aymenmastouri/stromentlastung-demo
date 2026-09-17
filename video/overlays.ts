import type { Locator, Page } from '@playwright/test';

/**
 * Einblendungen für die Aufnahme: Titel- und Kapitelkarten, Untertitel,
 * Kapitel-Marke, Rahmen und Zoom.
 *
 * Alles wird als festes DOM-Element in die Seite gesetzt und landet damit im
 * aufgezeichneten Video. Die Elemente hängen am <html>-Knoten, nicht am
 * <body>: der Zoom skaliert den Body per CSS-Transform, und eine Einblendung
 * im Body würde mitwachsen.
 */

const Z = 2147483000;
const BLAU = '#12abdb';
const NACHT = 'linear-gradient(135deg,#001B3D,#002B5C)';
const SCHRIFT = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";

/** Lesezeit eines Untertitels aus seiner Länge: 65 ms je Zeichen, 3,5 bis 16 Sekunden. */
export function lesezeit(text: string): number {
  return Math.min(16_000, Math.max(3_500, 1_500 + text.length * 65));
}

/** Lesezeit einer Karte mit mehreren Zeilen: etwas ruhiger als ein Untertitel. */
export function kartenzeit(zeilen: readonly string[]): number {
  const laenge = zeilen.reduce((n, z) => n + z.length, 0);
  return Math.min(22_000, Math.max(4_500, 2_500 + laenge * 55));
}

async function pause(page: Page, ms: number): Promise<void> {
  await page.waitForTimeout(ms);
}

/** Baut eine Vollbildkarte und blendet sie ein. `html` ist bereits sicherer Markup aus diesem Modul. */
async function karteEinblenden(page: Page, html: string): Promise<void> {
  await page.evaluate(
    ({ html, z, hintergrund, schrift }) => {
      document.getElementById('dv-karte')?.remove();
      const d = document.createElement('div');
      d.id = 'dv-karte';
      Object.assign(d.style, {
        position: 'fixed',
        inset: '0',
        zIndex: String(z),
        background: hintergrund,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: schrift,
        color: '#fff',
        textAlign: 'center',
        opacity: '0',
        transition: 'opacity .6s ease',
      });
      d.innerHTML = html;
      document.documentElement.appendChild(d);
      requestAnimationFrame(() => {
        d.style.opacity = '1';
      });
    },
    { html, z: Z, hintergrund: NACHT, schrift: SCHRIFT },
  );
}

async function karteAusblenden(page: Page): Promise<void> {
  await page.evaluate(() => {
    const d = document.getElementById('dv-karte');
    if (!d) return;
    d.style.opacity = '0';
    setTimeout(() => d.remove(), 650);
  });
  await pause(page, 750);
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const KICKER = `font-size:20px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${BLAU};margin-bottom:26px`;

/** K1: die Botschaft als Titelkarte. */
export async function titelkarte(
  page: Page,
  haupt: string,
  neben: string,
  zeile: string,
  ms: number,
): Promise<void> {
  await karteEinblenden(
    page,
    `<div style="${KICKER}">SDLC Pilot · Vorführung</div>
     <div style="font-size:64px;font-weight:700;letter-spacing:-1px;max-width:1500px;line-height:1.15">${escape(haupt)}</div>
     <div style="font-size:36px;font-weight:400;color:rgba(255,255,255,.78);margin-top:18px;max-width:1500px;line-height:1.3">${escape(neben)}</div>
     <div style="width:120px;height:3px;background:${BLAU};margin:44px 0"></div>
     <div style="font-size:30px;font-weight:500;color:#fff;max-width:1400px;line-height:1.4">${escape(zeile)}</div>
     <div style="position:absolute;bottom:48px;font-size:16px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.35)">Von der Anforderung bis zur Auslieferung · Referenzverfahren Stromentlastung</div>`,
  );
  await pause(page, ms);
  await karteAusblenden(page);
}

/** Aktkarte: „Akt 1 · Der Auftrag“. */
export async function aktkarte(page: Page, nr: number, titel: string, ms = 4_000): Promise<void> {
  await karteEinblenden(
    page,
    `<div style="${KICKER}">Akt ${nr}</div>
     <div style="font-size:70px;font-weight:700;letter-spacing:-1px">${escape(titel)}</div>`,
  );
  await pause(page, ms);
  await karteAusblenden(page);
}

/** Kapitelkarte mit Titel und Sätzen (K2). */
export async function kapitelkarte(
  page: Page,
  nr: number,
  titel: string,
  saetze: readonly string[],
  ms: number,
): Promise<void> {
  const absaetze = saetze
    .map((s) => `<p style="margin:0 0 22px;font-size:32px;line-height:1.5;font-weight:400">${escape(s)}</p>`)
    .join('');
  await karteEinblenden(
    page,
    `<div style="${KICKER}">Kapitel ${nr}</div>
     <div style="font-size:52px;font-weight:700;margin-bottom:44px">${escape(titel)}</div>
     <div style="max-width:1400px;color:rgba(255,255,255,.92)">${absaetze}</div>`,
  );
  await pause(page, ms);
  await karteAusblenden(page);
}

/** Schlusskarte (K22): der erste Satz, dann der zweite darunter; die Karte bleibt stehen. */
export async function schlusskarte(page: Page, satz1: string, satz2: string, ms1: number, ms2: number): Promise<void> {
  await karteEinblenden(
    page,
    `<div style="${KICKER}">Von der Anforderung bis zur Auslieferung</div>
     <div style="font-size:46px;font-weight:700;max-width:1500px;line-height:1.3">${escape(satz1)}</div>
     <div id="dv-schluss-2" style="font-size:32px;font-weight:500;color:${BLAU};margin-top:48px;max-width:1300px;line-height:1.4;opacity:0;transition:opacity .8s">${escape(satz2)}</div>
     <div style="position:absolute;bottom:48px;display:flex;align-items:center;gap:14px;opacity:.55">
       <span style="font-size:15px;letter-spacing:2px;text-transform:uppercase">SDLC Pilot</span>
       <span style="width:1px;height:14px;background:rgba(255,255,255,.4)"></span>
       <span style="font-size:15px;font-style:italic;letter-spacing:.5px">Capgemini · Make it real</span>
     </div>`,
  );
  await pause(page, ms1);
  await page.evaluate(() => {
    const d = document.getElementById('dv-schluss-2');
    if (d) d.style.opacity = '1';
  });
  await pause(page, ms2);
}

let aktuelleMarke: { id: string; titel: string } | null = null;

/** Kapitel-Marke oben rechts; bleibt bis zum nächsten Kapitel und wird nach jeder Navigation erneuert. */
export async function kapitelMarke(page: Page, id: string, titel: string): Promise<void> {
  aktuelleMarke = { id, titel };
  await markeErneuern(page);
}

export async function markeErneuern(page: Page): Promise<void> {
  if (!aktuelleMarke) return;
  await page
    .evaluate(
      ({ id, titel, z, blau, schrift }) => {
        document.getElementById('dv-marke')?.remove();
        const d = document.createElement('div');
        d.id = 'dv-marke';
        Object.assign(d.style, {
          position: 'fixed',
          top: '12px',
          right: '24px',
          zIndex: String(z - 2),
          background: 'rgba(0,27,61,.86)',
          color: '#fff',
          padding: '8px 16px 8px 14px',
          borderRadius: '999px',
          fontFamily: schrift,
          fontSize: '17px',
          fontWeight: '600',
          letterSpacing: '.6px',
          pointerEvents: 'none',
          boxShadow: '0 4px 18px rgba(0,0,0,.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        });
        d.innerHTML = `<span style="color:${blau};font-weight:700"></span><span></span>`;
        (d.children[0] as HTMLElement).textContent = id;
        (d.children[1] as HTMLElement).textContent = titel;
        document.documentElement.appendChild(d);
      },
      { ...aktuelleMarke, z: Z, blau: BLAU, schrift: SCHRIFT },
    )
    .catch(() => {});
}

export async function markeEntfernen(page: Page): Promise<void> {
  aktuelleMarke = null;
  await page.evaluate(() => document.getElementById('dv-marke')?.remove()).catch(() => {});
}

/** Untertitel am unteren Rand, 1080p-sicher; steht, bis er ersetzt oder entfernt wird. */
export async function untertitel(page: Page, textInhalt: string, ms = lesezeit(textInhalt)): Promise<void> {
  await page.evaluate(
    ({ t, z, blau, schrift }) => {
      document.getElementById('dv-sub')?.remove();
      const d = document.createElement('div');
      d.id = 'dv-sub';
      Object.assign(d.style, {
        position: 'fixed',
        bottom: '64px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '1560px',
        boxSizing: 'border-box',
        background: 'rgba(0,27,61,.93)',
        color: '#fff',
        padding: '20px 40px',
        borderRadius: '14px',
        borderLeft: `7px solid ${blau}`,
        fontFamily: schrift,
        fontSize: '31px',
        lineHeight: '1.35',
        fontWeight: '500',
        textAlign: 'center',
        zIndex: String(z - 1),
        pointerEvents: 'none',
        boxShadow: '0 8px 36px rgba(0,0,0,.45)',
        opacity: '0',
        transition: 'opacity .3s ease',
      });
      d.textContent = t;
      document.documentElement.appendChild(d);
      requestAnimationFrame(() => {
        d.style.opacity = '1';
      });
    },
    { t: textInhalt, z: Z, blau: BLAU, schrift: SCHRIFT },
  );
  await pause(page, ms);
}

export async function untertitelWeg(page: Page): Promise<void> {
  await page.evaluate(() => document.getElementById('dv-sub')?.remove()).catch(() => {});
}

/**
 * Rahmen um ein Element, als Beleg im Bild. Mit `spot` wird der Rest der
 * Seite leicht abgedunkelt. Gibt zurück, ob das Element sichtbar war.
 */
export async function rahmen(
  page: Page,
  ziel: Locator | string,
  opts: { spot?: boolean; rand?: number } = {},
): Promise<boolean> {
  const locator = typeof ziel === 'string' ? page.locator(ziel).first() : ziel.first();
  const box = await locator.boundingBox().catch(() => null);
  if (!box) return false;
  await rahmenBox(page, box, opts);
  return true;
}

/** Rahmen um einen Bildausschnitt in Viewport-Koordinaten, etwa um mehrere Zeilen zusammen. */
export async function rahmenBox(
  page: Page,
  box: { x: number; y: number; width: number; height: number },
  opts: { spot?: boolean; rand?: number } = {},
): Promise<void> {
  const rand = opts.rand ?? 10;
  await page.evaluate(
    ({ box, rand, spot, z, blau }) => {
      document.getElementById('dv-rahmen')?.remove();
      const d = document.createElement('div');
      d.id = 'dv-rahmen';
      Object.assign(d.style, {
        position: 'fixed',
        left: `${box.x - rand}px`,
        top: `${box.y - rand}px`,
        width: `${box.width + 2 * rand}px`,
        height: `${box.height + 2 * rand}px`,
        border: `4px solid ${blau}`,
        borderRadius: '12px',
        boxSizing: 'border-box',
        zIndex: String(z - 3),
        pointerEvents: 'none',
        boxShadow: spot
          ? `0 0 0 6px rgba(18,171,219,.25), 0 0 0 9999px rgba(0,10,30,.38)`
          : `0 0 0 6px rgba(18,171,219,.25), 0 6px 30px rgba(0,0,0,.35)`,
        opacity: '0',
        transition: 'opacity .35s ease',
      });
      document.documentElement.appendChild(d);
      requestAnimationFrame(() => {
        d.style.opacity = '1';
      });
    },
    { box, rand, spot: !!opts.spot, z: Z, blau: BLAU },
  );
}

export async function rahmenWeg(page: Page): Promise<void> {
  await page.evaluate(() => document.getElementById('dv-rahmen')?.remove()).catch(() => {});
}

/**
 * Kamera-Zoom auf ein Element: der Body wird um den Mittelpunkt des Elements
 * skaliert, das Element bleibt an seinem Platz und wächst mit seiner Umgebung.
 * Kein Umbruch der Seite, nur eine Transformation; `zoomZurueck` hebt sie auf.
 */
export async function zoomAuf(page: Page, ziel: Locator | string, faktor = 1.6): Promise<boolean> {
  await zoomZurueck(page, 0);
  const locator = typeof ziel === 'string' ? page.locator(ziel).first() : ziel.first();
  const box = await locator.boundingBox().catch(() => null);
  if (!box) return false;
  await page.evaluate(
    ({ box, faktor }) => {
      const body = document.body;
      const b = body.getBoundingClientRect();
      const ox = box.x + box.width / 2 - b.left;
      const oy = box.y + box.height / 2 - b.top;
      body.style.transition = 'transform .8s cubic-bezier(.4,0,.2,1)';
      body.style.transformOrigin = `${ox}px ${oy}px`;
      body.style.transform = `scale(${faktor})`;
    },
    { box, faktor },
  );
  await pause(page, 900);
  return true;
}

export async function zoomZurueck(page: Page, wartezeit = 850): Promise<void> {
  const gezoomt = await page
    .evaluate(() => {
      const body = document.body;
      if (!body || !body.style.transform) return false;
      body.style.transition = 'transform .7s cubic-bezier(.4,0,.2,1)';
      body.style.transform = '';
      return true;
    })
    .catch(() => false);
  if (gezoomt && wartezeit > 0) await pause(page, wartezeit);
}

/** Alles weg, was ein Kapitel hinterlassen kann: Untertitel, Rahmen, Zoom. */
export async function aufraeumen(page: Page): Promise<void> {
  await untertitelWeg(page);
  await rahmenWeg(page);
  await zoomZurueck(page, 400);
}
