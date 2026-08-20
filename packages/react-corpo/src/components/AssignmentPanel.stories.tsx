import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LicenseCatalog } from './LicenseCatalog';
import type { LicenseItem } from './LicenseCatalog';
import { AssignmentSlots } from './AssignmentSlots';
import type { AssignmentSlot } from './AssignmentSlots';
import { LicenseDetail } from './LicenseDetail';
import { Button } from './Button';
import { SectionHeader } from './SectionHeader';
import { LICENSES } from './LicenseCatalog.fixtures';

const meta = {
  title: 'Operations/AssignmentPanel',
  parameters: { layout: 'padded' },
} satisfies Meta;
export default meta;

const SLOT_DEFS: { id: string; label: string; initial?: string }[] = [
  { id: 'observability', label: 'Observability', initial: 'datadog' },
  { id: 'tracking', label: 'Tracking', initial: 'linear' },
  { id: 'devtools', label: 'Developer tools' },
  { id: 'design', label: 'Design' },
];

/**
 * Full allocation flow: pick a license from the catalog, pick a slot, then
 * use "Assign to slot" (or double-click a card) to place it. Clicking an
 * assigned slot clears it with "Remove".
 */
function AssignmentScreen() {
  const [selectedId, setSelectedId] = useState<string | null>('datadog');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Record<string, string | undefined>>(
    Object.fromEntries(SLOT_DEFS.map((s) => [s.id, s.initial])),
  );

  const byId = (id?: string | null): LicenseItem | null =>
    LICENSES.find((l) => l.id === id) ?? null;
  const slots: AssignmentSlot[] = SLOT_DEFS.map((s) => ({
    id: s.id,
    label: s.label,
    item: byId(placement[s.id]),
  }));
  const assignedIds = Object.values(placement).filter((v): v is string => Boolean(v));
  const selected = byId(selectedId);

  const assign = (item: LicenseItem) => {
    if (!selectedSlotId) return;
    setPlacement((prev) => ({ ...prev, [selectedSlotId]: item.id }));
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ flex: '2 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SectionHeader title="License catalog" description="Double-click a card to assign it to the selected slot." />
        <LicenseCatalog
          items={LICENSES}
          selectedId={selectedId}
          assignedIds={assignedIds}
          onSelect={(item) => setSelectedId(item.id)}
          onActivate={assign}
        />
        <SectionHeader title="Ana Sørensen — allocation" />
        <AssignmentSlots
          slots={slots}
          selectedSlotId={selectedSlotId}
          onSelectSlot={(slot) => {
            setSelectedSlotId(slot.id);
            if (slot.item) setSelectedId(slot.item.id);
          }}
          style={{ maxWidth: 400 }}
        />
      </div>
      <LicenseDetail
        item={selected}
        style={{ flex: '1 1 260px', minWidth: 0 }}
        actions={
          selected && (
            <>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedSlotId}
                onClick={() => assign(selected)}
              >
                Assign to slot
              </Button>
              {selectedSlotId && placement[selectedSlotId] && (
                <Button
                  size="sm"
                  onClick={() =>
                    setPlacement((prev) => ({ ...prev, [selectedSlotId]: undefined }))
                  }
                >
                  Remove
                </Button>
              )}
            </>
          )
        }
      />
    </div>
  );
}

export const Allocation: StoryObj = {
  render: () => <AssignmentScreen />,
};
