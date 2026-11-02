/* The playground of a demo (English only, like the rest of the lab's new pages): live knobs built from Krizaka UI
   controls, the code that follows them (copy), the « use with Krizaka UI » line, and the configuration in the address
   so a setup can be shared. The pure parts (read/write the address, the snippet's props) live in ./playground-lib. */

import { CodeBlock } from "@krizaka/ui/code-block";
import { Chip } from "@krizaka/ui/chip";
import { Slider } from "@krizaka/ui/slider";
import { Switch } from "@krizaka/ui/switch";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { type Knob, type Values, defaults, propsSnippet, readValues, writeValues } from "./playground-lib";

export type { Knob, Values } from "./playground-lib";

function Control({
  knob,
  value,
  onChange,
}: {
  knob: Knob;
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
}) {
  if (knob.kind === "choice")
    return (
      <div className="lab-control">
        <span className="lab-control-label" aria-hidden>
          {knob.label}
        </span>
        <Chip.Group
          type="single"
          required
          size="sm"
          label={knob.label}
          value={String(value)}
          onValueChange={(v) => v && onChange(v)}
        >
          {knob.options.map((o) => (
            <Chip key={o} value={o}>
              {o}
            </Chip>
          ))}
        </Chip.Group>
      </div>
    );
  if (knob.kind === "range")
    return (
      <Slider
        label={knob.unit ? `${knob.label} (${knob.unit})` : knob.label}
        showLabel
        value={Number(value)}
        min={knob.min}
        max={knob.max}
        step={knob.step}
        onValueChange={(v) => onChange(v as number)}
      />
    );
  return (
    <label className="lab-switch">
      <Switch checked={Boolean(value)} onCheckedChange={onChange} label={knob.label} />
      <span aria-hidden>{knob.label}</span>
    </label>
  );
}

/** A demo with its knobs: `render` draws the live component from the values, `code` writes the snippet that follows them. */
export function Playground({
  knobs,
  render,
  component,
  importPath,
  children,
  skip,
  note,
}: {
  knobs: readonly Knob[];
  render: (values: Values) => ReactNode;
  /** The component's name, in the snippet (`EngineFlow`). */
  component: string;
  /** Where it is imported from (`@krizaka/ui/engine-flow`). */
  importPath: string;
  /** The rest of the snippet's JSX (the props that are not knobs), written as the component's own props. */
  children: string;
  /** Knob keys that are not props of the component (they only change the example's data). */
  skip?: readonly string[];
  note?: ReactNode;
}) {
  const [values, setValues] = useState<Values>(() =>
    readValues(knobs, typeof window === "undefined" ? "" : window.location.search),
  );
  useEffect(() => writeValues(knobs, values), [knobs, values]);
  const set = (key: string) => (v: string | number | boolean) => setValues((prev) => ({ ...prev, [key]: v }));
  const initial = useMemo(() => defaults(knobs), [knobs]);
  const code = `import { ${component} } from "${importPath}";\n\n<${component}\n${children}${propsSnippet(knobs, values, skip)}\n/>`;
  return (
    <div className="lab-playground">
      <div className="lab-playground-stage">{render(values)}</div>
      <div className="lab-playground-side">
        <div className="lab-playground-head">
          <h3>Playground</h3>
          <button type="button" className="lab-link-button" onClick={() => setValues(initial)}>
            Reset
          </button>
        </div>
        <div className="lab-controls">
          {knobs.map((k) => (
            <Control key={k.key} knob={k} value={values[k.key] ?? initial[k.key]!} onChange={set(k.key)} />
          ))}
        </div>
        {note ? <p className="lab-sublead">{note}</p> : null}
      </div>
      <div className="lab-playground-code">
        <p className="lab-install">
          Use it with Krizaka UI: <code>pnpm add @krizaka/ui</code>, then import from <code>{importPath}</code>.
        </p>
        <CodeBlock code={code} language="tsx" file={`${component}.tsx`} copyLabel="Copy" copiedLabel="Copied" />
      </div>
    </div>
  );
}
