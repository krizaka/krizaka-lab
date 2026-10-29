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

## Before you open or update a pull request (coding agents)

These are the defects code review found most often on 2026-10-23. Check them yourself before you open or update a pull request:
1. **Checks:** run the repository's full check (lint, typecheck, tests, build) and fix it. Never push a red check.
2. **Concurrency:** any « count then insert » or « check then write » runs in one transaction with a lock, and has a concurrency test.
3. **One gate:** a rule (limit, permission, validation) is enforced in the service, so no route can skip it. Test every route.
4. **Errors:** a cleanup (ROLLBACK, DROP, close) never masks the original error. Rethrow it, or throw an `AggregateError` with the original first.
5. **Validation:** validate the original input, never a truncated or pre-trimmed copy. Server and client reject the same inputs.
6. **Accessibility:**
   - every control has a unique label;
   - focus rings are never clipped by `overflow`;
   - text never overflows its box at 360 px.
7. **Naming:** environment variables follow `<CONTEXT>_<THING>` (`APP_`, `DATABASE_`, `AUTH_`, `MEDIA_`, `MAIL_`, `PAYMENTS_`, `AI_`…) and are declared once.
8. **Words:** every user-facing string is in `messages/en.json` (the lab is English-only, rule 6), and no colour is hard-coded.
9. **Review threads:** answer every one. Fix it test-first, or reply with the reason, then resolve it.

## 9. Anti-slop (ADR-015)

What a model tends to write and the code does not need. Each line points at the rule that refuses it
([ADR-015](https://github.com/krizaka/.github/blob/main/docs/adr/ADR-015-ai-code-audit-measured-and-enforced.md), [docs/standards/guards.md](https://github.com/krizaka/.github/blob/main/docs/standards/guards.md)).

1. **No defensive null on `@NullMarked` code.** No `Objects.requireNonNull` or `if (x == null)` on a value the type already
   guarantees. Enforced by NullAway at compile time; a new package is `@NullMarked` (ArchUnit).
2. **A closed set is a type.** An enum, a sealed interface or an `as const` object, never a string compared by hand;
   strategies are a `Map<Kind, Strategy>` built once at startup. Enforced by PMD / ArchUnit (Java) and `no-enum-string-compare` (ast-grep).
3. **HTTP in Java is a DTO record, `@Valid` and `ProblemDetail`.** No `Map.of("error", …)`, no entity in a response, one
   `@RestControllerAdvice` per service. Enforced by ArchUnit.
4. **No `*Utils`, `*Helper` or `*Manager`.** Name the thing by what it does (§4). Enforced by ArchUnit (ADR-015 §5).
5. **`?.` and `??` in TypeScript**, not a chain of `&&` or a ternary on null. The target rules are `@typescript-eslint/prefer-optional-chain` and `prefer-nullish-coalescing`; they are not in `@krizaka/config` yet.
6. **The build is the judge.** Compile, lint and test before every push; `krizaka-edit-check` runs on each edit (below) and
   NullAway and ArchUnit run at pre-push and in CI. A rule is never silenced to get green.

**The edit hook.** Every repository adds this to `.claude/settings.json`. After each `Edit` or `Write`, the one file is
checked in under 10 s: ESLint with the repository's config for TypeScript, PMD with the Krizaka rules for Java (never Maven).
A finding comes back to the agent (exit 2); a timeout is silent.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "npx --yes -p @krizaka/config krizaka-edit-check", "timeout": 10 }]
      }
    ]
  }
}
```

In a TypeScript repository that already depends on `@krizaka/config`, use `npx --no-install krizaka-edit-check` (no download).
