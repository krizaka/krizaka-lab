import { Button } from "@krizaka/ui/button";
import { useState } from "react";
import { flushSync } from "react-dom";

import "./page-turn.css";

const pages = [
  { title: "Page one", text: "The first route. The page you leave folds away along its spine." },
  { title: "Page two", text: "The second route. The same element, shared by name, turns into this one." },
];

export function Example() {
  const [at, setAt] = useState(0);
  function turn(to: number) {
    const swap = () => flushSync(() => setAt(to));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !document.startViewTransition) return swap(); // no API, or no motion: the page just changes
    document.documentElement.dataset.turn = to > at ? "next" : "back";
    document.startViewTransition(swap).finished.finally(() => delete document.documentElement.dataset.turn);
  }
  const page = pages[at]!;
  return (
    <div className="st-book">
      <article className="st-page" aria-live="polite">
        <h4>{page.title}</h4>
        <p>{page.text}</p>
      </article>
      <span className="lab-g-row">
        <Button variant="ghost" size="sm" disabled={at === 0} onClick={() => turn(0)}>Previous page</Button>
        <Button variant="secondary" size="sm" disabled={at === 1} onClick={() => turn(1)}>Next page</Button>
      </span>
    </div>
  );
}
