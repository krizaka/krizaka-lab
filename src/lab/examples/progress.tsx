import { Button } from "@krizaka/ui/button";
import { Progress } from "@krizaka/ui/progress";
import { useState } from "react";

export function Example() {
  const [value, setValue] = useState(35);
  return (
    <div className="lab-g-col">
      <Progress value={value} label="Upload" showLabel />
      <Button variant="ghost" size="sm" onClick={() => setValue((v) => (v >= 100 ? 10 : v + 25))}>
        Advance
      </Button>
    </div>
  );
}
