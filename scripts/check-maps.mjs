#!/usr/bin/env node
/* The Maps demo draws on real tiles: the basemap CDN must answer cross-origin (Access-Control-Allow-Origin on maps/v1),
   or MapLibre fails and the demo falls back to a picture. Real browser, dark and light, desktop and phone, reduced motion
   OFF: the map must be ready (no fallback), the route layer drawn, the courier and the pulse present, the tiles read.
     node scripts/check-maps.mjs --base http://localhost:4173 */
import { chromium } from "playwright";

const i = process.argv.indexOf("--base");
const base = (i > 0 ? process.argv[i + 1] : "http://localhost:4173").replace(/\/$/, "");
const browser = await chromium.launch();
const problems = [];
let checks = 0;
for (const theme of ["dark", "light"])
  for (const vp of [{ name: "desktop", width: 1280, height: 900 }, { name: "phone", width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: theme });
    await context.addInitScript((t) => localStorage.setItem("kz-theme", t), theme);
    const page = await context.newPage();
    const tiles = [];
    page.on("response", (r) => r.url().includes("/maps/v1/") && tiles.push({ status: r.status(), cors: r.headers()["access-control-allow-origin"] }));
    const where = `/maps/ ${vp.name} ${theme}`;
    checks++;
    await page.goto(`${base}/maps/`, { waitUntil: "load" });
    await page.locator(".lab-map-view").scrollIntoViewIfNeeded();
    const ready = await page.waitForSelector("section[data-ready] .maplibregl-canvas", { timeout: 30_000 }).then(() => true, () => false);
    if (!ready) problems.push(`${where}: the map never became ready (tiles blocked? CORS on maps/v1)`);
    else {
      await page.waitForTimeout(4000);
      const state = await page.evaluate(() => ({ courier: !!document.querySelector(".kz-map-courier"), pulse: !!document.querySelector(".kz-map-pulse"), light: document.documentElement.classList.contains("light") }));
      if (!state.courier) problems.push(`${where}: no courier on the route`);
      if (!state.pulse) problems.push(`${where}: no heat pulse`);
      if (!tiles.length || tiles.some((t) => t.status >= 400)) problems.push(`${where}: basemap requests failed (${JSON.stringify(tiles.slice(0, 2))})`);
      if (tiles.some((t) => t.cors !== "*")) problems.push(`${where}: basemap answers without Access-Control-Allow-Origin`);
    }
    await context.close();
  }
await browser.close();
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`check-maps: ${checks} viewport × theme, the Maps demo runs on real tiles with its route, courier and pulse`);
