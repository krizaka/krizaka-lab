/* A guide's page (guides.tsx): the task as the title, the real screen that plays it with the settings beside it, the
   code that follows the settings (copy), the table of every option, what happens under reduced motion, and the other
   guides of the same screen. The settings live in the address, so a setup can be shared. */

import { CodeBlock } from "@krizaka/ui/code-block";
import { Chip } from "@krizaka/ui/chip";
import { DataTable } from "@krizaka/ui/data-table";
import { Caption } from "@krizaka/ui/footnote";
import { Section } from "@krizaka/ui/page";
import { PageHero } from "@krizaka/ui/page-hero";
import { Slider } from "@krizaka/ui/slider";
import { Switch } from "@krizaka/ui/switch";
import { useEffect, useMemo, useState } from "react";

import type { LabPage } from "../core/router";
import { useLab } from "./context";
import { type ConfigRow, type GuideId, guideById, guidesOf } from "./guides";
import { type Knob, type Values, defaults, readValues, writeValues } from "./playground-lib";
import { SCENARIOS } from "./scenarios";

function Setting({ knob, value, onChange }: { knob: Knob; value: string | number | boolean; onChange: (v: string | number | boolean) => void }) {
  if (knob.kind === "choice")
    return (
      <div className="lab-control">
        <span className="lab-control-label" aria-hidden>
          {knob.label}
        </span>
        <Chip.Group type="single" required size="sm" label={knob.label} value={String(value)} onValueChange={(v) => v && onChange(v)}>
          {knob.options.map((o) => (
            <Chip key={o} value={o}>
              {o}
            </Chip>
          ))}
        </Chip.Group>
      </div>
    );
  if (knob.kind === "range")
    return <Slider label={`${knob.label}${knob.unit ? ` (${knob.unit})` : ""}`} showLabel value={Number(value)} min={knob.min} max={knob.max} step={knob.step} onValueChange={(v) => onChange(v as number)} />;
  return (
    <label className="lab-switch">
      <Switch checked={Boolean(value)} onCheckedChange={onChange} label={knob.label} />
      <span aria-hidden>{knob.label}</span>
    </label>
  );
}

export function GuidePage({ id }: { id: GuideId }) {
  const { t, href, go } = useLab();
  const g = guideById(id);
  const scenario = SCENARIOS[g.scenario];
  const View = scenario.View;
  const initial = useMemo(() => defaults(g.knobs), [g]);
  const [values, setValues] = useState<Values>(() => readValues(g.knobs, typeof window === "undefined" ? "" : window.location.search));
  useEffect(() => writeValues(g.knobs, values), [g, values]);
  const others = guidesOf(g.scenario).filter((o) => o.id !== id);
  const link = (to: LabPage) => ({ href: href(to), onClick: go(to) });
  return (
    <>
      <PageHero eyebrow="Guide" title={g.title} lead={g.lead} back={{ href: href("home"), label: "All guides" }} linkAs={(props: React.ComponentProps<"a">) => <a {...props} onClick={go("home")} />}>
        <p className="lab-uses">
          Uses{" "}
          {g.uses.map((u, i) => (
            <span key={u.name}>
              {i ? " · " : ""}
              <a href={u.href}>{u.name}</a>
            </span>
          ))}
        </p>
      </PageHero>

      <Section id="screen" spacing="sm">
        <div className="lab-guide">
          <figure className="lab-guide-screen">
            <View v={values} motion={g.id} />
            <Caption figure="fig. 1">
              {scenario.title}, on <a {...link(g.scenario)}>its own page</a>. Every piece is @krizaka/ui; the data is a demo.
            </Caption>
          </figure>
          <div className="lab-guide-settings">
            <div className="lab-playground-head">
              <h2>Settings</h2>
              <button type="button" className="lab-link-button" onClick={() => setValues(initial)}>
                Reset
              </button>
            </div>
            <div className="lab-controls">
              {g.knobs.map((k) => (
                <Setting key={k.key} knob={k} value={values[k.key] ?? initial[k.key]!} onChange={(v) => setValues((prev) => ({ ...prev, [k.key]: v }))} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="code" title="Copy this" lead="It follows the settings above." headingSize="sm" divider>
        <CodeBlock code={g.snippet(values)} language="tsx" file={g.file} copyLabel="Copy" copiedLabel="Copied" />
        <p className="lab-sublead lab-guide-copy-note">
          {g.scenario === "wall" ? t.wall.previewNote : <>Once per app: <code>pnpm add @krizaka/ui</code>, then mount <code>&lt;MotionObserver /&gt;</code> from <code>@krizaka/ui/motion</code> and import <code>@krizaka/ui/motion.css</code>.</>}
        </p>
      </Section>

      <Section id="options" title="Options" headingSize="sm" divider>
        <DataTable<ConfigRow>
          caption={`Options for « ${g.title.toLowerCase()} »`}
          rows={[...g.config]}
          getRowId={(r) => r.option}
          density="compact"
          columns={[
            { id: "option", header: "Option", value: (r) => r.option, cell: (r) => <code>{r.option}</code> },
            { id: "type", header: "Type", value: (r) => r.type, cell: (r) => <code>{r.type}</code> },
            { id: "default", header: "Default", value: (r) => r.default },
            { id: "does", header: "What it does", value: (r) => r.does },
          ]}
        />
        <p className="lab-reduced">
          <strong>Under reduced motion.</strong> {g.reduced}
        </p>
      </Section>

      {others.length ? (
        <Section id="more" title="On the same screen" headingSize="sm" divider>
          <ul className="lab-guide-more">
            {others.map((o) => (
              <li key={o.id}>
                <a {...link(o.id)}>{o.title}</a>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}

export function ScenarioPage({ id }: { id: keyof typeof SCENARIOS }) {
  const { href, go } = useLab();
  const s = SCENARIOS[id];
  const View = s.View;
  const guides = guidesOf(id);
  return (
    <>
      <PageHero eyebrow={`Scenario · ${s.product}`} title={s.title} lead={s.lead} back={{ href: href("home"), label: "All scenarios" }} linkAs={(props: React.ComponentProps<"a">) => <a {...props} onClick={go("home")} />} />
      <Section id="screen" spacing="sm">
        <figure className="lab-scenario-screen">
          <View />
          <Caption figure="fig. 1">A real screen made of @krizaka/ui components, playing while it is on screen. The data is a demo.</Caption>
        </figure>
      </Section>
      <Section id="motion" title="The motion on this screen" lead="Each one is a guide: the same screen, its settings, the code to copy and every option." headingSize="sm" divider>
        <ol className="lab-guide-more">
          {guides.map((g) => (
            <li key={g.id}>
              <a href={href(g.id)} onClick={go(g.id)}>
                {g.title}
              </a>
              <span> — {g.lead}</span>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
