import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Button } from './Button';
import { Command, CommandDialog, type CommandGroup, type CommandItem } from './Command';
import { KbdGroup } from './KbdGroup';

const commands: CommandGroup[] = [
  {
    id: 'create',
    label: 'Create',
    items: [
      { id: 'new-invoice', label: 'New invoice', keywords: ['bill', 'AR'], shortcut: <KbdGroup keys={['Cmd', 'N']} /> },
      { id: 'new-order', label: 'New sales order', keywords: ['SO'] },
      { id: 'new-client', label: 'New client', keywords: ['customer'] },
      { id: 'new-journal', label: 'New journal entry', disabled: true, description: 'Period 10 is closed' },
    ],
  },
  {
    id: 'go',
    label: 'Go to',
    items: [
      { id: 'invoices', label: 'Invoices', description: 'Sales › Invoices' },
      { id: 'orders', label: 'Sales orders', description: 'Sales › Orders' },
      { id: 'trial-balance', label: 'Trial balance', description: 'Finance › Reports' },
      { id: 'settings', label: 'Settings' },
    ],
  },
];

const meta: Meta<typeof Command> = {
  title: 'Navigation/Command',
  component: Command,
  tags: ['autodocs'],
  args: { groups: commands },
};
export default meta;

type Story = StoryObj<typeof Command>;

/**
 * Type to filter by label, description or hidden keywords. ArrowUp/ArrowDown
 * move the active result (disabled ones are skipped), Enter runs it.
 */
export const Default: Story = {
  render: function Render(args) {
    const [ran, setRan] = useState('');
    return (
      <div style={{ width: 480 }}>
        <Command {...args} onSelect={(item) => setRan(item.label)} />
        <p style={{ fontSize: 'var(--corpo-text-sm)' }}>Last run: {ran || 'nothing'}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Search commands' });
    await waitFor(() => expect(input).toHaveFocus());

    // Hidden keywords match: "customer" finds "New client".
    await userEvent.type(input, 'customer');
    await expect(canvas.getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Last run: New client')).toBeInTheDocument();

    // "new" matches four items; the disabled journal entry is skipped by the arrows.
    await userEvent.clear(input);
    await userEvent.type(input, 'new');
    const options = canvas.getAllByRole('option');
    await expect(options).toHaveLength(4);
    await expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
    await userEvent.keyboard('{ArrowUp}{Enter}');
    await expect(canvas.getByText('Last run: New client')).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, 'zzz');
    await expect(canvas.getByRole('status')).toHaveTextContent('No results found.');
  },
};

const records: CommandItem[] = [
  { id: 'INV-1042', label: 'INV-1042', description: 'Calder & Bright · 4,200.00 · Paid' },
  { id: 'INV-1048', label: 'INV-1048', description: 'Ostara Foods · 1,180.00 · Pending' },
  { id: 'INV-1039', label: 'INV-1039', description: 'Keel Marine Supply · 860.00 · Overdue' },
  { id: 'SO-2210', label: 'SO-2210', description: 'Ostara Foods · Sales order' },
];
const recent: CommandGroup = {
  id: 'recent',
  label: 'Recent',
  items: [
    { id: 'INV-1048', label: 'INV-1048', description: 'Ostara Foods' },
    { id: 'trial-balance', label: 'Trial balance', description: 'Finance › Reports' },
  ],
};

/**
 * ERP palette: recent items while the query is empty, local commands, and a
 * server record search that comes back as a `filtered` group — "ostara" finds
 * records by client name even though the label is the document number.
 */
export const RecordSearch: Story = {
  render: function Render() {
    const [query, setQuery] = useState('');
    const [found, setFound] = useState<CommandItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [ran, setRan] = useState('');
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => () => clearTimeout(timer.current), []);

    const search = (q: string) => {
      setQuery(q);
      clearTimeout(timer.current);
      const needle = q.trim().toLowerCase();
      if (needle.length < 2) {
        setFound([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      timer.current = setTimeout(() => {
        setFound(records.filter((r) => `${r.label} ${r.description}`.toLowerCase().includes(needle)));
        setLoading(false);
      }, 300);
    };

    const groups: CommandGroup[] = query.trim()
      ? [{ id: 'records', label: 'Records', items: found, filtered: true }, ...commands]
      : [recent, ...commands];

    return (
      <div style={{ width: 480 }}>
        <Command
          groups={groups}
          placeholder="Search records or type a command…"
          onQueryChange={search}
          loading={loading}
          onSelect={(item) => setRan(item.id)}
        />
        <p style={{ fontSize: 'var(--corpo-text-sm)' }}>Opened: {ran || 'nothing'}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Recent' })).toBeInTheDocument();

    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'ostara');
    await expect(canvas.getByRole('status')).toHaveTextContent('Searching…');
    const recordsGroup = await canvas.findByRole('group', { name: 'Records' });
    await expect(within(recordsGroup).getAllByRole('option')).toHaveLength(2);
    await expect(canvas.queryByRole('group', { name: 'Recent' })).not.toBeInTheDocument();

    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(canvas.getByText('Opened: SO-2210')).toBeInTheDocument();
  },
};

/**
 * The ⌘K overlay. Ctrl+K or Cmd+K opens it from anywhere on the page; Escape,
 * a backdrop click, or running a result closes it and returns focus.
 */
export const Dialog: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [ran, setRan] = useState('');
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen(true);
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, []);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button onClick={() => setOpen(true)}>
          Search <KbdGroup keys={['Cmd', 'K']} />
        </Button>
        <span style={{ fontSize: 'var(--corpo-text-sm)' }}>Last run: {ran || 'nothing'}</span>
        <CommandDialog
          open={open}
          onClose={() => setOpen(false)}
          groups={commands}
          onSelect={(item) => setRan(item.label)}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: /Search/ });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: 'Command palette' });
    const input = within(dialog).getByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Control>}k{/Control}');
    await body.findByRole('dialog');
    await userEvent.keyboard('trial{Enter}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByText('Last run: Trial balance')).toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};
