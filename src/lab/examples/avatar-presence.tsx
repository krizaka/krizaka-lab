import { AvatarRoot } from "@krizaka/ui/avatar";

import { YororisPresenceOrb } from "../../react/YororisPresenceOrb";

export function Example() {
  return (
    <div className="lab-g-presence">
      <div className="lab-g-orb" data-motion-scope="" aria-hidden>
        <YororisPresenceOrb state="speaking" interactive={false} enableAudio={false} />
      </div>
      <AvatarRoot alt="Léa" fallback="L" size="lg" className="lab-g-avatar" />
      <span className="lab-g-caption">Léa is speaking</span>
    </div>
  );
}
