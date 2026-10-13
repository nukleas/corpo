import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Combobox, type ComboboxOption } from './Combobox';
import { Field } from './Field';

const options = [
  { value: 'acme', label: 'Acme Inc.' },
  { value: 'northwind', label: 'Northwind Traders' },
  { value: 'globex', label: 'Globex Corporation' },
  { value: 'initech', label: 'Initech' },
];

const meta: Meta<typeof Combobox> = {
  title: 'Forms/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  args: { options },
};
export default meta;

type Story = StoryObj<typeof Combobox>;

/** Type to filter; ArrowDown/ArrowUp move through the options, Enter picks, Escape closes. */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <div style={{ width: 280 }}>
        <Field label="Client">
          <Combobox {...args} value={value} onChange={setValue} placeholder="Select a client…" />
        </Field>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Client' });

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute(
      'aria-activedescendant',
      canvas.getByRole('option', { name: 'Northwind Traders' }).id,
    );
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Northwind Traders');
    await expect(canvas.queryByRole('listbox')).toBeNull();

    // The picked label is selected, so typing starts a fresh search.
    await userEvent.keyboard('glo');
    await expect(canvas.getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Globex Corporation');

    await userEvent.keyboard('zzz');
    await expect(canvas.getByRole('status')).toHaveTextContent('No results');
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('listbox')).toBeNull();

    // Clicking back into a closed combobox reopens it with an empty search.
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await userEvent.click(input);
    await expect(input).toHaveValue('');
    await expect(canvas.getAllByRole('option')).toHaveLength(4);
  },
};

const CUSTOMERS: ComboboxOption[] = [
  { value: 'C-1001', label: 'Acme Inc.', description: 'C-1001 · billing@acme.example' },
  { value: 'C-1002', label: 'Northwind Traders', description: 'C-1002 · maria@northwind.example' },
  { value: 'C-1003', label: 'Globex Corporation', description: 'C-1003 · ap@globex.example' },
  { value: 'C-1004', label: 'Initech', description: 'C-1004 · bill.l@initech.example' },
  { value: 'C-1005', label: 'Umbrella Logistics', description: 'C-1005 · freight@umbrella.example' },
];

function CustomerLookup() {
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [value, setValue] = useState<string | undefined>();
  const [results, setResults] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Stands in for a server search: results arrive 300ms after the last keystroke.
  const search = (query: string) => {
    setLoading(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const q = query.toLowerCase();
      setResults(customers.filter((c) => c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q)));
      setLoading(false);
    }, 300);
  };
  const selected = customers.find((c) => c.value === value);

  return (
    <div style={{ width: 320 }}>
      <Field label="Customer" hint="Search by name or customer number.">
        <Combobox
          options={selected && !results.includes(selected) ? [selected, ...results] : results}
          value={value}
          onChange={setValue}
          onQueryChange={search}
          loading={loading}
          onCreate={(name) => {
            const created = { value: `C-${1001 + customers.length}`, label: name, description: 'New customer' };
            setCustomers([...customers, created]);
            setValue(created.value);
          }}
          placeholder="Find a customer…"
        />
      </Field>
    </div>
  );
}

/**
 * Entity lookup: a remote search (`onQueryChange` + `loading`) over rich rows (`description`), with a
 * create-new row (`onCreate`) when nothing matches exactly.
 */
export const EntityLookup: Story = {
  render: () => <CustomerLookup />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Customer' });

    await userEvent.type(input, 'C-1003');
    await expect(canvas.getByRole('status')).toHaveTextContent('Searching…');
    await waitFor(() => expect(canvas.getByRole('option', { name: /Globex Corporation/ })).toBeInTheDocument());
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Globex Corporation');

    await userEvent.keyboard('Halcyon Group');
    const create = await canvas.findByRole('option', { name: 'Create “Halcyon Group”' });
    await userEvent.click(create);
    await expect(input).toHaveValue('Halcyon Group');
  },
};
