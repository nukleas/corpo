import { useState } from 'react';
import { FlowShell } from './FlowShell';
import { Card } from '../components/Card';
import { Collapsible } from '../components/Collapsible';
import { Checkbox } from '../components/Checkbox';
import { Progress } from '../components/Progress';
import { Button } from '../components/Button';
import { AlertDialog } from '../components/AlertDialog';
import { Toast, Toaster } from '../components/Toast';
import { StatusPill } from '../components/StatusPill';

interface Department {
  id: string;
  label: string;
  items: string[];
}

const DEPARTMENTS: Department[] = [
  {
    id: 'it',
    label: 'Tech handoff',
    items: ['Company laptop returned (thanks for taking care of it!)', 'Badge access wrapped up', 'VPN access closed out'],
  },
  {
    id: 'facilities',
    label: 'Workspace wrap-up',
    items: ['Desk tidied up for the next person', 'Keys handed back'],
  },
  {
    id: 'finance',
    label: 'Money matters',
    items: ['Final paycheck processed, per your agreement', 'Last expenses squared away'],
  },
  {
    id: 'hr',
    label: 'Paperwork & farewells',
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

  const countForDept = (dept: Department) =>
    dept.items.filter((_, i) => checked[`${dept.id}-${i}`]).length;

  return (
    <FlowShell
      eyebrow="Halcyon Group — People Success"
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {DEPARTMENTS.map((dept) => (
              <Card key={dept.id} flat>
                <Collapsible
                  trigger={
                    <span
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        fontFamily: 'var(--corpo-font-mono)',
                        fontSize: 'var(--corpo-text-xs)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--corpo-label-tracking)',
                      }}
                    >
                      <span>{dept.label}</span>
                      <span style={{ color: 'var(--corpo-text-muted)' }}>
                        {countForDept(dept)}/{dept.items.length}
                      </span>
                    </span>
                  }
                  defaultOpen={dept.id === 'it'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
                    {dept.items.map((item, i) => {
                      const key = `${dept.id}-${i}`;
                      return (
                        <Checkbox
                          key={key}
                          label={item}
                          checked={!!checked[key]}
                          onChange={() => toggle(key)}
                        />
                      );
                    })}
                  </div>
                </Collapsible>
              </Card>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="danger" disabled={!allChecked} onClick={() => setConfirmOpen(true)}>
              Start my next chapter
            </Button>
          </div>
        </>
      ) : (
        <Card title="You're on to bigger things">
          <StatusPill tone="err">Access ended</StatusPill>
          <p
            style={{
              marginTop: 12,
              color: 'var(--corpo-text-secondary)',
              fontSize: 'var(--corpo-text-sm)',
            }}
          >
            Thanks for everything. Your final pay will process per your agreement, and we've
            loved having you as part of the Halcyon family. Reversing this needs Director sign-off.
          </p>
        </Card>
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
        This wraps everything up and ends your access right away. We wish you all the best,
        truly — but heads up, this can't be undone.
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
