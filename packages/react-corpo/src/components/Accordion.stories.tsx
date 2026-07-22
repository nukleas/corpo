import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

const items = [
  { id: 'billing', title: 'How does billing work?', content: 'You are billed monthly based on active seats.' },
  { id: 'cancel', title: 'Can I cancel anytime?', content: 'Yes — cancel from Settings and access continues until the period ends.' },
  { id: 'export', title: 'Can I export my data?', content: 'Yes, a full CSV export is available under Reports.' },
];

const meta: Meta<typeof Accordion> = {
  title: 'Display/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: { items },
};
export default meta;

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {};
export const DefaultOpen: Story = { args: { defaultOpen: ['billing'] } };
export const Multiple: Story = { args: { multiple: true, defaultOpen: ['billing', 'cancel'] } };
