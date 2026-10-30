import { IsoHub } from "@krizaka/ui/iso";

// The creator at the centre; tips, unlocks, auctions and challenges flow toward them — and 90 % stays theirs.
export default function IsoCreatorHero() {
  return (
    <IsoHub
      label="Every support flows to the creator"
      description="A creator at the centre receives tips, unlocks, auction bids and challenge pledges; 90 % of each goes to them."
      className="w-full max-w-xl"
      shape="hex"
      size={110}
      layers={[{ label: "Community", height: 16 }, { label: "Creator", height: 44, material: "accent2" }]}
      core="Payouts"
      highlight={{ strong: "90 %", text: "to the creator" }}
      satellites={[
        { label: "Tips", glyph: "coin", value: "+ €5" },
        { label: "Unlocks", glyph: "lock", value: "+ €3" },
        { label: "Auctions", glyph: "arrow", value: "€120" },
        { label: "Challenges", glyph: "flag", value: "€40" },
      ]}
    />
  );
}
