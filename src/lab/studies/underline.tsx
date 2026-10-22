import "./underline.css";

const paragraphs = [
  "A notebook is read from the top, one line after the other.",
  "The pencil keeps your place: the line under the title grows as you go down the page.",
  "Nothing on the page runs by itself. The scroll is the clock, so the line stops when you stop.",
  "At the bottom, the underline is whole; at the top, it is not started.",
  "The browser does the work, on the compositor, with no scroll listener.",
  "Where scroll-driven animations are missing, the line is simply drawn in full.",
];

export function Example() {
  return (
    <div className="st-reader" tabIndex={0} role="region" aria-label="A page to read">
      <svg className="st-rule" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden>
        <path pathLength="1" d="M2 8 C 40 3, 70 12, 110 7 S 190 4, 230 9 S 280 6, 298 7" />
      </svg>
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}
