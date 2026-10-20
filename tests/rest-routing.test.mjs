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
