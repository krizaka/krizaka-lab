import type { Meta, StoryObj } from "@storybook/react-vite";

import ComposeExample from "../../registry/examples/iso/compose";
import CreatorHeroExample from "../../registry/examples/iso/creator-hero";
import OrazakaHeroExample from "../../registry/examples/iso/orazaka-hero";
import StillExample from "../../registry/examples/iso/still";
import { IsoHub } from "./iso";

/**
 * The isometric kit: a hero driven by data (`IsoHub`) and the primitives it is built from. Each story renders a named
 * example of the registry (`registry/examples/iso/*`, listed in `meta.ts`).
 */
const meta = {
  title: "Primitives/Iso",
  component: IsoHub,
  args: { layers: [] },
} satisfies Meta<typeof IsoHub>;
export default meta;

type Story = StoryObj<typeof meta>;

export const OrazakaHero: Story = { render: () => <OrazakaHeroExample /> };
export const CreatorHero: Story = { render: () => <CreatorHeroExample /> };
export const Compose: Story = { render: () => <ComposeExample /> };
export const Still: Story = { render: () => <StillExample /> };
