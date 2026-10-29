// The performance budget guard (ADR-001 §6): no permanent rAF outside the experiments.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { budget, rafProblems } from "../scripts/check-budget.mjs";

test("rAF is allowed only in the experiments and native adapters", () => {
  assert.deepEqual(budget.rafAllowed, ["src/core/", "src/native/"]);
});

test("a requestAnimationFrame outside the allowed folders is reported", () => {
  const root = mkdtempSync(join(tmpdir(), "raf-"));
  try {
    mkdirSync(join(root, "src/core"), { recursive: true });
    mkdirSync(join(root, "src/lab"), { recursive: true });
    writeFileSync(join(root, "src/core/a.ts"), "requestAnimationFrame(loop);");
    writeFileSync(join(root, "src/lab/b.tsx"), "requestAnimationFrame(loop);");
    const problems = rafProblems(join(root, "src"), ["src/core/"], root);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /src\/lab\/b\.tsx/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the lab itself keeps no requestAnimationFrame outside src/core and src/native", () => {
  assert.deepEqual(rafProblems(), []);
});

test("the lab is not a package (ADR-008 §6): no exports, no library build, nothing to publish", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.private, true);
  for (const key of ["main", "module", "types", "exports", "files"])
    assert.equal(pkg[key], undefined, `package.json has \`${key}\``);
  for (const file of ["../vite.config.lib.ts", "../tsconfig.build.json", "../src/index.ts"])
    assert.equal(existsSync(new URL(file, import.meta.url)), false, file);
});
