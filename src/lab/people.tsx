/* The people demo (English only): an Avatar stack whose members join and leave, a VerifiedBadge that appears when a
   profile is checked, and Achievements that unlock one by one. Arrival is @krizaka/ui's (`data-kz-arrive`,
   `data-kz-arrival`); the clock that adds people and unlocks milestones is the lab's, and runs only while on screen. */

import { Achievement, AchievementList } from "@krizaka/ui/achievement";
import { Avatar } from "@krizaka/ui/avatar";
import { Button } from "@krizaka/ui/button";
import { VerifiedBadge } from "@krizaka/ui/verified-badge";
import { useEffect, useRef, useState } from "react";

import { useInView, useReducedMotion } from "./hooks";
import { type Knob, Playground } from "./playground";

const CDN = "https://krizaka-assets.b-cdn.net/site/people/ui";
const PEOPLE = [
  { id: "camille", name: "Camille Roy", src: `${CDN}/camille-256.dc2943029a.webp` },
  { id: "noor", name: "Noor Haddad", src: `${CDN}/noor-256.c340c41421.webp` },
  { id: "tomas", name: "Tomás Ibarra", src: `${CDN}/tomas-256.7eaab80903.webp` },
  { id: "ada", name: "Ada Okafor", src: `${CDN}/ada-256.31a5ce640c.webp` },
  { id: "lm", name: "Léa Martin", src: "" },
  { id: "jo", name: "Jo Park", src: "" },
] as const;

export const PEOPLE_KNOBS: readonly Knob[] = [
  { kind: "choice", key: "arrival", label: "arrival", options: ["slide", "fade", "flash"], value: "fade" },
  { kind: "range", key: "max", label: "avatars shown", min: 2, max: 6, step: 1, value: 4 },
  { kind: "choice", key: "size", label: "size", options: ["sm", "md", "lg"], value: "md" },
  {
    kind: "range",
    key: "every",
    label: "something happens every",
    min: 800,
    max: 4000,
    step: 200,
    value: 1800,
    unit: "ms",
  },
  { kind: "toggle", key: "auto", label: "it happens by itself", value: true },
];

const MILESTONES = [
  { eyebrow: "Milestone 01", title: "90 % of every tip to you", replaced: "Paying 30 % to a platform" },
  { eyebrow: "Milestone 02", title: "Challenges they back with credits", replaced: "Fans who vanish after a like" },
  { eyebrow: "Milestone 03", title: "Your first auction", replaced: "Guessing what a clip is worth" },
] as const;

function Scene({ v }: { v: Record<string, string | number | boolean> }) {
  const host = useRef<HTMLDivElement>(null);
  const visible = useInView(host);
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!v.auto || !visible || reduce) return;
    const t = setInterval(() => setStep((n) => n + 1), v.every as number);
    return () => clearInterval(t);
  }, [v.auto, v.every, visible, reduce]);
  // One clock drives the three: people join (then leave), the profile is verified, milestones unlock.
  const cycle = reduce ? 99 : step % 14;
  const joined = Math.min(PEOPLE.length, 1 + Math.min(cycle, 5));
  const verified = reduce || cycle >= 3;
  const unlocked = reduce ? MILESTONES.length : Math.max(0, Math.min(MILESTONES.length, cycle - 5));
  const shown = PEOPLE.slice(0, joined);
  return (
    <div ref={host} className="lab-people" data-kz-arrival={v.arrival as string} data-motion-scope="">
      <div className="lab-people-row">
        <Avatar.Group
          max={v.max as number}
          size={v.size as "sm" | "md" | "lg"}
          aria-label={`${joined} people are here`}
        >
          {shown.map((p) => (
            <span key={p.id} data-kz-arrive="" className="lab-people-item">
              <Avatar
                size={v.size as "sm" | "md" | "lg"}
                {...(p.src
                  ? { src: p.src, alt: p.name }
                  : {
                      fallback: p.name
                        .split(" ")
                        .map((w) => w[0])
                        .join(""),
                    })}
              />
            </span>
          ))}
        </Avatar.Group>
        <span className="lab-sublead" data-testid="people-count">
          {joined} here
        </span>
      </div>
      <p className="lab-people-name">
        Camille Roy{" "}
        {verified ? (
          <span key="v" data-kz-arrive="">
            <VerifiedBadge label="Verified profile" size="lg" />
          </span>
        ) : (
          <span className="lab-sublead">(not verified yet)</span>
        )}
      </p>
      <AchievementList className="lab-people-list">
        {MILESTONES.map((m, i) => (
          <div key={`${m.title}-${i < unlocked}`} {...(i < unlocked && !reduce ? { "data-kz-arrive": "" } : {})}>
            <Achievement
              eyebrow={m.eyebrow}
              badge={i < unlocked ? "Done" : "Locked"}
              locked={i >= unlocked}
              {...(i < unlocked ? { replaced: m.replaced } : {})}
              title={m.title}
            />
          </div>
        ))}
      </AchievementList>
      <Button variant="secondary" size="sm" onClick={() => setStep((n) => n + 1)}>
        Next event
      </Button>
    </div>
  );
}

export function PeopleStage() {
  return (
    <Playground
      knobs={PEOPLE_KNOBS}
      component="Avatar.Group"
      importPath="@krizaka/ui/avatar"
      skip={["arrival", "every", "auto"]}
      note="People join the stack, the profile is verified, milestones unlock — each arrival is data-kz-arrive from @krizaka/ui (slide, fade or flash). The group says how many are here; under reduced motion everything is shown done."
      render={(v) => <Scene v={v} />}
    >
      {'  max={4}\n  aria-label="4 people are here"\n  // each child: <Avatar src alt /> inside <span data-kz-arrive>'}
    </Playground>
  );
}
