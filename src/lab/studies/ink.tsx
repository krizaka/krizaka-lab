import { Button } from "@krizaka/ui/button";
import { useState } from "react";

import "./ink.css";

export function Example() {
  const [run, setRun] = useState(0);
  return (
    <div className="st-paper">
      <svg
        key={run}
        className="st-ink"
        viewBox="0 0 320 96"
        role="img"
        aria-label="A signature, written with a pen"
        data-play=""
      >
        <path
          pathLength="1"
          d="M12 70 C 30 20, 48 20, 44 56 C 42 80, 60 74, 70 50 C 76 36, 84 40, 80 58 C 78 70, 96 66, 108 44 C 116 30, 124 36, 120 56 C 118 70, 140 68, 160 40 C 172 24, 176 30, 170 54 C 166 72, 190 70, 210 46 C 224 30, 236 34, 232 56 C 230 68, 250 66, 270 52 C 282 44, 296 46, 308 40"
        />
        <path pathLength="1" d="M20 84 C 90 80, 180 90, 306 80" />
      </svg>
      <Button variant="ghost" size="sm" onClick={() => setRun((n) => n + 1)}>
        Write again
      </Button>
    </div>
  );
}
