import type { Meta, StoryObj } from '@storybook/react';
import { Toast, Toaster } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Feedback/Toast',
  component: Toast,
  tags: ['autodocs'],
  args: { title: 'Invoice sent', children: 'INV-2041 was sent to billing@acme.com.', tone: 'success' },
};
export default meta;

type Story = StoryObj<typeof Toast>;

export const Default: Story = {};
export const Error: Story = { args: { tone: 'error', title: 'Upload failed', children: 'The file exceeded the 25MB limit.' } };
export const Dismissible: Story = { args: { onDismiss: () => {} } };

export const InToaster: Story = {
  render: () => (
    <div style={{ position: 'relative', height: 160, width: 380 }}>
      <Toaster style={{ position: 'absolute' }}>
        <Toast tone="success" title="Saved">Your changes were saved.</Toast>
      </Toaster>
    </div>
  ),
};
