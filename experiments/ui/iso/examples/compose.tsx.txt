import { IsoDome, IsoLink, IsoNode, IsoPrism, IsoScene, IsoTile } from "@krizaka/ui/iso";

// The primitives, composed by hand: painted back to front, each object rising in turn (`index`).
export default function IsoCompose() {
  return (
    <IsoScene label="A model served from one node" className="w-full max-w-md" extent={230} top={190} viewBox="-260 -250 520 360">
      <IsoLink from={[-40, -190]} to={[-40, -60]} label="Prompt" />
      <IsoLink from={[60, 0]} to={[190, 0]} direction="out" label="Answer" />
      <IsoDome radius={110} part="rim" />
      <IsoTile at={[-40, -190]} z={70} glyph="dots" label="Chat" index={0} />
      <IsoPrism shape="hex" size={170} height={12} index={1} />
      <IsoPrism size={92} z={16} height={34} strip label="Model" index={2} />
      <IsoPrism shape="hex" size={44} z={54} height={14} material="accent" index={3} />
      <IsoNode z={78} index={4} />
      <IsoDome radius={110} height={170} part="arc" />
      <IsoTile at={[190, 0]} z={56} glyph="lines" material="glass" label="Document" index={5} />
    </IsoScene>
  );
}
