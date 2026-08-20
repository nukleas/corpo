import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LicenseCatalog } from './LicenseCatalog';
import { LICENSES } from './LicenseCatalog.fixtures';

const meta = {
  title: 'Operations/LicenseCatalog',
  component: LicenseCatalog,
  tags: ['autodocs'],
} satisfies Meta<typeof LicenseCatalog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { items: LICENSES, selectedId: 'datadog', assignedIds: ['datadog', 'linear'] },
};

export const PaddedGrid: Story = {
  args: { items: LICENSES.slice(0, 3), minCells: 6 },
};

/** Click to select; double-click (or Enter) fires the assign intent. */
export const Interactive: Story = {
  args: { items: LICENSES },
  render: (args) => {
    const [selectedId, setSelectedId] = useState<string | null>('linear');
    const [assignedIds, setAssignedIds] = useState<string[]>(['linear']);
    return (
      <LicenseCatalog
        {...args}
        selectedId={selectedId}
        assignedIds={assignedIds}
        onSelect={(item) => setSelectedId(item.id)}
        onActivate={(item) =>
          setAssignedIds((prev) =>
            prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
          )
        }
      />
    );
  },
};
