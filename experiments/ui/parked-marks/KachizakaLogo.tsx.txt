import { KACHIZAKA as G } from "./kachizaka-geometry";
import { a11y, familyMotion, type MarkProps, neutral, useIds } from "./shared";

const CSS = familyMotion("kcm", { ...G.motion, ...G.pulse });

/**
 * The Kachizaka mark, "the podium": three steps cut at their outer corners, the winner in gold and the others in cobalt
 * (the brand's two colours, kept apart), under a gold diamond — the family's lit node — that breathes: a friendly
 * leaderboard where only points change hands. One node, the ball, rides the dashed orbit. Below 48 px it crops to the
 * emblem.
 *
 * @deprecated Paused product (2026-10-25); removed in the next major.
 */
export function KachizakaLogo({ size = 32, animated = true, title, className }: MarkProps) {
  const id = useIds("kcm", ["glow"] as const);
  const m = (cls: string) => (animated ? `kcm-${cls}` : undefined);
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
        <circle cx={G.ball.at[0]} cy={G.ball.at[1]} r={G.ball.r} fill={G.gold} />
      </g>
      <path d={G.steps.second} fill={G.cobalt} />
      <path d={G.steps.first} fill={G.gold} />
      <path d={G.steps.third} fill={G.cobalt} />
      <g className={m("core")}>
        <path d={G.node.d} fill={G.gold} stroke={G.gold} strokeWidth={G.node.soften} strokeLinejoin="round" />
        <path d={G.node.light} fill={G.highlight} />
      </g>
    </svg>
  );
}
