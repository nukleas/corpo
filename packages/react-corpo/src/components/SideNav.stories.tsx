import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { SideNav, type SideNavSection } from './SideNav';
import { Badge } from './Badge';
import { Button } from './Button';

const meta = {
  title: 'Navigation/SideNav',
  component: SideNav,
  tags: ['autodocs'],
} satisfies Meta<typeof SideNav>;
export default meta;
type Story = StoryObj<typeof meta>;

// Stand-in for a router link (react-router's Link, Next's Link, …).
// oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- stand-in router link mirrors the untyped passthrough contract
function FakeRouterLink({ to, ...rest }: { to: string } & Record<string, unknown>) {
  // oxlint-disable-next-line jsx-a11y/anchor-has-content -- children arrive through the rest spread
  return <a data-router-to={to} {...rest} />;
}

const SECTIONS = [
  {
    title: 'Billing',
    items: [
      { id: 'invoices', label: 'Invoices', badge: <Badge color="amber">3</Badge> },
      { id: 'payments', label: 'Payments' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { id: 'people', label: 'People' },
      { id: 'settings', label: 'Settings' },
    ],
  },
];

export const Default: Story = {
  args: { brand: 'Halcyon Group', sections: SECTIONS },
  render: (args) => {
    const [activeId, setActiveId] = useState('invoices');
    return (
      <div style={{ width: 240, height: 420, border: '1px solid var(--corpo-border-dim)' }}>
        <SideNav {...args} activeId={activeId} onSelect={setActiveId} />
      </div>
    );
  },
};

/** Items render as router links via the `as` + `linkProps` pattern. */
export const RouterLinks: Story = {
  args: {
    brand: 'Halcyon Group',
    activeId: 'invoices',
    sections: [
      {
        title: 'Billing',
        items: [
          { id: 'invoices', label: 'Invoices', as: FakeRouterLink, linkProps: { to: '/invoices' } },
          { id: 'payments', label: 'Payments', as: FakeRouterLink, linkProps: { to: '/payments' } },
        ],
      },
    ],
  },
  render: (args) => (
    <div style={{ width: 240, height: 300, border: '1px solid var(--corpo-border-dim)' }}>
      <SideNav {...args} />
    </div>
  ),
};

const icon = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MODULES: SideNavSection[] = [
  {
    items: [{ id: 'home', label: 'Home', icon: icon('M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z') }],
  },
  {
    title: 'Modules',
    items: [
      {
        id: 'sales',
        label: 'Sales',
        icon: icon('M4 19V9M10 19V5M16 19v-7M22 19H2'),
        items: [
          { id: 'quotes', label: 'Quotes' },
          { id: 'orders', label: 'Sales orders' },
          { id: 'invoices', label: 'Invoices', badge: <Badge color="amber">3</Badge> },
        ],
      },
      {
        id: 'finance',
        label: 'Finance',
        icon: icon('M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6'),
        items: [
          {
            id: 'receivables',
            label: 'Receivables',
            items: [
              { id: 'ar-aging', label: 'Aging' },
              { id: 'ar-receipts', label: 'Receipts' },
            ],
          },
          {
            id: 'ledger',
            label: 'General ledger',
            items: [
              { id: 'journal', label: 'Journal entries' },
              { id: 'trial-balance', label: 'Trial balance' },
            ],
          },
        ],
      },
      {
        id: 'inventory',
        label: 'Inventory',
        icon: icon('M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7'),
        items: [
          { id: 'items', label: 'Items' },
          { id: 'warehouses', label: 'Warehouses' },
        ],
      },
    ],
  },
  {
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: icon('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2M18 12h2M12 4v2M12 18v2'),
      },
    ],
  },
];

/**
 * ERP module tree. Groups toggle in place and open around the active page.
 * ArrowUp/ArrowDown move between visible items, ArrowRight opens a group or
 * steps into it, ArrowLeft closes it or steps back out to its parent.
 */
export const ModuleTree: Story = {
  args: { brand: 'Halcyon Group', sections: MODULES },
  render: (args) => {
    const [activeId, setActiveId] = useState('trial-balance');
    return (
      <div style={{ width: 240, height: 520, border: '1px solid var(--corpo-border-dim)' }}>
        <SideNav {...args} activeId={activeId} onSelect={setActiveId} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The active page's groups start open.
    const finance = canvas.getByRole('button', { name: 'Finance' });
    const ledger = canvas.getByRole('button', { name: 'General ledger' });
    expect(finance).toHaveAttribute('aria-expanded', 'true');
    expect(ledger).toHaveAttribute('aria-expanded', 'true');
    expect(canvas.getByRole('button', { name: 'Trial balance' })).toHaveAttribute('aria-current', 'page');
    const sales = canvas.getByRole('button', { name: 'Sales' });
    expect(sales).toHaveAttribute('aria-expanded', 'false');

    // ArrowRight opens Sales, again steps into it; ArrowLeft steps back out, again closes it.
    sales.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(sales).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(canvas.getByRole('button', { name: 'Quotes' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(canvas.getByRole('button', { name: /Invoices/ })).toHaveAttribute('aria-current', 'page');
    await userEvent.keyboard('{ArrowLeft}');
    expect(sales).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(sales).toHaveAttribute('aria-expanded', 'false');
    // A closed group that holds the active page is marked.
    expect(sales).toHaveClass('is-active-parent');

    // ArrowDown skips the items of closed groups.
    await userEvent.keyboard('{ArrowDown}');
    expect(finance).toHaveFocus();
    await userEvent.click(ledger);
    expect(ledger).toHaveAttribute('aria-expanded', 'false');
    expect(canvas.queryByRole('button', { name: 'Journal entries' })).not.toBeInTheDocument();
  },
};

/**
 * Icon rail for wide screens. Labels become tooltips; a group opens as a
 * flyout beside its icon. Escape or ArrowLeft closes it and returns focus.
 * Keep the full nav in the off-canvas drawer below 768px.
 */
export const CollapsedRail: Story = {
  args: { sections: MODULES },
  render: (args) => {
    const [activeId, setActiveId] = useState('invoices');
    const [collapsed, setCollapsed] = useState(true);
    return (
      <div
        style={{
          width: collapsed ? 56 : 240,
          height: 420,
          border: '1px solid var(--corpo-border-dim)',
          display: 'flex',
        }}
      >
        <SideNav
          {...args}
          activeId={activeId}
          onSelect={setActiveId}
          collapsed={collapsed}
          footer={
            <Button
              size="sm"
              icon
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? '»' : '«'}
            </Button>
          }
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    // Labels stay in the accessible name.
    const sales = canvas.getByRole('button', { name: 'Sales' });
    expect(sales).toHaveClass('is-active-parent');

    await userEvent.hover(canvas.getByRole('button', { name: 'Home' }));
    expect(canvasElement.querySelector('.cp-sidenav__tip')).toHaveTextContent('Home');

    await userEvent.click(sales);
    const flyout = body.getByRole('group', { name: 'Sales' });
    await waitFor(() => expect(within(flyout).getByRole('button', { name: 'Quotes' })).toHaveFocus());
    await userEvent.keyboard('{ArrowUp}');
    expect(within(flyout).getByRole('button', { name: /Invoices/ })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(body.queryByRole('group', { name: 'Sales' })).not.toBeInTheDocument();
    expect(sales).toHaveFocus();

    // Nested groups expand inside the flyout; running an item closes it.
    await userEvent.keyboard('{ArrowDown}{Enter}');
    const finance = body.getByRole('group', { name: 'Finance' });
    await userEvent.click(within(finance).getByRole('button', { name: 'General ledger' }));
    await userEvent.click(within(finance).getByRole('button', { name: 'Journal entries' }));
    expect(body.queryByRole('group', { name: 'Finance' })).not.toBeInTheDocument();
    expect(canvas.getByRole('button', { name: 'Finance' })).toHaveClass('is-active-parent');
  },
};
