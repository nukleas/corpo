import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'Display/Card',
  component: Card,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Renewal',
    description: 'Card ending 4421 was declined.',
    children: 'We will retry the charge in 3 days. Update payment details to avoid a lapse in service.',
    footer: <Button variant="primary" size="sm">Update card</Button>,
  },
};
export const Flat: Story = { args: { ...Default.args, flat: true } };
