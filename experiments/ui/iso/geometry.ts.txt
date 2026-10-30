// Isometric projection, pure geometry (no React): the iso components compute their faces at render time — on the
// server, as static markup. World: x to the lower right, y to the lower left, z up.
// Screen: X = (x − y)·cos 30°, Y = (x + y)·sin 30° − z.

/** A point in plan (x, y) or on screen (X, Y). */
export type Vec2 = readonly [number, number];
/** A point in the world: x, y on the floor, z up. */
export type Vec3 = readonly [number, number, number];

const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;
const f = (n: number) => (Math.round(n * 10) / 10).toString();

/** The screen point of a world point. */
export function project([x, y, z]: Vec3): Vec2 {
  return [(x - y) * COS, (x + y) * SIN - z];
}

/** SVG `points` of screen points. */
export const pts = (points: readonly Vec2[]) => points.map(([x, y]) => `${f(x)},${f(y)}`).join(" ");

/** An SVG path through screen points. */
export const pathOf = (points: readonly Vec2[], close = false) =>
  points.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y)}`).join("") + (close ? "Z" : "");

/** A regular hexagon footprint (flat top in plan), centre (cx, cy), radius r. */
export function hexagon(cx: number, cy: number, r: number): Vec2[] {
  return Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
}

/** A rectangle with 45° cut corners (the Krizaka chamfer), centre (cx, cy), size w × d, cut c (0: a plain rectangle). */
export function cutRect(cx: number, cy: number, w: number, d: number, c: number): Vec2[] {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy - d / 2;
  const y1 = cy + d / 2;
  if (c <= 0) return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  return [[x0 + c, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c], [x1 - c, y1], [x0 + c, y1], [x0, y1 - c], [x0, y0 + c]];
}

export interface Face {
  /** SVG `points`. */
  readonly points: string;
  /** The top, or a side facing the left or the right light. */
  readonly kind: "top" | "left" | "right";
}

/** The visible faces of a vertical prism over a footprint, painted back to front. */
export function prism(footprint: readonly Vec2[], z0: number, h: number): Face[] {
  const n = footprint.length;
  // The winding (shoelace) gives the outward normals whatever the order of the points.
  const area = footprint.reduce((s, [x, y], i) => {
    const [x2, y2] = footprint[(i + 1) % n]!;
    return s + (x * y2 - x2 * y);
  }, 0);
  const sign = area > 0 ? 1 : -1;
  const sides: { depth: number; face: Face }[] = [];
  for (let i = 0; i < n; i++) {
    const [ax, ay] = footprint[i]!;
    const [bx, by] = footprint[(i + 1) % n]!;
    const nx = sign * (by - ay);
    const ny = sign * -(bx - ax);
    if (nx + ny <= 1e-6) continue; // faces away from the viewer
    const quad: Vec2[] = [project([ax, ay, z0]), project([bx, by, z0]), project([bx, by, z0 + h]), project([ax, ay, z0 + h])];
    sides.push({ depth: ax + ay + bx + by, face: { points: pts(quad), kind: nx >= ny ? "right" : "left" } });
  }
  sides.sort((a, b) => a.depth - b.depth);
  const top: Face = { points: pts(footprint.map(([x, y]) => project([x, y, z0 + h]))), kind: "top" };
  return [...sides.map((s) => s.face), top];
}

/** The screen ellipse of a horizontal circle of radius r at height z: centre and radii. */
export function isoCircle(cx: number, cy: number, z: number, r: number) {
  const [x, y] = project([cx, cy, z]);
  return { cx: x, cy: y, rx: r * COS * Math.SQRT2, ry: r * SIN * Math.SQRT2 };
}

/** A point on a circle of the floor plan: angle in degrees, 0 toward the lower right (+x), clockwise on screen. */
export function onCircle(r: number, deg: number, [cx, cy]: Vec2 = [0, 0]): Vec2 {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/** Depth for the painter: larger is nearer the viewer. */
export const depthOf = ([x, y]: Vec2) => x + y;

/** The view box that frames a floor of half-size `extent` and `top` units of height above it. */
export function viewBoxOf(extent: number, top: number, margin = 24): string {
  const w = 2 * extent * COS + margin * 2;
  return [-w / 2, -extent * SIN * 1.2 - top, w, extent * SIN * 2.4 + top].map(f).join(" ");
}
