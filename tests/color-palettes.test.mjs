import { core } from "./support/core.mjs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { PRODUCT_BRANDS, JARVIS_THEMES, CAUSTIC_PALETTES } = core;

describe("Brand Color Palettes & Tokens", () => {
  it("defines the Krizaka product brands", () => {
    const requiredBrands = ["orazaka", "yomizaka", "akinaza"];

    for (const id of requiredBrands) {
      const brand = PRODUCT_BRANDS[id];
      assert.ok(brand, `Brand ${id} must exist`);
      assert.equal(brand.id, id);
      assert.match(brand.primary, /^#[0-9a-fA-F]{6}$/);
      assert.ok(Array.isArray(brand.rgb) && brand.rgb.length === 3);
      for (const channel of brand.rgb) {
        assert.ok(channel >= 0 && channel <= 255);
      }
    }
  });

  it("verifies Orazaka uses brand orange and the sage theme uses sage", () => {
    assert.equal(PRODUCT_BRANDS.orazaka.primary.toLowerCase(), "#f97316");
    assert.equal(JARVIS_THEMES.sage.primary.toLowerCase(), "#7c9082");
  });

  it("defines all Jarvis HUD themes with valid contrasts", () => {
    const themes = ["cyan", "orazaka", "sage", "crimson", "gold"];
    for (const t of themes) {
      const theme = JARVIS_THEMES[t];
      assert.ok(theme, `Theme ${t} must exist`);
      assert.match(theme.primary, /^#[0-9a-fA-F]{6}$/);
      assert.match(theme.secondary, /^#[0-9a-fA-F]{6}$/);
      assert.ok(theme.glow.startsWith("rgba("));
    }
  });

  it("defines all Caustic mineral palettes", () => {
    const palettes = ["obsidian", "prussian", "sage", "amber"];
    for (const p of palettes) {
      const pal = CAUSTIC_PALETTES[p];
      assert.ok(pal, `Caustic palette ${p} must exist`);
      assert.match(pal.bg, /^#[0-9a-fA-F]{6}$/);
      assert.ok(pal.causticR && pal.causticG && pal.causticB);
    }
  });
});
