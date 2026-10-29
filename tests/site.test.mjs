import { core } from "./support/core.mjs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const { getCanonicalUrl } = core;

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

describe("lab.krizaka.com", () => {
  it("serves the custom domain from the Pages artifact", () => {
    assert.equal(read("public/CNAME").trim(), "lab.krizaka.com");
  });
  it("declares its canonical address and a sitemap", () => {
    assert.match(read("index.html"), /rel="canonical" href="https:\/\/lab.krizaka.com\/"/);
    assert.match(read("public/robots.txt"), /Sitemap: https:\/\/lab.krizaka.com\/sitemap\.xml/);
    assert.match(read("scripts/generate-routes.mjs"), /sitemap\.xml/);
  });
  it("gives generated routes their own canonical and Open Graph URLs", () => {
    for (const route of ["list-arrival", "checkout"]) {
      const html = fs.readFileSync(new URL(`../dist-demo/${route}/index.html`, import.meta.url), "utf8");
      const url = `https://lab.krizaka.com/${route}/`;
      assert.ok(html.includes(`<link rel="canonical" href="${url}" />`), route);
      assert.ok(html.includes(`<meta property="og:url" content="${url}" />`), route);
    }
  });
  it("normalizes the active path for canonical metadata during navigation", () => {
    assert.equal(getCanonicalUrl("/"), "https://lab.krizaka.com/");
    assert.equal(getCanonicalUrl("/checkout"), "https://lab.krizaka.com/checkout/");
    assert.equal(getCanonicalUrl("/krizaka-lab/checkout/"), "https://lab.krizaka.com/checkout/");
    assert.equal(getCanonicalUrl("//checkout///"), "https://lab.krizaka.com/checkout/");
  });
  it("README says where the docs live", () => {
    assert.match(read("README.md"), /docs live here/);
  });
});
