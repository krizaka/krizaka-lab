import { Button } from "@krizaka/ui/button";
import { Dialog } from "@krizaka/ui/dialog";

export function Example() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="secondary">Open the panel</Button>
      </Dialog.Trigger>
      <Dialog.Content closeLabel="Close" placement="right">
        <Dialog.Header>
          <Dialog.Title>Share the clip</Dialog.Title>
          <Dialog.Description>The panel slides in from the side; Escape closes it.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="primary">Done</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
