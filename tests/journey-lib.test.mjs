import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { journeyAt } from "../src/lab/journey-lib.ts";

describe("a journey over time", () => {
  it("starts on the first step and moves one step per stepMs, with the progress of the current one", () => {
    assert.deepEqual(journeyAt(0, 4, 1000), { current: 0, value: 0, failed: null, done: false });
    assert.deepEqual(journeyAt(1500, 4, 1000), { current: 1, value: 0.5, failed: null, done: false });
  });

  it("is done after the last step, and never before", () => {
    assert.equal(journeyAt(3999, 4, 1000).done, false);
    assert.deepEqual(journeyAt(4000, 4, 1000), { current: 4, value: 1, failed: null, done: true });
    assert.equal(journeyAt(1e9, 4, 1000).current, 4);
  });

  it("stops on the failing step at 60 % of its time and stays there", () => {
    assert.equal(journeyAt(2500, 4, 1000, 2).failed, null);
    assert.deepEqual(journeyAt(2600, 4, 1000, 2), { current: 2, value: 0.6, failed: 2, done: false });
    assert.deepEqual(journeyAt(1e9, 4, 1000, 2), { current: 2, value: 0.6, failed: 2, done: false });
  });

  it("ignores a failing step that does not exist, and clamps a negative time", () => {
    assert.equal(journeyAt(1e9, 3, 100, 9).done, true);
    assert.equal(journeyAt(-5, 3, 100).current, 0);
  });
});
