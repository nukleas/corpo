import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarGroup } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { initials: 'MI' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    status: { control: 'select', options: [undefined, 'online', 'away', 'busy', 'offline'] },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};
export const WithStatus: Story = { args: { status: 'online' } };
export const Large: Story = { args: { size: 'lg' } };

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar initials="MI" />
      <Avatar initials="AN" />
      <Avatar initials="TA" />
    </AvatarGroup>
  ),
};
