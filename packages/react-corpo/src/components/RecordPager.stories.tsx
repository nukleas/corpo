import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { RecordPager } from './RecordPager';

const meta: Meta<typeof RecordPager> = {
  title: 'Navigation/RecordPager',
  component: RecordPager,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof RecordPager>;

/** Steps through the list a record was opened from. The ends disable their button. */
export const Default: Story = {
  render: function Render() {
    const [position, setPosition] = useState(1);
    return (
      <RecordPager
        position={position}
        total={3}
        onPrevious={() => setPosition((p) => p - 1)}
        onNext={() => setPosition((p) => p + 1)}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const previous = canvas.getByRole('button', { name: 'Previous record' });
    const next = canvas.getByRole('button', { name: 'Next record' });
    await expect(canvas.getByText('1 of 3')).toBeInTheDocument();
    await expect(previous).toBeDisabled();
    await userEvent.click(next);
    await userEvent.click(next);
    await expect(canvas.getByText('3 of 3')).toBeInTheDocument();
    await expect(next).toBeDisabled();
    await expect(previous).toBeEnabled();
  },
};
