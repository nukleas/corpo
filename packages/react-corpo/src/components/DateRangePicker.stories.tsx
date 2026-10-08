import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { DateRangePicker } from './DateRangePicker';
import type { DateRange, DateRangePreset } from './DateRangePicker';
import { Field } from './Field';

const meta: Meta<typeof DateRangePicker> = {
  title: 'Forms/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DateRangePicker>;

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Pick two days in either order, or a preset. The range is inclusive. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>({
      start: new Date(2026, 8, 1),
      end: new Date(2026, 8, 30),
    });
    return (
      <div style={{ width: 260 }}>
        <Field label="Period" hint={value ? `${iso(value.start)} to ${iso(value.end)}` : 'No period'}>
          <DateRangePicker value={value} onChange={setValue} />
        </Field>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Period' }));
    await userEvent.click(canvas.getByRole('button', { name: '18' }));
    await expect(canvas.getByText('Select the end date')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '12' })); // earlier day — order is normalized
    await expect(canvas.getByText('2026-09-12 to 2026-09-18')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Period' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Year to date' }));
    await expect(canvas.getByText(new RegExp(`^${new Date().getFullYear()}-01-01 to `))).toBeInTheDocument();
  },
};

const FISCAL_PRESETS: DateRangePreset[] = [
  { label: 'FY 2026', range: () => ({ start: new Date(2025, 6, 1), end: new Date(2026, 5, 30) }) },
  { label: 'FY 2027 Q1', range: () => ({ start: new Date(2026, 6, 1), end: new Date(2026, 8, 30) }) },
  { label: 'FY 2027 Q2', range: () => ({ start: new Date(2026, 9, 1), end: new Date(2026, 11, 31) }) },
];

/** Fiscal calendars differ per company, so fiscal periods are presets the page supplies. */
export const FiscalPresets: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>();
    return (
      <div style={{ width: 260 }}>
        <Field label="Fiscal period">
          <DateRangePicker value={value} onChange={setValue} presets={FISCAL_PRESETS} />
        </Field>
      </div>
    );
  },
};
