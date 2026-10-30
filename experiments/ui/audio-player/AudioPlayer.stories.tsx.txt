import type { Meta, StoryObj } from "@storybook/react-vite";

import PodcastExample from "../../registry/examples/audio-player/podcast";
import VoiceNoteExample from "../../registry/examples/audio-player/voice-note";

/**
 * AudioPlayer: each story renders a named example of the registry (`registry/examples/audio-player/*`) — the code
 * ui.krizaka.com shows.
 */
const meta = {
  title: "Primitives/AudioPlayer",
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const VoiceNote: Story = { render: () => <VoiceNoteExample /> };
export const Podcast: Story = { render: () => <PodcastExample /> };
