import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { PRODUCT_BRANDS, JARVIS_THEMES, CAUSTIC_PALETTES } from "../dist/core/index.js";

describe("Brand Color Palettes & Tokens", () => {
  it("defines all seven Krizaka product brands", () => {
    const requiredBrands = [
      "orazaka",
      "yomizaka",
      "orochia",
      "kachizaka",
      "akinaza",
      "yasakia",
      "yororis",
    ];

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

  it("verifies Orazaka uses brand orange and Yororis uses sage", () => {
    assert.equal(PRODUCT_BRANDS.orazaka.primary.toLowerCase(), "#f97316");
    assert.equal(PRODUCT_BRANDS.yororis.primary.toLowerCase(), "#7c9082");
  });

  it("defines all Jarvis HUD themes with valid contrasts", () => {
    const themes = ["cyan", "orazaka", "yororis", "crimson", "gold"];
    for (const t of themes) {
      const theme = JARVIS_THEMES[t];
      assert.ok(theme, `Theme ${t} must exist`);
      assert.match(theme.primary, /^#[0-9a-fA-F]{6}$/);
      assert.match(theme.secondary, /^#[0-9a-fA-F]{6}$/);
      assert.ok(theme.glow.startsWith("rgba("));
    }
  });

  it("defines all Caustic mineral palettes", () => {
    const palettes = ["obsidian", "prussian", "yororis", "amber"];
    for (const p of palettes) {
      const pal = CAUSTIC_PALETTES[p];
      assert.ok(pal, `Caustic palette ${p} must exist`);
      assert.match(pal.bg, /^#[0-9a-fA-F]{6}$/);
      assert.ok(pal.causticR && pal.causticG && pal.causticB);
    }
  });
});
