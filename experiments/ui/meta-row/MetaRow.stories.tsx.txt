import type { Meta, StoryObj } from "@storybook/react-vite";

import StatusExample from "../../registry/examples/meta-row/status";
import VideoExample from "../../registry/examples/meta-row/video";

/** MetaRow. Each story renders a named example of the registry (`registry/examples/meta-row/*`): the code ui.krizaka.com shows. */
const meta = { title: "Primitives/MetaRow" } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Video: Story = { render: () => <VideoExample /> };
export const Status: Story = { render: () => <StatusExample /> };
