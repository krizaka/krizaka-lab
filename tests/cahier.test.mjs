import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The Motion lab in the Cahier (krizaka-ui ADR-004, #417): its own stylesheet carries none of the template tells — no
// uppercase tracked label, no frosted panel, no round card. (The canvas demos are drawings and keep their own light.)
const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

test("no uppercase tracked label, no frosted panel, no round card in the lab's styles", () => {
  assert.doesNotMatch(css, /text-transform:\s*uppercase/);
  assert.doesNotMatch(css, /letter-spacing:\s*0?\.(0[4-9]|[1-9])/);
  assert.doesNotMatch(css, /backdrop-filter/);
  assert.doesNotMatch(css, /border-radius:\s*(1\d|[2-9]\d)px/);
});

test("the lab's title is set in the display face, at its one weight", () => {
  assert.match(css, /\.lab-hero h1 \{[^}]*font-family: var\(--kz-font-display\); font-weight: 400;/);
});
