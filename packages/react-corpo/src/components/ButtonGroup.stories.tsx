import type { Meta, StoryObj } from '@storybook/react';
import { ButtonGroup } from './ButtonGroup';
import { Button } from './Button';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Forms/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button size="sm">Day</Button>
      <Button size="sm">Week</Button>
      <Button size="sm">Month</Button>
    </ButtonGroup>
  ),
};
