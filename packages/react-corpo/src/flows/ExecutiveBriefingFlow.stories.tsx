import type { Meta, StoryObj } from '@storybook/react';
import { ExecutiveBriefingFlow } from './ExecutiveBriefingFlow';

const meta: Meta<typeof ExecutiveBriefingFlow> = {
  title: 'Flows/Quarterly wins briefing',
  component: ExecutiveBriefingFlow,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ExecutiveBriefingFlow>;

export const Default: Story = {};
