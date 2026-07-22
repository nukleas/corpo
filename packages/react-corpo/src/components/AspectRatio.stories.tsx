import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from './AspectRatio';

const meta: Meta<typeof AspectRatio> = {
  title: 'Display/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof AspectRatio>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <AspectRatio ratio={16 / 9} style={{ background: 'var(--corpo-bg-inset)', border: '1px solid var(--corpo-border)', borderRadius: 'var(--corpo-radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--corpo-text-muted)' }}>16:9</div>
      </AspectRatio>
    </div>
  ),
};
