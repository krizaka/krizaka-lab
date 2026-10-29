import type { ComponentMeta } from "../meta";

export const meta = {
  title: "Meta row",
  summary: "One quiet line of facts about a thing, separated by dots, with optional status chips at its end: the line under a title.",
  status: "beta",
  category: "data-display",
  domain: "data-display",
  platforms: "both",
  parity: { desktop: "web" },
  whenToUse: [
    "Under a video's, an article's or a listing's title: quality, shape, duration, date.",
    "When the facts are a few short values that read in one glance, with at most a status chip or two (“Encoding”, “AI-generated”).",
  ],
  whenNotToUse: [
    { when: "For facts that need a term beside their value, or more than a handful.", use: "description-list" },
    { when: "For a status alone.", use: "badge" },
  ],
  bestPractices: [
    "Pass every fact translated and already formatted; skip a fact you do not know rather than showing a dash (empty values are dropped for you).",
    "Keep it to five facts and one line on a phone; the line wraps, never scrolls.",
    "Put only the exceptional on the chips (“Encoding” when it is not ready): a state that is always true is noise.",
    "Detail beyond the line goes in a disclosure under it, not in more facts.",
  ],
  accessibility: {
    keyboard: [{ keys: "Tab", action: "The row is not a stop; only an interactive chip inside it is." }],
    notes: [
      "A real list (`ul` / `li`): the dots are `aria-hidden`, a screen reader hears “list, 5 items”. Give it `aria-label` when its subject is not obvious.",
      "On a phone: a native `list` with the same items; the dots are decorative and hidden from the screen reader.",
    ],
  },
  related: ["description-list", "badge", "chip-link"],
  web: {
    imports: ["MetaRow"],
    examples: [
      { name: "video", title: "Under a video", description: "Quality, shape, duration, frame rate and date, with an AI badge at the end." },
      { name: "status", title: "With a status", description: "A chip after the facts while the video is still encoding." },
    ],
  },
  native: {
    imports: ["MetaRow"],
    differences: ["Same API; the line wraps in a `View` and the dots are hidden from the screen reader."],
    examples: [{ name: "video", title: "Under a video", description: "Quality, shape, duration and date, with a badge at the end." }],
  },
} satisfies ComponentMeta;
