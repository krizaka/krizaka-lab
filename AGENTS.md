# krizaka-motion — agent instructions

The Krizaka **motion lab**: guides (one motion task each, played on a real app screen made of `@krizaka/ui`), the four
scenarios (dashboard, chat, checkout, delivery) and the canvas experiments. Live at https://motion.krizaka.com/
(moving to motion.krizaka.com, krizaka-motion#45). It is **a lab, not a package**: nothing here is published on npm.

## The rules

1. **Krizaka UI first.** A screen here is composed of `@krizaka/ui` components (Stepper, StepProgress, Button, Toast,
   DataTable, Sparkline, NumberTicker, PageTransition, EngineFlow…), never hand-made look-alikes. A motion or a component
   that proves itself moves into krizaka-ui (registry page, examples, stories, tests, `AGENTS.md` there), then is used here.
2. **One motion system: @krizaka/ui's.** `MotionObserver`, `reveal`, `PageTransition`, `data-offscreen` (paused off screen),
   `html[data-motion]` (held while the page settles), `magnetic`. No animation library, no permanent
   `requestAnimationFrame` outside `src/core` experiments, no second conductor.
3. **Reduced motion is designed, not dropped.** Every guide says what happens under `prefers-reduced-motion` and the page
   still makes sense (one still frame, an instant state change). Test it.
4. **Settings are data.** A guide's knobs (durations, easings, delays) live in its settings table and the code to copy
   follows them; nothing magic hard-coded in the view.
5. **Tokens only.** Colours, radii, shadows and type come from `@krizaka/tokens` / `@krizaka/tailwind`; dark **and** light
   are first-class (check both). Marks come from `@krizaka/ui`, icons from `@krizaka/icons` — never copied.
6. **Words in `messages/`** (`@krizaka/i18n`); the lab is English, the strings still live in the catalogue.
7. **Accessible:** keyboard, focus visible, screen reader names, no motion that carries meaning alone.
8. **Demo data says it is a demo.** No real person, no invented figure presented as real.

## Definition of done

- `pnpm test`, `pnpm typecheck` and `pnpm build` green; CI green before merge (squash, main is protected).
- Each change ships with its test (`tests/*.test.mjs`): a guide's settings, its reduced-motion path, its route.
- `pnpm check:gallery` passes when the gallery changes.
- The README's guide table still says what is true; a new guide gets its row and its address.
- Captures before/after (dark, light, phone width) go to Bunny (`krizaka-com/scripts/pr-assets.mjs`), never committed.
- Org standards: https://github.com/krizaka/.github (docs/standards). Commit trailer and PR body as the org asks.
