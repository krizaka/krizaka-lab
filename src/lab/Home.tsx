/* The lab's home, by task (krizaka-ui#434: « docs unclear, impractical UX, too AI »): one line of what it is and the two
   lines that set it up, then the guides — one task each, on a real screen — the scenarios they play on (four app screens
   made of @krizaka/ui), and, last and quiet, where the components and the experiments are. The canvas studies live on
   their own page (Experiments): they are the lab's drawings, not what an app ships. */

import { Studies } from "./studies";
import { CardGrid } from "@krizaka/ui/card-grid";
import { CodeBlock } from "@krizaka/ui/code-block";
import { LinkCard } from "@krizaka/ui/link-card";
import { PageIndex } from "@krizaka/ui/page-index";
import { Facts, Section } from "@krizaka/ui/page";
import { PageHero } from "@krizaka/ui/page-hero";

import { type LabPage, SCENARIO_PATHS, TAB_ORDER, type TabId } from "../core/router";
import { useLab } from "./context";
import { DEMOS } from "./demos";
import { GUIDES } from "./guides";
import { SCENARIOS } from "./scenarios";

const SETUP = 'pnpm add @krizaka/ui\n\n// once, at the root of the app\nimport { MotionObserver } from "@krizaka/ui/motion";\nimport "@krizaka/ui/motion.css";\n\n<MotionObserver />';

export function Home() {
  const { t, href, go } = useLab();
  const as = (to: LabPage) => (props: React.ComponentProps<"a">) => <a {...props} onClick={go(to)} />;
  const byScenario = SCENARIO_PATHS.map((id) => ({
    title: SCENARIOS[id].title,
    entries: GUIDES.filter((g) => g.scenario === id).map((g) => ({ label: g.title, href: href(g.id), page: String(GUIDES.indexOf(g) + 1).padStart(2, "0") })),
  }));
  return (
    <>
      <PageHero eyebrow="Krizaka Lab" title="Motion for Krizaka UI, by task." lead="Each guide answers one thing you want to animate, on a real app screen made of @krizaka/ui: the screen plays it, the settings change it, the code follows, every option is in the table. Krizaka Lab is where the family tries things (UI, motion, Java, AI, data): an entry is an experiment with a status, and nothing here is a product.">
        <CodeBlock code={SETUP} language="tsx" file="App.tsx" copyLabel={t.demo.copy} copiedLabel={t.demo.copied} />
      </PageHero>

      <Section id="guides" number="§ 1" title="Guides" lead="Pick the task; each opens on its screen.">
        <PageIndex
          label="Guides"
          groups={byScenario}
          linkAs={(props: React.ComponentProps<"a">) => {
            const to = GUIDES.find((g) => href(g.id) === props.href)?.id;
            return <a {...props} onClick={to ? go(to) : undefined} />;
          }}
        />
      </Section>

      <Section id="scenarios" number="§ 2" title="Scenarios" lead="Four app screens built only from @krizaka/ui components, with every motion they use." divider>
        <CardGrid as="ul" min={260} columns={2}>
          {SCENARIO_PATHS.map((id) => {
            const s = SCENARIOS[id];
            const View = s.View;
            return (
              <LinkCard
                key={id}
                href={href(id)}
                title={s.title}
                meta={s.product}
                description={s.lead}
                cta="Open the screen"
                extra={
                  <div className="lab-preview lab-preview-screen" inert aria-hidden>
                    <View />
                  </div>
                }
                linkAs={as(id)}
              />
            );
          })}
        </CardGrid>
      </Section>

      <Section id="more" number="§ 3" title="Also here" divider>
        <ul className="lab-guide-more">
          <li>
            <a href={href("kz-ui")} onClick={go("kz-ui")}>
              {t.bar.gallery}
            </a>
            <span> — {t.demos["kz-ui"].card}</span>
          </li>
          {(["journey", "overlays", "people"] as const).map((id) => (
            <li key={id}>
              <a href={href(id)} onClick={go(id)}>
                {t.demos[id].name}
              </a>
              <span> — {t.demos[id].card}</span>
            </li>
          ))}
          <li>
            <a href={href("experiments")} onClick={go("experiments")}>
              Experiments
            </a>
            <span> — the lab's canvas studies (a HUD, liquid glass, a neural lattice) and the first engine flow.</span>
          </li>
        </ul>
      </Section>
    </>
  );
}

/** The canvas studies: the lab's drawings, kept apart from what an app ships. */
export function Experiments() {
  const { t, href, go } = useLab();
  const ids = TAB_ORDER.filter((id): id is TabId => ["orazaka", "jarvis", "caustics", "lattice"].includes(id));
  return (
    <>
      <PageHero eyebrow="Krizaka Lab" title="Experiments" lead="Canvas studies: what the motion system can draw before a piece of it moves into Krizaka UI as SVG and CSS. Krizaka sites use no canvas." back={{ href: href("home"), label: "Guides" }} linkAs={(props: React.ComponentProps<"a">) => <a {...props} onClick={go("home")} />} />
      <Section id="studies" spacing="sm">
        <CardGrid as="ul" min={300} columns={3}>
          {ids.map((id) => {
            const d = t.demos[id];
            const Preview = DEMOS[id].Preview;
            return (
              <LinkCard
                key={id}
                href={href(id)}
                title={d.name}
                meta={d.eyebrow}
                description={d.card}
                cta={t.home.open}
                extra={
                  <>
                    <div className="lab-preview" data-motion-scope="" inert aria-hidden>
                      <Preview />
                    </div>
                    <Facts items={[id === "orazaka" ? { label: t.home.shipped, tone: "ok" } : { label: t.home.experimental, tone: "wip" }]} />
                  </>
                }
                linkAs={(props: React.ComponentProps<"a">) => <a {...props} onClick={go(id)} />}
              />
            );
          })}
        </CardGrid>
      </Section>
      <Studies />
    </>
  );
}
