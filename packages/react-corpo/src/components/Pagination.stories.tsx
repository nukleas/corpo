import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(4);
    return <Pagination page={page} totalPages={12} onChange={setPage} showInfo />;
  },
};

// Stand-in for a router link (react-router's Link, Next's Link, …).
// oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- stand-in router link mirrors the untyped passthrough contract
function FakeRouterLink({ to, ...rest }: { to: string } & Record<string, unknown>) {
  return <a data-router-to={to} {...rest} />;
}

/** `as` + `linkProps(page)` render items as real links — boundary prev/next become `aria-disabled` spans, the current page gets `aria-current="page"`. */
export const RouterLinks: Story = {
  render: () => (
    <Pagination
      page={1}
      totalPages={12}
      as={FakeRouterLink}
      linkProps={(p) => ({ to: `/invoices?page=${p}` })}
      showInfo
    />
  ),
};

/** Plain-anchor link mode — `linkProps` alone defaults the element to `<a>`. */
export const AnchorLinks: Story = {
  render: () => (
    <Pagination page={4} totalPages={12} linkProps={(p) => ({ href: `?page=${p}` })} />
  ),
};
