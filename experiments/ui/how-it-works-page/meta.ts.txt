import type { ComponentMeta } from "../meta";

export const meta = {
  title: "How-it-works page",
  summary: "How a product works, told in steps along a numbered line — each step its words beside its visual, the sides alternating on a wide screen.",
  status: "beta",
  category: "templates",
  domain: "page-blocks",
  platforms: "web",
  parity: { native: { status: "n/a", reason: "A whole page of a public site; a phone app's screens are built from Screen, Header and the native primitives." }, desktop: { status: "n/a", reason: "A public site's page, not a window of the Mac app." } },
  whenToUse: ["The journey of a request, an onboarding, an installation.", "Any process told in three to seven steps."],
  whenNotToUse: [
    { when: "For a product's overview." },
    { when: "For a step the user is on right now.", use: "stepper" },
  ],
  bestPractices: ["Three to seven steps; a step's title says what happens, in a few words.", "Each visual shows the step for real: a command, a schema, a screen.", "Words and content arrive as props; the motion is the platform's (`[data-reveal]`, still under reduced motion)."],
  accessibility: {
    keyboard: [],
    notes: ["The steps are an ordered list; each title an `h2`.", "The line and the numbers are decorative: the list says the order."],
  },
  related: ["stepper", "code-block"],
  web: {
    imports: ["HowItWorksPage"],
    examples: [
      { name: "orazaka", title: "Orazaka's journey", description: "Install, guard, answer — each with its command.", template: true, purpose: "explain", why: "A reader grasps a process as a few steps, each with the command that does it." },
    ],
  },
} satisfies ComponentMeta;
