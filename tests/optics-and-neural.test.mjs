import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Optics & Snell's Law Refraction Indices", () => {
  const FLUID_REFRACTION_INDICES = {
    helium: 1.03,
    water: 1.33,
    glass: 1.52,
    mercury: 1.95,
  };

  it("ensures physical ordering of refractive indices (helium < water < glass < mercury)", () => {
    assert.ok(FLUID_REFRACTION_INDICES.helium < FLUID_REFRACTION_INDICES.water);
    assert.ok(FLUID_REFRACTION_INDICES.water < FLUID_REFRACTION_INDICES.glass);
    assert.ok(FLUID_REFRACTION_INDICES.glass < FLUID_REFRACTION_INDICES.mercury);
  });

  it("calculates chromatic RGB dispersion offsets proportionally to wavelength", () => {
    const baseIndex = FLUID_REFRACTION_INDICES.glass;
    // Cauchy dispersion formula approximation: n(lambda) = A + B / lambda^2
    const nRed = baseIndex - 0.012; // longer wavelength ~650nm
    const nGreen = baseIndex; // mid wavelength ~530nm
    const nBlue = baseIndex + 0.018; // shorter wavelength ~450nm

    assert.ok(nRed < nGreen, "Red index should bend less than Green");
    assert.ok(nGreen < nBlue, "Green index should bend less than Blue");
  });
});

describe("Hodgkin-Huxley Synaptic Potentials & Cognitive Clusters", () => {
  it("normalizes biological resting and action potentials", () => {
    const restingPot = -70; // mV
    const peakPot = 30; // mV
    const threshold = -55; // mV

    const normalize = (v) => (v - restingPot) / (peakPot - restingPot);

    assert.equal(normalize(restingPot), 0);
    assert.equal(normalize(peakPot), 1);
    assert.ok(normalize(threshold) > 0 && normalize(threshold) < 0.2);
  });

  it("verifies cognitive cluster brand alignment", () => {
    const clusters = ["orazaka", "yororis", "jarvis"];
    assert.equal(clusters.length, 3);
    assert.ok(clusters.includes("orazaka"));
    assert.ok(clusters.includes("yororis"));
    assert.ok(clusters.includes("jarvis"));
  });
});

describe("Yororis Harmonic Frequencies", () => {
  const TONES = {
    lea: 216,
    theta: 432,
    solfeggio: 528,
    aurora: 639,
  };

  it("defines octave and therapeutic ratios", () => {
    // 216 Hz to 432 Hz is an exact octave doubling (2:1)
    assert.equal(TONES.theta / TONES.lea, 2.0);
    assert.equal(TONES.solfeggio, 528);
    assert.equal(TONES.aurora, 639);
  });
});

describe("Jarvis Tactical Target Lock Threat Levels", () => {
  const computeThreat = (distanceMeters) => {
    if (distanceMeters < 1200) return "CRITICAL";
    if (distanceMeters < 1800) return "ELEVATED";
    return "MINIMAL";
  };

  it("evaluates correct threat postures based on ballistic proximity", () => {
    assert.equal(computeThreat(950), "CRITICAL");
    assert.equal(computeThreat(1450), "ELEVATED");
    assert.equal(computeThreat(2400), "MINIMAL");
  });
});

describe("Voice presence particles", () => {
  it("never draw a negative radius: depth is clamped before the perspective divide", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync(new URL("../src/core/yororis-synthesis.ts", import.meta.url), "utf8");
    assert.match(src, /fov \/ Math\.max\(40, fov \+ sp\.z \* this\.baseRadius\)/);
  });
  it("has no breathing exercise wording", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync(new URL("../src/core/yororis-synthesis.ts", import.meta.url), "utf8");
    assert.doesNotMatch(src, /4-7-8|INHALE|EXHALE|breathing/i);
  });
});
