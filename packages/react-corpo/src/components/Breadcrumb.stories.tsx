import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Button } from './Button';
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
// oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- stand-in router link mirrors the untyped passthrough contract
function FakeRouterLink({ to, ...rest }: { to: string } & Record<string, unknown>) {
  // oxlint-disable-next-line jsx-a11y/anchor-has-content -- children arrive through the rest spread
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

const trail = [
  { label: 'Home', href: '#home' },
  { label: 'Finance', href: '#finance' },
  { label: 'General ledger', href: '#ledger' },
  { label: 'Journal entries', href: '#journal' },
  { label: 'Period 10', href: '#p10' },
  { label: 'JE-00412' },
];

/**
 * A trail of more than three items that doesn't fit keeps the first item and
 * the last two; the middle opens from "…". Widen it and the full trail returns.
 */
export const LongTrail: Story = {
  args: { items: trail },
  render: function Render(args) {
    const [wide, setWide] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Button size="sm" onClick={() => setWide((w) => !w)}>
          {wide ? 'Narrow' : 'Widen'}
        </Button>
        <div style={{ width: wide ? 640 : 320 }}>
          <Breadcrumb {...args} />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = within(canvas.getByRole('navigation', { name: 'Breadcrumb' }));
    const more = await nav.findByRole('button', { name: 'Show 3 more' });
    await expect(nav.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    await expect(nav.queryByRole('link', { name: 'Finance' })).not.toBeInTheDocument();
    await expect(nav.getByText('JE-00412', { selector: '[aria-current="page"]' })).toBeVisible();

    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(nav.getByRole('link', { name: 'Finance' })).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await expect(more).toHaveFocus();
    await expect(nav.queryByRole('link', { name: 'Finance' })).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Widen' }));
    await waitFor(() => expect(nav.getByRole('link', { name: 'Finance' })).toBeInTheDocument());
    await expect(nav.queryByRole('button', { name: /more/ })).not.toBeInTheDocument();
  },
};
