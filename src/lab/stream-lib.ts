/* The pure part of the streaming demo: how a text is cut into the tokens a model would send, and how many of them are
   shown after a time. Tested by tests/stream-lib.test.mjs. */

/** The text as tokens: words (with their trailing space) or single characters. */
export function tokens(text: string, unit: "word" | "char"): string[] {
  if (unit === "char") return [...text];
  return text.match(/\S+\s*/g) ?? [];
}

/** The text shown after `elapsedMs` at `perSecond` tokens a second, once `delayMs` of typing indicator has passed. */
export function shownAt(
  all: readonly string[],
  elapsedMs: number,
  perSecond: number,
  delayMs: number,
): { text: string; phase: "typing" | "streaming" | "done" } {
  if (elapsedMs < delayMs) return { text: "", phase: "typing" };
  const n = Math.min(all.length, Math.floor(((elapsedMs - delayMs) / 1000) * Math.max(1, perSecond)) + 1);
  return { text: all.slice(0, n).join(""), phase: n >= all.length ? "done" : "streaming" };
}
