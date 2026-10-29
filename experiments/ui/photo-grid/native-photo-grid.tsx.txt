import * as React from "react";
import { Image, Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { ActionSheet } from "./action-sheet";
import { useTheme } from "./theme";
import { Txt } from "./txt";

/** A photo of the grid. */
export type GridPhoto = {
  /** A stable id. */
  id: string;
  /** Its URI. */
  uri: string;
  /** What it shows — its accessible name. */
  alt?: string;
};

export type PhotoGridLabels = {
  /** An empty slot's button (“Add a photo”). */
  add: string;
  /** The first photo's badge (“Main”). */
  main: string;
  /** A photo's menu title: `(n) => "Photo " + n`. */
  photo: (position: number) => string;
  /** Make it the main photo. */
  makeMain: string;
  /** Move it one place earlier. */
  moveEarlier: string;
  /** Move it one place later. */
  moveLater: string;
  /** Remove it. */
  remove: string;
  /** Cancel. */
  cancel: string;
};

export type PhotoGridProps = {
  /** The photos, in order: the first is the main one. */
  value: readonly GridPhoto[];
  /** Called with the new order, or without a removed photo. */
  onValueChange: (photos: GridPhoto[]) => void;
  /** Called by an empty slot: open the `MediaPicker`, the camera or the editor, then add what comes back. */
  onAdd?: () => void;
  /** How many slots. Default 6. */
  slots?: number;
  /** Fewest photos required: the empty slots up to it are marked. Default 1. */
  required?: number;
  /** Columns. Default 3. */
  columns?: number;
  /** The words, passed translated. */
  labels: PhotoGridLabels;
  /** Styles merged last. */
  style?: StyleProp<ViewStyle>;
};

/**
 * A profile's photos in a grid of slots — the first one is the main photo, empty slots invite to add. A long press (or
 * a tap) opens a photo's menu: make it the main one, move it earlier or later, remove it; every move is a tick, and
 * screen readers get the same actions on each photo.
 */
export function PhotoGrid({ value, onValueChange, onAdd, slots = 6, required = 1, columns = 3, labels, style }: PhotoGridProps) {
  const { theme, radius, haptic } = useTheme();
  const [menu, setMenu] = React.useState<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [photo] = next.splice(from, 1);
    next.splice(to, 0, photo!);
    haptic("selection");
    onValueChange(next);
  };
  const remove = (i: number) => {
    haptic("impact");
    onValueChange(value.filter((_, j) => j !== i));
  };
  const width = `${100 / columns}%` as const;
  return (
    <View style={[styles.grid, style]}>
      {Array.from({ length: slots }, (_, i) => {
        const photo = value[i];
        const cell = [styles.slot, { borderRadius: radius.lg, aspectRatio: 3 / 4 }];
        return (
          <View key={photo?.id ?? `empty-${i}`} style={[styles.cell, { width }]}>
            {photo ? (
              <Pressable
                role="button"
                aria-label={[labels.photo(i + 1), photo.alt, i === 0 ? labels.main : null].filter(Boolean).join(", ")}
                onPress={() => setMenu(i)}
                onLongPress={() => {
                  haptic("impact");
                  setMenu(i);
                }}
                accessibilityActions={[
                  ...(i > 0 ? [{ name: "makeMain", label: labels.makeMain }, { name: "earlier", label: labels.moveEarlier }] : []),
                  ...(i < value.length - 1 ? [{ name: "later", label: labels.moveLater }] : []),
                  { name: "remove", label: labels.remove },
                ]}
                onAccessibilityAction={(e) => {
                  const name = e.nativeEvent.actionName;
                  if (name === "makeMain") move(i, 0);
                  if (name === "earlier") move(i, i - 1);
                  if (name === "later") move(i, i + 1);
                  if (name === "remove") remove(i);
                }}
                style={[...cell, { backgroundColor: theme.surface3, overflow: "hidden" }]}
              >
                <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                {i === 0 ? (
                  <View style={[styles.main, { backgroundColor: theme.accent, borderRadius: radius.full }]}>
                    <Txt variant="caption" tone="onAccent" style={styles.mainText}>
                      {labels.main}
                    </Txt>
                  </View>
                ) : null}
              </Pressable>
            ) : (
              <Pressable
                role="button"
                aria-label={labels.add}
                disabled={!onAdd || i > value.length}
                onPress={onAdd}
                style={({ pressed }) => [
                  ...cell,
                  styles.empty,
                  { borderColor: i < required ? theme.accent : theme.borderStrong, backgroundColor: pressed ? theme.surface2 : theme.surface1, opacity: i > value.length ? 0.5 : 1 },
                ]}
              >
                <View style={[styles.plus, { backgroundColor: i === value.length ? theme.accent : theme.surface3, borderRadius: radius.full }]}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" aria-hidden>
                    <Path d="M12 5v14M5 12h14" stroke={i === value.length ? theme.onAccent : theme.textSecondary} strokeWidth={2.6} strokeLinecap="round" />
                  </Svg>
                </View>
              </Pressable>
            )}
          </View>
        );
      })}
      <ActionSheet
        open={menu !== null}
        onOpenChange={(open) => !open && setMenu(null)}
        title={menu !== null ? labels.photo(menu + 1) : ""}
        cancelLabel={labels.cancel}
        actions={
          menu === null
            ? []
            : [
                ...(menu > 0 ? [{ label: labels.makeMain, onPress: () => move(menu, 0) }, { label: labels.moveEarlier, onPress: () => move(menu, menu - 1) }] : []),
                ...(menu < value.length - 1 ? [{ label: labels.moveLater, onPress: () => move(menu, menu + 1) }] : []),
                { label: labels.remove, destructive: true, onPress: () => remove(menu) },
              ]
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  cell: { padding: 4 },
  slot: { width: "100%" },
  empty: { borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  plus: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  main: { position: "absolute", left: 6, bottom: 6, paddingHorizontal: 8, paddingVertical: 2 },
  mainText: { fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
});
