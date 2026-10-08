import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Field } from './Field';
import { NumberInput } from './NumberInput';

const meta: Meta<typeof NumberInput> = {
  title: 'Forms/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof NumberInput>;

/** Money: grouped with fixed cents while idle, raw while editing. Rounds on blur. */
export const Currency: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(12_400);
    return (
      <div style={{ width: 240 }}>
        <Field label="Unit price" hint={`Value: ${value ?? 'empty'}`}>
          <NumberInput value={value} onChange={setValue} decimals={2} min={0} prefix="$" />
        </Field>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: 'Unit price' });
    await expect(input).toHaveValue('12,400.00');

    await userEvent.click(input);
    await expect(input).toHaveValue('12400'); // raw while editing
    await userEvent.clear(input);
    await userEvent.type(input, '1234.567x'); // the stray letter is rejected
    await userEvent.tab();
    await expect(input).toHaveValue('1,234.57');
    await expect(canvas.getByText('Value: 1234.57')).toBeInTheDocument();

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.tab();
    await expect(input).toHaveValue('1,235.57');
  },
};

/** Quantities: whole numbers, clamped to `min`/`max`, arrow keys step (Shift ×10). */
export const Quantity: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(4);
    return (
      <div style={{ width: 180 }}>
        <Field label="Quantity">
          <NumberInput value={value} onChange={setValue} decimals={0} min={1} max={500} suffix="pcs" />
        </Field>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('spinbutton', { name: 'Quantity' });
    await userEvent.click(input);
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    await expect(input).toHaveValue('14');
    await userEvent.clear(input);
    await userEvent.type(input, '9000');
    await userEvent.tab();
    await expect(input).toHaveValue('500');
  },
};

/** Rates read best with a `%` suffix; any precision is allowed when `decimals` is omitted. */
export const Percent: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(7.75);
    return (
      <div style={{ width: 160 }}>
        <Field label="Tax rate">
          <NumberInput value={value} onChange={setValue} min={0} max={100} step={0.25} suffix="%" />
        </Field>
      </div>
    );
  },
};

/** Empty is `null`, not zero — required fields can tell the difference. */
export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(null);
    return (
      <div style={{ width: 240 }}>
        <Field label="Discount" error={value == null ? 'Enter a discount, or 0 for none' : undefined} required>
          <NumberInput value={value} onChange={setValue} decimals={2} prefix="$" placeholder="0.00" />
        </Field>
      </div>
    );
  },
};
