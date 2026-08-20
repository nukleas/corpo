import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Invoices', href: '/invoices' },
      { label: 'Acme Inc.', href: '/invoices/acme' },
      { label: 'INV-2041' },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {};

// Stand-in for a router link (react-router's Link, Next's Link, …).
function FakeRouterLink({ to, ...rest }: { to: string } & Record<string, unknown>) {
  return <a data-router-to={to} {...rest} />;
}

/** `as` + `linkProps` render items with a router link component instead of a plain anchor. */
export const RouterLinks: Story = {
  args: {
    items: [
      { label: 'Invoices', as: FakeRouterLink, linkProps: { to: '/invoices' } },
      { label: 'Acme Inc.', as: FakeRouterLink, linkProps: { to: '/invoices/acme' } },
      { label: 'INV-2041' },
    ],
  },
};
