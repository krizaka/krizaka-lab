#!/usr/bin/env node
/* Every gallery card works as its words say, in a real browser, with reduced motion OFF and ON: it renders without a
   console error, its interaction does what the description claims (selection, aria state, panel), and its motion is
   there (computed animation names, getAnimations) — and gone under prefers-reduced-motion while the state still changes.
   The gallery's catalogue (src/lab/gallery-data.ts) must be fully covered here.
     node scripts/check-cards.mjs --base http://localhost:4173 [--report report.json] */
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const base = arg("--base", "http://localhost:4173").replace(/\/$/, "");
const { ITEMS } = await import("../src/lab/gallery-data.ts");

const names = (loc) => loc.evaluate((el) => el.getAnimations({ subtree: true }).map((a) => a.animationName || `transition:${a.transitionProperty}`));
const running = async (loc, re) => (await names(loc)).filter((n) => re.test(n)).length;
const canvasSig = (loc) => loc.locator("canvas").first().evaluate((c) => { const x = c.getContext("2d"); try { return c.toDataURL().length + ":" + c.toDataURL().slice(-60); } catch { return String(x); } });

/** card id → check(page, root, reduced, ok) ; `ok(cond, message)` records a problem when false. */
const CARDS = {
  async button(p, r, rm, ok) {
    const b = r.getByRole("button", { name: "Save" });
    await b.click();
    await p.waitForTimeout(200);
    ok((await r.getByRole("button").getAttribute("aria-busy")) === "true", "the button is announced as busy (aria-busy)");
    const loader = await running(r, /kz-loader/);
    ok(rm ? loader === 0 : loader > 0, rm ? "the loader is drawn still under reduced motion" : "the loader draws (kz-loader animation)");
    ok(await r.getByRole("button", { name: /Saving/ }).count() === 1, "the button shows its loader (Saving) after a click");
    await p.waitForTimeout(1900);
    ok(await r.getByRole("button", { name: "Save" }).count() === 1, "the button comes back to Save");
  },
  async toast(p, r, rm, ok) {
    await r.getByRole("button", { name: "Message archived" }).click();
    await p.waitForTimeout(80);
    const enter = await p.evaluate(() => document.body.getAnimations({ subtree: true }).filter((a) => ["opacity", "transform"].includes(a.transitionProperty)).length);
    ok(rm ? enter === 0 : enter > 0, rm ? "the toast appears at once under reduced motion" : "the toast fades and slides in");
    await p.waitForTimeout(420);
    const toast = p.getByRole("region", { name: /Notifications/ });
    ok((await toast.innerText()).includes("Undo"), "the toast offers Undo");
  },
  async progress(p, r, rm, ok) {
    const bar = r.getByRole("progressbar");
    ok((await bar.getAttribute("aria-valuenow")) === "35", "progress starts at 35");
    await r.getByRole("button", { name: "Advance" }).click();
    ok((await bar.getAttribute("aria-valuenow")) === "60", "Advance moves the value to 60 (announced via aria-valuenow)");
    const fill = (await names(r)).filter((n) => n === "transition:width").length;
    ok(rm ? fill === 0 : fill > 0, rm ? "the bar jumps under reduced motion" : "the bar fills smoothly (width transition)");
  },
  async dialog(p, r, rm, ok) {
    await r.getByRole("button", { name: "Open the panel" }).click();
    const d = p.locator(".kz-dialog[data-placement=right]");
    await d.waitFor({ timeout: 4000 });
    await p.waitForTimeout(100);
    const n = (await d.evaluate((el) => el.getAnimations().length));
    ok(rm ? n === 0 : n > 0, rm ? "the panel appears in place under reduced motion" : "the panel slides in (an animation runs)");
    await p.keyboard.press("Escape");
    await p.waitForTimeout(500);
    ok((await p.locator(".kz-dialog").count()) === 0, "Escape closes the panel");
  },
  async "glow-card"(p, r, rm, ok) {
    const ring = () => r.locator(".kz-glow").evaluate((el) => getComputedStyle(el, "::before").opacity);
    ok((await names(r)).filter((x) => !x.startsWith("transition:")).length === 0, "the ring is still: no animation runs, in any motion mode");
    const before = Number(await ring());
    await r.locator(".kz-glow").hover();
    await p.waitForTimeout(400);
    ok(Number(await ring()) > before, "the ring brightens under the pointer");
  },
  async badge(p, r, rm, ok) {
    const radios = r.getByRole("radio");
    ok((await radios.count()) === 3, "three chips: Week, Month, Year");
    ok((await radios.nth(0).getAttribute("aria-checked")) === "true", "Week is selected at first");
    await radios.nth(1).click();
    ok((await radios.nth(1).getAttribute("aria-checked")) === "true" && (await radios.nth(0).getAttribute("aria-checked")) === "false", "a click on Month moves the selection (aria-checked)");
    const pulse = await running(r, /pulse/);
    ok(rm ? pulse === 0 : pulse > 0, rm ? "the dot does not pulse under reduced motion" : "the dot pulses (animation « pulse »)");
  },
  async tabs(p, r, rm, ok) {
    const tabs = r.getByRole("tab");
    await tabs.nth(1).click();
    ok((await tabs.nth(1).getAttribute("aria-selected")) === "true", "Month is selected");
    ok((await r.getByRole("tabpanel").innerText()).includes("This month"), "the Month panel shows");
    await p.waitForTimeout(40);
    const glide = (await names(r)).filter((n) => /translate|width/.test(n)).length;
    ok(rm ? glide === 0 : glide > 0, rm ? "the indicator moves at once under reduced motion" : "the indicator glides (translate/width transition)");
  },
  async stat(p, r, rm, ok) {
    await p.waitForTimeout(rm ? 100 : 1800);
    ok(/5,?940/.test(await r.innerText()), "the figure ends on 5,940");
  },
  async "data-table"(p, r, rm, ok) {
    const boxes = r.locator("tbody [role=checkbox]");
    ok((await boxes.nth(1).getAttribute("aria-checked")) === "true", "the Canal walk row starts selected");
    await boxes.nth(0).click();
    ok((await boxes.nth(0).getAttribute("aria-checked")) === "true", "a click selects a row");
  },
  async "engine-flow"(p, r, rm, ok) {
    ok((await r.locator("svg, canvas").count()) > 0, "the flow draws");
    const n = (await names(r)).filter((x) => !x.startsWith("transition:")).length;
    ok(rm ? n === 0 : n > 0, rm ? "photons rest under reduced motion" : "photons travel (animations run)");
  },
  async "lattice-card"(p, r, rm, ok) {
    const a = await canvasSig(r); await p.waitForTimeout(500); const b = await canvasSig(r);
    ok(rm ? a === b : a !== b, rm ? "the lattice is still under reduced motion" : "the lattice moves");
  },
  async waveform(p, r, rm, ok) {
    const btn = r.getByRole("button");
    ok((await btn.getAttribute("aria-pressed")) === "true", "playing at first");
    const on = (await names(r)).filter((n) => /wave/.test(n)).length;
    ok(rm ? on === 0 : on > 0, rm ? "bars are still under reduced motion" : "bars breathe while playing");
    await btn.click();
    ok((await btn.getAttribute("aria-pressed")) === "false", "Pause flips aria-pressed");
    await p.waitForTimeout(80);
    const paused = await r.locator("[data-bar]").first().evaluate((el) => getComputedStyle(el).animationPlayState === "paused" || getComputedStyle(el).animationName === "none");
    ok(paused, "the bars stop when paused");
  },
  async chat(p, r, rm, ok) {
    ok((await r.innerText()).includes("Léa is typing"), "the typing indicator shows");
    const n = (await names(r)).filter((x) => !x.startsWith("transition:")).length;
    ok(rm ? n === 0 : n > 0, rm ? "the three dots stay still under reduced motion" : "the three dots move");
  },
  async marquee(p, r, rm, ok) {
    const n = (await names(r)).filter((x) => /marquee|scroll/i.test(x)).length;
    ok(rm ? n === 0 : n > 0, rm ? "the row is still under reduced motion" : "the band slides");
    if (!rm) {
      await r.getByRole("button", { name: "Pause" }).click();
      await p.waitForTimeout(80);
      const state = await r.locator("ul").first().evaluate((el) => getComputedStyle(el.parentElement).animationPlayState + getComputedStyle(el).animationPlayState);
      ok(/paused/.test(state), "Pause stops the band");
    }
  },
  async navbar(p, r, rm, ok) {
    const items = r.locator("button[data-nav-item]");
    await items.nth(2).click();
    ok((await items.nth(2).getAttribute("aria-current")) === "page" && (await items.nth(0).getAttribute("aria-current")) === null, "About becomes the current page");
    await p.waitForTimeout(40);
    const glide = (await names(r)).filter((n) => /translate|width/.test(n)).length;
    ok(rm ? glide === 0 : glide > 0, rm ? "the light moves at once under reduced motion" : "the light glides");
  },
  async "glass-card"(p, r, rm, ok) {
    const a = await canvasSig(r); await p.waitForTimeout(500); const b = await canvasSig(r);
    ok(rm ? a === b : a !== b, rm ? "the caustics are still under reduced motion" : "the caustics move");
  },
};

const missing = ITEMS.filter((i) => !CARDS[i.id]).map((i) => i.id);
const problems = missing.map((id) => `${id}: no check for this card`);
const report = [];
const browser = await chromium.launch();
for (const reducedMotion of ["no-preference", "reduce"]) {
  const rm = reducedMotion === "reduce";
  for (const item of ITEMS) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${base}/krizaka-ui/`, { waitUntil: "load" });
    const root = page.locator(`[data-card=${item.id}] .lab-g-live`);
    const fails = [];
    try {
      await root.scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      await CARDS[item.id]?.(page, root, rm, (c, msg) => { if (!c) fails.push(msg); });
    } catch (e) { fails.push(`threw: ${String(e.message).split("\n")[0]}`); }
    for (const e of errors) fails.push(`console error: ${e}`);
    const label = `${item.id} reduced-motion=${rm ? "ON" : "OFF"}`;
    report.push({ card: item.id, reducedMotion: rm, passed: fails.length === 0, failures: fails });
    for (const f of fails) problems.push(`${label}: ${f}`);
    await context.close();
  }
}
await browser.close();
const out = arg("--report", "");
if (out) writeFileSync(out, JSON.stringify(report, null, 2));
if (problems.length) { console.error(`cards check failed (${problems.length}):\n- ${problems.join("\n- ")}`); process.exit(1); }
console.log(`cards check: ${ITEMS.length} cards x 2 motion modes, interactions, aria state, motion and reduced motion agree with the words`);
