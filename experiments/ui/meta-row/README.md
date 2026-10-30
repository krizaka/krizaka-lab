# MetaRow, the quiet line of facts

- **Area:** ui
- **Status:** idea
- **Feeds:** [krizaka/krizaka-ui#837](https://github.com/krizaka/krizaka-ui/issues/837) (ADR-008: keep what is used, leave the rest to the lab)
- **Where it lives:** `experiments/ui/meta-row/**/*.txt` (plain text: nothing here is compiled, imported or published)

## What it tests

Whether a `MetaRow` (one line of dot-separated facts with status chips at its end, a real list with the dots hidden from
assistive technology) earns a place in `@krizaka/ui` again. It sat under a video's title: quality, shape, duration, date.

## Result

Parked, decide later. Moved out of `@krizaka/ui/meta-row` and out of `@krizaka/ui/native` unchanged (web source, native
source, stories, tests and the three examples), so nothing is lost. To bring it back, rebuild it in the package from a
filed need (ADR-006 §7), with its tests; nothing outside the lab imports these files (rule `lab-isolation`).
