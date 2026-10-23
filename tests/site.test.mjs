import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

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
  it("README says where the docs live", () => {
    assert.match(read("README.md"), /docs live here/);
  });
});
