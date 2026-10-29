/* The demos: for each, a live preview (the home's cards), the stage with its settings (the demo's page, @krizaka/ui
   controls) and its usage. The canvas views are the lab's (src/react); the engine flow and the Krizaka UI page use the
   shipped primitives of @krizaka/ui. Words come from the messages (useLab). */

import { SettingsIcon } from "@krizaka/icons";
import { Sparkline } from "@krizaka/charts/sparkline";
import { ProductLogo } from "@krizaka/ui";
import { StaticMap } from "@krizaka/ui/map";
import { Button } from "@krizaka/ui/button";
import { TypingIndicator } from "@krizaka/ui/chat";
import { NumberTicker } from "@krizaka/ui/number-ticker";
import { Progress } from "@krizaka/ui/progress";
import { Stat } from "@krizaka/ui/stat";
import { Chip } from "@krizaka/ui/chip";
import { EngineFlow, type FlowDensity, type FlowLayout, type FlowTrigger } from "@krizaka/ui/engine-flow";
import { Dialog } from "@krizaka/ui/dialog";
import { Slider } from "@krizaka/ui/slider";
import { Switch } from "@krizaka/ui/switch";
import { type ReactNode, useRef, useState } from "react";

import type { JarvisTacticalMode } from "../core/jarvis-hud";
import type { CausticPalette, FluidMedium } from "../core/liquid-caustics";
import type { TabId } from "../core/router";
import type { FlowDirection, FlowMode as CanvasMode, JarvisTheme } from "../core/types";
import { JarvisHUD } from "../react/JarvisHUD";
import { LiquidCausticsView } from "../react/LiquidCausticsView";
import { NeuralLatticeView, type NeuralLatticeViewHandle } from "../react/NeuralLatticeView";
import { OrazakaEngineFlow } from "../react/OrazakaEngineFlow";
import { useLab } from "./context";
import { Gallery } from "./gallery";
import { JourneyStage } from "./journey";
import { OverlaysStage } from "./overlays";
import { PeopleStage } from "./people";
import { type Knob, Playground } from "./playground";

type FlowMode = "in" | "out" | "both";
const PRODUCTS = [
  { id: "yomizaka", live: true },
  { id: "akinaza", live: false },
] as const;
const NAMES: Record<string, string> = { yomizaka: "Yomizaka", akinaza: "Akinaza" };

/** The demo's settings, folded into a side panel (Dialog placement="right"): the animation stays large and centred. */
function Settings({ children }: { children: ReactNode }) {
  const { t } = useLab();
  return (
    <div className="lab-settings">
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button variant="secondary" size="sm" shape="pill">
            <SettingsIcon size={14} /> {t.demo.settings}
          </Button>
        </Dialog.Trigger>
        <Dialog.Content placement="right" closeLabel={t.demo.close}>
          <Dialog.Header>
            <Dialog.Title>{t.demo.settings}</Dialog.Title>
            <Dialog.Description>{t.demo.settingsLead}</Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>
            <div className="lab-controls">{children}</div>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}

/** A row of choices: a single-choice Chip.Group with its label. */
function Choice<T extends string>({ label, value, options, names, onChange }: { label: string; value: T; options: readonly T[]; names: Record<T, string>; onChange: (v: T) => void }) {
  return (
    <div className="lab-control">
      <span className="lab-control-label" aria-hidden>
        {label}
      </span>
      <Chip.Group type="single" required size="sm" label={label} value={value} onValueChange={(v) => v && onChange(v as T)}>
        {options.map((o) => (
          <Chip key={o} value={o}>
            {names[o]}
          </Chip>
        ))}
      </Chip.Group>
    </div>
  );
}

/** The box a canvas view plays in: a fixed aspect ratio (no layout shift), a scope MotionObserver pauses off screen. */
function Box({ children, tall = false }: { children: ReactNode; tall?: boolean }) {
  return (
    <div className="lab-box" data-tall={tall ? "" : undefined} data-motion-scope="">
      {children}
    </div>
  );
}

/** The engine flow of @krizaka/ui — the shipped primitive krizaka.com's home draws. */
export function Flow({ layout = "radial", mode = "both", particles = "photons", conduit = "bezier", compact = true, config }: { layout?: FlowLayout; mode?: FlowMode; particles?: "photons" | "none"; conduit?: "bezier" | "straight"; compact?: boolean; config?: Partial<React.ComponentProps<typeof EngineFlow>> }) {
  const { t } = useLab();
  const c = t.controls;
  return (
    <EngineFlow
      className="brand-orazaka"
      label={c.flowLabel}
      layout={layout}
      compactLayout={compact ? "top-to-bottom" : false}
      particles={particles}
      conduit={conduit}
      {...config}
      hint={c.hint}
      hub={{ label: c.engine, caption: c.engineCaption, mark: <ProductLogo id="orazaka" size={52} animated={false} /> }}
      nodes={PRODUCTS.map((p) => ({
        id: p.id,
        label: NAMES[p.id]!,
        className: `brand-${p.id}`,
        mark: <ProductLogo id={p.id} size={26} animated={false} />,
        flow: p.live ? mode : "in",
        planned: !p.live,
        status: p.live ? undefined : c.planned,
        description: c.uses[p.id],
        href: `https://dev.${p.id}.com`,
        external: true,
        linkLabel: `dev.${p.id}.com`,
      }))}
    />
  );
}

const FLOW_KNOBS: readonly Knob[] = [
  { kind: "choice", key: "layout", label: "layout", options: ["radial", "top-to-bottom", "left-to-right"], value: "radial" },
  { kind: "choice", key: "flow", label: "traffic", options: ["in", "out", "both"], value: "both" },
  { kind: "choice", key: "density", label: "density", options: ["sparse", "normal", "dense"], value: "normal" },
  { kind: "choice", key: "trigger", label: "trigger", options: ["always", "hover", "active"], value: "always" },
  { kind: "choice", key: "easing", label: "easing", options: ["linear", "ease-in-out", "cubic-bezier(.2,0,0,1)"], value: "linear" },
  { kind: "range", key: "speed", label: "speed", min: 4, max: 40, step: 2, value: 16, unit: "units/s" },
  { kind: "range", key: "stagger", label: "stagger", min: 0, max: 800, step: 50, value: 300, unit: "ms" },
  { kind: "choice", key: "particles", label: "particles", options: ["photons", "none"], value: "photons" },
  { kind: "choice", key: "conduit", label: "conduit", options: ["bezier", "straight"], value: "bezier" },
  { kind: "toggle", key: "breathe", label: "the engine breathes", value: true },
];

function OrazakaStage() {
  const { t } = useLab();
  const c = t.controls;
  const [direction, setDirection] = useState<FlowDirection>("left-to-right");
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("bidirectional");
  return (
    <>
      <Playground
        knobs={FLOW_KNOBS}
        component="EngineFlow"
        importPath="@krizaka/ui/engine-flow"
        skip={["flow"]}
        note="The stream changes, never the claim: a planned product stays dim and still whatever the settings."
        render={(v) => (
          <div className="lab-stage-view">
            <Flow
              layout={v.layout as FlowLayout}
              mode={v.flow as FlowMode}
              particles={v.particles as "photons" | "none"}
              conduit={v.conduit as "bezier" | "straight"}
              compact={false}
              config={{ density: v.density as FlowDensity, trigger: v.trigger as FlowTrigger, easing: v.easing as string, speed: v.speed as number, stagger: v.stagger as number, breathe: v.breathe as boolean }}
            />
          </div>
        )}
      >
        {"  label=\"Orazaka and the products it powers\"\n  hub={{ label: \"Orazaka\" }}\n  nodes={nodes}"}
      </Playground>
      <h3 className="lab-subtitle">{c.canvasTitle}</h3>
      <p className="lab-sublead">{c.canvasLead}</p>
      <div className="lab-stage">
        <Box>
          <OrazakaEngineFlow direction={direction} flowMode={canvasMode} showTelemetry={false} />
        </Box>
        <Settings>
          <Choice label={c.direction} value={direction} options={["left-to-right", "right-to-left", "top-to-bottom", "radial"] as const} names={c.directions} onChange={setDirection} />
          <Choice label={c.mode} value={canvasMode} options={["inbound", "outbound", "bidirectional"] as const} names={c.canvasModes} onChange={setCanvasMode} />
        </Settings>
      </div>
    </>
  );
}

function HudStage() {
  const { t } = useLab();
  const c = t.controls;
  const [theme, setTheme] = useState<JarvisTheme>("cyan");
  const [posture, setPosture] = useState<JarvisTacticalMode>("standard");
  return (
    <div className="lab-stage">
      <Box tall>
        <JarvisHUD theme={theme} tacticalMode={posture} overdrive={posture === "overdrive"} />
      </Box>
      <Settings>
        <Choice label={c.hudTheme} value={theme} options={["cyan", "orazaka", "sage", "crimson", "gold"] as const} names={c.hudThemes} onChange={setTheme} />
        <Choice label={c.posture} value={posture} options={["standard", "combat", "stealth", "overdrive"] as const} names={c.postures} onChange={setPosture} />
      </Settings>
    </div>
  );
}

function CausticsStage() {
  const { t } = useLab();
  const c = t.controls;
  const [medium, setMedium] = useState<FluidMedium>("glass");
  const [palette, setPalette] = useState<CausticPalette>("prussian");
  const [refraction, setRefraction] = useState(1);
  return (
    <div className="lab-stage">
      <Box>
        <LiquidCausticsView fluidMedium={medium} palette={palette} refractionStrength={refraction} />
      </Box>
      <Settings>
        <Choice label={c.medium} value={medium} options={["water", "glass", "mercury", "helium"] as const} names={c.media} onChange={setMedium} />
        <Choice label={c.palette} value={palette} options={["obsidian", "prussian", "sage", "amber"] as const} names={c.palettes} onChange={setPalette} />
        <Slider label={c.refraction} showLabel value={refraction} min={0.2} max={2} step={0.1} onValueChange={(v) => setRefraction(v as number)} />
      </Settings>
    </div>
  );
}

function LatticeStage() {
  const { t } = useLab();
  const c = t.controls;
  const ref = useRef<NeuralLatticeViewHandle>(null);
  const [theme, setTheme] = useState<"obsidian-gold" | "sage-calm" | "prussian-cyan">("prussian-cyan");
  const [nodes, setNodes] = useState(90);
  const [plastic, setPlastic] = useState(true);
  return (
    <div className="lab-stage">
      <Box>
        <NeuralLatticeView ref={ref} theme={theme} nodeCount={nodes} enableHebbianPlasticity={plastic} />
      </Box>
      <Settings>
        <Choice label={c.latticeTheme} value={theme} options={["obsidian-gold", "sage-calm", "prussian-cyan"] as const} names={c.latticeThemes} onChange={setTheme} />
        <Slider label={c.nodes} showLabel value={nodes} min={30} max={160} step={10} onValueChange={(v) => setNodes(v as number)} />
        <label className="lab-switch">
          <Switch checked={plastic} onCheckedChange={setPlastic} label={c.plasticity} />
          <span aria-hidden>{c.plasticity}</span>
        </label>
        <Button variant="secondary" size="sm" onClick={() => ref.current?.triggerCascadeAvalanche()}>
          {c.cascade}
        </Button>
      </Settings>
    </div>
  );
}

function SpecsStage() {
  const { t } = useLab();
  const s = t.specs;
  return (
    <div className="lab-prose">
      <h3>{s.rules}</h3>
      <ol>
        {s.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <h3>{s.tests}</h3>
      <p>{s.testsText}</p>
    </div>
  );
}

export const ENGINE_FLOW_USAGE = `import { SettingsIcon } from "@krizaka/icons";
import { ProductLogo } from "@krizaka/ui";
import { EngineFlow } from "@krizaka/ui/engine-flow";

<EngineFlow
  className="brand-orazaka"
  label="Orazaka and the products it powers"
  hub={{ label: "Orazaka", mark: <ProductLogo id="orazaka" size={56} /> }}
  nodes={[
    { id: "yomizaka", label: "Yomizaka", flow: "both", className: "brand-yomizaka",
      description: "Document checks.", href: "https://dev.yomizaka.com" },
  ]}
  layout="radial"
  compactLayout="top-to-bottom"
/>`;

const canvasUsage = (component: string, props: string) => `import { ${component} } from "@krizaka/motion/react"; // the lab — not on npm

// A canvas view: paused off screen (MotionObserver's data-offscreen), one still frame under reduced motion.
<div style={{ aspectRatio: "16 / 9" }} data-motion-scope>
  <${component} ${props} />
</div>`;

export interface Demo {
  /** The live preview of the home's card (non-interactive). */
  Preview: () => ReactNode;
  /** The demo's page: the stage and its settings. */
  Stage: () => ReactNode;
  /** Its usage; absent for the pages that are not one view. */
  usage?: { code: string; file: string };
  /** A lab experiment (canvas), or what Krizaka UI ships. */
  lab: boolean;
}

export const DEMOS: Record<TabId, Demo> = {
  orazaka: { Preview: () => <Flow compact={false} />, Stage: OrazakaStage, usage: { code: ENGINE_FLOW_USAGE, file: "EngineFlow.tsx" }, lab: false },
  jarvis: { Preview: () => <JarvisHUD interactive3D={false} />, Stage: HudStage, usage: { code: canvasUsage("JarvisHUD", 'theme="cyan" tacticalMode="standard"'), file: "Hud.tsx" }, lab: true },
  caustics: { Preview: () => <LiquidCausticsView interactive={false} />, Stage: CausticsStage, usage: { code: canvasUsage("LiquidCausticsView", 'fluidMedium="glass" palette="prussian"'), file: "Glass.tsx" }, lab: true },
  lattice: { Preview: () => <NeuralLatticeView interactive={false} nodeCount={60} />, Stage: LatticeStage, usage: { code: canvasUsage("NeuralLatticeView", 'theme="prussian-cyan" nodeCount={90}'), file: "Lattice.tsx" }, lab: true },
  journey: { Preview: () => <div className="lab-g-col"><Progress label="Transcoding" value={58} size="sm" /></div>, Stage: JourneyStage, lab: false },
  overlays: { Preview: () => <div className="lab-g-col"><Chip>Sheet</Chip></div>, Stage: OverlaysStage, lab: false },
  people: { Preview: () => <div className="lab-g-col"><Chip>Avatars · badge · milestones</Chip></div>, Stage: PeopleStage, lab: false },
  "kz-ui": { Preview: () => <Flow compact={false} particles="photons" />, Stage: Gallery, lab: false },
  architecture: { Preview: () => null, Stage: SpecsStage, lab: false },
};
