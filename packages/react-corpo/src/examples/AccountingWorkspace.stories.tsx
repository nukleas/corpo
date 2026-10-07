import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from '../components/AppShell';
import { SideNav } from '../components/SideNav';
import { Topbar } from '../components/Topbar';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { JournalEntry } from '../components/JournalEntry';
import type { JournalEntryValue, JournalPosting } from '../components/JournalEntry';
import { Ledger } from '../components/Ledger';
import { SectionHeader } from '../components/SectionHeader';
import { Sheet } from '../components/Sheet';
import { Stat } from '../components/Stat';
import { TAccount } from '../components/TAccount';
import { TrialBalance } from '../components/TrialBalance';

const meta = {
  title: 'Examples/Accounting workspace',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;

const OPENING = 24_180.4;

interface LedgerRow {
  date: string;
  memo: string;
  ref: string;
  debit?: number;
  credit?: number;
}

const START_ENTRIES: LedgerRow[] = [
  { date: '2026-01-03', memo: 'Client invoice #1042', ref: 'AR', debit: 12_400 },
  { date: '2026-01-05', memo: 'Office lease — January', ref: 'CHK 2201', credit: 3_800 },
  { date: '2026-01-09', memo: 'Contractor payout', ref: 'ACH', credit: 5_250.75 },
  { date: '2026-01-14', memo: 'Client invoice #1043', ref: 'AR', debit: 8_150 },
  { date: '2026-01-28', memo: 'Interest earned', ref: 'BNK', debit: 84.12 },
];

const SECTIONS = [
  { items: [{ id: 'overview', label: 'Overview' }] },
  {
    title: 'Books',
    items: [
      { id: 'register', label: 'Cash register' },
      { id: 'journal', label: 'Journal' },
      { id: 'trial', label: 'Trial balance' },
    ],
  },
];

const EMPTY_JOURNAL: JournalEntryValue = {
  date: '2026-01-31',
  memo: '',
  postings: [
    { account: 'Cash', memo: '', debit: '', credit: '' },
    { account: '', memo: '', debit: '', credit: '' },
  ],
};

const parse = (s: string) => Number(s.replace(/[,$\s]/g, '')) || 0;
const money = (v: number) =>
  `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function AccountingWorkspaceExample() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeId, setActiveId] = useState('register');
  const [entries, setEntries] = useState<LedgerRow[]>(START_ENTRIES);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journal, setJournal] = useState<JournalEntryValue>(EMPTY_JOURNAL);

  const totalDr = entries.reduce((s, e) => s + (e.debit ?? 0), 0);
  const totalCr = entries.reduce((s, e) => s + (e.credit ?? 0), 0);
  const closing = OPENING + totalDr - totalCr;

  const journalDr = journal.postings.reduce((s: number, p: JournalPosting) => s + parse(p.debit), 0);
  const journalCr = journal.postings.reduce((s: number, p: JournalPosting) => s + parse(p.credit), 0);
  const journalBalanced = Math.round((journalDr - journalCr) * 100) === 0 && journalDr > 0;

  const postJournal = () => {
    const cash = journal.postings.find((p) => p.account.trim().toLowerCase() === 'cash');
    setEntries((prev) => [
      ...prev,
      {
        date: journal.date,
        memo: journal.memo || 'Journal entry',
        ref: `JE-${prev.length + 1}`,
        debit: cash && parse(cash.debit) > 0 ? parse(cash.debit) : undefined,
        credit: cash && parse(cash.credit) > 0 ? parse(cash.credit) : undefined,
      },
    ]);
    setJournal(EMPTY_JOURNAL);
    setJournalOpen(false);
  };

  return (
    <AppShell navOpen={navOpen} onNavClose={() => setNavOpen(false)} style={{ height: '100vh' }}>
      <AppShell.Sidebar>
        <SideNav
          brand="Meridian Books"
          sections={SECTIONS}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setNavOpen(false); }}
          footer={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="sm" initials="NH" status="online" />
              <span style={{ fontSize: 'var(--corpo-text-sm)' }}>Controller</span>
            </div>
          }
        />
      </AppShell.Sidebar>
      <AppShell.Main>
        <Topbar
          title="Cash — January 2026"
          onNavToggle={() => setNavOpen(true)}
          actions={
            <Button size="sm" variant="primary" onClick={() => setJournalOpen(true)}>
              New journal entry
            </Button>
          }
        />
        <AppShell.Content>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <Stat label="Opening" value={money(OPENING)} />
              <Stat label="Total Dr" value={money(totalDr)} delta="period" deltaTone="up" />
              <Stat label="Total Cr" value={money(totalCr)} delta="period" deltaTone="down" />
              <Stat label="Closing" value={money(closing)} />
            </div>
            <div>
              <SectionHeader
                title="Cash register"
                description="Running balance, green-bar row tracking; post new activity from the journal."
              />
              <Ledger opening={OPENING} entries={entries} bar />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'start' }}>
              <div style={{ flex: '3 1 360px', minWidth: 0 }}>
                <TrialBalance
                  entity="Meridian Consulting LLC"
                  asOf="As of January 31, 2026"
                  rows={[
                    { account: 'Cash', ref: '101', debit: closing },
                    { account: 'Accounts Receivable', ref: '110', debit: 12_150 },
                    { account: 'Accounts Payable', ref: '201', credit: 4_320 },
                    { account: "Owner's Equity", ref: '301', credit: 25_000 },
                    { account: 'Service Revenue', ref: '401', credit: 20_550 + (closing - 27_613.77) },
                    { account: 'Rent Expense', ref: '511', debit: 3_800 },
                    { account: 'Contractor Expense', ref: '520', debit: 5_250.75 },
                    { account: 'Payroll Expense', ref: '530', debit: 1_055.48 },
                  ]}
                />
              </div>
              <div style={{ flex: '2 1 280px', minWidth: 0 }}>
                <SectionHeader title="Cash T-account" />
                <TAccount
                  title="Cash"
                  debits={[
                    { label: 'Balance b/d', amount: OPENING, carry: true },
                    ...entries.filter((e) => e.debit).map((e) => ({ label: e.memo, amount: e.debit ?? 0 })),
                  ]}
                  credits={[
                    ...entries.filter((e) => e.credit).map((e) => ({ label: e.memo, amount: e.credit ?? 0 })),
                    { label: 'Balance c/d', amount: closing, carry: true },
                  ]}
                />
              </div>
            </div>
          </div>
        </AppShell.Content>
      </AppShell.Main>
      <Sheet
        open={journalOpen}
        onClose={() => setJournalOpen(false)}
        title="New journal entry"
        footer={
          <>
            <Button size="sm" onClick={() => setJournalOpen(false)}>Cancel</Button>
            <Button size="sm" variant="primary" disabled={!journalBalanced} onClick={postJournal}>
              Post
            </Button>
          </>
        }
      >
        <JournalEntry value={journal} onChange={setJournal} />
      </Sheet>
    </AppShell>
  );
}

/** The full accounting flow — Stat strip (opening / Σ Dr / Σ Cr / closing) over a green-bar cash register, a live trial balance and T-account, and a Sheet-hosted JournalEntry that must prove before it can post. */
export const Default: StoryObj = {
  render: () => <AccountingWorkspaceExample />,
};
