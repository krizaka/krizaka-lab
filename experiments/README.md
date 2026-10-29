# Experiments, by area

Krizaka Lab is organised by **area**, then by experiment. One folder per experiment, with a `README.md` that says what it
tests, its status and the issue or ADR it feeds.

| Area | What belongs here | Today |
| :--- | :--- | :--- |
| [`motion/`](motion/) | motion, canvas, springs, transitions on the one motion system | the first experiments, guides and scenarios (they moved in as they were) |
| [`java/`](java/) | Krizaka Java ideas: a building block, a Spring slice, a build trick | none yet |
| [`ai/`](ai/) | AI behaviour: prompts, evaluations, agent flows on Orazaka | none yet |
| [`ui/`](ui/) | components and compositions not yet in `@krizaka/ui` | none yet |
| [`data/`](data/) | data shapes, charts, maps, generated figures | none yet |

A new area is a pull request that adds its folder, its README and the entry in `tests/lab-structure.test.mjs`.

## Status of an experiment

`idea` · `prototype` · `promoted` · `dropped`. Nothing else.

- **idea**: written down, nothing runs.
- **prototype**: it runs here (a route of the site, a script, a test); not for any Krizaka site.
- **promoted**: it proved itself and moved into a real package (`@krizaka/ui`, krizaka-ts, Krizaka Java) by an ADR. The
  README says where; the code here stays as the record or is removed.
- **dropped**: tried, not worth keeping; the README says why, so nobody tries it again blind.

## The rules of the lab

1. **Nothing here is a product.** The lab publishes no package and no application; the site is a showcase of experiments.
2. **Nothing outside the lab imports from the lab.** A piece that proves itself is **promoted** by an ADR (rebuilt in its
   package with its tests), never imported from here. The org rule `lab-isolation` (krizaka/.github `docs/standards/rules.json`)
   checks every active repository.
3. The lab uses Krizaka libraries first (`@krizaka/ui`, `@krizaka/tokens`, `@krizaka/i18n`): an experiment is built on
   them, it does not copy them.

## An experiment's README

Copy [`TEMPLATE.md`](TEMPLATE.md). `npm test` (`tests/lab-structure.test.mjs`) refuses an experiment without a status
from the list above, without a `Feeds` link, or an area folder without its README.
