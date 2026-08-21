import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from './Timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Display/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  args: {
    style: { maxWidth: 440 },
    items: [
      {
        title: 'Invoice created',
        timestamp: 'Aug 4, 9:14 AM',
        description: 'INV-2041 was drafted for Acme Inc.',
        tone: 'idle',
      },
      {
        title: 'Invoice sent',
        timestamp: 'Aug 4, 9:16 AM',
        description: 'Sent to billing@acme.com',
        tone: 'ok',
      },
      {
        title: 'Reminder sent',
        timestamp: 'Aug 12, 8:00 AM',
        description: 'Net 30 terms end in two days',
        tone: 'warn',
      },
      {
        title: 'Payment declined',
        timestamp: 'Aug 14, 4:02 PM',
        description: 'Card ending 4421 was declined.',
        tone: 'err',
      },
      {
        title: 'Payment received',
        timestamp: 'Aug 15, 10:41 AM',
        description: '$4,200.00 posted to the ledger',
        tone: 'ok',
      },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Timeline>;

export const Default: Story = {};

export const TitlesOnly: Story = {
  args: {
    items: [
      { title: 'Request opened', timestamp: 'Aug 18, 11:02 AM' },
      { title: 'Assigned to finance', timestamp: 'Aug 18, 11:40 AM', tone: 'ok' },
      { title: 'Waiting on approval', timestamp: 'Aug 19, 9:00 AM', tone: 'warn' },
    ],
  },
};
