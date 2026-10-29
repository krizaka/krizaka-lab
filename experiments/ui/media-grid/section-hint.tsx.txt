// Client (open state). A tiny "i" button beside a section heading: it opens a one-line definition and, when given, a link to
// the glossary. Opens on a tap or a press, on hover with a mouse, closes on Escape or when the focus leaves.
import * as React from "react";

import { BlockLink, type LinkComponent } from "../block-link";
import { cn } from "../cn";

export interface SectionHintProps {
  /** The button's accessible name, passed translated (“What are Shorts?”). */
  label: string;
  /** The definition, in one line. */
  text: string;
  /** A link to the full definition (the glossary). */
  link?: { href: string; label: string; linkAs?: LinkComponent };
}

/** The definition of a section, one tap away from its heading. */
export function SectionHint({ label, text, link }: SectionHintProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      </button>
      <span
        id={id}
        role="tooltip"
        hidden={!open}
        className={cn("absolute left-0 top-full z-20 mt-1 w-64 max-w-[80vw] rounded-xl border border-border-default bg-surface-1 p-3 text-sm font-normal leading-snug text-fg-secondary shadow-lg")}
      >
        {text}
        {link && (
          <>
            {" "}
            <BlockLink href={link.href} linkAs={link.linkAs} className="font-semibold text-fg-accent hover:underline">
              {link.label}
            </BlockLink>
          </>
        )}
      </span>
    </span>
  );
}
