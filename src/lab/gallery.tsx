/// <reference types="vite/client" />
/* Krizaka UI + Motion: real @krizaka/ui components with their motion, grouped by use case. A card's live preview and
   the code it prints are ONE file, examples/<id>.tsx (rendered, and read raw): the code shown is the demo that runs.
   scripts/check-gallery.mjs guards the catalogue (gallery-data.ts). Words around the example: messages → gallery.*. */

import { CodeBlock } from "@krizaka/ui/code-block";
import { Section } from "@krizaka/ui/page";
import type { ComponentType } from "react";

import { useLab } from "./context";
import { type Group, ITEMS, shownCode } from "./gallery-data";
import type { Messages } from "./messages";

type ItemId = keyof Messages["gallery"]["items"];

const live = import.meta.glob<{ Example: ComponentType }>("./examples/*.tsx", { eager: true });
const raw = import.meta.glob<string>("./examples/*.tsx", { eager: true, query: "?raw", import: "default" });

const GROUPS: Group[] = ["feedback", "emphasis", "data", "ambient"];

export function Gallery() {
  const { t } = useLab();
  const g = t.gallery;
  return (
    <>
      {GROUPS.map((group, gi) => (
        <Section key={group} id={group} eyebrow={g.groups[group]} title={g.groupLeads[group]} headingSize="sm" divider={gi > 0}>
          <ul className="lab-gallery">
            {ITEMS.filter((i) => i.group === group).map((item) => {
              const w = g.items[item.id as ItemId];
              const Live = live[`./examples/${item.id}.tsx`]!.Example;
              return (
                <li key={item.id} id={item.id} className="lab-g-item" data-card={item.id}>
                  <div className="lab-g-live">
                    <Live />
                  </div>
                  <div className="lab-g-text">
                    <h3>{w.title}</h3>
                    <p>{w.what}</p>
                    <dl>
                      <dt>{g.props}</dt>
                      <dd>
                        {item.props.map((p) => (
                          <code key={p}>{p}</code>
                        ))}
                      </dd>
                      <dt>{g.reduced}</dt>
                      <dd>{w.reduced}</dd>
                    </dl>
                    <CodeBlock code={shownCode(raw[`./examples/${item.id}.tsx`]!)} language="tsx" copyLabel={g.copy} copiedLabel={g.copied} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>
      ))}
    </>
  );
}
