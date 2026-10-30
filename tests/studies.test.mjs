// The notebook studies: each has its demo + its styles + its words, honest about its status, and a reduced-motion rule.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import { STUDIES } from "../src/lab/studies-data.ts";

const en = JSON.parse(readFileSync(new URL("../messages/en.json", import.meta.url), "utf8"));
const read = (f) => readFileSync(new URL(`../src/lab/studies/${f}`, import.meta.url), "utf8");

test("five studies, each with a demo, its styles and its words", () => {
  assert.equal(STUDIES.length, 5);
  for (const { id } of STUDIES) {
    assert.ok(existsSync(new URL(`../src/lab/studies/${id}.tsx`, import.meta.url)), `${id}.tsx`);
    assert.ok(existsSync(new URL(`../src/lab/studies/${id}.css`, import.meta.url)), `${id}.css`);
    const w = en.studies.items[id];
    assert.ok(w?.title && w.what && w.reduced, `${id}: words`);
  }
});

test("every study handles prefers-reduced-motion and says its status honestly", () => {
  for (const { id } of STUDIES) assert.match(read(`${id}.css`) + read(`${id}.tsx`), /prefers-reduced-motion/, id);
  assert.equal(en.studies.status, "Experimental, lab only");
});

test("native web tech only: no animation library, no canvas, no requestAnimationFrame", () => {
  for (const { id } of STUDIES)
    assert.doesNotMatch(read(`${id}.tsx`), /requestAnimationFrame|<canvas|framer-motion|gsap/, id);
});
