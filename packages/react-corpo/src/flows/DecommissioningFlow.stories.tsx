import type { Meta, StoryObj } from '@storybook/react';
import { DecommissioningFlow } from './DecommissioningFlow';

const meta: Meta<typeof DecommissioningFlow> = {
  title: 'Flows/Your next chapter',
  component: DecommissioningFlow,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof DecommissioningFlow>;

export const Default: Story = {};
