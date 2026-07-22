import { useMemo, useState } from 'react';
import { FlowShell } from './FlowShell';
import { Card } from '../components/Card';
import { Tabs } from '../components/Tabs';
import { Table, type TableColumn } from '../components/Table';
import { Sheet } from '../components/Sheet';
import { Avatar } from '../components/Avatar';
import { StatusPill } from '../components/StatusPill';
import { StatusBar } from '../components/StatusBar';
import { Button } from '../components/Button';
import { AlertDialog } from '../components/AlertDialog';
import { Toast, Toaster } from '../components/Toast';
import { Modal } from '../components/Modal';
import { Command } from '../components/Command';

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
type SeverityTone = 'ok' | 'warn' | 'err' | 'idle';
type IncidentStatus = 'active' | 'resolved' | 'archived';

interface Incident {
  id: string;
  title: string;
  severity: Severity;
  severityStatus: SeverityTone;
  assignee: string;
  opened: string;
  updated: string;
  status: IncidentStatus;
  timeline: Array<{ time: string; note: string }>;
}

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2041',
    title: 'Unauthorized badge swipe — Sublevel 3',
    severity: 'Critical',
    severityStatus: 'err',
    assignee: 'A. Novak',
    opened: '02:14',
    updated: '5m ago',
    status: 'active',
    timeline: [
      { time: '02:14', note: 'Badge reader flagged mismatched credential hash.' },
      { time: '02:16', note: 'Sublevel 3 auto-locked pending review.' },
      { time: '02:20', note: 'Assigned to A. Novak, Trust & Safety.' },
    ],
  },
  {
    id: 'INC-2040',
    title: 'Anomalous data egress — R&D VPN',
    severity: 'High',
    severityStatus: 'err',
    assignee: 'M. Ito',
    opened: '23:51',
    updated: '18m ago',
    status: 'active',
    timeline: [
      { time: '23:51', note: 'Egress volume 40x baseline detected on R&D tunnel.' },
      { time: '23:58', note: 'Tunnel throttled automatically.' },
    ],
  },
  {
    id: 'INC-2038',
    title: 'Firmware checksum mismatch — Drone bay 2',
    severity: 'Medium',
    severityStatus: 'warn',
    assignee: 'Unassigned',
    opened: 'Yesterday',
    updated: '1h ago',
    status: 'active',
    timeline: [{ time: 'Yesterday', note: 'Checksum mismatch on patrol drone firmware image.' }],
  },
  {
    id: 'INC-2033',
    title: 'Repeated failed biometric — Executive floor',
    severity: 'Low',
    severityStatus: 'idle',
    assignee: 'R. Kessler',
    opened: '3d ago',
    updated: 'Resolved',
    status: 'resolved',
    timeline: [
      { time: '3d ago', note: 'Three failed retinal scans, executive elevator.' },
      { time: '3d ago', note: 'Confirmed false positive — sensor recalibrated.' },
    ],
  },
  {
    id: 'INC-2019',
    title: 'Contractor badge expired mid-shift',
    severity: 'Low',
    severityStatus: 'ok',
    assignee: 'A. Novak',
    opened: '1w ago',
    updated: 'Archived',
    status: 'archived',
    timeline: [{ time: '1w ago', note: 'Contractor escorted off-site, badge reissued.' }],
  },
];

const COLUMNS: TableColumn[] = [
  { key: 'id', label: 'Incident' },
  { key: 'title', label: 'Description' },
  { key: 'severity', label: 'Severity' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'updated', label: 'Updated' },
];

function initialsFor(name: string): string {
  if (name === 'Unassigned') return '?';
  return name
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function IncidentConsoleFlow() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [activeTab, setActiveTab] = useState<IncidentStatus>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const selected = incidents.find((inc) => inc.id === selectedId) ?? null;

  const counts = useMemo(
    () => ({
      active: incidents.filter((i) => i.status === 'active').length,
      resolved: incidents.filter((i) => i.status === 'resolved').length,
      archived: incidents.filter((i) => i.status === 'archived').length,
    }),
    [incidents],
  );

  const filtered = incidents.filter((i) => i.status === activeTab);

  const tableRows = filtered.map((inc) => ({
    id: (
      <button
        type="button"
        onClick={() => setSelectedId(inc.id)}
        style={{
          all: 'unset',
          cursor: 'pointer',
          color: 'var(--corpo-accent)',
          fontFamily: 'var(--corpo-font-mono)',
          fontSize: 'var(--corpo-text-xs)',
        }}
      >
        {inc.id}
      </button>
    ),
    title: inc.title,
    severity: inc.severity,
    severityStatus: inc.severityStatus,
    assignee: inc.assignee,
    updated: inc.updated,
  }));

  return (
    <FlowShell
      eyebrow="Halcyon Group — Trust & Safety"
      title="Everything happening right now"
      subtitle="A live look across every Halcyon site. We like to think of these as team-building moments — anything above Medium gets a friendly heads-up straight to the Executive Board."
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs
          tabs={[
            { id: 'active', label: 'Active', count: counts.active },
            { id: 'resolved', label: 'Resolved', count: counts.resolved },
            { id: 'archived', label: 'Archived', count: counts.archived },
          ]}
          active={activeTab}
          onChange={(id) => setActiveTab(id as IncidentStatus)}
          pills
        />
        <Button onClick={() => setCommandOpen(true)}>⌘K Quick actions</Button>
      </div>

      <Card flat>
        <Table columns={COLUMNS} rows={tableRows} />
      </Card>

      <StatusBar
        items={[
          { id: 'open', label: 'Open incidents', value: counts.active },
          { id: 'sla', label: 'SLA breach risk', value: '2' },
          { id: 'shift', label: 'Personnel on shift', value: '14' },
        ]}
      />

      <Sheet
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.id}
        footer={
          selected && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => setSelectedId(null)}>Loop in leadership</Button>
              <Button
                variant="primary"
                disabled={selected.status === 'resolved'}
                onClick={() => setResolveOpen(true)}
              >
                {selected.status === 'resolved' ? 'All wrapped up' : 'Mark resolved'}
              </Button>
            </div>
          )
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar initials={initialsFor(selected.assignee)} />
              <div>
                <div style={{ fontWeight: 600 }}>{selected.assignee}</div>
                <StatusPill tone={selected.severityStatus}>{selected.severity}</StatusPill>
              </div>
            </div>
            <p style={{ fontSize: 'var(--corpo-text-sm)', color: 'var(--corpo-text-secondary)' }}>
              {selected.title}
            </p>
            <div>
              <div
                style={{
                  fontFamily: 'var(--corpo-font-mono)',
                  fontSize: 'var(--corpo-text-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--corpo-label-tracking)',
                  color: 'var(--corpo-text-muted)',
                  marginBottom: 8,
                }}
              >
                Timeline
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {selected.timeline.map((entry, i) => (
                  <li
                    key={i}
                    style={{ fontSize: 'var(--corpo-text-sm)', color: 'var(--corpo-text-secondary)' }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--corpo-font-mono)',
                        color: 'var(--corpo-text-dim)',
                        marginRight: 8,
                      }}
                    >
                      {entry.time}
                    </span>
                    {entry.note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Sheet>

      <AlertDialog
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title="Wrap this one up?"
        confirmLabel="Mark resolved"
        onConfirm={() => {
          if (selected) {
            setIncidents((prev) =>
              prev.map((inc) => (inc.id === selected.id ? { ...inc, status: 'resolved', updated: 'Just now' } : inc)),
            );
          }
          setResolveOpen(false);
          setSelectedId(null);
          setToastOpen(true);
        }}
      >
        Marking {selected?.id} resolved lets everyone breathe easy again. Compliance gets a
        friendly heads-up, and reopening it after this needs a Director — just to keep things
        smooth.
      </AlertDialog>

      <Modal open={commandOpen} onClose={() => setCommandOpen(false)} title="Quick actions">
        <Command
          groups={[
            {
              id: 'actions',
              label: 'Actions',
              items: [
                { id: 'escalate-all', label: 'Loop in leadership on all urgent items', onSelect: () => setCommandOpen(false) },
                { id: 'export', label: 'Share a report with the team', onSelect: () => setCommandOpen(false) },
                { id: 'notify', label: 'Give Compliance a heads-up', onSelect: () => setCommandOpen(false) },
              ],
            },
            {
              id: 'nav',
              label: 'Navigate',
              items: [
                { id: 'exec', label: 'Jump to the quarterly briefing', onSelect: () => setCommandOpen(false) },
              ],
            },
          ]}
        />
      </Modal>

      {toastOpen && (
        <Toaster>
          <Toast tone="success" title="Nice work" onDismiss={() => setToastOpen(false)}>
            Compliance has been looped in and the report's tucked away safely.
          </Toast>
        </Toaster>
      )}
    </FlowShell>
  );
}
