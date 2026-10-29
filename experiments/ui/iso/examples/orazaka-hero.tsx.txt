import { IsoHub } from "@krizaka/ui/iso";

// Sovereign servers under a dome: three stages, a lit core, requests and documents flowing in, answers flowing out.
// Wrap it in `.brand-orazaka` (or any brand) and the light follows the brand's accent.
export default function IsoOrazakaHero() {
  return (
    <IsoHub
      label="Your AI runs on your own servers"
      description="A stack of three servers — gateway, models, data — under a dome; chats and documents flow in, answers flow out."
      className="w-full max-w-xl"
      dome="Your infrastructure"
      layers={[{ label: "Data" }, { label: "Models" }, { label: "Gateway" }]}
      core="Orchestrator"
      satellites={[
        { label: "Chats", glyph: "dots", flow: "in" },
        { label: "Documents", glyph: "lines", flow: "in", material: "glass" },
        { label: "Answers", glyph: "arrow", flow: "out" },
      ]}
    />
  );
}
