import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Topbar } from './Topbar';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { NavigationMenu } from './NavigationMenu';

const meta = {
  title: 'Navigation/Topbar',
  component: Topbar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Topbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Invoices',
    actions: (
      <>
        <Button size="sm" variant="primary">
          New invoice
        </Button>
        <Avatar size="sm" initials="AS" />
      </>
    ),
  },
};

/**
 * Top-nav contract: the link row scrolls inside a 390px frame and the Sign out
 * action stays inside the bar. The frame itself does not grow.
 */
export const LinkRow: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div data-testid="frame" style={{ width: 390 }}>
      <Topbar
        title="Ledger"
        actions={
          <Button size="sm" variant="primary">
            Sign out
          </Button>
        }
      >
        <NavigationMenu
          aria-label="Pages"
          items={[
            { id: 'home', label: 'Overview', href: '#overview' },
            { id: 'invoices', label: 'Invoices', href: '#invoices' },
            { id: 'payments', label: 'Payments', href: '#payments' },
            { id: 'orders', label: 'Sales orders', href: '#orders' },
            { id: 'customers', label: 'Customers', href: '#customers' },
            { id: 'reports', label: 'Reports', href: '#reports' },
          ]}
        />
      </Topbar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvasElement.querySelector('[data-testid="frame"]');
    const bar = canvasElement.querySelector('.cp-topbar');
    const list = canvasElement.querySelector('.cp-navmenu__list');
    if (!(frame instanceof HTMLElement) || !(bar instanceof HTMLElement) || !(list instanceof HTMLElement)) {
      throw new Error('missing top bar');
    }
    const action = canvas.getByRole('button', { name: 'Sign out' }).getBoundingClientRect();
    const barBox = bar.getBoundingClientRect();
    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth + 1);
    await expect(bar.scrollWidth).toBeLessThanOrEqual(bar.clientWidth + 1);
    await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth + 8);
    await expect(action.right).toBeLessThanOrEqual(barBox.right + 1);
    await expect(action.left).toBeGreaterThanOrEqual(barBox.left);
  },
};

/** With the mobile nav toggle (visible below 768px). */
export const WithNavToggle: Story = {
  args: {
    title: 'Invoices',
    onNavToggle: () => {},
    actions: <Avatar size="sm" initials="AS" />,
  },
};
