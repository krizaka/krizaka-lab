/* Run against the built lab after Playwright's browser install:
   CHECKOUT_BASE=http://localhost:4173 node --test tests/checkout-browser.test.mjs */
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.CHECKOUT_BASE;
describe("the shared booking checkout in a real browser", { skip: !base }, () => {
  let browser;
  before(async () => { browser = await chromium.launch(); });
  after(async () => { await browser?.close(); });

  async function open(path, options = {}, query = "?wait=300") {
    const context = await browser.newContext(options);
    await context.addInitScript((theme) => localStorage.setItem("kz-theme", theme), options.colorScheme ?? "dark");
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    await page.goto(`${base}/${path}/${query}`);
    await page.locator(".lab-booking").scrollIntoViewIfNeeded();
    return { context, page };
  }
  async function focused(page, text) {
    await page.waitForFunction((text) => document.activeElement?.textContent?.includes(text), text);
  }
  async function click(page, name) {
    await page.getByRole("button", { name, exact: true }).click();
  }

  for (const path of ["button-feedback", "page-transition", "checkout"])
    for (const colorScheme of ["dark", "light"])
      for (const width of [1280, 390])
        for (const reducedMotion of ["no-preference", "reduce"])
          test(`${path}, ${colorScheme}, ${width}px, ${reducedMotion}`, async () => {
            const { context, page } = await open(path, { colorScheme, reducedMotion, viewport: { width, height: 900 } });
            try {
              const errors = [];
              page.on("pageerror", (e) => errors.push(e.message));
              await page.evaluate(() => {
                const start = document.startViewTransition?.bind(document);
                window.checkoutTransitions = 0;
                if (start) document.startViewTransition = (...args) => { window.checkoutTransitions++; return start(...args); };
              });
              await click(page, "Continue");
              await focused(page, "Review");
              const pay = page.getByRole("button", { name: /^Book and pay/ });
              await pay.waitFor({ state: "visible" });
              await page.waitForFunction(() => !document.documentElement.dataset.checkoutDirection);
              const idleWidth = (await pay.boundingBox()).width;
              await pay.click();
              const working = page.getByRole("button", { name: "Booking…", exact: true });
              assert.equal(await working.getAttribute("aria-busy"), "true");
              assert.equal(await working.isDisabled(), true);
              assert.ok(Math.abs((await working.boundingBox()).width - idleWidth) < 1, "working preserves width");
              if (reducedMotion !== "reduce") {
                const done = await page.waitForFunction(() => {
                  const button = document.querySelector(".lab-checkout-pay[data-kz-status='success']");
                  return button ? { width: button.getBoundingClientRect().width, mark: !!button.querySelector(".kz-loader-mark") } : null;
                });
                const result = await done.jsonValue();
                assert.ok(Math.abs(result.width - idleWidth) < 1, "done preserves width");
                assert.equal(result.mark, true, "the UI check is drawn");
              }
              await focused(page, "See you Tuesday");
              await page.getByRole("button", { name: "Start again", exact: true }).waitFor({ state: "visible" });
              await page.waitForFunction(() => document.querySelector(".lab-booking [role='progressbar']")?.getAttribute("aria-valuenow") === "3");
              await page.waitForFunction(() => document.querySelector(".lab-booking .kz-count .sr-only")?.textContent === "$51.74");
              await page.getByText("Demo booked: Tuesday 10:30. Nothing was charged.", { exact: true }).waitFor();
              const state = await page.locator(".lab-booking").evaluate((host) => ({
                overflow: host.scrollWidth > host.clientWidth + 1,
                reveal: [...host.querySelectorAll("[data-reveal]")].map((el) => getComputedStyle(el).opacity),
                moving: host.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length,
              }));
              assert.equal(state.overflow, false);
              if (reducedMotion === "reduce") {
                assert.deepEqual(state.reveal, ["1", "1"]);
                assert.equal(state.moving, 0, "the reduced-motion confirmation is still");
                assert.equal(await page.evaluate(() => window.checkoutTransitions), 0, "reduced motion never starts a view transition");
              }
              assert.deepEqual(errors, []);
              await click(page, "Start again");
              await focused(page, "Pick a time");
            } finally { await context.close(); }
          });

  test("failure stays inline, gives the button back, and retry succeeds", async () => {
    const { context, page } = await open("button-feedback", {}, "?wait=300&fail=1");
    try {
      await click(page, "Continue");
      await focused(page, "Review");
      await page.waitForFunction(() => !document.documentElement.dataset.checkoutDirection);
      await page.getByRole("button", { name: /^Book and pay/ }).click();
      await page.getByRole("alert").filter({ hasText: "The demo payment failed." }).waitFor();
      assert.equal(await page.getByRole("button", { name: /^Book and pay/ }).isEnabled(), true);
      assert.equal(await page.locator("[data-kz-status='error']").count(), 0);
      assert.equal(await page.getByText("Demo booked: Tuesday 10:30. Nothing was charged.", { exact: true }).count(), 0);
      assert.equal(await page.locator(".lab-booking [role='progressbar']").getAttribute("aria-valuenow"), "2");
      await page.getByRole("switch", { name: "Fail the payment" }).click();
      await page.getByRole("button", { name: /^Book and pay/ }).click();
      await focused(page, "See you Tuesday");
      assert.equal(await page.locator("#checkout-payment-error").count(), 0);
    } finally { await context.close(); }
  });

  test("leaving during payment cancels the pending booking", async () => {
    const { context, page } = await open("button-feedback", {}, "?wait=1000");
    try {
      await click(page, "Continue");
      await page.getByRole("button", { name: /^Book and pay/ }).click();
      await page.getByRole("link", { name: "All guides", exact: true }).click();
      await page.waitForTimeout(1600);
      assert.equal(await page.getByText("Demo booked: Tuesday 10:30. Nothing was charged.", { exact: true }).count(), 0);
    } finally { await context.close(); }
  });

  for (const fallback of [false, true])
    test(`forward/back direction and animated height, native fallback=${fallback}`, async () => {
      const { context, page } = await open("page-transition", {}, "?direction=left");
      try {
        if (fallback) await page.evaluate(() => { document.startViewTransition = undefined; });
        await page.getByRole("button", { name: "Continue", exact: true }).evaluate((button) => button.click());
        await focused(page, "Review");
        const first = await page.evaluate((fallback) => {
          if (!fallback) return document.documentElement.dataset.checkoutDirection;
          const ghost = document.querySelector(".lab-checkout-outgoing");
          return ghost?.getAnimations()[0]?.effect.getKeyframes().at(-1).transform;
        }, fallback);
        assert.equal(first, fallback ? "translateX(100%)" : "back");
        await page.waitForFunction(() => !document.documentElement.dataset.checkoutDirection && !document.querySelector(".lab-checkout-outgoing"));
        const height = await page.evaluate(async () => {
          const el = document.querySelector(".lab-checkout-height");
          const readings = [el.getBoundingClientRect().height];
          document.querySelector(".lab-checkout-actions button").click();
          const direction = document.documentElement.dataset.checkoutDirection;
          const transform = document.querySelector(".lab-checkout-outgoing")?.getAnimations()[0]?.effect.getKeyframes().at(-1).transform;
          for (let n = 0; n < 20; n++) {
            await new Promise((resolve) => requestAnimationFrame(resolve));
            readings.push(el.getBoundingClientRect().height);
          }
          return { readings, direction, transform };
        });
        await focused(page, "Pick a time");
        assert.equal(fallback ? height.transform : height.direction, fallback ? "translateX(-100%)" : "forward");
        const from = height.readings[0];
        const to = height.readings.at(-1);
        assert.notEqual(from, to);
        assert.ok(height.readings.some((h) => h > Math.min(from, to) + 1 && h < Math.max(from, to) - 1), "height interpolates rather than jumping");
      } finally { await context.close(); }
    });
});
