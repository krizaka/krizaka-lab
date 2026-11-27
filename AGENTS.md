# krizaka-lab — agent contract

<!-- krizaka-agents-template v2: rendered from krizaka/.github docs/standards/agents-template.md (scripts/agents-md.mjs). The one AGENTS.md standard: six sections in this order, at most 150 lines, bullets and imperatives. The conformance check « agents-template » reads the headings, the length and CLAUDE.md. Detail goes to docs/ via References, not here. -->

## Project context

- **Krizaka Lab**, the family's lab for UI, motion, Java, AI and data experiments (it was the motion lab; `motion.krizaka.com` answers 301 to `lab.krizaka.com`, krizaka-motion#69). Live at https://lab.krizaka.com/.
- It is **a lab, not a package or a product**: nothing here is published on npm. Kind: `npm` · team: `krizaka` · registry entry: [repos.json](https://github.com/krizaka/.github/blob/main/repos.json).
- Experiments live in `experiments/<area>/<name>/`, a README each (status `idea` · `prototype` · `promoted` · `dropped`, and the issue or ADR it feeds).
- **Nothing outside the lab imports from the lab** (org rule `lab-isolation`): a piece that proves itself is promoted into a real package by an ADR.
- The site holds the motion area today: guides (one motion task each, played on a real app screen made of `@krizaka/ui`), the four scenarios (dashboard, chat, checkout, delivery) and the canvas experiments.
- Read this file first. `CLAUDE.md` is the one line `@AGENTS.md`: never a second copy of it.

## Essential commands

- `pnpm install --frozen-lockfile`: install (`packageManager` is `pnpm@10.34.6`).
- `pnpm dev`: Vite dev server. `pnpm preview`: serve `dist-demo`.
- `pnpm test`: `node --test tests/*.test.mjs`.
- `pnpm typecheck`: `tsc --noEmit`.
- `pnpm build`: `vite build --outDir dist-demo`, then `scripts/generate-routes.mjs` (one folder per route, `404.html` SPA fallback, `sitemap.xml`).
- `pnpm lint` (= `pnpm format:check`, Prettier) and `pnpm format` to fix.
- `pnpm check:gallery`: run when the gallery changes. `pnpm check:budget`: no `requestAnimationFrame` outside `src/core` and `src/native`.
- `pnpm lint:workspace`: `krizaka-workspace-guard` from `@krizaka/config`.
- `pnpm exec krizaka-i18n check messages`: the catalogue is complete (CI runs it in `scripts/ci-after-build.sh`).
- The browser checks CI runs after the build (`scripts/ci-after-build.sh`, the same file is the list): `pnpm build`, then `pnpm exec vite preview --outDir dist-demo --port 4173 --strictPort` in one shell, and in another `node scripts/check-motion.mjs`, `check-demos.mjs`, `check-cards.mjs`, `check-experiments.mjs`, `check-studies.mjs` (each `--base http://localhost:4173`) and `CHECKOUT_BASE=http://localhost:4173 node --test tests/checkout-browser.test.mjs`. Run the ones that touch what you changed.
- Run them on what you changed before every push; CI runs the rest.

## Architecture & conventions

- Follow the [krizaka-engineering skill](https://github.com/krizaka/krizaka-agents/blob/main/plugins/krizaka-engineering/skills/krizaka-engineering/SKILL.md); search its [packages reference](https://github.com/krizaka/krizaka-agents/blob/main/plugins/krizaka-engineering/skills/krizaka-engineering/references/packages.md) before writing anything generic.
- **Krizaka UI first.** A screen is composed of `@krizaka/ui` components (Stepper, StepProgress, Button, Toast, DataTable, Sparkline, NumberTicker, PageTransition, EngineFlow…), never hand-made look-alikes. A motion or component that proves itself moves into krizaka-ui (registry page, examples, stories, tests, its `AGENTS.md`), then is used here.
- **One motion system: @krizaka/ui's.** `MotionObserver`, `reveal`, `PageTransition`, `data-offscreen` (paused off screen), `html[data-motion]` (held while the page settles), `magnetic`. No animation library, no permanent `requestAnimationFrame` outside `src/core` experiments, no second conductor.
- **Settings are data.** A guide's knobs (durations, easings, delays) live in its settings table and the code to copy follows them; nothing magic hard-coded in the view.
- **Tokens only.** Colours, radii, shadows and type come from `@krizaka/tokens` / `@krizaka/tailwind`; dark **and** light are first-class (check both). Marks come from `@krizaka/ui`, icons from `@krizaka/icons` — never copied.
- **Words in `messages/`** (`@krizaka/i18n`): the lab is English, the strings still live in the catalogue (`messages/en.json`).
- Take libraries first: a missing function goes into the `@krizaka/*` package first, never a local copy.
- Name things by what they do; no `*Utils`, `*Helper`, `*Manager`.
- A closed set is a type (enum, sealed interface, `as const` object), never a string compared by hand.
- Use `?.` and `??` in TypeScript, not a chain of `&&` or a ternary on null.
- Hierarchy: this root file holds the rules of the whole repository; a sub-folder with its own rules adds a local `AGENTS.md` that says only what differs there. The nearest file wins.

## Guard-rails & known pitfalls (read before coding)

- **Reduced motion is designed, not dropped.** Every guide says what happens under `prefers-reduced-motion` and the page still makes sense (one still frame, an instant state change). Test it.
- **Accessible:** keyboard, focus visible, screen reader names, no motion that carries meaning alone. Every control has a unique label; focus rings are never clipped by `overflow`; text never overflows its box at 360 px.
- **Demo data says it is a demo.** No real person, no invented figure presented as real.
- A new route goes into `ROUTES` of `scripts/generate-routes.mjs`, or its static folder and sitemap entry are missing.
- Pin `playwright` exactly (`tests/playwright-version.test.mjs` guards it); the lab Sonar guards are in `tests/lab-sonar-guards.test.mjs`.
- The checks are the judge ([ADR-015](https://github.com/krizaka/krizaka-internal/blob/main/docs/adr/.github/ADR-015-ai-code-audit-measured-and-enforced.md), [guards](https://github.com/krizaka/.github/blob/main/docs/standards/guards.md)): never `--no-verify`, never a new `eslint-disable`, never a raised ratchet or baseline; a rule is never silenced to get green.
- Anti-slop: no defensive null on a value the type already guarantees (`@NullMarked` Java: NullAway, ArchUnit); Java HTTP is a DTO record, `@Valid` and `ProblemDetail`, no `Map.of("error", …)`, no entity in a response.
- Concurrency: any « count then insert » or « check then write » runs in one transaction with a lock, and has a concurrency test.
- One gate: a rule (limit, permission, validation) is enforced in the service, so no route can skip it; test every route.
- Errors: a cleanup (ROLLBACK, DROP, close) never masks the original error; rethrow it, or throw an `AggregateError` with the original first.
- Validation: validate the original input, never a truncated or pre-trimmed copy; server and client reject the same inputs.
- Environment variables follow `<CONTEXT>_<THING>` (`APP_`, `DATABASE_`, `AUTH_`, `MEDIA_`, `MAIL_`, `PAYMENTS_`, `AI_`…) and are declared once.
- No colour is hard-coded and no user-facing string lives outside `messages/en.json`.
- Start a fix with a failing test; every bug gets its guard.
- Never invent a URL, a law article, a price or a figure you did not read; write `TO VALIDATE` and say who decides.
- Never commit a secret, a capture or a log; no production data in a session, only the dev data.
- Keep the edit hook in `.claude/settings.json`: `npx --no-install krizaka-edit-check` on `Edit|Write`.

## Expected validation workflow

- [ ] `pnpm test`, `pnpm typecheck`, `pnpm lint` and `pnpm build` are green; fix the cause of a red, never the guard.
- [ ] Each change ships with its test (`tests/*.test.mjs`): a guide's settings, its reduced-motion path, its route.
- [ ] `pnpm check:gallery` passes when the gallery changes.
- [ ] The README's guide table still says what is true; a new guide gets its row and its address.
- [ ] Captures before/after (dark, light, phone width) go to Bunny (`krizaka-com/scripts/pr-assets.mjs`), never committed.
- [ ] Every review thread is answered: fix it test-first, or reply with the reason, then resolve it.
- [ ] One issue, one small PR; CI green before merge (squash, `main` is protected).

## References

- [README.md](README.md): the guide table and addresses.
- [docs/adr](docs/adr): the lab's decision records index (`scripts/check-budget.mjs` cites ADR-001 §6 and ADR-008 §6).
- [Org standards](https://github.com/krizaka/.github/tree/main/docs/standards) of krizaka/.github; the [engineering charter](https://github.com/krizaka/.github/blob/main/AGENTS.template.md).
- [krizaka-engineering skill](https://github.com/krizaka/krizaka-agents/blob/main/plugins/krizaka-engineering/skills/krizaka-engineering/SKILL.md).
