import { useState } from 'react';
import { FlowShell } from './FlowShell';
import { DescriptionList } from '../components/DescriptionList';
import { SectionHeader } from '../components/SectionHeader';
import { Tabs } from '../components/Tabs';
import { Table, type TableColumn } from '../components/Table';
import { Timeline } from '../components/Timeline';
import { Sheet } from '../components/Sheet';
import { StatusPill } from '../components/StatusPill';
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
  { key: 'id', label: 'Incident', mono: true },
  { key: 'title', label: 'Description' },
  { key: 'severity', label: 'Severity' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'updated', label: 'Updated' },
];

export function IncidentConsoleFlow() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [activeTab, setActiveTab] = useState<IncidentStatus>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const selected = incidents.find((inc) => inc.id === selectedId) ?? null;

  const activeCount = incidents.filter((i) => i.status === 'active').length;

  const filtered = incidents.filter((i) => i.status === activeTab);

  const tableRows = filtered.map((inc) => ({
    id: {
      content: (
        <button type="button" className="cp-table__link" onClick={() => setSelectedId(inc.id)}>
          {inc.id}
        </button>
      ),
    },
    title: inc.title,
    severity: { content: inc.severity, status: inc.severityStatus },
    assignee: inc.assignee,
    updated: inc.updated,
  }));

  return (
    <FlowShell
      title="Everything happening right now"
      subtitle="A live look across every Halcyon site. We like to think of these as team-building moments — anything above Medium gets a friendly heads-up straight to the Executive Board."
    >
      <SectionHeader
        title="Incidents"
        actions={
          <Button size="sm" onClick={() => setCommandOpen(true)}>
            Quick actions
          </Button>
        }
      />

      <Tabs
        aria-label="Incident status"
        tabs={[
          { id: 'active', label: 'Active', count: activeCount || undefined },
          { id: 'resolved', label: 'Resolved' },
          { id: 'archived', label: 'Archived' },
        ]}
        active={activeTab}
        onChange={(id) => {
          if (id === 'active' || id === 'resolved' || id === 'archived') setActiveTab(id);
        }}
      >
        <Table compact columns={COLUMNS} rows={tableRows} />
      </Tabs>

      <Sheet
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.id}
        footer={
          selected && (
            <>
              <Button size="sm" onClick={() => setSelectedId(null)}>
                Loop in leadership
              </Button>
              {selected.status === 'active' && (
                <Button size="sm" variant="primary" onClick={() => setResolveOpen(true)}>
                  Mark resolved
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0 }}>{selected.title}</p>
            <DescriptionList
              compact
              items={[
                {
                  label: 'Severity',
                  value: <StatusPill tone={selected.severityStatus}>{selected.severity}</StatusPill>,
                },
                { label: 'Assignee', value: selected.assignee },
                { label: 'Opened', value: selected.opened },
                { label: 'Updated', value: selected.updated },
              ]}
            />
            <Timeline items={selected.timeline.map((entry) => ({ title: entry.note, timestamp: entry.time }))} />
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
        Marking {selected?.id} resolved lets everyone breathe easy again. Compliance gets a friendly heads-up, and
        reopening it after this needs a Director — just to keep things smooth.
      </AlertDialog>

      <Modal open={commandOpen} onClose={() => setCommandOpen(false)} title="Quick actions">
        <Command
          groups={[
            {
              id: 'actions',
              label: 'Actions',
              items: [
                {
                  id: 'escalate-all',
                  label: 'Loop in leadership on all urgent items',
                  onSelect: () => setCommandOpen(false),
                },
                { id: 'export', label: 'Share a report with the team', onSelect: () => setCommandOpen(false) },
                { id: 'notify', label: 'Give Compliance a heads-up', onSelect: () => setCommandOpen(false) },
              ],
            },
            {
              id: 'nav',
              label: 'Navigate',
              items: [{ id: 'exec', label: 'Jump to the quarterly briefing', onSelect: () => setCommandOpen(false) }],
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
