import { useState } from 'react';
import { FlowShell } from './FlowShell';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { Select } from '../components/Select';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Button } from '../components/Button';
import { Progress } from '../components/Progress';
import { Avatar } from '../components/Avatar';
import { StatusPill } from '../components/StatusPill';
import { AlertDialog } from '../components/AlertDialog';
import { Toast, Toaster } from '../components/Toast';

const TIER_LABEL: Record<string, string> = {
  'tier-1': 'Tier 1 — Everyone',
  'tier-2': 'Tier 2 — Team',
  'tier-3': 'Tier 3 — Extra trust',
  'tier-4': 'Tier 4 — Leadership only',
};

const STEP_LABEL = ['Tell us what you need', 'Manager check-in', 'Quick identity check', "You're all set"];

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
      eyebrow="Halcyon Group — Workplace Experience"
      title="Request a bit more access"
      subtitle="Need a bigger key ring? Happy to help — it's just a few quick steps. Tier 3 and up need a quick nod from your manager plus a fast identity check, purely to keep everyone safe."
    >
      <Progress value={step} max={4} label={`Step ${step} of 4 — ${STEP_LABEL[step - 1]}`} />

      {step === 1 && (
        <Card title="Tell us what you need" description="The more detail you give us, the faster we can say yes.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="What level feels right?" required>
              <Select value={tier} onChange={(e) => setTier(e.target.value)}>
                <option value="tier-1">Tier 1 — Everyone</option>
                <option value="tier-2">Tier 2 — Team</option>
                <option value="tier-3">Tier 3 — Extra trust</option>
                <option value="tier-4">Tier 4 — Leadership only</option>
              </Select>
            </Field>
            <Field
              label="What's this for?"
              required
              hint="Just for our records — helps us keep track of who has access to what, for everyone's peace of mind."
            >
              <Input
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="e.g. Helping out with the workforce analytics project"
              />
            </Field>
            <Field label="Anything else we should know?">
              <Textarea
                rows={4}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Tell us a bit about the systems or data you're after."
              />
            </Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="primary" disabled={!justification} onClick={() => setStep(2)}>
              Send request
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card title="Manager check-in" description={`Just waiting on a quick thumbs-up for ${TIER_LABEL[tier]}.`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar initials="RK" status={managerApproved ? 'online' : 'busy'} />
            <div>
              <div style={{ fontWeight: 600 }}>Robin — your manager</div>
              <StatusPill tone={managerApproved ? 'ok' : 'warn'}>
                {managerApproved ? 'Approved' : 'Taking a quick look'}
              </StatusPill>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
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
        </Card>
      )}

      {step === 3 && (
        <Card
          title="Quick identity check"
          description="For Tier 3 and up, we just need to double-check it's really you."
        >
          <p style={{ color: 'var(--corpo-text-secondary)', fontSize: 'var(--corpo-text-sm)' }}>
            One quick retina and voice-print scan and you're through — nothing to worry about!
            It's automatically logged to your personnel file, purely for everyone's security.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <Button onClick={() => setStep(2)}>Back</Button>
            <Button variant="primary" onClick={() => setConfirmOpen(true)}>
              Start quick check
            </Button>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card title="You're all set" description={`${TIER_LABEL[tier]} is now live on your badge.`}>
          <StatusPill tone="ok">Active</StatusPill>
          <p
            style={{
              marginTop: 12,
              color: 'var(--corpo-text-secondary)',
              fontSize: 'var(--corpo-text-sm)',
            }}
          >
            Everything syncs within 15 minutes. If anything feels off, Workplace Experience is
            always happy to help — and just so you know, access can be adjusted at any time based
            on business needs.
          </p>
        </Card>
      )}

      <AlertDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Quick identity check"
        confirmLabel="Confirm and activate"
        onConfirm={() => {
          setStep(4);
          setToastOpen(true);
        }}
      >
        We'll record a retina and voice-print match against your personnel file. Nothing to
        worry about — this is just how we keep everyone's access safe and sound.
      </AlertDialog>

      {toastOpen && (
        <Toaster>
          <Toast tone="success" title="You're good to go" onDismiss={() => setToastOpen(false)}>
            {TIER_LABEL[tier]} is now active. Badge sync is in progress.
          </Toast>
        </Toaster>
      )}
    </FlowShell>
  );
}
