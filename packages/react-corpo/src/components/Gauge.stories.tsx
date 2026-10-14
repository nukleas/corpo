import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Gauge } from './Gauge';

const meta: Meta<typeof Gauge> = {
  title: 'Data/Gauge',
  component: Gauge,
  tags: ['autodocs'],
  args: { value: 72, label: 'Warehouse capacity' },
};
export default meta;

type Story = StoryObj<typeof Gauge>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole('meter', { name: 'Warehouse capacity' });
    await expect(meter).toHaveAttribute('aria-valuenow', '72');
    await expect(meter).toHaveAttribute('aria-valuetext', '72%');
  },
};

/** The page maps its own thresholds to a tone, and says why in nearby text — color is never the only signal. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <Gauge value={41} label="Quota attainment" />
      <Gauge value={96} label="SLA met" tone="ok" />
      <Gauge value={83} label="Budget used" tone="warn" />
      <Gauge value={1240} max={1000} label="Open tickets" tone="err" format={(v) => v.toLocaleString('en-US')} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const over = within(canvasElement).getByRole('meter', { name: 'Open tickets' });
    // Over-range readings pin the arc at max but still report the real value.
    await expect(over).toHaveAttribute('aria-valuenow', '1000');
    await expect(over).toHaveAttribute('aria-valuetext', '1,240');
  },
};
