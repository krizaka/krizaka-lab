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
import { type CSSProperties, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { WallMotionWall } from "./wall-motions";

import { useInView, useReducedMotion } from "./hooks";
import { defaults, type Values } from "./playground-lib";
import { CHECKOUT_KNOBS } from "./guides";
import { CheckoutPageTransition, CheckoutPayButton, checkoutMotionStyle, type CheckoutTransition } from "./checkout-motion";
import { i18n, format } from "./messages";
import { shownAt, tokens } from "./stream-lib";

export type ScenarioId = "dashboard" | "chat" | "checkout" | "delivery" | "wall";

/** An app screen: the product's mark (none for a generic app, the courier) and name, the screen's title, then the screen. Decorative chrome is the frame only. */
export function Screen({ product, app, title, children, actions }: { product?: "orazaka" | "akinaza"; app: string; title: string; children: ReactNode; actions?: ReactNode }) {
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

/* ── Chat: a support assistant — an answer that streams in ───────────────────────────────────────────────── */

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
        product="orazaka"
        app="Orazaka"
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

export function Checkout({ v = {} }: { v?: Values }) {
  const reduce = useReducedMotion();
  const words = i18n.getDictionary("en").checkout;
  const settings = { ...defaults(CHECKOUT_KNOBS), ...v };
  const host = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const transition = useRef<CheckoutTransition>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const locked = useRef(false);
  const mounted = useRef(true);
  const moved = useRef(false);
  const [step, setStep] = useState(0);
  const [slot, setSlot] = useState("10:30");
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [error, setError] = useState(false);
  const [crossing, setCrossing] = useState(false);
  const [timing, setTiming] = useState({ duration: 0, easing: "linear" });
  useLayoutEffect(() => {
    const css = getComputedStyle(host.current!);
    const time = css.getPropertyValue(String(settings.duration)).trim();
    setTiming({
      duration: reduce ? 0 : parseFloat(time) * (time.endsWith("ms") ? 1 : 1000),
      easing: css.getPropertyValue(String(settings.easing)).trim(),
    });
  }, [settings.duration, settings.easing, reduce]);
  useLayoutEffect(() => {
    if (moved.current) heading.current?.focus({ preventScroll: true });
  }, [step]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; clearTimeout(timer.current); };
  }, []);
  const go = async (to: number) => {
    setCrossing(true);
    moved.current = true;
    const forward = (to > step) === (settings.direction === "right");
    try {
      await transition.current!.change(() => { setStep(to); setError(false); }, forward ? "forward" : "back");
    } finally {
      if (mounted.current) { setCrossing(false); setPhase("idle"); }
      locked.current = false;
    }
  };
  const navigate = (to: number) => {
    if (locked.current) return;
    locked.current = true;
    void go(to);
  };
  const pay = () => {
    if (locked.current) return;
    locked.current = true;
    setError(false);
    setPhase("working");
    timer.current = setTimeout(() => {
      if (settings.fail) {
        setPhase("idle");
        setError(true);
        locked.current = false;
        return;
      }
      setPhase("done");
      timer.current = setTimeout(() => {
        void go(2).then(() => {
          if (mounted.current) toast.success(format(words.toast, { slot }));
        });
      }, reduce ? 0 : timing.duration * 2);
    }, Number(settings.wait));
  };
  const tax = (rate: number) => Math.round(PRICE * rate * 100) / 100;
  const total = PRICE + tax(GST) + tax(QST);
  const money = (n: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
  return (
    <div ref={host} className="lab-booking" data-motion-scope="" style={checkoutMotionStyle(String(settings.duration), String(settings.easing))}>
      <Toaster label={words.notifications} closeLabel={words.close} position="bottom-right" />
      <Screen product="akinaza" app="Akinaza" title={words.title} actions={<Badge tone="neutral">{words.demo}</Badge>}>
        <StepProgress step={step + 1} total={3} label={(s, t) => format(words.step, { step: s, total: t })} />
        <CheckoutPageTransition ref={transition} reduced={reduce} duration={timing.duration} easing={timing.easing}>
        <div className="lab-checkout">
          {step === 0 && (
            <>
              <h3 ref={heading} tabIndex={-1} className="lab-checkout-title">{words.pick}</h3>
              <Chip.Group type="single" required label={words.times} value={slot} onValueChange={(s) => !locked.current && s && setSlot(s)}>
                {SLOTS.map((s) => (
                  <Chip key={s} value={s}>
                    {s}
                  </Chip>
                ))}
              </Chip.Group>
              <div className="lab-checkout-actions">
                <Button variant="primary" disabled={crossing} onClick={() => navigate(1)}>
                  {words.continue}
                </Button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h3 ref={heading} tabIndex={-1} className="lab-checkout-title">{format(words.review, { slot })}</h3>
              <dl className="lab-receipt">
                <div><dt>{words.service}</dt><dd>{money(PRICE)}</dd></div>
                <div><dt>{words.gst}</dt><dd>{money(tax(GST))}</dd></div>
                <div><dt>{words.qst}</dt><dd>{money(tax(QST))}</dd></div>
                <div><dt>{words.total}</dt><dd>{money(total)}</dd></div>
              </dl>
              {error ? <p id="checkout-payment-error" className="lab-checkout-error" role="alert">{words.error}</p> : null}
              <div className="lab-checkout-actions">
                <Button variant="ghost" disabled={crossing || phase !== "idle"} onClick={() => navigate(0)}>
                  {words.back}
                </Button>
                <CheckoutPayButton phase={phase} disabled={crossing} label={format(words.pay, { total: money(total) })} working={words.working} done={words.done} onClick={pay} errorId={error ? "checkout-payment-error" : undefined} />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h3 ref={heading} tabIndex={-1} className="lab-checkout-title">{format(words.confirmed, { slot })}</h3>
              <Stat label={words.total} value={<NumberTicker value={reduce || !crossing ? total : 0} trigger="change" locale="en-CA" format={NUMBER_FORMATS.currency} duration={timing.duration} easing={timing.easing} announce />} />
              <p data-reveal="soft" style={{ "--kz-delay": "0ms" } as CSSProperties}>{format(words.summary, { slot })}</p>
              <p data-reveal="soft" style={{ "--kz-delay": "var(--lab-checkout-duration)" } as CSSProperties} className="lab-sublead">{words.nothingCharged}</p>
              <div className="lab-checkout-actions">
                <Button variant="secondary" disabled={crossing} onClick={() => navigate(0)}>
                  {words.restart}
                </Button>
              </div>
            </>
          )}
        </div>
        </CheckoutPageTransition>
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

export const SCENARIOS: Record<ScenarioId, { title: string; product: string; lead: string; View: (p: { v?: Values; motion?: string }) => ReactNode }> = {
  dashboard: { title: "An operations dashboard", product: "Orazaka", lead: "The runs of the day: figures that climb as runs land, new rows that arrive on top.", View: Dashboard },
  chat: { title: "A support chat", product: "Orazaka", lead: "A restaurant's assistant answers: the typing indicator, then the answer streaming in.", View: Chat },
  checkout: { title: "A booking checkout", product: "Akinaza", lead: "Pick a time, review, pay: each step crosses to the next, the button says it is working.", View: Checkout },
  delivery: { title: "A delivery on a map", product: "Courier", lead: "An order on its way: the route draws itself, the courier travels, the arrival counts down.", View: Delivery },
  wall: { title: "Akinaza's shop wall", product: "Akinaza", lead: "A pinned photograph, a taped note, a small sign and a screen; each motion is tuned separately.", View: WallMotionWall },
};
