import type { Meta, StoryObj } from '@storybook/react';
import { Command } from './Command';
import { KbdGroup } from './KbdGroup';

const meta: Meta<typeof Command> = {
  title: 'Navigation/Command',
  component: Command,
  tags: ['autodocs'],
  args: {
    groups: [
      {
        id: 'actions',
        label: 'Actions',
        items: [
          { id: 'new-invoice', label: 'New invoice', shortcut: <KbdGroup keys={['Cmd', 'N']} /> },
          { id: 'new-client', label: 'New client' },
        ],
      },
      {
        id: 'nav',
        label: 'Go to',
        items: [
          { id: 'invoices', label: 'Invoices' },
          { id: 'reports', label: 'Reports' },
          { id: 'settings', label: 'Settings' },
        ],
      },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Command>;

export const Default: Story = {};
