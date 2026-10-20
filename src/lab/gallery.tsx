/* Krizaka UI + Motion: real @krizaka/ui components with their motion — and, where it adds depth, a view of the lab
   behind them — grouped by use case (feedback, emphasis, data, ambient). Each one shows its live result, the exact
   imports to copy, its props and what it does under reduced motion. Words: messages → gallery.*. */

import { ProductLogo } from "@krizaka/ui";
import { AvatarRoot } from "@krizaka/ui/avatar";
import { Badge } from "@krizaka/ui/badge";
import { Button } from "@krizaka/ui/button";
import { Card } from "@krizaka/ui/card";
import { MessageBubble, TypingIndicator } from "@krizaka/ui/chat";
import { Chip } from "@krizaka/ui/chip";
import { CodeBlock } from "@krizaka/ui/code-block";
import { DataTable } from "@krizaka/ui/data-table";
import { Dialog } from "@krizaka/ui/dialog";
import { EngineFlow } from "@krizaka/ui/engine-flow";
import { GlowCard } from "@krizaka/ui/glow-card";
import { Marquee } from "@krizaka/ui/marquee";
import { NavBar } from "@krizaka/ui/nav-bar";
import { NumberTicker } from "@krizaka/ui/number-ticker";
import { Section } from "@krizaka/ui/page";
import { Progress } from "@krizaka/ui/progress";
import { Stat } from "@krizaka/ui/stat";
import { Tabs } from "@krizaka/ui/tabs";
import { Toaster, undoToast } from "@krizaka/ui/toast";
import { Waveform } from "@krizaka/ui/waveform";
import { type ReactNode, useState } from "react";

import { LiquidCausticsView } from "../react/LiquidCausticsView";
import { NeuralLatticeView } from "../react/NeuralLatticeView";
import { YororisPresenceOrb } from "../react/YororisPresenceOrb";
import { useLab } from "./context";
import type { Messages } from "./messages";

type Group = "feedback" | "emphasis" | "data" | "ambient";
type ItemId = keyof Messages["gallery"]["items"];
type Sample = Messages["gallery"]["sample"];

interface Item {
  id: ItemId;
  group: Group;
  /** The props this example uses, as a reader would set them. */
  props: string[];
  code: string;
  Live: (p: { s: Sample }) => ReactNode;
}

function ButtonLive({ s }: { s: Sample }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button variant="primary" shape="cut" shimmer magnetic loading={busy} onClick={() => { setBusy(true); window.setTimeout(() => setBusy(false), 1600); }}>
      {busy ? s.saving : s.save}
    </Button>
  );
}

function ToastLive({ s }: { s: Sample }) {
  return (
    <>
      <Toaster label={s.toasts} closeLabel={s.close} position="bottom-right" />
      <Button variant="secondary" onClick={() => undoToast(s.archived, { undoLabel: s.undo, onUndo: () => {} })}>
        {s.archived}
      </Button>
    </>
  );
}

function ProgressLive({ s }: { s: Sample }) {
  const [v, setV] = useState(35);
  return (
    <div className="lab-g-col">
      <Progress value={v} label={s.progress} showLabel />
      <Button variant="ghost" size="sm" onClick={() => setV((x) => (x >= 100 ? 10 : x + 25))}>
        {s.advance}
      </Button>
    </div>
  );
}

function DialogLive({ s }: { s: Sample }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="secondary">{s.open}</Button>
      </Dialog.Trigger>
      <Dialog.Content closeLabel={s.close} placement="right">
        <Dialog.Header>
          <Dialog.Title>{s.dialogTitle}</Dialog.Title>
          <Dialog.Description>{s.dialogText}</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="primary">{s.done}</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function BadgeLive({ s }: { s: Sample }) {
  const [p, setP] = useState("week");
  return (
    <div className="lab-g-col">
      <span className="lab-g-row">
        <Badge tone="success" dot pulse>
          {s.live}
        </Badge>
        <Badge tone="accent">{s.new}</Badge>
      </span>
      <Chip.Group type="single" required size="sm" label={s.week} value={p} onValueChange={(v) => v && setP(v)}>
        <Chip value="week">{s.week}</Chip>
        <Chip value="month">{s.month}</Chip>
        <Chip value="year">{s.year}</Chip>
      </Chip.Group>
    </div>
  );
}

function TabsLive({ s }: { s: Sample }) {
  return (
    <Tabs.Root defaultValue="week" className="lab-g-tabs">
      <Tabs.List>
        <Tabs.Trigger value="week">{s.week}</Tabs.Trigger>
        <Tabs.Trigger value="month">{s.month}</Tabs.Trigger>
        <Tabs.Trigger value="year">{s.year}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="week">{s.weekText}</Tabs.Content>
      <Tabs.Content value="month">{s.monthText}</Tabs.Content>
      <Tabs.Content value="year">{s.yearText}</Tabs.Content>
    </Tabs.Root>
  );
}

function AvatarLive({ s }: { s: Sample }) {
  return (
    <div className="lab-g-presence">
      <div className="lab-g-orb" data-motion-scope="" aria-hidden>
        <YororisPresenceOrb state="speaking" interactive={false} enableAudio={false} />
      </div>
      <AvatarRoot alt="Léa" fallback="L" size="lg" className="lab-g-avatar" />
      <span className="lab-g-caption">{s.speaking}</span>
    </div>
  );
}

function StatLive({ s }: { s: Sample }) {
  return <Stat label={s.revenue} value={<NumberTicker value={5940} />} trend="up" trendLabel="+12 %" />;
}

const ROWS = [
  { id: "a", name: "Golden hour", status: "Live", plays: 1284 },
  { id: "b", name: "Canal walk", status: "Encoding", plays: 312 },
  { id: "c", name: "Night market", status: "Live", plays: 4120 },
];

function TableLive({ s }: { s: Sample }) {
  return (
    <DataTable
      caption={s.table}
      rows={ROWS}
      getRowId={(r) => r.id}
      columns={[
        { id: "name", header: s.name, value: (r: (typeof ROWS)[number]) => r.name },
        { id: "status", header: s.status, value: (r: (typeof ROWS)[number]) => r.status },
        { id: "plays", header: s.plays, value: (r: (typeof ROWS)[number]) => r.plays, align: "end" },
      ]}
      selectable
      defaultSelected={["b"]}
      labels={{ selectRow: () => s.selectRow, selectAll: s.selectAll }}
      density="compact"
    />
  );
}

function FlowLive({ s }: { s: Sample }) {
  const ids = ["orochia", "yomizaka", "kachizaka", "yororis"] as const;
  return (
    <EngineFlow
      className="brand-orazaka lab-g-flow"
      label={s.flow}
      compactLayout={false}
      hub={{ label: "Orazaka", mark: <ProductLogo id="orazaka" size={40} animated={false} /> }}
      nodes={ids.map((id, i) => ({ id, label: id[0]!.toUpperCase() + id.slice(1), className: `brand-${id}`, mark: <ProductLogo id={id} size={22} animated={false} />, flow: i < 3 ? "both" : "in", planned: i === 3 }))}
    />
  );
}

function LatticeLive({ s }: { s: Sample }) {
  return (
    <div className="lab-g-layer" data-motion-scope="">
      <div className="lab-g-back" aria-hidden>
        <NeuralLatticeView interactive={false} nodeCount={70} theme="prussian-cyan" />
      </div>
      <Card.Root className="lab-g-front">
        <Card.Body>
          <Card.Title>{s.lattice}</Card.Title>
          <Card.Description>{s.latticeText}</Card.Description>
        </Card.Body>
      </Card.Root>
    </div>
  );
}

function GlassLive({ s }: { s: Sample }) {
  return (
    <div className="lab-g-layer" data-motion-scope="">
      <div className="lab-g-back" aria-hidden>
        <LiquidCausticsView interactive={false} fluidMedium="glass" palette="prussian" showUnderlyingText={false} />
      </div>
      <Card.Root className="lab-g-front lab-g-glass">
        <Card.Body>
          <Card.Title>{s.glass}</Card.Title>
          <Card.Description>{s.glassText}</Card.Description>
        </Card.Body>
      </Card.Root>
    </div>
  );
}

function ChatLive({ s }: { s: Sample }) {
  return (
    <div className="lab-g-col lab-g-chat">
      <MessageBubble text={s.bubbleA} time="14:02" />
      <MessageBubble text={s.bubbleB} time="14:03" mine />
      <TypingIndicator label={s.typing} showLabel />
    </div>
  );
}

function MarqueeLive({ s }: { s: Sample }) {
  return (
    <Marquee label={s.partners} pauseLabel={s.pause} playLabel={s.play} speed={32}>
      {["Orazaka", "Orochia", "Yomizaka", "Kachizaka", "Akinaza", "Yasakia", "Yororis"].map((n) => (
        <span key={n} className="lab-g-name">
          {n}
        </span>
      ))}
    </Marquee>
  );
}

function NavBarLive({ s }: { s: Sample }) {
  const [at, setAt] = useState("home");
  return (
    <NavBar.Root label={s.nav} className="lab-g-nav">
      <NavBar.Items>
        {(["home", "demos", "about"] as const).map((k) => (
          <NavBar.Link key={k} active={at === k} asChild>
            <button type="button" onClick={() => setAt(k)}>
              {s[k]}
            </button>
          </NavBar.Link>
        ))}
      </NavBar.Items>
    </NavBar.Root>
  );
}

function GlowLive({ s }: { s: Sample }) {
  return (
    <GlowCard alive className="lab-glow brand-orazaka">
      <strong>{s.glowTitle}</strong>
      <span>{s.glowText}</span>
    </GlowCard>
  );
}

function WaveformLive({ s }: { s: Sample }) {
  const [on, setOn] = useState(true);
  return (
    <div className="lab-g-row">
      <Button variant="secondary" size="sm" onClick={() => setOn((x) => !x)} aria-pressed={on}>
        {on ? s.pause : s.play}
      </Button>
      <Waveform playing={on} bars={32} size="lg" label={s.listening} />
    </div>
  );
}

const MOTION = "// The lab's views are not on npm: krizaka/krizaka-motion src/react";

export const GALLERY: Item[] = [
  { id: "button", group: "feedback", Live: ButtonLive, props: ["variant", "shape=\"cut\"", "shimmer", "magnetic", "loading"],
    code: `import { Button } from "@krizaka/ui/button";\n\n<Button variant="primary" shape="cut" shimmer magnetic loading={saving}>\n  Save\n</Button>` },
  { id: "toast", group: "feedback", Live: ToastLive, props: ["label", "closeLabel", "position", "undoLabel", "onUndo"],
    code: `import { Toaster, undoToast } from "@krizaka/ui/toast";\n\n<Toaster label="Notifications" closeLabel="Close" />\nundoToast("Message archived", { undoLabel: "Undo", onUndo: restore });` },
  { id: "progress", group: "feedback", Live: ProgressLive, props: ["value", "label", "showLabel", "max", "variant"],
    code: `import { Progress } from "@krizaka/ui/progress";\n\n<Progress value={60} label="Upload" showLabel />` },
  { id: "dialog", group: "feedback", Live: DialogLive, props: ["placement=\"right\"", "closeLabel", "Dialog.Trigger", "Dialog.Close"],
    code: `import { Dialog } from "@krizaka/ui/dialog";\n\n<Dialog.Root>\n  <Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger>\n  <Dialog.Content placement="right" closeLabel="Close">\n    <Dialog.Title>Share the clip</Dialog.Title>\n  </Dialog.Content>\n</Dialog.Root>` },
  { id: "glow-card", group: "emphasis", Live: GlowLive, props: ["alive", "glow", "className=\"brand-…\""],
    code: `import { GlowCard } from "@krizaka/ui/glow-card";\n\n<GlowCard alive className="brand-orazaka">…</GlowCard>` },
  { id: "badge", group: "emphasis", Live: BadgeLive, props: ["tone", "dot", "pulse", "Chip.Group type=\"single\""],
    code: `import { Badge } from "@krizaka/ui/badge";\nimport { Chip } from "@krizaka/ui/chip";\n\n<Badge tone="success" dot pulse>Live</Badge>\n<Chip.Group type="single" label="Period" defaultValue="week">\n  <Chip value="week">Week</Chip>\n  <Chip value="month">Month</Chip>\n</Chip.Group>` },
  { id: "tabs", group: "emphasis", Live: TabsLive, props: ["defaultValue", "variant", "Tabs.Trigger value"],
    code: `import { Tabs } from "@krizaka/ui/tabs";\n\n<Tabs.Root defaultValue="week">\n  <Tabs.List>\n    <Tabs.Trigger value="week">Week</Tabs.Trigger>\n    <Tabs.Trigger value="month">Month</Tabs.Trigger>\n  </Tabs.List>\n  <Tabs.Content value="week">…</Tabs.Content>\n</Tabs.Root>` },
  { id: "avatar-presence", group: "emphasis", Live: AvatarLive, props: ["state=\"speaking\"", "interactive", "enableAudio", "Avatar size"],
    code: `import { AvatarRoot } from "@krizaka/ui/avatar";\nimport { YororisPresenceOrb } from "@krizaka/motion/react"; ${MOTION}\n\n<div data-motion-scope>\n  <YororisPresenceOrb state="speaking" interactive={false} />\n  <AvatarRoot alt="Léa" fallback="L" size="lg" />\n</div>` },
  { id: "stat", group: "data", Live: StatLive, props: ["label", "value", "trend", "trendLabel", "NumberTicker value"],
    code: `import { NumberTicker } from "@krizaka/ui/number-ticker";\nimport { Stat } from "@krizaka/ui/stat";\n\n<Stat label="Plays this month" value={<NumberTicker value={5940} />} trend="up" trendLabel="+12 %" />` },
  { id: "data-table", group: "data", Live: TableLive, props: ["rows", "columns", "selectable", "defaultSelected", "density"],
    code: `import { DataTable } from "@krizaka/ui/data-table";\n\n<DataTable caption="Recent clips" rows={rows} columns={columns}\n  getRowId={(r) => r.id} selectable defaultSelected={[changedId]} density="compact" />` },
  { id: "engine-flow", group: "data", Live: FlowLive, props: ["hub", "nodes[].flow", "nodes[].planned", "layout", "compactLayout", "particles", "conduit"],
    code: `import { EngineFlow } from "@krizaka/ui/engine-flow";\n\n<EngineFlow label="An engine and the apps it serves" layout="radial"\n  hub={{ label: "Orazaka" }}\n  nodes={[{ id: "orochia", label: "Orochia", flow: "both" }, { id: "yororis", label: "Yororis", planned: true }]} />` },
  { id: "lattice-card", group: "data", Live: LatticeLive, props: ["nodeCount", "theme", "interactive", "Card.Root"],
    code: `import { Card } from "@krizaka/ui/card";\nimport { NeuralLatticeView } from "@krizaka/motion/react"; ${MOTION}\n\n<div data-motion-scope>\n  <NeuralLatticeView interactive={false} nodeCount={70} />\n  <Card.Root><Card.Body><Card.Title>Live signals</Card.Title></Card.Body></Card.Root>\n</div>` },
  { id: "waveform", group: "ambient", Live: WaveformLive, props: ["playing", "bars", "size", "tone", "label"],
    code: `import { Waveform } from "@krizaka/ui/waveform";\n\n<Waveform playing={isPlaying} bars={32} size="lg" label="Voice" />` },
  { id: "chat", group: "ambient", Live: ChatLive, props: ["text", "mine", "time", "TypingIndicator label"],
    code: `import { MessageBubble, TypingIndicator } from "@krizaka/ui/chat";\n\n<MessageBubble text="Can we move to Saturday?" time="14:02" />\n<MessageBubble text="Yes — 10:30 works." time="14:03" mine />\n<TypingIndicator label="Léa is typing" showLabel />` },
  { id: "marquee", group: "ambient", Live: MarqueeLive, props: ["label", "pauseLabel", "playLabel", "speed", "direction"],
    code: `import { Marquee } from "@krizaka/ui/marquee";\n\n<Marquee label="Built on" pauseLabel="Pause" playLabel="Play" speed={32}>\n  {names.map((n) => <span key={n}>{n}</span>)}\n</Marquee>` },
  { id: "navbar", group: "ambient", Live: NavBarLive, props: ["label", "NavBar.Link active", "asChild"],
    code: `import { NavBar } from "@krizaka/ui/nav-bar";\n\n<NavBar.Root label="Main">\n  <NavBar.Items>\n    <NavBar.Link href="/" active>Home</NavBar.Link>\n    <NavBar.Link href="/demos">Demos</NavBar.Link>\n  </NavBar.Items>\n</NavBar.Root>` },
  { id: "glass-card", group: "ambient", Live: GlassLive, props: ["fluidMedium", "palette", "interactive", "Card.Root"],
    code: `import { Card } from "@krizaka/ui/card";\nimport { LiquidCausticsView } from "@krizaka/motion/react"; ${MOTION}\n\n<div data-motion-scope>\n  <LiquidCausticsView interactive={false} fluidMedium="glass" />\n  <Card.Root><Card.Body><Card.Title>Glass over light</Card.Title></Card.Body></Card.Root>\n</div>` },
];

const GROUPS: Group[] = ["feedback", "emphasis", "data", "ambient"];

export function Gallery() {
  const { t } = useLab();
  const g = t.gallery;
  return (
    <>
      {GROUPS.map((group, gi) => (
        <Section key={group} id={group} eyebrow={g.groups[group]} title={g.groupLeads[group]} headingSize="sm" divider={gi > 0}>
          <ul className="lab-gallery">
            {GALLERY.filter((i) => i.group === group).map((item) => {
              const w = g.items[item.id];
              const Live = item.Live;
              return (
                <li key={item.id} id={item.id} className="lab-g-item">
                  <div className="lab-g-live">
                    <Live s={g.sample} />
                  </div>
                  <div className="lab-g-text">
                    <h3>{w.title}</h3>
                    <p>{w.what}</p>
                    <dl>
                      <dt>{g.props}</dt>
                      <dd>
                        {item.props.map((p) => (
                          <code key={p}>{p}</code>
                        ))}
                      </dd>
                      <dt>{g.reduced}</dt>
                      <dd>{w.reduced}</dd>
                    </dl>
                    <CodeBlock code={item.code} language="tsx" copyLabel={g.copy} copiedLabel={g.copied} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>
      ))}
    </>
  );
}
