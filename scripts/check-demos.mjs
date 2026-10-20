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
  "/overlays/": () => document.querySelector("[data-testid=active]")?.textContent ?? "",
  "/transitions/": () => document.querySelector("[data-testid=vt-view]")?.textContent ?? "",
  "/data-motion/": () => getComputedStyle(document.querySelector(".kz-grow svg")).clipPath,
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
        // The demo that moves by itself is the last playground of its page (overlays: the indicator).
        const stages = page.locator(".lab-playground-stage");
        await (path === "/conversation/" ? stages.first() : stages.last()).scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        const a = await page.evaluate(read);
        await page.waitForTimeout(2600);
        const b = await page.evaluate(read);
        const c = await page.evaluate(read);
        if (path === "/overlays/") {
          // The dialog enters with an animation (none under reduced motion) and carries its placement.
          const open = page.getByRole("button", { name: /^Open the (sheet|dialog|drawer)/ });
          await open.scrollIntoViewIfNeeded();
          await open.click();
          const dialog = await page.waitForSelector(".kz-dialog[data-placement]", { timeout: 5000 }).catch(() => null);
          const anim = dialog ? await dialog.evaluate((el) => el.getAnimations().length) : -1;
          const label = `${path} ${vp.name} ${theme} reduced-motion=${reducedMotion}`;
          if (!dialog) problems.push(`${label}: the dialog did not open`);
          else if (reducedMotion === "no-preference" && anim === 0) problems.push(`${label}: the dialog enters without an animation`);
          else if (reducedMotion === "reduce" && anim > 0) problems.push(`${label}: the dialog animates under reduced motion`);
          await page.keyboard.press("Escape");
        }
        if (path === "/transitions/") {
          // Next: the view changes; with the API and motion on, a view transition runs (the root gets data-vt), never under reduced motion.
          const seen = page.evaluate(() => new Promise((resolve) => { const o = new MutationObserver(() => { if (document.documentElement.dataset.vt) { o.disconnect(); resolve(true); } }); o.observe(document.documentElement, { attributes: true }); setTimeout(() => resolve(false), 1500); }));
          await page.getByRole("button", { name: "Next" }).click();
          const ran = await seen;
          const label = `${path} ${vp.name} ${theme} reduced-motion=${reducedMotion}`;
          await page.waitForTimeout(700);
          const text = await page.getByTestId("vt-view").textContent();
          if (!/Runs/.test(text ?? "")) problems.push(`${label}: Next did not change the view`);
          if (reducedMotion === "no-preference" && !ran) problems.push(`${label}: no view transition ran`);
          if (reducedMotion === "reduce" && ran) problems.push(`${label}: a view transition ran under reduced motion`);
        }
        const where = `${path} ${vp.name} ${theme} reduced-motion=${reducedMotion}`;
        checks++;
        if (path !== "/transitions/" && reducedMotion === "no-preference" && JSON.stringify(a) === JSON.stringify(b)) problems.push(`${where}: nothing changed in 2.6 s`);
        if (path !== "/transitions/" && reducedMotion === "reduce" && JSON.stringify(a) !== JSON.stringify(c)) problems.push(`${where}: it moves under reduced motion`);
        await context.close();
      }
await browser.close();
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`check-demos: ${checks} demo × viewport × theme × preference, the demos play and rest`);
