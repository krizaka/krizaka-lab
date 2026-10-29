// Client (a pause button, a measure). A band that slides — and that anyone can stop: it pauses under the pointer and
// while something inside has the focus, it carries a visible pause button (WCAG 2.2.2: motion longer than 5 s can be
// paused), its speed is in pixels per second whatever its width (a long band does not race), its copy is hidden from
// assistive technology (each item is read once), and under reduced motion it is a still row you scroll by hand.
import * as React from "react";

import { cn } from "../cn";

export type MarqueeProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** The accessible name of the band (“Our partners”) — passed translated. */
  label: string;
  /** The pause button's name (“Pause the band”) — passed translated. */
  pauseLabel: string;
  /** The same button's name once paused (“Play the band”) — passed translated. */
  playLabel: string;
  /** The items: logos, words, cards. */
  children: React.ReactNode;
  /**
   * Pixels per second.
   * @default 40
   */
  speed?: number;
  /**
   * Which way it slides.
   * @default "left"
   */
  direction?: "left" | "right";
  /**
   * The edges fade into the page.
   * @default true
   */
  fade?: boolean;
  /** Starts paused. */
  defaultPaused?: boolean;
};

/** A band of items sliding forever — pausable, accessible, still under reduced motion. */
export function Marquee({ label, pauseLabel, playLabel, children, speed = 40, direction = "left", fade = true, defaultPaused = false, className, ...props }: MarqueeProps) {
  const [paused, setPaused] = React.useState(defaultPaused);
  const track = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => el.style.setProperty("--kz-marquee-duration", `${Math.max(4, el.scrollWidth / 2 / Math.max(1, speed))}s`);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [speed]);
  return (
    <section aria-label={label} data-paused={paused ? "" : undefined} data-direction={direction} data-fade={fade ? "" : undefined} className={cn("kz-band group/marquee relative", className)} {...props}>
      {/* Focusable: the keyboard stops the band (focus-within) and, still under reduced motion, scrolls the row. */}
      <div
        tabIndex={0}
        className="kz-band-viewport overflow-hidden rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Each copy ends with the gap: two copies are exactly twice one, so the loop never jumps. */}
        <div ref={track} className="kz-marquee kz-loop">
          <ul className="flex shrink-0 items-center gap-(--kz-band-gap) pr-(--kz-band-gap)">{wrap(children)}</ul>
          <ul aria-hidden className="kz-band-copy flex shrink-0 items-center gap-(--kz-band-gap) pr-(--kz-band-gap)">
            {wrap(children)}
          </ul>
        </div>
      </div>
      <button
        type="button"
        aria-pressed={paused}
        aria-label={paused ? playLabel : pauseLabel}
        onClick={() => setPaused(!paused)}
        className="absolute right-1 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-surface-1/90 text-fg-secondary opacity-0 shadow-sm transition-opacity hover:text-fg focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring group-hover/marquee:opacity-100 aria-pressed:opacity-100 motion-reduce:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
          {paused ? <path d="M8 5.5v13l10-6.5Z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
        </svg>
      </button>
    </section>
  );
}

function wrap(children: React.ReactNode) {
  return React.Children.map(children, (child) => <li className="shrink-0">{child}</li>);
}
