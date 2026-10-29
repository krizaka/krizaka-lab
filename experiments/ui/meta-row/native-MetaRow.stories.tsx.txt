import type { Meta, StoryObj } from "@storybook/react-vite";

import VideoExample from "../../registry/examples/meta-row/native/video";
import { nativeFrame } from "./story-frame";

/** Native — one quiet line of dot-separated facts with status chips. Each story renders a named example of the registry. */
const meta = { title: "Native/MetaRow", decorators: [nativeFrame] } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Video: Story = { render: () => <VideoExample /> };
