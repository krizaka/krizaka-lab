import { MessageBubble, TypingIndicator } from "@krizaka/ui/chat";

export function Example() {
  return (
    <div className="lab-g-col lab-g-chat">
      <MessageBubble text="Can we move to Saturday?" time="14:02" />
      <MessageBubble text="Yes — 10:30 works." time="14:03" mine />
      <TypingIndicator label="Léa is typing" showLabel />
    </div>
  );
}
