import { core } from "./support/core.mjs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
const { TAB_ROUTES, resolveTabFromLocation, getHrefForTab, } = core;

describe("RESTful Routing & URL Resolution", () => {
  it("resolves default tab (orazaka) when path is root or empty", () => {
    assert.equal(resolveTabFromLocation({ pathname: "/" }), "orazaka");
    assert.equal(resolveTabFromLocation({ pathname: "" }), "orazaka");
  });

  it("resolves tabs from clean pathname", () => {
    assert.equal(resolveTabFromLocation({ pathname: "/orazaka" }), "orazaka");
    assert.equal(resolveTabFromLocation({ pathname: "/jarvis" }), "jarvis");
    assert.equal(resolveTabFromLocation({ pathname: "/liquid-glass" }), "caustics");
    assert.equal(resolveTabFromLocation({ pathname: "/neural-lattice" }), "lattice");
    assert.equal(resolveTabFromLocation({ pathname: "/krizaka-ui" }), "kz-ui");
    assert.equal(resolveTabFromLocation({ pathname: "/specs" }), "architecture");
  });

  it("resolves tabs under GitHub Pages repository subpath /krizaka-lab/", () => {
    assert.equal(resolveTabFromLocation({ pathname: "/krizaka-lab/jarvis" }), "jarvis");
    assert.equal(resolveTabFromLocation({ pathname: "/krizaka-lab/liquid-glass/" }), "caustics");
    assert.equal(resolveTabFromLocation({ pathname: "/krizaka-lab/neural-lattice" }), "lattice");
    assert.equal(resolveTabFromLocation({ pathname: "/krizaka-lab/krizaka-ui" }), "kz-ui");
  });

  it("resolves tab aliases correctly", () => {
    assert.equal(resolveTabFromLocation({ pathname: "/caustics" }), "caustics");
    assert.equal(resolveTabFromLocation({ pathname: "/lattice" }), "lattice");
    assert.equal(resolveTabFromLocation({ pathname: "/kz-ui" }), "kz-ui");
    assert.equal(resolveTabFromLocation({ pathname: "/architecture" }), "architecture");
  });

  it("resolves tabs from query parameters (?tab=...)", () => {
    assert.equal(resolveTabFromLocation({ search: "?tab=jarvis" }), "jarvis");
  });

  it("resolves tabs from GitHub Pages 404 SPA fallback (?/path)", () => {
    assert.equal(resolveTabFromLocation({ search: "?/jarvis" }), "jarvis");
    assert.equal(resolveTabFromLocation({ search: "?/krizaka-lab/jarvis" }), "jarvis");
  });

  it("resolves tabs from hash (#/tab or #tab)", () => {
    assert.equal(resolveTabFromLocation({ hash: "#/jarvis" }), "jarvis");
    assert.equal(resolveTabFromLocation({ hash: "#jarvis" }), "jarvis");
    assert.equal(resolveTabFromLocation({ hash: "#/liquid-glass" }), "caustics");
  });

  it("generates correct href paths with and without subpath prefix", () => {
    assert.equal(getHrefForTab("orazaka", "/"), "/orazaka");
    assert.equal(getHrefForTab("jarvis", "/"), "/jarvis");
    assert.equal(getHrefForTab("jarvis", "/krizaka-lab/"), "/krizaka-lab/jarvis");
    assert.equal(getHrefForTab("caustics", "/krizaka-lab/orazaka"), "/krizaka-lab/liquid-glass");
  });
});

// GitHub Pages serves 404.html for a deep link it has no folder for; that page sends the visitor to `<base>/?/<route>`.
// The app then shows the clean address again (history.replaceState), so a shared link stays a REST path.
const { cleanSpaRedirect } = core;

describe("GitHub Pages 404 fallback", () => {
  it("turns ?/<route> back into the REST path under the project base", () => {
    assert.equal(cleanSpaRedirect({ pathname: "/krizaka-lab/", search: "?/jarvis", hash: "" }), "/krizaka-lab/jarvis");
    assert.equal(cleanSpaRedirect({ pathname: "/krizaka-lab/", search: "?/specs&x=1", hash: "#top" }), "/krizaka-lab/specs?x=1#top");
  });

  it("leaves a normal address alone", () => {
    assert.equal(cleanSpaRedirect({ pathname: "/krizaka-lab/orazaka", search: "", hash: "" }), null);
    assert.equal(cleanSpaRedirect({ pathname: "/krizaka-lab/", search: "?tab=jarvis", hash: "" }), null);
  });
});

// The lab has a home (the demos as cards) at the base; every demo keeps its REST path.
const { resolvePage, homeHref } = core;

describe("Lab pages", () => {
  it("the base is the home, a demo path its demo", () => {
    assert.equal(resolvePage({ pathname: "/krizaka-lab/", search: "", hash: "" }), "home");
    assert.equal(resolvePage({ pathname: "/", search: "", hash: "" }), "home");
    assert.equal(resolvePage({ pathname: "/krizaka-lab/liquid-glass", search: "", hash: "" }), "caustics");
    assert.equal(resolvePage({ pathname: "/krizaka-lab/", search: "?tab=jarvis", hash: "" }), "jarvis");
    assert.equal(resolvePage({ pathname: "/krizaka-lab/unknown", search: "", hash: "" }), "home");
  });
  it("the home's address keeps the project base", () => {
    assert.equal(homeHref("/krizaka-lab/jarvis"), "/krizaka-lab/");
    assert.equal(homeHref("/jarvis"), "/");
  });
});

// krizaka-ui#434: the lab is organised by task (guides) and by app screen (scenarios); the old demo addresses lead to
// the guide that replaced them, so no link breaks.
const { GUIDE_PATHS, SCENARIO_PATHS, LEGACY_PATHS } = core;

describe("guides, scenarios and the old addresses", () => {
  it("each guide and each scenario is its own address, also under /krizaka-lab/", () => {
    for (const id of ["list-arrival", "live-number", "page-transition", "button-feedback", "streaming-answer", "route-draw", "pin-drop", "tape-stick", "paper-sway", "develop", "crt-power-on", "crt-power-off", "neon-flicker"]) {
      assert.ok(GUIDE_PATHS.includes(id), id);
      assert.equal(resolvePage({ pathname: `/krizaka-lab/${id}`, search: "", hash: "" }), id);
    }
    for (const id of ["dashboard", "chat", "checkout", "delivery", "wall"]) {
      assert.ok(SCENARIO_PATHS.includes(id), id);
      assert.equal(resolvePage({ pathname: `/${id}/`, search: "", hash: "" }), id);
    }
    assert.equal(resolvePage({ pathname: "/krizaka-lab/experiments", search: "", hash: "" }), "experiments");
  });

  it("the old demo pages lead to their guide", () => {
    assert.deepEqual(LEGACY_PATHS, { "data-motion": "list-arrival", figures: "live-number", transitions: "page-transition", conversation: "streaming-answer", maps: "route-draw" });
    assert.equal(resolvePage({ pathname: "/krizaka-lab/data-motion", search: "", hash: "" }), "list-arrival");
    assert.equal(resolvePage({ pathname: "/maps/", search: "", hash: "" }), "route-draw");
    assert.equal(resolvePage({ pathname: "/krizaka-lab/", search: "?/conversation", hash: "" }), "streaming-answer");
  });

  it("an address names a page or the home, never something else", () => {
    assert.equal(resolvePage({ pathname: "/krizaka-lab/checkoutx", search: "", hash: "" }), "home");
  });
});
