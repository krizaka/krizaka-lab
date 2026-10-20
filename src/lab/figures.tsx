/* The figures demo (English only): NumberTicker (digits that climb or roll), Meter (a measure whose tone turns with its
   thresholds) and GoalGauge (a goal counted in steps), driven by one live total. */

import { Button } from "@krizaka/ui/button";
import { GoalGauge } from "@krizaka/ui/goal-gauge";
import { Meter } from "@krizaka/ui/meter";
import { NumberTicker } from "@krizaka/ui/number-ticker";
import { Stat } from "@krizaka/ui/stat";
import { useEffect, useRef, useState } from "react";

import { useInView, useReducedMotion } from "./hooks";
import { type Knob, Playground } from "./playground";

export const FIGURE_KNOBS: readonly Knob[] = [
  { kind: "choice", key: "trigger", label: "trigger", options: ["view", "change"], value: "change" },
  { kind: "range", key: "duration", label: "duration", min: 300, max: 3000, step: 100, value: 1100, unit: "ms" },
  { kind: "choice", key: "easing", label: "easing", options: ["ease-out", "linear", "ease-in-out"], value: "ease-out" },
  { kind: "choice", key: "format", label: "format", options: ["number", "currency", "compact", "percent"], value: "currency" },
  { kind: "choice", key: "meter", label: "meter", options: ["bar", "ring"], value: "bar" },
  { kind: "range", key: "segments", label: "gauge segments", min: 4, max: 12, step: 1, value: 8 },
  { kind: "toggle", key: "live", label: "the total keeps changing", value: true },
];

const FORMATS: Record<string, Intl.NumberFormatOptions> = {
  number: { maximumFractionDigits: 0 },
  currency: { style: "currency", currency: "CAD", maximumFractionDigits: 0 },
  compact: { notation: "compact", maximumFractionDigits: 1 },
  percent: { style: "percent", maximumFractionDigits: 0 },
};
const GOAL = 5000;

function Figures({ v }: { v: Record<string, string | number | boolean> }) {
  const host = useRef<HTMLDivElement>(null);
  const visible = useInView(host);
  const reduce = useReducedMotion();
  const [total, setTotal] = useState(3150);
  useEffect(() => {
    if (!v.live || !visible || reduce) return;
    const t = setInterval(() => setTotal((n) => (n >= GOAL ? 600 : n + 150 + ((n * 7) % 130))), 1700);
    return () => clearInterval(t);
  }, [v.live, visible, reduce]);
  const share = Math.min(1, total / GOAL);
  const shown = v.format === "percent" ? share : total;
  const segments = v.segments as number;
  return (
    <div ref={host} className="lab-figures" data-motion-scope="">
      <Stat
        label="Raised this week"
        value={<NumberTicker key={`${v.trigger}-${v.format}-${v.easing}`} value={shown} trigger={v.trigger as "view" | "change"} duration={v.duration as number} easing={v.easing as "ease-out" | "linear" | "ease-in-out"} announce={v.trigger === "change"} locale="en-CA" format={FORMATS[v.format as string]} />}
        trend="up"
        trendLabel="live"
      />
      <Meter label="Goal" value={total} max={GOAL} valueText={`${Math.min(total, GOAL).toLocaleString("en-CA")} of ${GOAL.toLocaleString("en-CA")}`} thresholds={{ low: 0.7, high: 0.9 }} variant={v.meter as "bar" | "ring"} showLabel />
      <GoalGauge label="Goal in steps" segments={segments} value={Math.round(share * segments)} valueText={`${Math.round(share * segments)} of ${segments} steps`} showLabel />
      <Button variant="secondary" size="sm" onClick={() => setTotal((n) => (n >= GOAL ? 600 : Math.min(GOAL, n + 600)))}>
        Add $600
      </Button>
    </div>
  );
}

export function FiguresStage() {
  return (
    <Playground
      knobs={FIGURE_KNOBS}
      component="NumberTicker"
      importPath="@krizaka/ui/number-ticker"
      skip={["meter", "segments", "live"]}
      note="One total drives the three figures. The ticker announces each new value politely; Meter turns to warning past 70 % and danger past 90 %, in words as well as colour."
      render={(v) => <Figures v={v} />}
    >
      {'  value={total}\n  locale="en-CA"\n  format={{ style: "currency", currency: "CAD", maximumFractionDigits: 0 }}'}
    </Playground>
  );
}
