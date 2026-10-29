import { core } from "./support/core.mjs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const { getCanonicalUrl } = core;

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

describe("motion.krizaka.com", () => {
  it("serves the custom domain from the Pages artifact", () => {
    assert.equal(read("public/CNAME").trim(), "motion.krizaka.com");
  });
  it("declares its canonical address and a sitemap", () => {
    assert.match(read("index.html"), /rel="canonical" href="https:\/\/motion\.krizaka\.com\/"/);
    assert.match(read("public/robots.txt"), /Sitemap: https:\/\/motion\.krizaka\.com\/sitemap\.xml/);
    assert.match(read("scripts/generate-routes.mjs"), /sitemap\.xml/);
  });
  it("gives generated routes their own canonical and Open Graph URLs", () => {
    for (const route of ["list-arrival", "checkout"]) {
      const html = fs.readFileSync(new URL(`../dist-demo/${route}/index.html`, import.meta.url), "utf8");
      const url = `https://motion.krizaka.com/${route}/`;
      assert.ok(html.includes(`<link rel="canonical" href="${url}" />`), route);
      assert.ok(html.includes(`<meta property="og:url" content="${url}" />`), route);
    }
  });
  it("normalizes the active path for canonical metadata during navigation", () => {
    assert.equal(getCanonicalUrl("/"), "https://motion.krizaka.com/");
    assert.equal(getCanonicalUrl("/checkout"), "https://motion.krizaka.com/checkout/");
    assert.equal(getCanonicalUrl("/krizaka-motion/checkout/"), "https://motion.krizaka.com/checkout/");
    assert.equal(getCanonicalUrl("//checkout///"), "https://motion.krizaka.com/checkout/");
  });
  it("README says where the docs live", () => {
    assert.match(read("README.md"), /docs live here/);
  });
});
