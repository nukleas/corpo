import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Amount, roundCents } from './Amount';
import { Button } from './Button';
import { DataTable, sumColumn } from './DataTable';
import type { DataTableColumn, DataTableRow } from './DataTable';

const meta: Meta<typeof DataTable> = {
  title: 'Display/DataTable',
  component: DataTable,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DataTable>;

const COLUMNS = [
  { key: 'id', label: 'Invoice', mono: true, sortable: true },
  { key: 'client', label: 'Client', sortable: true },
  { key: 'amount', label: 'Amount', numeric: true, sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

const ROWS: DataTableRow[] = [
  {
    id: 'INV-1042',
    cells: {
      id: 'INV-1042',
      client: 'Acme Inc.',
      amount: { content: <Amount value={12_400} /> },
      status: { content: 'Paid', status: 'ok' },
    },
    values: { amount: 12_400, status: 'Paid' },
  },
  {
    id: 'INV-1043',
    cells: {
      id: 'INV-1043',
      client: 'Northwind',
      amount: { content: <Amount value={8_150} /> },
      status: { content: 'Pending', status: 'warn' },
    },
    values: { amount: 8_150, status: 'Pending' },
  },
  {
    id: 'INV-1039',
    cells: {
      id: 'INV-1039',
      client: 'Globex',
      amount: { content: <Amount value={-1_200} /> },
      status: { content: 'Credited', status: 'idle' },
    },
    values: { amount: -1_200, status: 'Credited' },
  },
  {
    id: 'INV-1040',
    cells: {
      id: 'INV-1040',
      client: 'Initech',
      amount: { content: <Amount value={860} /> },
      status: { content: 'Overdue', status: 'err' },
    },
    values: { amount: 860, status: 'Overdue' },
  },
];

/** Click a header to sort — asc, desc, then cleared. Amount sorts on its raw value from `values`, so `(1,200.00)` orders as −1200. */
export const Sortable: Story = {
  render: () => <DataTable columns={COLUMNS} rows={ROWS} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstId = () => canvasElement.querySelector('tbody tr td')?.textContent;
    const amount = canvas.getByRole('button', { name: /Amount/ });
    const header = amount.closest('th');

    await userEvent.click(amount);
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(firstId()).toBe('INV-1039'); // −1,200 sorts on its raw value, not "(1,200.00)"

    await userEvent.click(amount);
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect(firstId()).toBe('INV-1042');

    await userEvent.click(amount);
    await expect(header).not.toHaveAttribute('aria-sort');
    await expect(firstId()).toBe('INV-1042'); // back to source order
  },
};

/** `searchable` adds the toolbar quick filter across every column's raw values, with a filtered count. */
export const Filterable: Story = {
  render: () => <DataTable columns={COLUMNS} rows={ROWS} searchable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Filter rows' }), 'north');
    await expect(canvasElement.querySelectorAll('tbody tr')).toHaveLength(1);
    await expect(canvas.getByText('1/4')).toBeInTheDocument();
    await userEvent.clear(canvas.getByRole('searchbox', { name: 'Filter rows' }));
    await expect(canvasElement.querySelectorAll('tbody tr')).toHaveLength(4);
  },
};

/**
 * Selection is controlled — the page owns the ids. `bulkActions` renders under the table while any
 * row is selected, with the count and a clear-selection button; the actions read `selected`
 * themselves. The header checkbox toggles the visible (filtered) rows.
 */
export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['INV-1043']);
    return (
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        searchable
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        compact
        bulkActions={
          <>
            <Button size="sm">Send reminders</Button>
            <Button size="sm">Export</Button>
          </>
        }
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole('checkbox', { name: 'Select all rows' });
    await expect(all).toHaveProperty('indeterminate', true); // one of four preselected
    await expect(canvas.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('1 selected');

    await userEvent.click(all);
    await expect(all).toBeChecked();
    await expect(canvas.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('4 selected');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }));
    await expect(all).not.toBeChecked();
    await expect(canvas.queryByRole('region', { name: 'Bulk actions' })).toBeNull();
  },
};

const TOTAL_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Invoice', mono: true, sortable: true, summary: () => 'Total' },
  { key: 'client', label: 'Client', sortable: true },
  {
    key: 'amount',
    label: 'Amount',
    numeric: true,
    sortable: true,
    summary: (rows) => ({ content: <Amount value={roundCents(sumColumn(rows, 'amount'))} /> }),
  },
  { key: 'status', label: 'Status', sortable: true },
];

/** A column `summary` adds a totals row. It is computed from the rows shown, so it follows the quick filter. */
export const Totals: Story = {
  render: () => <DataTable columns={TOTAL_COLUMNS} rows={ROWS} searchable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const footer = () => canvasElement.querySelector('tfoot');
    await expect(footer()).toHaveTextContent('20,210.00');

    await userEvent.type(canvas.getByRole('searchbox', { name: 'Filter rows' }), 'acme');
    await expect(footer()).toHaveTextContent('12,400.00');
  },
};

const CLIENTS = [
  'Acme Inc.',
  'Northwind',
  'Globex',
  'Initech',
  'Umbrella',
  'Hooli',
  'Stark Industries',
  'Wayne Enterprises',
];
const REGIONS = ['North America', 'EMEA', 'APAC', 'LATAM'];
const OWNERS = ['A. Shah', 'M. Okafor', 'J. Lindqvist', 'R. Tanaka', 'L. Moreau'];
const STATES = [
  { content: 'Paid', status: 'ok' },
  { content: 'Pending', status: 'warn' },
  { content: 'Overdue', status: 'err' },
  { content: 'Draft', status: 'idle' },
] as const;

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const sumCell = (key: string) => (rows: DataTableRow[]) => money(roundCents(sumColumn(rows, key)));

const GRID_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Invoice', mono: true, sortable: true, summary: (rows) => `${rows.length} invoices` },
  { key: 'client', label: 'Client', sortable: true },
  { key: 'region', label: 'Region', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'issued', label: 'Issued', mono: true, sortable: true },
  { key: 'due', label: 'Due', mono: true, sortable: true },
  { key: 'subtotal', label: 'Subtotal', numeric: true, sortable: true, summary: sumCell('subtotal') },
  { key: 'tax', label: 'Tax', numeric: true, sortable: true, summary: sumCell('tax') },
  { key: 'total', label: 'Total', numeric: true, sortable: true, summary: sumCell('total') },
  { key: 'status', label: 'Status', sortable: true },
];

const GRID_ROWS: DataTableRow[] = Array.from({ length: 200 }, (_, i) => {
  const id = `INV-${2000 + i}`;
  const subtotal = ((i * 7919) % 48_000) + 350;
  const tax = Math.round(subtotal * 0.0775 * 100) / 100;
  const state = STATES[i % STATES.length];
  const day = (i % 28) + 1;
  return {
    id,
    cells: {
      id,
      client: CLIENTS[i % CLIENTS.length],
      region: REGIONS[(i * 3) % REGIONS.length],
      owner: OWNERS[(i * 2) % OWNERS.length],
      issued: `2026-09-${String(day).padStart(2, '0')}`,
      due: `2026-10-${String(day).padStart(2, '0')}`,
      subtotal: money(subtotal),
      tax: money(tax),
      total: money(subtotal + tax),
      status: state,
    },
    values: { subtotal, tax, total: subtotal + tax, status: state.content },
  };
});

/**
 * `grid` is the dense, spreadsheet-like treatment for record-heavy screens — reach for it instead
 * of a stack of Cards. Full gridlines, ~28px rows, a sticky header (bound the DataTable's height so
 * the grid scrolls inside itself), optional `striped` rows, and `pinFirstColumn` to keep the record
 * id in view while scrolling sideways. Column summaries stick to the bottom as a totals row, and
 * selecting rows brings up the bulk action bar.
 */
export const Grid: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <DataTable
        columns={GRID_COLUMNS}
        rows={GRID_ROWS}
        grid
        striped
        pinFirstColumn
        searchable
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        bulkActions={<Button size="sm">Export selected</Button>}
        style={{ height: 420, maxWidth: 900 }}
      />
    );
  },
};

const onOpen = fn();

/**
 * Grid mode is keyboard-navigable (WAI-ARIA grid): one tab stop, arrows move between cells, Home/End to the
 * row's ends, Ctrl+Home/End to the grid's corners, PageUp/PageDown by a screenful. Enter sorts from a header
 * and opens a row (`onRowActivate`) from the body; Space selects the row.
 */
export const KeyboardGrid: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <DataTable
        columns={[...COLUMNS, { key: 'note', label: 'Note', summary: (rows) => `${rows.length} invoices` }]}
        rows={ROWS}
        grid
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        onRowActivate={onOpen}
        style={{ maxWidth: 720 }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole('grid');
    const cell = (row: number, col: number) => grid.querySelectorAll('tr')[row].children[col];

    await userEvent.tab();
    await expect(cell(0, 0)).toHaveFocus();
    await expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(1);

    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    await expect(cell(1, 1)).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onOpen).toHaveBeenCalledWith('INV-1042');

    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('checkbox', { name: 'Select row INV-1042' })).toBeChecked();

    await userEvent.keyboard('{End}');
    await expect(cell(1, 5)).toHaveFocus();
    await userEvent.keyboard('{Control>}{End}{/Control}');
    await expect(cell(5, 5)).toHaveFocus();
    await expect(cell(5, 5)).toHaveTextContent('4 invoices');
    await userEvent.keyboard('{Control>}{Home}{/Control}');
    await expect(cell(0, 0)).toHaveFocus();

    // Enter on a sortable header sorts; the header's button stays out of the tab order.
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await userEvent.keyboard('{Enter}');
    await expect(cell(0, 2)).toHaveAttribute('aria-sort', 'ascending');
    await expect(canvas.getByRole('button', { name: /Client/ })).toHaveAttribute('tabindex', '-1');
    await expect(cell(1, 1)).toHaveTextContent('INV-1042');
  },
};

const account = (id: string, name: string, balance: number, children?: DataTableRow[]): DataTableRow => ({
  id,
  cells: { account: `${id} ${name}`, balance: { content: <Amount value={balance} /> } },
  values: { account: `${id} ${name}`, balance },
  children,
});

const ACCOUNTS: DataTableRow[] = [
  account('1000', 'Assets', 412_300, [
    account('1100', 'Current assets', 162_300, [
      account('1110', 'Cash', 48_900),
      account('1120', 'Accounts receivable', 96_400),
      account('1130', 'Inventory', 17_000),
    ]),
    account('1500', 'Fixed assets', 250_000),
  ]),
  account('2000', 'Liabilities', 138_750, [
    account('2100', 'Accounts payable', 61_250),
    account('2200', 'Accrued expenses', 77_500),
  ]),
  account('3000', 'Equity', 273_550),
];

/**
 * A chart of accounts as a tree grid: rows with `children` expand in place. With the keyboard, ArrowRight on
 * a parent's first cell expands it, ArrowLeft collapses it or moves to the parent; the quick filter keeps the
 * ancestors of matches. Totals sum the top level only, since parents already roll up their children.
 */
export const TreeGrid: Story = {
  render: () => (
    <DataTable
      columns={[
        { key: 'account', label: 'Account' },
        {
          key: 'balance',
          label: 'Balance',
          numeric: true,
          summary: (rows) => ({ content: <Amount value={sumColumn(rows, 'balance')} /> }),
        },
      ]}
      rows={ACCOUNTS}
      grid
      searchable
      defaultExpanded={['1000']}
      style={{ maxWidth: 560 }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole('treegrid');
    const row = (name: string) => canvas.getByRole('row', { name: new RegExp(name) });
    const cell = (text: string) => canvas.getByText(text).closest('td');
    await expect(row('1000 Assets')).toHaveAttribute('aria-expanded', 'true');
    await expect(row('1100 Current assets')).toHaveAttribute('aria-level', '2');
    await expect(canvas.queryByRole('row', { name: /1110 Cash/ })).toBeNull();
    await expect(grid.querySelector('tfoot')).toHaveTextContent('824,600.00');

    cell('1100 Current assets')?.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(row('1100 Current assets')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await expect(cell('1110 Cash')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(cell('1100 Current assets')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(row('1100 Current assets')).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(canvas.getByRole('button', { name: 'Expand row 2000' }));
    await expect(row('2100 Accounts payable')).toBeInTheDocument();

    await userEvent.type(canvas.getByRole('searchbox', { name: 'Filter rows' }), 'cash');
    await expect(canvas.getAllByRole('row')).toHaveLength(5); // header, 1000, 1100, 1110, totals
    await expect(row('1110 Cash')).toHaveAttribute('aria-level', '3');
  },
};

/** Tree rows with a selection column: Space on a row selects it, and the select-all box covers the rows shown. */
export const TreeGridSelectable: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <DataTable
        columns={[
          { key: 'account', label: 'Account' },
          { key: 'balance', label: 'Balance', numeric: true },
        ]}
        rows={ACCOUNTS}
        grid
        searchable
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        defaultExpanded={['1000', '1100']}
        style={{ maxWidth: 560 }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row 1110' }));
    await expect(canvas.getByRole('checkbox', { name: 'Select row 1110' })).toBeChecked();

    canvas.getByText('1500 Fixed assets').closest('td')?.focus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('checkbox', { name: 'Select row 1500' })).toBeChecked();

    // The filter count compares shown rows with every row in the tree, not just the top level.
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Filter rows' }), 'cash');
    await expect(canvas.getByText('3/10')).toBeInTheDocument();
  },
};

/**
 * Range selection in grid mode: Shift+arrows, Shift+click or a drag select a block of cells; Ctrl/⌘+A selects
 * every body cell; Escape collapses back to one cell. Ctrl/⌘+C copies the block as tab-separated text — raw
 * values for amounts — so it pastes straight into Excel or Sheets.
 */
export const RangeAndCopy: Story = {
  render: () => <DataTable columns={COLUMNS} rows={ROWS} grid style={{ maxWidth: 720 }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const writeText = fn(async (_text: string) => {});
    Object.defineProperty(canvasElement.ownerDocument.defaultView?.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const grid = canvas.getByRole('grid');
    await expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    const cell = (row: number, col: number) => grid.querySelectorAll('tr')[row].children[col];

    const start = cell(1, 0);
    if (start instanceof HTMLElement) start.focus();
    await userEvent.keyboard('{Shift>}{ArrowRight}{ArrowRight}{ArrowDown}{/Shift}');
    await expect(grid.querySelectorAll('[aria-selected="true"]')).toHaveLength(6);
    await userEvent.keyboard('{Control>}c{/Control}');
    await expect(writeText).toHaveBeenCalledWith('INV-1042\tAcme Inc.\t12400\nINV-1043\tNorthwind\t8150');
    await expect(canvas.getByRole('status')).toHaveTextContent('Copied 2 rows × 3 columns');

    await userEvent.keyboard('{Escape}');
    await expect(grid.querySelectorAll('[aria-selected="true"]')).toHaveLength(0);

    await userEvent.keyboard('{Control>}a{/Control}');
    await expect(grid.querySelectorAll('[aria-selected="true"]')).toHaveLength(16);

    // One user-event instance, so the held Shift carries into the click.
    const user = userEvent.setup();
    await user.click(cell(3, 1));
    await user.keyboard('{Shift>}');
    await user.click(cell(4, 3));
    await user.keyboard('{/Shift}');
    await expect(grid.querySelectorAll('[aria-selected="true"]')).toHaveLength(6);
  },
};

function ResizableTable({ grid = false }: { grid?: boolean }) {
  const [widths, setWidths] = useState<Record<string, number>>({ id: 120, client: 160, amount: 140 });
  return (
    <DataTable
      grid={grid}
      columns={COLUMNS.map((c) => ({ ...c, width: widths[c.key] }))}
      rows={ROWS}
      onColumnResize={(key, width) => setWidths({ ...widths, [key]: width })}
      style={{ maxWidth: 720 }}
    />
  );
}

/**
 * Drag a header's right edge to resize its column, or focus the handle and use the arrow keys. Widths are the
 * caller's: `onColumnResize` reports them and `columns[].width` applies them.
 */
export const ResizableColumns: Story = {
  render: () => <ResizableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator', { name: 'Client' });
    await expect(handle).toHaveAttribute('aria-valuenow', '160');
    handle.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '192');
    await expect(handle).toHaveAttribute('aria-valuetext', '192 pixels wide');
    await expect(canvasElement.querySelectorAll('col')[1]).toHaveStyle({ width: '192px' });
  },
};

/** In grid mode the handles leave the tab order; Alt+ArrowLeft/Right on a header cell resizes its column. */
export const ResizableColumnsGrid: Story = {
  render: () => <ResizableTable grid />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator', { name: 'Invoice' });
    await expect(handle).toHaveAttribute('tabindex', '-1');
    await userEvent.tab();
    await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}');
    await expect(handle).toHaveAttribute('aria-valuenow', '104');
  },
};

interface BudgetLine {
  id: string;
  account: string;
  amount: number;
  note: string;
  locked?: boolean;
}

function BudgetGrid() {
  const [lines, setLines] = useState<BudgetLine[]>([
    { id: 'b1', account: '6100 Travel', amount: 12_000, note: 'Two offsites' },
    { id: 'b2', account: '6200 Software', amount: 48_500, note: '' },
    { id: 'b3', account: '6300 Payroll', amount: 410_000, note: 'Set by HR', locked: true },
  ]);
  const rows: DataTableRow[] = lines.map((l) => ({
    id: l.id,
    cells: { account: l.account, amount: { content: <Amount value={l.amount} /> }, note: l.note },
    values: { amount: l.amount },
  }));
  return (
    <DataTable
      grid
      rowNumbers
      columns={[
        { key: 'account', label: 'Account' },
        {
          key: 'amount',
          label: 'Budget',
          numeric: true,
          editable: (row) => !lines.find((l) => l.id === row.id)?.locked,
        },
        { key: 'note', label: 'Note', editable: true },
      ]}
      rows={rows}
      onCellEdit={(id, key, value) =>
        setLines(
          lines.map((l) =>
            l.id !== id
              ? l
              : key === 'amount'
                ? { ...l, amount: Number(value.replace(/[,\s$]/g, '')) || 0 }
                : { ...l, note: value },
          ),
        )
      }
      style={{ maxWidth: 640 }}
    />
  );
}

/**
 * In-place editing on the grid: Enter, F2, typing or a double-click edits the active cell; Enter commits and
 * moves down, Tab commits and moves right, Escape cancels, Delete clears. Editability can be per cell — the
 * payroll budget is locked.
 */
export const EditableCells: Story = {
  render: () => <BudgetGrid />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole('grid');
    const cell = (row: number, col: number) => grid.querySelectorAll('tr')[row].children[col];
    const focus = (row: number, col: number) => {
      const el = cell(row, col);
      if (el instanceof HTMLElement) el.focus();
    };
    await expect(cell(1, 0)).toHaveTextContent('1');

    focus(1, 2);
    await userEvent.keyboard('{Enter}');
    const editor = canvas.getByRole('textbox', { name: 'Budget 1' });
    await expect(editor).toHaveValue('12000');
    await userEvent.keyboard('15000{Enter}');
    await expect(cell(1, 2)).toHaveTextContent('15,000.00');
    await expect(cell(2, 2)).toHaveFocus();

    await userEvent.keyboard('9');
    await expect(canvas.getByRole('textbox', { name: 'Budget 2' })).toHaveValue('9');
    await userEvent.keyboard('{Escape}');
    await expect(cell(2, 2)).toHaveTextContent('48,500.00');

    await userEvent.keyboard('{Enter}{Tab}');
    await expect(cell(2, 3)).toHaveFocus();
    await userEvent.keyboard('Renewals due{Enter}');
    await expect(cell(2, 3)).toHaveTextContent('Renewals due');

    focus(1, 3);
    await userEvent.keyboard('{Delete}');
    await expect(cell(1, 3)).toHaveTextContent('');

    focus(3, 2);
    await userEvent.keyboard('{Enter}');
    await expect(canvas.queryByRole('textbox')).toBeNull();
  },
};
