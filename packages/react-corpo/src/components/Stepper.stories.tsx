import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './Stepper';

const requisition = [
  { label: 'Submit request' },
  { label: 'Manager review' },
  { label: 'Finance approval' },
  { label: 'Issue purchase order' },
];

const meta: Meta<typeof Stepper> = {
  title: 'Navigation/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  args: { items: requisition, current: 2 },
};
export default meta;

type Story = StoryObj<typeof Stepper>;

export const Default: Story = {};

export const FirstStep: Story = { args: { current: 0 } };

/** Pass `current={items.length}` to mark every step complete. */
export const Complete: Story = { args: { current: 4 } };
