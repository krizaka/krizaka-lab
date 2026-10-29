// A video card on its way: the same frame, body and footer heights as `VideoCard`, so nothing moves when it arrives.
import * as React from "react";

import { Card } from "../card";
import { cn } from "../cn";
import { Skeleton } from "../skeleton";
import type { VideoCardAspect } from "./video-card";

export interface VideoCardSkeletonProps extends React.ComponentProps<"div"> {
  /** `landscape` (16:9) or `portrait` (9:16), as the card it stands for. @default "landscape" */
  aspect?: VideoCardAspect;
  /** `stack` or `row`, as the card it stands for. @default "stack" */
  layout?: "stack" | "row";
}

const FRAME = { landscape: "aspect-video", portrait: "aspect-[9/16]" } as const;

/** The placeholder of a `VideoCard` (decorative: announce the wait on the list, with `MediaGridSkeleton`). */
export function VideoCardSkeleton({ aspect = "landscape", layout = "stack", className, ...props }: VideoCardSkeletonProps) {
  const row = layout === "row";
  const tall = aspect === "portrait" && !row;
  return (
    <div aria-hidden data-skeleton="video-card" data-aspect={aspect} data-layout={layout} className={cn("h-full min-w-0", className)} {...props}>
      <Card.Root tone="glass" className={cn("h-full w-full max-w-full", row ? "flex-row" : "flex-col")}>
        <Card.Media aspect="auto" className={cn("shrink-0", FRAME[aspect], row && (aspect === "portrait" ? "w-24 sm:w-28" : "w-40 sm:w-56"))}>
          <Skeleton shape="rect" className="h-full w-full rounded-none" />
        </Card.Media>
        <Card.Body className="static min-w-0 flex-1 justify-between gap-2 p-3">
          <div className="flex min-h-[2.5em] flex-col justify-center gap-1.5">
            <Skeleton className="h-3" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <div className={cn("flex text-xs", tall ? "flex-col gap-1" : "h-8 items-center gap-2")}>
            <div className="flex h-6 min-w-0 items-center gap-2">
              <Skeleton shape="circle" className="h-6 w-6 shrink-0" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <div className={cn("flex items-center", tall ? "h-7" : "ml-auto")}>
              <Skeleton className="h-2.5 w-14" />
            </div>
          </div>
        </Card.Body>
      </Card.Root>
    </div>
  );
}

export interface MediaGridSkeletonProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** What is loading, passed translated ("Loading videos"): announced once, the cards are hidden from assistive technology. */
  label: string;
  /** Cards in the grid. @default 8 */
  count?: number;
  /** Cards on the Shorts shelf above the grid (`split` mode); 0 for none. @default 0 */
  shelfCount?: number;
  /** `grid` or `list`. @default "grid" */
  layout?: "grid" | "list";
  /** The frame of the grid. @default "landscape" */
  frame?: VideoCardAspect;
}

const GRID = {
  landscape: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  portrait: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6",
} as const;

/** The placeholder of a `MediaGrid`: the same shelf and grid, skeleton cards, one polite announcement. */
export function MediaGridSkeleton({ label, count = 8, shelfCount = 0, layout = "grid", frame = "landscape", className, ...props }: MediaGridSkeletonProps) {
  const row = layout === "list";
  return (
    <div role="status" aria-busy="true" data-media-grid-skeleton="" className={cn("flex min-w-0 flex-col gap-8", className)} {...props}>
      <span className="sr-only">{label}</span>
      {shelfCount > 0 && (
        <div aria-hidden className="min-w-0">
          <Skeleton className="mb-3 h-4 w-24" />
          <ul className="m-0 flex list-none items-stretch gap-3 overflow-hidden p-0">
            {Array.from({ length: shelfCount }, (_, i) => (
              <li key={i} className="w-[9.5rem] shrink-0 sm:w-44">
                <VideoCardSkeleton aspect="portrait" />
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul aria-hidden className={cn("m-0 grid list-none auto-rows-fr gap-4 p-0", row ? "grid-cols-1" : GRID[frame])}>
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="min-w-0">
            <VideoCardSkeleton aspect={frame} layout={row ? "row" : "stack"} />
          </li>
        ))}
      </ul>
    </div>
  );
}
