import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Item, ItemGroup } from './Item';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Switch } from './Switch';

const meta: Meta<typeof Item> = {
  title: 'Display/Item',
  component: Item,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Item>;

export const Default: Story = {
  args: {
    media: <Avatar initials="MA" />,
    title: 'Maria Anders',
    description: 'Purchasing lead · Northwind Traders',
    actions: <Button size="sm">Message</Button>,
    bordered: true,
    style: { maxWidth: 460 },
  },
};

/** A settings list: rows as `<li>` in an ItemGroup, each with a trailing control. */
export const SettingsList: Story = {
  render: () => {
    const [digest, setDigest] = useState(true);
    const [approvals, setApprovals] = useState(false);
    return (
      <ItemGroup aria-label="Email notifications" style={{ maxWidth: 520 }}>
        <Item
          as="li"
          bordered
          title="Daily digest"
          description="A summary of yesterday's activity at 8 AM."
          actions={<Switch aria-label="Daily digest" checked={digest} onChange={(e) => setDigest(e.target.checked)} />}
        />
        <Item
          as="li"
          bordered
          title="Approval requests"
          description="Email me when a document waits on my approval."
          actions={
            <Switch
              aria-label="Approval requests"
              checked={approvals}
              onChange={(e) => setApprovals(e.target.checked)}
            />
          }
        />
      </ItemGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await userEvent.click(canvas.getByRole('switch', { name: 'Approval requests' }));
    await expect(canvas.getByRole('switch', { name: 'Approval requests' })).toBeChecked();
  },
};

/** The whole row as a link — no trailing actions then. */
export const AsLink: Story = {
  render: () => (
    <ItemGroup style={{ maxWidth: 460 }}>
      <li>
        <Item
          as="a"
          href="#vendors/1004"
          media={<Avatar initials="IN" />}
          title="Initech"
          description="Vendor · 4 open bills"
        />
      </li>
      <li>
        <Item
          as="a"
          href="#vendors/1005"
          media={<Avatar initials="UL" />}
          title="Umbrella Logistics"
          description="Vendor · paid up"
        />
      </li>
    </ItemGroup>
  ),
};
