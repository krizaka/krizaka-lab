/* One demo's page: PageHero (the way back to the demos), the stage with its settings, its usage, its status. */

import { CodeBlock } from "@krizaka/ui/code-block";
import { Facts, Section } from "@krizaka/ui/page";
import { PageHero } from "@krizaka/ui/page-hero";

import type { TabId } from "../core/router";
import { useLab } from "./context";
import { DEMOS } from "./demos";

export function DemoPage({ id }: { id: TabId }) {
  const { t, href, go } = useLab();
  const d = t.demos[id];
  const demo = DEMOS[id];
  const Stage = demo.Stage;
  return (
    <>
      <PageHero
        eyebrow={d.eyebrow}
        title={d.title}
        lead={d.lead}
        back={{ href: href("home"), label: t.demo.back }}
        linkAs={(props: React.ComponentProps<"a">) => <a {...props} onClick={go("home")} />}
      >
        <p className="lab-whatfor">
          <strong>{t.demo.whatFor} · </strong>
          {d.card}
        </p>
        <Facts
          items={[demo.lab ? { label: t.home.experimental, tone: "wip" } : { label: t.home.shipped, tone: "ok" }]}
        />
      </PageHero>
      <Section id="stage" spacing="sm">
        <Stage />
      </Section>
      {demo.usage && (
        <Section
          id="usage"
          title={t.demo.usage}
          lead={demo.lab ? t.demo.usageLead : undefined}
          headingSize="sm"
          divider
        >
          <CodeBlock
            code={demo.usage.code}
            language="tsx"
            file={demo.usage.file}
            copyLabel={t.demo.copy}
            copiedLabel={t.demo.copied}
          />
          {demo.lab && <p className="lab-status">{t.demo.statusLab}</p>}
        </Section>
      )}
    </>
  );
}
