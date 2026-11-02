import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const LAB = new URL("../src/lab/", import.meta.url);
const sources = readdirSync(LAB)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => [f, readFileSync(new URL(f, LAB), "utf8")]);

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
