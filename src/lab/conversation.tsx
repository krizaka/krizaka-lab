/* Conversation demos (English only): a model's answer streaming into a MessageBubble, and a TerminalReplay played back.
   The components are Krizaka UI's; the stream is the lab's (a timer that runs only while the demo is on screen). */

import { Button } from "@krizaka/ui/button";
import { MessageBubble, TypingIndicator } from "@krizaka/ui/chat";
import { TerminalReplay } from "@krizaka/ui/terminal-replay";
import { useEffect, useRef, useState } from "react";

import { useInView, useReducedMotion } from "./hooks";
import { type Knob, Playground } from "./playground";
import { shownAt, tokens } from "./stream-lib";

const ANSWER =
  "Your order left the studio at 9:40 and is on its way to Parc La Fontaine. The courier is two stops away, so expect it in about eight minutes. I'll message you again when it is at the door.";

export const STREAM_KNOBS: readonly Knob[] = [
  { kind: "range", key: "rate", label: "tokens per second", min: 4, max: 80, step: 2, value: 24 },
  { kind: "choice", key: "unit", label: "unit", options: ["word", "char"], value: "word" },
  { kind: "range", key: "delay", label: "typing indicator", min: 0, max: 2500, step: 100, value: 900, unit: "ms" },
  { kind: "toggle", key: "loop", label: "start again when done", value: false },
];

function Stream({ v }: { v: Record<string, string | number | boolean> }) {
  const host = useRef<HTMLDivElement>(null);
  const visible = useInView(host);
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const all = tokens(ANSWER, v.unit as "word" | "char");
  useEffect(() => {
    if (!visible || reduce) return;
    const began = performance.now();
    const timer = setInterval(() => setElapsed(performance.now() - began), 50);
    return () => clearInterval(timer);
  }, [visible, reduce, run, v.rate, v.unit, v.delay]);
  const shown = reduce ? { text: ANSWER, phase: "done" as const } : shownAt(all, elapsed, v.rate as number, v.delay as number);
  useEffect(() => {
    if (shown.phase !== "done" || !v.loop || reduce) return;
    const t = setTimeout(() => {
      setElapsed(0);
      setRun((n) => n + 1);
    }, 2200);
    return () => clearTimeout(t);
  }, [shown.phase, v.loop, reduce]);
  return (
    <div ref={host} className="lab-chat" data-motion-scope="">
      <div className="lab-chat-log" role="log" aria-busy={shown.phase !== "done"} aria-label="Conversation with the assistant">
        <MessageBubble mine text="Where is my order?" time="9:52" grouped="single" />
        {shown.phase === "typing" ? <TypingIndicator label="The assistant is typing" showLabel /> : <MessageBubble text={shown.text} time="9:52" grouped="single" />}
      </div>
      <span className="lab-visually-hidden" role="status">{shown.phase === "done" ? "Answer complete" : ""}</span>
      <Button variant="secondary" size="sm" onClick={() => { setElapsed(0); setRun((n) => n + 1); }}>
        Replay
      </Button>
    </div>
  );
}

export const TERMINAL_KNOBS: readonly Knob[] = [
  { kind: "range", key: "typingSpeed", label: "typing", min: 10, max: 120, step: 5, value: 34, unit: "ms per character" },
  { kind: "range", key: "lineDelay", label: "output lines", min: 20, max: 400, step: 10, value: 70, unit: "ms" },
  { kind: "range", key: "stepDelay", label: "between commands", min: 200, max: 3000, step: 100, value: 900, unit: "ms" },
  { kind: "range", key: "rows", label: "screen height", min: 8, max: 24, step: 2, value: 12, unit: "lines" },
  { kind: "toggle", key: "autoPlay", label: "play when it scrolls into view", value: true },
];

const STEPS = [
  { command: "npx orazaka install", output: ["Resolving packs…", { text: "✓ 6 packs installed", tone: "success" as const }] },
  { command: "orazaka start --dev", output: ["Engine listening on :8085", { text: "✓ ready in 1.4 s", tone: "success" as const }] },
  { command: "curl localhost:8085/v1/runs -d @lease.json", output: ["run_9f2c · reading the lease", { text: "✓ 12 passages checked", tone: "success" as const }] },
];

export function ConversationStage() {
  return (
    <>
      <Playground
        knobs={STREAM_KNOBS}
        component="MessageBubble"
        importPath="@krizaka/ui/chat"
        skip={["rate", "unit", "delay", "loop"]}
        note="The answer is a growing text prop. The log is aria-busy while it streams and says « Answer complete » once, so a screen reader is not read every word. Under reduced motion the whole answer is there at once."
        render={(v) => <Stream v={v} />}
      >
        {'  text={streamedText} // the tokens received so far\n  time="9:52"'}
      </Playground>
      <h3 className="lab-subtitle">A terminal session, played back</h3>
      <p className="lab-sublead">Commands typed at the prompt, their output line by line. At rest the whole session is shown.</p>
      <Playground
        knobs={TERMINAL_KNOBS}
        component="TerminalReplay"
        importPath="@krizaka/ui/terminal-replay"
        note="Every timing is a prop; the session plays when it first scrolls into view and rests whole under reduced motion."
        render={(v) => (
          <TerminalReplay
            key={Object.values(v).join("|")}
            label="Terminal session: install, start, run"
            title="~/projects — zsh"
            steps={STEPS}
            playLabel="Play"
            pauseLabel="Pause"
            replayLabel="Replay"
            copyLabel="Copy commands"
            copiedLabel="Copied"
            typingSpeed={v.typingSpeed as number}
            lineDelay={v.lineDelay as number}
            stepDelay={v.stepDelay as number}
            rows={v.rows as number}
            autoPlay={v.autoPlay as boolean}
          />
        )}
      >
        {'  steps={steps}\n  label="Terminal session: install, start, run"\n  playLabel="Play"\n  pauseLabel="Pause"\n  replayLabel="Replay"'}
      </Playground>
    </>
  );
}
