/* The Data demo: Krizaka UI's DataTable with rows that arrive (and sort), Sparkline that grows, NumberTicker that climbs.
   English only. Arrival and growth are the lab's CSS over the components' own markup (see the ADR: they are candidates
   for @krizaka/ui/motion). */

import { Sparkline } from "@krizaka/charts/sparkline";
import { Badge } from "@krizaka/ui/badge";
import { Button } from "@krizaka/ui/button";
import { DataTable } from "@krizaka/ui/data-table";
import { NumberTicker } from "@krizaka/ui/number-ticker";
import { Stat } from "@krizaka/ui/stat";
import { useEffect, useRef, useState } from "react";

import { type Knob, Playground } from "./playground";

interface Row {
  id: string;
  name: string;
  status: "Live" | "Encoding" | "Queued";
  plays: number;
  trend: number[];
  fresh: boolean;
}

const NAMES = ["Golden hour", "Canal walk", "Night market", "Rooftop set", "First snow", "Studio B", "Market day", "Late train", "Blue hour", "Harbour"];
const STATUSES = ["Live", "Encoding", "Queued"] as const;
const series = (seed: number) => Array.from({ length: 14 }, (_, i) => Math.round(40 + 30 * Math.sin(seed + i / 2) + i * 3 + ((seed * 7 + i * 13) % 11)));

export const DATA_KNOBS: readonly Knob[] = [
  { kind: "toggle", key: "stream", label: "rows keep arriving", value: true },
  { kind: "range", key: "interval", label: "a row every", min: 600, max: 4000, step: 200, value: 1800, unit: "ms" },
  { kind: "choice", key: "arrival", label: "arrival", options: ["slide", "fade", "flash"], value: "slide" },
  { kind: "range", key: "grow", label: "sparkline growth", min: 200, max: 2400, step: 200, value: 900, unit: "ms" },
  { kind: "choice", key: "variant", label: "sparkline", options: ["line", "area", "bar"], value: "area" },
  { kind: "choice", key: "easing", label: "easing", options: ["ease-out", "linear", "cubic-bezier(.2,0,0,1)"], value: "ease-out" },
];

function Scene({ v }: { v: Record<string, string | number | boolean> }) {
  const counter = useRef(3);
  const [rows, setRows] = useState<Row[]>(() => NAMES.slice(0, 4).map((name, i) => ({ id: `r${i}`, name, status: STATUSES[i % 3]!, plays: 300 + i * 910, trend: series(i), fresh: false })));
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (!v.stream || !visible || reduce) return;
    const timer = setInterval(() => {
      const n = counter.current++;
      setRows((prev) => [{ id: `r${n}`, name: NAMES[n % NAMES.length]!, status: STATUSES[n % 3]!, plays: 200 + ((n * 977) % 4000), trend: series(n), fresh: true }, ...prev.map((r) => ({ ...r, fresh: false }))].slice(0, 7));
    }, v.interval as number);
    return () => clearInterval(timer);
  }, [v.stream, v.interval, visible, reduce]);
  const total = rows.reduce((sum, r) => sum + r.plays, 0);
  const style = { "--lab-grow": `${v.grow}ms`, "--lab-ease": v.easing as string } as React.CSSProperties;
  return (
    <div ref={host} className="lab-data" data-arrival={v.arrival as string} style={style} data-motion-scope="">
      <Stat label="Plays on screen" value={<NumberTicker value={total} />} trend="up" trendLabel="live" />
      <div className="lab-data-table">
        <DataTable
          caption="Clips, newest first"
          rows={rows}
          getRowId={(r) => r.id}
          density="compact"
          columns={[
            { id: "name", header: "Clip", sortable: true, value: (r: Row) => r.name, cell: (r: Row) => <span className="lab-arrive" data-fresh={r.fresh ? "" : undefined}>{r.name}</span> },
            { id: "status", header: "Status", sortable: true, value: (r: Row) => r.status, cell: (r: Row) => <Badge tone={r.status === "Live" ? "success" : "neutral"}>{r.status}</Badge> },
            { id: "plays", header: "Plays", sortable: true, align: "end", value: (r: Row) => r.plays },
            { id: "trend", header: "14 days", value: (r: Row) => r.id, cell: (r: Row) => <span className="lab-grow" key={`${r.id}-${v.variant}-${v.grow}`}><Sparkline data={r.trend} width={96} height={28} variant={v.variant as "line" | "area" | "bar"} title={`${r.name}, last 14 days`} trendTone /></span> },
          ]}
        />
      </div>
      <p className="lab-sublead">Sort a column: the rows re-order. New rows arrive on top.</p>
    </div>
  );
}

export function DataStage() {
  return (
    <Playground
      knobs={DATA_KNOBS}
      component="DataTable"
      importPath="@krizaka/ui/data-table"
      skip={["stream", "interval", "arrival", "grow", "variant", "easing"]}
      note="Arrival, growth and the ticker are the lab's CSS over the components' own markup, paused off screen and still under reduced motion."
      render={(v) => <Scene v={v} />}
    >
      {'  caption="Clips, newest first"\n  rows={rows}\n  getRowId={(r) => r.id}\n  columns={columns} // cell: (r) => <Sparkline data={r.trend} />'}
    </Playground>
  );
}
