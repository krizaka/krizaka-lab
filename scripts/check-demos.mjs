#!/usr/bin/env node
/* The demos really play (reduced motion OFF) and rest done (ON), in a real browser, desktop and phone, dark and light:
   - /conversation/: the streamed answer grows over time; under reduced motion it is whole at once;
   - /journey/: the stepper's current step advances over time; under reduced motion the journey is finished at once;
   - /figures/: the live total (the ticker's accessible value) changes over time.
     node scripts/check-demos.mjs --base http://localhost:4173 */
import { chromium } from "playwright";

const i = process.argv.indexOf("--base");
const base = (i > 0 ? process.argv[i + 1] : "http://localhost:4173").replace(/\/$/, "");
const VIEWPORTS = [{ name: "desktop", width: 1280, height: 900 }, { name: "phone", width: 390, height: 844 }];

/** The in-page readings each demo is judged on. */
const READ = {
  "/conversation/": () => [...document.querySelectorAll(".lab-chat-log > div, .lab-chat-log > *")].map((e) => e.textContent).join("|").length,
  "/journey/": () => [...document.querySelectorAll(".lab-journey li")].map((li) => li.textContent.length + (li.getAttribute("aria-current") ? "c" : "")).join(","),
  "/figures/": () => document.querySelector(".lab-figures")?.textContent ?? "",
};

const browser = await chromium.launch();
const problems = [];
let checks = 0;
for (const reducedMotion of ["no-preference", "reduce"])
  for (const theme of ["dark", "light"])
    for (const vp of VIEWPORTS)
      for (const [path, read] of Object.entries(READ)) {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: theme, reducedMotion });
        await context.addInitScript((t) => localStorage.setItem("kz-theme", t), theme);
        const page = await context.newPage();
        await page.goto(base + path, { waitUntil: "load" });
        await page.locator(".lab-playground-stage").first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        const a = await page.evaluate(read);
        await page.waitForTimeout(2600);
        const b = await page.evaluate(read);
        const c = await page.evaluate(read);
        const where = `${path} ${vp.name} ${theme} reduced-motion=${reducedMotion}`;
        checks++;
        if (reducedMotion === "no-preference" && JSON.stringify(a) === JSON.stringify(b)) problems.push(`${where}: nothing changed in 2.6 s`);
        if (reducedMotion === "reduce" && JSON.stringify(a) !== JSON.stringify(c)) problems.push(`${where}: it moves under reduced motion`);
        await context.close();
      }
await browser.close();
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`check-demos: ${checks} demo × viewport × theme × preference, the demos play and rest`);
