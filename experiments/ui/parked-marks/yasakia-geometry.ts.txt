import { marks } from "@krizaka/tokens/native";

/**
 * The Yasakia mark's geometry — drawn by the web mark (YasakiaLogo) and the native one (YasakiaMark). The family's
 * grammar (packages/tokens/BRAND.md, "Marks"): 400×400 view box, dashed orbit and ring, a bold solid emblem in the
 * brand gradient, a lit core; below 48 px the view box crops to the emblem.
 *
 * The emblem is **one conversation** (2026-10-17): one speech bubble with a tail on each side — the conversation
 * belongs to both people, talk first — and the spark inside it, the family's lit node, breathes. The tails turn about
 * the centre (180°): the mark is symmetric by rotation, never by mirror, so it can never read as a face. The gradient
 * is the brand's mark gradient (`marks.yasakia` of @krizaka/tokens): emerald → turquoise, ≥ 3:1 on both themes.
 */
/** The turquoise end of the gradient: the halo and the spark's breath. */
const turquoise = marks.yasakia[marks.yasakia.length - 1]![1];

export const YASAKIA = {
  viewBox: "0 0 400 400",
  croppedViewBox: "80 80 240 240",
  center: 200,
  bubble: { cx: 200, cy: 200, r: 86 },
  /** The two tails, out of the bubble at 115°–160° and, turned 180° about the centre, at 295°–340°. */
  tails: [
    "M163.7 277.9 Q138 294 106 304 Q124 270 119.2 229.4 Z",
    "M236.3 122.1 Q262 106 294 96 Q276 130 280.8 170.6 Z",
  ],
  /** The spark: a diamond of light (half-diagonal 24, softened by a 6-unit round stroke). */
  spark: { d: "M200 176 L224 200 L200 224 L176 200 Z", soften: 6 },
  highlight: "#f0fdfa",
  gradient: { x1: 110, y1: 300, x2: 290, y2: 100, stops: marks.yasakia },
  /** The two people: one node on the orbit, that turns with it. */
  node: { r: 9, at: [200, 40] as const },
  glow: { color: turquoise, opacity: 0.16 },
  pulse: { color: turquoise, low: 0.3, high: 0.6 },
  motion: { spin: 30, breath: 3.2 },
  orbit: { r: 160, dash: "8 8", width: 1.5 },
  ring: { r: 134, width: 1 },
} as const;
