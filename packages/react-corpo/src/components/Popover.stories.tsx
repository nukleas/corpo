import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Popover } from './Popover';
import { Button } from './Button';

const meta: Meta<typeof Popover> = {
  title: 'Display/Popover',
  component: Popover,
  tags: ['autodocs'],
  args: {
    trigger: <Button size="sm">Filters</Button>,
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>Filter by status, owner, or date range.</div>
    ),
  },
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {};
export const RightAligned: Story = { args: { align: 'right' } };

/** A panel at the right edge shifts left instead of leaving the viewport. */
export const StaysInView: Story = {
  render: () => (
    <div style={{ position: 'fixed', right: 8, top: 8 }}>
      <Popover trigger={<Button>Open panel</Button>}>
        <p style={{ margin: 0, width: 260 }}>Choose a saved view. This panel shifts inward.</p>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open panel' });
    await userEvent.click(trigger);
    const panel = canvasElement.querySelector('.cp-popover__content');
    if (!(panel instanceof HTMLElement)) throw new Error('missing panel');
    const box = panel.getBoundingClientRect();
    await expect(box.left).toBeGreaterThanOrEqual(-1);
    await expect(box.right).toBeLessThanOrEqual(window.innerWidth + 1);
    await expect(box.width).toBeGreaterThan(200);
    await userEvent.keyboard('{Escape}');
  },
};
