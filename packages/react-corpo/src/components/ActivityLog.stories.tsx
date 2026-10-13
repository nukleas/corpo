import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ActivityLog, type ActivityEntry } from './ActivityLog';

const ENTRIES: ActivityEntry[] = [
  {
    id: 'e4',
    type: 'comment',
    author: 'Maria Anders',
    timestamp: 'Oct 6, 10:02 AM',
    body: 'Customer asked to hold delivery until the dock is repaired — moving the due date.',
  },
  {
    id: 'e3',
    type: 'change',
    author: 'Maria Anders',
    timestamp: 'Oct 6, 9:58 AM',
    changes: [
      { field: 'Due date', from: 'Nov 4, 2026', to: 'Nov 18, 2026' },
      { field: 'Notes', to: 'Hold for dock repair.' },
    ],
  },
  { id: 'e2', type: 'event', title: 'Order confirmed', tone: 'ok', timestamp: 'Oct 5, 2:40 PM' },
  { id: 'e1', type: 'event', title: 'Draft created', timestamp: 'Oct 5, 9:12 AM' },
];

const meta: Meta<typeof ActivityLog> = {
  title: 'Display/ActivityLog',
  component: ActivityLog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof ActivityLog>;

/** Comments, field-change audit entries and system events in one feed; Ctrl/⌘+Enter posts a comment. */
export const Default: Story = {
  render: () => {
    const [entries, setEntries] = useState(ENTRIES);
    return (
      <div style={{ maxWidth: 380 }}>
        <ActivityLog
          entries={entries}
          onComment={(body) =>
            setEntries([
              { id: `c${entries.length}`, type: 'comment', author: 'Ana Sørensen', timestamp: 'Just now', body },
              ...entries,
            ])
          }
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const post = canvas.getByRole('button', { name: 'Post comment' });
    await expect(post).toBeDisabled();
    await expect(canvas.getByText('changed 2 fields')).toBeInTheDocument();

    await userEvent.type(canvas.getByRole('textbox', { name: 'Comment' }), 'Dock repair confirmed for Nov 12.');
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    const first = within(canvas.getByRole('list', { name: 'Activity' })).getAllByRole('listitem')[0];
    await expect(first).toHaveTextContent('Ana Sørensen');
    await expect(first).toHaveTextContent('Dock repair confirmed for Nov 12.');
    await expect(canvas.getByRole('textbox', { name: 'Comment' })).toHaveValue('');
  },
};

/** Read-only: without `onComment` there is no comment box. */
export const ReadOnly: Story = {
  args: { entries: ENTRIES },
  render: (args) => (
    <div style={{ maxWidth: 380 }}>
      <ActivityLog {...args} />
    </div>
  ),
};
