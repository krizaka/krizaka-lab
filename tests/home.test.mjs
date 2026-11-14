/* The home's first screen and its scenario grid. The lead is one sentence and the hero opens the first guide (read from
   the guides list); in a real browser, no row of the scenario grid holds a single card at 1440 (nor at 1280). The browser
   part serves dist-demo (pnpm build) and is skipped only when there is no build or no browser. */
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { GUIDES } from "../src/lab/guides.ts";

const en = JSON.parse(readFileSync(new URL("../messages/en.json", import.meta.url), "utf8"));
const home = readFileSync(new URL("../src/lab/Home.tsx", import.meta.url), "utf8");
const dist = fileURLToPath(new URL("../dist-demo/", import.meta.url));

test("the lead says one thing, in one sentence", () => {
  const lead = en.home.heroLead;
  assert.equal(lead, "Each guide answers one thing you want to animate, on a real app screen made of @krizaka/ui.");
  assert.equal(lead.match(/[.!?](\s|$)/g)?.length, 1);
  assert.match(en.home.moreLead, /^Krizaka Lab is where the family tries things/);
  assert.match(home, /lead=\{t\.home\.heroLead\}/);
  assert.match(home, /lead=\{t\.home\.moreLead\}/);
});

test("the hero opens the first guide of the list, with the library's Button", () => {
  assert.match(home, /from "@krizaka\/ui\/button"/);
  assert.match(home, /href\(GUIDES\[0\]!\.id\)/);
  assert.equal(en.home.heroAction, "Open the first guide");
  assert.ok(GUIDES[0]);
});

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

describe("the scenario grid in a real browser", { skip: !existsSync(dist) && "no dist-demo: run pnpm build" }, () => {
  let server, browser, base;
  before(async () => {
    server = createServer((req, res) => {
      const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
      let file = join(dist, path);
      if (!file.startsWith(dist) || !existsSync(file) || !extname(file)) file = join(dist, "index.html");
      res.setHeader("content-type", MIME[extname(file)] ?? "text/html");
      res.setHeader("connection", "close");
      res.end(readFileSync(file));
    });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    base = `http://127.0.0.1:${server.address().port}`;
    const { chromium } = await import("playwright");
    browser = await chromium.launch();
  });
  after(async () => {
    await browser?.close();
    server?.closeAllConnections();
    await new Promise((r) => server?.close(r));
  });

  for (const width of [1440, 1280])
    for (const colorScheme of ["light", "dark"])
      test(`no grid row holds a single card at ${width}px, ${colorScheme}`, async () => {
        const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme });
        try {
          await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
          await page.locator("section:has(#scenarios) ul > li").nth(4).waitFor();
          const tops = await page.evaluate(() => {
            const grid = [...document.querySelector("section:has(#scenarios)").querySelectorAll("ul")].find(
              (ul) => ul.children.length === 5,
            );
            return [...grid.children].map((c) => Math.round(c.getBoundingClientRect().top));
          });
          assert.equal(tops.length, 5);
          const rows = Object.values(Object.groupBy(tops, String)).map((r) => r.length);
          assert.ok(
            rows.every((n) => n > 1),
            `rows: ${rows.join(" + ")}`,
          );
          const lead = await page.locator("h1 ~ p").first().innerText();
          assert.equal(lead, en.home.heroLead);
          assert.equal(lead.match(/[.!?](\s|$)/g)?.length, 1);
          const action = page.getByRole("link", { name: en.home.heroAction });
          assert.equal(
            await action.getAttribute("href"),
            `./${GUIDES[0].id}/`.replace("./", "/").replace(/\/$/, "") || null,
          );
        } finally {
          await page.close();
        }
      });
});
