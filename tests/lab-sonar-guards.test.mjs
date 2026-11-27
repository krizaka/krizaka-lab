import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const LAB = new URL("../src/lab/", import.meta.url);
const labAll = readdirSync(LAB)
  .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
  .map((f) => [f, readFileSync(new URL(f, LAB), "utf8")]);
const sources = labAll.filter(([f]) => f.endsWith(".tsx"));

test("the knob control is drawn once (a copy trips the duplication gate)", () => {
  const owners = sources.filter(([, s]) => s.includes("<Chip.Group")).map(([f]) => f);
  assert.deepEqual(
    owners.filter((f) => f === "GuidePage.tsx"),
    [],
  );
  assert.match(readFileSync(new URL("GuidePage.tsx", LAB), "utf8"), /import \{ Control \} from "\.\/playground"/);
});

test("no nested template literal in the lab views (S4624)", () => {
  const nested = sources.filter(([, s]) => /\$\{`/.test(s)).map(([f]) => f);
  assert.deepEqual(nested, []);
});

test("an anchor with a click handler spells its href in the same element (S1082)", () => {
  const spread = sources.filter(([, s]) => /<a \{\.\.\.props\} onClick=/.test(s)).map(([f]) => f);
  assert.deepEqual(spread, []);
});

test("knob value union is named once via KnobValue alias (S4323)", () => {
  const inlineUnion = labAll
    .filter(([f, s]) => f !== "playground-lib.ts" && /string \| number \| boolean/.test(s))
    .map(([f]) => f);
  assert.deepEqual(inlineUnion, []);
});
