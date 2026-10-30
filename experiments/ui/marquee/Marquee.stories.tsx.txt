import type { Meta, StoryObj } from "@storybook/react-vite";

import CardsExample from "../../registry/examples/marquee/cards";
import LogosExample from "../../registry/examples/marquee/logos";
import { Marquee } from "./marquee";

/** A band that slides, pausable and accessible. Each story renders a named example. */
const meta = {
  title: "Primitives/Marquee",
  component: Marquee,
  args: { label: "Band", pauseLabel: "Pause", playLabel: "Play", children: null },
} satisfies Meta<typeof Marquee>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Logos: Story = { render: () => <LogosExample /> };
export const Cards: Story = { render: () => <CardsExample /> };
