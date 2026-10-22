import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canViewTransition,
  runViewTransition,
  crossFallback,
  transitionPage,
  sharedElementStyle,
} from "../dist/core/index.js";

const finishedOk = () => ({ finished: Promise.resolve() });

test("no view transition API: the update runs at once and the promise resolves", async () => {
  let ran = 0;
  await runViewTransition(() => ran++, { doc: {} });
  assert.equal(ran, 1);
  assert.equal(canViewTransition({}), false);
});

test("reduced motion: the update runs at once and startViewTransition is never called", async () => {
  let started = 0;
  const doc = { startViewTransition: () => (started++, finishedOk()) };
  let ran = 0;
  await runViewTransition(() => ran++, { doc, reduced: true });
  assert.equal(ran, 1);
  assert.equal(started, 0);
});

test("with the API: the update goes through startViewTransition and the promise waits for finished", async () => {
  let resolveFinished;
  const finished = new Promise((r) => (resolveFinished = r));
  let received;
  const doc = {
    startViewTransition: (update) => {
      received = update;
      return { finished };
    },
  };
  let ran = 0;
  let done = false;
  const p = runViewTransition(() => ran++, { doc }).then(() => (done = true));
  assert.equal(typeof received, "function");
  received();
  await Promise.resolve();
  assert.equal(ran, 1);
  assert.equal(done, false, "must wait for finished");
  resolveFinished();
  await p;
  assert.equal(done, true);
});

test("an aborted transition still resolves; the DOM was already updated by the callback", async () => {
  const doc = {
    startViewTransition: (update) => {
      update();
      return { finished: Promise.reject(new Error("skipped")) };
    },
  };
  let ran = 0;
  await runViewTransition(() => ran++, { doc });
  assert.equal(ran, 1);
});

test("cross-fallback: no API, motion allowed, an element that can animate: a fade from transparent", () => {
  const calls = [];
  const doc = { documentElement: { animate: (frames, opts) => (calls.push({ frames, opts }), "anim") } };
  let ran = 0;
  const out = crossFallback(() => ran++, { doc }, { duration: 300 });
  assert.equal(ran, 1);
  assert.equal(out, "anim");
  assert.deepEqual(calls[0].frames, [{ opacity: 0 }, { opacity: 1 }]);
  assert.equal(calls[0].opts.duration, 300);
});

test("cross-fallback: reduced motion applies the change and starts no animation", () => {
  const doc = { documentElement: { animate: () => assert.fail("no animation under reduced motion") } };
  let ran = 0;
  assert.equal(crossFallback(() => ran++, { doc, reduced: true }), null);
  assert.equal(ran, 1);
});

test("transitionPage: uses the native transition when it exists", async () => {
  let started = 0;
  const doc = { startViewTransition: (u) => (started++, u(), finishedOk()) };
  await transitionPage(() => {}, { doc });
  assert.equal(started, 1);
});

test("transitionPage: without the API it falls back and still applies the change", async () => {
  let ran = 0;
  await transitionPage(() => ran++, { doc: {} });
  assert.equal(ran, 1);
});

test("sharedElementStyle: returns the name for one identifier, refuses anything else", () => {
  assert.deepEqual(sharedElementStyle("booking-card"), { viewTransitionName: "booking-card" });
  assert.throws(() => sharedElementStyle("two words"), RangeError);
  assert.throws(() => sharedElementStyle("1leading-digit"), RangeError);
  assert.throws(() => sharedElementStyle(""), RangeError);
});
