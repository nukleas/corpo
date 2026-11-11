import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from '@storybook/test';
import { ActionBar } from './ActionBar';
import { Button } from './Button';
import { Card } from './Card';
import { DescriptionList } from './DescriptionList';
import { RecordPage } from './RecordPage';
import { RecordPager } from './RecordPager';
import { StatusPill } from './StatusPill';
import { Timeline } from './Timeline';

const meta: Meta<typeof RecordPage> = {
  title: 'Layout/RecordPage',
  component: RecordPage,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof RecordPage>;

/** The detail screen of one record: header, key facts, main column, and an aside for activity. */
export const Default: Story = {
  render: () => (
    <RecordPage
      eyebrow="Purchase order"
      title="PO-20931"
      status={<StatusPill tone="warn">Awaiting approval</StatusPill>}
      actions={
        <>
          <Button size="sm">Edit</Button>
          <Button size="sm" variant="primary">
            Approve
          </Button>
        </>
      }
      facts={[
        { label: 'Vendor', value: 'Globex Supply Co.' },
        { label: 'Ordered', value: 'Oct 2, 2026' },
        { label: 'Expected', value: 'Oct 16, 2026' },
        { label: 'Buyer', value: 'J. Lindqvist' },
        { label: 'Total', value: '$18,240.00' },
      ]}
      aside={
        <Card title="Activity">
          <Timeline
            items={[
              { title: 'Submitted for approval', timestamp: 'Oct 2, 4:10 PM', tone: 'warn' },
              { title: 'Created', timestamp: 'Oct 2, 3:52 PM', tone: 'idle' },
            ]}
          />
        </Card>
      }
    >
      <Card title="Delivery">
        <DescriptionList
          compact
          items={[
            { label: 'Ship to', value: 'Warehouse 2, 400 Harbor Rd, Oakland, CA' },
            { label: 'Incoterms', value: 'FOB destination' },
          ]}
        />
      </Card>
    </RecordPage>
  ),
};

/** Without an aside the main column takes the full width. */
export const NoAside: Story = {
  render: () => (
    <RecordPage
      eyebrow="Vendor"
      title="Globex Supply Co."
      status={<StatusPill tone="ok">Active</StatusPill>}
      facts={[
        { label: 'Vendor ID', value: 'V-0042' },
        { label: 'Terms', value: 'Net 45' },
      ]}
    >
      <p style={{ margin: 0, color: 'var(--corpo-text-secondary)' }}>Main content goes here.</p>
    </RecordPage>
  ),
};

const ORDERS = ['SO-2208', 'SO-2209', 'SO-2210', 'SO-2211'];

/**
 * ERP record header: an {@link ActionBar} that overflows into "More" as the
 * title takes room, and a {@link RecordPager} for the list it came from.
 */
export const ActionsAndPager: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const [at, setAt] = useState(2);
    return (
      <RecordPage
        eyebrow="Sales order"
        title={ORDERS[at]}
        status={<StatusPill tone="warn">Draft</StatusPill>}
        actions={
          <ActionBar
            actions={[
              { id: 'confirm', label: 'Confirm order', variant: 'primary' },
              { id: 'invoice', label: 'Create invoice' },
              { id: 'email', label: 'Send by email' },
              { id: 'print', label: 'Print' },
            ]}
            menu={[
              { id: 'duplicate', label: 'Duplicate' },
              { id: 'cancel', label: 'Cancel order', danger: true },
            ]}
          />
        }
        pager={
          <RecordPager
            position={at + 1}
            total={ORDERS.length}
            onPrevious={() => setAt((i) => i - 1)}
            onNext={() => setAt((i) => i + 1)}
          />
        }
        facts={[
          { label: 'Client', value: 'Ostara Foods' },
          { label: 'Ordered', value: 'Nov 3, 2026' },
          { label: 'Total', value: '$4,180.00' },
        ]}
      >
        <p style={{ margin: 0, color: 'var(--corpo-text-secondary)' }}>Order lines go here.</p>
      </RecordPage>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('SO-2210');
    await userEvent.click(canvas.getByRole('button', { name: 'Next record' }));
    expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('SO-2211');
    expect(canvas.getByText('4 of 4')).toBeInTheDocument();
  },
};
