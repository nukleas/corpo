import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { NavigationMenu, type NavigationMenuItem } from './NavigationMenu';

const ITEMS: NavigationMenuItem[] = [
  { id: 'home', label: 'Home', href: '#home' },
  {
    id: 'finance',
    label: 'Finance',
    links: [
      {
        id: 'ledger',
        label: 'General ledger',
        description: 'Journals, postings and the trial balance.',
        href: '#ledger',
      },
      { id: 'payables', label: 'Payables', description: 'Vendor bills and payment runs.', href: '#payables' },
      {
        id: 'receivables',
        label: 'Receivables',
        description: 'Invoices, collections and aging.',
        href: '#receivables',
      },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    links: [
      { id: 'orders', label: 'Sales orders', href: '#orders' },
      { id: 'customers', label: 'Customers', href: '#customers' },
    ],
  },
  { id: 'reports', label: 'Reports', href: '#reports' },
];

const meta: Meta<typeof NavigationMenu> = {
  title: 'Navigation/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof NavigationMenu>;

/** Module navigation for a multi-area app; the item holding the current page is marked active. */
export const Default: Story = {
  render: () => {
    const [active, setActive] = useState('payables');
    return (
      <div style={{ minHeight: 280 }}>
        <NavigationMenu aria-label="Main" items={ITEMS} activeId={active} onSelect={setActive} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const finance = canvas.getByRole('button', { name: /Finance/ });
    await expect(finance).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(finance);
    await expect(canvas.getByRole('link', { name: /Payables/ })).toHaveAttribute('aria-current', 'page');
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: /General ledger/ })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(finance).toHaveAttribute('aria-expanded', 'false');
    await expect(finance).toHaveFocus();

    await userEvent.click(canvas.getByRole('button', { name: /Sales/ }));
    await userEvent.click(canvas.getByRole('link', { name: 'Customers' }));
    await expect(canvas.getByRole('button', { name: /Sales/ })).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByRole('button', { name: /Sales/ })).toHaveClass('is-active');
  },
};
