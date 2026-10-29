import { core } from "./support/core.mjs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { SpringSolver, SpringVector2D } = core;

describe("Second-Order Spring Physics Solver", () => {
  it("initializes with initial value and zero velocity", () => {
    const spring = new SpringSolver(2.0, 0.75, 0.0, 100);
    assert.equal(spring.getValue(), 100);
    assert.equal(spring.getVelocity(), 0);
  });

  it("converges toward target over time", () => {
    const spring = new SpringSolver(4.0, 0.8, 0.0, 0);
    const target = 100;
    const dt = 0.016;

    // Simulate 60 frames (1 second)
    for (let i = 0; i < 60; i++) {
      spring.update(target, dt);
    }

    assert.ok(Math.abs(spring.getValue() - target) < 1.0, `Spring should converge near 100, got ${spring.getValue()}`);
    assert.ok(spring.isSettled(target, 1.5, 2.0));
  });

  it("handles snapTo immediately without lingering velocity", () => {
    const spring = new SpringSolver(2.0, 0.75, 0.0, 0);
    spring.update(50, 0.016);
    spring.snapTo(200);

    assert.equal(spring.getValue(), 200);
    assert.equal(spring.getVelocity(), 0);
  });

  it("SpringVector2D updates both dimensions synchronously", () => {
    const vSpring = new SpringVector2D(3.0, 0.75, 0.0, 10, 20);
    const result = vSpring.update(50, 80, 0.016);

    assert.ok(result.x > 10);
    assert.ok(result.y > 20);
  });
});
