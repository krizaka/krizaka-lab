import type { ComponentMeta } from "../meta";

export const meta = {
  title: "Marquee",
  summary:
    "A band of items that slides forever — at a speed in pixels per second, paused by the pointer, the focus or its own pause button, read once by assistive technology, and a still row you scroll under reduced motion.",
  status: "beta",
  category: "data-display",
  domain: "page-blocks",
  platforms: "web",
  parity: { native: { status: "n/a", reason: "Decorative scrolling logos of a site's page." }, desktop: { status: "n/a", reason: "A public site's page, not a window of the Mac app." } },
  whenToUse: [
    "A band of logos, names or short quotes on a landing page: proof at a glance.",
    "Short cards that need no comparison (testimonials, recent payouts) — one band per page.",
  ],
  whenNotToUse: [
    { when: "For content the reader must read in order or act on: a list stays still." },
    { when: "For a few items that fit on one line: show them, still." },
  ],
  bestPractices: [
    "Keep it slow (24–40 px/s) and short; one band per page.",
    "Items that make sense alone: the reader catches them in any order.",
    "Pass `label`, `pauseLabel` and `playLabel` translated: the band is a named region with a real pause button.",
  ],
  accessibility: {
    keyboard: [
      { keys: "Tab", action: "Focuses the band (it pauses; under reduced motion the arrows scroll it), the links inside, then the pause button." },
      { keys: "Enter / Space", action: "On the pause button: stops or restarts the band." },
    ],
    notes: [
      "A `section` named by `label`; the items are a list, and the second copy (for the loop) is hidden from assistive technology.",
      "The pause button (`aria-pressed`) meets WCAG 2.2.2: motion that lasts can be stopped.",
      "Under `prefers-reduced-motion` the band is still, its copy removed, and it scrolls by hand; off screen it pauses (MotionObserver).",
    ],
  },
  related: ["glow-card", "number-ticker"],
  web: {
    imports: ["Marquee"],
    examples: [
      { name: "logos", title: "A band of names", description: "Paused by the pointer, the focus or its button; a still row under reduced motion." },
      { name: "cards", title: "Testimonials", description: "Cards sliding the other way, slower; each one read once." },
    ],
  },
} satisfies ComponentMeta;
