import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { NotificationInbox, type InboxNotification } from './NotificationInbox';
import { Badge } from './Badge';
import { Button } from './Button';
import { Popover } from './Popover';
import { Topbar } from './Topbar';

const NOTIFICATIONS: InboxNotification[] = [
  {
    id: 'n1',
    title: 'Approval needed: PR-0419',
    body: 'Office furniture, $27,400 — waiting on Finance.',
    timestamp: '5m',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Maria Anders commented on SO-10482',
    body: '“Customer asked to hold delivery…”',
    timestamp: '1h',
    unread: true,
  },
  { id: 'n3', title: 'INV-2041 is 12 days overdue', timestamp: '3h', unread: true },
  { id: 'n4', title: 'Payment run 42 completed', body: '18 vendor bills, $96,210.00', timestamp: 'Yesterday' },
];

const meta: Meta<typeof NotificationInbox> = {
  title: 'Display/NotificationInbox',
  component: NotificationInbox,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof NotificationInbox>;

const bell = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    aria-hidden="true"
  >
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** In the Topbar: a bell opens the inbox in a Popover; opening a notification marks it read. */
export const InTopbar: Story = {
  render: () => {
    const [items, setItems] = useState(NOTIFICATIONS);
    const unread = items.filter((n) => n.unread).length;
    return (
      <div style={{ minHeight: 480 }}>
        <Topbar
          title="Finance"
          actions={
            <Popover
              align="right"
              trigger={
                <Button size="sm" variant="ghost" aria-label={`Notifications, ${unread} unread`}>
                  {bell}
                  {unread > 0 && <Badge color="accent">{unread}</Badge>}
                </Button>
              }
            >
              <NotificationInbox
                notifications={items}
                onOpen={(id) => setItems(items.map((n) => (n.id === id ? { ...n, unread: false } : n)))}
                onMarkAllRead={() => setItems(items.map((n) => ({ ...n, unread: false })))}
              />
            </Popover>
          }
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Notifications, 3 unread' }));
    await expect(canvas.getByText('3 new')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: /INV-2041 is 12 days overdue/ }));
    await expect(canvas.getByText('2 new')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /INV-2041/ })).not.toHaveTextContent('Unread');

    await userEvent.click(canvas.getByRole('button', { name: 'Mark all as read' }));
    await expect(canvas.queryByText(/new$/)).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Notifications, 0 unread' })).toBeInTheDocument();
  },
};

export const Empty: Story = {
  parameters: { layout: 'padded' },
  render: () => <NotificationInbox notifications={[]} />,
};
