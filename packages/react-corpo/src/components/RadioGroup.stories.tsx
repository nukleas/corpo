import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup } from './RadioGroup';
import { Radio } from './Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Vertical: Story = {
  render: () => (
    <RadioGroup>
      <Radio name="rg-vertical" label="Monthly" defaultChecked />
      <Radio name="rg-vertical" label="Annual (save 15%)" />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup orientation="horizontal">
      <Radio name="rg-horizontal" label="Small" defaultChecked />
      <Radio name="rg-horizontal" label="Medium" />
      <Radio name="rg-horizontal" label="Large" />
    </RadioGroup>
  ),
};
