import { marks } from "@krizaka/tokens/native";

/**
 * The Yororis mark's geometry — drawn by the web mark (YororisLogo) and the native one (YororisMark). The family's
 * grammar (packages/tokens/BRAND.md, "Marks"): 400×400 view box, dashed orbit and ring, a bold emblem at the family
 * stroke (22), a lit core; below 48 px the view box crops to the emblem.
 *
 * The emblem is **held** (2026-10-17): two open hands, drawn as two arcs of one circle, cup a warm core without
 * closing on it — held, given room, free to go. The arcs are sage, the core sand: the two stops of the brand's mark
 * gradient (`marks.yororis` of @krizaka/tokens), each ≥ 3:1 on the page surfaces of both themes. The slowest breath of
 * the family (4.2 s).
 */
const sand = marks.yororis[0]![1];
/** The sage end: the hands, the halo. */
const sage = marks.yororis[marks.yororis.length - 1]![1];

export const YORORIS = {
  viewBox: "0 0 400 400",
  croppedViewBox: "80 80 240 240",
  center: 200,
  stroke: 22,
  sand,
  sage,
  /** The two hands: arcs of a circle r 92 centred (200, 162), from 196° to 104° and from 76° to −16°; open at the bottom and the top. */
  hands: "M111.6 136.6 A92 92 0 0 0 177.7 251.3 M222.3 251.3 A92 92 0 0 0 288.4 136.6",
  /** The warm core, held inside the hands. */
  core: { cx: 200, cy: 176, r: 30, inner: 10.2 },
  highlight: "#fbf6ea",
  gradient: { x1: 110, y1: 300, x2: 290, y2: 100, stops: marks.yororis },
  /** The moment: one node on the orbit — it comes round, then it goes. */
  node: { r: 9, at: [200, 40] as const },
  glow: { color: sage, opacity: 0.18 },
  pulse: { color: sand, low: 0.3, high: 0.6 },
  motion: { spin: 36, breath: 4.2 },
  orbit: { r: 160, dash: "8 8", width: 1.5 },
  ring: { r: 134, width: 1 },
} as const;
