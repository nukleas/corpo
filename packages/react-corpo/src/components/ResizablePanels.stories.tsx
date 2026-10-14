import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ResizablePanels } from './ResizablePanels';
import { DescriptionList } from './DescriptionList';

const meta: Meta<typeof ResizablePanels> = {
  title: 'Layout/ResizablePanels',
  component: ResizablePanels,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof ResizablePanels>;

const pane = (text: string) => <div style={{ padding: 16 }}>{text}</div>;

/** Master–detail: drag the handle, or focus it and use the arrow keys; Home and End jump to the limits. */
export const Horizontal: Story = {
  render: () => (
    <div style={{ height: 240, border: '1px solid var(--corpo-border)' }}>
      <ResizablePanels handleLabel="Resize invoice list" defaultSize={35} min={20} max={70}>
        {[pane('Invoice list'), pane('INV-2041 — Acme Inc., due Nov 4')]}
      </ResizablePanels>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator', { name: 'Resize invoice list' });
    await expect(handle).toHaveAttribute('aria-valuenow', '35');

    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '40');
    await userEvent.keyboard('{End}');
    await expect(handle).toHaveAttribute('aria-valuenow', '70');
    await userEvent.keyboard('{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '70');
    await userEvent.keyboard('{Home}');
    await expect(handle).toHaveAttribute('aria-valuenow', '20');
  },
};

/** Controlled, stacked panes — the size is reported back to the page. */
export const Vertical: Story = {
  render: () => {
    const [size, setSize] = useState(60);
    return (
      <div style={{ height: 320, border: '1px solid var(--corpo-border)' }}>
        <ResizablePanels orientation="vertical" handleLabel="Resize report" size={size} onSizeChange={setSize}>
          {[
            pane(`Report preview — ${size}% of the height`),
            <div key="details" style={{ padding: 16 }}>
              <DescriptionList items={[{ label: 'Generated', value: 'Oct 13, 2026' }]} />
            </div>,
          ]}
        </ResizablePanels>
      </div>
    );
  },
};
