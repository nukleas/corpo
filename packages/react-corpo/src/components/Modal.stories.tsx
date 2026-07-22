import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta: Meta<typeof Modal> = {
  title: 'Display/Modal',
  component: Modal,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Delete account</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Delete account"
          footer={
            <>
              <Button size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" variant="danger" onClick={() => setOpen(false)}>Delete</Button>
            </>
          }
        >
          This permanently deletes the workspace and all its data. This cannot be undone.
        </Modal>
      </>
    );
  },
};
