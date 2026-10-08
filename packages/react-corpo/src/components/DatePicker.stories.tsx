import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { DatePicker } from './DatePicker';
import { Field } from './Field';

const meta: Meta<typeof DatePicker> = {
  title: 'Forms/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DatePicker>;

/** Inside a Field, the label names the trigger; picking a day closes the calendar. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return (
      <div style={{ width: 220 }}>
        <Field label="Due date">
          <DatePicker value={value} onChange={setValue} />
        </Field>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Due date' });
    await expect(trigger).toHaveTextContent('Select a date');
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('button', { name: '15' }));
    await expect(canvas.queryByRole('button', { name: 'Next month' })).toBeNull();
    await expect(trigger).toHaveTextContent('15');
  },
};
