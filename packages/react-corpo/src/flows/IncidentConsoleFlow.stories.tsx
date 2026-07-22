import type { Meta, StoryObj } from '@storybook/react';
import { IncidentConsoleFlow } from './IncidentConsoleFlow';

const meta: Meta<typeof IncidentConsoleFlow> = {
  title: 'Flows/Trust & safety console',
  component: IncidentConsoleFlow,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof IncidentConsoleFlow>;

export const Default: Story = {};
