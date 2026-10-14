import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ActivityGrid, type ActivityDatum } from './ActivityGrid';

// A year of approvals, deterministic: quieter weekends, busier month-ends, a quiet August.
const DATA: ActivityDatum[] = Array.from({ length: 365 }, (_, i) => {
  const d = new Date(Date.UTC(2025, 9, 14 + i));
  const weekday = d.getUTCDay();
  const weekend = weekday === 0 || weekday === 6;
  const monthEnd = d.getUTCDate() >= 26;
  const august = d.getUTCMonth() === 7;
  const base = weekend ? 0 : ((i * 7) % 5) + (monthEnd ? 6 : 1);
  return { date: d.toISOString().slice(0, 10), value: august ? Math.floor(base / 3) : base };
});

const meta: Meta<typeof ActivityGrid> = {
  title: 'Data/ActivityGrid',
  component: ActivityGrid,
  tags: ['autodocs'],
  args: {
    data: DATA,
    label: 'Approvals per day, last 12 months',
    format: (v: number) => (v === 1 ? '1 approval' : `${v} approvals`),
  },
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof ActivityGrid>;

/** Every day is named for screen readers; hovering shows the same value in a tooltip. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Approvals per day, last 12 months' })).toBeInTheDocument();
    const day = canvas.getByRole('img', { name: 'Oct 13, 2026: 4 approvals' });
    await userEvent.hover(day);
    await expect(canvasElement.querySelector('.cp-chart__tip')).toHaveTextContent('Oct 13, 20264 approvals');
    await expect(canvas.getByRole('img', { name: 'Oct 11, 2026: 0 approvals' })).toBeInTheDocument();
  },
};

/** The Table view summarizes the same data by month — total, active days and the busiest day. */
export const TableView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Table' }));
    const table = canvas.getByRole('table', { name: 'Approvals per day, last 12 months, by month' });
    await expect(within(table).getAllByRole('row').length).toBeGreaterThan(12);
    await expect(within(table).getByRole('row', { name: /October 2026/ })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Chart' }));
    await expect(canvas.getByRole('img', { name: 'Oct 13, 2026: 4 approvals' })).toBeInTheDocument();
  },
};
