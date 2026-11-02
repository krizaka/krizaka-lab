/* Overlay demos (English only): the Dialog in its four placements (a centred dialog, a sheet from the bottom, a drawer
   from either side) and the sliding active indicator of NavBar and Tabs. The components are Krizaka UI's; the lab only
   moves the active link on a timer, while on screen. */

import { Button } from "@krizaka/ui/button";
import { Dialog } from "@krizaka/ui/dialog";
import { NavBar } from "@krizaka/ui/nav-bar";
import { Tabs } from "@krizaka/ui/tabs";
import { useEffect, useRef, useState } from "react";

import { useInView, useReducedMotion } from "./hooks";
import { type Knob, Playground } from "./playground";

export const DIALOG_KNOBS: readonly Knob[] = [
  {
    kind: "choice",
    key: "placement",
    label: "placement",
    options: ["center", "bottom", "right", "left"],
    value: "bottom",
  },
  { kind: "choice", key: "size", label: "size", options: ["sm", "md", "lg"], value: "md" },
];

function dialogNoun(placement: string | number | boolean): string {
  if (placement === "bottom") return "sheet";
  return placement === "center" ? "dialog" : "drawer";
}

function DialogDemo({ v }: { v: Record<string, string | number | boolean> }) {
  return (
    <div className="lab-overlay">
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button variant="primary">
            Open the {dialogNoun(v.placement)}
          </Button>
        </Dialog.Trigger>
        <Dialog.Content
          placement={v.placement as "center" | "bottom" | "right" | "left"}
          size={v.size as "sm" | "md" | "lg"}
          closeLabel="Close"
        >
          <Dialog.Header>
            <Dialog.Title>Publish “Night walk”?</Dialog.Title>
            <Dialog.Description>
              It becomes visible to your supporters. You can unpublish it at any time.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="secondary">Not yet</Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button variant="primary">Publish</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}

export const INDICATOR_KNOBS: readonly Knob[] = [
  { kind: "choice", key: "component", label: "component", options: ["NavBar", "Tabs"], value: "NavBar" },
  { kind: "toggle", key: "cycle", label: "the active item moves by itself", value: true },
  { kind: "range", key: "every", label: "every", min: 800, max: 4000, step: 200, value: 1800, unit: "ms" },
];

const ITEMS = ["Overview", "Runs", "Packs", "Settings"] as const;

function IndicatorDemo({ v }: { v: Record<string, string | number | boolean> }) {
  const host = useRef<HTMLDivElement>(null);
  const visible = useInView(host);
  const reduce = useReducedMotion();
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (!v.cycle || !visible || reduce) return;
    const t = setInterval(() => setAt((n) => (n + 1) % ITEMS.length), v.every as number);
    return () => clearInterval(t);
  }, [v.cycle, v.every, visible, reduce]);
  return (
    <div ref={host} className="lab-overlay" data-motion-scope="">
      {v.component === "NavBar" ? (
        <NavBar.Root label="Console sections" className="lab-indicator-nav">
          <NavBar.Items>
            {ITEMS.map((name, i) => (
              <NavBar.Link key={name} active={at === i} asChild>
                <button type="button" onClick={() => setAt(i)}>
                  {name}
                </button>
              </NavBar.Link>
            ))}
          </NavBar.Items>
        </NavBar.Root>
      ) : (
        <Tabs.Root
          value={ITEMS[at]}
          onValueChange={(name) => setAt(ITEMS.indexOf(name as (typeof ITEMS)[number]))}
          className="lab-indicator-nav"
        >
          <Tabs.List>
            {ITEMS.map((name) => (
              <Tabs.Trigger key={name} value={name}>
                {name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {ITEMS.map((name) => (
            <Tabs.Content key={name} value={name}>
              {name} — the indicator slid here.
            </Tabs.Content>
          ))}
        </Tabs.Root>
      )}
      <p className="lab-sublead" data-testid="active">
        Active: {ITEMS[at]}
      </p>
    </div>
  );
}

export function OverlaysStage() {
  return (
    <>
      <Playground
        knobs={DIALOG_KNOBS}
        component="Dialog.Content"
        importPath="@krizaka/ui/dialog"
        note="The overlay fades in and the panel enters from its edge (from the bottom on a phone); closing and the keyboard (Escape, focus trap) are the component's. Under reduced motion it simply appears."
        render={(v) => <DialogDemo v={v} />}
      >
        {'  closeLabel="Close"\n  // inside <Dialog.Root>, after a <Dialog.Trigger>'}
      </Playground>
      <h3 className="lab-subtitle">The sliding indicator</h3>
      <p className="lab-sublead">NavBar and Tabs share one indicator that slides under the active item.</p>
      <Playground
        knobs={INDICATOR_KNOBS}
        component="NavBar.Link"
        importPath="@krizaka/ui/nav-bar"
        skip={["component", "cycle", "every"]}
        render={(v) => <IndicatorDemo v={v} />}
      >
        {"  active={at === i}"}
      </Playground>
    </>
  );
}
