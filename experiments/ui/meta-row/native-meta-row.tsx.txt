import * as React from "react";
import { View, type ViewProps } from "react-native";

import { Txt } from "./txt";

export type MetaRowProps = ViewProps & {
  /** The facts, in reading order, already translated. Empty ones (`null`, `false`, "") are skipped. */
  items: ReadonlyArray<React.ReactNode>;
  /** Status chips after the facts (a `Badge`): not dot-separated. */
  chips?: ReadonlyArray<React.ReactNode>;
  /** The accessible name of the row, when its subject is not obvious. */
  label?: string;
};

const present = (n: React.ReactNode) => n !== null && n !== undefined && n !== false && n !== "";

/** The web `MetaRow`: one quiet line of dot-separated facts, with optional status chips at its end. */
export function MetaRow({ items, chips = [], label, style, ...props }: MetaRowProps) {
  const facts = items.filter(present);
  const tail = chips.filter(present);
  return (
    <View role="list" aria-label={label} {...props} style={[{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 6 }, style]}>
      {facts.map((fact, i) => (
        <View key={i} role="listitem" accessible style={{ flexDirection: "row", alignItems: "center", columnGap: 8 }}>
          {i > 0 ? (
            <Txt variant="caption" tone="muted" aria-hidden importantForAccessibility="no">
              ·
            </Txt>
          ) : null}
          {typeof fact === "string" || typeof fact === "number" ? (
            <Txt variant="caption" tone="secondary">
              {fact}
            </Txt>
          ) : (
            fact
          )}
        </View>
      ))}
      {tail.map((chip, i) => (
        <View key={`chip-${i}`} role="listitem" accessible>
          {chip}
        </View>
      ))}
    </View>
  );
}
