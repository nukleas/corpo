import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { MultiSelect } from './MultiSelect';
import { Field } from './Field';

const COST_CENTERS = [
  { value: 'cc-100', label: 'Finance', description: 'CC-100' },
  { value: 'cc-200', label: 'Operations', description: 'CC-200' },
  { value: 'cc-300', label: 'Sales', description: 'CC-300' },
  { value: 'cc-400', label: 'Engineering', description: 'CC-400' },
];

const meta: Meta<typeof MultiSelect> = {
  title: 'Forms/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof MultiSelect>;

/** Picks keep the list open; chips remove with their × or with Backspace in an empty search. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['cc-100']);
    return (
      <div style={{ width: 360 }}>
        <Field label="Cost centers">
          <MultiSelect options={COST_CENTERS} value={value} onChange={setValue} placeholder="Add cost centers…" />
        </Field>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Cost centers' });

    await userEvent.click(input);
    await expect(canvas.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    await userEvent.type(input, 'eng');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Engineering', { selector: '.cp-chip' })).toBeInTheDocument();
    await expect(input).toHaveValue('');
    await expect(canvas.getByRole('listbox')).toBeInTheDocument();

    await userEvent.keyboard('{Backspace}');
    await expect(canvas.queryByText('Engineering', { selector: '.cp-chip' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Finance' }));
    await expect(canvas.queryByText('Finance', { selector: '.cp-chip' })).toBeNull();
  },
};

/** Free-form tags: `onCreate` adds whatever was typed. */
export const Tags: Story = {
  render: () => {
    const [tags, setTags] = useState([
      { value: 'urgent', label: 'urgent' },
      { value: 'q4', label: 'q4' },
    ]);
    const [value, setValue] = useState<string[]>(['urgent']);
    return (
      <div style={{ width: 360 }}>
        <Field label="Tags">
          <MultiSelect
            options={tags}
            value={value}
            onChange={setValue}
            onCreate={(tag) => {
              setTags([...tags, { value: tag, label: tag }]);
              setValue([...value, tag]);
            }}
            placeholder="Add tags…"
          />
        </Field>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Tags' });
    await userEvent.type(input, 'audit');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('audit', { selector: '.cp-chip' })).toBeInTheDocument();
  },
};
