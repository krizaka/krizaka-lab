// The lab by task (krizaka-ui#434): every guide answers one task on a real screen, gives code to copy that follows its
// settings, and a table of every option with what happens under reduced motion.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { GUIDES } from "../src/lab/guides.ts";
import { readValues, toSearch } from "../src/lab/playground-lib.ts";

const scenarios = readFileSync(new URL("../src/lab/scenarios.tsx", import.meta.url), "utf8");

test("six guides, each on one of the four scenarios", () => {
  assert.deepEqual(GUIDES.map((g) => g.id), ["list-arrival", "live-number", "streaming-answer", "page-transition", "button-feedback", "route-draw"]);
  // grouped by screen in the order of the scenarios, so the index numbers read 01 → 06 down the page
  const order = ["dashboard", "chat", "checkout", "delivery"];
  assert.deepEqual(GUIDES.map((g) => order.indexOf(g.scenario)), [...GUIDES.map((g) => order.indexOf(g.scenario))].sort());
  for (const g of GUIDES) assert.ok(["dashboard", "chat", "checkout", "delivery"].includes(g.scenario), g.id);
  for (const s of ["dashboard", "chat", "checkout", "delivery"]) assert.ok(GUIDES.some((g) => g.scenario === s), `no guide plays on ${s}`);
});

test("a guide's title is a task, its code imports Krizaka UI (or the platform) and follows its settings", () => {
  for (const g of GUIDES) {
    assert.match(g.title, /^[A-Z][a-z]+ /, g.id);
    const defaults = Object.fromEntries(g.knobs.map((k) => [k.key, k.value]));
    const code = g.snippet(defaults);
    assert.match(code, /@krizaka\/ui\/|startViewTransition/, g.id);
    for (const k of g.knobs.filter((k) => k.kind !== "toggle")) {
      const changed = { ...defaults, [k.key]: k.kind === "range" ? k.max : k.options.at(-1) };
      if (g.snippet(changed) === code) continue; // a setting of the screen's data (how often a run lands), not of the motion
      assert.ok(g.snippet(changed).includes(String(changed[k.key])), `${g.id}: the code does not follow « ${k.label} »`);
    }
  }
});

test("every guide has its options table and says what happens under reduced motion", () => {
  for (const g of GUIDES) {
    assert.ok(g.config.length >= 3, g.id);
    for (const row of g.config) for (const f of ["option", "type", "default", "does"]) assert.ok(row[f].length > 0, `${g.id}: ${row.option} has no ${f}`);
    assert.ok(g.reduced.length > 20, g.id);
    assert.ok(g.uses.every((u) => u.href.startsWith("https://ui.krizaka.com/")), g.id);
  }
});

test("both checkout guides share token settings, round-trip every knob, and copy the actual configuration", () => {
  const guides = GUIDES.filter((g) => g.scenario === "checkout");
  assert.equal(guides.length, 2);
  assert.equal(guides[0].knobs, guides[1].knobs);
  for (const g of guides) {
    const initial = readValues(g.knobs, "");
    assert.deepEqual(Object.keys(initial), ["wait", "direction", "duration", "easing", "fail"]);
    for (const knob of g.knobs) {
      const values = { ...initial, [knob.key]: knob.kind === "toggle" ? true : knob.kind === "range" ? knob.max : knob.options[0] };
      const read = readValues(g.knobs, toSearch(g.knobs, values));
      assert.deepEqual(read, values);
      assert.ok(g.snippet(read).includes(`${knob.key}: ${JSON.stringify(values[knob.key])}`));
      assert.ok(g.config.some((row) => row.option === knob.key));
    }
    assert.match(g.reduced, /instantly.*focus.*without animation.*final total/i);
    assert.match(g.snippet(initial), /not exports of @krizaka\/ui/);
  }
});

test("the scenarios are app screens made of Krizaka UI, with their clocks stopped off screen and under reduced motion", () => {
  for (const name of ["Dashboard", "Chat", "Checkout", "Delivery"]) assert.match(scenarios, new RegExp(`export function ${name}\\(`));
  assert.doesNotMatch(scenarios, /<canvas|requestAnimationFrame/);
  assert.match(scenarios, /if \(!stream \|\| !visible \|\| reduce\) return;/);
  assert.match(scenarios, /if \(!visible \|\| reduce\) return;/);
  assert.ok((scenarios.match(/demo/gi) ?? []).length >= 4, "the data says it is a demo");
});
