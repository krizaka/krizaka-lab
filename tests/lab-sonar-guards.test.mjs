import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import ts from "typescript";

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

test("no nested template literal in the lab sources (S4624)", () => {
  const nested = labAll.filter(([, s]) => /\$\{[^}\n]*`/.test(s)).map(([f]) => f);
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

test("uses Number.parseFloat rather than bare global parseFloat (S7773)", () => {
  const bare = labAll.filter(([, s]) => /(?<!Number\.)\bparseFloat\(/.test(s)).map(([f]) => f);
  assert.deepEqual(bare, []);
});

function hasNestedTernary(file, source) {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  let found = false;
  const visit = (node, inConditional) => {
    if (found) {
      return;
    }
    if (ts.isFunctionLike(node)) {
      ts.forEachChild(node, (child) => visit(child, false));
      return;
    }
    if (ts.isConditionalExpression(node)) {
      if (inConditional) {
        found = true;
        return;
      }
      ts.forEachChild(node, (child) => visit(child, true));
      return;
    }
    ts.forEachChild(node, (child) => visit(child, inConditional));
  };
  visit(ast, false);
  return found;
}

test("no nested ternary expressions in lab sources (S3358)", () => {
  const nested = labAll.filter(([f, s]) => hasNestedTernary(f, s)).map(([f]) => f);
  assert.deepEqual(nested, []);
});

test("no component or JSX cell renderer defined inline inside GuidePage or Home (S6478)", () => {
  const guidePage = readFileSync(new URL("GuidePage.tsx", LAB), "utf8");
  const home = readFileSync(new URL("Home.tsx", LAB), "utf8");
  assert.doesNotMatch(guidePage, /cell:\s*\([^)]*\)\s*=>\s*</);
  assert.doesNotMatch(home, /=>\s*(?:\(\s*props|\{\s*const to\b)/);
  assert.doesNotMatch(home, /linkAs=\{\(props/);
});

test("marginalia popover span has explicit spacing after the sentence (S6772)", () => {
  const marginalia = readFileSync(new URL("studies/marginalia.tsx", LAB), "utf8");
  assert.doesNotMatch(marginalia, /could not say\.\n\s*<span/);
});
