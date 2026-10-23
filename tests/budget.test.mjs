// The performance budget guard (ADR-001 §6): size ceilings per entry, no permanent rAF outside the experiments.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { budget, chunksOf, rafProblems, sizeProblems } from "../scripts/check-budget.mjs";

test("every entry has a ceiling, and rAF is allowed only in the experiments and native adapters", () => {
  assert.deepEqual(Object.keys(budget.entries).sort(), ["core/index.js", "index.js", "native/index.js", "react/index.js"]);
  assert.deepEqual(budget.rafAllowed, ["src/core/", "src/native/"]);
});

test("the size guard counts the chunks an entry imports, and fails over the ceiling", () => {
  const dir = mkdtempSync(join(tmpdir(), "budget-"));
  try {
    writeFileSync(join(dir, "a.js"), 'import { x } from "./chunk.js";\nexport const a = x;\n');
    writeFileSync(join(dir, "chunk.js"), `export const x = "${Math.random().toString(36).repeat(400)}";\n`);
    assert.equal(chunksOf("a.js", dir).length, 2);
    assert.deepEqual(sizeProblems(dir, { "a.js": 100000 }), []);
    assert.match(sizeProblems(dir, { "a.js": 10 })[0], /over its 10 B budget/);
    assert.match(sizeProblems(dir, { "missing.js": 10 })[0], /not built/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
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
