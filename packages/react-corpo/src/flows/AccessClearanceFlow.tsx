import { useState } from 'react';
import { FlowShell } from './FlowShell';
import { Field } from '../components/Field';
import { FormGrid } from '../components/FormGrid';
import { Select } from '../components/Select';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Button } from '../components/Button';
import { Stepper } from '../components/Stepper';
import { StatusPill } from '../components/StatusPill';
import { AlertDialog } from '../components/AlertDialog';
import { Toast, Toaster } from '../components/Toast';

const TIER_LABEL = {
  'tier-1': 'Tier 1 — Everyone',
  'tier-2': 'Tier 2 — Team',
  'tier-3': 'Tier 3 — Extra trust',
  'tier-4': 'Tier 4 — Leadership only',
} satisfies Record<string, string>;

const tierLabel = (tier: string): string =>
  // SAFETY: guarded by the `in` check against the literal-keyed map.
  tier in TIER_LABEL ? TIER_LABEL[tier as keyof typeof TIER_LABEL] : tier;

const STEPS = [{ label: 'Request' }, { label: 'Manager check-in' }, { label: 'Identity check' }, { label: 'Done' }];

export function AccessClearanceFlow() {
  const [step, setStep] = useState(1);
  const [tier, setTier] = useState('tier-3');
  const [justification, setJustification] = useState('');
  const [statement, setStatement] = useState('');
  const [managerApproved, setManagerApproved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  return (
    <FlowShell
      title="Request a bit more access"
      subtitle="Need a bigger key ring? Happy to help — it's just a few quick steps. Tier 3 and up need a quick nod from your manager plus a fast identity check, purely to keep everyone safe."
    >
      <Stepper items={STEPS} current={step - 1} />

      {step === 1 && (
        <>
          <FormGrid columns={1}>
            <Field label="Access tier">
              <Select value={tier} onChange={(e) => setTier(e.target.value)}>
                <option value="tier-1">Tier 1 — Everyone</option>
                <option value="tier-2">Tier 2 — Team</option>
                <option value="tier-3">Tier 3 — Extra trust</option>
                <option value="tier-4">Tier 4 — Leadership only</option>
              </Select>
            </Field>
            <Field label="Reason">
              <Input
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="e.g. Helping out with the workforce analytics project"
              />
            </Field>
            <Field label="Details (optional)">
              <Textarea
                rows={3}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Tell us a bit about the systems or data you're after."
              />
            </Field>
          </FormGrid>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" disabled={!justification} onClick={() => setStep(2)}>
              Send request
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p>
            Robin, your manager, is taking a quick look at your request for {tierLabel(tier)}.{' '}
            <StatusPill tone={managerApproved ? 'ok' : 'warn'}>{managerApproved ? 'Approved' : 'Waiting'}</StatusPill>
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setStep(1)}>Back</Button>
            {!managerApproved ? (
              <Button variant="primary" onClick={() => setManagerApproved(true)}>
                Simulate approval
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setStep(3)}>
                Continue
              </Button>
            )}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p>
            One quick retina and voice-print scan and you&apos;re through. It&apos;s automatically logged to your
            personnel file, purely for everyone&apos;s security.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setStep(2)}>Back</Button>
            <Button variant="primary" onClick={() => setConfirmOpen(true)}>
              Start quick check
            </Button>
          </div>
        </>
      )}

      {step === 4 && (
        <p>
          <StatusPill tone="ok">Active</StatusPill> {tierLabel(tier)} is live on your badge. Everything syncs within 15
          minutes, and access can be adjusted at any time based on business needs.
        </p>
      )}

      <AlertDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Quick identity check"
        confirmLabel="Confirm and activate"
        onConfirm={() => {
          setConfirmOpen(false);
          setStep(4);
          setToastOpen(true);
        }}
      >
        We'll record a retina and voice-print match against your personnel file. Nothing to worry about — this is just
        how we keep everyone's access safe and sound.
      </AlertDialog>

      {toastOpen && (
        <Toaster>
          <Toast tone="success" title="You're good to go" onDismiss={() => setToastOpen(false)}>
            {tierLabel(tier)} is now active. Badge sync is in progress.
          </Toast>
        </Toaster>
      )}
    </FlowShell>
  );
}
