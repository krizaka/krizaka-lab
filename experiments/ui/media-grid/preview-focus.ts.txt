// Client only. Which card of the page is the most visible: on a phone there is no hover, so exactly one card at a time
// (the one most inside the viewport) may play its preview. One IntersectionObserver for the whole page, no per-card
// observer; the answer is a store read with `useSyncExternalStore`.
const MIN_RATIO = 0.6;
const ratios = new Map<Element, number>();
const listeners = new Set<() => void>();
let observer: IntersectionObserver | null = null;
let leader: Element | null = null;

function elect() {
  let best: Element | null = null;
  let bestRatio = MIN_RATIO - Number.EPSILON;
  for (const [el, ratio] of ratios) {
    if (ratio > bestRatio) {
      best = el;
      bestRatio = ratio;
    }
  }
  if (best === leader) return;
  leader = best;
  for (const l of listeners) l();
}

/** Starts counting an element's visibility; returns the function that stops it. */
export function trackVisibility(el: Element): () => void {
  if (typeof IntersectionObserver === "undefined") return () => {};
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0);
      elect();
    },
    { threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] },
  );
  ratios.set(el, 0);
  observer.observe(el);
  return () => {
    observer?.unobserve(el);
    ratios.delete(el);
    elect();
  };
}

export const subscribeLeader = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));

/** Whether this element is the card the page is showing most. */
export const isLeader = (el: Element | null) => el !== null && leader === el;

/** Test seam: forget everything. */
export function resetPreviewFocus() {
  observer?.disconnect();
  observer = null;
  ratios.clear();
  leader = null;
}
