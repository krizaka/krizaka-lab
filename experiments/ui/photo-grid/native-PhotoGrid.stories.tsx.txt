import type { Meta, StoryObj } from "@storybook/react-vite";

import ProfilePhotosExample from "../../registry/examples/photo-grid/native/profile-photos";
import { nativeFrame } from "./story-frame";

/** Native — PhotoGrid. Each story renders a named example of the registry (`registry/examples/photo-grid/native/*`). */
const meta = { title: "Native/PhotoGrid", decorators: [nativeFrame] } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const ProfilePhotos: Story = { render: () => <ProfilePhotosExample /> };
