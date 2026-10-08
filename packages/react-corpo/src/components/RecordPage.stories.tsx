import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Card } from './Card';
import { DescriptionList } from './DescriptionList';
import { RecordPage } from './RecordPage';
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
