import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Dropdown } from './Dropdown';
import { Button } from './Button';

const onEdit = fn();

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

/** A menu anchored at the bottom-right corner flips up and shifts left, staying inside the viewport. */
export const StaysInView: Story = {
  render: () => (
    <div style={{ position: 'fixed', right: 8, bottom: 8 }}>
      <Dropdown
        trigger={<Button>Open menu</Button>}
        items={[
          { id: 'copy', label: 'Copy reference' },
          { id: 'export', label: 'Export month' },
          { id: 'archive', label: 'Archive year' },
          { id: 'move', label: 'Move to entity' },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });
    await userEvent.click(trigger);
    const menu = canvas.getByRole('menu');
    const box = menu.getBoundingClientRect();
    const triggerBox = trigger.getBoundingClientRect();
    await expect(box.left).toBeGreaterThanOrEqual(-1);
    await expect(box.top).toBeGreaterThanOrEqual(-1);
    await expect(box.right).toBeLessThanOrEqual(window.innerWidth + 1);
    await expect(box.bottom).toBeLessThanOrEqual(window.innerHeight + 1);
    await expect(box.bottom).toBeLessThanOrEqual(triggerBox.top + 1);
    await userEvent.keyboard('{Escape}');
  },
};

/** Keyboard: ArrowDown opens on the first item, arrows skip disabled items, Escape returns focus to the trigger. */
export const Keyboard: Story = {
  args: {
    items: [
      { id: 'edit', label: 'Edit', onClick: onEdit },
      { id: 'archive', label: 'Archive', disabled: true },
      { id: 'delete', label: 'Delete', danger: true },
    ],
  },
  play: async ({ canvasElement }) => {
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
    await expect(onEdit).toHaveBeenCalledOnce();
    await expect(trigger).toHaveFocus();
  },
};

const onMove = fn();

function ViewMenu() {
  const [totals, setTotals] = useState(true);
  const [sort, setSort] = useState<'name' | 'date'>('name');
  return (
    <Dropdown
      trigger={<Button size="sm">Options ▾</Button>}
      items={[
        { id: 'refresh', label: 'Refresh' },
        {
          id: 'move',
          type: 'submenu',
          label: 'Move to',
          items: [
            { id: 'q3', label: 'Q3 archive', onClick: onMove },
            { id: 'q4', label: 'Q4 archive' },
          ],
        },
        { id: 'sep-1', type: 'separator' },
        { id: 'totals', type: 'checkbox', label: 'Show totals', checked: totals, onCheckedChange: setTotals },
        { id: 'sep-2', type: 'separator' },
        {
          id: 'by-name',
          type: 'radio',
          label: 'Sort by name',
          checked: sort === 'name',
          onCheckedChange: () => setSort('name'),
        },
        {
          id: 'by-date',
          type: 'radio',
          label: 'Sort by date',
          checked: sort === 'date',
          onCheckedChange: () => setSort('date'),
        },
      ]}
    />
  );
}

/**
 * Submenus (ArrowRight or hover opens, ArrowLeft or Escape backs out), separators, and checkbox / radio
 * items that toggle without closing the menu.
 */
export const SubmenusAndCheckables: Story = {
  render: () => <ViewMenu />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Options/ });
    trigger.focus();

    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    const move = canvas.getByRole('menuitem', { name: /Move to/ });
    await expect(move).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('menuitem', { name: 'Q3 archive' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(move).toHaveFocus();
    await expect(move).toHaveAttribute('aria-expanded', 'false');

    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(onMove).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole('menu')).toBeNull();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    await expect(canvas.getByRole('menuitemradio', { name: 'Sort by date' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('menuitemradio', { name: 'Sort by date' })).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByRole('menuitemradio', { name: 'Sort by name' })).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(canvas.getByRole('menuitemcheckbox', { name: 'Show totals' }));
    await expect(canvas.getByRole('menuitemcheckbox', { name: 'Show totals' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  },
};
