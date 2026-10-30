// Client (it renders the shelf). Mixed orientations without a broken grid. `split` (the feed default) sends the 9:16
// clips to a `ShortsShelf` and lays the rest in a uniform 16:9 grid; `uniform` puts everything in one grid of one frame
// (a source of the other orientation is told to `contain`, never cropped to a face). `layout="list"` is one column.
import * as React from "react";

import { cn } from "../cn";
import { SectionHint, type SectionHintProps } from "./section-hint";
import { ShortsShelf, type ShortsShelfProps } from "./shorts-shelf";
import type { VideoCardAspect } from "./video-card";

export interface MediaGridState {
  /** The frame the card is drawn in (`aspect` of `VideoCard`). */
  aspect: VideoCardAspect;
  /** The card's `layout`. */
  layout: "stack" | "row";
  /** The source's orientation differs from the frame: pass `fit="contain"`. */
  mismatch: boolean;
}

export interface MediaGridProps<T> extends Omit<React.ComponentProps<"div">, "children"> {
  /** The videos, in order. */
  items: readonly T[];
  /** A stable key for an item. */
  getId: (item: T) => string;
  /** The source's orientation (from its width and height). */
  orientationOf: (item: T) => VideoCardAspect;
  /** One card, drawn in the frame the grid gives (`state`): use `VideoCard`. */
  renderItem: (item: T, state: MediaGridState) => React.ReactNode;
  /**
   * `split`: verticals on the shelf, the others in the grid · `uniform`: all in one frame (`frame`).
   * @default "split"
   */
  mode?: "split" | "uniform";
  /** The frame of `uniform`. @default "landscape" */
  frame?: VideoCardAspect;
  /** `grid` or `list` (one row per video). @default "grid" */
  layout?: "grid" | "list";
  /** The shelf of `split`: its name, "See all" and arrows, passed translated. */
  shelf: Pick<ShortsShelfProps<unknown>, "label" | "title" | "hint" | "seeAll" | "previousLabel" | "nextLabel">;
  /** A heading for the grid of the others (“Videos”), in the style of the shelf's, with an optional definition. */
  grid?: { label: string; hint?: SectionHintProps };
}

const GRID = {
  landscape: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  portrait: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6",
} as const;

/** A media grid that never mixes heights badly: a shelf for the 9:16, a uniform grid for the rest. */
export function MediaGrid<T>({ items, getId, orientationOf, renderItem, mode = "split", frame = "landscape", layout = "grid", shelf, grid, className, ...props }: MediaGridProps<T>) {
  const gridHeading = React.useId();
  const row = layout === "list";
  const split = mode === "split";
  const verticals = split ? items.filter((i) => orientationOf(i) === "portrait") : [];
  const rest = split ? items.filter((i) => orientationOf(i) !== "portrait") : items;
  const gridFrame: VideoCardAspect = split ? "landscape" : frame;
  const state = (item: T, aspect: VideoCardAspect): MediaGridState => ({ aspect, layout: row ? "row" : "stack", mismatch: orientationOf(item) !== aspect });
  return (
    <div data-media-grid={mode} className={cn("flex min-w-0 flex-col gap-8", className)} {...props}>
      {verticals.length > 0 && <ShortsShelf {...shelf} items={verticals} getId={getId} renderItem={(item) => renderItem(item, { ...state(item, "portrait"), layout: "stack" })} />}
      {rest.length > 0 && (
        <section aria-labelledby={grid ? gridHeading : undefined} data-media-grid-section className="min-w-0">
          {grid && (
            <div className="mb-3 flex items-center gap-2">
              <h2 id={gridHeading} className="m-0 text-base font-bold text-fg">
                {grid.label}
              </h2>
              {grid.hint && <SectionHint {...grid.hint} />}
            </div>
          )}
          <ul data-grid-frame={gridFrame} className={cn("m-0 grid list-none auto-rows-fr gap-4 p-0", row ? "grid-cols-1" : GRID[gridFrame])}>
            {rest.map((item) => (
              <li key={getId(item)} className="min-w-0">
                {renderItem(item, state(item, gridFrame))}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
