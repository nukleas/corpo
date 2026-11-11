import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { SplitButton } from './SplitButton';

const meta: Meta<typeof SplitButton> = {
  title: 'Actions/SplitButton',
  component: SplitButton,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof SplitButton>;

/** The main action runs on click; the arrow opens related actions. */
export const Default: Story = {
  render: () => {
    const [ran, setRan] = useState('');
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <SplitButton
          variant="primary"
          onClick={() => setRan('Save')}
          items={[
            { id: 'new', label: 'Save and new', onClick: () => setRan('Save and new') },
            { id: 'draft', label: 'Save as draft', onClick: () => setRan('Save as draft') },
          ]}
        >
          Save
        </SplitButton>
        <SplitButton
          onClick={() => setRan('Print')}
          items={[{ id: 'pdf', label: 'Download PDF', onClick: () => setRan('Download PDF') }]}
          menuLabel="More print options"
        >
          Print
        </SplitButton>
        <span style={{ fontSize: 'var(--corpo-text-sm)' }}>Last run: {ran || 'nothing'}</span>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(canvas.getByText('Last run: Save')).toBeInTheDocument();

    const arrow = canvas.getByRole('button', { name: 'More options' });
    await userEvent.click(arrow);
    expect(arrow).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(canvas.getByText('Last run: Save as draft')).toBeInTheDocument();
    expect(arrow).toHaveFocus();
  },
};
