import { Button } from "@krizaka/ui/button";
import { Toaster, undoToast } from "@krizaka/ui/toast";

export function Example() {
  return (
    <>
      <Toaster label="Notifications" closeLabel="Close" position="bottom-right" />
      <Button variant="secondary" onClick={() => undoToast("Message archived", { undoLabel: "Undo", onUndo: () => {} })}>
        Message archived
      </Button>
    </>
  );
}
