/// <reference types="vite/client" />
/* The notebook studies: native web motion, one card each — the live demo, what it does, what it uses, what happens under
   reduced motion, and the exact code (the demo's own files, printed). Words: messages → studies.*. */

import { CodeBlock } from "@krizaka/ui/code-block";
import { Facts, Section } from "@krizaka/ui/page";
import type { ComponentType } from "react";

import { useLab } from "./context";
import { STUDIES, type StudyId } from "./studies-data";

const live = import.meta.glob<{ Example: ComponentType }>("./studies/*.tsx", { eager: true });
const tsx = import.meta.glob<string>("./studies/*.tsx", { eager: true, query: "?raw", import: "default" });
const css = import.meta.glob<string>("./studies/*.css", { eager: true, query: "?raw", import: "default" });

export function Studies() {
  const { t } = useLab();
  const s = t.studies;
  return (
    <Section id="studies-notebook" eyebrow={s.eyebrow} title={s.title} lead={s.lead} headingSize="sm" divider>
      <ul className="lab-gallery">
        {STUDIES.map(({ id, api }) => {
          const w = s.items[id as StudyId];
          const Live = live[`./studies/${id}.tsx`]!.Example;
          const code = `${tsx[`./studies/${id}.tsx`]!.trimEnd()}\n\n/* ${id}.css */\n${css[`./studies/${id}.css`]!.trimEnd()}`;
          return (
            <li key={id} id={id} className="lab-g-item" data-study={id}>
              <div className="lab-g-live">
                <Live />
              </div>
              <div className="lab-g-text">
                <h3>{w.title}</h3>
                <p>{w.what}</p>
                <Facts items={[{ label: s.status, tone: "wip" }]} />
                <dl>
                  <dt>{s.uses}</dt>
                  <dd>
                    {api.map((a) => (
                      <code key={a}>{a}</code>
                    ))}
                  </dd>
                  <dt>{t.gallery.reduced}</dt>
                  <dd>{w.reduced}</dd>
                </dl>
                <CodeBlock code={code} language="tsx" copyLabel={t.gallery.copy} copiedLabel={t.gallery.copied} />
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
