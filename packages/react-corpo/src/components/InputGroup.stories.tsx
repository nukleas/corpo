import type { Meta, StoryObj } from '@storybook/react';
import { InputGroup } from './InputGroup';
import { Input } from './Input';

const meta: Meta<typeof InputGroup> = {
  title: 'Forms/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof InputGroup>;

export const Currency: Story = {
  render: () => (
    <div style={{ width: 220 }}>
      <InputGroup leading="$">
        <Input aria-label="Amount" defaultValue="4,200.00" />
      </InputGroup>
    </div>
  ),
};

export const Unit: Story = {
  render: () => (
    <div style={{ width: 220 }}>
      <InputGroup trailing="days">
        <Input aria-label="Payment terms" defaultValue="30" />
      </InputGroup>
    </div>
  ),
};
