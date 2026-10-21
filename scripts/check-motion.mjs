#!/usr/bin/env node
/* Motion is real: the engine flow's photons travel and the engine breathes, in a real browser with reduced motion OFF
   (and stand still with it ON). The overflow check runs under reduced motion, so it could never see a frozen figure:
   until krizaka-ui 3.30.1 every dot sat still (a unitless keyframe value is not interpolable with a length).
   Sampled by the dash offsets of the visible stage over ~700 ms, desktop and phone, dark and light.
     node scripts/check-motion.mjs --base http://localhost:4173 */
import { chromium } from "playwright";

export const PATHS = ["/orazaka/", "/krizaka-ui/"]; // the home is by task now (krizaka-ui#434): the engine flow lives on /orazaka/ and the components page
export const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "phone", width: 390, height: 844 },
];

const i = process.argv.indexOf("--base");
const base = (i > 0 ? process.argv[i + 1] : "http://localhost:4173").replace(/\/$/, "");

/** Runs in the page: the distinct dash-offset readings of the visible flow's photons, and the hub's animation. */
export async function sampleFlow(page) {
  await page.locator(".kz-flow").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800); // the loops start ~1.2 s after load (html[data-motion])
  return page.evaluate(async () => {
    const stage = [...document.querySelectorAll(".kz-flow-stage")].find((el) => el.getClientRects().length > 0);
    if (!stage) return { error: "no visible EngineFlow stage" };
    const photons = [...stage.querySelectorAll(".kz-flow-photon:not([data-halo])")];
    if (!photons.length) return { error: "no photon drawn" };
    // One photon's own readings: interpolated, they are many distinct finite lengths; the bug gave two (0 and `calc()`).
    const seen = photons.map(() => new Set());
    for (let n = 0; n < 7; n++) {
      photons.forEach((p, k) => seen[k].add(getComputedStyle(p).strokeDashoffset));
      await new Promise((r) => setTimeout(r, 110));
    }
    const readings = seen.map((set) => [...set]);
    const finite = readings.every((r) => r.every((v) => /^-?[\d.]+(px)?$/.test(v)));
    const distinct = Math.min(...readings.map((r) => r.length));
    const hub = stage.querySelector(".kz-flow-hub-mark");
    return {
      distinct,
      finite,
      running: photons.every((p) => p.getAnimations().some((a) => a.playState === "running")),
      hub: hub ? getComputedStyle(hub).animationName : null,
    };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const browser = await chromium.launch();
  const problems = [];
  let checks = 0;
  for (const reducedMotion of ["no-preference", "reduce"])
    for (const theme of ["dark", "light"])
      for (const vp of VIEWPORTS)
        for (const path of PATHS) {
          const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: theme, reducedMotion });
          await context.addInitScript((t) => localStorage.setItem("kz-theme", t), theme);
          const page = await context.newPage();
          await page.goto(base + path, { waitUntil: "networkidle" });
          const r = await sampleFlow(page);
          const where = `${path} ${vp.name} ${theme} reduced-motion=${reducedMotion}`;
          checks++;
          if (r.error) problems.push(`${where}: ${r.error}`);
          else if (reducedMotion === "reduce") {
            if (r.distinct !== 1) problems.push(`${where}: the photons move (${r.distinct} positions) under reduced motion`);
          } else {
            if (!r.finite) problems.push(`${where}: the dash offset is not an interpolated length`);
            if (r.distinct < 4) problems.push(`${where}: the photons do not travel (${r.distinct} distinct positions in 700 ms)`);
            if (!r.running) problems.push(`${where}: a photon animation is not running`);
            if (r.hub === "none") problems.push(`${where}: the engine does not breathe`);
          }
          await context.close();
        }
  await browser.close();
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log(`check-motion: ${checks} page × viewport × theme × motion preference, the engine flow moves (and rests under reduced motion)`);
}
