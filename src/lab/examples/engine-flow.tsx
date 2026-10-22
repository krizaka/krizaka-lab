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
        { id: "orochia", label: "Orochia", className: "brand-orochia", mark: <ProductLogo id="orochia" size={22} animated={false} />, flow: "both" },
        { id: "yomizaka", label: "Yomizaka", className: "brand-yomizaka", mark: <ProductLogo id="yomizaka" size={22} animated={false} />, flow: "both" },
        { id: "kachizaka", label: "Kachizaka", className: "brand-kachizaka", mark: <ProductLogo id="kachizaka" size={22} animated={false} />, flow: "both" },
        { id: "yororis", label: "Yororis", className: "brand-yororis", mark: <ProductLogo id="yororis" size={22} animated={false} />, flow: "in", planned: true },
      ]}
    />
  );
}
