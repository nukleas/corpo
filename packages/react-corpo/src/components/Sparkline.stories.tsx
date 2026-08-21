import type { Meta, StoryObj } from '@storybook/react';
import { Sparkline } from './Sparkline';
import { Stat } from './Stat';

const meta = {
  title: 'Display/Charts/Sparkline',
  component: Sparkline,
  tags: ['autodocs'],
} satisfies Meta<typeof Sparkline>;
export default meta;
type Story = StoryObj<typeof meta>;

const SEATS = [1180, 1195, 1170, 1224, 1231, 1219, 1256, 1284];

export const Default: Story = {
  args: { data: SEATS },
};

/** Inline beside a Stat value — its natural habitat. */
export const InAStatTile: Story = {
  args: { data: SEATS },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Stat label="Weekly active seats" value="1,284" delta="+2.2%" deltaTone="up" />
      <Sparkline {...args} />
    </div>
  ),
};
