/* The pure part of the playground: a knob's definition, the values read from and written to the address
   (`?density=dense&speed=24`, so a configuration can be shared) and the props written into the copied snippet.
   Tested by tests/playground-lib.test.mjs. */

export type Knob =
  | { kind: "choice"; key: string; label: string; options: readonly string[]; value: string }
  | { kind: "range"; key: string; label: string; min: number; max: number; step: number; value: number; unit?: string }
  | { kind: "toggle"; key: string; label: string; value: boolean };

export type Values = Record<string, string | number | boolean>;

/** The knobs' own defaults. */
export function defaults(knobs: readonly Knob[]): Values {
  return Object.fromEntries(knobs.map((k) => [k.key, k.value]));
}

/** The values the address asks for (`?density=dense`), each checked against its knob; anything else stays at the default. */
export function readValues(knobs: readonly Knob[], search: string): Values {
  const params = new URLSearchParams(search.replace(/^\?\/[^&]*&?/, "?"));
  const out = defaults(knobs);
  for (const k of knobs) {
    const raw = params.get(k.key);
    if (raw === null) continue;
    if (k.kind === "choice" && k.options.includes(raw)) out[k.key] = raw;
    else if (k.kind === "range") {
      const n = Number(raw);
      if (Number.isFinite(n)) out[k.key] = Math.min(k.max, Math.max(k.min, n));
    } else if (k.kind === "toggle" && (raw === "1" || raw === "0")) out[k.key] = raw === "1";
  }
  return out;
}

/** The query string of the values that differ from the defaults (empty when none does). */
export function toSearch(knobs: readonly Knob[], values: Values): string {
  const params = new URLSearchParams();
  for (const k of knobs) {
    const v = values[k.key];
    if (v === undefined || v === k.value) continue;
    params.set(k.key, typeof v === "boolean" ? (v ? "1" : "0") : String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Puts the configuration in the address without a navigation (the page's other query parameters stay). */
export function writeValues(knobs: readonly Knob[], values: Values): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const k of knobs) url.searchParams.delete(k.key);
  for (const [key, value] of new URLSearchParams(toSearch(knobs, values))) url.searchParams.set(key, value);
  window.history.replaceState(window.history.state, "", url);
}

/** The knobs that differ from the defaults, as the component's props, one per line (what the snippet adds). */
export function propsSnippet(knobs: readonly Knob[], values: Values, skip: readonly string[] = []): string {
  const lines: string[] = [];
  for (const k of knobs) {
    const v = values[k.key];
    if (skip.includes(k.key) || v === undefined || v === k.value) continue;
    lines.push(typeof v === "string" ? `  ${k.key}="${v}"` : `  ${k.key}={${String(v)}}`);
  }
  return lines.length ? `\n${lines.join("\n")}` : "";
}
