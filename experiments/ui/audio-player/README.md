# AudioPlayer, a sound you seek on

- **Area:** ui
- **Status:** idea
- **Feeds:** [krizaka/krizaka-ui#837](https://github.com/krizaka/krizaka-ui/issues/837) (ADR-008: keep what is used, leave the rest to the lab)
- **Where it lives:** `experiments/ui/audio-player/**/*.txt` (plain text: nothing here is compiled, imported or published)

## What it tests

Whether an `AudioPlayer` (a seekable waveform from server peaks or Web Audio, play, time and speed, paused off screen) earns a place in `@krizaka/ui` again. It served voice notes and generated speech.

## Result

Parked, decide later. Moved out of `@krizaka/ui/audio-player` unchanged (source, stories, tests, meta and examples), so nothing is lost. To
bring it back, rebuild it in the package from a filed need (ADR-006 §7), with its tests; nothing outside the lab imports
these files (rule `lab-isolation`).
