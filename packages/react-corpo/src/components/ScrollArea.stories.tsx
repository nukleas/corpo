import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './ScrollArea';

const meta: Meta<typeof ScrollArea> = {
  title: 'Display/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  render: () => (
    <ScrollArea style={{ width: 220, height: 140, border: '1px solid var(--corpo-border)', borderRadius: 'var(--corpo-radius-lg)', padding: 12 }}>
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} style={{ padding: '4px 0', fontSize: 13 }}>
          Row {i + 1}
        </div>
      ))}
    </ScrollArea>
  ),
};
