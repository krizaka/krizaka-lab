import { OROCHIA as G } from "./orochia-geometry";
import { a11y, type MarkProps, neutral, useIds } from "./shared";

const CSS = `
.orom-spin { transform-origin: 180px 180px; animation: orom-spin 30s linear infinite; }
.orom-slither { animation: orom-slither 2.4s linear infinite; }
.orom-pulse { transform-box: view-box; animation: orom-pulse 3.2s ease-in-out infinite; }
@keyframes orom-spin { to { transform: rotate(360deg); } }
@keyframes orom-slither { to { stroke-dashoffset: -64; } }
@keyframes orom-pulse {
  0%, 100% { filter: drop-shadow(0 0 6px hsla(292, 84%, 61%, .25)); opacity: .9; }
  50% { filter: drop-shadow(0 0 14px hsla(292, 84%, 61%, .55)); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) { .orom-spin, .orom-slither, .orom-pulse { animation: none; } }
`;

/**
 * The Orochia mark: the serpent (Orochi) coiled into an "O" around the flame it guards. The orbit turns, scales slide
 * along the body, the eye and the flame breathe. Below 48 px it crops to the serpent: the orbits would be hairlines.
 *
 * @deprecated Paused product (2026-10-25); removed in the next major.
 */
export function OrochiaLogo({ size = 36, animated = true, title, className }: MarkProps) {
  const id = useIds("orom", ["body", "flame", "glow"] as const);
  const m = (cls: string) => (animated ? cls : undefined);
  return (
    <svg width={size} height={size} viewBox={size < 48 ? G.croppedViewBox : G.viewBox} fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...a11y(title)}>
      <style>{CSS}</style>
      <defs>
        <linearGradient id={id.body} gradientUnits="userSpaceOnUse" x1={G.body.x1} y1={G.body.y1} x2={G.body.x2} y2={G.body.y2}>
          {G.body.stops.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        <linearGradient id={id.flame} x1="50%" y1="100%" x2="50%" y2="0%">
          {G.flameGradient.stops.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        <radialGradient id={id.glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={G.glow.color} stopOpacity={G.glow.opacity} />
          <stop offset="100%" stopColor={G.glow.color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`translate(${G.offset} ${G.offset})`}>
        <circle cx="180" cy="180" r="170" fill={`url(#${id.glow})`} />
        <circle className={m("orom-spin")} cx="180" cy="180" r={G.orbit.r} stroke={neutral("--kz-border-strong", 40)} strokeWidth={G.orbit.width} strokeDasharray={G.orbit.dash} opacity=".6" />
        <circle cx="180" cy="180" r={G.ring.r} stroke={neutral("--kz-border-default", 30)} strokeWidth={G.ring.width} opacity=".35" />
        <path d={G.arc} stroke={`url(#${id.body})`} strokeWidth="22" strokeLinecap="round" />
        <path className={m("orom-slither")} d={G.arc} stroke={G.scales.color} strokeOpacity={G.scales.opacity} strokeWidth={G.scales.width} strokeLinecap="round" strokeDasharray={G.scales.dash} />
        <path d={G.neck} stroke={`url(#${id.body})`} strokeWidth="14" strokeLinecap="round" />
        <path d={G.tail} stroke={`url(#${id.body})`} strokeWidth="6" strokeLinecap="round" />
        <ellipse cx={G.head.cx} cy={G.head.cy} rx={G.head.rx} ry={G.head.ry} transform={`rotate(${G.head.rotate} ${G.head.cx} ${G.head.cy})`} fill={`url(#${id.body})`} />
        <path d={G.tongue.d} stroke={G.tongue.color} strokeWidth="3" strokeLinecap="round" />
        <circle className={m("orom-pulse")} cx={G.eye.cx} cy={G.eye.cy} r={G.eye.r} fill={G.eye.color} />
        <path className={m("orom-pulse")} transform={`translate(${G.flame.translate[0]} ${G.flame.translate[1]}) scale(${G.flame.scale})`} d={G.flame.d} fill={`url(#${id.flame})`} />
      </g>
    </svg>
  );
}
