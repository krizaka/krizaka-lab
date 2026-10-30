#!/usr/bin/env node
/* The notebook studies work as their words say, reduced motion OFF and ON: no console error, the interaction does its
   job, the native API really runs (computed styles, getAnimations, a view transition), and under prefers-reduced-motion
   nothing moves while the state still changes.   node scripts/check-studies.mjs --base http://localhost:4173 */
import { chromium } from "playwright";
import { STUDIES } from "../src/lab/studies-data.ts";

const i = process.argv.indexOf("--base");
const base = (i > 0 ? process.argv[i + 1] : "http://localhost:4173").replace(/\/$/, "");
const css = (loc, sel, prop) =>
  loc
    .locator(sel)
    .first()
    .evaluate((el, p) => getComputedStyle(el)[p], prop);

const CHECKS = {
  async ink(p, r, rm, ok) {
    const anims = () =>
      r.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.animationName === "st-write").length);
    if (rm) {
      ok((await anims()) === 0, "the signature is already written under reduced motion");
      ok(
        (await css(r, ".st-ink path", "strokeDashoffset")) === "0px" ||
          Number.parseFloat(await css(r, ".st-ink path", "strokeDashoffset")) === 0,
        "the stroke is fully drawn",
      );
      return;
    }
    ok((await anims()) === 2, "the pen draws two strokes (st-write)");
    await p.waitForTimeout(3300);
    ok(
      (await anims()) === 0 || Number.parseFloat(await css(r, ".st-ink path", "strokeDashoffset")) === 0,
      "the signature ends fully written",
    );
    await r.getByRole("button", { name: "Write again" }).click();
    await p.waitForTimeout(100);
    ok((await anims()) === 2, "Write again draws it again");
  },
  async stamp(p, r, rm, ok) {
    const stamp = r.locator(".st-stamp");
    ok((await css(r, ".st-stamp", "opacity")) === "0", "the stamp is not there before the press");
    await r.getByRole("button", { name: "Press the stamp" }).click();
    await p.waitForTimeout(60);
    const anims = await stamp.evaluate((el) => el.getAnimations().map((a) => a.effect.getTiming().easing));
    if (rm) ok(anims.length === 0, "no animation under reduced motion");
    else
      ok(
        anims.some((e) => e.startsWith("linear(")),
        "the press runs a linear() spring on the WAAPI",
      );
    await p.waitForTimeout(800);
    ok(
      (await stamp.getAttribute("data-stamped")) !== null && Number(await css(r, ".st-stamp", "opacity")) > 0.8,
      "the stamp ends in place and visible",
    );
  },
  async underline(p, r, rm, ok) {
    const reader = r.locator(".st-reader");
    const off = async () => Number.parseFloat(await css(r, ".st-rule path", "strokeDashoffset"));
    if (rm) {
      ok((await off()) === 0, "the line is drawn in full under reduced motion");
      return;
    }
    const top = await off();
    await reader.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await p.waitForTimeout(250);
    const bottom = await off();
    ok(top > 0.9, `at the top the line is not started (offset ${top})`);
    ok(bottom < 0.1, `at the bottom the line is whole (offset ${bottom})`);
    await reader.evaluate((el) => {
      el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
    });
    await p.waitForTimeout(250);
    const mid = await off();
    ok(mid > bottom && mid < top, `halfway the line is half drawn (offset ${mid})`);
  },
  async marginalia(p, r, rm, ok) {
    const term = r.getByRole("button", { name: "margin" });
    await term.click();
    await p.waitForTimeout(400);
    const note = r.locator(".st-note");
    ok(await note.evaluate((el) => el.matches(":popover-open")), "the note opens");
    const [t, n] = [await term.boundingBox(), await note.boundingBox()];
    ok(
      n.x >= t.x + t.width - 2,
      `the note sits beside its words (anchor positioning): note.x ${Math.round(n.x)} vs term end ${Math.round(t.x + t.width)}`,
    );
    ok(Math.abs(n.y - t.y) < 60, "the note is level with its words");
    ok(
      (await css(r, ".st-note", "transitionDuration")).startsWith(rm ? "0s" : "0.22s"),
      rm ? "no transition under reduced motion" : "the note grows with a 220 ms transition",
    );
    await p.keyboard.press("Escape");
    await p.waitForTimeout(400);
    ok(!(await note.evaluate((el) => el.matches(":popover-open"))), "Escape closes the note");
  },
  async "page-turn"(p, r, rm, ok) {
    await p.evaluate(() => {
      window.__vt = false;
      new MutationObserver(() => {
        if (document.documentElement.dataset.turn) window.__vt = document.documentElement.dataset.turn;
      }).observe(document.documentElement, { attributes: true });
    });
    ok((await r.locator(".st-page h4").innerText()) === "Page one", "starts on page one");
    await r.getByRole("button", { name: "Next page" }).click();
    await p.waitForTimeout(rm ? 100 : 900);
    ok((await r.locator(".st-page h4").innerText()) === "Page two", "Next page shows page two");
    const turned = await p.evaluate(() => window.__vt);
    ok(
      rm ? turned === false : turned === "next",
      rm ? "no view transition under reduced motion" : "a view transition ran (the fold)",
    );
    await r.getByRole("button", { name: "Previous page" }).click();
    await p.waitForTimeout(rm ? 100 : 900);
    ok((await r.locator(".st-page h4").innerText()) === "Page one", "Previous page comes back");
  },
};

const problems = STUDIES.filter((s) => !CHECKS[s.id]).map((s) => `${s.id}: no check`);
const browser = await chromium.launch();
for (const reducedMotion of ["no-preference", "reduce"]) {
  const rm = reducedMotion === "reduce";
  for (const { id } of STUDIES) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${base}/experiments/`, { waitUntil: "load" });
    const root = page.locator(`[data-study=${id}] .lab-g-live`);
    const fails = [];
    try {
      await root.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await CHECKS[id]?.(page, root, rm, (c, msg) => {
        if (!c) fails.push(msg);
      });
    } catch (e) {
      fails.push(`threw: ${String(e.message).split("\n")[0]}`);
    }
    for (const e of errors) fails.push(`console error: ${e}`);
    for (const f of fails) problems.push(`${id} reduced-motion=${rm ? "ON" : "OFF"}: ${f}`);
    await context.close();
  }
}
await browser.close();
if (problems.length) {
  console.error(`studies check failed (${problems.length}):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(
  `studies check: ${STUDIES.length} studies x 2 motion modes — each does what its words say, natively, and rests under reduced motion`,
);
