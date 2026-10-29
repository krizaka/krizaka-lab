import { IsoHub } from "@krizaka/ui/iso";

// `animated={false}`: the still frame — the picture prefers-reduced-motion shows, composed, never cut mid-way.
export default function IsoStill() {
  return (
    <IsoHub
      label="A server under a dome"
      className="w-full max-w-sm"
      animated={false}
      dome
      layers={[{}, {}]}
      satellites={[{ label: "Requests", glyph: "dots" }, { label: "Files", glyph: "lines", material: "glass" }]}
    />
  );
}
