// Client. A profile's photos in a grid of slots: the first is the main one; drag a photo onto another to reorder, or use
// its menu (make main, earlier, later, remove) — the keyboard way, every move announced.
import * as React from "react";
import { tv } from "tailwind-variants";

import { PlusGlyph } from "../glyphs";

export const photoGrid = tv({
  slots: {
    root: "grid gap-2",
    slot: "relative aspect-[3/4] overflow-hidden rounded-xl",
    photo: "group h-full w-full cursor-grab bg-surface-3 outline-hidden focus-visible:ring-2 focus-visible:ring-ring data-[over]:ring-2 data-[over]:ring-accent active:cursor-grabbing",
    image: "h-full w-full object-cover",
    main: "absolute bottom-2 left-2 rounded-sm bg-accent px-2 py-0.5 text-[10px] font-extrabold text-on-accent",
    tools: "absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 motion-reduce:transition-none",
    tool: "inline-flex h-7 w-7 items-center justify-center rounded-full bg-scrim text-fg-on-media hover:bg-scrim-strong focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
    empty:
      "flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-border-strong bg-surface-1 text-xs font-semibold text-fg-secondary " +
      "hover:bg-surface-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 data-[required]:border-accent",
    plus: "flex h-8 w-8 items-center justify-center rounded-full bg-surface-3 data-[next]:bg-accent data-[next]:text-on-accent [&>svg]:h-4 [&>svg]:w-4",
  },
});

export type GridPhoto = {
  /** A stable id. */
  id: string;
  /** Its URL. */
  src: string;
  /** What it shows — its text alternative. */
  alt?: string;
};

export type PhotoGridLabels = {
  /** An empty slot (“Add a photo”). */
  add: string;
  /** The first photo's badge (“Main”). */
  main: string;
  /** A photo's name: `(n) => "Photo " + n`. */
  photo: (position: number) => string;
  /** Move earlier. */
  moveEarlier: string;
  /** Move later. */
  moveLater: string;
  /** Remove. */
  remove: string;
  /** Announced after a move: `(n) => "Moved to place " + n`. */
  moved: (position: number) => string;
};

export type PhotoGridProps = {
  /** The photos, in order: the first is the main one. */
  value: readonly GridPhoto[];
  /** Called with the new order, or without a removed photo. */
  onValueChange: (photos: GridPhoto[]) => void;
  /** Called by an empty slot: open the file picker, the camera, the editor. */
  onAdd?: () => void;
  /** How many slots. Default 6. */
  slots?: number;
  /** Fewest photos required: the empty slots up to it are marked. Default 1. */
  required?: number;
  /** Columns. Default 3. */
  columns?: number;
  /** The words, passed translated. */
  labels: PhotoGridLabels;
  /** Classes merged on the root. */
  className?: string;
};

/** A profile's photos in slots: drag to reorder, or each photo's buttons (earlier, later, remove), every move announced. */
export function PhotoGrid({ value, onValueChange, onAdd, slots = 6, required = 1, columns = 3, labels, className }: PhotoGridProps) {
  const s = photoGrid();
  const [dragged, setDragged] = React.useState<number | null>(null);
  const [over, setOver] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState("");
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [photo] = next.splice(from, 1);
    next.splice(to, 0, photo!);
    onValueChange(next);
    setMessage(labels.moved(to + 1));
  };
  return (
    <div className={s.root({ className })} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
      {Array.from({ length: slots }, (_, i) => {
        const photo = value[i];
        if (!photo) {
          return (
            <div key={`empty-${i}`} className={s.slot()}>
              <button type="button" disabled={!onAdd || i > value.length} onClick={onAdd} data-required={i < required || undefined} className={s.empty()}>
                <span className={s.plus()} data-next={i === value.length || undefined}>
                  <PlusGlyph />
                </span>
                {i === value.length ? labels.add : <span className="sr-only">{labels.add}</span>}
              </button>
            </div>
          );
        }
        const name = [labels.photo(i + 1), photo.alt, i === 0 ? labels.main : null].filter(Boolean).join(", ");
        return (
          <div key={photo.id} className={s.slot()}>
            <div
              role="group"
              aria-label={name}
              draggable
              tabIndex={0}
              data-over={over === i || undefined}
              className={s.photo()}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                setDragged(i);
              }}
              onDragOver={(e) => {
                if (dragged === null) return;
                e.preventDefault();
                setOver(i);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (dragged !== null) move(dragged, i);
                setDragged(null);
                setOver(null);
              }}
              onDragEnd={() => {
                setDragged(null);
                setOver(null);
              }}
            >
              <img src={photo.src} alt={photo.alt ?? ""} className={s.image()} draggable={false} />
              {i === 0 ? <span className={s.main()} aria-hidden>{labels.main}</span> : null}
              <div className={s.tools()}>
                {i > 0 ? (
                  <button type="button" aria-label={`${labels.moveEarlier} — ${labels.photo(i + 1)}`} className={s.tool()} onClick={() => move(i, i - 1)}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
                  </button>
                ) : null}
                {i < value.length - 1 ? (
                  <button type="button" aria-label={`${labels.moveLater} — ${labels.photo(i + 1)}`} className={s.tool()} onClick={() => move(i, i + 1)}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M9 5l7 7-7 7" /></svg>
                  </button>
                ) : null}
                <button type="button" aria-label={`${labels.remove} — ${labels.photo(i + 1)}`} className={s.tool()} onClick={() => onValueChange(value.filter((_, j) => j !== i))}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
