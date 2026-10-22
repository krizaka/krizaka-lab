import { Button } from "@krizaka/ui/button";
import { useState } from "react";

export function Example() {
  const [saving, setSaving] = useState(false);
  return (
    <Button variant="primary" shape="cut" loading={saving} onClick={() => { setSaving(true); window.setTimeout(() => setSaving(false), 1600); }}>
      {saving ? "Saving" : "Save"}
    </Button>
  );
}
