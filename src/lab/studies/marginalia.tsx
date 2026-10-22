import "./marginalia.css";

export function Example() {
  return (
    <p className="st-text">
      A page of the notebook is read for its{" "}
      <button type="button" className="st-term" popoverTarget="st-note-1" aria-describedby="st-note-1">
        margin
      </button>
      , where the author wrote what the line could not say.
      <span id="st-note-1" className="st-note" popover="auto">
        The note stays next to the words it explains, and closes with Escape or a click elsewhere.
      </span>
    </p>
  );
}
