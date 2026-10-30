import { marks } from "@krizaka/tokens/native";

/**
 * The Kachizaka mark's geometry — drawn by the web mark (KachizakaLogo) and the native one (KachizakaMark). The family's
 * grammar (packages/tokens/BRAND.md, "Marks"): 400×400 view box, dashed orbit and ring, a bold solid emblem, a lit core;
 * below 48 px the view box crops to the emblem.
 *
 * The emblem is **the podium** (2026-10-17): three steps, their outer corners wearing the Krizaka cut, the winner in
 * gold and the others in cobalt, under the family's lit node (a diamond) that breathes — a friendly leaderboard where
 * only points change hands. The two colours of the brand stay **apart** (cobalt plays, gold wins): blended, cobalt →
 * gold turns grey. They are the two stops of the brand's mark gradient (`marks.kachizaka` of @krizaka/tokens), each
 * ≥ 3:1 on the page surfaces of both themes.
 */
const cobalt = marks.kachizaka[0]![1];
/** The gold end: the winner, the node, the halo and its breath. */
const gold = marks.kachizaka[marks.kachizaka.length - 1]![1];

export const KACHIZAKA = {
  viewBox: "0 0 400 400",
  croppedViewBox: "80 80 240 240",
  center: 200,
  cobalt,
  gold,
  /** The steps: second (left, cut top-left), first (centre, both top corners cut, in gold), third (right, cut top-right). */
  steps: {
    second: "M102 240 L122 220 H162 V296 H102 Z",
    first: "M170 192 L188 174 H212 L230 192 V296 H170 Z",
    third: "M238 248 H278 L298 268 V296 H238 Z",
  },
  /** The lit node over the winner: a gold diamond (half-diagonal 22, softened by a 6-unit round stroke), its light inside. */
  node: { d: "M200 102 L222 124 L200 146 L178 124 Z", light: "M200 116.1 L207.9 124 L200 131.9 L192.1 124 Z", soften: 6 },
  highlight: "#fffbea",
  gradient: { x1: 110, y1: 300, x2: 290, y2: 100, stops: marks.kachizaka },
  /** The ball: one node on the orbit, that turns with it. */
  ball: { r: 9, at: [200, 40] as const },
  glow: { color: gold, opacity: 0.18 },
  pulse: { color: gold, low: 0.35, high: 0.75 },
  motion: { spin: 28, breath: 3.2 },
  orbit: { r: 160, dash: "8 8", width: 1.5 },
  ring: { r: 134, width: 1 },
} as const;
