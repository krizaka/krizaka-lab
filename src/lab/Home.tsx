/* The lab's home: who it is (PageHero), the demos as cards with a live preview each (CardGrid + LinkCard), and what has
   already moved into Krizaka UI (the engine flow, with its usage). */

import { ExternalIcon, ForwardIcon } from "@krizaka/icons";
import { Button } from "@krizaka/ui/button";
import { CardGrid } from "@krizaka/ui/card-grid";
import { CodeBlock } from "@krizaka/ui/code-block";
import { LinkCard } from "@krizaka/ui/link-card";
import { Facts, Section } from "@krizaka/ui/page";
import { PageHero } from "@krizaka/ui/page-hero";

import { TAB_ORDER, type TabId } from "../core/router";
import { useLab } from "./context";
import { DEMOS, ENGINE_FLOW_USAGE } from "./demos";

const CARDS: TabId[] = TAB_ORDER.filter((id) => id !== "architecture");

export function Home() {
  const { t, href, go } = useLab();
  const h = t.home;
  return (
    <>
      <PageHero eyebrow={h.eyebrow} title={h.title} lead={h.lead} align="center">
        <div className="lab-actions">
          <Button asChild variant="primary" size="lg">
            <a href={href("orazaka")} onClick={go("orazaka")}>
              {h.primary} <ForwardIcon size={16} />
            </a>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a href={href("kz-ui")} onClick={go("kz-ui")}>
              {h.galleryCta}
            </a>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <a href="https://github.com/krizaka/krizaka-motion">
              {h.source} <ExternalIcon size={14} />
            </a>
          </Button>
        </div>
      </PageHero>

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
