import { marks } from "@krizaka/tokens/native";

/**
 * The Orochia mark's geometry — the one description of the serpent and its flame, drawn by the web mark (SVG in the
 * DOM, OrochiaLogo) and the native one (react-native-svg, @krizaka/ui/native). Coordinates are in the 360×360 artwork,
 * placed at (20, 20) in a 400×400 view box; below 48 px the view box crops to the serpent. The body's gradient is the
 * brand's mark gradient (`marks.orochia` of @krizaka/tokens).
 */
export const OROCHIA = {
  viewBox: "0 0 400 400",
  croppedViewBox: "86 82 228 228",
  offset: 20,
  body: { x1: 70, y1: 290, x2: 290, y2: 70, stops: marks.orochia },
  flameGradient: { stops: [["0%", "#a855f7"], ["100%", "#f9a8d4"]] },
  glow: { color: "#d946ef", opacity: 0.18 },
  orbit: { r: 160, dash: "8 8", width: 1.5 },
  ring: { r: 134, width: 1 },
  arc: "M259.8,142.8 A88,88 0 1 1 142.8,100.2",
  neck: "M142.8,100.2 A88,88 0 0 1 187.7,92.3",
  tail: "M187.7,92.3 A88,88 0 0 1 221.3,102.3",
  scales: { color: "#fdf4ff", opacity: 0.45, width: 3, dash: "2 14" },
  head: { cx: 253.9, cy: 130.1, rx: 13, ry: 20, rotate: -25 },
  tongue: { d: "M245.4,112.0 L242.0,104.8 L235.0,101.5 M242.0,104.8 L244.0,97.3", color: "#f472b6" },
  eye: { cx: 256.3, cy: 123.5, r: 4.5, color: "#fdf4ff" },
  flame: {
    translate: [127, 120] as const,
    scale: 4.4,
    d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  },
} as const;
