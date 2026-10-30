/* The journey demo (English only): Krizaka UI's Stepper advancing through a job, step by step — done, in progress with its
   own progress, failed — and StepProgress heading a multi-step flow. The job's clock is the lab's (a timer that runs only
   while the demo is on screen); the steps' states are the component's. */

import { Button } from "@krizaka/ui/button";
import { Progress } from "@krizaka/ui/progress";
import { StepProgress } from "@krizaka/ui/step-progress";
import { Stepper } from "@krizaka/ui/stepper";
import { useEffect, useRef, useState } from "react";

import { useInView, useReducedMotion } from "./hooks";
import { journeyAt } from "./journey-lib";
import { type Knob, Playground } from "./playground";

export const JOURNEY_KNOBS: readonly Knob[] = [
  { kind: "choice", key: "orientation", label: "orientation", options: ["vertical", "horizontal"], value: "vertical" },
  { kind: "range", key: "stepMs", label: "time per step", min: 600, max: 6000, step: 200, value: 2200, unit: "ms" },
  { kind: "choice", key: "failAt", label: "a step fails", options: ["none", "Checked", "Transcoding"], value: "none" },
  { kind: "toggle", key: "loop", label: "start again when finished", value: true },
];

const LABELS = { done: "Done", current: "In progress", upcoming: "Upcoming", error: "Failed" };
const NAMES = ["Uploaded", "Checked", "Transcoding", "Published"] as const;
const DETAIL = ["1.2 GB in 48 s", "Format, rights, safety", "4K, 1080p, 720p", "Visible to your supporters"];

function Job({ v }: { v: Record<string, string | number | boolean> }) {
  const host = useRef<HTMLDivElement>(null);
  const visible = useInView(host);
  const reduce = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);
  const failAt = v.failAt === "none" ? -1 : NAMES.indexOf(v.failAt as (typeof NAMES)[number]);
  const stepMs = v.stepMs as number;
  const state = reduce
    ? journeyAt(1e9, NAMES.length, stepMs, failAt)
    : journeyAt(elapsed, NAMES.length, stepMs, failAt);
  useEffect(() => {
    if (!visible || reduce) return;
    const began = performance.now() - elapsed;
    const timer = setInterval(() => setElapsed(performance.now() - began), 80);
    return () => clearInterval(timer);
    // The clock restarts when the settings change or the demo comes back on screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, reduce, stepMs, failAt]);
  useEffect(() => {
    if (!v.loop || reduce || !(state.done || state.failed !== null)) return;
    const t = setTimeout(() => setElapsed(0), 2400);
    return () => clearTimeout(t);
  }, [state.done, state.failed, v.loop, reduce]);
  const percent = Math.round(state.value * 100);
  return (
    <div ref={host} className="lab-journey" data-motion-scope="">
      <StepProgress
        step={Math.min(state.current, NAMES.length - 1) + 1}
        total={NAMES.length}
        label={(s, t) => `Step ${s} of ${t}`}
      />
      <Stepper
        aria-label="Publishing “Night walk”"
        labels={LABELS}
        orientation={v.orientation as "vertical" | "horizontal"}
        current={Math.min(state.current, NAMES.length)}
        steps={NAMES.map((title, i) => ({
          title,
          description: state.failed === i ? "Something went wrong — retry" : DETAIL[i],
          status: state.failed === i ? ("error" as const) : undefined,
          ...(i === 2 && state.current === 2 && state.failed === null
            ? { value: state.value, content: <Progress label="Transcoding" value={percent} showLabel size="sm" /> }
            : {}),
        }))}
      />
      <Button variant="secondary" size="sm" onClick={() => setElapsed(0)}>
        Replay
      </Button>
    </div>
  );
}

export function JourneyStage() {
  return (
    <Playground
      knobs={JOURNEY_KNOBS}
      component="Stepper"
      importPath="@krizaka/ui/stepper"
      skip={["stepMs", "failAt", "loop"]}
      note="Each state is said in words for assistive technology (Done, In progress, Upcoming, Failed). Under reduced motion the finished journey is shown at once."
      render={(v) => <Job v={v} />}
    >
      {
        '  aria-label="Publishing “Night walk”"\n  labels={{ done: "Done", current: "In progress", upcoming: "Upcoming", error: "Failed" }}\n  current={2}\n  steps={steps}'
      }
    </Playground>
  );
}
