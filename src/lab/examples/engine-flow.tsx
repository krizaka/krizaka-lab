import { ProductLogo } from "@krizaka/ui";
import { EngineFlow } from "@krizaka/ui/engine-flow";

export function Example() {
  return (
    <EngineFlow
      className="brand-orazaka lab-g-flow"
      label="An engine and the apps it serves"
      compactLayout={false}
      hub={{ label: "Orazaka", mark: <ProductLogo id="orazaka" size={40} animated={false} /> }}
      nodes={[
        {
          id: "yomizaka",
          label: "Yomizaka",
          className: "brand-yomizaka",
          mark: <ProductLogo id="yomizaka" size={22} animated={false} />,
          flow: "both",
        },
      ]}
    />
  );
}
