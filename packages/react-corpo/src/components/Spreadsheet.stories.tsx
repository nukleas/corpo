import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Spreadsheet } from './Spreadsheet';
import type { SpreadsheetCellShorthand } from './Spreadsheet';

const meta: Meta<typeof Spreadsheet> = {
  title: 'Display/Spreadsheet',
  component: Spreadsheet,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Spreadsheet>;

export const Default: Story = {
  render: () => {
    const [rows, setRows] = useState<SpreadsheetCellShorthand[][]>([
      ['Q1', '12,400', '9,100'],
      ['Q2', '13,750', '9,800'],
      ['Q3', '14,200', '10,300'],
    ]);
    return (
      <Spreadsheet
        rows={rows}
        columnLabels={['Quarter', 'Revenue', 'Cost']}
        onCellChange={(r, c, v) => setRows((prev) => prev.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? v : cell)) : row)))}
      />
    );
  },
};

/** Editable assumptions with read-only computed cells in the same sheet — number shorthand right-aligns, `tone` marks derived and negative values. */
export const MixedProjection: Story = {
  render: () => {
    const [growth, setGrowth] = useState(['4.0', '5.5']);
    const q1 = 12_400;
    const q2 = Math.round(q1 * (1 + (parseFloat(growth[0]) || 0) / 100));
    const q3 = Math.round(q2 * (1 + (parseFloat(growth[1]) || 0) / 100));
    return (
      <Spreadsheet
        columnLabels={['Metric', 'Q1', 'Q2', 'Q3']}
        rows={[
          [
            { value: 'Revenue', readOnly: true },
            { value: q1.toLocaleString(), align: 'right', readOnly: true },
            { value: q2.toLocaleString(), align: 'right', readOnly: true, tone: 'muted' },
            { value: q3.toLocaleString(), align: 'right', readOnly: true, tone: 'muted' },
          ],
          [
            { value: 'Growth % (edit me)', readOnly: true },
            { value: '—', align: 'right', readOnly: true, tone: 'muted' },
            <Spreadsheet.Cell
              key="g1"
              value={growth[0]}
              align="right"
              onValueChange={(v) => setGrowth(([, b]) => [v, b])}
            />,
            <Spreadsheet.Cell
              key="g2"
              value={growth[1]}
              align="right"
              onValueChange={(v) => setGrowth(([a]) => [a, v])}
            />,
          ],
        ]}
      />
    );
  },
};

/** Ledger sheet: Dr/Cr `columnLabels` plus computed `balance` cells — right-aligned, bold, inset, read-only by default. */
export const LedgerMode: Story = {
  render: () => {
    const [drCr, setDrCr] = useState([
      ['12,400', ''],
      ['', '3,800'],
      ['', '5,250.75'],
    ]);
    let running = 24_180.4;
    const parse = (s: string) => Number(s.replace(/[,$\s]/g, '')) || 0;
    const rows = drCr.map(([dr, cr], r) => {
      running += parse(dr) - parse(cr);
      return [
        { value: ['Client invoice #1042', 'Office lease — January', 'Contractor payout'][r] ?? '', readOnly: true },
        <Spreadsheet.Cell key="dr" value={dr} align="right" onValueChange={(v) => setDrCr((p) => p.map((row, i) => (i === r ? [v, row[1]] : row)))} />,
        <Spreadsheet.Cell key="cr" value={cr} align="right" onValueChange={(v) => setDrCr((p) => p.map((row, i) => (i === r ? [row[0], v] : row)))} />,
        { value: running.toLocaleString('en-US', { minimumFractionDigits: 2 }), balance: true },
      ];
    });
    return <Spreadsheet columnLabels={['Memo', 'Dr', 'Cr', 'Balance']} rows={rows} />;
  },
};

/** Grid-level `readOnly` flips the default for every cell — a report/projection sheet (negatives in `danger`). */
export const TrialBalance: Story = {
  render: () => (
    <Spreadsheet
      readOnly
      columnLabels={['Account', 'Title', 'Balance (debit-positive)']}
      rows={[
        ['411900', 'Other Appropriations Realized', { value: '1,200,000', align: 'right' }],
        ['445000', 'Unapportioned - Unexpired Authority', { value: '-1,200,000', align: 'right', tone: 'danger' }],
        ['101000', 'Fund Balance With Treasury', { value: '1,200,000', align: 'right' }],
        ['310100', 'Unexpended Appropriations - Appropriations Received', { value: '-1,200,000', align: 'right', tone: 'danger' }],
      ]}
    />
  ),
};
