import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'Forms/Slider',
  component: Slider,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(40);
    return (
      <div style={{ width: 260 }}>
        <Slider value={value} min={0} max={100} showValue onChange={(e) => setValue(Number(e.target.value))} />
      </div>
    );
  },
};
