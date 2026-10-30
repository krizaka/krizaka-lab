/* The lab's guides (English only; krizaka-ui#434: « task-oriented docs, each with a real Krizaka UI screen, a copy-paste
   snippet and the config table »). A guide answers one task — « animate a list arriving » — on one of the scenarios'
   screens (scenarios.tsx): the screen plays it, the settings change it, the snippet follows the settings, the table says
   every option and what happens under reduced motion. Data only here; the page is GuidePage (GuidePage.tsx). */

import type { Knob, Values } from "./playground-lib";
import type { ScenarioId } from "./scenarios";
import en from "../../messages/en.json" with { type: "json" };

export type GuideId =
  | "list-arrival"
  | "live-number"
  | "page-transition"
  | "streaming-answer"
  | "route-draw"
  | "button-feedback"
  | "pin-drop"
  | "tape-stick"
  | "paper-sway"
  | "develop"
  | "crt-power-on"
  | "crt-power-off"
  | "neon-flicker";

export interface ConfigRow {
  option: string;
  type: string;
  default: string;
  does: string;
}

export interface Guide {
  id: GuideId;
  /** The task, as a reader would type it. */
  title: string;
  lead: string;
  scenario: ScenarioId;
  /** What the guide's settings change on the screen. */
  knobs: readonly Knob[];
  /** The code to copy, written from the settings' current values. */
  snippet: (v: Record<string, string | number | boolean>) => string;
  file: string;
  config: readonly ConfigRow[];
  reduced: string;
  /** The components this guide uses, with their page on ui.krizaka.com. */
  uses: readonly { name: string; href: string }[];
}

const UI = "https://ui.krizaka.com/components";
const checkoutWords = en.checkout.guides;
export const CHECKOUT_KNOBS: readonly Knob[] = [
  {
    kind: "range",
    key: "wait",
    label: en.checkout.settings.wait,
    min: 300,
    max: 4000,
    step: 100,
    value: 1400,
    unit: "ms",
  },
  {
    kind: "choice",
    key: "direction",
    label: en.checkout.settings.direction,
    options: ["right", "left"],
    value: "right",
  },
  {
    kind: "choice",
    key: "duration",
    label: en.checkout.settings.duration,
    options: ["--kz-duration-instant", "--kz-duration-fast", "--kz-duration-base"],
    value: "--kz-duration-base",
  },
  {
    kind: "choice",
    key: "easing",
    label: en.checkout.settings.easing,
    options: ["--kz-ease", "--kz-ease-spring"],
    value: "--kz-ease",
  },
  { kind: "toggle", key: "fail", label: en.checkout.settings.fail, value: false },
];
const checkoutSnippet = (values: Values) => {
  const v = { ...Object.fromEntries(CHECKOUT_KNOBS.map((k) => [k.key, k.value])), ...values };
  return `import { Checkout } from "./lab/scenarios";
import "@krizaka/ui/motion.css";

// Copy the linked checkout source, motion components, styles and catalogue.
// Local prototypes are not exports of @krizaka/ui yet.
<Checkout v={{
  wait: ${v.wait},
  direction: ${JSON.stringify(v.direction)},
  duration: ${JSON.stringify(v.duration)},
  easing: ${JSON.stringify(v.easing)},
  fail: ${v.fail},
}} />`;
};
const checkoutConfig: readonly ConfigRow[] = [
  { option: "wait", type: "ms", default: "1400", does: checkoutWords.waitDoes },
  { option: "direction", type: '"right" | "left"', default: '"right"', does: checkoutWords.directionDoes },
  { option: "duration", type: "CSS motion token", default: "--kz-duration-base", does: checkoutWords.durationDoes },
  { option: "easing", type: "CSS easing token", default: "--kz-ease", does: checkoutWords.easingDoes },
  { option: "fail", type: "boolean", default: "false", does: checkoutWords.failDoes },
  { option: "focus / loading / status", type: "UI state", default: "idle", does: checkoutWords.focusDoes },
];
const checkoutUses = [
  { name: "Motion", href: "https://ui.krizaka.com/foundations/motion" },
  ...["StepProgress", "Button", "NumberTicker", "Toast", "Chip"].map((name) => ({
    name,
    href: `${UI}/${({ StepProgress: "step-progress", NumberTicker: "number-ticker" } as Record<string, string>)[name] ?? name.toLowerCase()}`,
  })),
];

type WallMotion = Extract<
  GuideId,
  "pin-drop" | "tape-stick" | "paper-sway" | "develop" | "crt-power-on" | "crt-power-off" | "neon-flicker"
>;
type WallVariable = { key: string; unit?: string; attribute?: boolean };
const WALL_TARGETS: Record<WallMotion, { component: string; path: string; tag: string; content: string }> = {
  "pin-drop": { component: "Card", path: "card", tag: "Card.Root", content: "<Card.Title>Hours</Card.Title>" },
  "tape-stick": { component: "Badge", path: "badge", tag: "Badge", content: "taped" },
  "paper-sway": { component: "Card", path: "card", tag: "Card.Root", content: "<Card.Title>Your caption</Card.Title>" },
  develop: { component: "Card", path: "card", tag: "Card.Media", content: "Your photograph" },
  "crt-power-on": { component: "Card", path: "card", tag: "Card.Media", content: "Your display" },
  "crt-power-off": { component: "Card", path: "card", tag: "Card.Media", content: "Your display" },
  "neon-flicker": { component: "Badge", path: "badge", tag: "Badge", content: "Your sign" },
};

function wallGuide(
  id: WallMotion,
  title: string,
  lead: string,
  knobs: readonly Knob[],
  variables: Readonly<Record<string, WallVariable>>,
  config: readonly ConfigRow[],
  reduced: string,
): Guide {
  return {
    id,
    title,
    lead,
    scenario: "wall",
    knobs,
    snippet: (v) => {
      const style = Object.entries(variables)
        .filter(([, variable]) => !variable.attribute)
        .map(([name, variable]) => {
          const value = v[variable.key];
          return `"--kz-wall-${name}": ${typeof value === "string" ? `"${value}"` : `"${value}${variable.unit ?? ""}"`}`;
        })
        .join(", ");
      const attributes = Object.values(variables)
        .filter((variable) => variable.attribute)
        .map((variable) => `data-kz-${variable.key}="${v[variable.key]}"`)
        .join(" ");
      const target = WALL_TARGETS[id];
      const imports = `import { Badge } from "@krizaka/ui/badge";\nimport { Button } from "@krizaka/ui/button";\nimport { Card } from "@krizaka/ui/card";\nimport "./wall-motions.css";`;
      return `${imports}\n\n<div className="lab-wall" data-motion-scope="">\n  <${target.tag} data-wall-animation="" data-kz-${id} ${attributes} style={{ ${style} }}>\n    ${target.content}\n  </${target.tag}>\n</div>`;
    },
    file: "ShopWall.tsx",
    config,
    reduced,
    uses: [
      { name: WALL_TARGETS[id].component, href: `${UI}/${WALL_TARGETS[id].path}` },
      { name: "Motion", href: "https://ui.krizaka.com/foundations/motion" },
    ],
  };
}

export const GUIDES: readonly Guide[] = [
  {
    id: "list-arrival",
    title: "Animate a list arriving",
    lead: "New rows slide in on top of a table as they land; the rest of the table stays still. The motion is a data attribute, the timing is CSS.",
    scenario: "dashboard",
    knobs: [
      { kind: "choice", key: "arrival", label: "arrival", options: ["slide", "fade", "flash"], value: "slide" },
      {
        kind: "range",
        key: "arrivalDuration",
        label: "duration",
        min: 160,
        max: 1200,
        step: 40,
        value: 420,
        unit: "ms",
      },
      {
        kind: "range",
        key: "interval",
        label: "a run lands every",
        min: 800,
        max: 5000,
        step: 200,
        value: 2200,
        unit: "ms",
      },
      { kind: "toggle", key: "stream", label: "runs keep landing", value: true },
    ],
    snippet: (v) =>
      `import { DataTable } from "@krizaka/ui/data-table";\nimport "@krizaka/ui/motion.css";\n\n<div data-kz-arrival="${v.arrival}" style={{ "--kz-arrive-duration": "${v.arrivalDuration}ms" }}>\n  <DataTable\n    caption="Runs, newest first"\n    rows={runs}\n    getRowId={(r) => r.id}\n    columns={[{ id: "id", header: "Run", cell: (r) => <code data-kz-arrive={r.fresh ? "" : undefined}>{r.id}</code> }, …]}\n  />\n</div>`,
    file: "RunsTable.tsx",
    config: [
      {
        option: "data-kz-arrive",
        type: "attribute",
        default: "—",
        does: "On the cell of a row that just landed: it plays the arrival once.",
      },
      {
        option: "data-kz-arrival",
        type: '"slide" | "fade" | "flash"',
        default: '"slide"',
        does: "On a container: how its rows arrive.",
      },
      {
        option: "--kz-arrive-duration",
        type: "CSS time",
        default: "520ms",
        does: "How long an arrival lasts (a flash, twice that).",
      },
      {
        option: "<MotionObserver />",
        type: "component",
        default: "mounted once",
        does: "Pauses arrivals off screen and while the page settles.",
      },
    ],
    reduced: "Rows appear in place at once: no slide, no fade, no flash.",
    uses: [
      { name: "DataTable", href: `${UI}/data-table` },
      { name: "Motion", href: "https://ui.krizaka.com/foundations/motion" },
    ],
  },
  {
    id: "live-number",
    title: "Show a live number",
    lead: "A figure climbs to its new value when it changes, in the reader's locale and format, and a screen reader hears the new value once.",
    scenario: "dashboard",
    knobs: [
      { kind: "choice", key: "trigger", label: "trigger", options: ["change", "view"], value: "change" },
      { kind: "range", key: "duration", label: "duration", min: 200, max: 2400, step: 100, value: 900, unit: "ms" },
      {
        kind: "choice",
        key: "easing",
        label: "easing",
        options: ["ease-out", "ease-in-out", "linear"],
        value: "ease-out",
      },
      { kind: "choice", key: "format", label: "format", options: ["number", "compact"], value: "number" },
    ],
    snippet: (v) =>
      `import { NumberTicker } from "@krizaka/ui/number-ticker";\nimport { Stat } from "@krizaka/ui/stat";\n\n<Stat\n  label="Runs"\n  value={\n    <NumberTicker\n      value={runs}\n      locale="en-CA"\n      trigger="${v.trigger}"\n      duration={${v.duration}}\n      easing="${v.easing}"${v.format === "compact" ? '\n      format={{ notation: "compact" }}' : ""}\n      announce\n    />\n  }\n/>`,
    file: "RunsFigure.tsx",
    config: [
      { option: "value", type: "number", default: "—", does: "The figure. A new value climbs from the old one." },
      {
        option: "locale / format",
        type: "string / Intl.NumberFormatOptions",
        default: "the page's",
        does: "How it is written: currency, compact, percent…",
      },
      {
        option: "trigger",
        type: '"view" | "change"',
        default: '"view"',
        does: "Climb once when it scrolls into view, or at every change.",
      },
      {
        option: "duration / easing",
        type: "ms / easing",
        default: "1100 climb, 900 roll / --kz-ease",
        does: "How long the climb (or each digit's roll) takes, and its curve.",
      },
      {
        option: "announce",
        type: "boolean",
        default: "false",
        does: "Says the new value politely to a screen reader (once, not every digit).",
      },
      {
        option: "align",
        type: '"start" | "end"',
        default: '"end"',
        does: "Which side the digits hold while they roll.",
      },
    ],
    reduced: "The final value is written at once; the digits never roll.",
    uses: [
      { name: "NumberTicker", href: `${UI}/number-ticker` },
      { name: "Stat", href: `${UI}/stat` },
    ],
  },
  {
    id: "streaming-answer",
    title: "Stream an answer into a chat",
    lead: "The typing indicator holds the place, then the answer grows word by word in its bubble — and a screen reader hears it once, complete.",
    scenario: "chat",
    knobs: [
      { kind: "range", key: "rate", label: "words per second", min: 4, max: 60, step: 2, value: 24 },
      { kind: "choice", key: "unit", label: "unit", options: ["word", "char"], value: "word" },
      { kind: "range", key: "delay", label: "typing indicator", min: 0, max: 2500, step: 100, value: 900, unit: "ms" },
    ],
    snippet: () =>
      `import { MessageBubble, TypingIndicator } from "@krizaka/ui/chat";\n\n<div role="log" aria-busy={streaming} aria-label="Conversation">\n  <MessageBubble mine text={question} time="18:02" />\n  {waiting ? (\n    <TypingIndicator label="The assistant is typing" showLabel />\n  ) : (\n    <MessageBubble text={answerSoFar} time="18:02" />\n  )}\n</div>\n<span role="status">{done ? "Answer complete" : ""}</span>`,
    file: "Assistant.tsx",
    config: [
      { option: "text", type: "string", default: "—", does: "The answer received so far; the bubble grows with it." },
      {
        option: "TypingIndicator label / showLabel",
        type: "string / boolean",
        default: "— / false",
        does: "What is said while the answer is not there yet.",
      },
      {
        option: 'role="log" aria-busy',
        type: "attributes",
        default: "—",
        does: "The log is not read while it streams…",
      },
      { option: 'role="status"', type: "attribute", default: "—", does: "…and says « Answer complete » once." },
    ],
    reduced: "The whole answer is there at once, no indicator.",
    uses: [{ name: "Chat", href: `${UI}/chat` }],
  },
  {
    id: "page-transition",
    title: "Cross from one step to the next",
    lead: checkoutWords.pageLead,
    scenario: "checkout",
    knobs: CHECKOUT_KNOBS,
    snippet: checkoutSnippet,
    file: "Checkout.tsx",
    config: checkoutConfig,
    reduced: checkoutWords.reduced,
    uses: checkoutUses,
  },
  {
    id: "button-feedback",
    title: "Say an action is working, then done",
    lead: checkoutWords.buttonLead,
    scenario: "checkout",
    knobs: CHECKOUT_KNOBS,
    snippet: checkoutSnippet,
    file: "Checkout.tsx",
    config: checkoutConfig,
    reduced: checkoutWords.reduced,
    uses: checkoutUses,
  },
  {
    id: "route-draw",
    title: "Draw a route and follow a courier",
    lead: "On the map, the route draws itself from the shop to the door, a courier travels it, and the arrival counts down beside it.",
    scenario: "delivery",
    knobs: [
      { kind: "range", key: "duration", label: "draw", min: 400, max: 4000, step: 200, value: 1400, unit: "ms" },
      { kind: "range", key: "tripDuration", label: "trip", min: 2000, max: 12000, step: 500, value: 6000, unit: "ms" },
      {
        kind: "choice",
        key: "easing",
        label: "easing",
        options: ["ease-out", "ease-in-out", "linear"],
        value: "ease-out",
      },
      { kind: "toggle", key: "paused", label: "paused", value: false },
    ],
    snippet: (v) =>
      `import { Map, Marker, Route } from "@krizaka/ui/map";\n\n<Map label="Order 4182 on its way" center={center} zoom={13}>\n  <Route\n    path={path}\n    label="The courier's route, 3 km"\n    draw\n    duration={${v.duration}}\n    courier\n    tripDuration={${v.tripDuration}}\n    easing="${v.easing}"${v.paused ? "\n    paused" : ""}\n  />\n  <Marker position={shop} label="Bakery" drop={0} />\n  <Marker position={door} label="You" drop={240} />\n</Map>`,
    file: "DeliveryMap.tsx",
    config: [
      {
        option: "draw / duration",
        type: "boolean / ms",
        default: "true / 1400",
        does: "The route draws itself from its first point, once, when the map is on screen.",
      },
      {
        option: "courier / tripDuration",
        type: "boolean | node / ms",
        default: "— / 3200",
        does: "A dot (or your own content) travels the route once drawn.",
      },
      {
        option: "repeatAfter",
        type: "ms",
        default: "—",
        does: "Starts the trip again after a pause, only while on screen.",
      },
      {
        option: "easing / paused",
        type: "easing / boolean",
        default: "ease-out / false",
        does: "The curve; hold the motion where it is.",
      },
      { option: "Marker drop", type: "ms", default: "—", does: "The pin drops in after this delay." },
    ],
    reduced: "The route is drawn, the courier at its place, the pins set: nothing moves.",
    uses: [
      { name: "Map", href: `${UI}/map` },
      { name: "NumberTicker", href: `${UI}/number-ticker` },
    ],
  },
  wallGuide(
    "pin-drop",
    "Drop a pin onto a shop wall",
    "A note lands with a restrained bounce; its shadow tightens as it settles.",
    [
      { kind: "range", key: "duration", label: "landing", min: 320, max: 900, step: 40, value: 620, unit: "ms" },
      { kind: "range", key: "bounce", label: "bounce height", min: 1, max: 4, step: 0.5, value: 2, unit: "px" },
      {
        kind: "choice",
        key: "easing",
        label: "easing",
        options: ["var(--kz-ease)", "ease-out", "ease-in-out"],
        value: "var(--kz-ease)",
      },
    ],
    { duration: { key: "duration", unit: "ms" }, bounce: { key: "bounce", unit: "px" }, ease: { key: "easing" } },
    [
      {
        option: "data-kz-pin-drop",
        type: "attribute",
        default: "—",
        does: "Plays one landing on the marked wall item.",
      },
      {
        option: "--kz-wall-duration / --kz-wall-bounce",
        type: "CSS time / length",
        default: "620ms / 2px",
        does: "Sets the landing time and the small rebound.",
      },
      {
        option: "--kz-wall-ease",
        type: "CSS easing",
        default: "var(--kz-ease)",
        does: "Uses the motion system's easing token or a CSS curve.",
      },
    ],
    "The item rests in place with its settled shadow; no drop or bounce plays.",
  ),
  wallGuide(
    "tape-stick",
    "Press tape onto a note",
    "A short strip flattens onto the paper and its shadow closes as the tape sticks.",
    [
      { kind: "range", key: "duration", label: "press", min: 220, max: 700, step: 20, value: 420, unit: "ms" },
      { kind: "range", key: "pressure", label: "final scale", min: 0.88, max: 1, step: 0.02, value: 0.94 },
      {
        kind: "choice",
        key: "easing",
        label: "easing",
        options: ["var(--kz-ease)", "ease-out", "ease-in-out"],
        value: "var(--kz-ease)",
      },
    ],
    { duration: { key: "duration", unit: "ms" }, pressure: { key: "pressure" }, ease: { key: "easing" } },
    [
      { option: "data-kz-tape-stick", type: "attribute", default: "—", does: "Presses the tape strip once." },
      {
        option: "--kz-wall-duration / --kz-wall-pressure",
        type: "CSS time / number",
        default: "420ms / 0.94",
        does: "Sets how long the press takes and how far the strip compresses.",
      },
      {
        option: "--kz-wall-ease",
        type: "CSS easing",
        default: "var(--kz-ease)",
        does: "Follows the motion easing token or a CSS curve.",
      },
    ],
    "The tape sits pressed flat, with its final shadow; no press plays.",
  ),
  wallGuide(
    "paper-sway",
    "Let pinned paper sway",
    "A very slow, small idle movement pivots around the pin and rests whenever the wall leaves view.",
    [
      {
        kind: "range",
        key: "period",
        label: "sway period",
        min: 10000,
        max: 30000,
        step: 1000,
        value: 18000,
        unit: "ms",
      },
      { kind: "range", key: "amplitude", label: "amplitude", min: 0.3, max: 1.5, step: 0.1, value: 1.2, unit: "°" },
      {
        kind: "choice",
        key: "easing",
        label: "easing",
        options: ["ease-in-out", "var(--kz-ease)"],
        value: "ease-in-out",
      },
    ],
    {
      "sway-duration": { key: "period", unit: "ms" },
      "sway-angle": { key: "amplitude", unit: "deg" },
      ease: { key: "easing" },
    },
    [
      {
        option: "data-kz-paper-sway",
        type: "attribute",
        default: "—",
        does: "Starts a slow idle sway around the paper's pin.",
      },
      { option: "--kz-wall-sway-duration", type: "CSS time", default: "18000ms", does: "Sets one full sway cycle." },
      {
        option: "--kz-wall-sway-angle",
        type: "CSS angle",
        default: "1.2deg",
        does: "Sets the sway's amplitude; it is capped at 1.5 degrees.",
      },
      {
        option: "--kz-wall-ease",
        type: "CSS easing",
        default: "ease-in-out",
        does: "Sets the slow turn between the two ends of the sway.",
      },
      {
        option: "[data-offscreen]",
        type: "attribute",
        default: "MotionObserver",
        does: "Pauses the idle sway off screen.",
      },
    ],
    "The paper stays upright; the idle sway does not run.",
  ),
  wallGuide(
    "develop",
    "Develop a pinned photograph",
    "A milky, low-contrast print settles into its sharp final image once.",
    [
      { kind: "range", key: "duration", label: "develop", min: 500, max: 1800, step: 100, value: 1000, unit: "ms" },
      { kind: "range", key: "haze", label: "starting haze", min: 0.15, max: 0.55, step: 0.05, value: 0.35 },
      {
        kind: "choice",
        key: "easing",
        label: "easing",
        options: ["var(--kz-ease)", "ease-out", "ease-in-out"],
        value: "var(--kz-ease)",
      },
    ],
    { duration: { key: "duration", unit: "ms" }, haze: { key: "haze" }, ease: { key: "easing" } },
    [
      {
        option: "data-kz-develop",
        type: "attribute",
        default: "—",
        does: "Develops the print from milky to sharp, once.",
      },
      {
        option: "--kz-wall-duration / --kz-wall-haze",
        type: "CSS time / number",
        default: "1000ms / 0.35",
        does: "Sets the development time and the starting haze.",
      },
      {
        option: "--kz-wall-ease",
        type: "CSS easing",
        default: "var(--kz-ease)",
        does: "Sets the filter's easing curve.",
      },
    ],
    "The sharp, full-contrast photograph is shown immediately.",
  ),
  wallGuide(
    "crt-power-on",
    "Power on a wall display",
    "A bright horizontal line opens vertically into the display's steady image.",
    [
      { kind: "range", key: "duration", label: "power on", min: 240, max: 900, step: 40, value: 520, unit: "ms" },
      {
        kind: "choice",
        key: "easing",
        label: "easing",
        options: ["var(--kz-ease)", "ease-out", "ease-in-out"],
        value: "var(--kz-ease)",
      },
    ],
    { duration: { key: "duration", unit: "ms" }, ease: { key: "easing" } },
    [
      { option: "data-kz-crt-power-on", type: "attribute", default: "—", does: "Opens the screen from a bright line." },
      {
        option: "--kz-wall-duration",
        type: "CSS time",
        default: "520ms",
        does: "Sets how long the screen takes to open.",
      },
      {
        option: "--kz-wall-ease",
        type: "CSS easing",
        default: "var(--kz-ease)",
        does: "Sets the line's opening curve.",
      },
    ],
    "The display is already open; no line expands.",
  ),
  wallGuide(
    "crt-power-off",
    "Power off a wall display",
    "The picture collapses to a bright line, then the screen goes dark.",
    [
      { kind: "range", key: "duration", label: "power off", min: 240, max: 900, step: 40, value: 520, unit: "ms" },
      {
        kind: "choice",
        key: "easing",
        label: "easing",
        options: ["var(--kz-ease)", "ease-out", "ease-in-out"],
        value: "var(--kz-ease)",
      },
    ],
    { duration: { key: "duration", unit: "ms" }, ease: { key: "easing" } },
    [
      {
        option: "data-kz-crt-power-off",
        type: "attribute",
        default: "—",
        does: "Closes the image to a line, then turns it off.",
      },
      {
        option: "--kz-wall-duration",
        type: "CSS time",
        default: "520ms",
        does: "Sets how long the screen takes to close.",
      },
      {
        option: "--kz-wall-ease",
        type: "CSS easing",
        default: "var(--kz-ease)",
        does: "Sets the line's closing curve.",
      },
    ],
    "The display stays dark, its final state; the power-off motion is skipped.",
  ),
  wallGuide(
    "neon-flicker",
    "Settle a neon sign",
    "Two or three irregular flickers lead into a steady sign; it never loops.",
    [
      { kind: "range", key: "duration", label: "settle", min: 360, max: 1200, step: 40, value: 800, unit: "ms" },
      { kind: "choice", key: "flickers", label: "flickers", options: ["2", "3"], value: "3" },
    ],
    { duration: { key: "duration", unit: "ms" }, flickers: { key: "flickers", attribute: true } },
    [
      {
        option: "data-kz-neon-flicker",
        type: "attribute",
        default: "—",
        does: "Flickers a sign two or three times, then holds steady.",
      },
      {
        option: "--kz-wall-duration",
        type: "CSS time",
        default: "800ms",
        does: "Sets the one-shot flicker sequence's length.",
      },
      {
        option: "data-kz-flickers",
        type: '"2" | "3"',
        default: '"3"',
        does: "Chooses two or three irregular flickers; the sign never loops.",
      },
    ],
    "The sign stays steadily lit; it does not flicker.",
  ),
];

export const guideById = (id: GuideId): Guide => GUIDES.find((g) => g.id === id)!;
export const guidesOf = (scenario: ScenarioId): readonly Guide[] => GUIDES.filter((g) => g.scenario === scenario);
