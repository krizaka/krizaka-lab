import { Button } from "@krizaka/ui/button";
import { useRef } from "react";

import "./stamp.css";

/** A spring settle as a linear() easing: overshoot once, then rest. */
const SPRING = "linear(0, 0.44 8%, 0.98 18%, 1.12 27%, 1.06 36%, 0.99 48%, 0.98 56%, 1.01 72%, 1)";

export function Example() {
  const stamp = useRef<HTMLDivElement>(null);
  function press() {
    const el = stamp.current;
    if (!el) return;
    el.dataset.stamped = "";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // it just lands
    el.animate(
      [
        { transform: "rotate(-6deg) scale(2.2, 2.2)", opacity: 0 },
        { transform: "rotate(-6deg) scale(1.12, 0.82)", opacity: 0.9, offset: 0.32 }, // squash on contact
        { transform: "rotate(-6deg) scale(1, 1)", opacity: 0.9 },
      ],
      { duration: 650, easing: SPRING, fill: "backwards" },
    );
  }
  return (
    <div className="st-stage">
      <div ref={stamp} className="st-stamp" role="img" aria-label="Fait à Montréal, stamped">
        Fait à Montréal
      </div>
      <Button variant="secondary" size="sm" onClick={press}>
        Press the stamp
      </Button>
    </div>
  );
}
