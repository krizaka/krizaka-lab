import { CodeBlock } from "@krizaka/ui/code-block";
import { HowItWorksPage } from "@krizaka/ui/how-it-works-page";
import { Mascot } from "@krizaka/ui/mascots";

const copy = { copyLabel: "Copy", copiedLabel: "Copied" };

// TEMPLATE — how a product works, in steps along a line (Orazaka's journey of a request): each step its words beside
// its visual, the sides alternating on a wide screen, one column on a phone.
export default function HowItWorksPageOrazaka() {
  return (
    <HowItWorksPage
      brand="orazaka"
      back={{ href: "#orazaka", label: "Orazaka" }}
      eyebrow="How it works"
      title="The journey of a request"
      lead="Six stages, the same for every request — and none of them leaves your server."
      aside={<Mascot bird="duck" mood="thinking" size={112} />}
      stepsLabel="The steps"
      steps={[
        { id: "install", title: "Install", text: "One command pulls the engine, the models you choose and the console.", visual: <CodeBlock code="npx orazaka install" language="bash" file="Terminal" {...copy} /> },
        { id: "guard", title: "Guard", text: "Every request crosses the same interceptors: identity, quotas, the rules of your workspace.", visual: <CodeBlock code="orazaka rules add --deny pii-export" language="bash" file="Terminal" {...copy} /> },
        { id: "answer", title: "Answer", text: "The best local model answers; the answer is checked before it is shown.", visual: <CodeBlock code="orazaka chat --model llama3.3" language="bash" file="Terminal" {...copy} /> },
      ]}
    />
  );
}
