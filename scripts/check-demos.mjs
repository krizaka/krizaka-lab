#!/usr/bin/env node
/* The guides' screens and the demos really play (reduced motion OFF) and rest done (ON), in a real browser, desktop and
   phone, dark and light: the streamed answer grows, runs land in the table, the figures climb, the arrival counts down,
   the checkout's step crosses through a view transition (never under reduced motion), the journey advances.
     node scripts/check-demos.mjs --base http://localhost:4173 */
import { chromium } from "playwright";

const i = process.argv.indexOf("--base");
const base = (i > 0 ? process.argv[i + 1] : "http://localhost:4173").replace(/\/$/, "");
const VIEWPORTS = [{ name: "desktop", width: 1280, height: 900 }, { name: "phone", width: 390, height: 844 }];

/** The in-page readings each page is judged on: the guides' screens (krizaka-ui#434) and the component demos. */
const READ = {
  "/streaming-answer/": () => document.querySelector(".lab-chat-log")?.textContent?.length ?? 0,
  "/list-arrival/": () => document.querySelector(".lab-dash-table tbody tr")?.textContent ?? "",
  "/live-number/": () => document.querySelector(".lab-dash-figures .sr-only, .lab-dash-figures")?.textContent ?? "",
  "/route-draw/": () => document.querySelector(".lab-delivery-side")?.textContent ?? "",
  "/page-transition/": () => document.querySelector(".lab-checkout-title")?.textContent ?? "",
  "/journey/": () => [...document.querySelectorAll(".lab-journey li")].map((li) => li.textContent.length + (li.getAttribute("aria-current") ? "c" : "")).join(","),
  "/overlays/": () => document.querySelector("[data-testid=active]")?.textContent ?? "",
  "/people/": () => document.querySelector(".lab-people")?.textContent ?? "",
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
        await page.locator(".lab-guide-screen, .lab-playground-stage").last().scrollIntoViewIfNeeded();
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
        if (path === "/page-transition/") {
          // Continue: the checkout's step changes; with the API and motion on, a view transition runs (the root gets data-vt), never under reduced motion.
          const seen = page.evaluate(() => new Promise((resolve) => { const o = new MutationObserver(() => { if (document.documentElement.dataset.vt) { o.disconnect(); resolve(true); } }); o.observe(document.documentElement, { attributes: true }); setTimeout(() => resolve(false), 1500); }));
          await page.getByRole("button", { name: "Continue" }).click();
          const ran = await seen;
          const label = `${path} ${vp.name} ${theme} reduced-motion=${reducedMotion}`;
          await page.waitForTimeout(700);
          const text = await page.locator(".lab-checkout-title").textContent();
          if (!/Review/.test(text ?? "")) problems.push(`${label}: Continue did not change the step`);
          if (reducedMotion === "no-preference" && !ran) problems.push(`${label}: no view transition ran`);
          if (reducedMotion === "reduce" && ran) problems.push(`${label}: a view transition ran under reduced motion`);
        }
        const where = `${path} ${vp.name} ${theme} reduced-motion=${reducedMotion}`;
        checks++;
        if (path !== "/page-transition/" && reducedMotion === "no-preference" && JSON.stringify(a) === JSON.stringify(b)) problems.push(`${where}: nothing changed in 2.6 s`);
        if (path !== "/page-transition/" && reducedMotion === "reduce" && JSON.stringify(a) !== JSON.stringify(c)) problems.push(`${where}: it moves under reduced motion`);
        await context.close();
      }
await browser.close();
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`check-demos: ${checks} demo × viewport × theme × preference, the demos play and rest`);
