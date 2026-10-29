// Client (IntersectionObserver). The end of a long list: the next page is requested while the person is still a
// screenful away (`rootMargin`), so it is there before they reach it; the button stays as the way that never fails
// (no observer, a failed page, a keyboard).
import * as React from "react";

import { Button } from "../button";
import { cn } from "../cn";
import { Spinner } from "../spinner";

export interface LoadMoreProps extends Omit<React.ComponentProps<"div">, "children" | "onError"> {
  /** Asks for the next page. Not called while `loading`, nor once `hasMore` is false. */
  onLoadMore: () => void;
  /** There is a next page. */
  hasMore: boolean;
  /** A page is on its way. */
  loading?: boolean;
  /** The last page failed: the button reads `retryLabel`, and nothing loads by itself until it is pressed. */
  failed?: boolean;
  /** The button, passed translated ("Load more"). */
  label: string;
  /** The wait, passed translated ("Loading more videos"). */
  loadingLabel: string;
  /** The button after a failure, passed translated ("Try again"). Defaults to `label`. */
  retryLabel?: string;
  /** Shown instead of the button when the list is over, passed translated ("You have seen everything"). Nothing if absent. */
  endLabel?: string;
  /**
   * How far below the viewport the page is already requested (an IntersectionObserver `rootMargin`).
   * @default "900px 0px"
   */
  rootMargin?: string;
}

/** Infinite scroll with a visible "Load more" under it. */
export function LoadMore({ onLoadMore, hasMore, loading = false, failed = false, label, loadingLabel, retryLabel, endLabel, rootMargin = "900px 0px", className, ...props }: LoadMoreProps) {
  const sentinel = React.useRef<HTMLDivElement>(null);
  const ask = React.useRef(onLoadMore);
  React.useEffect(() => {
    ask.current = onLoadMore;
  });
  // Observing again after each page makes the observer report the current state: a short page that leaves the sentinel in view asks for the next.
  React.useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loading || failed || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && ask.current(), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, failed, rootMargin]);
  return (
    <div data-load-more="" data-state={loading ? "loading" : failed ? "failed" : hasMore ? "idle" : "end"} className={cn("relative flex min-h-14 items-center justify-center py-6", className)} {...props}>
      <div ref={sentinel} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" />
      {loading ? (
        <Spinner label={loadingLabel} size="md" />
      ) : hasMore ? (
        <Button type="button" variant="secondary" size="md" onClick={() => onLoadMore()}>
          {failed ? (retryLabel ?? label) : label}
        </Button>
      ) : endLabel ? (
        <p className="m-0 text-sm text-fg-secondary">{endLabel}</p>
      ) : null}
    </div>
  );
}
