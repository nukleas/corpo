import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { HoverCard } from './HoverCard';
import { Avatar } from './Avatar';

const meta: Meta<typeof HoverCard> = {
  title: 'Display/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  args: {
    children: <a href="#people/maria-anders">Maria Anders</a>,
    content: (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar initials="MA" />
        <div>
          <strong>Maria Anders</strong>
          <div>Purchasing lead, Northwind Traders</div>
        </div>
      </div>
    ),
  },
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HoverCard>;

/** Opens after the pointer rests on the name, or at once on keyboard focus; Escape closes. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Maria Anders' });

    await userEvent.hover(link);
    await waitFor(() => expect(canvas.getByText('Purchasing lead, Northwind Traders')).toBeVisible());
    await userEvent.unhover(link);
    await waitFor(() => expect(canvas.queryByText('Purchasing lead, Northwind Traders')).toBeNull());

    link.focus();
    await waitFor(() => expect(canvas.getByText('Purchasing lead, Northwind Traders')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByText('Purchasing lead, Northwind Traders')).toBeNull();
  },
};
