import { Marquee } from "@krizaka/ui/marquee";

const quotes = [
  { who: "Maya, illustrator", text: "My supporters see exactly where their tip goes." },
  { who: "Eric, filmmaker", text: "I sold a cut to the highest bidder, live." },
  { who: "Sam, musician", text: "90 % to me — and it shows on every payout." },
];

// Cards sliding the other way, slower; each card's text is read once (the copy is hidden from assistive technology).
export default function MarqueeCards() {
  return (
    <Marquee label="What creators say" pauseLabel="Pause" playLabel="Play" direction="right" speed={24} className="w-full max-w-2xl">
      {quotes.map((q) => (
        <figure key={q.who} className="w-72 rounded-xl border border-border-default bg-surface-1 p-4">
          <blockquote className="text-sm text-fg">“{q.text}”</blockquote>
          <figcaption className="mt-2 text-xs text-fg-secondary">{q.who}</figcaption>
        </figure>
      ))}
    </Marquee>
  );
}
