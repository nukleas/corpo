import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Dropdown } from './Dropdown';
import { Button } from './Button';

const meta: Meta<typeof Dropdown> = {
  title: 'Navigation/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  args: {
    trigger: <Button size="sm">Actions ▾</Button>,
    items: [
      { id: 'edit', label: 'Edit' },
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'archive', label: 'Archive', disabled: true },
      { id: 'delete', label: 'Delete', danger: true },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {};
export const RightAligned: Story = { args: { align: 'right' } };

/** Keyboard: ArrowDown opens on the first item, arrows skip disabled items, Escape returns focus to the trigger. */
export const Keyboard: Story = {
  args: {
    items: [
      { id: 'edit', label: 'Edit', onClick: fn() },
      { id: 'archive', label: 'Archive', disabled: true },
      { id: 'delete', label: 'Delete', danger: true },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Actions/ });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('menu')).toBeNull();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Enter}');
    await expect(args.items[0].onClick).toHaveBeenCalledOnce();
    await expect(trigger).toHaveFocus();
  },
};
