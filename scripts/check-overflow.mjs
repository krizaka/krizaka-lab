#!/usr/bin/env node
/* No horizontal scroll: every page of the lab at 360, 768, 1024 and 1440 px, dark and light, in Playwright's Chromium,
   against the built demo served by `vite preview` (CI: the Pages workflow, before it deploys).
     node scripts/check-overflow.mjs --base http://localhost:4173 */
import { chromium } from "playwright";

export const PATHS = ["/", "/orazaka/", "/yororis/", "/jarvis/", "/liquid-glass/", "/neural-lattice/", "/krizaka-ui/", "/maps/", "/conversation/", "/journey/", "/figures/", "/data-motion/", "/specs/", "/?lang=fr"];
export const WIDTHS = [360, 768, 1024, 1440];

const i = process.argv.indexOf("--base");
const base = (i > 0 ? process.argv[i + 1] : "http://localhost:4173").replace(/\/$/, "");
const browser = await chromium.launch();
const problems = [];
for (const theme of ["dark", "light"])
  for (const width of WIDTHS)
    for (const path of PATHS) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: "reduce" });
      await context.addInitScript((t) => localStorage.setItem("kz-theme", t), theme);
      const page = await context.newPage();
      await page.goto(base + path, { waitUntil: "networkidle" });
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 0) problems.push(`${path} at ${width}px (${theme}): ${over}px of horizontal overflow`);
      await context.close();
    }
await browser.close();
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`check-overflow: ${PATHS.length * WIDTHS.length * 2} page × width × theme, no horizontal scroll`);
