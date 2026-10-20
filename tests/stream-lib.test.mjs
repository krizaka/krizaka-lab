import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shownAt, tokens } from "../src/lab/stream-lib.ts";

describe("streamed text", () => {
  it("cuts a text into words that keep their spaces, or into characters", () => {
    assert.deepEqual(tokens("Order  shipped today", "word"), ["Order  ", "shipped ", "today"]);
    assert.equal(tokens("Order shipped", "word").join(""), "Order shipped");
    assert.deepEqual(tokens("héé", "char"), ["h", "é", "é"]);
    assert.deepEqual(tokens("", "word"), []);
  });

  it("shows nothing but the typing indicator until the delay has passed, then the tokens at their rate, then the whole text", () => {
    const all = tokens("one two three four", "word");
    assert.deepEqual(shownAt(all, 100, 10, 400), { text: "", phase: "typing" });
    assert.deepEqual(shownAt(all, 400, 10, 400), { text: "one ", phase: "streaming" });
    assert.deepEqual(shownAt(all, 600, 10, 400), { text: "one two three ", phase: "streaming" });
    assert.deepEqual(shownAt(all, 5000, 10, 400), { text: "one two three four", phase: "done" });
  });

  it("never shows more than the text, and a rate under one a second counts as one", () => {
    const all = tokens("a b", "word");
    assert.equal(shownAt(all, 1e9, 1000, 0).text, "a b");
    assert.equal(shownAt(all, 1500, 0, 0).text, "a b");
  });
});
