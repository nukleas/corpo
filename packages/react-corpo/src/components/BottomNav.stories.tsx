import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { BottomNav, type BottomNavItem } from './BottomNav';
import { Badge } from './Badge';

const icon = (d: string) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ITEMS: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: icon('M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z') },
  {
    id: 'approvals',
    label: 'Approvals',
    icon: icon('M9 12l2 2 4-4M5 4h14v16H5z'),
    badge: <Badge color="red">3</Badge>,
  },
  { id: 'expenses', label: 'Expenses', icon: icon('M4 6h16M4 12h16M4 18h10') },
  { id: 'profile', label: 'Profile', icon: icon('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0') },
];

const meta: Meta<typeof BottomNav> = {
  title: 'Navigation/BottomNav',
  component: BottomNav,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof BottomNav>;

/** A phone tab bar. Inside AppShell it shows only below 768px; standalone, as here, it always shows. */
export const Default: Story = {
  render: () => {
    const [active, setActive] = useState('home');
    return (
      <div style={{ maxWidth: 400, border: '1px solid var(--corpo-border)' }}>
        <BottomNav aria-label="Main" items={ITEMS} activeId={active} onSelect={setActive} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /Home/ })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: /Approvals/ }));
    await expect(canvas.getByRole('button', { name: /Approvals/ })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('button', { name: /Home/ })).not.toHaveAttribute('aria-current');
  },
};
