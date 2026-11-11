import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { EntitySwitcher, type Entity } from './EntitySwitcher';
import { SideNav } from './SideNav';

const ENTITIES: Entity[] = [
  { id: 'uk', name: 'Halcyon UK Ltd', detail: 'GBP · London' },
  { id: 'us', name: 'Halcyon Inc.', detail: 'USD · New York' },
  { id: 'de', name: 'Halcyon GmbH', detail: 'EUR · Berlin' },
];

const meta: Meta<typeof EntitySwitcher> = {
  title: 'Navigation/EntitySwitcher',
  component: EntitySwitcher,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof EntitySwitcher>;

/**
 * The SideNav brand row as a company switcher. Choosing an entity closes the
 * menu and returns focus to the row; `actions` follow a separator.
 */
export const InSideNav: Story = {
  render: function Render() {
    const [current, setCurrent] = useState('uk');
    return (
      <div style={{ width: 240, height: 320, display: 'flex', border: '1px solid var(--corpo-border-dim)' }}>
        <SideNav
          brand={
            <EntitySwitcher
              entities={ENTITIES}
              current={current}
              onChange={setCurrent}
              actions={[{ id: 'manage', label: 'Manage companies' }]}
            />
          }
          sections={[
            {
              title: 'Finance',
              items: [
                { id: 'ledger', label: 'General ledger' },
                { id: 'ar', label: 'Receivables' },
              ],
            },
          ]}
          activeId="ledger"
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Switch company: Halcyon UK Ltd' });

    await userEvent.click(trigger);
    const menu = body.getByRole('menu');
    await expect(within(menu).getByRole('menuitemradio', { name: 'Halcyon UK Ltd' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await waitFor(() => expect(within(menu).getByRole('menuitemradio', { name: 'Halcyon UK Ltd' })).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());
    const switched = canvas.getByRole('button', { name: 'Switch company: Halcyon Inc.' });
    await expect(switched).toHaveFocus();
    await expect(canvas.getByText('USD · New York')).toBeVisible();
  },
};
