import { a11y, familyMotion, type MarkProps, neutral, useIds } from "./shared";
import { YORORIS as G } from "./yororis-geometry";

const CSS = familyMotion("yrm", { ...G.motion, ...G.pulse });

/**
 * The Yororis mark, "held": two open hands, two sage arcs of one circle, cup a warm sand core without closing on it —
 * held, given room, free to go. The core breathes, the slowest breath of the family; one node, the moment, rides the
 * dashed orbit. Below 48 px it crops to the emblem.
 *
 * @deprecated Paused product (2026-10-25); removed in the next major.
 */
export function YororisLogo({ size = 32, animated = true, title, className }: MarkProps) {
  const id = useIds("yrm", ["glow"] as const);
  const m = (cls: string) => (animated ? `yrm-${cls}` : undefined);
  return (
    <svg width={size} height={size} viewBox={size < 48 ? G.croppedViewBox : G.viewBox} fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...a11y(title)}>
      <style>{CSS}</style>
      <defs>
        <radialGradient id={id.glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={G.glow.color} stopOpacity={G.glow.opacity} />
          <stop offset="100%" stopColor={G.glow.color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {size >= 48 ? <circle cx={G.center} cy={G.center} r="190" fill={`url(#${id.glow})`} /> : null /* cropped: the halo would show its square */}
      <circle cx={G.center} cy={G.center} r={G.ring.r} stroke={neutral("--kz-border-default", 30)} strokeWidth={G.ring.width} opacity=".35" />
      <g className={m("orbit")}>
        <circle cx={G.center} cy={G.center} r={G.orbit.r} stroke={neutral("--kz-border-strong", 40)} strokeWidth={G.orbit.width} strokeDasharray={G.orbit.dash} opacity=".6" />
        <circle cx={G.node.at[0]} cy={G.node.at[1]} r={G.node.r} fill={G.sage} />
      </g>
      <path d={G.hands} stroke={G.sage} strokeWidth={G.stroke} strokeLinecap="round" />
      <g className={m("core")}>
        <circle cx={G.core.cx} cy={G.core.cy} r={G.core.r} fill={G.sand} />
        <circle cx={G.core.cx} cy={G.core.cy} r={G.core.inner} fill={G.highlight} />
      </g>
    </svg>
  );
}
