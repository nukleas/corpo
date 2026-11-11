import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { ModuleLauncher, type LauncherModule } from './ModuleLauncher';
import { Topbar } from './Topbar';

const icon = (d: string) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MODULES: LauncherModule[] = [
  { id: 'sales', label: 'Sales', description: 'Quotes, orders', icon: icon('M4 19V9M10 19V5M16 19v-7M22 19H2') },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Ledger, AR, AP',
    icon: icon('M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6'),
  },
  {
    id: 'inventory',
    label: 'Inventory',
    description: 'Items, stock',
    icon: icon('M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7'),
  },
  { id: 'purchasing', label: 'Purchasing', description: 'POs, vendors', icon: icon('M3 4h2l2 12h12l2-8H7') },
  {
    id: 'people',
    label: 'People',
    description: 'Staff, payroll',
    icon: icon('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'),
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Dashboards',
    icon: icon('M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3'),
  },
];

const meta: Meta<typeof ModuleLauncher> = {
  title: 'Navigation/ModuleLauncher',
  component: ModuleLauncher,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ModuleLauncher>;

/**
 * The module launcher in the top bar. Opening it focuses the current module;
 * arrow keys move across the grid, Escape closes it and returns focus.
 */
export const InTopbar: Story = {
  parameters: { layout: 'padded' },
  render: function Render() {
    const [module, setModule] = useState('finance');
    const name = MODULES.find((m) => m.id === module)?.label;
    return (
      <div style={{ border: '1px solid var(--corpo-border-dim)', height: 360 }}>
        <Topbar
          title={name}
          actions={<ModuleLauncher modules={MODULES} activeId={module} onSelect={setModule} align="end" />}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Modules' });

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const panel = canvas.getByRole('navigation', { name: 'Modules' });
    const finance = within(panel).getByRole('button', { name: /Finance/ });
    await waitFor(() => expect(finance).toHaveFocus());
    await expect(finance).toHaveAttribute('aria-current', 'page');

    await userEvent.keyboard('{ArrowRight}');
    await expect(within(panel).getByRole('button', { name: /Inventory/ })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(toggle).toHaveFocus();
    await expect(canvas.queryByRole('navigation', { name: 'Modules' })).not.toBeInTheDocument();

    await userEvent.click(toggle);
    await userEvent.click(
      within(canvas.getByRole('navigation', { name: 'Modules' })).getByRole('button', { name: /People/ }),
    );
    await expect(canvas.getByText('People', { selector: '.cp-topbar__title' })).toBeInTheDocument();
    await expect(toggle).toHaveFocus();
  },
};
