/* Small hooks of the demos: is the demo on screen, does the visitor ask for less motion. The lab's JS timers (a stream
   of tokens, a journey advancing) run only while their demo is visible, and not at all under reduced motion — the demo
   then shows its final, readable state. */

import { type RefObject, useEffect, useState } from "react";

export function useInView(ref: RefObject<Element | null>, threshold = 0.2): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setSeen(!!entry?.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return seen;
}

export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(q.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return reduce;
}
