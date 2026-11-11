import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { ActionBar, type ActionBarAction } from './ActionBar';
import { Button } from './Button';

const meta: Meta<typeof ActionBar> = {
  title: 'Actions/ActionBar',
  component: ActionBar,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ActionBar>;

/**
 * A sales order's actions. Narrow the bar and the last ones move into "More";
 * `menu` items always live there. One tab stop — arrows move between buttons.
 */
export const Overflow: Story = {
  render: () => {
    const [width, setWidth] = useState(320);
    const [ran, setRan] = useState('');
    const run = (label: string) => () => setRan(label);
    const actions: ActionBarAction[] = [
      { id: 'confirm', label: 'Confirm order', variant: 'primary', onClick: run('Confirm order') },
      { id: 'invoice', label: 'Create invoice', onClick: run('Create invoice') },
      { id: 'email', label: 'Send by email', onClick: run('Send by email') },
      { id: 'print', label: 'Print', onClick: run('Print') },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button size="sm" onClick={() => setWidth((w) => (w === 320 ? 720 : 320))}>
            {width === 320 ? 'Widen' : 'Narrow'} bar
          </Button>
          <span style={{ fontSize: 'var(--corpo-text-sm)' }}>Last run: {ran || 'nothing'}</span>
        </div>
        <div style={{ width, display: 'flex', border: '1px dashed var(--corpo-border)', padding: 8 }}>
          <ActionBar
            actions={actions}
            menu={[
              { id: 'duplicate', label: 'Duplicate', onClick: run('Duplicate') },
              { id: 'cancel', label: 'Cancel order', danger: true, onClick: run('Cancel order') },
            ]}
          />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('toolbar', { name: 'Record actions' });
    const toolbar = within(bar);

    // 320px fits the primary action and "More"; the rest overflow.
    await waitFor(() => expect(toolbar.queryByRole('button', { name: 'Print' })).not.toBeInTheDocument());
    const confirm = toolbar.getByRole('button', { name: 'Confirm order' });
    const more = toolbar.getByRole('button', { name: 'More' });
    expect(confirm).toHaveAttribute('tabindex', '0');
    expect(more).toHaveAttribute('tabindex', '-1');

    // Arrows rove; the overflowed action runs from the menu.
    confirm.focus();
    await userEvent.keyboard('{End}');
    expect(more).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const menu = within(document.body).getByRole('menu');
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Print' }));
    await expect(canvas.getByText('Last run: Print')).toBeInTheDocument();

    // Widening brings every action back; the menu keeps only `menu` items.
    await userEvent.click(canvas.getByRole('button', { name: 'Widen bar' }));
    await waitFor(() => expect(toolbar.getByRole('button', { name: 'Print' })).toBeInTheDocument());
    await userEvent.click(toolbar.getByRole('button', { name: 'More' }));
    const items = within(within(document.body).getByRole('menu')).getAllByRole('menuitem');
    expect(items.map((el) => el.textContent)).toEqual(['Duplicate', 'Cancel order']);
  },
};
