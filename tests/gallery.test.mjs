// The gallery's code is the demo that runs (one file per card) and the guard fails on any drift.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

import { ITEMS, shownCode } from "../src/lab/gallery-data.ts";

const gallery = readFileSync(new URL("../src/lab/gallery.tsx", import.meta.url), "utf8");

test("a card renders the file whose source it prints, and keeps no code string of its own", () => {
  assert.match(gallery, /import\.meta\.glob[^;]*examples\/\*\.tsx/);
  assert.match(gallery, /query: "\?raw"/);
  assert.doesNotMatch(gallery, /code: `/);
});

test("the Badge and Chip card prints the three chips it shows, with Week selected", () => {
  const code = readFileSync(new URL("../src/lab/examples/badge.tsx", import.meta.url), "utf8");
  for (const v of ["week", "month", "year"]) assert.match(code, new RegExp(`<Chip value="${v}">`));
  assert.match(code, /useState\("week"\)/);
});

test("the printed code only rewrites the lab's relative view import", () => {
  const out = shownCode('import { X } from "../../react/NeuralLatticeView";\nconst a = 1;\n');
  assert.match(out, /@krizaka\/motion\/react/);
  assert.match(out, /const a = 1;/);
});

test("the guard passes, and fails when a listed prop is not in the example", () => {
  assert.equal(ITEMS.length, 16);
  execFileSync("node", ["scripts/check-gallery.mjs"], { stdio: "pipe" });
  const file = new URL("../src/lab/examples/tabs.tsx", import.meta.url);
  const original = readFileSync(file, "utf8");
  try {
    writeFileSync(file, original.replace('defaultValue="week"', 'value="week"'));
    assert.throws(() => execFileSync("node", ["scripts/check-gallery.mjs"], { stdio: "pipe" }), /./);
  } finally {
    writeFileSync(file, original);
  }
});
