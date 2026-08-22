import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SideNav } from './SideNav';
import { Badge } from './Badge';

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
