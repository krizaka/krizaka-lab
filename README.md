<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/krizaka/.github/main/profile/assets/krizaka-dark.svg">
  <img src="https://raw.githubusercontent.com/krizaka/.github/main/profile/assets/krizaka-light.svg" alt="Krizaka" width="96">
</picture>

# krizaka-motion

**The Krizaka motion lab.** Experimental generative visuals — the Orazaka neural flow, a voice presence, a holographic
HUD, liquid glass, a neural lattice — played live, each one a shareable address.

**A lab, not a package**: nothing here is published on npm. What proves itself moves into
[Krizaka UI](https://ui.krizaka.com) as SVG + CSS on the one motion system — the flow already did:
[`@krizaka/ui/engine-flow`](https://ui.krizaka.com/components/engine-flow). Audit: [docs/AUDIT-2026-10-20.md](docs/AUDIT-2026-10-20.md).

[![CI](https://github.com/krizaka/krizaka-motion/actions/workflows/ci.yml/badge.svg)](https://github.com/krizaka/krizaka-motion/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/krizaka/krizaka-motion/badge)](https://scorecard.dev/viewer/?uri=github.com/krizaka/krizaka-motion)
[![Lab](https://img.shields.io/badge/lab-krizaka.github.io%2Fkrizaka--motion-196df5)](https://krizaka.github.io/krizaka-motion/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

</div>


## The lab

**https://krizaka.github.io/krizaka-motion/** — English by default, French through the language switch, dark and light.

| Demo | Address | What it's for |
| :-- | :-- | :-- |
| Engine flow | [`/orazaka`](https://krizaka.github.io/krizaka-motion/orazaka/) | One engine and the products it powers — the flow krizaka.com's home draws (`@krizaka/ui/engine-flow`), beside the first canvas version. |
| Voice presence | [`/yororis`](https://krizaka.github.io/krizaka-motion/yororis/) | A sphere that breathes and follows a voice (procedural, or the microphone if allowed). |
| Holographic HUD | [`/jarvis`](https://krizaka.github.io/krizaka-motion/jarvis/) | A study of dense, legible motion: rings, reticles, telemetry. |
| Liquid glass | [`/liquid-glass`](https://krizaka.github.io/krizaka-motion/liquid-glass/) | Light bending through a liquid surface; touch for a ripple. |
| Neural lattice | [`/neural-lattice`](https://krizaka.github.io/krizaka-motion/neural-lattice/) | Neurons that fire, synapses that strengthen with use. |
| Krizaka UI + Motion | [`/krizaka-ui`](https://krizaka.github.io/krizaka-motion/krizaka-ui/) | 17 real `@krizaka/ui` components with their motion, by use case — live, with imports, props and reduced-motion behaviour. |
| Specs | [`/specs`](https://krizaka.github.io/krizaka-motion/specs/) | The rules a lab view follows, and how one becomes a Krizaka UI primitive. |

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
src/react/     the React views over them (OrazakaEngineFlow, YororisPresenceOrb, JarvisHUD, LiquidCausticsView, NeuralLatticeView)
src/lab/       the shell on @krizaka/ui: home, demo pages (demos.tsx), the gallery (gallery.tsx), English-only i18n binding
messages/      en.json (the reference) and fr.json
scripts/       generate-routes.mjs (a folder per route + 404.html for Pages), check-overflow.mjs (360–1440 px)
docs/          AUDIT-2026-10-20.md
```

**Add a demo**: its view in `src/react`, its card, settings and usage in `src/lab/demos.tsx`, its route in
`src/core/router.ts` and `scripts/generate-routes.mjs`, its words in both catalogues.

## Run it

```bash
pnpm install          # pnpm 10 (packageManager)
pnpm dev              # the lab on http://localhost:5173
pnpm test             # builds the library, then the unit tests (node --test)
pnpm run build        # library + demo (dist-demo/, what Pages serves)
pnpm exec krizaka-i18n check messages
node scripts/check-overflow.mjs --base http://localhost:4173   # after `pnpm exec vite preview --outDir dist-demo`
```

CI runs the type check, the catalogues check, the build and the tests on every pull request; the Pages workflow builds
the demo, checks it for horizontal overflow at 360/768/1024/1440 px in both themes, then deploys.

## License

[Apache-2.0](LICENSE) — see [NOTICE](NOTICE).
