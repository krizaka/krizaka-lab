/* The Maps demo: the Krizaka UI map with its motion — pins that drop, a route that draws itself, a courier, a heat pulse.
   English only. The components are @krizaka/ui/map's (Route, Pulse, Marker drop); this file is data + knobs. */

import { Button } from "@krizaka/ui/button";
import { Map, Marker, Pulse, Route, StaticMap } from "@krizaka/ui/map";
import { useState } from "react";

import { type Knob, Playground } from "./playground";

const STUDIO = [-73.6005, 45.5229] as const;
const HOME = [-73.5695, 45.5268] as const;
const MID = [-73.5862, 45.5159] as const;
const PATH = [STUDIO, [-73.5935, 45.5232], MID, [-73.5753, 45.5171], HOME] as const;
const STOPS = [
  { id: "studio", label: "Studio, Mile End", position: STUDIO },
  { id: "depot", label: "Depot, Plateau", position: MID },
  { id: "home", label: "Parc La Fontaine", position: HOME },
] as const;

export const MAP_KNOBS: readonly Knob[] = [
  { kind: "toggle", key: "draw", label: "the route draws itself", value: true },
  { kind: "range", key: "duration", label: "draw duration", min: 400, max: 4000, step: 200, value: 1400, unit: "ms" },
  { kind: "toggle", key: "courier", label: "a courier travels it", value: true },
  { kind: "range", key: "tripDuration", label: "trip duration", min: 1000, max: 8000, step: 500, value: 3600, unit: "ms" },
  { kind: "toggle", key: "repeat", label: "repeat the trip", value: false },
  { kind: "range", key: "stagger", label: "pins stagger", min: 0, max: 600, step: 60, value: 240, unit: "ms" },
  { kind: "toggle", key: "pulse", label: "a demand pulse", value: true },
  { kind: "choice", key: "tone", label: "tone", options: ["accent", "soft"], value: "accent" },
];

function Scene({ v }: { v: Record<string, string | number | boolean> }) {
  const [run, setRun] = useState(0);
  const label = "A delivery from the studio to Parc La Fontaine";
  return (
    <div className="lab-map">
      <Map
        key={`${run}-${v.draw}-${v.duration}-${v.courier}`}
        label={label}
        center={[-73.585, 45.521]}
        zoom={13.2}
        className="lab-map-view"
        fallback={<StaticMap label={label} center={[-73.585, 45.521]} zoom={13.2} places={STOPS.map((s) => ({ position: s.position, label: s.label }))} />}
      >
        <Route
          path={PATH}
          label="Delivery from the studio to Parc La Fontaine, 3 km"
          draw={v.draw as boolean}
          duration={v.duration as number}
          courier={v.courier as boolean}
          tripDuration={v.tripDuration as number}
          repeatAfter={v.repeat ? 1200 : undefined}
          tone={v.tone as "accent" | "soft"}
        />
        {STOPS.map((s, i) => (
          <Marker key={s.id} position={s.position} label={s.label} drop={i * (v.stagger as number)} />
        ))}
        {v.pulse ? <Pulse position={HOME} label="Orders are picking up around Parc La Fontaine" size={72} /> : null}
      </Map>
      <Button variant="secondary" size="sm" onClick={() => setRun((n) => n + 1)}>
        Replay
      </Button>
    </div>
  );
}

export function MapsStage() {
  return (
    <Playground
      knobs={MAP_KNOBS}
      component="Route"
      importPath="@krizaka/ui/map"
      skip={["stagger", "pulse", "repeat"]}
      note="Pins use Marker drop={index * stagger}; a Pulse marks the hot spot. Under reduced motion everything is in place at once."
      render={(v) => <Scene v={v} />}
    >
      {'  path={path}\n  label="Delivery from the studio to Parc La Fontaine"'}
    </Playground>
  );
}
