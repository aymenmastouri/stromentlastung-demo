import { test, type Locator, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import * as ov from "./overlays";
import { AKTE, KAPITEL, TITEL, karte, text, type KapitelId } from "./texte";
import { Zeitachse } from "./timeline";

/**
 * Das Drehbuch (video/drehbuch.md, Fassung 2) als eine Aufnahme: 22 Kapitel
 * in drei Akten, jedes Kapitel eine kleine Funktion. Ein Kapitel, das im
 * jetzigen Zustand nicht gefilmt werden kann, schreibt den Grund in die
 * Zeitachse und die Aufnahme läuft weiter; die Aufnahme bricht nie wegen
 * eines einzelnen Bildes ab.
 *
 * MODUS=trockenlauf  alles wie in der Aufnahme, aber der Spec duldet, dass
 *                    der Lauf ganz übernommen wird und die drei Wartepunkte
 *                    bereits entschieden sind: er zeigt den Stand und klickt
 *                    keine Freigabe. Zweck: jede Seite, jeden Locator, jedes
 *                    Overlay und die Videokette in wenigen Minuten beweisen.
 * MODUS=aufnahme     die Aufnahme: Full Pipeline starten, an jedem Wartepunkt
 *                    ohne Kommentar freigeben, „Kette fortsetzen“, bis die
 *                    Lieferung steht.
 */

// ── Umgebung ────────────────────────────────────────────────────────────────

type Modus = "trockenlauf" | "aufnahme";
const MODUS: Modus =
  process.env["MODUS"] === "aufnahme" ? "aufnahme" : "trockenlauf";
const SDLC_URL = (process.env["SDLC_URL"] || "").replace(/\/+$/, "");
const SDLC_API = (process.env["SDLC_API"] || "http://127.0.0.1:8000").replace(
  /\/+$/,
  "",
);
const FACH_MAIN = (process.env["FACH_MAIN"] || "http://localhost:8090").replace(
  /\/+$/,
  "",
);
const FACH_FIXED = (
  process.env["FACH_FIXED"] || "http://localhost:8095"
).replace(/\/+$/, "");
const FACH_USER = process.env["FACH_USER"] || "mastouri@stromentlastung.dev";
const FACH_PASS = process.env["FACH_PASS"] || "stromentlastung";
const JIRA_URL =
  process.env["JIRA_URL"] ||
  "https://sdlcpilot-demo.atlassian.net/browse/STROM-4";
const GITHUB_COMPARE =
  process.env["GITHUB_COMPARE"] ||
  "https://github.com/aymenmastouri/stromentlastung-zahlung/compare/main...codegen/STROM-4";

const TICKET = "STROM-4";
const AKTENZEICHEN = "HZA-N-9b-2024-000002";
const LAUFSET = /^(Gesamte Pipeline|Full Pipeline)$/;

const HIER = __dirname;
const OUT = path.join(HIER, "out");
const KONTROLLE = path.join(OUT, "kontrolle");
const ZEITACHSE = path.join(OUT, "timeline.json");
const JIRA_AUTH = path.join(HIER, "auth", "jira.json");

const MIN = 60_000;
/** Höchstwartezeiten. Die Aufnahme rechnet mit Sekunden je Halt und lässt Luft;
 *  der Trockenlauf wartet kürzer, damit er in Minuten durch ist, auch wenn
 *  eine Phase wider Erwarten neu rechnet. */
const WARTE =
  MODUS === "aufnahme"
    ? {
        start: 60_000,
        wissen: 5 * MIN,
        halt: 5 * MIN,
        phase: 5 * MIN,
        jira: 60_000,
      }
    : {
        start: 60_000,
        wissen: 4 * MIN,
        halt: 3 * MIN,
        phase: 3 * MIN,
        jira: 60_000,
      };

// Kurze Pausen zwischen Bildern.
const P = 900;
const LP = 1_800;

// Die Jira-Sitzung kommt aus einer gespeicherten Datei; fehlt sie, wird K6 übersprungen.
test.use(fs.existsSync(JIRA_AUTH) ? { storageState: JIRA_AUTH } : {});

interface Ctx {
  page: Page;
  z: Zeitachse;
  bildNr: number;
}

// ── Allgemeine Helfer ───────────────────────────────────────────────────────

async function warte(page: Page, ms = P): Promise<void> {
  await page.waitForTimeout(ms);
}

async function schnappschuss(ctx: Ctx, name: string): Promise<void> {
  ctx.bildNr += 1;
  const datei = path.join(
    KONTROLLE,
    `${String(ctx.bildNr).padStart(2, "0")}-${name}.png`,
  );
  await ctx.page.screenshot({ path: datei }).catch(() => {});
}

/** Ein Element sanft ins Bild holen. */
async function insBild(
  ctx: Ctx,
  ziel: Locator,
  block: ScrollLogicalPosition = "center",
): Promise<boolean> {
  const el = ziel.first();
  if (!(await el.count())) return false;
  await el
    .evaluate((node, b) => {
      node.scrollIntoView({ behavior: "smooth", block: b, inline: "nearest" });
      // Ein Element breiter als der Inhalt (der Stepper) schiebt den Inhalt sonst
      // seitlich und die Seitenleiste aus dem Bild.
      window.setTimeout(() => {
        document.querySelectorAll("mat-sidenav-content, main").forEach((c) => {
          (c as HTMLElement).scrollLeft = 0;
        });
        window.scrollTo({ left: 0 });
      }, 700);
    }, block)
    .catch(() => {});
  await warte(ctx.page, 1_000);
  return true;
}

/** Die Seite (oder ihren Scrollbereich) um `px` weiterrollen. */
async function rollen(ctx: Ctx, px: number, ms = 1_400): Promise<void> {
  await ctx.page.evaluate(
    ({ px, ms }) => {
      const kandidaten = [
        document.querySelector("mat-sidenav-content"),
        document.querySelector("main"),
        document.scrollingElement,
      ].filter(
        (c): c is HTMLElement => !!c && c.scrollHeight > c.clientHeight + 4,
      );
      const c = kandidaten[0];
      if (!c) return;
      const s = c.scrollTop;
      const t0 = performance.now();
      (function schritt() {
        const e = Math.min((performance.now() - t0) / ms, 1);
        c.scrollTop = s + px * (0.5 - Math.cos(e * Math.PI) / 2);
        if (e < 1) requestAnimationFrame(schritt);
      })();
    },
    { px, ms },
  );
  await warte(ctx.page, ms + 200);
}

async function untertitel(
  ctx: Ctx,
  id: KapitelId,
  key: string,
  ms?: number,
): Promise<void> {
  await ov.untertitel(ctx.page, text(id, key), ms);
}

/** Ein Kapitel: Marke setzen, ausführen, Fehler als Notiz, Bild aufräumen. */
async function kapitel(
  ctx: Ctx,
  id: KapitelId,
  lauf: () => Promise<void>,
): Promise<void> {
  const k = KAPITEL[id];
  ctx.z.kapitel(id, k.titel, k.kurz);
  await ov.kapitelMarke(ctx.page, id, k.titel);
  try {
    await lauf();
  } catch (error) {
    const grund = String((error as Error)?.message ?? error)
      .split("\n")[0]
      .slice(0, 300);
    ctx.z.notiz(`abgebrochen: ${grund}`);
  } finally {
    await ov.aufraeumen(ctx.page);
  }
}

// ── SDLC Pilot ──────────────────────────────────────────────────────────────

async function app(ctx: Ctx, route: string, bereit?: string): Promise<void> {
  await ctx.page.goto(SDLC_URL + route, { waitUntil: "domcontentloaded" });
  if (bereit) {
    await ctx.page
      .locator(bereit)
      .first()
      .waitFor({ state: "visible", timeout: 30_000 })
      .catch(() => {});
  }
  await warte(ctx.page, 1_300);
  await ov.markeErneuern(ctx.page);
}

async function api<T = any>(ctx: Ctx, pfad: string): Promise<T | null> {
  try {
    const r = await ctx.page.request.get(SDLC_API + pfad, { timeout: 15_000 });
    if (!r.ok()) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

interface PhaseProgress {
  phase_id: string;
  status: string;
  skip_kind?: string | null;
  skip_reason?: string | null;
  duration_seconds?: number | null;
  awaiting_decision?: boolean;
}
interface Status {
  state: string;
  run_id?: string | null;
  run_outcome?: string | null;
  paused_at?: string | null;
  preset?: string | null;
  phase_progress?: PhaseProgress[];
  carried_phases?: PhaseProgress[];
}

const status = (ctx: Ctx) => api<Status>(ctx, "/api/pipeline/status");
const phasen = (s: Status | null) => [
  ...(s?.carried_phases || []),
  ...(s?.phase_progress || []),
];
const aktiv = (s: Status | null) =>
  !!s && (s.state === "starting" || s.state === "running");
const pausiert = (s: Status | null) =>
  !!s && !aktiv(s) && s.run_outcome === "paused";
// „idle“ zählt als beendet: ohne Lauf gibt es nichts, worauf zu warten wäre.
const beendet = (s: Status | null) =>
  !!s &&
  !aktiv(s) &&
  ["completed", "partial", "failed", "cancelled", "idle"].includes(s.state);
const haltPhase = (s: Status | null) =>
  s?.paused_at || phasen(s).find((p) => p.awaiting_decision)?.phase_id || null;

function phaseFertig(s: Status | null, id: string): boolean {
  const p = phasen(s).find((x) => x.phase_id === id);
  if (!p) return false;
  if (p.status === "completed" || p.status === "skipped") return true;
  return p.status === "partial" && !p.awaiting_decision;
}

/** Pollt den Laufstatus, bis `pred` gilt; die Spanne landet als Wartemarke in der Zeitachse. */
async function warteAuf(
  ctx: Ctx,
  label: string,
  pred: (s: Status) => boolean,
  timeoutMs: number,
): Promise<Status | null> {
  const t0 = Date.now();
  ctx.z.warteStart(label);
  try {
    let letzter: Status | null = null;
    while (Date.now() - t0 < timeoutMs) {
      const s = await status(ctx);
      if (s) {
        letzter = s;
        if (pred(s)) return s;
      }
      await warte(ctx.page, 2_500);
    }
    ctx.z.notiz(
      `Wartezeit „${label}“ abgelaufen (${Math.round(timeoutMs / 1000)} s); Stand: ${letzter?.state ?? "?"} / ${letzter?.run_outcome ?? "?"} / Halt ${haltPhase(letzter) ?? "–"}`,
    );
    return null;
  } finally {
    ctx.z.warteEnde();
  }
}

/** Nach einem Start: warten, bis der Status den neuen Lauf zeigt. */
async function neuerLauf(
  ctx: Ctx,
  vorherigeRunId: string | null | undefined,
): Promise<Status | null> {
  const s = await warteAuf(
    ctx,
    "Start des Laufs",
    (st) =>
      aktiv(st) || (!!st.run_id && st.run_id !== (vorherigeRunId ?? null)),
    WARTE.start,
  );
  if (s) ctx.z.notiz(`Lauf ${s.run_id ?? "?"} läuft (${s.state})`);
  return s;
}

/** Wartet, bis der Lauf am Wartepunkt vor `phaseId` hält, die Phase durch ist oder der Lauf endet. */
async function warteAufHalt(
  ctx: Ctx,
  phaseId: string,
  timeoutMs: number,
): Promise<Status | null> {
  return warteAuf(
    ctx,
    `Halt vor ${phaseId}`,
    (s) =>
      (pausiert(s) && haltPhase(s) === phaseId) ||
      phaseFertig(s, phaseId) ||
      (beendet(s) && !pausiert(s)),
    timeoutMs,
  );
}

function phasenBefund(s: Status | null): Record<string, unknown>[] {
  return phasen(s).map((p) => ({
    phase: p.phase_id,
    status: p.status,
    skip_kind: p.skip_kind ?? null,
    skip_reason: p.skip_reason ?? null,
    duration_s: p.duration_seconds ?? null,
    awaiting_decision: !!p.awaiting_decision,
  }));
}

async function laufBefund(ctx: Ctx, schluessel: string): Promise<void> {
  const s = await status(ctx);
  const liste = phasenBefund(s);
  ctx.z.befund(schluessel, {
    run_id: s?.run_id ?? null,
    state: s?.state,
    run_outcome: s?.run_outcome,
    phasen: liste,
  });
  const aktuell = liste.filter(
    (p) =>
      p["status"] === "skipped" && (p["skip_kind"] ?? "reused") === "reused",
  ).length;
  ctx.z.notiz(
    `Lauf ${s?.run_id ?? "?"}: ${s?.state}/${s?.run_outcome} — ${aktuell} von ${liste.length} Phasen übernommen; ` +
      liste
        .map(
          (p) =>
            `${p["phase"]}=${p["status"]}${p["skip_kind"] ? `(${p["skip_kind"]})` : ""}`,
        )
        .join(", "),
  );
  const log = await api<{ lines: string[] }>(ctx, "/api/pipeline/logs?since=0");
  if (log?.lines?.length) {
    fs.mkdirSync(KONTROLLE, { recursive: true });
    fs.writeFileSync(
      path.join(KONTROLLE, `lauf-${s?.run_id ?? "unbekannt"}.log`),
      log.lines.join("\n") + "\n",
      "utf8",
    );
  }
}

/** Seite Berichte, Bericht der Phase auswählen. */
async function bericht(ctx: Ctx, phaseId: string): Promise<boolean> {
  await app(ctx, "/codegen/reports", ".rail-item");
  const daten = await api<{ reports: { phase_id: string }[] }>(
    ctx,
    "/api/reports/phases",
  );
  const idx = (daten?.reports ?? []).findIndex((r) => r.phase_id === phaseId);
  const rail = ctx.page.locator(".rail-item");
  const ziel =
    idx >= 0
      ? rail.nth(idx)
      : rail.filter({ hasText: new RegExp(phaseId, "i") }).first();
  if (!(await ziel.isVisible().catch(() => false))) {
    ctx.z.notiz(`Bericht ${phaseId}: kein Eintrag in der Phasenleiste`);
    return false;
  }
  await ziel.click();
  await ctx.page
    .locator(".report-pane .report")
    .first()
    .waitFor({ state: "visible", timeout: 20_000 })
    .catch(() => {});
  await warte(ctx.page, 1_500);
  return true;
}

/** Abschnitt eines Berichts nach Titel; aufklappen, ins Bild holen. */
async function abschnitt(ctx: Ctx, titel: RegExp): Promise<Locator | null> {
  const sec = ctx.page
    .locator(".report-section")
    .filter({ has: ctx.page.locator(".section-title", { hasText: titel }) })
    .first();
  if (!(await sec.count())) {
    ctx.z.notiz(`Abschnitt ${titel} nicht gefunden`);
    return null;
  }
  const head = sec.locator(".section-head").first();
  if (await head.count()) {
    const offen = await head
      .evaluate((el) => el.classList.contains("is-open"))
      .catch(() => false);
    if (!offen) {
      await head.click();
      await warte(ctx.page, 900);
    }
  }
  await insBild(ctx, sec, "start");
  return sec;
}

/** Selektor für eine Markdown-Überschrift beliebiger Ebene mit diesem Text. */
function ueberschrift(textInhalt: string, genau = false): string {
  const bedingung = genau
    ? `:text-is("${textInhalt}")`
    : `:has-text("${textInhalt}")`;
  return ["h1", "h2", "h3", "h4", "h5", "h6"]
    .map((h) => `${h}${bedingung}`)
    .join(", ");
}

/** Ein Element einer Berichts-Markdown-Fläche (Überschrift) ins Bild holen und rahmen. */
async function stelle(
  ctx: Ctx,
  wurzel: Locator,
  selektor: string,
  spot = true,
): Promise<boolean> {
  const el = wurzel.locator(selektor).first();
  if (!(await el.count())) return false;
  await insBild(ctx, el, "start");
  await rollen(ctx, -140, 500);
  return ov.rahmen(ctx.page, el, { spot, rand: 14 });
}

type Stufe = "concept" | "plan" | "delivery";
const STUFE: Record<Stufe, { name: string; gibtFrei: string }> = {
  concept: { name: "Konzept", gibtFrei: "plan" },
  plan: { name: "Plan", gibtFrei: "implement" },
  delivery: { name: "Lieferung", gibtFrei: "deliver" },
};

/** Seite Entscheidungen, Stufe öffnen, Zustand lesen und rahmen. */
async function entscheidung(
  ctx: Ctx,
  stufe: Stufe,
): Promise<{ zustand: string; wartet: boolean }> {
  const page = ctx.page;
  await app(ctx, "/codegen/decisions", ".decisions-page");
  const issue = page.locator(".issue").filter({ hasText: TICKET }).first();
  const wurzel = (await issue.count()) ? issue : page;
  const stage = wurzel
    .locator(".stage")
    .filter({
      has: page.locator(".stage-name", {
        hasText: new RegExp(`^\\s*${STUFE[stufe].name}\\s*$`),
      }),
    })
    .first();
  await stage.waitFor({ state: "visible", timeout: 20_000 });
  await stage.click();
  await page
    .locator(".detail")
    .first()
    .waitFor({ state: "visible", timeout: 15_000 })
    .catch(() => {});
  await warte(page, 1_200);
  const zustand = (
    (await stage
      .locator(".stage-state")
      .textContent()
      .catch(() => "")) || ""
  ).trim();
  const wartet = await stage
    .evaluate((el) => el.classList.contains("waiting"))
    .catch(() => false);
  await ov.rahmen(page, stage);
  ctx.z.notiz(
    `Wartepunkt ${STUFE[stufe].name}: „${zustand}“${wartet ? " — wartet" : ""}`,
  );
  return { zustand, wartet };
}

/** Freigabe ohne Kommentar (Drehbuch Abschnitt 4: ein Kommentar wäre eine neue Eingabe). */
async function freigeben(ctx: Ctx, stufe: Stufe): Promise<boolean> {
  const page = ctx.page;
  const decide = page.locator(".decide").first();
  const approve = decide.locator(".approve").first();
  if (!(await approve.isVisible().catch(() => false))) {
    ctx.z.notiz(`Wartepunkt ${STUFE[stufe].name}: kein Freigabeknopf sichtbar`);
    return false;
  }
  await insBild(ctx, decide, "center");
  await ov.rahmen(page, decide.locator(".decide-actions").first());
  await warte(page, 1_500);
  await approve.click();
  // Die Freigabe zählt, wenn die Meldung erscheint ODER die Stufe ihren Zustand wechselt:
  // eine Entscheidung, deren Phase schon unter derselben Freigabe lief, steht sofort als
  // „ausgeführt“, und die Seite zeigt dafür keine „Freigegeben“-Meldung (zweite Aufnahme:
  // die Lieferung wurde freigegeben, der Spec wartete auf die Meldung und setzte nicht fort).
  const meldung = page
    .locator(".message")
    .filter({ hasText: /Freigegeben/ })
    .first();
  const stage = page
    .locator(".stage")
    .filter({
      has: page.locator(".stage-name", {
        hasText: new RegExp(`^\\s*${STUFE[stufe].name}\\s*$`),
      }),
    })
    .first();
  const t0 = Date.now();
  let ok = false;
  let wie = "";
  while (Date.now() - t0 < 30_000) {
    if (await meldung.isVisible().catch(() => false)) {
      ok = true;
      wie = ((await meldung.textContent().catch(() => "")) || "").trim();
      break;
    }
    const zustand = (
      (await stage
        .locator(".stage-state")
        .textContent()
        .catch(() => "")) || ""
    ).trim();
    if (/freigegeben|ausgeführt/i.test(zustand)) {
      ok = true;
      wie = `Zustand „${zustand}“`;
      break;
    }
    await warte(page, 1_000);
  }
  if (!ok) {
    ctx.z.notiz(
      `Wartepunkt ${STUFE[stufe].name}: weder Freigabemeldung noch Zustandswechsel erschienen`,
    );
    return false;
  }
  if (await meldung.isVisible().catch(() => false))
    await ov.rahmen(page, meldung);
  ctx.z.notiz(`Wartepunkt ${STUFE[stufe].name}: freigegeben — ${wie}`);
  await warte(page, 2_500);
  return true;
}

/** Run-Seite: „Alles entschieden — die Kette kann weiterlaufen“, „Kette fortsetzen“. */
async function ketteFortsetzen(
  ctx: Ctx,
  untertitelText?: string,
): Promise<boolean> {
  const page = ctx.page;
  const s = await status(ctx);
  const vorher = s?.run_id ?? null;
  await app(ctx, "/codegen/run", ".page-title");
  if (!pausiert(s)) {
    ctx.z.notiz(
      `der Lauf hält nicht (${s?.state ?? "?"}/${s?.run_outcome ?? "?"}) — keine Fortsetzung nötig`,
    );
    if (untertitelText) await ov.untertitel(page, untertitelText);
    return false;
  }
  const karte = page.locator(".continue-card").first();
  const da = await karte
    .waitFor({ state: "visible", timeout: 45_000 })
    .then(() => true)
    .catch(() => false);
  if (!da) {
    // Die Seite bietet nichts an: die Kette wird über die API fortgesetzt, damit die
    // Aufnahme weiterläuft; die Notiz hält fest, dass der Klick im Bild fehlt.
    ctx.z.notiz(
      "keine Fortsetzung angeboten („Alles entschieden“ fehlt) — Fortsetzung über die API",
    );
    if (untertitelText) await ov.untertitel(page, untertitelText);
    const antwort = await fetch(`${SDLC_API}/api/pipeline/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_from: vorher }),
    }).catch(() => null);
    if (!antwort || !antwort.ok) {
      ctx.z.notiz(
        `Fortsetzung über die API fehlgeschlagen (${antwort ? antwort.status : "keine Antwort"})`,
      );
      return false;
    }
    await neuerLauf(ctx, vorher);
    return true;
  }
  await ov.rahmen(page, karte);
  if (untertitelText) await ov.untertitel(page, untertitelText, 2_500);
  await karte.locator("button").first().click();
  if (untertitelText)
    await ov.untertitel(
      page,
      untertitelText,
      ov.lesezeit(untertitelText) - 2_500,
    );
  await ov.rahmenWeg(page);
  await neuerLauf(ctx, vorher);
  return true;
}

/** Ein Wartepunkt im Bild: Zustand zeigen, in der Aufnahme freigeben und fortsetzen. */
async function wartepunkt(
  ctx: Ctx,
  stufe: Stufe,
  opts: {
    untertitelDavor?: string;
    untertitelFortsetzen?: string;
    bild?: string;
  } = {},
): Promise<void> {
  const page = ctx.page;
  const { wartet } = await entscheidung(ctx, stufe);
  if (opts.untertitelDavor) await ov.untertitel(page, opts.untertitelDavor);
  else await warte(page, 2_500);
  // Ein fester Rahmen bleibt stehen, wo das Element vor dem Rollen war: erst weg, dann rollen.
  await ov.rahmenWeg(page);
  const decide = page.locator(".decide").first();
  if (await decide.isVisible().catch(() => false)) {
    await insBild(ctx, decide, "center");
    await ov.rahmen(page, decide, { rand: 8 });
    await warte(page, 2_000);
  }
  if (opts.bild) await schnappschuss(ctx, opts.bild);
  await ov.rahmenWeg(page);
  if (wartet && MODUS === "aufnahme") {
    await ov.untertitelWeg(page);
    const frei = await freigeben(ctx, stufe);
    if (frei) await ketteFortsetzen(ctx, opts.untertitelFortsetzen);
    return;
  }
  if (wartet)
    ctx.z.notiz(
      `Trockenlauf: Wartepunkt ${STUFE[stufe].name} wartet, es wird nicht freigegeben`,
    );
  const vorschau = page.locator(".preview").first();
  if (await vorschau.isVisible().catch(() => false)) {
    await insBild(ctx, vorschau, "start");
    await warte(page, 2_500);
  }
  await ov.untertitelWeg(page);
  await ketteFortsetzen(ctx, opts.untertitelFortsetzen);
}

// ── Fachanwendung ───────────────────────────────────────────────────────────

const ANMELDEFELD = '#username, input[name="username"]';

/** Öffnet die Fachanwendung; landet auf der Anmeldemaske oder, mit Sitzung, in der Anwendung. */
async function fachOeffnen(
  ctx: Ctx,
  basis: string,
  pfad = "/",
): Promise<"anmeldung" | "anwendung" | "nichts"> {
  const page = ctx.page;
  await page.goto(basis + pfad, { waitUntil: "domcontentloaded" });
  const feld = page.locator(ANMELDEFELD).first();
  const anwendung = page
    .locator('[data-testid="kopfband-stand"], nav a.nav-link')
    .first();
  await Promise.race([
    feld.waitFor({ state: "visible", timeout: 25_000 }),
    anwendung.waitFor({ state: "visible", timeout: 25_000 }),
  ]).catch(() => {});
  await warte(page, 800);
  await ov.markeErneuern(page);
  if (await feld.isVisible().catch(() => false)) return "anmeldung";
  if (await anwendung.isVisible().catch(() => false)) return "anwendung";
  return "nichts";
}

/** Anmeldung mit dem veröffentlichten Vorführkonto der Fachanwendung. */
async function fachAnmelden(ctx: Ctx): Promise<boolean> {
  const page = ctx.page;
  const feld = page.locator(ANMELDEFELD).first();
  if (!(await feld.isVisible().catch(() => false))) return true;
  await feld.click();
  await feld.pressSequentially(FACH_USER, { delay: 45 });
  const pass = page.locator('#password, input[name="password"]').first();
  await pass.click();
  await pass.fill(FACH_PASS);
  await warte(page, 700);
  await page.locator('#kc-login, button[type="submit"]').first().click();
  const kopfband = page.locator('[data-testid="kopfband-stand"]').first();
  const ok = await kopfband
    .waitFor({ state: "visible", timeout: 40_000 })
    .then(() => true)
    .catch(() => false);
  await warte(page, 1_000);
  await ov.markeErneuern(page);
  return ok;
}

async function fachNavigieren(
  ctx: Ctx,
  basis: string,
  pfad: string,
  bereit: string,
): Promise<void> {
  const page = ctx.page;
  await page.goto(basis + pfad, { waitUntil: "domcontentloaded" });
  await page
    .locator(bereit)
    .first()
    .waitFor({ state: "visible", timeout: 30_000 })
    .catch(() => {});
  await warte(page, 1_200);
  await ov.markeErneuern(page);
}

// ── Die Kapitel ─────────────────────────────────────────────────────────────

async function k1(ctx: Ctx): Promise<void> {
  await app(ctx, "/codegen/dashboard", ".page-title, mat-toolbar, header");
  const zeilen = karte("K1");
  await ov.titelkarte(ctx.page, TITEL.haupt, TITEL.neben, zeilen[0], 7_500);
  await ov.aktkarte(ctx.page, 1, AKTE[1]);
}

async function k2(ctx: Ctx): Promise<void> {
  const stand = await fachOeffnen(ctx, FACH_MAIN);
  ctx.z.notiz(`Fachanwendung main: ${stand}`);
  const saetze = karte("K2");
  await ov.kapitelkarte(
    ctx.page,
    2,
    KAPITEL.K2.titel,
    saetze,
    ov.kartenzeit(saetze),
  );
  await untertitel(ctx, "K2", "a");
}

async function k3(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  const ok = await fachAnmelden(ctx);
  if (!ok) ctx.z.notiz("Kopfband nach der Anmeldung nicht erschienen");
  // Das Kopfband liegt am oberen Bildrand; ein Rahmen um das ganze Band wäre
  // oben abgeschnitten, also wird der Zweig selbst gerahmt.
  const zweig = page.locator('[data-testid="kopfband-stand"]').first();
  const stand = (await zweig.textContent().catch(() => ""))?.trim();
  ctx.z.notiz(`Kopfband: ${stand || "–"}`);
  await ov.rahmen(
    page,
    (await zweig.count()) ? zweig : page.locator('[role="note"]').first(),
    { rand: 6 },
  );
  await untertitel(ctx, "K3", "a");
  await schnappschuss(ctx, "k3-anmeldung");

  // Die Vorgangsliste: die Dienststelle führt viele Fälle in verschiedenen
  // Zuständen. Ohne sie wirkt das Verfahren wie eine einzige Zeile.
  const vorgaenge = page
    .locator("nav a.nav-link", { hasText: /^Vorgänge$/ })
    .first();
  if (await vorgaenge.isVisible().catch(() => false)) {
    await vorgaenge.click();
  } else {
    await page.goto(FACH_MAIN + "/vorgaenge", {
      waitUntil: "domcontentloaded",
    });
  }
  const liste = page.locator("table").first();
  const da = await liste
    .waitFor({ state: "visible", timeout: 20_000 })
    .then(() => true)
    .catch(() => false);
  if (da) {
    // Die Zeilen derselben Tabelle zählen, und erst wenn die erste steht: gezählt
    // wurde sonst, bevor die Liste gerendert war — die Notiz sagte „1 Zeile".
    await liste
      .locator("tbody tr")
      .first()
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});
    const zeilen = await liste.locator("tbody tr").count();
    ctx.z.notiz(
      `Vorgangsliste: ${zeilen || (await liste.locator("tr").count()) - 1} Zeile(n)`,
    );
    await insBild(ctx, liste, "start");
    await ov.rahmen(page, liste, { rand: 8 });
    await untertitel(ctx, "K3", "b");
    await ov.rahmenWeg(page);
    await rollen(ctx, 420, 1_600);
    await warte(page, 1_800);
    await schnappschuss(ctx, "k3-vorgaenge");
  } else {
    ctx.z.notiz("Vorgangsliste nicht sichtbar");
    await untertitel(ctx, "K3", "b");
  }
}

async function k4(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  const nav = page
    .locator("nav a.nav-link", { hasText: /^Rückforderungen$/ })
    .first();
  if (await nav.isVisible().catch(() => false)) {
    await nav.click();
  } else {
    await page.goto(FACH_MAIN + "/rueckforderungen", {
      waitUntil: "domcontentloaded",
    });
  }
  const zeile = page
    .locator("table tbody tr")
    .filter({ hasText: AKTENZEICHEN })
    .first();
  await zeile.waitFor({ state: "visible", timeout: 30_000 });
  await warte(page, 1_000);
  await ov.markeErneuern(page);
  await ov.rahmen(page, zeile);
  await untertitel(ctx, "K4", "a");
  await ov.rahmenWeg(page);
  const zelle = zeile.locator('[data-testid="zuschlag"]').first();
  const wert = (await zelle.textContent().catch(() => ""))?.trim();
  ctx.z.notiz(`Säumniszuschlag auf main: ${wert || "–"}`);
  await ov.zoomAuf(page, zelle, 2.2);
  await ov.rahmen(page, zelle, { spot: true, rand: 12 });
  await untertitel(ctx, "K4", "b");
  await schnappschuss(ctx, "k4-zuschlag");
  await ov.rahmenWeg(page);
  await ov.zoomZurueck(page);
}

async function k5(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  const link = page.locator(`a[href$="/antraege/${AKTENZEICHEN}"]`).first();
  if (await link.isVisible().catch(() => false)) {
    await link.click();
  } else {
    await page.goto(FACH_MAIN + "/antraege/" + AKTENZEICHEN, {
      waitUntil: "domcontentloaded",
    });
  }
  const zahlungen = page
    .locator("section.card")
    .filter({ has: page.locator("h2", { hasText: /^Zahlungen$/ }) })
    .first();
  await zahlungen.waitFor({ state: "visible", timeout: 30_000 });
  await warte(page, 800);
  await ov.markeErneuern(page);
  await insBild(ctx, zahlungen, "center");
  const zuschlag = page.locator('[data-testid="saeumnis-zuschlag"]').first();
  await ov.rahmen(
    page,
    (await zuschlag.count()) ? zuschlag.locator("xpath=..") : zahlungen,
    { spot: true, rand: 12 },
  );
  await untertitel(ctx, "K5", "a");
}

async function k6(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  await page.goto(JIRA_URL, {
    waitUntil: "domcontentloaded",
    timeout: WARTE.jira,
  });
  const titel = page.locator("h1").first();
  await titel.waitFor({ state: "visible", timeout: 45_000 }).catch(() => {});
  await warte(page, 2_000);
  await ov.markeErneuern(page);
  const url = page.url();
  if (
    /id\.atlassian\.com|\/login/i.test(url) ||
    (await page
      .locator(ANMELDEFELD)
      .first()
      .isVisible()
      .catch(() => false))
  ) {
    throw new Error(
      `Jira zeigt eine Anmeldemaske (${url}); die Sitzung in auth/jira.json ist abgelaufen`,
    );
  }
  ctx.z.notiz(
    `Jira: ${(await titel.textContent().catch(() => ""))?.trim() || url}`,
  );
  // Das Cookie-Banner wird nur ausgeblendet, nicht beantwortet: keine Zustimmung im Namen
  // des Vorführenden. Gefunden wird es über seine Knöpfe, der Kasten darum verschwindet.
  await page
    .evaluate(() => {
      const knopf = Array.from(document.querySelectorAll("button")).find((b) =>
        /only necessary|accept all|nur notwendige|alle akzeptieren/i.test(
          b.textContent || "",
        ),
      );
      // Der äußerste flache, seitenbreite Vorfahr ist das Banner; ein innerer Kasten
      // ließe den farbigen Rand seines Elternelements stehen.
      let el: HTMLElement | null = knopf ? knopf.parentElement : null;
      let banner: HTMLElement | null = null;
      while (el && el !== document.body) {
        const r = el.getBoundingClientRect();
        if (r.width >= window.innerWidth * 0.9 && r.height < 320) banner = el;
        el = el.parentElement;
      }
      banner?.style.setProperty("display", "none", "important");
      document
        .querySelectorAll("#onetrust-consent-sdk, #onetrust-banner-sdk")
        .forEach((n) => {
          (n as HTMLElement).style.setProperty("display", "none", "important");
        });
    })
    .catch(() => {});
  await warte(page, 600);
  await untertitel(ctx, "K6", "a", 5_000);
  await rollen(ctx, 500, 1_800);
  await warte(page, 2_500);
  // Der Text des Tickets ist die halbe Beweisführung: was darin steht und was
  // nicht, entscheidet, ob die Triage später etwas geleistet hat.
  await untertitel(ctx, "K6", "b", 6_000);
  await rollen(ctx, 500, 1_800);
  await warte(page, 2_500);
  await schnappschuss(ctx, "k6-jira");
}

/** Ein Einstellungsfeld nach seiner Beschriftung rahmen. */
async function feld(ctx: Ctx, beschriftung: string): Promise<boolean> {
  const t = ctx.page.getByText(beschriftung, { exact: true }).first();
  if (!(await t.count())) {
    ctx.z.notiz(`Einstellung „${beschriftung}“ nicht gefunden`);
    return false;
  }
  const kachel = t.locator(
    'xpath=ancestor::*[contains(@class,"setting-field")][1]',
  );
  const ziel = (await kachel.count()) ? kachel : t;
  await insBild(ctx, ziel, "center");
  return ov.rahmen(ctx.page, ziel, { rand: 14 });
}

async function k7(ctx: Ctx): Promise<void> {
  await app(
    ctx,
    "/codegen/settings?section=execution-platform",
    ".configuration-workbench",
  );
  await ctx.page
    .getByText("Ausführungsplattform")
    .first()
    .waitFor({ state: "visible", timeout: 20_000 })
    .catch(() => {});
  await feld(ctx, "Plattform-Modus");
  await untertitel(ctx, "K7", "a");
  await schnappschuss(ctx, "k7-plattform");
  await ov.rahmenWeg(ctx.page);
  await app(
    ctx,
    "/codegen/settings?section=behavior",
    ".configuration-workbench",
  );
  await feld(ctx, "Wiederverwendung fertiger Arbeit");
  await untertitel(ctx, "K7", "b");
  await schnappschuss(ctx, "k7-wiederverwendung");
}

async function k8(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  await app(ctx, "/codegen/jira-input", ".picker-field input");
  const suche = page.locator(".picker-field input").first();
  await suche.click();
  await suche.pressSequentially(TICKET, { delay: 70 });
  const option = page
    .locator("mat-option")
    .filter({
      has: page.locator(".opt-key", { hasText: new RegExp(`^${TICKET}$`) }),
    })
    .first();
  const gefunden = await option
    .waitFor({ state: "visible", timeout: 25_000 })
    .then(() => true)
    .catch(() => false);
  if (!gefunden)
    throw new Error(`Jira-Suche liefert ${TICKET} nicht (Jira verbunden?)`);
  await warte(page, 600);
  await option.click();
  const karte = page.locator(".item-card").first();
  await karte.waitFor({ state: "visible", timeout: 90_000 });
  await warte(page, 1_500);
  const grossbild = page
    .locator(".section-label")
    .filter({ hasText: /Großbild|Big Picture/ })
    .first();
  if (await grossbild.count()) {
    await insBild(ctx, grossbild, "start");
    await rollen(ctx, -120, 400);
    await ov.rahmen(page, page.locator(".bp-grid").first(), { rand: 12 });
  }
  await untertitel(ctx, "K8", "a", 7_000);
  await ov.rahmenWeg(page);
  const erzeugen = page
    .getByRole("button", { name: /Lösungskonzept erzeugen/ })
    .first();
  if (await erzeugen.isVisible().catch(() => false)) {
    // Gezeigt, nicht gedrückt. Ein hier erzeugtes Konzept nähme der Triage
    // vorweg, was der Film gleich als ihre Arbeit zeigt; der Knopf bleibt im
    // Bild, damit die Möglichkeit sichtbar ist.
    await insBild(ctx, erzeugen, "center");
    await ov.rahmen(page, erzeugen, { rand: 10 });
    await warte(page, 2_500);
    await ov.rahmenWeg(page);
    ctx.z.notiz("Lösungskonzept erzeugen gezeigt, nicht ausgelöst");
  } else {
    ctx.z.notiz("Knopf „Lösungskonzept erzeugen“ nicht sichtbar");
  }
  const verwenden = page
    .getByRole("button", { name: /In Pipeline verwenden/ })
    .first();
  await insBild(ctx, verwenden, "center");
  await ov.rahmen(page, verwenden, { rand: 10 });
  await warte(page, 1_200);
  await verwenden.click();
  await page.waitForURL(/\/codegen\/run/, { timeout: 30_000 });
  await warte(page, 1_500);
  await ov.markeErneuern(page);
  await untertitel(ctx, "K8", "b");
}

async function k9(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  if (!/\/codegen\/run/.test(page.url()))
    await app(ctx, "/codegen/run", ".page-title");
  const vorher = (await status(ctx))?.run_id ?? null;
  const davor = page.locator(".before-card").first();
  if (
    await davor
      .waitFor({ state: "visible", timeout: 20_000 })
      .then(() => true)
      .catch(() => false)
  ) {
    await insBild(ctx, davor, "start");
    await ov.rahmen(page, davor, { rand: 8 });
  } else {
    ctx.z.notiz("Karte „Vor dem Lauf“ nicht sichtbar");
  }
  await untertitel(ctx, "K9", "a", 7_000);
  await ov.rahmenWeg(page);

  const laufsets = page
    .locator(".mode-tab")
    .filter({ hasText: /Laufsets/ })
    .first();
  if (await laufsets.isVisible().catch(() => false)) await laufsets.click();
  await warte(page, 600);
  // Das Laufset heißt in der deutschen Oberfläche „Gesamte Pipeline“, im Backend „Full Pipeline“;
  // gefunden wird es über beide Namen, notfalls über seine neun Phasen.
  let zeile = page
    .locator(".preset-row")
    .filter({ has: page.locator("strong", { hasText: LAUFSET }) })
    .first();
  if (!(await zeile.count()))
    zeile = page
      .locator(".preset-row")
      .filter({ hasText: /9 Phasen|9 phases/ })
      .first();
  await zeile.waitFor({ state: "visible", timeout: 15_000 });
  ctx.z.notiz(
    `Laufset: ${(
      await zeile
        .locator("strong")
        .first()
        .textContent()
        .catch(() => "")
    )?.trim()}`,
  );
  await insBild(ctx, zeile, "center");
  await zeile.click();
  await warte(page, 800);
  await ov.rahmen(page, zeile, { rand: 6 });
  await warte(page, 1_500);
  await ov.rahmenWeg(page);

  const parallel = page.locator(".parallel-section").first();
  if (await parallel.isVisible().catch(() => false)) {
    const an = await parallel
      .evaluate((el) => el.classList.contains("parallel-active"))
      .catch(() => false);
    if (an) {
      await parallel.locator(".parallel-header").first().click();
      await warte(page, 800);
      ctx.z.notiz("Parallelverarbeitung war an und wurde ausgeschaltet");
    }
    await insBild(ctx, parallel, "center");
    await ov.rahmen(page, parallel, { rand: 6 });
    await warte(page, 1_500);
    await ov.rahmenWeg(page);
  }

  const zusammenfassung = page.locator(".run-summary-panel").first();
  await insBild(ctx, zusammenfassung, "center");
  await ov.rahmen(page, zusammenfassung, { rand: 8 });
  await warte(page, 1_800);
  const start = page.locator("button.run-btn").first();
  if (await start.isDisabled().catch(() => false)) {
    const trotzdem = page.locator(".run-blocked-note button.link").first();
    if (await trotzdem.isVisible().catch(() => false)) {
      ctx.z.notiz(
        "Start durch eine offene Entscheidung gesperrt — „Trotzdem starten“",
      );
      await trotzdem.click();
      await warte(page, 600);
    }
  }
  await schnappschuss(ctx, "k9-start");
  await start.click();
  await ov.rahmenWeg(page);
  const s = await neuerLauf(ctx, vorher);
  if (!s)
    throw new Error("Der Lauf ist nach dem Start nicht im Status erschienen");
}

async function k10(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  const s = await warteAuf(
    ctx,
    "Wissen und Triage",
    (st) =>
      phaseFertig(st, "triage") ||
      pausiert(st) ||
      (beendet(st) && !pausiert(st)),
    WARTE.wissen,
  );
  ctx.z.befund("lauf_nach_k10", {
    run_id: s?.run_id ?? null,
    state: s?.state,
    run_outcome: s?.run_outcome,
    phasen: phasenBefund(s),
  });
  if (!/\/codegen\/run/.test(page.url()))
    await app(ctx, "/codegen/run", ".page-title");
  const stepper = page.locator("app-pipeline-stepper").first();
  await stepper.waitFor({ state: "visible", timeout: 20_000 });
  await insBild(ctx, page.locator(".status-card").first(), "start");
  await warte(page, 800);
  // Der Stepper füllt die Breite; mehr als ein leichter Zoom schöbe die letzte Phase aus dem Bild.
  await ov.zoomAuf(page, stepper, 1.15);
  await ov.rahmen(page, stepper, { rand: 12 });
  await untertitel(ctx, "K10", "a");
  await schnappschuss(ctx, "k10-stepper");
  await ov.rahmenWeg(page);
  await ov.zoomZurueck(page);

  const logKarte = page.locator(".log-card").first();
  if (await logKarte.isVisible().catch(() => false)) {
    const filter = logKarte.locator(".log-search-field input").first();
    if (await filter.isVisible().catch(() => false)) {
      await filter.click();
      await filter.pressSequentially("reused", { delay: 60 });
      await warte(page, 1_200);
    }
    await insBild(ctx, logKarte, "start");
    await ov.zoomAuf(page, logKarte.locator(".log-viewport").first(), 1.3);
    await ov.rahmen(page, logKarte.locator(".log-viewport").first(), {
      rand: 8,
    });
    await untertitel(ctx, "K10", "b");
    await schnappschuss(ctx, "k10-log-reused");
    await ov.rahmenWeg(page);
    await ov.zoomZurueck(page);
    if (await filter.isVisible().catch(() => false)) await filter.fill("");
  } else {
    ctx.z.notiz("Live-Ausgabe nicht sichtbar");
    await untertitel(ctx, "K10", "b");
  }
  await laufBefund(ctx, "lauf_nach_wissen");
}

/** Ein Kapitel des Dossiers von seiner Überschrift bis zu seinem Fuß zeigen.
 *
 * Die Länge des Kapitels bestimmt die Zahl der Züge, damit ein kurzes nicht
 * ins Leere rollt und ein langes nicht auf halbem Weg endet.
 */
async function dossierKapitel(
  ctx: Ctx,
  titel: RegExp,
  key: string,
  bild: string,
): Promise<void> {
  const page = ctx.page;
  const kapitel = await abschnitt(ctx, titel);
  if (!kapitel) {
    ctx.z.notiz(`Dossier-Kapitel ${titel} nicht gefunden`);
    await untertitel(ctx, "K11", key);
    return;
  }
  await warte(page, 1_500);
  await untertitel(ctx, "K11", key);
  const hoehe = await kapitel
    .evaluate((el) => (el as HTMLElement).getBoundingClientRect().height)
    .catch(() => 0);
  const zuege = Math.max(2, Math.min(6, Math.round(hoehe / 620)));
  for (let i = 0; i < zuege; i += 1) {
    await rollen(ctx, 580, 1_900);
    await warte(page, 1_500);
  }
  await schnappschuss(ctx, bild);
}

async function k11(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  // Architekturfakten: Bericht, Beleg-Seite, zurück.
  if (await bericht(ctx, "extract")) await warte(page, 2_000);
  await app(ctx, "/codegen/extract", ".verdict, .page-title");
  await ov.rahmen(page, page.locator(".verdict").first(), { rand: 8 });
  await untertitel(ctx, "K11", "a");
  await ov.rahmenWeg(page);
  await rollen(ctx, 650, 2_200);
  await warte(page, 1_500);
  await schnappschuss(ctx, "k11-architekturfakten");
  await bericht(ctx, "extract");
  await warte(page, 1_500);

  // Architektursynthese: Bericht, Beleg-Seite, zurück.
  if (await bericht(ctx, "analyze")) await warte(page, 1_500);
  await app(ctx, "/codegen/analyze", ".thesis-card, .page-title");
  await ov.rahmen(page, page.locator(".thesis-card").first(), { rand: 8 });
  await untertitel(ctx, "K11", "b");
  await ov.rahmenWeg(page);
  await rollen(ctx, 700, 2_200);
  await warte(page, 1_500);
  await schnappschuss(ctx, "k11-architektursynthese");
  await bericht(ctx, "analyze");
  await warte(page, 1_500);

  // Architekturdossier: im Bericht, und drei Kapitel im Durchlauf — ein C4-Dokument
  // ganz, dann die Bausteinsicht und die Laufzeitsicht aus arc42. Ein Dossier, das
  // nur als Überschrift vorkommt, belegt nichts; gelesen wird es im Bild.
  await bericht(ctx, "document");
  // Der Kopf nennt die Zahl der Kapitel und die Bewertung; erst danach werden
  // drei gelesen, damit niemand die drei für das ganze Dossier hält.
  // Eine schlichte Abschnittsüberschrift trägt Leerraum um ihren Text; ein
  // verankertes Muster fand sie nicht und der Kopf blieb ungerahmt.
  const dossierKopf = await abschnitt(ctx, /^\s*Dossier\s*$/i);
  await ov.rahmen(page, dossierKopf ?? page.locator(".report-head").first(), {
    rand: 8,
  });
  await untertitel(ctx, "K11", "c", 8_000);
  await ov.rahmenWeg(page);
  await dossierKapitel(
    ctx,
    /C4 level 1|C4-Ebene 1|System Context/i,
    "d",
    "k11-c4-kontext",
  );
  await dossierKapitel(
    ctx,
    /Building Block View|Bausteinsicht/i,
    "e",
    "k11-bausteinsicht",
  );
  await dossierKapitel(
    ctx,
    /Runtime View|Laufzeitsicht/i,
    "f",
    "k11-laufzeitsicht",
  );
  await schnappschuss(ctx, "k11-dossier");
}

async function k12(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  await bericht(ctx, "triage");
  // Erst das Verständnis, dann der Vorschlag. Die Triage schreibt auf, was sie
  // aus Ticket und Bestand gelesen hat — Ziel, AS-IS gegen TO-BE, technischer
  // Kontext — bevor sie irgendetwas vorschlägt; ohne diesen Schritt wirkt das
  // Konzept wie geraten.
  const tv = await abschnitt(ctx, /ticket understanding|Ticketverständnis/i);
  if (tv) {
    await insBild(ctx, tv, "start");
    await untertitel(ctx, "K12", "v");
    if (await stelle(ctx, tv, ueberschrift("AS-IS"))) await warte(page, 1_800);
    await ov.rahmenWeg(page);
    if (!(await stelle(ctx, tv, ueberschrift("Technical Context")))) {
      ctx.z.notiz("Abschnitt „Technical Context“ nicht gefunden");
    }
    await untertitel(ctx, "K12", "t");
    await ov.rahmenWeg(page);
    await schnappschuss(ctx, "k12-ticketverstaendnis");
  }
  const sc = await abschnitt(ctx, /Lösungskonzept|solution concept/i);
  if (!sc) throw new Error("Lösungskonzept im Triage-Bericht nicht gefunden");
  // Die Berichtsfläche stuft Markdown-Überschriften herab (`#` wird <h2>), also alle Ebenen zulassen.
  if (await stelle(ctx, sc, ueberschrift("Root Cause Analysis"))) {
    // Erst benennen, was hier geschieht, dann das Ergebnis: die Vorschrift aus
    // dem Ticket und die Methode aus dem Bestand stehen im selben Bild.
    await untertitel(ctx, "K12", "a");
    await untertitel(ctx, "K12", "a2");
    await schnappschuss(ctx, "k12-root-cause");
  } else {
    ctx.z.notiz("Abschnitt „Root Cause Analysis“ nicht gefunden");
    await untertitel(ctx, "K12", "a");
    await untertitel(ctx, "K12", "a2");
  }
  await ov.rahmenWeg(page);
  if (await stelle(ctx, sc, ueberschrift("Fix", true))) {
    await untertitel(ctx, "K12", "b");
  } else {
    ctx.z.notiz("Abschnitt „Fix“ nicht gefunden");
    await untertitel(ctx, "K12", "b");
  }
  await ov.rahmenWeg(page);
  const keyChanges = sc.locator(ueberschrift("Key Changes")).first();
  if (await keyChanges.count()) {
    await insBild(ctx, keyChanges, "start");
    await rollen(ctx, -140, 500);
    const tabelle = keyChanges.locator("xpath=following-sibling::table[1]");
    await ov.rahmen(page, (await tabelle.count()) ? tabelle : keyChanges, {
      spot: true,
      rand: 12,
    });
  }
  await untertitel(ctx, "K12", "c", 6_500);
  await ov.rahmenWeg(page);
  const leitplanken = await abschnitt(
    ctx,
    /Qualitätsbefunde|Quality findings|Leitplanken/i,
  );
  if (leitplanken) {
    await ov.rahmen(page, leitplanken, { rand: 8 });
    await warte(page, 4_000);
    await schnappschuss(ctx, "k12-leitplanken");
  }
}

async function k13(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  await warteAufHalt(ctx, "plan", WARTE.halt);
  await app(ctx, "/codegen/run", ".page-title");
  const stepper = page.locator("app-pipeline-stepper").first();
  if (await stepper.isVisible().catch(() => false)) {
    await insBild(ctx, page.locator(".status-card").first(), "start");
    await ov.rahmen(page, stepper, { rand: 10 });
  }
  await untertitel(ctx, "K13", "a");
  await ov.rahmenWeg(page);
  await wartepunkt(ctx, "concept", {
    untertitelFortsetzen: text("K13", "b"),
    bild: "k13-entscheidung-konzept",
  });
}

async function k14(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  await warteAufHalt(ctx, "implement", WARTE.halt);
  await bericht(ctx, "plan");
  const pakete = await abschnitt(ctx, /Arbeitspakete|Work packages/i);
  if (pakete) await ov.rahmen(page, pakete, { rand: 8 });
  await untertitel(ctx, "K14", "a");
  await ov.rahmenWeg(page);
  const komponenten = await abschnitt(
    ctx,
    /Betroffene Komponenten|components/i,
  );
  if (komponenten) {
    await ov.rahmen(page, komponenten, { rand: 8 });
    await warte(page, 3_000);
    await ov.rahmenWeg(page);
  }
  const schritte = await abschnitt(ctx, /Schritte|steps/i);
  if (schritte) {
    await ov.rahmen(page, schritte, { rand: 8 });
    await warte(page, 3_000);
    await ov.rahmenWeg(page);
  }
  await schnappschuss(ctx, "k14-plan");
  await wartepunkt(ctx, "plan", { bild: "k14-entscheidung-plan" });
}

async function k15(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  await warteAuf(
    ctx,
    "Umsetzung",
    (s) =>
      phaseFertig(s, "implement") ||
      (pausiert(s) && haltPhase(s) === "deliver") ||
      (beendet(s) && !pausiert(s)),
    WARTE.phase,
  );
  await bericht(ctx, "implement");
  await ov.rahmen(page, page.locator(".report-head").first(), { rand: 8 });
  await untertitel(ctx, "K15", "a", 6_000);
  await ov.rahmenWeg(page);
  const dateien = await abschnitt(ctx, /Geänderte Dateien|files/i);
  if (dateien) {
    await ov.rahmen(page, dateien, { rand: 8 });
    await warte(page, 3_500);
    await ov.rahmenWeg(page);
  }
  const bau = await abschnitt(ctx, /\bBau\b|build/i);
  if (bau) {
    await ov.rahmen(page, bau, { rand: 8 });
    await warte(page, 3_000);
    await ov.rahmenWeg(page);
  }
  await schnappschuss(ctx, "k15-ausfuehrung");
}

async function k16(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  await warteAuf(
    ctx,
    "Prüfung",
    (s) =>
      phaseFertig(s, "verify") ||
      (pausiert(s) && haltPhase(s) === "deliver") ||
      (beendet(s) && !pausiert(s)),
    WARTE.phase,
  );
  await bericht(ctx, "verify");
  await ov.rahmen(page, page.locator(".report-head").first(), { rand: 8 });
  await untertitel(ctx, "K16", "a");
  await ov.rahmenWeg(page);
  const kriterien = await abschnitt(
    ctx,
    /Akzeptanzkriterien|acceptance criteria/i,
  );
  if (kriterien) {
    await ov.rahmen(page, kriterien, { rand: 8 });
    await warte(page, 3_500);
    await ov.rahmenWeg(page);
  }
  const lauf = await abschnitt(ctx, /Wie es ausgeführt wurde|how it was run/i);
  if (lauf) {
    await ov.rahmen(page, lauf, { rand: 8 });
    await warte(page, 3_000);
    await ov.rahmenWeg(page);
  }
  await schnappschuss(ctx, "k16-pruefung");
}

async function k17(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  await warteAufHalt(ctx, "deliver", WARTE.halt);
  await wartepunkt(ctx, "delivery", {
    untertitelDavor: text("K17", "a"),
    bild: "k17-entscheidung-lieferung",
  });
  await warteAuf(
    ctx,
    "Lieferung",
    (s) => phaseFertig(s, "deliver") || (beendet(s) && !pausiert(s)),
    WARTE.phase,
  );
  await laufBefund(ctx, "lauf_ende");
  if (!/\/codegen\/run/.test(page.url()))
    await app(ctx, "/codegen/run", ".page-title");
  const stepper = page.locator("app-pipeline-stepper").first();
  if (await stepper.isVisible().catch(() => false)) {
    await insBild(ctx, page.locator(".status-card").first(), "start");
    await ov.zoomAuf(page, stepper, 1.15);
    await ov.rahmen(page, stepper, { rand: 12 });
    await warte(page, 4_000);
    await schnappschuss(ctx, "k17-stepper-neun-phasen");
    await ov.rahmenWeg(page);
    await ov.zoomZurueck(page);
  }
  await bericht(ctx, "deliver");
  const branches = await abschnitt(ctx, /^Branches$|Branches/i);
  if (branches) await ov.rahmen(page, branches, { rand: 8 });
  await untertitel(ctx, "K17", "b");
  await ov.rahmenWeg(page);
  const pr = await abschnitt(ctx, /Pull Request/i);
  if (pr) {
    await ov.rahmen(page, pr, { rand: 8 });
    await warte(page, 3_000);
    await ov.rahmenWeg(page);
  }
  const bewertung = await abschnitt(ctx, /Dossier-Prüfung|Dossier check/i);
  if (bewertung) {
    await ov.rahmen(page, bewertung, { rand: 8 });
    await warte(page, 2_500);
  }
  await schnappschuss(ctx, "k17-lieferung");
}

async function k18(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  await app(ctx, "/codegen/changes", ".pack-head, .empty");
  const koepfe = page.locator(".file-head");
  const n = await koepfe.count();
  if (!n) throw new Error("Seite Änderungen zeigt keine Dateien");
  for (let i = 0; i < n; i += 1) {
    const kopf = koepfe.nth(i);
    const offen = await kopf
      .locator(".chevron")
      .textContent()
      .catch(() => "");
    if (!/expand_more/.test(offen || "")) await kopf.click();
    await warte(page, 400);
  }
  await insBild(ctx, page.locator(".pack-head").first(), "start");
  await ov.rahmen(
    page,
    page
      .locator(".section-card")
      .filter({ has: page.locator(".pack-head") })
      .first(),
    { rand: 6 },
  );
  await untertitel(ctx, "K18", "a");
  await ov.rahmenWeg(page);
  const zeile = page
    .locator(".diff .dl")
    .filter({ hasText: /abrund|BEMESSUNG|floorDiv|\b5_?000\b|\/ 50|50 Euro/i })
    .first();
  if (await zeile.count()) {
    await insBild(ctx, zeile, "center");
    await ov.zoomAuf(page, zeile, 1.7);
    await ov.rahmen(page, zeile, { spot: true, rand: 8 });
    await warte(page, 5_000);
    await schnappschuss(ctx, "k18-abrundung");
    await ov.rahmenWeg(page);
    await ov.zoomZurueck(page);
  } else {
    ctx.z.notiz("keine Diff-Zeile mit der Abrundung gefunden");
    await rollen(ctx, 600, 2_000);
    await warte(page, 2_000);
  }
}

async function k19(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  await page.goto(GITHUB_COMPARE, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  const diff = page
    .locator(
      '#files, #files_bucket, [data-testid="diff-content"], .js-diff-progressive-container',
    )
    .first();
  await diff.waitFor({ state: "visible", timeout: 45_000 }).catch(() => {});
  await warte(page, 2_000);
  await ov.markeErneuern(page);
  await untertitel(ctx, "K19", "a", 5_500);
  if (await diff.isVisible().catch(() => false)) {
    await insBild(ctx, diff, "start");
  } else {
    await rollen(ctx, 700, 2_000);
  }
  await warte(page, 3_000);
  await rollen(ctx, 600, 2_000);
  await warte(page, 2_500);
  await schnappschuss(ctx, "k19-github");
}

async function k20(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  await app(ctx, "/codegen/history", ".history-table, .empty-state");
  const zeilen = page.locator(".history-table .table-row");
  const n = await zeilen.count();
  if (!n) throw new Error("Verlauf ist leer");
  // Die jüngsten Läufe stehen oben: der Lauf des Videos und seine Fortsetzungen in Sekunden,
  // darunter die Kette vom 15. September in Minuten. Die ersten Zeilen bekommen den Rahmen.
  await insBild(ctx, zeilen.first(), "start");
  await rollen(ctx, -160, 400);
  const oben = zeilen.first();
  const unten = zeilen.nth(Math.min(n, 5) - 1);
  const a = await oben.boundingBox().catch(() => null);
  const b = await unten.boundingBox().catch(() => null);
  if (a && b) {
    await ov.rahmenBox(
      page,
      { x: a.x, y: a.y, width: a.width, height: b.y + b.height - a.y },
      { rand: 8 },
    );
  } else {
    await ov.rahmen(page, page.locator(".history-table").first(), { rand: 6 });
  }
  await untertitel(ctx, "K20", "a");
  await schnappschuss(ctx, "k20-verlauf");
  await ov.rahmenWeg(page);
  await rollen(ctx, 500, 2_000);
  await warte(page, 2_500);
}

async function k21(ctx: Ctx): Promise<void> {
  const page = ctx.page;
  const stand = await fachOeffnen(ctx, FACH_FIXED);
  ctx.z.notiz(`Fachanwendung Branch-Welt: ${stand}`);
  await fachAnmelden(ctx);
  const kopfband = page.locator('[data-testid="kopfband-stand"]').first();
  await kopfband.waitFor({ state: "visible", timeout: 30_000 }).catch(() => {});
  const zweig = (await kopfband.textContent().catch(() => ""))?.trim();
  ctx.z.notiz(`Kopfband Branch-Welt: ${zweig || "–"}`);
  await ov.rahmen(
    page,
    (await kopfband.count()) ? kopfband : page.locator('[role="note"]').first(),
    { rand: 6 },
  );
  await untertitel(ctx, "K21", "a");
  await ov.rahmenWeg(page);

  await fachNavigieren(ctx, FACH_FIXED, "/systemstand", "table");
  await ov.rahmen(page, page.locator("table").first(), { rand: 8 });
  await warte(page, 4_000);
  await schnappschuss(ctx, "k21-stand");
  await ov.rahmenWeg(page);

  await fachNavigieren(ctx, FACH_FIXED, "/rueckforderungen", "table tbody tr");
  const zeile = page
    .locator("table tbody tr")
    .filter({ hasText: AKTENZEICHEN })
    .first();
  await zeile.waitFor({ state: "visible", timeout: 30_000 });
  const zelle = zeile.locator('[data-testid="zuschlag"]').first();
  const wert = (await zelle.textContent().catch(() => ""))?.trim();
  ctx.z.notiz(`Säumniszuschlag in der Branch-Welt: ${wert || "–"}`);
  await ov.zoomAuf(page, zelle, 2.2);
  await ov.rahmen(page, zelle, { spot: true, rand: 12 });
  await untertitel(ctx, "K21", "b");
  await schnappschuss(ctx, "k21-zuschlag");
  await ov.rahmenWeg(page);
  await ov.zoomZurueck(page);

  await fachNavigieren(
    ctx,
    FACH_FIXED,
    "/antraege/" + AKTENZEICHEN,
    "section.card",
  );
  const zahlungen = page
    .locator("section.card")
    .filter({ has: page.locator("h2", { hasText: /^Zahlungen$/ }) })
    .first();
  if (await zahlungen.count()) {
    await insBild(ctx, zahlungen, "center");
    const zuschlag = page.locator('[data-testid="saeumnis-zuschlag"]').first();
    await ov.rahmen(
      page,
      (await zuschlag.count()) ? zuschlag.locator("xpath=..") : zahlungen,
      { spot: true, rand: 12 },
    );
    await warte(page, 4_000);
  }
}

async function k22(ctx: Ctx): Promise<void> {
  const zeilen = karte("K22");
  await ov.schlusskarte(ctx.page, zeilen[0], zeilen[1], 6_500, 6_500);
}

// ── Der Film ────────────────────────────────────────────────────────────────

test.describe("Drehbuch", () => {
  test(`Von der Anforderung bis zur Auslieferung (${MODUS})`, async ({
    page,
  }) => {
    test.setTimeout(7_200_000);
    if (!SDLC_URL) {
      throw new Error(
        "SDLC_URL fehlt. Die Adresse der Oberfläche wechselt mit jedem Start der Desktop-Anwendung; " +
          "finde sie mit `lsof -nP -iTCP -sTCP:LISTEN | grep '^SDLC'` und setze z. B. SDLC_URL=http://127.0.0.1:61972.",
      );
    }
    fs.mkdirSync(KONTROLLE, { recursive: true });
    const z = new Zeitachse(ZEITACHSE, MODUS);
    const ctx: Ctx = { page, z, bildNr: 0 };

    // Deutsche Oberfläche in beiden Anwendungen, unabhängig von der Sprache des Rechners.
    await page.addInitScript(() => {
      try {
        localStorage.setItem("sdlcpilot.ui-language", "de-DE");
        localStorage.setItem("stromentlastung.lang", "de");
      } catch {
        /* fremde Ursprünge ohne Speicher */
      }
    });

    const gesundheit = await api<{ version?: string; build?: string }>(
      ctx,
      "/api/health",
    );
    z.befund("umgebung", {
      modus: MODUS,
      sdlc_url: SDLC_URL,
      sdlc_api: SDLC_API,
      build: gesundheit?.build ?? null,
      version: gesundheit?.version ?? null,
      fach_main: FACH_MAIN,
      fach_fixed: FACH_FIXED,
      jira_sitzung: fs.existsSync(JIRA_AUTH),
    });
    console.log(
      `Modus ${MODUS} · SDLC Pilot ${gesundheit?.version ?? "?"} (${gesundheit?.build ?? "Build unbekannt"}) · ${SDLC_URL}`,
    );
    if (!gesundheit)
      console.warn(`Warnung: ${SDLC_API}/api/health antwortet nicht.`);

    z.start();

    // Akt 1 · Der Auftrag
    await kapitel(ctx, "K1", () => k1(ctx));
    await kapitel(ctx, "K2", () => k2(ctx));
    await kapitel(ctx, "K3", () => k3(ctx));
    await kapitel(ctx, "K4", () => k4(ctx));
    await kapitel(ctx, "K5", () => k5(ctx));
    if (fs.existsSync(JIRA_AUTH)) {
      await kapitel(ctx, "K6", () => k6(ctx));
    } else {
      console.warn(
        "K6 übersprungen: video/auth/jira.json fehlt (Jira-Sitzung einmal speichern, siehe README).",
      );
      z.uebersprungen(
        "K6",
        KAPITEL.K6.titel,
        "auth/jira.json fehlt — keine gespeicherte Jira-Sitzung",
        KAPITEL.K6.kurz,
      );
    }

    // Akt 2 · Der Lauf
    z.kapitel("A2", `Akt 2 · ${AKTE[2]}`, true);
    await app(ctx, "/codegen/dashboard", ".page-title, header");
    await ov.aktkarte(page, 2, AKTE[2]);
    await kapitel(ctx, "K7", () => k7(ctx));
    await kapitel(ctx, "K8", () => k8(ctx));
    await kapitel(ctx, "K9", () => k9(ctx));
    await kapitel(ctx, "K10", () => k10(ctx));
    await kapitel(ctx, "K11", () => k11(ctx));
    await kapitel(ctx, "K12", () => k12(ctx));
    await kapitel(ctx, "K13", () => k13(ctx));
    await kapitel(ctx, "K14", () => k14(ctx));
    await kapitel(ctx, "K15", () => k15(ctx));
    await kapitel(ctx, "K16", () => k16(ctx));
    await kapitel(ctx, "K17", () => k17(ctx));

    // Akt 3 · Das Ergebnis
    z.kapitel("A3", `Akt 3 · ${AKTE[3]}`, true);
    await ov.aktkarte(page, 3, AKTE[3]);
    await kapitel(ctx, "K18", () => k18(ctx));
    await kapitel(ctx, "K19", () => k19(ctx));
    await kapitel(ctx, "K20", () => k20(ctx));
    await kapitel(ctx, "K21", () => k21(ctx));
    await ov.markeEntfernen(page);
    await kapitel(ctx, "K22", () => k22(ctx));

    await laufBefund(ctx, "lauf_schluss");
    const verlauf = await api<
      {
        run_id: string;
        status: string;
        run_outcome: string;
        phases: string[];
        paused_at?: string;
        resumed_from?: string;
        duration_seconds?: number;
      }[]
    >(ctx, "/api/pipeline/history");
    z.befund(
      "verlauf_juengste",
      (verlauf ?? []).slice(0, 6).map((r) => ({
        run_id: r.run_id,
        status: r.status,
        run_outcome: r.run_outcome,
        phases: r.phases,
        paused_at: r.paused_at ?? null,
        resumed_from: r.resumed_from ?? null,
        duration_s: r.duration_seconds ?? null,
      })),
    );
    z.ende();
    console.log(
      `Aufnahme beendet nach ${z.jetzt()} s; Zeitachse: ${ZEITACHSE}`,
    );
  });
});
