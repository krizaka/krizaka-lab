import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const afterBuild = readFileSync(new URL("../scripts/ci-after-build.sh", import.meta.url), "utf8");
const agents = readFileSync(new URL("../AGENTS.md", import.meta.url), "utf8");

// Every script CI runs after the build is named in AGENTS.md, so a local run catches what CI catches.
const ciChecks = [...afterBuild.matchAll(/scripts\/(check-[a-z-]+\.mjs)|tests\/(checkout-browser\.test\.mjs)/g)].map(
  (m) => m[1] ?? m[2],
);

test("ci-after-build.sh runs checks the test can see", () => {
  assert.ok(ciChecks.length >= 6, `found ${ciChecks.length} checks`);
});

for (const check of new Set(ciChecks)) {
  const name = check.replace(/\.mjs$/, "");
  test(`AGENTS.md lists the CI check ${name}`, () => {
    assert.ok(
      agents.includes(name) || agents.includes(check) || agents.includes(name.replace("check-", "check:")),
      `${check} is run by CI but missing from AGENTS.md`,
    );
  });
}

test("AGENTS.md lists the i18n catalogue check CI runs", () => {
  assert.ok(agents.includes("krizaka-i18n check messages"));
});
