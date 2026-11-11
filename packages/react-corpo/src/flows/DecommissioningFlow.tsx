import { useState } from 'react';
import { FlowShell } from './FlowShell';
import { Alert } from '../components/Alert';
import { Checkbox } from '../components/Checkbox';
import { Progress } from '../components/Progress';
import { Button } from '../components/Button';
import { AlertDialog } from '../components/AlertDialog';
import { Table } from '../components/Table';
import { Toast, Toaster } from '../components/Toast';

interface Department {
  id: string;
  label: string;
  items: string[];
}

const DEPARTMENTS: Department[] = [
  {
    id: 'it',
    label: 'IT',
    items: [
      'Company laptop returned (thanks for taking care of it!)',
      'Badge access wrapped up',
      'VPN access closed out',
    ],
  },
  {
    id: 'facilities',
    label: 'Facilities',
    items: ['Desk tidied up for the next person', 'Keys handed back'],
  },
  {
    id: 'finance',
    label: 'Finance',
    items: ['Final paycheck processed, per your agreement', 'Last expenses squared away'],
  },
  {
    id: 'hr',
    label: 'People Success',
    items: ['Quick chat with People Success completed', 'NDA reminder acknowledged'],
  },
];

const ALL_ITEM_KEYS = DEPARTMENTS.flatMap((dept) => dept.items.map((_, i) => `${dept.id}-${i}`));

export function DecommissioningFlow() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [decommissioned, setDecommissioned] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const checkedCount = ALL_ITEM_KEYS.filter((key) => checked[key]).length;
  const totalCount = ALL_ITEM_KEYS.length;
  const allChecked = checkedCount === totalCount;

  const toggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <FlowShell
      title="Your next chapter"
      subtitle="We're so grateful for everything you've brought to the Halcyon family. Let's make this transition smooth — just a few quick checkpoints below."
    >
      <Progress
        value={checkedCount}
        max={totalCount}
        tone={allChecked ? 'success' : 'accent'}
        label={`${checkedCount} of ${totalCount} steps to your next chapter`}
      />

      {!decommissioned ? (
        <>
          <Table
            compact
            columns={[
              { key: 'step', label: 'Step' },
              { key: 'team', label: 'Team' },
            ]}
            rows={DEPARTMENTS.flatMap((dept) =>
              dept.items.map((item, i) => {
                const key = `${dept.id}-${i}`;
                return {
                  step: { content: <Checkbox label={item} checked={!!checked[key]} onChange={() => toggle(key)} /> },
                  team: dept.label,
                };
              }),
            )}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="danger" disabled={!allChecked} onClick={() => setConfirmOpen(true)}>
              Start my next chapter
            </Button>
          </div>
        </>
      ) : (
        <Alert tone="info" title="Access ended">
          Thanks for everything. Your final pay will process per your agreement, and we've loved having you as part of
          the Halcyon family. Reversing this needs Director sign-off.
        </Alert>
      )}

      <AlertDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Ready for your next chapter?"
        danger
        confirmLabel="Confirm"
        onConfirm={() => {
          setDecommissioned(true);
          setConfirmOpen(false);
          setToastOpen(true);
        }}
      >
        This wraps everything up and ends your access right away. We wish you all the best, truly — but heads up, this
        can't be undone.
      </AlertDialog>

      {toastOpen && (
        <Toaster>
          <Toast tone="success" title="All set" onDismiss={() => setToastOpen(false)}>
            We've wrapped up the transition — wishing you nothing but the best out there.
          </Toast>
        </Toaster>
      )}
    </FlowShell>
  );
}
