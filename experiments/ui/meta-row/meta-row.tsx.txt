// Server-safe: no hook, no context. One quiet line of facts about a thing, separated by dots, with optional status chips
// at its end. A real list, so a screen reader hears "list, 5 items" and the separators are never read.
import * as React from "react";
import { tv } from "tailwind-variants";

export const metaRow = tv({
  slots: {
    root: "m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1.5 p-0 text-xs text-fg-secondary",
    item: "inline-flex items-center gap-2",
    dot: "select-none text-fg-muted",
  },
  variants: {
    size: {
      sm: { root: "text-xs" },
      md: { root: "text-sm" },
    },
  },
  defaultVariants: { size: "sm" },
});

export type MetaRowProps = Omit<React.ComponentProps<"ul">, "children"> & {
  /** The facts, in reading order, already translated ("HD 720p", "9:16", "0:05"). Empty ones (`null`, `false`, "") are skipped. */
  items: ReadonlyArray<React.ReactNode>;
  /** Status chips after the facts (a `Badge`, a `ChipLink`): not dot-separated, e.g. "Encoding" or "AI-generated". */
  chips?: ReadonlyArray<React.ReactNode>;
  /** sm (default) · md. */
  size?: "sm" | "md";
};

const present = (n: React.ReactNode) => n !== null && n !== undefined && n !== false && n !== "";

export function MetaRow({ items, chips = [], size, className, ...props }: MetaRowProps) {
  const { root, item, dot } = metaRow({ size });
  const facts = items.filter(present);
  const tail = chips.filter(present);
  return (
    <ul className={root({ className })} {...props}>
      {facts.map((fact, i) => (
        <li key={i} className={item()}>
          {i > 0 && (
            <span aria-hidden className={dot()}>
              ·
            </span>
          )}
          <span>{fact}</span>
        </li>
      ))}
      {tail.map((chip, i) => (
        <li key={`chip-${i}`} className={item()}>
          {chip}
        </li>
      ))}
    </ul>
  );
}
