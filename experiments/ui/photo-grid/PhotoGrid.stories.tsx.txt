import type { Meta, StoryObj } from "@storybook/react-vite";

import ProfilePhotosExample from "../../registry/examples/photo-grid/profile-photos";

/** PhotoGrid. Each story renders a named example of the registry (`registry/examples/photo-grid/*`): the code ui.krizaka.com shows. */
const meta = { title: "Primitives/PhotoGrid" } satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const ProfilePhotos: Story = { render: () => <ProfilePhotosExample /> };
