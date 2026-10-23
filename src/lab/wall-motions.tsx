import { Badge } from "@krizaka/ui/badge";
import { Button } from "@krizaka/ui/button";
import { Card } from "@krizaka/ui/card";
import { useState, type CSSProperties } from "react";

import type { GuideId } from "./guides";
import { guideById } from "./guides";
import { useLab } from "./context";
import { defaults, type Values } from "./playground-lib";
import { Screen } from "./scenarios";
import "./wall-motions.css";

const VARIABLE_NAMES: Record<string, string> = {
  duration: "duration",
  bounce: "bounce",
  pressure: "pressure",
  period: "sway-duration",
  amplitude: "sway-angle",
  haze: "haze",
  easing: "ease",
};

function wallStyle(motion: GuideId, values: Values): CSSProperties {
  const knobs = guideById(motion).knobs;
  const settings = { ...defaults(knobs), ...values };
  const style: Record<string, string | number> = {};
  for (const [key, name] of Object.entries(VARIABLE_NAMES)) {
    const value = settings[key];
    if (value === undefined) continue;
    const knob = knobs.find((item) => item.key === key);
    const unit = key === "amplitude" ? "deg" : knob?.kind === "range" ? knob.unit ?? "" : "";
    style[`--kz-wall-${name}`] = key === "easing" ? String(value) : `${value}${unit}`;
  }
  return style as CSSProperties;
}

const dataFor = (motion: string, name: string) =>
  motion === name ? { "data-wall-animation": "", [`data-kz-${name}`]: "" } : {};

export function WallMotionWall({ v = {}, motion = "pin-drop" }: { v?: Values; motion?: string }) {
  const { t } = useLab();
  const [replay, setReplay] = useState(0);
  const guideId = motion as GuideId;
  const settings = { ...defaults(guideById(guideId).knobs), ...v };
  const style = wallStyle(guideId, v);
  const flickers = String(settings.flickers ?? "3");

  return (
    <div className="lab-wall-scope" data-motion-scope="">
      <Screen
        product="akinaza"
        app={t.wall.app}
        title={t.wall.title}
        actions={
          <>
            <Badge tone="neutral">{t.wall.demo}</Badge>
            <Button variant="ghost" size="sm" onClick={() => setReplay((n) => n + 1)}>
              {t.wall.replay}
            </Button>
          </>
        }
      >
        <div key={`${motion}-${replay}-${JSON.stringify(v)}`} className="lab-wall" data-motion={motion} style={style}>
          <Card.Root className="lab-wall-note" {...dataFor(motion, "pin-drop")}>
            <Card.Body>
              <Card.Title>{t.wall.note}</Card.Title>
              <Card.Description>{t.wall.hours}</Card.Description>
              <Badge className="lab-wall-tape" tone="accent" {...dataFor(motion, "tape-stick")}>
                {t.wall.tape}
              </Badge>
            </Card.Body>
          </Card.Root>

          <Card.Root className="lab-wall-paper" {...dataFor(motion, "paper-sway")}>
            <Card.Media aspect="portrait" className="lab-wall-photo" {...dataFor(motion, "develop")}>
              <span>{t.wall.photo}</span>
            </Card.Media>
            <Card.Body>
              <Card.Title>{t.wall.caption}</Card.Title>
              <Card.Description>{t.wall.captionNote}</Card.Description>
            </Card.Body>
          </Card.Root>

          <Card.Root className="lab-wall-display-card">
            <Card.Body>
              <Card.Title>{t.wall.display}</Card.Title>
              <div
                className="lab-wall-display"
                {...(motion === "crt-power-on" ? dataFor(motion, "crt-power-on") : {})}
                {...(motion === "crt-power-off" ? dataFor(motion, "crt-power-off") : {})}
              >
                {t.wall.open}
              </div>
            </Card.Body>
          </Card.Root>

          <Button
            variant="secondary"
            className="lab-wall-sign"
            {...dataFor(motion, "neon-flicker")}
            data-kz-flickers={flickers}
          >
            {t.wall.sign}
          </Button>
        </div>
      </Screen>
    </div>
  );
}
