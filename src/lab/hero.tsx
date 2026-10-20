/* The lab's first screen (English only): a headline, the install line, and a live engine flow the visitor plays with at
   once — density, trigger, speed, the engine's breath — with the code that follows, copyable. Phone first: the figure
   comes right under the headline and the knobs under the figure, as wide as the screen. */

import { CheckIcon, CopyIcon } from "@krizaka/icons";
import { Button } from "@krizaka/ui/button";
import { Chip } from "@krizaka/ui/chip";
import type { FlowDensity, FlowTrigger } from "@krizaka/ui/engine-flow";
import { Slider } from "@krizaka/ui/slider";
import { Switch } from "@krizaka/ui/switch";
import { useState } from "react";

import { Flow } from "./demos";

const INSTALL = "pnpm add @krizaka/ui";

function useCopy() {
  const [done, setDone] = useState(false);
  return [done, (text: string) => {
    void navigator.clipboard?.writeText(text).then(() => {
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    }, () => undefined);
  }] as const;
}

export function Hero() {
  const [density, setDensity] = useState<FlowDensity>("normal");
  const [trigger, setTrigger] = useState<FlowTrigger>("always");
  const [speed, setSpeed] = useState(16);
  const [breathe, setBreathe] = useState(true);
  const [installed, copyInstall] = useCopy();
  const [copied, copyCode] = useCopy();
  const props = [density !== "normal" && `density="${density}"`, trigger !== "always" && `trigger="${trigger}"`, speed !== 16 && `speed={${speed}}`, !breathe && "breathe={false}"].filter(Boolean) as string[];
  const code = `import { EngineFlow } from "@krizaka/ui/engine-flow";\n\n<EngineFlow\n  label="Orazaka and the products it powers"\n  hub={{ label: "Orazaka" }}\n  nodes={nodes}${props.map((p) => `\n  ${p}`).join("")}\n/>`;
  return (
    <section className="lab-hero" aria-labelledby="lab-hero-title">
      <div className="lab-hero-copy">
        <p className="lab-hero-eyebrow">Krizaka Motion · the lab</p>
        <h1 id="lab-hero-title">Play with motion.</h1>
        <p className="lab-hero-lead">Every animation here is a Krizaka UI component. Change a setting, watch it move, copy the code.</p>
        <div className="lab-install" role="group" aria-label="Install">
          <code>{INSTALL}</code>
          <Button variant="secondary" size="sm" onClick={() => copyInstall(INSTALL)} aria-label="Copy the install command">
            {installed ? <CheckIcon size={14} /> : <CopyIcon size={14} />} {installed ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="lab-hero-steps">
          <a href="#start">Three steps to use it</a> · <a href="#demos">All the demos</a> · <a href="https://ui.krizaka.com/foundations/motion">Motion docs</a>
        </p>
      </div>
      <div className="lab-hero-play">
        <div className="lab-hero-figure" data-motion-scope="">
          <Flow compact config={{ density, trigger, speed, breathe }} />
        </div>
        <div className="lab-hero-knobs" role="group" aria-label="Settings of the live figure">
          <div className="lab-control">
            <span className="lab-control-label" aria-hidden>density</span>
            <Chip.Group type="single" required size="sm" label="Density" value={density} onValueChange={(v) => v && setDensity(v as FlowDensity)}>
              {(["sparse", "normal", "dense"] as const).map((o) => <Chip key={o} value={o}>{o}</Chip>)}
            </Chip.Group>
          </div>
          <div className="lab-control">
            <span className="lab-control-label" aria-hidden>trigger</span>
            <Chip.Group type="single" required size="sm" label="Trigger" value={trigger} onValueChange={(v) => v && setTrigger(v as FlowTrigger)}>
              {(["always", "hover", "active"] as const).map((o) => <Chip key={o} value={o}>{o}</Chip>)}
            </Chip.Group>
          </div>
          <Slider label="speed" showLabel value={speed} min={4} max={40} step={2} onValueChange={(v) => setSpeed(v as number)} />
          <label className="lab-switch">
            <Switch checked={breathe} onCheckedChange={setBreathe} label="The engine breathes" />
            <span aria-hidden>The engine breathes</span>
          </label>
          <Button variant="primary" size="sm" onClick={() => copyCode(code)}>
            {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />} {copied ? "Copied" : "Copy the code for this setting"}
          </Button>
        </div>
      </div>
    </section>
  );
}
