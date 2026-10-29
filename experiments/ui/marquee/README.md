# Marquee, a band that slides

- **Area:** ui
- **Status:** idea
- **Feeds:** [krizaka/krizaka-ui#837](https://github.com/krizaka/krizaka-ui/issues/837) (ADR-008: keep what is used, leave the rest to the lab)
- **Where it lives:** `experiments/ui/marquee/**/*.txt` (plain text: nothing here is compiled, imported or published)

## What it tests

Whether a `Marquee` (a band of logos or short quotes that slides at a speed, pauses for the reader and stays a still row under reduced motion; its `kz-marquee` / `kz-band` motion CSS is kept in `marquee.motion.css.txt`) earns a place in `@krizaka/ui` again.

## Result

Parked, decide later. Moved out of `@krizaka/ui/marquee` unchanged (source, stories, tests, meta and examples), so nothing is lost. To
bring it back, rebuild it in the package from a filed need (ADR-006 §7), with its tests; nothing outside the lab imports
these files (rule `lab-isolation`).
