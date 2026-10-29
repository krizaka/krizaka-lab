import type { ComponentMeta } from "../meta";

export const meta = {
  title: "Photo grid",
  summary: "A profile's photos in slots: the first is the main one, empty slots invite to add, photos reorder by drag (web), by their menu (React Native) or by buttons — every move announced.",
  status: "beta",
  category: "media",
  domain: "media",
  platforms: "both",
  parity: { desktop: "web" },
  whenToUse: ["A dating profile's photos, the first one shown first.", "A product's gallery to order before publishing."],
  whenNotToUse: [
    { when: "To pick the files themselves.", use: "media-picker" },
    { when: "To show photos full screen.", use: "image-viewer" },
  ],
  bestPractices: ["Mark the required slots (`required`).", "Open the `MediaPicker`, the camera or the `MediaEditor` from `onAdd`, then add what comes back."],
  accessibility: {
    keyboard: [{ keys: "Tab", action: "Moves through the photos and their buttons (earlier, later, remove)." }],
    notes: ["Each photo is named by its position and words, the main one says so.", "Every move is announced; React Native offers the same moves as accessibility actions."],
  },
  related: ["media-picker", "image-viewer"],
  web: {
    imports: ["PhotoGrid"],
    examples: [
      { name: "profile-photos", title: "Profile photos", description: "Three photos, the first main, two required." },
    ],
  },
  native: {
    imports: ["PhotoGrid"],
    differences: ["A tap or a long press opens the photo's menu (an `ActionSheet`) instead of drag and drop."],
    examples: [
      { name: "profile-photos", title: "Profile photos", description: "Two photos, a menu per photo, a tick on each move." },
    ],
  },
} satisfies ComponentMeta;
