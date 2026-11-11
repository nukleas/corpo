import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import { Card } from './Card';
import { CardGrid } from './CardGrid';
import { Stat } from './Stat';

const meta: Meta<typeof CardGrid> = {
  title: 'Display/CardGrid',
  component: CardGrid,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof CardGrid>;

export const Stats: Story = {
  args: { columns: 4 },
  render: (args) => (
    <CardGrid {...args}>
      <Stat label="Outstanding" value="$7,650.00" />
      <Stat label="Overdue" value="$4,010.00" delta="2 invoices" deltaTone="down" />
      <Stat label="Collected in October" value="$4,840.00" delta="2 invoices" deltaTone="up" />
      <Stat label="Open invoices" value="4" />
    </CardGrid>
  ),
};

function trackColumns(root: Element | null): number {
  const track = root?.querySelector('.cp-card-grid__track');
  if (!track) return 0;
  return getComputedStyle(track).gridTemplateColumns.split(' ').filter(Boolean).length;
}

/** Four columns in a wide container, one column in a narrow one. The viewport does not decide. */
export const Container: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CardGrid columns={4} data-testid="wide" style={{ width: 960 }}>
        <Card title="Receivables">Open invoices and aging.</Card>
        <Card title="Payables">Bills due this week.</Card>
        <Card title="Cash">Bank and undeposited funds.</Card>
        <Card title="Orders">Confirmed, not shipped.</Card>
      </CardGrid>
      <CardGrid columns={4} data-testid="narrow" style={{ width: 320 }}>
        <Card title="Receivables">Open invoices and aging.</Card>
        <Card title="Payables">Bills due this week.</Card>
        <Card title="Cash">Bank and undeposited funds.</Card>
        <Card title="Orders">Confirmed, not shipped.</Card>
      </CardGrid>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const wide = canvasElement.querySelector('[data-testid="wide"]');
    const narrow = canvasElement.querySelector('[data-testid="narrow"]');
    await expect(wide).toBeTruthy();
    await expect(narrow).toBeTruthy();
    await expect(trackColumns(wide)).toBe(4);
    await expect(trackColumns(narrow)).toBe(1);
  },
};
