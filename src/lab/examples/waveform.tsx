import { Button } from "@krizaka/ui/button";
import { Waveform } from "@krizaka/ui/waveform";
import { useState } from "react";

export function Example() {
  const [playing, setPlaying] = useState(true);
  return (
    <div className="lab-g-row">
      <Button variant="secondary" size="sm" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
        {playing ? "Pause" : "Play"}
      </Button>
      <Waveform playing={playing} bars={32} size="lg" label="Voice" />
    </div>
  );
}
