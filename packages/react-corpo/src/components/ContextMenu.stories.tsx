import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, fn, userEvent, within } from '@storybook/test';
import { ContextMenu } from './ContextMenu';
import { Button } from './Button';
import { Card } from './Card';

const onOpen = fn();

const meta: Meta<typeof ContextMenu> = {
  title: 'Navigation/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  args: {
    label: 'Invoice actions',
    items: [
      { id: 'open', label: 'Open invoice', onClick: onOpen },
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'void', label: 'Void invoice', danger: true },
    ],
    children: (
      <Card title="INV-2041">
        <p style={{ margin: 0 }}>Right-click this card, or focus the button and press Shift+F10.</p>
        <div style={{ marginTop: 12 }}>
          <Button size="sm">View details</Button>
        </div>
      </Card>
    ),
  },
};
export default meta;

type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await fireEvent.contextMenu(canvas.getByText(/Right-click this card/), { clientX: 120, clientY: 80 });
    const menu = page.getByRole('menu', { name: 'Invoice actions' });
    await expect(page.getByRole('menuitem', { name: 'Open invoice' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(page.getByRole('menuitem', { name: 'Void invoice' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(menu).not.toBeInTheDocument();

    const details = canvas.getByRole('button', { name: 'View details' });
    details.focus();
    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    await userEvent.keyboard('{Enter}');
    await expect(onOpen).toHaveBeenCalledOnce();
    await expect(details).toHaveFocus();
  },
};
