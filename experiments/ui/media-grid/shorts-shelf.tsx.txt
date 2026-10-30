// Client (the arrows scroll the row). A horizontal row of 9:16 cards of one height: scroll-snap, arrows with a mouse,
// a swipe on touch, a "See all" link. The row is a labelled list that scrolls with the keyboard (it takes focus).
import * as React from "react";

import { BlockLink, type LinkComponent } from "../block-link";
import { cn } from "../cn";
import { SectionHint, type SectionHintProps } from "./section-hint";

export interface ShortsShelfProps<T> extends Omit<React.ComponentProps<"section">, "children" | "title"> {
  /** The shelf's accessible name ("Shorts"), passed translated; shown as its heading unless `title` is set. */
  label: string;
  /** A heading different from the name. */
  title?: React.ReactNode;
  /** A small “i” beside the heading: the one-line definition of the section and a link to the glossary. */
  hint?: SectionHintProps;
  /** The clips, in order. */
  items: readonly T[];
  /** A stable key for an item. */
  getId: (item: T) => string;
  /** One card: use `VideoCard aspect="portrait"`. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Opens the vertical feed. */
  seeAll?: { href: string; label: string; linkAs?: LinkComponent };
  /** The arrows' names, passed translated. */
  previousLabel: string;
  /** The next arrow's name. */
  nextLabel: string;
}

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={flip ? "rotate-180" : undefined}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const ARROW =
  "hidden h-9 w-9 items-center justify-center rounded-full border border-border-default bg-surface-1 text-fg shadow-sm transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 [@media(hover:hover)]:inline-flex";

/** A Shorts shelf: equal-height 9:16 cards in a snap-scrolling row. */
export function ShortsShelf<T>({ label, title, hint, items, getId, renderItem, seeAll, previousLabel, nextLabel, className, ...props }: ShortsShelfProps<T>) {
  const row = React.useRef<HTMLUListElement>(null);
  const [edge, setEdge] = React.useState({ start: true, end: false });
  const measure = React.useCallback(() => {
    const el = row.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }, []);
  React.useEffect(measure, [measure, items.length]);
  const page = (dir: 1 | -1) => {
    const el = row.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const headingId = React.useId();
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={headingId} data-shorts-shelf className={cn("min-w-0", className)} {...props}>
      <div className="mb-3 flex items-center gap-2">
        <h2 id={headingId} className="m-0 mr-auto text-base font-bold text-fg">
          {title ?? label}
        </h2>
        {hint && <SectionHint {...hint} />}
        {seeAll && (
          <BlockLink href={seeAll.href} linkAs={seeAll.linkAs} className="text-sm font-semibold text-fg-accent hover:underline">
            {seeAll.label}
          </BlockLink>
        )}
        <button type="button" aria-label={previousLabel} disabled={edge.start} onClick={() => page(-1)} className={ARROW}>
          <Chevron flip />
        </button>
        <button type="button" aria-label={nextLabel} disabled={edge.end} onClick={() => page(1)} className={ARROW}>
          <Chevron />
        </button>
      </div>
      <ul
        ref={row}
        onScroll={measure}
        // biome-ignore: a scroll container must take the keyboard focus to scroll with the arrow keys
        tabIndex={0}
        aria-labelledby={headingId}
        className="m-0 flex list-none snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain p-0 pt-1 -mt-1 pb-2 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <li key={getId(item)} className="w-[9.5rem] shrink-0 snap-start sm:w-44">
            {renderItem(item, i)}
          </li>
        ))}
      </ul>
    </section>
  );
}
