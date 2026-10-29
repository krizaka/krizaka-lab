#!/usr/bin/env node
/* The experiments open, run and stay smooth: no console error, no long task (> 50 ms) in steady state, the drawing
   moves on screen and stops off screen, and is still under prefers-reduced-motion. Canvas studies are judged on the
   canvas pixels; the engine flow on its running animations.
     node scripts/check-experiments.mjs --base http://localhost:4173 [--only a,b] */
import { chromium } from "playwright";

const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i > 0 ? process.argv[i + 1] : d;
};
const base = arg("--base", "http://localhost:4173").replace(/\/$/, "");
const only = arg("--only", "").split(",").filter(Boolean);
const PAGES = [
  { path: "/orazaka/", kind: "flow" },
  { path: "/jarvis/", kind: "canvas" },
  { path: "/liquid-glass/", kind: "canvas" },
  { path: "/neural-lattice/", kind: "canvas" },
  ...(await import("./experiment-pages.mjs").then((m) => m.PAGES).catch(() => [])),
].filter((p) => !only.length || only.some((o) => p.path.includes(o)));

const sig = (page) =>
  page.evaluate(() => {
    const c = document.querySelector(".lab-stage canvas, main canvas, canvas");
    if (!c) return "none";
    try {
      const d = c.toDataURL();
      return d.length + d.slice(-80);
    } catch {
      return "tainted";
    }
  });
const anims = (page) =>
  page.evaluate(
    () => document.getAnimations().filter((a) => a.playState === "running" && !a.transitionProperty).length,
  );
const problems = [];
const browser = await chromium.launch();
for (const reducedMotion of ["no-preference", "reduce"]) {
  const rm = reducedMotion === "reduce";
  for (const { path, kind } of PAGES) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion });
    const page = await context.newPage();
    const label = `${path} reduced-motion=${rm ? "ON" : "OFF"}`;
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(() => {
      window.__long = [];
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__long.push([performance.now(), e.duration]);
      }).observe({ entryTypes: ["longtask"] });
    });
    await page.goto(base + path, { waitUntil: "load" });
    await page.waitForTimeout(2500); // settle: first paint, canvas setup
    const settled = await page.evaluate(() => performance.now());
    const move = async () =>
      kind === "canvas"
        ? { a: await sig(page), b: (await page.waitForTimeout(700), await sig(page)) }
        : { a: await anims(page), b: await anims(page) };
    const m = await move();
    if (kind === "canvas") {
      if (m.a === "none") problems.push(`${label}: no canvas`);
      else if (rm ? m.a !== m.b : m.a === m.b)
        problems.push(`${label}: ${rm ? "the drawing moves under reduced motion" : "the drawing does not move"}`);
    } else if (rm ? m.a > 0 : m.a === 0)
      problems.push(`${label}: ${rm ? "animations run under reduced motion" : "nothing moves"}`);
    await page.waitForTimeout(2500);
    const long = await page.evaluate((s) => window.__long.filter(([t, d]) => t > s && d > 50), settled);
    if (long.length)
      problems.push(
        `${label}: ${long.length} long task(s) > 50 ms in steady state (max ${Math.round(Math.max(...long.map((l) => l[1])))} ms)`,
      );
    if (!rm && kind === "canvas") {
      // Off screen the loop pauses: scroll the canvas away, the pixels stop changing.
      await page.evaluate(() => {
        const c = document.querySelector("canvas");
        const sp = document.createElement("div");
        sp.style.height = "4000px";
        document.body.append(sp);
        c.closest("section, div")?.setAttribute("data-probe", "");
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(900);
      const x = await sig(page);
      await page.waitForTimeout(700);
      const y = await sig(page);
      if (x !== y) problems.push(`${label}: the drawing keeps running off screen`);
    }
    for (const e of errors) problems.push(`${label}: console error: ${e}`);
    await context.close();
  }
}
await browser.close();
if (problems.length) {
  console.error(`experiments check failed (${problems.length}):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(
  `experiments check: ${PAGES.length} pages x 2 motion modes — no error, no long task, moving on screen, paused off screen, still under reduced motion`,
);
