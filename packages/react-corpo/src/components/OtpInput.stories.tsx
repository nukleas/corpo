import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { OtpInput } from './OtpInput';
import { Field } from './Field';

const meta: Meta<typeof OtpInput> = {
  title: 'Forms/OtpInput',
  component: OtpInput,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof OtpInput>;

function Controlled({ error = false, initial = '' }: { error?: boolean; initial?: string }) {
  const [code, setCode] = useState(initial);
  return (
    <Field
      label="Verification code"
      hint="Enter the 6-digit code sent to your phone."
      error={error ? 'That code has expired. Request a new one.' : undefined}
    >
      <OtpInput value={code} onChange={setCode} error={error} />
    </Field>
  );
}

/** Typing fills the slots; Backspace removes the last digit; a pasted code fills them all, dropping spaces and dashes. */
export const Default: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Verification code' });
    await expect(input).toHaveAttribute('autocomplete', 'one-time-code');

    await userEvent.type(input, '12a3');
    await expect(input).toHaveValue('123');
    await userEvent.keyboard('{Backspace}');
    await expect(input).toHaveValue('12');

    await userEvent.clear(input);
    await userEvent.click(input);
    await userEvent.paste('482-913 7');
    await expect(input).toHaveValue('482913');
    await expect(canvasElement.querySelectorAll('.cp-otp__slot')[5]).toHaveTextContent('3');
  },
};

export const Rejected: Story = { render: () => <Controlled error initial="482913" /> };
