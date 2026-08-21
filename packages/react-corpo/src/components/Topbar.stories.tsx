import type { Meta, StoryObj } from '@storybook/react';
import { Topbar } from './Topbar';
import { Avatar } from './Avatar';
import { Button } from './Button';

const meta = {
  title: 'Navigation/Topbar',
  component: Topbar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Topbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Invoices',
    actions: (
      <>
        <Button size="sm" variant="primary">New invoice</Button>
        <Avatar size="sm" initials="AS" />
      </>
    ),
  },
};

/** With the mobile nav toggle (visible below 768px). */
export const WithNavToggle: Story = {
  args: {
    title: 'Invoices',
    onNavToggle: () => {},
    actions: <Avatar size="sm" initials="AS" />,
  },
};
