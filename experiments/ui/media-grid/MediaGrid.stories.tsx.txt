import type { Meta, StoryObj } from "@storybook/react-vite";

import FeedExample from "../../registry/examples/media-grid/feed";
import LoadingExample from "../../registry/examples/media-grid/loading";
import UniformExample from "../../registry/examples/media-grid/uniform";
import { MediaGrid } from "./media-grid";

/** A media grid for mixed orientations: a Shorts shelf for the 9:16, a uniform grid for the rest. Each story renders a named example. */
const meta = { title: "Primitives/MediaGrid", component: MediaGrid, parameters: { screenshot: false } } satisfies Meta<typeof MediaGrid>;
export default meta;

type Story = StoryObj;

export const Feed: Story = { render: () => <FeedExample /> };
export const Uniform: Story = { render: () => <UniformExample /> };
export const Loading: Story = { render: () => <LoadingExample /> };
