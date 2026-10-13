import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Menubar } from './Menubar';

const onExport = fn();

const meta: Meta<typeof Menubar> = {
  title: 'Navigation/Menubar',
  component: Menubar,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Report editor',
    menus: [
      {
        id: 'file',
        label: 'File',
        items: [
          { id: 'new', label: 'New report' },
          { id: 'export', label: 'Export as CSV', onClick: onExport },
          { id: 'print', label: 'Print' },
        ],
      },
      {
        id: 'edit',
        label: 'Edit',
        items: [
          { id: 'undo', label: 'Undo' },
          { id: 'redo', label: 'Redo', disabled: true },
        ],
      },
      {
        id: 'view',
        label: 'View',
        items: [
          { id: 'compact', label: 'Compact rows' },
          { id: 'totals', label: 'Show totals' },
        ],
      },
    ],
  },
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Menubar>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = (name: string) => canvas.getByRole('menuitem', { name });

    await userEvent.tab();
    await expect(title('File')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(title('Edit')).toHaveFocus();
    await expect(title('File')).toHaveAttribute('tabindex', '-1');

    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('menu', { name: 'Edit' })).toBeInTheDocument();
    await expect(canvas.getByRole('menuitem', { name: 'Undo' })).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('menu', { name: 'View' })).toBeInTheDocument();
    await expect(canvas.getByRole('menuitem', { name: 'Compact rows' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('menu')).toBeNull();
    await expect(title('View')).toHaveFocus();
  },
};

/** With a menu open, hovering another title switches to its menu. */
export const HoverSwitch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Edit' }));
    await userEvent.hover(canvas.getByRole('menuitem', { name: 'File' }));
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Export as CSV' }));
    await expect(onExport).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole('menu')).toBeNull();
  },
};
