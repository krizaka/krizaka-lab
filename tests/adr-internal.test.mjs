import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

// The lab hosts no ADR files: architecture and strategy decisions are the company's, they live in krizaka-internal
// (founder decision, krizaka/krizaka-restricted#316, 2026-11-07). This guard keeps them out of the public repository
// and keeps every link off the ADR files that moved, so neither can creep back in.
const root = new URL("../", import.meta.url).pathname;
const SKIP = new Set(["node_modules", ".git", "dist", "dist-demo", ".pnpm-store"]);
const TEXT = /\.(md|mdx|mjs|cjs|js|jsx|ts|tsx|json|html|txt|yml|yaml)$/;
const SELF = "adr-internal.test.mjs";

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const files = walk(root);

test("the public lab hosts no ADR file (they live in krizaka-internal, #316)", () => {
  const adrs = files.filter((f) => /\/docs\/adr\/ADR-[^/]*\.md$/.test(f)).map((f) => path.relative(root, f));
  assert.deepEqual(adrs, [], `ADR files belong in krizaka-internal, not here: ${adrs.join(", ")}`);
});

test("docs/adr/README.md stays, saying the decisions are internal", () => {
  const readme = path.join(root, "docs/adr/README.md");
  assert.ok(existsSync(readme), "docs/adr/README.md is missing");
  assert.match(readFileSync(readme, "utf8"), /decisions are internal/i);
});

test("no link points to a deleted ADR file", () => {
  // A link into the lab's own ADR files, or any relative markdown link to docs/adr/ADR-*.md, is forbidden;
  // a plain mention ("ADR-001 (internal)") and a link to the krizaka-internal path are fine.
  const labHostedAdr = /krizaka-lab\/[^)\s]*\/docs\/adr\/ADR/;
  const relativeAdrLink = /\]\(\s*[^)]*\bdocs\/adr\/ADR[^)]*\)/;
  const offenders = [];
  for (const f of files) {
    if (!TEXT.test(f) || f.endsWith(SELF)) continue;
    const body = readFileSync(f, "utf8");
    if (labHostedAdr.test(body) || relativeAdrLink.test(body)) offenders.push(path.relative(root, f));
  }
  assert.deepEqual(offenders, [], `these files link to a moved ADR file: ${offenders.join(", ")}`);
});
