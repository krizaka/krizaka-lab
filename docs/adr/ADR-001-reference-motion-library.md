# ADR-001 — Krizaka Motion as the reference motion library (config API, examples, playground, budget)

- Status: proposed (2026-10-20), curated by Antigravity (the roadmap) — this ADR adds, it does not restructure.
- Context: Oussama's report of 2026-10-20 — the engine flow did not move on krizaka.com nor in the lab; the Krizaka UI
  examples of the lab are weak (no maps, few components); « push Krizaka Motion further, more options, next-level
  examples: a reference motion/animation library ».
- Tracking issue: krizaka/krizaka-motion#6 (sub-issues linked), org project 4.

## 1. What happened (the bug that opens this ADR)

`@krizaka/ui/engine-flow` animated `stroke-dashoffset` to `calc(var(--kz-flow-gap) * -1)` — a unitless number. The other
keyframe is a length, so the animation was not interpolable: each dot flipped between two offsets that draw it in the
same place. 12 photons per figure, `animation-play-state: running`, every gate open (MotionObserver, off-screen,
reduced motion) — and nothing moved, on krizaka.com, `/story` and the lab alike (one source: krizaka-ui `motion.css`).
Fixed in krizaka-ui#394. Nobody saw it because every browser check of the family runs **under reduced motion**.

Decisions that follow:

1. **Motion is tested where it moves.** Every primitive that animates ships a real-browser check with reduced motion
   **off** (distinct, finite readings of its animated property over ~700 ms) and one with it **on** (it rests). Pure
   judgement lives in a lib with unit tests; the script runs in CI (`scripts/check-motion.mjs`, here and in krizaka-com).
2. **No animated length without its unit** in a keyframe (`* -1px`, never `* -1`): a lint-level rule of the primitives.

## 2. Audit — the lab against `@krizaka/ui` (163 registry entries)

Covered today (gallery + demos, 2026-10-20): `Button` (shimmer, magnetic, loading), `Toast` (undo), `Progress`, `Dialog`
(right panel), `GlowCard`, `Badge`/`Chip`, `Tabs`, `Avatar` (presence), `Stat` + `NumberTicker`, `DataTable` (static
rows), `EngineFlow`, `Card` (lattice, glass), `Waveform`, `chat` (`MessageBubble`, `TypingIndicator`), `Marquee`, `NavBar`,
`CodeBlock` (the snippets). Plus the lab's own canvas views (voice orb, HUD, liquid glass, lattice) — experiments, not
primitives.

No motion example yet, by priority:

| Priority | Components | The motion to show |
| :-- | :-- | :-- |
| P0 | `Map` (`Marker`, `Cluster`, `UserPosition`, `RadiusCircle`) | route drawing, pins dropping, a delivery path, a heat pulse (needs a `Route` primitive in krizaka-ui) |
| P0 | `@krizaka/charts` `Sparkline`, `Line`, `Gauge`, `Ticker`; `Meter`, `GoalGauge`, `Countdown` | growth on arrival, live point, gauge sweep |
| P0 | `DataTable`, `List`, `ActivityFeed`, `Kanban`, `TreeView` | row arrival, sort/reorder (FLIP), selection, feed insert |
| P1 | `Stepper`, `StepProgress`, `StepShowcase`, `HowItWorksPage` | journey: step enter/complete, progress rail |
| P1 | `Dialog` (placement), `Popover`, `Tooltip`, `ActionSheet`, `DropdownMenu`, `Command` | enter/exit choreography, placement-aware origin |
| P1 | `NavBar` (`RailNav`, `TabBar`, `AccountMenu`), `Toc`, `DocsNav` | active indicator slide, scroll-spy |
| P1 | `PointerLight`, `ArgumentCard`, `LinkCard`, `ServiceCard`, `ProfileCard`, `PromiseCard` | pointer light, lift, reveal stagger |
| P1 | `Avatar` stack / `Avatar` group, `VerifiedBadge`, `Achievement` | presence, join/leave, unlock |
| P1 | `MessageBubble` streaming, `ContinuePrompt`, `TerminalReplay`, `GenUI` | token-by-token stream, caret, replay |
| P2 | `ProductLogo`, `mascots`, `MascotQuote`, `Landscape`, `Iso`, `Showcase`, `ScrollStage`, `SwipeDeck`, `SwipeableRow`, `PullToRefresh` | mark draw-in, flock, parallax, gestures |
| P2 | `Skeleton`, `Loader`, `Spinner`, `Toast` stack, `Alert`, `Switch`, `Slider`, `Checkbox`, `Field` | loading, state change, validation shake |
| P2 | page transitions (`Page`, `app-shell`, `SplashHandoff`, `Section` reveal) | route change, shared element, reveal stagger |

Language: the lab's catalogues are EN/FR today; Oussama asks for **English only**. New demos are written in English
only; dropping FR is the lab owner's call (it also removes the i18n CI step).

## 3. Config API — one vocabulary for every primitive

Every animated primitive takes the same optional props (defaults in bold), documented once on ui.krizaka.com:

| Prop | Values | Notes |
| :-- | :-- | :-- |
| `speed` | number (units/s or ×) , **1** | photon speed, loop rate |
| `duration` | ms \| token (`fast` `base` `slow`) | one-shot choreography (draw-in, arrival) |
| `easing` | `linear` \| `standard` \| `emphasized` \| `spring` \| cubic-bezier | the `--kz-ease*` tokens; `spring` via CSS `linear()` |
| `stagger` | ms between items, **70** | same step as `reveal(i)` |
| `direction` | `radial` \| `top-down` \| `left-right` (flows); `in` \| `out` \| `both` (traffic) | `layout` today on EngineFlow |
| `density` | `sparse` \| **`normal`** \| `dense` | photons per conduit, rows revealed, pins |
| `trigger` | **`always`** \| `in-view` \| `hover` \| `active` \| `scroll` | `scroll` = `animation-timeline: view()` with a still fallback |
| `reducedMotion` | **`still`** \| `fade` | `still` = the composed resting frame; never a blank |
| `hue` | token (`--kz-accent`, `brand-<id>`) | colour from tokens only, both themes |
| `paused` | boolean | controlled pause, on top of the off-screen contract |

**The pause-off-screen contract** (already `@krizaka/ui/motion`): a primitive is a `[data-motion-scope]`; MotionObserver
sets `data-offscreen` and every animation inside pauses; `html[data-motion="settling"]` holds loops until LCP is safe;
nothing runs under `prefers-reduced-motion` except the `fade` policy; no permanent `requestAnimationFrame`.

## 4. Next-level examples (built on Krizaka UI components, one PR each, with a proof clip)

Maps (route drawing, pins dropping, delivery path, heat pulse) · charts (Sparkline growth) · DataTable (row arrival,
sort) · Dialog/Sheet · NavBar (sliding indicator) · Cards with PointerLight · MessageBubble streaming · Avatar stack ·
Stepper/journey · NumberTicker · product marks and mascots · page transitions. Each example is a page of the lab with
the playground (§5), uses only `@krizaka/*` components, and passes `check-motion` and `check-overflow`.

## 5. Playground

On every demo: live **knobs** (the config of §3, plus the component's own props) in the lab's settings drawer, built
from Krizaka UI controls (`Chip.Group`, `Slider`, `Switch`); a **copy-code** snippet that follows the knobs (`CodeBlock`
with copy); the **« use with Krizaka UI » line** — `pnpm add @krizaka/ui` and the import path of the primitive; the
reduced-motion state one click away; the URL carries the knobs (share a configuration).

## 6. Performance budget

- **CSS / WAAPI first.** SVG `stroke-dashoffset`, `transform`, `opacity`, `scale`, `translate`: compositor properties.
  A canvas or `requestAnimationFrame` only when justified in the PR (measured, off-screen pause, still frame) — the lab's
  canvas views stay experiments.
- **Size per primitive** in `size-limit` (gzip): EngineFlow 2.2 kB today is the reference; a primitive over 4 kB gzip
  needs a reason. The lab prints the number on each demo page.
- No layout shift (aspect-ratio boxes), no animation of layout properties, `will-change` never permanent.
- A page with N figures runs at most the on-screen ones (`data-offscreen`).

## 7. Documentation

A **Motion** section on ui.krizaka.com (krizaka-ui `apps/site`), generated from the registries like the components:
principles, the config table, each primitive's page with the live demo and the reduced-motion frame. The lab stays the
playground and the place for experiments; no separate documentation engine.

## 8. Slices

| Slice | Content | Where |
| :-- | :-- | :-- |
| 0 | the bug: `check-motion` everywhere, keyframe unit, hub breathes | krizaka-ui#394, krizaka-com, krizaka-motion |
| a | EngineFlow config (`density`, `trigger`, `easing`, `stagger`, `speed`) + the lab playground | krizaka-ui + krizaka-motion |
| b | `Route` + pin drop on `@krizaka/ui/map`; the Map example | krizaka-ui then krizaka-motion |
| c | DataTable row arrival + Sparkline growth | krizaka-motion (+ krizaka-ui if a primitive is missing) |
| d… | the rest of §4, in priority order | issues linked to the tracking issue |
