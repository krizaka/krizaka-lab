import { Badge } from "@krizaka/ui/badge";
import { Chip } from "@krizaka/ui/chip";
import { useState } from "react";

export function Example() {
  const [period, setPeriod] = useState("week");
  return (
    <div className="lab-g-col">
      <span className="lab-g-row">
        <Badge tone="success" dot pulse>Live</Badge>
        <Badge tone="accent">New</Badge>
      </span>
      <Chip.Group type="single" required size="sm" label="Period" value={period} onValueChange={(v) => v && setPeriod(v)}>
        <Chip value="week">Week</Chip>
        <Chip value="month">Month</Chip>
        <Chip value="year">Year</Chip>
      </Chip.Group>
    </div>
  );
}
