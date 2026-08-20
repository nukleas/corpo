import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AssignmentSlots } from './AssignmentSlots';
import { LICENSES } from './LicenseCatalog.fixtures';

const meta = {
  title: 'Operations/AssignmentSlots',
  component: AssignmentSlots,
  tags: ['autodocs'],
} satisfies Meta<typeof AssignmentSlots>;
export default meta;
type Story = StoryObj<typeof meta>;

const byId = (id: string) => LICENSES.find((l) => l.id === id);

const SLOTS = [
  { id: 'observability', label: 'Observability', item: byId('datadog') },
  { id: 'tracking', label: 'Tracking', item: byId('linear') },
  { id: 'devtools', label: 'Developer tools', item: byId('gh-copilot') },
  { id: 'design', label: 'Design', item: null },
];

export const Default: Story = {
  args: { slots: SLOTS, selectedSlotId: 'tracking', style: { maxWidth: 360 } },
};

export const Interactive: Story = {
  args: { slots: SLOTS },
  render: (args) => {
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    return (
      <AssignmentSlots
        {...args}
        style={{ maxWidth: 360 }}
        selectedSlotId={selectedSlotId}
        onSelectSlot={(slot) => setSelectedSlotId(slot.id)}
      />
    );
  },
};
