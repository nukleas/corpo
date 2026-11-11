import type { Meta, StoryObj } from '@storybook/react';
import { Brand } from './Brand';
import { SideNav } from './SideNav';

const meta: Meta<typeof Brand> = {
  title: 'Navigation/Brand',
  component: Brand,
  tags: ['autodocs'],
  args: { name: 'Halcyon Group', detail: 'Halcyon UK Ltd' },
};
export default meta;

type Story = StoryObj<typeof Brand>;

/** Without a logo the mark shows the name's initials on the accent. */
export const Default: Story = {
  render: (args) => (
    <div style={{ width: 240 }}>
      <Brand {...args} />
    </div>
  ),
};

/** Pass an `<img>` or `<svg>` as `logo`; it sits on the panel, not the accent tile. */
export const WithLogo: Story = {
  args: {
    name: 'Meridian Books',
    detail: 'FY 2026',
    logo: (
      <svg viewBox="0 0 28 28" role="presentation">
        <rect width="28" height="28" rx="6" fill="var(--corpo-text)" />
        <path
          d="M7 19V9l7 6 7-6v10"
          fill="none"
          stroke="var(--corpo-bg-panel)"
          strokeWidth="2.25"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  render: (args) => (
    <div style={{ width: 240 }}>
      <Brand {...args} />
    </div>
  ),
};

/** In the SideNav brand row, and in the collapsed rail where only the mark shows. */
export const InSideNav: Story = {
  render: function Render() {
    const nav = (collapsed: boolean) => (
      <div
        style={{
          width: collapsed ? 56 : 240,
          height: 160,
          display: 'flex',
          border: '1px solid var(--corpo-border-dim)',
        }}
      >
        <SideNav
          collapsed={collapsed}
          brand={<Brand name="Halcyon Group" detail="Halcyon UK Ltd" />}
          sections={[{ items: [{ id: 'home', label: 'Home', icon: '⌂' }] }]}
          activeId="home"
        />
      </div>
    );
    return (
      <div style={{ display: 'flex', gap: 16 }}>
        {nav(false)}
        {nav(true)}
      </div>
    );
  },
};
