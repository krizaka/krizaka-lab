// Server-safe: no state, no effect, no context — static SVG computed at render time, animated by motion.css (`kz-iso-*`,
// shipped by the preset), so a hero costs no client JavaScript. `useId` only (allowed in Server Components): every scene
// owns its gradient and mask ids. Classes are joined with `cx`: no tailwind-variants in this entry.
import * as React from "react";

import { cx as cn } from "../cx";
import { cutRect, depthOf, type Face, hexagon, isoCircle, onCircle, pathOf, prism, project, pts, type Vec2, viewBoxOf } from "./geometry";

/** How a solid is lit: the page's surfaces (`base`), the brand accent, accent → accent-2, or frosted glass. */
export type IsoMaterial = "base" | "accent" | "accent2" | "glass";
/** The footprint of a prism: a hexagon (the marks), a rectangle with 45° cut corners (the icons) or a plain one. */
export type IsoShape = "hex" | "cut" | "rect";
/** A pictogram drawn on the top of a tile. */
export type IsoGlyph = "dots" | "lines" | "play" | "coin" | "lock" | "arrow" | "flag" | "heart" | "node" | "none";

type Style = React.CSSProperties & Record<`--${string}`, string | number>;

const uid = (raw: string) => raw.replace(/[^a-zA-Z0-9_-]/g, "");
const footprint = (shape: IsoShape, [x, y]: Vec2, size: number | Vec2, cut?: number): Vec2[] => {
  const [w, d] = typeof size === "number" ? [size, size] : size;
  if (shape === "hex") return hexagon(x, y, w / 2);
  return cutRect(x, y, w, d, shape === "rect" ? 0 : (cut ?? Math.min(w, d) / 6));
};

export interface IsoSceneProps extends Omit<React.ComponentProps<"svg">, "children"> {
  /** The accessible name of the scene ("A server stack under a dome") — passed translated. Without it the scene is decorative. */
  label?: string;
  /** A longer text version of what the scene shows, read by assistive technology. */
  description?: string;
  /**
   * Half the size of the floor, in world units: what the camera frames.
   * @default 240
   */
  extent?: number;
  /**
   * Height above the floor the camera keeps in view, in world units.
   * @default 260
   */
  top?: number;
  /**
   * The perspective grid on the floor, fading into the page.
   * @default true
   */
  grid?: boolean;
  /**
   * The spacing of the grid's lines.
   * @default 40
   */
  step?: number;
  /**
   * Motion (entrance, breathing, flow, float). `false` draws the still frame — the one prefers-reduced-motion shows.
   * @default true
   */
  animated?: boolean;
  /** The objects, painted in order: put the farthest first (or use `IsoHub`, which sorts them). */
  children?: React.ReactNode;
}

/**
 * The stage: an isometric camera over a perspective grid that fades into the page. Its animations pause off screen and
 * wait for the page to settle (MotionObserver); everything stops under prefers-reduced-motion.
 */
export function IsoScene({ label, description, extent = 240, top = 260, grid = true, step = 40, animated = true, viewBox, className, children, ...props }: IsoSceneProps) {
  const id = uid(React.useId());
  const lines: string[] = [];
  for (let v = -extent; v <= extent; v += step) {
    lines.push(pathOf([project([v, -extent, 0]), project([v, extent, 0])]), pathOf([project([-extent, v, 0]), project([extent, v, 0])]));
  }
  const fade = isoCircle(0, 0, 0, extent * 0.9);
  const named = label ? { role: "group" as const, "aria-label": label } : { "aria-hidden": true as const };
  return (
    <svg
      viewBox={viewBox ?? viewBoxOf(extent, top)}
      focusable="false"
      data-motion-scope=""
      data-animated={animated}
      className={cn("kz-iso", className)}
      {...named}
      {...props}
    >
      {description && <desc>{description}</desc>}
      {grid && (
        <>
          <defs>
            <radialGradient id={`${id}-fade`}>
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id={`${id}-floor`}>
              <ellipse cx={fade.cx} cy={fade.cy} rx={fade.rx} ry={fade.ry} fill={`url(#${id}-fade)`} />
            </mask>
          </defs>
          <path d={lines.join("")} className="kz-iso-floor" mask={`url(#${id}-floor)`} />
        </>
      )}
      {children}
    </svg>
  );
}

/** A loop only when the scene moves: `animated={false}` on the item keeps it still. */
const loop = (animated: boolean | undefined) => (animated === false ? undefined : "kz-loop");

interface ItemProps {
  /** The name shown when the pointer (or the focus) is on the object — passed translated. It also makes it focusable. */
  label?: string;
  /**
   * Its rank in the entrance: objects rise into place one after the other.
   * @default 0
   */
  index?: number;
  /**
   * Motion: entrance and loops. `false` keeps this object still.
   * @default true
   */
  animated?: boolean;
  /** Extra classes on the object's group. */
  className?: string;
}

/** An object of the scene: rises at the entrance, brightens under the pointer or the focus and shows its label. */
function Item({ label, index = 0, animated, anchor, align = "center", className, children }: ItemProps & { anchor: Vec2; align?: "center" | "start"; children: React.ReactNode }) {
  const named = label ? { role: "img" as const, "aria-label": label, tabIndex: 0 } : {};
  return (
    <g className={cn("kz-iso-item", className)} style={{ "--kz-iso-i": index } as Style} {...named}>
      <g className={cn("kz-iso-lift", animated !== false && "kz-iso-rise")}>{children}</g>
      {label && <Tip at={anchor} text={label} align={align} />}
    </g>
  );
}

/**
 * A label in a pill (decorative: the object carries the name). `center`: above the point (a floating tile). `start`:
 * beside it, to the right, with a leader — for a stage of a stack, whose upper stages would cover a label above it.
 */
function Tip({ at: [x, y], text, align }: { at: Vec2; text: string; align: "center" | "start" }) {
  const w = Math.max(40, text.length * 6.6 + 20);
  if (align === "start") {
    return (
      <g className="kz-iso-tip" aria-hidden>
        <path d={`M${Math.round(x + 3)} ${Math.round(y)}h18`} className="kz-iso-leader" />
        <rect x={x + 21} y={y - 11} width={w} height={22} rx={7} strokeWidth={1} />
        <text x={x + 21 + w / 2} y={y + 4} textAnchor="middle">
          {text}
        </text>
      </g>
    );
  }
  return (
    <g className="kz-iso-tip" aria-hidden>
      <rect x={x - w / 2} y={y - 34} width={w} height={22} rx={7} strokeWidth={1} />
      <text x={x} y={y - 19} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

function Solid({ faces, material }: { faces: Face[]; material: IsoMaterial }) {
  return (
    <g className={"kz-iso-" + material}>
      {faces.map((face, i) => (
        <polygon key={i} points={face.points} className={"kz-iso-face kz-iso-" + face.kind} />
      ))}
    </g>
  );
}

export interface IsoPrismProps extends ItemProps {
  /**
   * The centre of its footprint on the floor plan (x, y).
   * @default [0, 0]
   */
  at?: Vec2;
  /**
   * The height of its base above the floor.
   * @default 0
   */
  z?: number;
  /** Its height. */
  height: number;
  /**
   * hex · cut (45° cut corners) · rect.
   * @default "cut"
   */
  shape?: IsoShape;
  /**
   * Its width (a number: square or hexagon's diameter) or width × depth.
   * @default 120
   */
  size?: number | Vec2;
  /** The size of the 45° cut (`shape="cut"`); a sixth of the smaller side by default. */
  cut?: number;
  /**
   * How it is lit.
   * @default "base"
   */
  material?: IsoMaterial;
  /** A dotted light strip around its front (the LEDs of a server), blinking slowly. */
  strip?: boolean;
}

/** A vertical prism — hexagonal, cut-corner or rectangular — that stacks with others on `z`. */
export function IsoPrism({ at = [0, 0], z = 0, height, shape = "cut", size = 120, cut, material = "base", strip, animated, ...item }: IsoPrismProps) {
  const foot = footprint(shape, at, size, cut);
  const [w, d] = typeof size === "number" ? [size, size] : size;
  return (
    <Item {...item} animated={animated} anchor={project(shape === "hex" ? [at[0] + w / 4, at[1] - w * 0.433, z + height / 2] : [at[0] + w / 2, at[1] - d / 2, z + height / 2])} align="start">
      <Solid faces={prism(foot, z, height)} material={material} />
      {strip && <Strip at={at} w={w} d={d} c={shape === "rect" ? 0 : (cut ?? Math.min(w, d) / 6)} z={z + height / 2 + 1} animated={animated} hex={shape === "hex"} />}
    </Item>
  );
}

function Strip({ at: [cx, cy], w, d, c, z, hex, animated }: { at: Vec2; w: number; d: number; c: number; z: number; hex: boolean; animated?: boolean }) {
  const front: Vec2[] = hex
    ? [0, 1, 2].map((k) => onCircle(w / 2, k * 60 - 60, [cx, cy]))
    : [[cx + w / 2, cy - d / 2 + c], [cx + w / 2, cy + d / 2 - c], [cx + w / 2 - c, cy + d / 2], [cx - w / 2 + c, cy + d / 2]];
  return <polyline points={pts(front.map(([x, y]) => project([x, y, z])))} className={cn("kz-iso-strip", loop(animated))} />;
}

/** One stage of an `IsoStack`. */
export interface IsoLayer {
  /** The stage's name, shown when it is lifted — passed translated. */
  label?: string;
  /**
   * Its height.
   * @default 22
   */
  height?: number;
  /**
   * How it is lit.
   * @default "base"
   */
  material?: IsoMaterial;
}

export interface IsoStackProps {
  /** The stages, bottom first; they stack one after the other at the entrance. */
  layers: readonly IsoLayer[];
  /**
   * The centre of the stack on the floor plan.
   * @default [0, 0]
   */
  at?: Vec2;
  /**
   * The footprint of the stages.
   * @default "cut"
   */
  shape?: IsoShape;
  /**
   * The width of the stages.
   * @default 120
   */
  size?: number;
  /**
   * The space between two stages.
   * @default 4
   */
  gap?: number;
  /**
   * A hexagonal plinth under the stack.
   * @default true
   */
  plinth?: boolean;
  /**
   * A lit hexagonal core on top, its node glowing; a string names it.
   * @default true
   */
  core?: boolean | string;
  /**
   * The rank of the first stage in the scene's entrance.
   * @default 0
   */
  index?: number;
  /**
   * Motion: entrance and loops. `false` keeps the stack still.
   * @default true
   */
  animated?: boolean;
}

/** A stack of stages on a plinth with a lit core on top — a server, a model, a pile of layers — driven by data. */
export function IsoStack({ layers, at = [0, 0], shape = "cut", size = 120, gap = 4, plinth = true, core = true, index = 0, animated }: IsoStackProps) {
  const base = plinth ? 12 + gap : 0;
  const heights = layers.map((layer) => layer.height ?? 22);
  const stages = layers.map((layer, k) => ({ ...layer, k, height: heights[k]!, z: base + heights.slice(0, k).reduce((sum, h) => sum + h + gap, 0) }));
  const top = base + heights.reduce((sum, h) => sum + h + gap, 0);
  return (
    <g>
      {plinth && <IsoPrism at={at} height={12} shape="hex" size={size * 1.86} index={index} animated={animated} />}
      {stages.map((s) => (
        <IsoPrism
          key={s.k}
          at={at}
          z={s.z}
          height={s.height}
          shape={shape}
          size={size}
          material={s.material ?? "base"}
          strip={(s.material ?? "base") === "base"}
          label={s.label}
          index={index + 1 + s.k}
          animated={animated}
        />
      ))}
      {core && (
        <>
          <IsoPrism at={at} z={top} height={16} shape="hex" size={size / 2} material="accent" index={index + 1 + stages.length} animated={animated} label={typeof core === "string" ? core : undefined} />
          <IsoNode at={at} z={top + 22} index={index + 2 + stages.length} animated={animated} />
        </>
      )}
    </g>
  );
}

export interface IsoNodeProps {
  /**
   * Where, on the floor plan.
   * @default [0, 0]
   */
  at?: Vec2;
  /**
   * Its height.
   * @default 0
   */
  z?: number;
  /**
   * The radius of the node.
   * @default 7
   */
  r?: number;
  /**
   * The radius of its glow (0: none).
   * @default 70
   */
  glow?: number;
  /**
   * Its rank in the entrance.
   * @default 0
   */
  index?: number;
  /**
   * Motion: the glow breathes. `false` keeps it still.
   * @default true
   */
  animated?: boolean;
}

/** The Krizaka node: a point of light in the accent, breathing in its glow. */
export function IsoNode({ at = [0, 0], z = 0, r = 7, glow = 70, index = 0, animated }: IsoNodeProps) {
  const id = uid(React.useId());
  const [x, y] = project([at[0], at[1], z]);
  return (
    <g className={cn(animated !== false && "kz-iso-rise")} style={{ "--kz-iso-i": index } as Style}>
      {glow > 0 && (
        <>
          <defs>
            <radialGradient id={`${id}-glow`}>
              <stop offset="0%" className="kz-iso-glow-stop" stopOpacity="0.55" />
              <stop offset="100%" className="kz-iso-glow-stop" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={x} cy={y} r={glow} fill={`url(#${id}-glow)`} className={cn("kz-iso-breathe", loop(animated))} />
        </>
      )}
      <circle cx={x} cy={y} r={r} className={cn("kz-iso-node kz-iso-breathe", loop(animated))} />
    </g>
  );
}

export interface IsoDomeProps {
  /**
   * Its centre on the floor plan.
   * @default [0, 0]
   */
  at?: Vec2;
  /**
   * The radius of its rim on the floor.
   * @default 158
   */
  radius?: number;
  /**
   * Its height.
   * @default 250
   */
  height?: number;
  /** Its name ("Your infrastructure") — passed translated; shown at the top of the dome, always. */
  label?: string;
  /**
   * Motion: a sheen travels along the dome. `false` keeps it still.
   * @default true
   */
  animated?: boolean;
}

/**
 * A dome of light over what it protects: a rim on the floor, a glass arc, a sheen that travels along it. Draw its rim
 * before the objects it covers and the dome after them (`part="rim"`, `part="arc"`), or let `IsoHub` do it.
 */
export function IsoDome({ at = [0, 0], radius = 158, height = 250, label, animated, part = "both" }: IsoDomeProps & {
  /**
   * `rim` (the floor ellipse, drawn first), `arc` (the glass, drawn last) or `both`.
   * @default "both"
   */
  part?: "rim" | "arc" | "both";
}) {
  const e = isoCircle(at[0], at[1], 0, radius);
  const arc = `M${e.cx - e.rx} ${e.cy} A ${e.rx} ${height} 0 0 1 ${e.cx + e.rx} ${e.cy}`;
  return (
    <>
      {part !== "arc" && <ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} className="kz-iso-rim" />}
      {part !== "rim" && (
        <g>
          <path d={arc} className="kz-iso-dome" />
          <path d={arc} className={cn("kz-iso-dome-sheen", loop(animated))} pathLength={440} />
          {label && <IsoLabel at={at} z={height + 10} text={label} />}
        </g>
      )}
    </>
  );
}

export interface IsoTileProps extends ItemProps {
  /** Its centre on the floor plan. */
  at: Vec2;
  /**
   * The height it floats at.
   * @default 90
   */
  z?: number;
  /**
   * Width × depth.
   * @default [76, 52]
   */
  size?: Vec2;
  /**
   * The pictogram on its top.
   * @default "none"
   */
  glyph?: IsoGlyph;
  /**
   * How it is lit.
   * @default "accent"
   */
  material?: IsoMaterial;
  /**
   * It floats gently.
   * @default true
   */
  float?: boolean;
}

/** A satellite: a thin cut-corner tile that floats beside the hero object, a pictogram on its top. */
export function IsoTile({ at, z = 90, size = [76, 52], glyph = "none", material = "accent", float = true, animated, ...item }: IsoTileProps) {
  const [w, d] = size;
  const top = z + 9;
  const shadow = isoCircle(at[0], at[1], 0, Math.min(w, d) * 0.55);
  const foot = project([at[0], at[1], 0]);
  return (
    <Item {...item} animated={animated} anchor={project([at[0], at[1], top])}>
      {z > 0 && (
        <>
          <ellipse cx={shadow.cx} cy={shadow.cy} rx={shadow.rx} ry={shadow.ry} className="kz-iso-shadow" />
          <path d={pathOf([foot, project([at[0], at[1], z])])} className="kz-iso-tether" />
        </>
      )}
      <g className={cn(float && "kz-iso-float", float && loop(animated))}>
        <Solid faces={prism(cutRect(at[0], at[1], w, d, Math.min(w, d) / 4), z, 9)} material={material} />
        <Glyph glyph={glyph} at={at} z={top} s={Math.min(w, d) * 0.3} />
      </g>
    </Item>
  );
}

function Glyph({ glyph, at: [cx, cy], z, s }: { glyph: IsoGlyph; at: Vec2; z: number; s: number }) {
  const p = (u: number, v: number) => project([cx + u * s, cy + v * s, z]);
  const line = (points: [number, number][], close = false) => <path d={pathOf(points.map(([u, v]) => p(u, v)), close)} className="kz-iso-glyph" />;
  switch (glyph) {
    case "dots":
      return <>{[-0.8, 0, 0.8].map((u) => <circle key={u} cx={p(u, 0)[0]} cy={p(u, 0)[1]} r={s * 0.16} className="kz-iso-glyph-fill" />)}</>;
    case "lines":
      return <>{[-0.6, 0, 0.6].map((v) => <React.Fragment key={v}>{line([[-0.9, v], [0.7, v]])}</React.Fragment>)}</>;
    case "play":
      return line([[-0.5, -0.7], [0.8, 0], [-0.5, 0.7]], true);
    case "coin":
      return (
        <>
          <path d={pathOf(hexagon(0, 0, 0.9).map(([u, v]) => p(u, v)), true)} className="kz-iso-glyph" />
          <circle cx={p(0, 0)[0]} cy={p(0, 0)[1]} r={s * 0.18} className="kz-iso-glyph-fill" />
        </>
      );
    case "lock":
      return (
        <>
          {line([[-0.6, -0.1], [0.6, -0.1], [0.6, 0.8], [-0.6, 0.8]], true)}
          {line([[-0.35, -0.1], [-0.35, -0.5], [-0.15, -0.75], [0.15, -0.75], [0.35, -0.5], [0.35, -0.1]])}
        </>
      );
    case "arrow":
      return (
        <>
          {line([[0.8, 0.8], [-0.6, -0.6]])}
          {line([[-0.6, 0.1], [-0.6, -0.6], [0.1, -0.6]])}
        </>
      );
    case "flag":
      return (
        <>
          {line([[-0.7, 0.9], [-0.7, -0.9]])}
          {line([[-0.7, -0.9], [0.8, -0.55], [-0.7, -0.1]], true)}
        </>
      );
    case "heart":
      return line([[0, 0.85], [-0.85, 0], [-0.85, -0.45], [-0.45, -0.8], [0, -0.45], [0.45, -0.8], [0.85, -0.45], [0.85, 0]], true);
    case "node":
      return <circle cx={p(0, 0)[0]} cy={p(0, 0)[1]} r={s * 0.3} className="kz-iso-glyph-fill" />;
    default:
      return null;
  }
}

export interface IsoLinkProps {
  /** Where it starts, on the floor plan. */
  from: Vec2;
  /** Where it ends, on the floor plan. */
  to: Vec2;
  /**
   * The height it runs at.
   * @default 0
   */
  z?: number;
  /**
   * `elbow` follows the floor's axes, like a circuit; `straight` goes directly.
   * @default "elbow"
   */
  route?: "elbow" | "straight";
  /**
   * Which way the light flows: `out` from `from` to `to`, `in` back.
   * @default "out"
   */
  direction?: "out" | "in";
  /**
   * Particles of light travelling along it (0: only the dashes flow).
   * @default 2
   */
  particles?: number;
  /**
   * Seconds a particle takes to cross it.
   * @default 3.6
   */
  duration?: number;
  /** A value written on it ("90 %", "Tips") — passed translated. */
  label?: string;
  /**
   * Motion: the flow and the particles. `false` draws them still, resting along the link.
   * @default true
   */
  animated?: boolean;
}

/** A dotted link on the floor, light flowing along it and particles crossing it — a flow between two objects. */
export function IsoLink({ from, to, z = 0, route = "elbow", direction = "out", particles = 2, duration = 3.6, label, animated }: IsoLinkProps) {
  const corner: Vec2 = [to[0], from[1]];
  const plan = route === "elbow" && from[0] !== to[0] && from[1] !== to[1] ? [from, corner, to] : [from, to];
  const ordered = direction === "in" ? [...plan].reverse() : plan;
  const d = pathOf(ordered.map(([x, y]) => project([x, y, z])));
  const mid = plan.length === 3 ? corner : ([(from[0] + to[0]) / 2, (from[1] + to[1]) / 2] as Vec2);
  return (
    <g>
      <path d={d} className={cn("kz-iso-link", loop(animated))} />
      {Array.from({ length: particles }, (_, k) => (
        <circle
          key={k}
          r={3.2}
          className={cn("kz-iso-particle", loop(animated))}
          style={
            {
              offsetPath: `path("${d}")`,
              "--kz-iso-at": `${Math.round(((k + 0.5) / particles) * 100)}%`,
              "--kz-iso-dur": `${duration}s`,
              "--kz-iso-delay": `${(-duration * k) / particles}s`,
            } as Style
          }
        />
      ))}
      {label && <IsoLabel at={mid} z={z} text={label} />}
    </g>
  );
}

export interface IsoLabelProps {
  /** Where, on the floor plan. */
  at: Vec2;
  /**
   * Its height.
   * @default 0
   */
  z?: number;
  /** The text — passed translated. */
  text: string;
  /** A first part in the accent, bolder ("90 %" before " to the creator"). */
  strong?: string;
}

/** A label in a pill, always visible, pinned to a point of the scene (a share, a name). */
export function IsoLabel({ at, z = 0, text, strong }: IsoLabelProps) {
  const [x, y] = project([at[0], at[1], z]);
  const chars = text.length + (strong ? strong.length + 1 : 0);
  const w = chars * 6.8 + 22;
  return (
    <g className="kz-iso-link-label" aria-hidden>
      <rect x={x - w / 2} y={y - 12} width={w} height={24} rx={8} strokeWidth={1} />
      <text x={x} y={y + 4} textAnchor="middle">
        {strong && <tspan className="kz-iso-strong">{strong} </tspan>}
        {text}
      </text>
    </g>
  );
}

/** A satellite of an `IsoHub`. */
export interface IsoSatellite {
  /** Its name, shown when lifted — passed translated. */
  label: string;
  /**
   * Its pictogram.
   * @default "none"
   */
  glyph?: IsoGlyph;
  /**
   * The flow on its link: `in` toward the centre, `out` from it, `none` without a link.
   * @default "in"
   */
  flow?: "in" | "out" | "none";
  /** A value written on its link ("+ €5") — passed translated. */
  value?: string;
  /**
   * How it is lit.
   * @default "accent"
   */
  material?: IsoMaterial;
}

export interface IsoHubProps extends Omit<IsoSceneProps, "children"> {
  /** The hero object in the centre: its stages, bottom first. */
  layers: readonly IsoLayer[];
  /**
   * The footprint of the stages.
   * @default "cut"
   */
  shape?: IsoShape;
  /**
   * The width of the stages.
   * @default 120
   */
  size?: number;
  /**
   * A lit core on top of the stack; a string names it.
   * @default true
   */
  core?: boolean | string;
  /** A dome over the centre: `true`, or its name ("Your servers"). */
  dome?: boolean | string;
  /**
   * The objects around the centre, joined to it by flows of light. The first half stands on the left, the rest on the
   * right, top to bottom: never in front of the hero, never hidden behind it.
   */
  satellites?: readonly IsoSatellite[];
  /**
   * The distance of the satellites from the centre.
   * @default 210
   */
  radius?: number;
  /** The angle of each satellite, in degrees (0: lower right, 90: lower left, 180: upper left, 270: upper right), to place them by hand. */
  angles?: readonly number[];
  /** A label pinned above the centre, its first part in the accent: `{ strong: "90 %", text: "to the creator" }`. */
  highlight?: { readonly strong?: string; readonly text: string };
}

/** Left side (centred on 135°) then right side (centred on −45°), top to bottom, 64° apart. */
function sideAngles(n: number): number[] {
  const left = Math.ceil(n / 2);
  const right = n - left;
  const spread = (m: number, centre: number, sign: 1 | -1) => Array.from({ length: m }, (_, i) => centre + sign * ((m - 1) / 2 - i) * 64);
  return [...spread(left, 135, 1), ...spread(right, -45, -1)];
}

/**
 * The hero, driven by data: a stack under an optional dome, satellites on both sides, a flow of light between each
 * satellite and the centre. Objects are painted back to front and the camera frames exactly what is drawn.
 */
export function IsoHub({ layers, shape, size = 120, core, dome, satellites = [], radius = 210, angles, highlight, animated, viewBox, extent, ...scene }: IsoHubProps) {
  const auto = sideAngles(satellites.length);
  const placed = satellites.map((s, k) => {
    const angle = angles?.[k] ?? auto[k] ?? 0;
    const at = onCircle(radius, angle);
    // The farther back, the higher it floats: two tiles of a side never cover each other.
    return { ...s, angle, at, z: Math.round(78 - (depthOf(at) / radius) * 26), k };
  });
  const back = placed.filter((s) => depthOf(s.at) < 0);
  const front = placed.filter((s) => depthOf(s.at) >= 0);
  const stackHeight = layers.reduce((h, l) => h + (l.height ?? 22) + 4, 16) + (core === false ? 0 : 38);
  const domeR = size * 1.32;
  const domeH = Math.max(stackHeight + 80, 200);
  const crown = dome ? domeH + 24 : stackHeight + (highlight ? 62 : 12);
  // The frame: every object's screen extent (tiles with room for their label, the plinth, the dome or the crown).
  const points: Vec2[] = [
    ...placed.flatMap(({ at: [x, y], z }) => [project([x - 46, y - 46, z + 52]), project([x + 46, y + 46, z]), project([x + 46, y - 46, z]), project([x - 46, y + 46, z])]),
    ...hexagon(0, 0, size * (dome ? 1.4 : 0.95)).map(([x, y]) => project([x, y, 0])),
    project([0, 0, crown + 20]),
  ];
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const half = Math.max(...xs.map(Math.abs)) + 20;
  const box = [-half, Math.min(...ys) - 12, half * 2, Math.max(...ys) - Math.min(...ys) + 40].map((n) => Math.round(n)).join(" ");
  const tile = (s: (typeof placed)[number]) => (
    <IsoTile key={s.k} at={s.at} z={s.z} glyph={s.glyph} material={s.material} label={s.label} index={layers.length + 3 + s.k} animated={animated} />
  );
  const link = (s: (typeof placed)[number]) =>
    s.flow === "none" ? null : (
      <IsoLink
        key={`l${s.k}`}
        from={s.at}
        to={onCircle(size * (dome ? 1.32 : 0.8), s.angle)}
        route="straight"
        direction={s.flow === "out" ? "in" : "out"}
        label={s.value}
        animated={animated}
      />
    );
  return (
    <IsoScene animated={animated} extent={extent ?? Math.round(radius * 1.45 + 60)} viewBox={viewBox ?? box} {...scene}>
      {placed.map(link)}
      {dome && <IsoDome radius={domeR} part="rim" animated={animated} />}
      {back.map(tile)}
      <IsoStack layers={layers} shape={shape} size={size} core={core} animated={animated} />
      {dome && <IsoDome radius={domeR} height={domeH} part="arc" animated={animated} label={typeof dome === "string" ? dome : undefined} />}
      {highlight && <IsoLabel at={[0, 0]} z={stackHeight + (dome ? 24 : 46)} strong={highlight.strong} text={highlight.text} />}
      {front.map(tile)}
    </IsoScene>
  );
}
