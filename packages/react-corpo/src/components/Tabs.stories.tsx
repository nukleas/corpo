import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Tabs } from './Tabs';
import { Field } from './Field';
import { Input } from './Input';
import { Table } from './Table';

const tabs = [
  { id: 'open', label: 'Open', count: 12 },
  { id: 'paid', label: 'Paid', count: 84 },
  { id: 'overdue', label: 'Overdue', count: 3 },
];

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: { tabs, 'aria-label': 'Invoice status' },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Underline: Story = {};
export const Pills: Story = { args: { pills: true } };

/**
 * Each tab owns a `panel`. Inactive panels stay mounted but hidden, so a half-filled form keeps its
 * input across tab switches. One tab stop: arrow keys and Home/End move between tabs and select them.
 */
export const WithPanels: Story = {
  args: {
    'aria-label': 'Vendor record',
    tabs: [
      {
        id: 'details',
        label: 'Details',
        panel: (
          <Field label="Vendor name">
            <Input defaultValue="" />
          </Field>
        ),
      },
      { id: 'contacts', label: 'Contacts', count: 2, panel: <p>Ana Sørensen, Brian Okafor</p> },
      { id: 'documents', label: 'Documents', panel: <p>No documents uploaded.</p> },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tab = (name: string) => canvas.getByRole('tab', { name: new RegExp(name) });

    await userEvent.type(canvas.getByLabelText('Vendor name'), 'Initech');

    await userEvent.click(tab('Contacts'));
    await expect(tab('Contacts')).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Ana Sørensen');

    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Documents')).toHaveFocus();
    await expect(tab('Documents')).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Details')).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(tab('Documents')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(tab('Details')).toHaveAttribute('aria-selected', 'true');
    await expect(tab('Contacts')).toHaveAttribute('tabindex', '-1');

    await expect(canvas.getByLabelText('Vendor name')).toHaveValue('Initech');
  },
};

/** No per-tab panels: `children` is one shared panel — here a table the tabs would filter. */
export const FilterStrip: Story = {
  render: (args) => (
    <Tabs {...args}>
      <Table
        columns={[
          { key: 'id', label: 'Invoice' },
          { key: 'client', label: 'Client' },
        ]}
        rows={[
          { id: 'INV-2041', client: 'Acme Inc.' },
          { id: 'INV-2038', client: 'Globex' },
        ]}
      />
    </Tabs>
  ),
};
