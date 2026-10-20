import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { defaults, propsSnippet, readValues, toSearch } from "../src/lab/playground-lib.ts";

const knobs = [
  { kind: "choice", key: "density", label: "density", options: ["sparse", "normal", "dense"], value: "normal" },
  { kind: "range", key: "speed", label: "speed", min: 4, max: 40, step: 2, value: 16 },
  { kind: "toggle", key: "breathe", label: "breathe", value: true },
];

describe("the playground's configuration", () => {
  it("starts from the knobs' defaults", () => {
    assert.deepEqual(defaults(knobs), { density: "normal", speed: 16, breathe: true });
  });

  it("reads a shared address, checking every value against its knob", () => {
    assert.deepEqual(readValues(knobs, "?density=dense&speed=24&breathe=0"), { density: "dense", speed: 24, breathe: false });
    assert.deepEqual(readValues(knobs, "?density=wild&speed=9999&breathe=maybe"), { density: "normal", speed: 40, breathe: true });
    assert.deepEqual(readValues(knobs, "?speed=abc"), defaults(knobs));
  });

  it("writes only what differs from the defaults, and the address reads back to the same values", () => {
    const values = { density: "dense", speed: 16, breathe: false };
    assert.equal(toSearch(knobs, values), "?density=dense&breathe=0");
    assert.deepEqual(readValues(knobs, toSearch(knobs, values)), values);
    assert.equal(toSearch(knobs, defaults(knobs)), "");
  });

  it("writes the copied snippet's props from the knobs that changed, never the defaults or the skipped ones", () => {
    assert.equal(propsSnippet(knobs, defaults(knobs)), "");
    assert.equal(propsSnippet(knobs, { density: "dense", speed: 24, breathe: false }), '\n  density="dense"\n  speed={24}\n  breathe={false}');
    assert.equal(propsSnippet(knobs, { density: "dense", speed: 24, breathe: true }, ["speed"]), '\n  density="dense"');
  });
});
