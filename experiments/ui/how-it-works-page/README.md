# HowItWorksPage, a numbered timeline

- **Area:** ui
- **Status:** idea
- **Feeds:** [krizaka/krizaka-ui#837](https://github.com/krizaka/krizaka-ui/issues/837) (ADR-008: keep what is used, leave the rest to the lab)
- **Where it lives:** `experiments/ui/how-it-works-page/**/*.txt` (plain text: nothing here is compiled, imported or published)

## What it tests

Whether a `HowItWorksPage` template (a numbered timeline of the steps, the visuals alternating) earns a place in `@krizaka/ui` again.

## Result

Parked, decide later. Moved out of `@krizaka/ui/how-it-works-page` unchanged (source, stories, tests, meta and examples), so nothing is lost. To
bring it back, rebuild it in the package from a filed need (ADR-006 §7), with its tests; nothing outside the lab imports
these files (rule `lab-isolation`).
