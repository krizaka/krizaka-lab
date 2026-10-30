import { Marquee } from "@krizaka/ui/marquee";

const names = ["Postgres", "Ollama", "Spring", "Kafka", "Keycloak", "Qdrant", "MinIO", "Grafana"];

// A band of names at 40 px/s: it pauses under the pointer or the focus, and its pause button (top right, on hover or
// focus) stops it for good. Under reduced motion it is a still row you scroll.
export default function MarqueeLogos() {
  return (
    <Marquee label="Built on open source" pauseLabel="Pause the band" playLabel="Play the band" className="w-full max-w-2xl">
      {names.map((name) => (
        <span key={name} className="font-display text-lg font-semibold text-fg-secondary">
          {name}
        </span>
      ))}
    </Marquee>
  );
}
