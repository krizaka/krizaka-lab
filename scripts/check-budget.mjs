#!/usr/bin/env node
/* Performance budget (ADR-001 §6), two guards that need no browser:
   1. size: the gzip size of each built entry plus every chunk it imports stays under its ceiling (scripts/budget.json);
   2. no permanent requestAnimationFrame outside the experiments (src/core) and the native adapters (src/native).
     pnpm run build:lib && node scripts/check-budget.mjs [--dist dist] */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
export const budget = JSON.parse(readFileSync(join(import.meta.dirname, "budget.json"), "utf8"));

/** The entry file and the local chunks it imports (static or dynamic), each counted once. */
export function chunksOf(entry, dist) {
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    const code = readFileSync(file, "utf8");
    for (const m of code.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["'](\.{1,2}\/[^"']+)["']/g)) visit(resolve(dirname(file), m[1]));
  };
  visit(join(dist, entry));
  return [...seen];
}

export function gzipSize(files) {
  return files.reduce((sum, f) => sum + gzipSync(readFileSync(f), { level: 9 }).length, 0);
}

export function sizeProblems(dist, entries = budget.entries) {
  const problems = [];
  for (const [entry, limit] of Object.entries(entries)) {
    if (!existsSync(join(dist, entry))) {
      problems.push(`${entry}: not built (run pnpm run build:lib)`);
      continue;
    }
    const size = gzipSize(chunksOf(entry, dist));
    if (size > limit) problems.push(`${entry}: ${size} B gzip is over its ${limit} B budget`);
  }
  return problems;
}

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
    if (/\brequestAnimationFrame\s*\(/.test(readFileSync(file, "utf8"))) problems.push(`${rel}: requestAnimationFrame outside ${allowed.join(", ")}`);
  }
  return problems;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const i = process.argv.indexOf("--dist");
  const dist = resolve(ROOT, i > 0 ? process.argv[i + 1] : "dist");
  const problems = [...sizeProblems(dist), ...rafProblems()];
  if (problems.length) {
    console.error(problems.map((p) => `✗ ${p}`).join("\n"));
    process.exit(1);
  }
  console.log(`✓ budget: ${Object.keys(budget.entries).length} entries within their gzip ceiling, no requestAnimationFrame outside the experiments`);
}
