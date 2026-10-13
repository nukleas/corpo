import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { SplitView } from './SplitView';
import { Amount } from './Amount';
import { DescriptionList } from './DescriptionList';
import { Feed, FeedItem } from './FeedItem';
import { SectionHeader } from './SectionHeader';
import { StatusPill } from './StatusPill';

const INVOICES = [
  { id: 'INV-2041', client: 'Acme Inc.', amount: 4200, status: 'Overdue', due: 'Oct 1, 2026' },
  { id: 'INV-2040', client: 'Globex', amount: 12850, status: 'Open', due: 'Oct 30, 2026' },
  { id: 'INV-2038', client: 'Initech', amount: 980, status: 'Paid', due: 'Sep 28, 2026' },
] as const;
const TONE = { Overdue: 'err', Open: 'info', Paid: 'ok' } as const;

const meta: Meta<typeof SplitView> = {
  title: 'Layout/SplitView',
  component: SplitView,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof SplitView>;

function InvoiceInbox() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = INVOICES.find((inv) => inv.id === openId);
  return (
    <div style={{ height: 420 }}>
      <SplitView
        listLabel="Invoices"
        onBack={() => setOpenId(null)}
        list={
          <Feed aria-label="Invoices">
            {INVOICES.map((inv) => (
              <FeedItem
                key={inv.id}
                badge={<StatusPill tone={TONE[inv.status]}>{inv.status}</StatusPill>}
                title={inv.id}
                subtitle={`${inv.client} · due ${inv.due}`}
                time={<Amount value={inv.amount} />}
                selected={openId === inv.id}
                onClick={() => setOpenId(inv.id)}
              />
            ))}
          </Feed>
        }
        detail={
          open && (
            <>
              <SectionHeader
                title={open.id}
                description={open.client}
                actions={<StatusPill tone={TONE[open.status]}>{open.status}</StatusPill>}
              />
              <DescriptionList
                items={[
                  { label: 'Amount', value: <Amount value={open.amount} /> },
                  { label: 'Due', value: open.due },
                ]}
              />
            </>
          )
        }
      />
    </div>
  );
}

/**
 * Master–detail: pick an invoice to open it beside the list; drag the divider to resize. Below 768px the
 * view shows one pane at a time, with a back button on the detail.
 */
export const Default: Story = {
  render: () => <InvoiceInbox />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Select an item to see its details.')).toBeInTheDocument();
    await expect(canvas.getByRole('separator', { name: 'Resize invoices' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /INV-2040/ }));
    await expect(canvas.getByRole('button', { name: /INV-2040/ })).toHaveAttribute('aria-current', 'true');
    await expect(canvas.getByRole('heading', { name: 'INV-2040' })).toBeInTheDocument();
    await expect(canvas.getByText('Oct 30, 2026')).toBeInTheDocument();
  },
};
