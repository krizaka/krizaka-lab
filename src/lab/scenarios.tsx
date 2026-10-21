/* The lab's scenarios (English only; krizaka-ui#434: « demos as real app scenarios, not isolated toys »): four app
   screens built only from @krizaka/ui components — an operations dashboard, a support chat, a booking checkout and a
   delivery on a map. Each guide (guides.tsx) plays its motion on one of them, and a scenario's page shows the whole
   screen with every motion it uses numbered in the margin. The data is a demo and says so; the clocks are the lab's
   and run only while the screen is visible, never under reduced motion (the screen then shows its final state). */

import { Sparkline } from "@krizaka/charts/sparkline";
import { ProductLogo } from "@krizaka/ui";
import { Badge } from "@krizaka/ui/badge";
import { Button } from "@krizaka/ui/button";
import { MessageBubble, TypingIndicator } from "@krizaka/ui/chat";
import { Chip } from "@krizaka/ui/chip";
import { DataTable } from "@krizaka/ui/data-table";
import { Map, Marker, Route, StaticMap } from "@krizaka/ui/map";
import { NumberTicker } from "@krizaka/ui/number-ticker";
import { Progress } from "@krizaka/ui/progress";
import { Stat } from "@krizaka/ui/stat";
import { StepProgress } from "@krizaka/ui/step-progress";
import { Toaster, toast } from "@krizaka/ui/toast";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { useInView, useReducedMotion } from "./hooks";
import type { Values } from "./playground-lib";
import { shownAt, tokens } from "./stream-lib";

export type ScenarioId = "dashboard" | "chat" | "checkout" | "delivery";

/** An app screen: the product's mark (none for a generic app, the courier) and name, the screen's title, then the screen. Decorative chrome is the frame only. */
export function Screen({ product, app, title, children, actions }: { product?: "orazaka" | "yasakia" | "akinaza"; app: string; title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className={product ? `lab-screen brand-${product}` : "lab-screen"}>
      <div className="lab-screen-bar">
        {product ? <ProductLogo id={product} size={22} animated={false} /> : null}
        <span className="lab-screen-app">{app}</span>
        <span className="lab-screen-title">{title}</span>
        {actions ? <span className="lab-screen-actions">{actions}</span> : null}
      </div>
      <div className="lab-screen-body">{children}</div>
    </div>
  );
}

/* ── Dashboard: Orazaka's runs of the day — figures that climb, rows that arrive ─────────────────────────────────── */

interface Run {
  id: string;
  pack: string;
  state: "Done" | "Running" | "Queued";
  cost: number;
  trend: number[];
  fresh: boolean;
}
const PACKS = ["lease-check", "invoice-read", "voice-note", "clip-encode", "menu-translate", "receipt-scan", "chat-answer"];
const STATES = ["Done", "Running", "Queued"] as const;
const trendOf = (seed: number) => Array.from({ length: 12 }, (_, i) => Math.round(30 + 20 * Math.sin(seed + i / 2) + i * 2 + ((seed * 7 + i * 13) % 9)));
const runOf = (n: number, fresh: boolean): Run => ({ id: `run_${(9100 + n * 37).toString(16)}`, pack: PACKS[n % PACKS.length]!, state: STATES[n % 3]!, cost: 0.02 + ((n * 13) % 40) / 100, trend: trendOf(n), fresh });

export const NUMBER_FORMATS: Record<string, Intl.NumberFormatOptions> = {
  number: { maximumFractionDigits: 0 },
  currency: { style: "currency", currency: "CAD", maximumFractionDigits: 2 },
  compact: { notation: "compact", maximumFractionDigits: 1 },
};

export function Dashboard({ v = {} }: { v?: Values }) {
  const host = useRef<HTMLDivElement>(null);
  const visible = useInView(host);
  const reduce = useReducedMotion();
  const counter = useRef(4);
  const [runs, setRuns] = useState<Run[]>(() => [0, 1, 2, 3].map((n) => runOf(n, false)));
  const [total, setTotal] = useState(1284);
  const stream = v.stream ?? true;
  const interval = Number(v.interval ?? 2200);
  useEffect(() => {
    if (!stream || !visible || reduce) return;
    const timer = window.setInterval(() => {
      const n = counter.current++;
      setRuns((prev) => [runOf(n, true), ...prev.map((r) => ({ ...r, fresh: false }))].slice(0, 6));
      setTotal((t) => t + 1 + (n % 4));
    }, interval);
    return () => window.clearInterval(timer);
  }, [stream, interval, visible, reduce]);
  const spend = runs.reduce((s, r) => s + r.cost, 0) * 120;
  const ticker = { duration: Number(v.duration ?? 900), easing: String(v.easing ?? "ease-out") as "ease-out" | "linear" | "ease-in-out", trigger: String(v.trigger ?? "change") as "view" | "change" };
  const style = { "--kz-arrive-duration": `${v.arrivalDuration ?? 420}ms` } as CSSProperties;
  return (
    <div ref={host} data-motion-scope="">
      <Screen product="orazaka" app="Orazaka" title="Runs today" actions={<Badge tone="neutral">demo data</Badge>}>
        <div className="lab-dash-figures">
          <Stat label="Runs" value={<NumberTicker value={total} locale="en-CA" {...ticker} format={NUMBER_FORMATS[String(v.format ?? "number")]} announce={ticker.trigger === "change"} />} trend="up" trendLabel="since 8:00" />
          <Stat label="Spend" value={<NumberTicker value={spend} locale="en-CA" {...ticker} format={NUMBER_FORMATS.currency} />} hint="CAD, all packs" />
          <Stat label="p95 latency" value={<NumberTicker value={1.4} locale="en-CA" {...ticker} format={{ maximumFractionDigits: 1 }} />} hint="seconds" />
        </div>
        <div className="lab-dash-table" data-kz-arrival={String(v.arrival ?? "slide")} style={style}>
          <DataTable
            caption="Runs, newest first"
            rows={runs}
            getRowId={(r) => r.id}
            density="compact"
            columns={[
              { id: "id", header: "Run", value: (r: Run) => r.id, cell: (r: Run) => <code data-kz-arrive={r.fresh ? "" : undefined}>{r.id}</code> },
              { id: "pack", header: "Pack", sortable: true, value: (r: Run) => r.pack },
              { id: "state", header: "State", sortable: true, value: (r: Run) => r.state, cell: (r: Run) => <Badge tone={r.state === "Done" ? "success" : r.state === "Running" ? "accent" : "neutral"}>{r.state}</Badge> },
              { id: "cost", header: "Cost", align: "end", sortable: true, value: (r: Run) => r.cost, cell: (r: Run) => `$${r.cost.toFixed(2)}` },
              { id: "trend", header: "Last hour", value: (r: Run) => r.id, cell: (r: Run) => <Sparkline data={r.trend} width={84} height={24} variant="area" title={`${r.pack}, last hour`} /> },
            ]}
          />
        </div>
      </Screen>
    </div>
  );
}

/* ── Chat: Yasakia's support assistant — an answer that streams in ───────────────────────────────────────────────── */

const ANSWER = "Your table for four is booked for Friday at 7:30 pm. I added a note about the high chair. You will get a reminder on Thursday evening, and you can change the time from that message.";

export function Chat({ v = {} }: { v?: Values }) {
  const host = useRef<HTMLDivElement>(null);
  const visible = useInView(host);
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const rate = Number(v.rate ?? 24);
  const unit = String(v.unit ?? "word") as "word" | "char";
  const delay = Number(v.delay ?? 900);
  const all = tokens(ANSWER, unit);
  useEffect(() => {
    if (!visible || reduce) return;
    const began = performance.now();
    const timer = window.setInterval(() => setElapsed(performance.now() - began), 50);
    return () => window.clearInterval(timer);
  }, [visible, reduce, run, rate, unit, delay]);
  const shown = reduce ? { text: ANSWER, phase: "done" as const } : shownAt(all, elapsed, rate, delay);
  return (
    <div ref={host} data-motion-scope="">
      <Screen
        product="yasakia"
        app="Yasakia"
        title="Chez Lina · assistant"
        actions={
          <Button variant="ghost" size="sm" onClick={() => { setElapsed(0); setRun((n) => n + 1); }}>
            Replay
          </Button>
        }
      >
        <div className="lab-chat-log" role="log" aria-busy={shown.phase !== "done"} aria-label="Conversation with the restaurant's assistant">
          <MessageBubble text="Hi! Lina's assistant here. How can I help?" time="18:01" grouped="single" />
          <MessageBubble mine text="A table for 4 on Friday around 7:30? We need a high chair." time="18:02" grouped="single" />
          {shown.phase === "typing" ? <TypingIndicator label="The assistant is typing" showLabel /> : <MessageBubble text={shown.text} time="18:02" grouped="single" />}
        </div>
        <span className="lab-visually-hidden" role="status">
          {shown.phase === "done" ? "Answer complete" : ""}
        </span>
      </Screen>
    </div>
  );
}

/* ── Checkout: Akinaza's booking — steps that change through a view transition, a button that confirms ──────────── */

const SLOTS = ["9:00", "10:30", "13:00", "15:30"];
const PRICE = 45;
const GST = 0.05;
const QST = 0.09975;

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

export function Checkout({ v = {} }: { v?: Values }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [slot, setSlot] = useState("10:30");
  const [paying, setPaying] = useState(false);
  const duration = Number(v.duration ?? 320);
  const easing = String(v.easing ?? "ease-out");
  const style = String(v.style ?? "slide");
  const go = (to: number) => {
    const change = () => flushSync(() => setStep(to));
    const doc = document as ViewTransitionDoc;
    if (reduce || !doc.startViewTransition) return change();
    const root = document.documentElement;
    root.dataset.vt = `${style}-${to >= step ? "forward" : "back"}`;
    root.style.setProperty("--lab-vt-duration", `${duration}ms`);
    root.style.setProperty("--lab-vt-ease", easing);
    void doc.startViewTransition(change).finished.finally(() => delete root.dataset.vt);
  };
  const pay = () => {
    setPaying(true);
    window.setTimeout(() => {
      setPaying(false);
      go(2);
      toast.success("Booked: Tuesday " + slot + ", a confirmation is on its way");
    }, Number(v.wait ?? 1400));
  };
  const tax = (rate: number) => Math.round(PRICE * rate * 100) / 100;
  const total = PRICE + tax(GST) + tax(QST);
  const money = (n: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
  return (
    <div className="lab-vt" data-style={style}>
      <Toaster label="Notifications" closeLabel="Close" position="bottom-right" />
      <Screen product="akinaza" app="Akinaza" title="Salon Mira · book a cut">
        <StepProgress step={step + 1} total={3} label={(s, t) => `Step ${s} of ${t}`} />
        <div className="lab-vt-stage lab-checkout">
          {step === 0 && (
            <>
              <h3 className="lab-checkout-title">Pick a time on Tuesday</h3>
              <Chip.Group type="single" required label="Times on Tuesday" value={slot} onValueChange={(s) => s && setSlot(s)}>
                {SLOTS.map((s) => (
                  <Chip key={s} value={s}>
                    {s}
                  </Chip>
                ))}
              </Chip.Group>
              <div className="lab-checkout-actions">
                <Button variant="primary" onClick={() => go(1)}>
                  Continue
                </Button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h3 className="lab-checkout-title">Review · Tuesday {slot}</h3>
              <dl className="lab-receipt">
                <div><dt>Cut and style</dt><dd>{money(PRICE)}</dd></div>
                <div><dt>GST 5 %</dt><dd>{money(tax(GST))}</dd></div>
                <div><dt>QST 9.975 %</dt><dd>{money(tax(QST))}</dd></div>
                <div><dt>Total</dt><dd>{money(total)}</dd></div>
              </dl>
              <div className="lab-checkout-actions">
                <Button variant="ghost" onClick={() => go(0)}>
                  Back
                </Button>
                <Button variant="primary" loading={paying} onClick={pay}>
                  {paying ? "Booking…" : `Book and pay ${money(total)}`}
                </Button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h3 className="lab-checkout-title">See you Tuesday at {slot}</h3>
              <p className="lab-sublead">The salon has your booking. A demo: nothing was charged.</p>
              <div className="lab-checkout-actions">
                <Button variant="secondary" onClick={() => go(0)}>
                  Start again
                </Button>
              </div>
            </>
          )}
        </div>
      </Screen>
    </div>
  );
}

/* ── Delivery: an order on its way — the route draws itself, the courier travels, the arrival counts down ────────── */

const STUDIO = [-73.6005, 45.5229] as const;
const HOME = [-73.5695, 45.5268] as const;
const PATH = [STUDIO, [-73.5935, 45.5232], [-73.5862, 45.5159], [-73.5753, 45.5171], HOME] as const;

export function Delivery({ v = {} }: { v?: Values }) {
  const host = useRef<HTMLDivElement>(null);
  const visible = useInView(host);
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const [eta, setEta] = useState(12);
  const trip = Number(v.tripDuration ?? 6000);
  useEffect(() => {
    setEta(12);
    if (!visible || reduce) return;
    const timer = window.setInterval(() => setEta((m) => Math.max(1, m - 1)), trip / 11);
    return () => window.clearInterval(timer);
  }, [visible, reduce, run, trip]);
  const label = "An order from the bakery on Saint-Viateur to Parc La Fontaine";
  return (
    <div ref={host} data-motion-scope="">
      <Screen
        app="Courier"
        title="Order 4182 · on its way"
        actions={
          <Button variant="ghost" size="sm" onClick={() => setRun((n) => n + 1)}>
            Replay
          </Button>
        }
      >
        <div className="lab-delivery">
          <Map key={`${run}-${v.duration}-${trip}-${v.easing}`} label={label} center={[-73.585, 45.521]} zoom={13.2} className="lab-map-view" fallback={<StaticMap label={label} center={[-73.585, 45.521]} zoom={13.2} places={[{ position: STUDIO, label: "Bakery" }, { position: HOME, label: "You" }]} />}>
            <Route path={PATH} label="The courier's route, 3 km" draw duration={Number(v.duration ?? 1400)} courier tripDuration={trip} easing={String(v.easing ?? "ease-out") as "ease-out" | "linear" | "ease-in-out"} paused={Boolean(v.paused ?? false)} />
            <Marker position={STUDIO} label="Bakery, Saint-Viateur" drop={0} />
            <Marker position={HOME} label="You, Parc La Fontaine" drop={240} />
          </Map>
          <div className="lab-delivery-side">
            <Stat label="Arrives in" value={<span><NumberTicker value={eta} locale="en-CA" trigger="change" duration={500} /> min</span>} />
            <Progress label="Trip" value={Math.round(((12 - eta) / 11) * 100)} showLabel size="sm" />
            <p className="lab-sublead">Two croissants, one sourdough. Demo data.</p>
          </div>
        </div>
      </Screen>
    </div>
  );
}

export const SCENARIOS: Record<ScenarioId, { title: string; product: string; lead: string; View: (p: { v?: Values }) => ReactNode }> = {
  dashboard: { title: "An operations dashboard", product: "Orazaka", lead: "The runs of the day: figures that climb as runs land, new rows that arrive on top.", View: Dashboard },
  chat: { title: "A support chat", product: "Yasakia", lead: "A restaurant's assistant answers: the typing indicator, then the answer streaming in.", View: Chat },
  checkout: { title: "A booking checkout", product: "Akinaza", lead: "Pick a time, review, pay: each step crosses to the next, the button says it is working.", View: Checkout },
  delivery: { title: "A delivery on a map", product: "Courier", lead: "An order on its way: the route draws itself, the courier travels, the arrival counts down.", View: Delivery },
};
