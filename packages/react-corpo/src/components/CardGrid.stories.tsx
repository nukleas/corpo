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
      <Stat label="Outstanding" value="$12,480" delta="+3 overdue" deltaTone="down" />
      <Stat label="Paid this month" value="$48,120" delta="+4.2%" deltaTone="up" />
      <Stat label="Average days" value="21" />
      <Stat label="Open orders" value="36" delta="+9" deltaTone="up" />
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
