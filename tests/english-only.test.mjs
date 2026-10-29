import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";

// The lab is English only (Oussama, 2026-10-20): one catalogue, no language switch, no ?lang= address.
test("there is one catalogue, messages/en.json, and it has no empty string", () => {
  assert.deepEqual(readdirSync(new URL("../messages", import.meta.url)), ["en.json"]);
  const walk = (o) => Object.values(o).flatMap((v) => (typeof v === "object" && v ? walk(v) : [v]));
  for (const v of walk(JSON.parse(readFileSync(new URL("../messages/en.json", import.meta.url), "utf8"))))
    if (typeof v === "string") assert.ok(v.trim().length > 0);
});

test("the shell has no language switch and the checks no longer visit ?lang=fr", () => {
  assert.equal(existsSync(new URL("../messages/fr.json", import.meta.url)), false);
  assert.doesNotMatch(
    readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8"),
    /NavBar\.Language|LOCALES|\?lang/,
  );
  assert.doesNotMatch(readFileSync(new URL("../scripts/check-overflow.mjs", import.meta.url), "utf8"), /lang=fr/);
});
