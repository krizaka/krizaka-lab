import { a11y, familyMotion, type MarkProps, neutral, useIds } from "./shared";
import { YASAKIA as G } from "./yasakia-geometry";

const CSS = familyMotion("yzm", { ...G.motion, ...G.pulse });

/**
 * The Yasakia mark, "one conversation": one speech bubble with a tail on each side (turned 180°, never mirrored, so it
 * can never read as a face) in the Yasakia gradient (emerald → turquoise, the same in dark and light), and the spark
 * inside it — the family's lit node — that breathes: talk first, both ways. One node rides the dashed orbit. Below 48 px
 * it crops to the emblem.
 *
 * @deprecated Paused product (2026-10-25); removed in the next major.
 */
export function YasakiaLogo({ size = 32, animated = true, title, className }: MarkProps) {
  const id = useIds("yzm", ["gradient", "glow"] as const);
  const fill = `url(#${id.gradient})`;
  const m = (cls: string) => (animated ? `yzm-${cls}` : undefined);
  return (
    <svg width={size} height={size} viewBox={size < 48 ? G.croppedViewBox : G.viewBox} fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...a11y(title)}>
      <style>{CSS}</style>
      <defs>
        <linearGradient id={id.gradient} gradientUnits="userSpaceOnUse" x1={G.gradient.x1} y1={G.gradient.y1} x2={G.gradient.x2} y2={G.gradient.y2}>
          {G.gradient.stops.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        <radialGradient id={id.glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={G.glow.color} stopOpacity={G.glow.opacity} />
          <stop offset="100%" stopColor={G.glow.color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {size >= 48 ? <circle cx={G.center} cy={G.center} r="190" fill={`url(#${id.glow})`} /> : null /* cropped: the halo would show its square */}
      <circle cx={G.center} cy={G.center} r={G.ring.r} stroke={neutral("--kz-border-default", 30)} strokeWidth={G.ring.width} opacity=".35" />
      <g className={m("orbit")}>
        <circle cx={G.center} cy={G.center} r={G.orbit.r} stroke={neutral("--kz-border-strong", 40)} strokeWidth={G.orbit.width} strokeDasharray={G.orbit.dash} opacity=".6" />
        <circle cx={G.node.at[0]} cy={G.node.at[1]} r={G.node.r} fill={fill} />
      </g>
      <circle cx={G.bubble.cx} cy={G.bubble.cy} r={G.bubble.r} fill={fill} />
      <path d={G.tails.join(" ")} fill={fill} />
      <g className={m("core")}>
        <path d={G.spark.d} fill={G.highlight} stroke={G.highlight} strokeWidth={G.spark.soften} strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** @deprecated Yazakia was renamed Yasakia (2026-10): use `YasakiaLogo`. Kept for one minor version. */
export const YazakiaLogo = YasakiaLogo;
