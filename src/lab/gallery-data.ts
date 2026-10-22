/* The gallery's catalogue, as data: which card, in which group, which props it lists and which package files declare
   them. The live preview AND the code shown are one file per card, `examples/<id>.tsx` (the preview renders it, the
   code block prints its source): no second copy. scripts/check-gallery.mjs fails the build if a card has no example,
   an example is orphaned, or a listed prop is declared nowhere. */

export type Group = "feedback" | "emphasis" | "data" | "ambient";

export interface ItemData {
  id: string;
  group: Group;
  /** The props this example uses, as a reader would set them (a `name=…` or `Component name` form is read as `name`). */
  props: string[];
  /** The @krizaka/ui entries (dist/<name>*.d.ts) or lab views (src/react/<Name>.tsx) that declare those props. */
  declared: string[];
}

export const ITEMS: ItemData[] = [
  { id: "button", group: "feedback", declared: ["button"], props: ["variant", "shape=\"cut\"", "loading"] },
  { id: "toast", group: "feedback", declared: ["toast"], props: ["label", "closeLabel", "position", "undoLabel", "onUndo"] },
  { id: "progress", group: "feedback", declared: ["progress"], props: ["value", "label", "showLabel"] },
  { id: "dialog", group: "feedback", declared: ["dialog"], props: ["placement=\"right\"", "closeLabel", "Dialog.Trigger asChild", "Dialog.Close asChild"] },
  { id: "glow-card", group: "emphasis", declared: ["glow-card"], props: ["alive"] },
  { id: "badge", group: "emphasis", declared: ["badge", "chip"], props: ["tone", "dot", "pulse", "type=\"single\"", "required", "onValueChange"] },
  { id: "tabs", group: "emphasis", declared: ["tabs"], props: ["defaultValue", "Tabs.Trigger value"] },
  { id: "avatar-presence", group: "emphasis", declared: ["avatar", "YororisPresenceOrb"], props: ["state=\"speaking\"", "interactive", "enableAudio", "size", "fallback"] },
  { id: "stat", group: "data", declared: ["stat", "number-ticker"], props: ["label", "value", "trend", "trendLabel"] },
  { id: "data-table", group: "data", declared: ["data-table"], props: ["rows", "columns", "selectable", "defaultSelected", "density"] },
  { id: "engine-flow", group: "data", declared: ["engine-flow"], props: ["hub", "nodes", "compactLayout", "label"] },
  { id: "lattice-card", group: "data", declared: ["NeuralLatticeView"], props: ["nodeCount", "theme", "interactive"] },
  { id: "waveform", group: "ambient", declared: ["waveform"], props: ["playing", "bars", "size", "label"] },
  { id: "chat", group: "ambient", declared: ["chat"], props: ["text", "mine", "time", "label", "showLabel"] },
  { id: "marquee", group: "ambient", declared: ["marquee"], props: ["label", "pauseLabel", "playLabel", "speed"] },
  { id: "navbar", group: "ambient", declared: ["nav-bar"], props: ["label", "NavBar.Link active", "asChild"] },
  { id: "glass-card", group: "ambient", declared: ["LiquidCausticsView"], props: ["fluidMedium", "palette", "interactive"] },
];

/** The code a card prints: its example's source, one import path aside (the lab's views are not on npm yet). */
export function shownCode(source: string): string {
  return source.replace(/from "\.\.\/\.\.\/react\/(\w+)";/g, 'from "@krizaka/motion/react"; // not on npm: krizaka/krizaka-motion src/react/$1').trimEnd();
}
