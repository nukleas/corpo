import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AlertDialog } from './AlertDialog';
import { Button } from './Button';

const meta: Meta<typeof AlertDialog> = {
  title: 'Display/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof AlertDialog>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>Revoke access</Button>
        <AlertDialog open={open} onClose={() => setOpen(false)} onConfirm={() => {}} title="Revoke access" confirmLabel="Revoke" danger>
          This immediately signs the member out and removes their permissions. This cannot be undone.
        </AlertDialog>
      </>
    );
  },
};
