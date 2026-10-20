/* The lab's home: who it is (PageHero), the demos as cards with a live preview each (CardGrid + LinkCard), and what has
   already moved into Krizaka UI (the engine flow, with its usage). */

import { ExternalIcon, ForwardIcon } from "@krizaka/icons";
import { Button } from "@krizaka/ui/button";
import { CardGrid } from "@krizaka/ui/card-grid";
import { CodeBlock } from "@krizaka/ui/code-block";
import { LinkCard } from "@krizaka/ui/link-card";
import { Facts, Section } from "@krizaka/ui/page";

import { TAB_ORDER, type TabId } from "../core/router";
import { useLab } from "./context";
import { DEMOS, ENGINE_FLOW_USAGE } from "./demos";
import { Hero } from "./hero";

const CARDS: TabId[] = TAB_ORDER.filter((id) => id !== "architecture");

export function Home() {
  const { t, href, go } = useLab();
  const h = t.home;
  return (
    <>
      <Hero />

      <Section id="start" eyebrow="Use it" title="Three steps, then it is yours." lead="Everything on this page is @krizaka/ui: nothing to copy from the lab.">
        <ol className="lab-steps">
          <li>
            <strong>Install</strong>
            <CodeBlock code="pnpm add @krizaka/ui" language="bash" copyLabel={t.demo.copy} copiedLabel={t.demo.copied} />
          </li>
          <li>
            <strong>Mount the conductor once</strong>
            <CodeBlock code={'import { MotionObserver } from "@krizaka/ui/motion";\nimport "@krizaka/ui/motion.css";\n\n<MotionObserver />'} language="tsx" copyLabel={t.demo.copy} copiedLabel={t.demo.copied} />
          </li>
          <li>
            <strong>Use a primitive and tune it</strong>
            <CodeBlock code={'import { EngineFlow } from "@krizaka/ui/engine-flow";\n\n<EngineFlow label="…" hub={hub} nodes={nodes} density="dense" />'} language="tsx" copyLabel={t.demo.copy} copiedLabel={t.demo.copied} />
          </li>
        </ol>
        <p className="lab-sublead">
          Read the <a href="https://ui.krizaka.com/foundations/motion">Motion foundation</a> and browse <a href="https://ui.krizaka.com/components">every component</a> on ui.krizaka.com.
        </p>
      </Section>

      <Section id="demos" eyebrow={h.demosEyebrow} title={h.demosTitle} lead={h.demosLead}>
        <CardGrid as="ul" min={300} columns={3}>
          {CARDS.map((id) => {
            const d = t.demos[id];
            const Preview = DEMOS[id].Preview;
            return (
              <LinkCard
                key={id}
                href={href(id)}
                title={d.name}
                meta={d.eyebrow}
                description={d.card}
                cta={h.open}
                extra={
                  <>
                    <div className="lab-preview" data-motion-scope="" inert aria-hidden>
                      <Preview />
                    </div>
                    <Facts items={[id === "kz-ui" || id === "orazaka" ? { label: h.shipped, tone: "ok" } : { label: h.experimental, tone: "wip" }]} />
                  </>
                }
                linkAs={(props: React.ComponentProps<"a">) => <a {...props} onClick={go(id)} />}
              />
            );
          })}
        </CardGrid>
      </Section>

      <Section id="shipped" eyebrow={h.shippedEyebrow} title={h.shippedTitle} lead={h.shippedLead} divider
        actions={
          <Button asChild variant="secondary">
            <a href="https://ui.krizaka.com/components/engine-flow">
              {h.shippedCta} <ForwardIcon size={14} />
            </a>
          </Button>
        }
      >
        <CodeBlock code={ENGINE_FLOW_USAGE} language="tsx" file="EngineFlow.tsx" copyLabel={t.demo.copy} copiedLabel={t.demo.copied} />
      </Section>
    </>
  );
}
