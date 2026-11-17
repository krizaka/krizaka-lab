import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Ubuntu 26.04 runners need Playwright >= 1.61 (krizaka-internal#4129): the version is the fix, never a runs-on pin.
const MINIMUM = [1, 61];

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
const lock = readFileSync(new URL("pnpm-lock.yaml", root), "utf8");

const atLeastMinimum = (version) => {
  const [major, minor] = version.split(".").map(Number);
  return major > MINIMUM[0] || (major === MINIMUM[0] && minor >= MINIMUM[1]);
};

test("package.json pins Playwright at 1.61 or later", () => {
  const declared = manifest.devDependencies?.playwright ?? manifest.dependencies?.playwright;
  assert.ok(declared, "playwright is declared");
  assert.ok(atLeastMinimum(declared.replace(/^[^\d]*/, "")), `playwright ${declared} is below 1.61`);
});

test("the lockfile locks Playwright at 1.61 or later", () => {
  const locked = [...lock.matchAll(/^ {2}playwright@(\d+\.\d+\.\d+):/gm)].map((m) => m[1]);
  assert.ok(locked.length > 0, "playwright is locked");
  for (const version of locked) assert.ok(atLeastMinimum(version), `locked playwright ${version} is below 1.61`);
});
