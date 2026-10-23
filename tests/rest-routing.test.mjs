import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TAB_ROUTES,
  resolveTabFromLocation,
  getHrefForTab,
} from "../dist/core/index.js";

describe("RESTful Routing & URL Resolution", () => {
  it("resolves default tab (orazaka) when path is root or empty", () => {
    assert.equal(resolveTabFromLocation({ pathname: "/" }), "orazaka");
    assert.equal(resolveTabFromLocation({ pathname: "" }), "orazaka");
  });

  it("resolves tabs from clean pathname", () => {
    assert.equal(resolveTabFromLocation({ pathname: "/orazaka" }), "orazaka");
    assert.equal(resolveTabFromLocation({ pathname: "/yororis" }), "yororis");
    assert.equal(resolveTabFromLocation({ pathname: "/jarvis" }), "jarvis");
    assert.equal(resolveTabFromLocation({ pathname: "/liquid-glass" }), "caustics");
    assert.equal(resolveTabFromLocation({ pathname: "/neural-lattice" }), "lattice");
    assert.equal(resolveTabFromLocation({ pathname: "/krizaka-ui" }), "kz-ui");
    assert.equal(resolveTabFromLocation({ pathname: "/specs" }), "architecture");
  });

  it("resolves tabs under GitHub Pages repository subpath /krizaka-motion/", () => {
    assert.equal(resolveTabFromLocation({ pathname: "/krizaka-motion/yororis" }), "yororis");
    assert.equal(resolveTabFromLocation({ pathname: "/krizaka-motion/jarvis" }), "jarvis");
    assert.equal(resolveTabFromLocation({ pathname: "/krizaka-motion/liquid-glass/" }), "caustics");
    assert.equal(resolveTabFromLocation({ pathname: "/krizaka-motion/neural-lattice" }), "lattice");
    assert.equal(resolveTabFromLocation({ pathname: "/krizaka-motion/krizaka-ui" }), "kz-ui");
  });

  it("resolves tab aliases correctly", () => {
    assert.equal(resolveTabFromLocation({ pathname: "/caustics" }), "caustics");
    assert.equal(resolveTabFromLocation({ pathname: "/lattice" }), "lattice");
    assert.equal(resolveTabFromLocation({ pathname: "/kz-ui" }), "kz-ui");
    assert.equal(resolveTabFromLocation({ pathname: "/architecture" }), "architecture");
  });

  it("resolves tabs from query parameters (?tab=...)", () => {
    assert.equal(resolveTabFromLocation({ search: "?tab=jarvis" }), "jarvis");
    assert.equal(resolveTabFromLocation({ search: "?tab=yororis" }), "yororis");
  });

  it("resolves tabs from GitHub Pages 404 SPA fallback (?/path)", () => {
    assert.equal(resolveTabFromLocation({ search: "?/yororis" }), "yororis");
    assert.equal(resolveTabFromLocation({ search: "?/krizaka-motion/jarvis" }), "jarvis");
  });

  it("resolves tabs from hash (#/tab or #tab)", () => {
    assert.equal(resolveTabFromLocation({ hash: "#/yororis" }), "yororis");
    assert.equal(resolveTabFromLocation({ hash: "#jarvis" }), "jarvis");
    assert.equal(resolveTabFromLocation({ hash: "#/liquid-glass" }), "caustics");
  });

  it("generates correct href paths with and without subpath prefix", () => {
    assert.equal(getHrefForTab("orazaka", "/"), "/orazaka");
    assert.equal(getHrefForTab("yororis", "/"), "/yororis");
    assert.equal(getHrefForTab("yororis", "/krizaka-motion/"), "/krizaka-motion/yororis");
    assert.equal(getHrefForTab("caustics", "/krizaka-motion/orazaka"), "/krizaka-motion/liquid-glass");
  });
});

// GitHub Pages serves 404.html for a deep link it has no folder for; that page sends the visitor to `<base>/?/<route>`.
// The app then shows the clean address again (history.replaceState), so a shared link stays a REST path.
import { cleanSpaRedirect } from "../dist/core/index.js";

describe("GitHub Pages 404 fallback", () => {
  it("turns ?/<route> back into the REST path under the project base", () => {
    assert.equal(cleanSpaRedirect({ pathname: "/krizaka-motion/", search: "?/jarvis", hash: "" }), "/krizaka-motion/jarvis");
    assert.equal(cleanSpaRedirect({ pathname: "/krizaka-motion/", search: "?/specs&x=1", hash: "#top" }), "/krizaka-motion/specs?x=1#top");
  });

  it("leaves a normal address alone", () => {
    assert.equal(cleanSpaRedirect({ pathname: "/krizaka-motion/orazaka", search: "", hash: "" }), null);
    assert.equal(cleanSpaRedirect({ pathname: "/krizaka-motion/", search: "?tab=yororis", hash: "" }), null);
  });
});

// The lab has a home (the demos as cards) at the base; every demo keeps its REST path.
import { resolvePage, homeHref } from "../dist/core/index.js";

describe("Lab pages", () => {
  it("the base is the home, a demo path its demo", () => {
    assert.equal(resolvePage({ pathname: "/krizaka-motion/", search: "", hash: "" }), "home");
    assert.equal(resolvePage({ pathname: "/", search: "", hash: "" }), "home");
    assert.equal(resolvePage({ pathname: "/krizaka-motion/liquid-glass", search: "", hash: "" }), "caustics");
    assert.equal(resolvePage({ pathname: "/krizaka-motion/", search: "?tab=yororis", hash: "" }), "yororis");
    assert.equal(resolvePage({ pathname: "/krizaka-motion/unknown", search: "", hash: "" }), "home");
  });
  it("the home's address keeps the project base", () => {
    assert.equal(homeHref("/krizaka-motion/jarvis"), "/krizaka-motion/");
    assert.equal(homeHref("/jarvis"), "/");
  });
});

// krizaka-ui#434: the lab is organised by task (guides) and by app screen (scenarios); the old demo addresses lead to
// the guide that replaced them, so no link breaks.
import { GUIDE_PATHS, SCENARIO_PATHS, LEGACY_PATHS } from "../dist/core/index.js";

describe("guides, scenarios and the old addresses", () => {
  it("each guide and each scenario is its own address, also under /krizaka-motion/", () => {
    for (const id of ["list-arrival", "live-number", "page-transition", "button-feedback", "streaming-answer", "route-draw", "pin-drop", "tape-stick", "paper-sway", "develop", "crt-power-on", "crt-power-off", "neon-flicker"]) {
      assert.ok(GUIDE_PATHS.includes(id), id);
      assert.equal(resolvePage({ pathname: `/krizaka-motion/${id}`, search: "", hash: "" }), id);
    }
    for (const id of ["dashboard", "chat", "checkout", "delivery", "wall"]) {
      assert.ok(SCENARIO_PATHS.includes(id), id);
      assert.equal(resolvePage({ pathname: `/${id}/`, search: "", hash: "" }), id);
    }
    assert.equal(resolvePage({ pathname: "/krizaka-motion/experiments", search: "", hash: "" }), "experiments");
  });

  it("the old demo pages lead to their guide", () => {
    assert.deepEqual(LEGACY_PATHS, { "data-motion": "list-arrival", figures: "live-number", transitions: "page-transition", conversation: "streaming-answer", maps: "route-draw" });
    assert.equal(resolvePage({ pathname: "/krizaka-motion/data-motion", search: "", hash: "" }), "list-arrival");
    assert.equal(resolvePage({ pathname: "/maps/", search: "", hash: "" }), "route-draw");
    assert.equal(resolvePage({ pathname: "/krizaka-motion/", search: "?/conversation", hash: "" }), "streaming-answer");
  });

  it("an address names a page or the home, never something else", () => {
    assert.equal(resolvePage({ pathname: "/krizaka-motion/checkoutx", search: "", hash: "" }), "home");
  });
});
