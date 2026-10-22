import { Card } from "@krizaka/ui/card";

import { NeuralLatticeView } from "../../react/NeuralLatticeView";

export function Example() {
  return (
    <div className="lab-g-layer" data-motion-scope="">
      <div className="lab-g-back" aria-hidden>
        <NeuralLatticeView interactive={false} nodeCount={70} theme="prussian-cyan" />
      </div>
      <Card.Root className="lab-g-front">
        <Card.Body>
          <Card.Title>Live signals</Card.Title>
          <Card.Description>1,284 events in the last minute.</Card.Description>
        </Card.Body>
      </Card.Root>
    </div>
  );
}
