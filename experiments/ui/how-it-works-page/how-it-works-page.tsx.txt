// Server-safe. How a product works, told in steps (blocks.css `.kz-tpl-timeline`): the hero, then a numbered line
// down the page — each step its words beside its visual (a command, a schema, a screen), the sides alternating on a
// wide screen, one column on a phone — then what is under the hood and the closing call.
import { CtaPanel } from "@krizaka/ui/cta-panel";
import { Section } from "@krizaka/ui/page";
import type { LinkComponent } from "@krizaka/ui/page-hero";
import { PageHero } from "@krizaka/ui/page-hero";
import type * as React from "react";

import { cn } from "../cn";

export interface HowStep {
  /** A stable key (the step's anchor). */
  id: string;
  /** What happens, in a few words. */
  title: React.ReactNode;
  /** How, in two or three sentences. */
  text: React.ReactNode;
  /** Beside the words: a code block, a schema, a screen. */
  visual?: React.ReactNode;
}

export type HowItWorksPageProps = Omit<React.HTMLAttributes<HTMLElement>, "title"> & {
  /** The brand the page wears (`.brand-<id>`). */
  brand?: string;
  /** The way back to the product. */
  back?: { href: string; label: string };
  /** A mono line above the title. */
  eyebrow?: React.ReactNode;
  /** The page's `h1`. */
  title: React.ReactNode;
  /** One or two sentences under it. */
  lead?: React.ReactNode;
  /** Beside the hero: the page's bird or an illustration. */
  aside?: React.ReactNode;
  /** The steps' accessible name (`The steps`). */
  stepsLabel: string;
  /** The steps, in order. */
  steps: readonly HowStep[];
  /** After the steps: architecture, guarantees, a module map. */
  children?: React.ReactNode;
  /** The closing call. */
  closing?: { title: React.ReactNode; body?: React.ReactNode; actions: React.ReactNode };
  /** The app's link component (Next's `Link`). */
  linkAs?: LinkComponent;
};

/** How a product works: the hero, a numbered timeline of steps with their visuals, then the details. */
export function HowItWorksPage({ brand, back, eyebrow, title, lead, aside, stepsLabel, steps, closing, linkAs, className, children, ...props }: HowItWorksPageProps) {
  return (
    <div className={cn(brand && "brand-" + brand, className)} {...props}>
      <PageHero back={back} linkAs={linkAs} eyebrow={eyebrow} title={title} lead={lead} aside={aside} />
      <Section aria-label={stepsLabel}>
        <ol className="kz-tpl-timeline">
          {steps.map((step, i) => (
            <li key={step.id} id={step.id} className="kz-tpl-step" data-reveal="">
              <span className="kz-tpl-step-n" aria-hidden>
                {i + 1}
              </span>
              <div className="kz-tpl-step-text">
                <h2>{step.title}</h2>
                <p>{step.text}</p>
              </div>
              {step.visual && <div className="kz-tpl-step-visual">{step.visual}</div>}
            </li>
          ))}
        </ol>
      </Section>
      {children}
      {closing && (
        <Section spacing="sm" aria-labelledby="how-closing">
          <CtaPanel id="how-closing" title={closing.title} body={closing.body} reveal>
            {closing.actions}
          </CtaPanel>
        </Section>
      )}
    </div>
  );
}
