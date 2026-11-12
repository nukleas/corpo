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
import { Avatar } from '../components/Avatar';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { Section } from '../components/Section';
import { LICENSES } from '../components/LicenseCatalog.fixtures';
import { Brand } from '../components/Brand';

const meta = {
  title: 'Examples/IT admin console',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', corpoFlush: true },
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

const PEOPLE_COLUMNS: DataTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true, summary: (rows) => `${rows.length} people` },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'team', label: 'Team', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

const TEAM_COLUMNS: DataTableColumn[] = [
  { key: 'team', label: 'Team', sortable: true },
  { key: 'people', label: 'People', numeric: true, sortable: true },
];

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

  const byId = (id?: string | null): LicenseItem | null => LICENSES.find((license) => license.id === id) ?? null;
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
        { id: 'imports', label: 'Imports' },
      ],
    },
  ];

  const people = peopleInScope(selectedOrgId);
  const teams = selectedOrg?.children?.length ? selectedOrg.children : selectedOrg ? [selectedOrg] : [];

  return (
    <AppShell navOpen={navOpen} onNavClose={() => setNavOpen(false)} style={{ height: '100vh' }}>
      <AppShell.Sidebar>
        <SideNav
          brand={<Brand name="Halcyon IT" detail="Admin console" />}
          sections={sections}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            setNavOpen(false);
          }}
          style={{ flex: '1 1 0', minHeight: 0 }}
        />
        <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'auto' }}>
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
              <div style={{ flex: '2 1 320px', minWidth: 0 }}>
                <Section title="Assignments" description="Select a slot, then assign the selected license to it.">
                  <AssignmentSlots
                    slots={slots}
                    selectedSlotId={selectedSlotId}
                    onSelectSlot={(slot) => {
                      setSelectedSlotId(slot.id);
                      if (slot.item) setSelectedLicenseId(slot.item.id);
                    }}
                  />
                </Section>
                <Section title="Catalog">
                  <LicenseCatalog
                    items={LICENSES}
                    selectedId={selectedLicenseId}
                    assignedIds={assignedIds}
                    onSelect={(item) => setSelectedLicenseId(item.id)}
                    onActivate={assign}
                  />
                </Section>
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
                          onClick={() => setPlacement((prev) => ({ ...prev, [selectedSlotId]: undefined }))}
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
            <div style={{ maxWidth: 560 }}>
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
            <DataTable
              compact
              searchable
              columns={PEOPLE_COLUMNS}
              rows={people.map((person) => ({
                id: person.id,
                cells: {
                  name: person.name,
                  role: person.role,
                  team: findNode(ORG, person.teamId)?.label ?? '–',
                  status: person.onLeave
                    ? { content: 'On leave', status: 'warn' }
                    : { content: 'Active', status: 'ok' },
                },
                values: { status: person.onLeave ? 'On leave' : 'Active' },
              }))}
            />
          )}

          {activeId === 'teams' && (
            <DataTable
              compact
              columns={TEAM_COLUMNS}
              rows={teams.map((team) => ({
                id: team.id,
                cells: { team: team.label, people: peopleInScope(team.id).length },
              }))}
            />
          )}
        </AppShell.Content>
      </AppShell.Main>
    </AppShell>
  );
}

export const Default: Story = {
  render: () => <AdminConsoleExample />,
};
