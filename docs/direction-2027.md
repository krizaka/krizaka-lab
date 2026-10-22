# Krizaka Motion — direction for 2027

Survey of the industry direction for motion and transitions on the web, read on 2026-10-21, and the recommendation the
next releases follow. Scope: page transitions, component transitions (overlays, tabs, lists), and the motion tokens.

Licences were checked in each repository (`licenseInfo` from the GitHub API on that date), not from memory.

## Recommendation

**Native first, then a tiny WAAPI helper, Motion only where native cannot go.**

1. **CSS and the platform** carry almost everything: View Transitions for page and shared-element motion,
   `@starting-style` plus `transition-behavior: allow-discrete` for enter and exit, `linear()` for springs, scroll-driven
   animations for scroll-linked effects. No JavaScript runtime, no layout jank, reduced motion handled by one media query.
2. **A WAAPI helper** (a few dozen lines in `@krizaka/ui/motion`) for the cases the platform does not express: a FLIP
   reorder of a list, a number that follows a value. WAAPI is off the main thread for transforms and opacity, is
   pausable, and needs no library.
3. **Motion (`motion`, MIT)** only as an optional engine for what native cannot do well: gesture-driven drag with
   inertia, shared layout across unrelated trees, and spring physics that must react to a live value. It is not a
   default dependency of Krizaka UI.
4. **Not GSAP** for the family: its licence is GreenSock's « standard no charge » licence, not an OSI licence, and the
   repository declares no `licenseInfo`. Stay away from a dependency whose terms need reading each time.

The rule that holds across all of it, from krizaka.com `AGENTS.md` §4: one motion system, no second conductor, no
permanent `requestAnimationFrame`, no canvas on a site, pause off screen, honour `prefers-reduced-motion`.

## The platform (the baseline)

| Capability | What it gives | Status to check at ship time |
| :-- | :-- | :-- |
| **View Transitions, same document** (`document.startViewTransition`, `view-transition-name`) | Cross-fade of the whole page and morphs of named elements between two states. | Chromium and Safari ship it. Firefox support must be checked when a release lands; do not assume it. |
| **View Transitions, cross-document** (`@view-transition { navigation: auto }`) | Morphs between two real page loads, with no JavaScript. | Chromium and Safari. A plain-link fallback must still navigate instantly. |
| **Next.js App Router** | The lab's page guide calls `document.startViewTransition` directly around a state change, which works today. React's `<ViewTransition>` component is experimental in React 19.2 (krizaka-com pins `react` 19.2.4) and Next's own flag for it is experimental. | Use the stable call; adopt the component only once it is stable in the pinned React. |
| **`@starting-style`** | Entry styles for an element that is being shown, so `display` and `opacity` can animate from nothing. | Baseline for a long time now (Chromium, Safari, Firefox). |
| **`transition-behavior: allow-discrete`** | Transitions on `display`, `overlay` and `content-visibility`, so a Dialog or a Popover can leave the page smoothly. | Baseline for a long time now. |
| **`linear()` easing** | A spring curve written as a list of points, in plain CSS. The token set (§ tokens) stores springs this way. | Baseline. |
| **Scroll-driven animations** (`animation-timeline: view()`, `scroll()`) | Progress tied to scroll, with no listener. | Chromium first; Safari and Firefox partial. Use as an enhancement, never as the only signal. |
| **Popover API and `<dialog>`** | Top-layer overlays with native focus handling; they are what `@starting-style` animates. | Baseline. |

## Open-source libraries (licences verified 2026-10-21)

| Library | Licence (verified) | What it is good for | Verdict for Krizaka |
| :-- | :-- | :-- | :-- |
| **Motion** (`motion`, the React package of `framer/motion` on GitHub) | **MIT** | React animation, layout animations, gestures, springs. Actively maintained (pushed the day of this survey). | **Optional engine** for gesture and live-value springs. Not a default. |
| **react-spring** (`pmndrs/react-spring`) | **MIT** | Spring physics hooks. | Overlaps Motion; do not add a second one. |
| **auto-animate** (`formkit/auto-animate`) | **MIT** | One line that animates a list's add, remove and reorder (FLIP). Small. | **Reference for (b) list add and remove.** Either adopt it or port its FLIP idea into the WAAPI helper; decide in the list release. |
| **GSAP** (`greensock/GSAP`) | **GreenSock standard "no charge" licence**, not an OSI licence; no `licenseInfo` in the repo | Timelines, scroll and SVG plugins. | **Not for the family.** The licence is not open source. |
| **Next.js** | **MIT** | The App Router that the sites run on. | Context only: the view-transition integration is ours to write. |

Only licences verified above are stated as facts. Other libraries (for example Lenis, Anime.js, Theatre.js) were not
checked for this survey and are not recommended here.

## What this means for the three releases

- **(a) Page transitions** — a `viewTransition()` helper, and a `<PageTransition>` wrapper for the App Router, that
  calls `document.startViewTransition` around a state or route change. Shared-element morph uses `view-transition-name`.
  Fallback: a plain cross-fade (`opacity` only) where the API is missing. Reduced motion: the change is instant (no
  animation, the DOM still updates). Shipped in `@krizaka/ui/motion`.
- **(b) Component transitions** — Dialog, Popover, Sheet and Tabs enter and exit with `@starting-style` and
  `allow-discrete`, in Krizaka UI, with tests. Lists add and remove with the WAAPI FLIP helper (or auto-animate, decided
  in that release). Durations and easings come from the tokens, never typed.
- **(c) Motion tokens** — `--kz-motion-*` in `@krizaka/tokens`: durations (`fast`, `base`, `slow`), easing curves,
  springs as `linear()` strings, and stagger steps. Documented on ui.krizaka.com and used by (a) and (b).

Each release shows a live demo on the Krizaka Motion lab, and one app adopts page transitions with a clip as proof.

## Not in scope here

- No new npm package: the helpers live in `@krizaka/ui/motion`, the tokens in `@krizaka/tokens`.
- No canvas, no WebGL on a Krizaka site.
- No Motion or GSAP shipped as a dependency of the sites in this round.
