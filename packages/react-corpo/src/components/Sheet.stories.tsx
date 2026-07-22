import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { Field } from './Field';
import { Input } from './Input';

const meta: Meta<typeof Sheet> = {
  title: 'Display/Sheet',
  component: Sheet,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Sheet>;

export const Right: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Edit client</Button>
        <Sheet
          open={open}
          onClose={() => setOpen(false)}
          title="Edit client"
          footer={<Button variant="primary" size="sm" onClick={() => setOpen(false)}>Save changes</Button>}
        >
          <Field label="Company name">
            <Input defaultValue="Acme Ltd" />
          </Field>
        </Sheet>
      </>
    );
  },
};

export const Bottom: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open bottom sheet</Button>
        <Sheet open={open} onClose={() => setOpen(false)} side="bottom" title="Quick actions">
          Choose an action to apply to the selected rows.
        </Sheet>
      </>
    );
  },
};
