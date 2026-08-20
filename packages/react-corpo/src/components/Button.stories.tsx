import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Forms/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Save changes' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'primary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};
export const Primary: Story = { args: { variant: 'primary' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Cancel' } };
export const Danger: Story = { args: { variant: 'danger', size: 'sm', children: 'Delete' } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button>Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

/** `as="a"` renders a real anchor styled as a button — `href`, `target`, etc. typecheck. Any component (e.g. a router `Link`) works the same way. */
export const AsLink: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button as="a" href="https://github.com/nukleas/corpo" target="_blank" rel="noreferrer">
        View repository
      </Button>
      <Button as="a" href="/reports/latest" variant="primary">
        Open latest report
      </Button>
    </div>
  ),
};
