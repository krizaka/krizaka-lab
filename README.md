<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/krizaka/.github/main/profile/assets/krizaka-dark.svg">
  <img src="https://raw.githubusercontent.com/krizaka/.github/main/profile/assets/krizaka-light.svg" alt="Krizaka" width="96">
</picture>

# krizaka-motion

**The Krizaka motion lab.** Experimental generative visuals — the Orazaka neural flow, a holographic
HUD, liquid glass, a neural lattice — played live, each one a shareable address.

**A lab, not a package**: nothing here is published on npm. What proves itself moves into
[Krizaka UI](https://ui.krizaka.com) as SVG + CSS on the one motion system — the flow already did:
[`@krizaka/ui/engine-flow`](https://ui.krizaka.com/components/engine-flow). Audit: [docs/AUDIT-2026-10-20.md](docs/AUDIT-2026-10-20.md).

[![CI](https://github.com/krizaka/krizaka-motion/actions/workflows/ci.yml/badge.svg)](https://github.com/krizaka/krizaka-motion/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/krizaka/krizaka-motion/badge)](https://scorecard.dev/viewer/?uri=github.com/krizaka/krizaka-motion)
[![Lab](https://img.shields.io/badge/lab-motion.krizaka.com-196df5)](https://motion.krizaka.com/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=krizaka_krizaka-motion&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=krizaka_krizaka-motion) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=krizaka_krizaka-motion&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=krizaka_krizaka-motion) [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=krizaka_krizaka-motion&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=krizaka_krizaka-motion) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=krizaka_krizaka-motion&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=krizaka_krizaka-motion) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=krizaka_krizaka-motion&metric=coverage)](https://sonarcloud.io/summary/new_code?id=krizaka_krizaka-motion)

</div>


## The lab

**https://motion.krizaka.com/** (the docs live here; `krizaka.github.io/krizaka-motion` redirects to it) — English, dark and light. Organised by task (krizaka-ui#434).

**Guides** — one task each, played on a real app screen made of `@krizaka/ui`, with its settings, the code to copy
(it follows the settings), every option in a table and what happens under reduced motion:

| Guide | Address | Screen |
| :-- | :-- | :-- |
| Animate a list arriving | [`/list-arrival`](https://motion.krizaka.com/list-arrival/) | dashboard |
| Show a live number | [`/live-number`](https://motion.krizaka.com/live-number/) | dashboard |
| Stream an answer into a chat | [`/streaming-answer`](https://motion.krizaka.com/streaming-answer/) | chat |
| Cross from one step to the next | [`/page-transition`](https://motion.krizaka.com/page-transition/) | checkout |
| Say an action is working, then done | [`/button-feedback`](https://motion.krizaka.com/button-feedback/) | checkout |
| Draw a route and follow a courier | [`/route-draw`](https://motion.krizaka.com/route-draw/) | delivery |
| Drop a pin onto a shop wall | [`/pin-drop`](https://motion.krizaka.com/pin-drop/) | wall |
| Press tape onto a note | [`/tape-stick`](https://motion.krizaka.com/tape-stick/) | wall |
| Let pinned paper sway | [`/paper-sway`](https://motion.krizaka.com/paper-sway/) | wall |
| Develop a pinned photograph | [`/develop`](https://motion.krizaka.com/develop/) | wall |
| Power on a wall display | [`/crt-power-on`](https://motion.krizaka.com/crt-power-on/) | wall |
| Power off a wall display | [`/crt-power-off`](https://motion.krizaka.com/crt-power-off/) | wall |
| Settle a neon sign | [`/neon-flicker`](https://motion.krizaka.com/neon-flicker/) | wall |

**Scenarios** — the screens, whole, with every motion they use: [`/dashboard`](https://motion.krizaka.com/dashboard/),
[`/chat`](https://motion.krizaka.com/chat/), [`/checkout`](https://motion.krizaka.com/checkout/),
[`/delivery`](https://motion.krizaka.com/delivery/), and [`/wall`](https://motion.krizaka.com/wall/).
The old demo addresses (`/data-motion`, `/figures`,
`/transitions`, `/conversation`, `/maps`) open the guide that replaced them.

**Also**: [`/krizaka-ui`](https://motion.krizaka.com/krizaka-ui/) (components with their motion),
`/journey`, `/overlays`, `/people`, and [`/experiments`](https://motion.krizaka.com/experiments/) — the
canvas studies (engine flow, HUD, liquid glass, neural lattice).

## Lab, then Krizaka UI

- The views here are **experiments**: React components over canvas renderers (`src/react`, `src/core`). They follow the
  motion system — paused off screen (`data-offscreen` from `@krizaka/ui`'s `MotionObserver`), held while the page
  settles, one still frame under reduced motion — but Krizaka sites use no canvas.
- What a Krizaka site needs is **rebuilt in `@krizaka/ui`** in SVG and CSS, with its registry page, examples, stories and
  tests (krizaka-ui `AGENTS.md`). The engine flow did: [`EngineFlow`](https://ui.krizaka.com/components/engine-flow).
- Colours come from the tokens, words from `messages/` (`@krizaka/i18n`), marks from `@krizaka/ui`, icons from
  `@krizaka/icons` — never copied here.

## Layout

```text
src/core/      the renderers (canvas) and their maths — springs, Bézier lengths, optics, routes
src/react/     the React views over them (OrazakaEngineFlow, JarvisHUD, LiquidCausticsView, NeuralLatticeView)
src/lab/       the shell on @krizaka/ui: home, demo pages (demos.tsx), the gallery (gallery.tsx), English-only i18n binding
messages/      en.json (the reference) and fr.json
scripts/       generate-routes.mjs (a folder per route + 404.html for Pages), check-overflow.mjs (360–1440 px)
docs/          AUDIT-2026-10-20.md
```

**Add a guide**: its entry in `src/lab/guides.ts` (task, screen, settings, snippet, options, reduced motion), its path in `src/core/router.ts` (`GUIDE_PATHS`) and `scripts/generate-routes.mjs`; tests/guides.test.mjs holds the contract. **Add a canvas experiment**: its view in `src/react`, its card, settings and usage in `src/lab/demos.tsx`, its route in
`src/core/router.ts` and `scripts/generate-routes.mjs`, its words in both catalogues.

## Run it

```bash
pnpm install          # pnpm 10 (packageManager)
pnpm dev              # the lab on http://localhost:5173
pnpm test             # builds the library, then the unit tests (node --test)
pnpm run build        # the lab (dist-demo/, what Pages serves); it is not a package, nothing is published
pnpm run check:budget   # gzip ceiling per entry (scripts/budget.json), no requestAnimationFrame outside src/core and src/native
pnpm exec krizaka-i18n check messages
node scripts/check-overflow.mjs --base http://localhost:4173   # after `pnpm exec vite preview --outDir dist-demo`
```

CI runs the type check, the catalogues check, the build and the tests on every pull request; the Pages workflow builds
the demo, checks it for horizontal overflow at 360/768/1024/1440 px in both themes, then deploys.

## License

[Apache-2.0](LICENSE) — see [NOTICE](NOTICE).
