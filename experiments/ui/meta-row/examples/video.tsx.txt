import { Badge } from "@krizaka/ui/badge";
import { MetaRow } from "@krizaka/ui/meta-row";

// Under a title: five short facts and the one chip that matters. Everything is already translated.
export default function MetaRowVideo() {
  return <MetaRow aria-label="Video" items={["HD 720p", "9:16", "0:05", "24 fps", "Oct 16, 2026"]} chips={[<Badge key="ai" tone="accent" size="md">AI-generated</Badge>]} />;
}
