#!/usr/bin/env node
/* The gallery's cards are honest: every card has its example (the file that is both the live preview and the printed
   code), no example is orphaned, every listed prop is declared by the package (or the lab view) it comes from, and the
   code printed for a prop is really in the source. Build-time, like gen-ui-docs.mjs --check.   node scripts/check-gallery.mjs */
import { readdirSync, readFileSync } from "node:fs";

const { ITEMS } = await import("../src/lab/gallery-data.ts");
const dir = new URL("../src/lab/examples/", import.meta.url);
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => f.replace(/\.tsx$/, ""));
const uiDist = new URL("../node_modules/@krizaka/ui/dist/", import.meta.url);
const uiTypes = readdirSync(uiDist).filter((f) => f.endsWith(".d.ts"));
const problems = [];

for (const id of files)
  if (!ITEMS.some((i) => i.id === id)) problems.push(`examples/${id}.tsx is not in the catalogue`);
const messages = JSON.parse(readFileSync(new URL("../messages/en.json", import.meta.url), "utf8")).gallery.items;
for (const item of ITEMS) {
  if (!files.includes(item.id)) {
    problems.push(`${item.id}: no examples/${item.id}.tsx`);
    continue;
  }
  if (!messages[item.id]) problems.push(`${item.id}: no words in messages gallery.items`);
  const source = readFileSync(new URL(`${item.id}.tsx`, dir), "utf8");
  const declared = item.declared
    .map((d) =>
      /^[A-Z]/.test(d)
        ? readFileSync(new URL(`../src/react/${d}.tsx`, import.meta.url), "utf8")
        : uiTypes
            .filter((f) => f === `${d}.d.ts` || f.startsWith(`${d}-`))
            .map((f) => readFileSync(new URL(f, uiDist), "utf8"))
            .join("\n"),
    )
    .join("\n");
  if (!declared.trim()) problems.push(`${item.id}: nothing declared by ${item.declared.join(", ")}`);
  for (const p of item.props) {
    const name =
      p.split(/[= ]/).filter(Boolean).at(-1) === p.split(/[= ]/)[0]
        ? p.split(/[= ]/)[0]
        : p.split(" ").at(-1).split("=")[0];
    const attr = p.includes("=") ? p.split(" ").at(-1) : name;
    const prop = name.split(".").at(-1);
    if (new RegExp(`@deprecated[^\\n]*\\n(?:[^\\n]*\\n){0,2}\\s*${prop}\\??:`).test(declared))
      problems.push(`${item.id}: prop « ${p} » is deprecated (does nothing)`);
    if (!new RegExp(`\\b${prop}\\b`).test(declared)) problems.push(`${item.id}: prop « ${p} » is declared nowhere`);
    if (!source.includes(attr.includes("=") ? attr : prop))
      problems.push(`${item.id}: prop « ${p} » is listed but not used in the example`);
  }
}
if (problems.length) {
  console.error(`gallery check failed:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`gallery check: ${ITEMS.length} cards, examples, props and words agree`);
