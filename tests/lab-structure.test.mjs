import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Krizaka Lab (krizaka-motion#69): the lab is organised by area, one README per experiment, and it publishes nothing.
const root = new URL("../", import.meta.url).pathname;
const AREAS = ["motion", "java", "ai", "ui", "data"];
const STATUSES = ["idea", "prototype", "promoted", "dropped"];
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const dirs = (p) =>
  fs
    .readdirSync(path.join(root, p), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

describe("Krizaka Lab structure", () => {
  it("has exactly the declared areas, each with its README", () => {
    assert.deepEqual(dirs("experiments").sort(), [...AREAS].sort());
    for (const area of AREAS)
      assert.ok(fs.existsSync(path.join(root, `experiments/${area}/README.md`)), `${area} has no README`);
  });

  it("gives every experiment a README with its area, a status and what it feeds", () => {
    let count = 0;
    for (const area of AREAS) {
      for (const name of dirs(`experiments/${area}`)) {
        count += 1;
        const readme = read(`experiments/${area}/${name}/README.md`);
        assert.match(readme, new RegExp(`\\*\\*Area:\\*\\* ${area}\\b`), `${area}/${name}: area line`);
        const status = readme.match(/\*\*Status:\*\* (\w+)/)?.[1];
        assert.ok(
          STATUSES.includes(status),
          `${area}/${name}: status "${status}" is not one of ${STATUSES.join(", ")}`,
        );
        assert.match(readme, /\*\*Feeds:\*\* \S/, `${area}/${name}: Feeds link`);
        assert.match(readme, /\*\*Where it lives:\*\* \S/, `${area}/${name}: where it lives`);
      }
    }
    assert.ok(count >= 6, "the first motion experiments are listed");
  });

  it("lists every motion experiment in the area README", () => {
    const index = read("experiments/motion/README.md");
    for (const name of dirs("experiments/motion"))
      assert.ok(index.includes(`(${name}/)`), `${name} missing from the motion index`);
  });

  it("publishes nothing: private, no entry point, no publish config", () => {
    const pkg = JSON.parse(read("package.json"));
    assert.equal(pkg.private, true);
    assert.equal(pkg.name, "krizaka-lab");
    for (const key of ["main", "module", "exports", "bin", "files", "publishConfig", "types"])
      assert.equal(pkg[key], undefined, `package.json has "${key}"`);
    assert.ok(!fs.existsSync(path.join(root, ".changeset")), "the lab has no changesets");
  });

  it("serves lab.krizaka.com and says what the lab is in llms.txt", () => {
    assert.equal(read("public/CNAME").trim(), "lab.krizaka.com");
    const llms = read("public/llms.txt");
    assert.match(llms, /^# Krizaka Lab/);
    assert.match(llms, /Nothing here is a product/);
    assert.match(read("index.html"), /<title>Krizaka Lab/);
  });

  it("no longer calls itself Krizaka Motion or motion.krizaka.com outside the history", () => {
    for (const f of ["README.md", "AGENTS.md", "index.html", "messages/en.json", "public/robots.txt", "package.json"]) {
      assert.doesNotMatch(
        read(f).replace(/`motion\.krizaka\.com` answers 301[^\n]*/g, ""),
        /Krizaka Motion|motion\.krizaka\.com/,
        `${f} still names the old lab`,
      );
    }
  });
});
