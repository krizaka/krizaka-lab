# Iso, the isometric kit

- **Area:** ui
- **Status:** idea
- **Feeds:** [krizaka/krizaka-ui#837](https://github.com/krizaka/krizaka-ui/issues/837) (ADR-008: keep what is used, leave the rest to the lab)
- **Where it lives:** `experiments/ui/iso/*.txt` (plain text: nothing here is compiled, imported or published)

## What it tests

Whether an isometric hero (`IsoHub`: a luminous object with satellites and flows, static SVG animated by CSS) earns a place
in `@krizaka/ui` again. It was the hero of the product pages on dev.orazaka.com, which no longer use it.

## Result

Parked, decide later. Moved out of `@krizaka/ui/iso` unchanged (source, stories, test, the four examples, and the
`.kz-iso-*` block of `motion.css`), so nothing is lost. To bring it back, rebuild it in the package from a filed need
(ADR-006 §7), with its tests; nothing outside the lab imports these files (rule `lab-isolation`).
