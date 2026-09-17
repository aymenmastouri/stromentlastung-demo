import { chromium, defineConfig } from '@playwright/test';
import fs from 'node:fs';

/**
 * Aufnahmeprojekt für das Vorführvideo (video/drehbuch.md).
 *
 * Ein Projekt, ein Browser, ein langer Test: 1920×1080, Video an, keine
 * Wiederholungen. Der Spec liest Adressen und Konten aus der Umgebung
 * (siehe README.md); MODUS=trockenlauf|aufnahme steuert das Verhalten an
 * den Wartepunkten.
 *
 * Fehlt der gebündelte Chromium-Build (der Download von cdn.playwright.dev
 * ist nicht von jedem Netz aus möglich), fährt die Aufnahme mit dem
 * installierten Google Chrome: derselbe Kern, dieselbe Videoaufzeichnung.
 * BROWSER_CHANNEL=chrome erzwingt das; BROWSER_CHANNEL=chromium den Build.
 */
const gebuendelt = fs.existsSync(chromium.executablePath());
const kanalAusUmgebung = process.env['BROWSER_CHANNEL'];
const kanal =
  kanalAusUmgebung === 'chromium' ? undefined : kanalAusUmgebung || (gebuendelt ? undefined : 'chrome');

export default defineConfig({
  testDir: '.',
  testMatch: /drehbuch\.spec\.ts$/,
  timeout: 7_200_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  outputDir: 'out/roh',
  preserveOutput: 'always',
  reporter: [['list']],
  projects: [
    {
      name: 'aufnahme',
      use: {
        browserName: 'chromium',
        channel: kanal,
        headless: true,
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        // Ohne Grenze wartet eine Aktion auf ein nie erscheinendes Element
        // unbegrenzt; die Aufnahme stünde dann still statt weiterzulaufen.
        actionTimeout: 15_000,
        navigationTimeout: 60_000,
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
        video: { mode: 'on', size: { width: 1920, height: 1080 } },
        screenshot: 'off',
        trace: 'off',
      },
    },
  ],
});
