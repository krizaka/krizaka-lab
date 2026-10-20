import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Cubic Bezier Trajectory Calculations", () => {
  it("interpolates correctly from start to end", () => {
    const p0 = { x: 50, y: 100 };
    const p1 = { x: 150, y: 100 };
    const p2 = { x: 250, y: 200 };
    const p3 = { x: 400, y: 200 };

    const bezier = (t) => {
      const mt = 1 - t;
      const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
      const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
      return { x, y };
    };

    const start = bezier(0);
    assert.equal(start.x, 50);
    assert.equal(start.y, 100);

    const end = bezier(1);
    assert.equal(end.x, 400);
    assert.equal(end.y, 200);

    const mid = bezier(0.5);
    assert.ok(mid.x > start.x && mid.x < end.x);
    assert.ok(mid.y >= start.y && mid.y <= end.y);
  });
});
