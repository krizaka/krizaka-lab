import { Marquee } from "@krizaka/ui/marquee";

const names = ["Orazaka", "Orochia", "Yomizaka", "Kachizaka", "Akinaza", "Yasakia", "Yororis"];

export function Example() {
  return (
    <Marquee label="Built on" pauseLabel="Pause" playLabel="Play" speed={32}>
      {names.map((n) => (
        <span key={n} className="lab-g-name">{n}</span>
      ))}
    </Marquee>
  );
}
