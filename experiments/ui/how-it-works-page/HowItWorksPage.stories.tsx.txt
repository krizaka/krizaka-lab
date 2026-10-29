import type { Meta, StoryObj } from "@storybook/react-vite";

import OrazakaExample from "../../registry/examples/how-it-works-page/orazaka";
import { HowItWorksPage } from "./how-it-works-page";

/** How-it-works page — a page template. Each story renders a named example, on a desktop and on a phone. */
const meta = {
  title: "Templates/HowItWorksPage",
  component: HowItWorksPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HowItWorksPage>;
export default meta;

type Story = StoryObj;

export const Orazaka: Story = { render: () => <OrazakaExample /> };
/** On a phone (390 × 844). */
export const OrazakaPhone: Story = { render: () => <OrazakaExample />, parameters: { phone: true } };
