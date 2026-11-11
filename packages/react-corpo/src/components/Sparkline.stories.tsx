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

/** Weekly cash collected, ending with the current week. */
const COLLECTED = [1840, 960, 4200, 640, 2100, 1180, 3150, 2460];

export const Default: Story = {
  args: { data: COLLECTED },
};

/** Inline beside a Stat value — its natural habitat. */
export const InAStatTile: Story = {
  args: { data: COLLECTED },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Stat label="Collected this week" value="2,460.00" delta="−690.00" deltaTone="down" />
      <Sparkline {...args} />
    </div>
  ),
};
