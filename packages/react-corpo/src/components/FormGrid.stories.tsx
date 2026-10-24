import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import { DatePicker } from './DatePicker';
import { Field } from './Field';
import { FormGrid, FormSection } from './FormGrid';
import { Input } from './Input';
import { NumberInput } from './NumberInput';
import { Select } from './Select';
import { Textarea } from './Textarea';

const meta: Meta<typeof FormSection> = {
  title: 'Forms/FormGrid',
  component: FormSection,
  subcomponents: { FormGrid },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof FormSection>;

/**
 * A record form in titled sections. Fields flow into columns; `span` widens one. Columns follow
 * the form's width, not the viewport: three and four become two at 768px, and every grid becomes
 * one column at 480px. Narrow the container, not the window.
 */
export const Sections: Story = {
  render: () => {
    const [due, setDue] = useState<Date | undefined>(new Date(2026, 9, 30));
    const [limit, setLimit] = useState<number | null>(25_000);
    return (
      <div style={{ maxWidth: 880 }}>
        <FormSection title="Customer" description="Who the order bills and ships to." columns={3}>
          <Field label="Customer" required>
            <Input defaultValue="Northwind Traders" />
          </Field>
          <Field label="Contact">
            <Input defaultValue="Maria Anders" />
          </Field>
          <Field label="Customer PO">
            <Input defaultValue="PO-88231" />
          </Field>
          <Field label="Billing address" span={2}>
            <Input defaultValue="12 Orchard Way, Portland, OR 97205" />
          </Field>
          <Field label="Credit limit">
            <NumberInput value={limit} onChange={setLimit} decimals={2} prefix="$" />
          </Field>
        </FormSection>
        <FormSection title="Terms" columns={3}>
          <Field label="Payment terms">
            <Select defaultValue="net30">
              <option value="net15">Net 15</option>
              <option value="net30">Net 30</option>
              <option value="net60">Net 60</option>
            </Select>
          </Field>
          <Field label="Due date">
            <DatePicker value={due} onChange={setDue} />
          </Field>
          <Field label="Currency">
            <Select defaultValue="usd">
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
            </Select>
          </Field>
          <Field label="Notes" span="full" hint="Printed on the order confirmation.">
            <Textarea rows={3} defaultValue="Deliver to the loading dock before 3 PM." />
          </Field>
        </FormSection>
      </div>
    );
  },
};

/** `FormGrid` alone, for forms without section titles. */
export const Grid: Story = {
  render: () => (
    <FormGrid columns={4} style={{ maxWidth: 880 }}>
      <Field label="SKU">
        <Input defaultValue="DSK-210" />
      </Field>
      <Field label="Name" span={2}>
        <Input defaultValue="Electric standing desk, 60 in" />
      </Field>
      <Field label="Unit">
        <Input defaultValue="Each" />
      </Field>
    </FormGrid>
  ),
};

function columnCount(root: Element | null): number {
  const grid = root?.querySelector('.cp-form-grid');
  if (!grid) return 0;
  return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
}

/** A 4-column grid stays four across a wide container and stacks in a narrow one. */
export const Container: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <FormGrid columns={4} data-testid="wide" style={{ width: 880 }}>
        <Field label="Wide one">
          <Input defaultValue="A" />
        </Field>
        <Field label="Wide two">
          <Input defaultValue="B" />
        </Field>
        <Field label="Wide three">
          <Input defaultValue="C" />
        </Field>
        <Field label="Wide four">
          <Input defaultValue="D" />
        </Field>
      </FormGrid>
      <FormGrid columns={4} data-testid="narrow" style={{ width: 320 }}>
        <Field label="Narrow one">
          <Input defaultValue="A" />
        </Field>
        <Field label="Narrow two">
          <Input defaultValue="B" />
        </Field>
        <Field label="Narrow three">
          <Input defaultValue="C" />
        </Field>
        <Field label="Narrow four">
          <Input defaultValue="D" />
        </Field>
      </FormGrid>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const wide = canvasElement.querySelector('[data-testid="wide"]');
    const narrow = canvasElement.querySelector('[data-testid="narrow"]');
    await expect(wide).toBeTruthy();
    await expect(narrow).toBeTruthy();
    await expect(columnCount(wide)).toBe(4);
    await expect(columnCount(narrow)).toBe(1);
  },
};
