import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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
 * A record form in titled sections. Fields flow into columns; `span` widens one. Columns step down
 * to two below 768px and one below 480px — resize the canvas to see it.
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
