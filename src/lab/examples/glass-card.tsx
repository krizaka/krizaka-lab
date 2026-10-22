import { Card } from "@krizaka/ui/card";

import { LiquidCausticsView } from "../../react/LiquidCausticsView";

export function Example() {
  return (
    <div className="lab-g-layer" data-motion-scope="">
      <div className="lab-g-back" aria-hidden>
        <LiquidCausticsView interactive={false} fluidMedium="glass" palette="prussian" showUnderlyingText={false} />
      </div>
      <Card.Root className="lab-g-front lab-g-glass">
        <Card.Body>
          <Card.Title>Glass over light</Card.Title>
          <Card.Description>The card stays readable; the light moves under it.</Card.Description>
        </Card.Body>
      </Card.Root>
    </div>
  );
}
