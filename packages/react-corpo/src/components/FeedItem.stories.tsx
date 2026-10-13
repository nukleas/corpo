import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Feed, FeedItem } from './FeedItem';
import { StatusPill } from './StatusPill';

const TICKETS = [
  {
    id: 'AP-311',
    tone: 'err',
    status: 'Blocked',
    title: 'Duplicate vendor bill from Initech',
    subtitle: 'BILL-8821 matches BILL-8790 — same amount and PO.',
    time: '9:41 AM',
  },
  {
    id: 'AP-309',
    tone: 'warn',
    status: 'Review',
    title: 'Price variance on PO-88231',
    subtitle: 'Invoiced unit price is 6% over the PO.',
    time: '8:15 AM',
  },
  {
    id: 'AP-302',
    tone: 'ok',
    status: 'Cleared',
    title: 'Three-way match passed',
    subtitle: 'Globex, GX-2210',
    time: 'Yesterday',
  },
] as const;

const meta: Meta<typeof FeedItem> = {
  title: 'Display/FeedItem',
  component: FeedItem,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof FeedItem>;

/** A master list: the open row is `selected` (aria-current) and marked with the accent edge. */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState<string>('AP-309');
    return (
      <div style={{ maxWidth: 380, border: '1px solid var(--corpo-border)', borderRadius: 4 }}>
        <Feed aria-label="Exceptions">
          {TICKETS.map((t) => (
            <FeedItem
              key={t.id}
              badge={<StatusPill tone={t.tone}>{t.status}</StatusPill>}
              title={t.title}
              subtitle={t.subtitle}
              time={t.time}
              selected={open === t.id}
              onClick={() => setOpen(t.id)}
            />
          ))}
        </Feed>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = (name: RegExp) => canvas.getByRole('button', { name });
    await expect(row(/Price variance/)).toHaveAttribute('aria-current', 'true');
    await userEvent.click(row(/Duplicate vendor bill/));
    await expect(row(/Duplicate vendor bill/)).toHaveAttribute('aria-current', 'true');
    await expect(row(/Price variance/)).not.toHaveAttribute('aria-current');
  },
};
