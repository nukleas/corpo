import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: { title: 'Payment declined', children: 'Card ending 4421 was declined. We will retry in 3 days.' },
  argTypes: {
    tone: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
  },
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Info: Story = { args: { tone: 'info', title: 'Scheduled maintenance', children: 'Statements will be delayed by up to an hour on 30 Aug.' } };
export const Success: Story = { args: { tone: 'success', title: 'Invoice sent', children: 'INV-2041 was sent to billing@acme.com.' } };
export const Warning: Story = { args: { tone: 'warning', title: 'Renew before 30 Aug', children: 'Renew before 30 Aug to avoid downtime.' } };
export const ErrorTone: Story = { args: { tone: 'error' } };
export const Dismissible: Story = { args: { tone: 'error', onDismiss: () => {} } };
