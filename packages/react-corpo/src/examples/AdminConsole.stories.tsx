import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from '../components/AppShell';
import { SideNav } from '../components/SideNav';
import { Topbar } from '../components/Topbar';
import { TreeView, type TreeItem } from '../components/TreeView';
import { Dropzone, type DropzoneFile } from '../components/Dropzone';
import { LicenseCatalog, type LicenseItem } from '../components/LicenseCatalog';
import { AssignmentSlots, type AssignmentSlot } from '../components/AssignmentSlots';
import { LicenseDetail } from '../components/LicenseDetail';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { SectionHeader } from '../components/SectionHeader';
import { LICENSES } from '../components/LicenseCatalog.fixtures';

const meta = {
  title: 'Examples/IT admin console',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

const ORG: TreeItem[] = [
  {
    id: 'acme',
    label: 'Acme Holdings',
    children: [
      {
        id: 'finance',
        label: 'Finance',
        children: [
          { id: 'ap', label: 'Accounts payable' },
          { id: 'payroll', label: 'Payroll' },
          { id: 'treasury', label: 'Treasury operations' },
        ],
      },
      {
        id: 'people',
        label: 'People and culture',
        children: [
          { id: 'recruiting', label: 'Recruiting' },
          { id: 'benefits', label: 'Benefits administration' },
        ],
      },
      {
        id: 'legal',
        label: 'Legal',
        children: [{ id: 'contracts', label: 'Contracts' }],
      },
    ],
  },
];

const SLOT_DEFS: { id: string; label: string; initial?: string }[] = [
  { id: 'observability', label: 'Observability', initial: 'datadog' },
  { id: 'tracking', label: 'Tracking', initial: 'linear' },
  { id: 'devtools', label: 'Developer tools' },
  { id: 'design', label: 'Design' },
];

const NAV_LABELS = {
  people: 'People',
  teams: 'Teams',
  licenses: 'Licenses',
  imports: 'Imports',
} satisfies Record<string, string>;

const navLabel = (id: string): string =>
  // SAFETY: guarded by the `in` check against the literal-keyed map.
  id in NAV_LABELS ? NAV_LABELS[id as keyof typeof NAV_LABELS] : 'Licenses';

interface Person {
  id: string;
  name: string;
  initials: string;
  role: string;
  teamId: string;
  onLeave?: boolean;
}

const PEOPLE: Person[] = [
  { id: 'ps', name: 'Priya Shah', initials: 'PS', role: 'Finance controller', teamId: 'finance' },
  { id: 'dw', name: 'Daniel Wu', initials: 'DW', role: 'Staff accountant', teamId: 'ap' },
  { id: 'lm', name: 'Lena Morales', initials: 'LM', role: 'Accounts payable lead', teamId: 'ap' },
  { id: 'rk', name: 'Ryan Keller', initials: 'RK', role: 'Payroll specialist', teamId: 'payroll' },
  { id: 'an', name: 'Aisha Nwosu', initials: 'AN', role: 'Treasury manager', teamId: 'treasury' },
  { id: 'mw', name: 'Marcus Webb', initials: 'MW', role: 'People partner', teamId: 'people' },
  { id: 'ct', name: 'Chloe Tran', initials: 'CT', role: 'Recruiter', teamId: 'recruiting' },
  {
    id: 'jb',
    name: 'James Brooks',
    initials: 'JB',
    role: 'Benefits analyst',
    teamId: 'benefits',
    onLeave: true,
  },
  { id: 'er', name: 'Elena Ruiz', initials: 'ER', role: 'General counsel', teamId: 'legal' },
  { id: 'nk', name: 'Noah Kim', initials: 'NK', role: 'Contracts attorney', teamId: 'contracts' },
];

const TEAM_COPY = {
  acme: 'Parent company for the US operating units. License pools are owned here and assigned down to each function.',
  finance: 'Controller organization covering payables, payroll, and treasury. Most seats are annual-contract SaaS.',
  ap: 'Vendor invoices and payment runs for the US entities.',
  payroll: 'Semi-monthly payroll for salaried staff and weekly for hourly contractors.',
  treasury: 'Cash position, banking access, and wire approvals.',
  people: 'People partner team for recruiting, benefits, and employee relations.',
  recruiting: 'Open-role hiring for corporate functions. Greenhouse seats are pooled at this level.',
  benefits: 'Medical, 401(k), and leave administration for US employees.',
  legal: 'In-house counsel for commercial, employment, and privacy work.',
  contracts: 'Vendor and customer paper. DocuSign seats are assigned from the legal pool.',
} satisfies Record<string, string>;

const teamCopy = (id: string): string =>
  // SAFETY: guarded by the `in` check against the literal-keyed map.
  id in TEAM_COPY ? TEAM_COPY[id as keyof typeof TEAM_COPY] : 'Reporting line for this unit.';

const INITIAL_FILES: DropzoneFile[] = [
  {
    id: 'finance-seats',
    name: 'finance-seat-assignments.csv',
    size: 18_432,
    status: 'uploading',
    progress: 64,
  },
  { id: 'people-seats', name: 'people-culture-seats.csv', size: 9_216 },
];

function findNode(items: TreeItem[], id: string): TreeItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    const nested = item.children ? findNode(item.children, id) : undefined;
    if (nested) return nested;
  }
}

function collectIds(item: TreeItem): string[] {
  return [item.id, ...(item.children?.flatMap(collectIds) ?? [])];
}

function peopleInScope(teamId: string): Person[] {
  const node = findNode(ORG, teamId);
  if (!node) return [];
  const ids = new Set(collectIds(node));
  return PEOPLE.filter((person) => ids.has(person.teamId));
}

function AdminConsoleExample() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeId, setActiveId] = useState('licenses');
  const [expandedIds, setExpandedIds] = useState<string[]>(['acme', 'finance', 'people']);
  const [selectedOrgId, setSelectedOrgId] = useState('finance');
  const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>('datadog');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Record<string, string | undefined>>(
    Object.fromEntries(SLOT_DEFS.map((slot) => [slot.id, slot.initial])),
  );
  const [importFiles, setImportFiles] = useState<DropzoneFile[]>(INITIAL_FILES);

  const selectedOrg = findNode(ORG, selectedOrgId);
  const contextLabel = selectedOrg?.label ?? 'Acme Holdings';
  const pageLabel = navLabel(activeId);
  const uploadingCount = importFiles.filter((file) => file.status === 'uploading').length;

  const byId = (id?: string | null): LicenseItem | null =>
    LICENSES.find((license) => license.id === id) ?? null;
  const slots: AssignmentSlot[] = SLOT_DEFS.map((slot) => ({
    id: slot.id,
    label: slot.label,
    item: byId(placement[slot.id]),
  }));
  const assignedIds = Object.values(placement).filter((id): id is string => Boolean(id));
  const selectedLicense = byId(selectedLicenseId);

  const assign = (item: LicenseItem) => {
    if (!selectedSlotId) return;
    setPlacement((prev) => ({ ...prev, [selectedSlotId]: item.id }));
  };

  const sections = [
    {
      title: 'Directory',
      items: [
        { id: 'people', label: 'People' },
        { id: 'teams', label: 'Teams' },
      ],
    },
    {
      title: 'Provisioning',
      items: [
        { id: 'licenses', label: 'Licenses' },
        {
          id: 'imports',
          label: 'Imports',
          badge: uploadingCount > 0 ? <Badge color="amber">{uploadingCount}</Badge> : undefined,
        },
      ],
    },
  ];

  const people = peopleInScope(selectedOrgId);
  const childTeams = selectedOrg?.children ?? [];

  return (
    <AppShell navOpen={navOpen} onNavClose={() => setNavOpen(false)} style={{ height: '100vh' }}>
      <AppShell.Sidebar>
        <SideNav
          brand="Halcyon IT"
          sections={sections}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            setNavOpen(false);
          }}
          footer={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="sm" initials="JH" status="online" />
              <span style={{ fontSize: 'var(--corpo-text-sm)' }}>Jordan Hale</span>
            </div>
          }
          style={{ flex: '1 1 0', minHeight: 0 }}
        />
        <div
          style={{
            flex: '1 1 0',
            minHeight: 0,
            overflow: 'auto',
            padding: '8px 4px 12px',
            borderTop: '1px solid var(--corpo-border-dim)',
          }}
        >
          <TreeView
            aria-label="Organization"
            items={ORG}
            expandedIds={expandedIds}
            onExpandedChange={setExpandedIds}
            selectedId={selectedOrgId}
            onSelect={(id) => setSelectedOrgId(id)}
          />
        </div>
      </AppShell.Sidebar>
      <AppShell.Main>
        <Topbar
          title={`${pageLabel} — ${contextLabel}`}
          onNavToggle={() => setNavOpen(true)}
          actions={
            <>
              {activeId === 'people' && (
                <Button size="sm" variant="primary">
                  Invite person
                </Button>
              )}
              {activeId === 'teams' && <Button size="sm">Export roster</Button>}
              {activeId === 'licenses' && <Button size="sm">Request seats</Button>}
              {activeId === 'imports' && (
                <Button size="sm" variant="primary">
                  Download template
                </Button>
              )}
              <Avatar size="sm" initials="JH" />
            </>
          }
        />
        <AppShell.Content>
          {activeId === 'licenses' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
              <div
                style={{
                  flex: '2 1 320px',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <SectionHeader
                  title="License catalog"
                  description="Select a license, pick a slot, then assign. Double-click a card to assign it to the selected slot."
                />
                <LicenseCatalog
                  items={LICENSES}
                  selectedId={selectedLicenseId}
                  assignedIds={assignedIds}
                  onSelect={(item) => setSelectedLicenseId(item.id)}
                  onActivate={assign}
                />
                <SectionHeader title={`${contextLabel} — allocation`} />
                <AssignmentSlots
                  slots={slots}
                  selectedSlotId={selectedSlotId}
                  onSelectSlot={(slot) => {
                    setSelectedSlotId(slot.id);
                    if (slot.item) setSelectedLicenseId(slot.item.id);
                  }}
                  style={{ maxWidth: 400 }}
                />
              </div>
              <LicenseDetail
                item={selectedLicense}
                style={{ flex: '1 1 260px', minWidth: 0 }}
                actions={
                  selectedLicense && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!selectedSlotId}
                        onClick={() => assign(selectedLicense)}
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
          )}

          {activeId === 'imports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
              <SectionHeader
                title="Seat assignment imports"
                description={`Upload a CSV of seat assignments for ${contextLabel}. Files can be removed before processing.`}
              />
              <Dropzone
                accept=".csv"
                hint="Drop a CSV of seat assignments or browse"
                files={importFiles}
                onFiles={(incoming) => {
                  setImportFiles((prev) => [
                    ...prev,
                    ...incoming.map((file, index) => ({
                      id: `${file.name}-${file.lastModified}-${file.size}-${prev.length}-${index}`,
                      name: file.name,
                      size: file.size,
                      status: 'uploading' as const,
                      progress: 42,
                    })),
                  ]);
                }}
                onRemove={(id) => setImportFiles((prev) => prev.filter((file) => file.id !== id))}
              />
            </div>
          )}

          {activeId === 'people' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SectionHeader
                title="Directory"
                description={`${people.length} people in ${contextLabel}. Seats are provisioned from the licenses page.`}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {people.map((person) => (
                  <div
                    key={person.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }}
                  >
                    <Avatar size="sm" initials={person.initials} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div>{person.name}</div>
                      <div
                        style={{
                          fontSize: 'var(--corpo-text-sm)',
                          color: 'var(--corpo-text-secondary)',
                        }}
                      >
                        {person.role}
                      </div>
                    </div>
                    <Badge color={person.onLeave ? 'amber' : 'green'}>
                      {person.onLeave ? 'On leave' : 'Active'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeId === 'teams' && selectedOrg && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SectionHeader
                title={selectedOrg.label}
                description={teamCopy(selectedOrg.id)}
              />
              {childTeams.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {childTeams.map((team) => (
                    <div
                      key={team.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 36 }}
                    >
                      <span style={{ flex: 1, minWidth: 0 }}>{team.label}</span>
                      <Badge>{peopleInScope(team.id).length}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span>No nested teams. People on this team:</span>
                  <Badge>{people.length}</Badge>
                </div>
              )}
            </div>
          )}
        </AppShell.Content>
      </AppShell.Main>
    </AppShell>
  );
}

export const Default: Story = {
  render: () => <AdminConsoleExample />,
};
