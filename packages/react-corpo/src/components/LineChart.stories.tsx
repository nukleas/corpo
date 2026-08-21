import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from './LineChart';

const meta = {
  title: 'Display/Charts/LineChart',
  component: LineChart,
  tags: ['autodocs'],
} satisfies Meta<typeof LineChart>;
export default meta;
type Story = StoryObj<typeof meta>;

const money = (v: number) => `$${v.toLocaleString('en-US')}`;

export const RevenueTrend: Story = {
  args: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    series: [
      { label: 'Revenue', data: [128000, 132500, 141200, 138900, 149800, 155200, 161700, 168400] },
      { label: 'Operating cost', data: [94000, 96200, 99800, 103500, 104100, 108900, 110300, 114600] },
    ],
    yFormat: money,
    style: { height: 280 },
  },
};

/** A single series shows no legend — the title above the chart names it. */
export const SingleSeries: Story = {
  args: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    series: [{ label: 'Tickets resolved', data: [42, 51, 38, 64, 57] }],
    style: { height: 220 },
  },
};

/** Null values render as gaps in the line. */
export const WithGaps: Story = {
  args: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q1', 'Q2'],
    series: [
      { label: 'Forecast', data: [110, 118, null, 131, 140, 149] },
      { label: 'Actual', data: [108, 121, 126, 129, null, null] },
    ],
    style: { height: 220 },
  },
};
