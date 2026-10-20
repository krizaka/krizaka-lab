/* The page-transition demo (English only): a small app of three views whose changes play through the View Transitions API
   (`document.startViewTransition`), scoped to the demo's stage by `view-transition-name`. Browsers without it change the
   view at once; under reduced motion the transition is turned off. Words and data are the lab's. */

import { Button } from "@krizaka/ui/button";
import { Card } from "@krizaka/ui/card";
import { type CSSProperties, useState } from "react";
import { flushSync } from "react-dom";

import { useReducedMotion } from "./hooks";
import { type Knob, Playground } from "./playground";

export const TRANSITION_KNOBS: readonly Knob[] = [
  { kind: "choice", key: "style", label: "style", options: ["fade", "slide", "reveal"], value: "slide" },
  { kind: "range", key: "duration", label: "duration", min: 120, max: 900, step: 20, value: 360, unit: "ms" },
  { kind: "choice", key: "easing", label: "easing", options: ["ease-out", "ease-in-out", "linear"], value: "ease-out" },
];

const VIEWS = [
  { id: "home", title: "Home", text: "Today's runs and what needs you." },
  { id: "runs", title: "Runs", text: "Every run, newest first, with its cost." },
  { id: "packs", title: "Packs", text: "The packs this project uses." },
] as const;

function Demo({ v }: { v: Record<string, string | number | boolean> }) {
  const reduce = useReducedMotion();
  const [at, setAt] = useState(0);
  const [dir, setDir] = useState<"forward" | "back">("forward");
  const supported = typeof document !== "undefined" && "startViewTransition" in document;
  const go = (next: number) => {
    const to = (next + VIEWS.length) % VIEWS.length;
    setDir(to >= at ? "forward" : "back");
    const change = () => flushSync(() => setAt(to));
    if (reduce || !supported) return change();
    // The pseudo-elements hang off the root: the style and direction are set there for the length of the transition.
    const root = document.documentElement;
    root.dataset.vt = `${v.style}-${to >= at ? "forward" : "back"}`;
    root.style.setProperty("--lab-vt-duration", `${v.duration}ms`);
    root.style.setProperty("--lab-vt-ease", String(v.easing));
    const t = (document as Document & { startViewTransition: (cb: () => void) => { finished: Promise<void> } }).startViewTransition(change);
    void t.finished.finally(() => delete root.dataset.vt);
  };
  const style = { "--lab-vt-duration": `${v.duration}ms`, "--lab-vt-ease": v.easing as string } as CSSProperties;
  return (
    <div className="lab-vt" data-style={v.style as string} data-dir={dir} style={style}>
      <div className="lab-vt-stage" data-testid="vt-stage">
        <Card.Root>
          <Card.Body>
            <Card.Title>{VIEWS[at]!.title}</Card.Title>
            <p className="lab-sublead">{VIEWS[at]!.text}</p>
          </Card.Body>
        </Card.Root>
      </div>
      <div className="lab-actions" style={{ justifyContent: "flex-start" }}>
        <Button variant="secondary" size="sm" onClick={() => go(at - 1)}>
          Previous
        </Button>
        <Button variant="primary" size="sm" onClick={() => go(at + 1)}>
          Next
        </Button>
      </div>
      <p className="lab-sublead" data-testid="vt-view">View: {VIEWS[at]!.title}{supported ? "" : " (this browser changes views at once)"}</p>
    </div>
  );
}

export function TransitionsStage() {
  return (
    <Playground
      knobs={TRANSITION_KNOBS}
      component="startViewTransition"
      importPath="document"
      skip={["style", "duration", "easing"]}
      note="A view change is wrapped in document.startViewTransition(); the old and the new view cross inside the stage only. Skipped under reduced motion and where the API does not exist."
      render={(v) => <Demo v={v} />}
    >
      {"  // (change) => flushSync(() => setView(next))"}
    </Playground>
  );
}
