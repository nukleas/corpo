import type { Meta, StoryObj } from '@storybook/react';
import { AccessClearanceFlow } from './AccessClearanceFlow';

const meta: Meta<typeof AccessClearanceFlow> = {
  title: 'Flows/Request more access',
  component: AccessClearanceFlow,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof AccessClearanceFlow>;

export const Default: Story = {};
