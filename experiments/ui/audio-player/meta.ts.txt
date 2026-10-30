import type { ComponentMeta } from "../meta";

export const meta = {
  title: "Audio player",
  summary: "A sound with a waveform you seek on — the peaks given by the server or computed once with Web Audio — play, time and speed, paused when it leaves the screen.",
  status: "beta",
  category: "media",
  domain: "media",
  platforms: "web",
  parity: { native: { status: "gap", issue: "krizaka/krizaka-ui#278", reason: "Needs an Expo audio module as an optional peer; voice notes will need it." }, desktop: "web" },
  whenToUse: [
    "For a voice note, a podcast extract, a generated voice, a music preview.",
    "When the shape of the sound helps to find a moment (speech and silences).",
  ],
  whenNotToUse: [
    { when: "For a sound with a picture: the video player.", use: "video-player" },
    { when: "To show a value along a bar without a sound: a progress bar.", use: "progress" },
  ],
  bestPractices: [
    "Compute the peaks on the server once (`peaks`); `computePeaks` downloads and decodes the whole file in the browser.",
    "Give `duration` when you know it: the time shows before the metadata arrives.",
    "Name the player by its content (“Voice note from Eric, 0:42”).",
  ],
  accessibility: {
    keyboard: [
      { keys: "Arrow keys", action: "Back or forward 5 seconds on the waveform." },
      { keys: "Page Up / Page Down", action: "Back or forward 30 seconds." },
      { keys: "Home / End", action: "The start or the end." },
    ],
    notes: [
      "A `group` named by `title`; the waveform is a `slider` whose value is read as a time (“0:42 of 3:10”).",
      "The play button says its state (“Pause” while playing); the speed button its speed.",
      "The bars are decorative; only the colour of the played part changes, nothing moves.",
    ],
  },
  related: ["video-player", "slider", "progress"],
  web: {
    imports: ["AudioPlayer", "resamplePeaks", "computeAudioPeaks"],
    examples: [
      { name: "voice-note", title: "Voice note", description: "Peaks from the server, a short note." },
      { name: "podcast", title: "Podcast extract", description: "More bars and four speeds." },
    ],
  },
} satisfies ComponentMeta;
