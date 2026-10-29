import { Badge, MetaRow } from "@krizaka/ui/native";

export default function NativeMetaRowVideo() {
  return <MetaRow label="Video" items={["HD 720p", "9:16", "0:05", "Oct 16, 2026"]} chips={[<Badge key="ai" tone="accent" size="md">AI-generated</Badge>]} />;
}
