/* The home's first screen and its scenario grid. The lead is one sentence and the hero opens the first guide (read from
   the guides list); in a real browser, no row of the scenario grid holds a single card at 1440 (nor at 1280). The browser
   part serves dist-demo (pnpm build) and is skipped only when there is no build or no browser. */
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer, get } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, resolve, sep } from "node:path";
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

/** A static server over `dist`: a file is read only when it sits inside `dist`; everything else is the app shell. */
function staticServer(dist) {
  const root = resolve(dist);
  return createServer((req, res) => {
    let path = "/";
    try {
      path = decodeURIComponent((req.url ?? "/").split("?")[0]);
    } catch {}
    const candidate = resolve(root, `.${path}`);
    const file =
      candidate.startsWith(root + sep) && existsSync(candidate) && extname(candidate)
        ? candidate
        : join(root, "index.html");
    res.setHeader("content-type", MIME[extname(file)] ?? "text/html");
    res.setHeader("connection", "close");
    res.end(readFileSync(file));
  });
}

describe("the test's static server stays inside its folder", () => {
  let server, base, tmp;
  before(async () => {
    tmp = mkdtempSync(join(tmpdir(), "home-static-"));
    mkdirSync(join(tmp, "dist"));
    writeFileSync(join(tmp, "dist", "index.html"), "SHELL");
    writeFileSync(join(tmp, "dist", "app.js"), "ASSET");
    writeFileSync(join(tmp, "package.json"), "SECRET");
    writeFileSync(join(tmp, "dist-evil.json"), "SECRET");
    server = staticServer(join(tmp, "dist"));
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    base = { host: "127.0.0.1", port: server.address().port };
  });
  after(async () => {
    server?.closeAllConnections();
    await new Promise((r) => server?.close(r));
    rmSync(tmp, { recursive: true, force: true });
  });
  // http.get sends the path as written, unlike fetch, which would normalise `/../`
  const body = (path) =>
    new Promise((ok, fail) =>
      get({ ...base, path, agent: false }, (res) => {
        let text = "";
        res.on("data", (c) => (text += c));
        res.on("end", () => ok(text));
      }).on("error", fail),
    );

  test("a file inside the folder is served", async () => {
    assert.equal(await body("/app.js"), "ASSET");
  });
  for (const path of ["/../package.json", "/%2e%2e/package.json", "/../dist-evil.json", "/%2e%2e%2fpackage.json"])
    test(`${path} gets the app shell, not the file`, async () => {
      assert.equal(await body(path), "SHELL");
    });
});

describe("the scenario grid in a real browser", { skip: !existsSync(dist) && "no dist-demo: run pnpm build" }, () => {
  let server, browser, base;
  before(async () => {
    server = staticServer(dist);
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
