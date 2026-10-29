import { Badge } from "@krizaka/ui/badge";
import { MetaRow } from "@krizaka/ui/meta-row";

// A chip only for the state that is not the usual one: here the video is still encoding.
export default function MetaRowStatus() {
  return <MetaRow aria-label="Video" size="md" items={["0:05", "Oct 16, 2026", null]} chips={[<Badge key="s" tone="warning">Encoding</Badge>]} />;
}
