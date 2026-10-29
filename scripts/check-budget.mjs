#!/usr/bin/env node
/* Performance guard (ADR-001 §6): no permanent requestAnimationFrame outside the experiments (src/core) and the native adapters (src/native).
   The lab is not a package (ADR-008 §6): there is no built entry to weigh.
     node scripts/check-budget.mjs */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
export const budget = JSON.parse(readFileSync(join(import.meta.dirname, "budget.json"), "utf8"));

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(name)) yield p;
  }
}

export function rafProblems(srcDir = join(ROOT, "src"), allowed = budget.rafAllowed, root = ROOT) {
  const problems = [];
  for (const file of walk(srcDir)) {
    const rel = relative(root, file).split("\\").join("/");
    if (allowed.some((a) => rel.startsWith(a))) continue;
    if (/\brequestAnimationFrame\s*\(/.test(readFileSync(file, "utf8")))
      problems.push(`${rel}: requestAnimationFrame outside ${allowed.join(", ")}`);
  }
  return problems;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const problems = rafProblems();
  if (problems.length) {
    console.error(problems.map((p) => `✗ ${p}`).join("\n"));
    process.exit(1);
  }
  console.log("✓ budget: no requestAnimationFrame outside the experiments");
}
