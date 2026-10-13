import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { DataTable, type DataTableColumn, type DataTableRow } from './DataTable';

function columnLabel(index: number): string {
  let n = index + 1;
  let label = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}

export interface SpreadsheetCellProps {
  /** Cell content. */
  value: string | number;
  /** Non-editable value cell (computed/report cells). Defaults to the sheet's `readOnly`. */
  readOnly?: boolean;
  /** Alignment. Defaults to `right` for `number` values, `left` otherwise. */
  align?: 'left' | 'right';
  /** Value emphasis — `muted` for derived/quiet cells, `danger` for negatives/alerts. */
  tone?: 'muted' | 'danger';
  /** Computed running-balance cell — right-aligned, bold, inset. Implies `readOnly` unless overridden. */
  balance?: boolean;
  /** This cell's own commit handler; runs before the sheet's `onCellChange`. */
  onValueChange?: (value: string) => void;
}

/** A cell in {@link Spreadsheet} `rows`: a bare value (editable unless the sheet is `readOnly`) or props. */
export type SpreadsheetCellShorthand = string | number | SpreadsheetCellProps;

export interface SpreadsheetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** `rows[r][c]` — a bare value or {@link SpreadsheetCellProps}. */
  rows: SpreadsheetCellShorthand[][];
  /** Called when an edit is committed (Enter, Tab, or leaving the cell). */
  onCellChange?: (row: number, col: number, value: string) => void;
  /** Override auto A/B/C… column headers. */
  columnLabels?: string[];
  /** Default `readOnly` for cells that don't set their own (reports, projections). @default false */
  readOnly?: boolean;
}

const cellProps = (cell: SpreadsheetCellShorthand): SpreadsheetCellProps =>
  cell instanceof Object ? cell : { value: cell };

/**
 * Corpo spreadsheet — a preset over {@link DataTable}'s grid: A/B/C column
 * headers, row numbers, mono cells, and the same keyboard model (arrows,
 * ranges, copy as TSV, column resize). Edit a cell with Enter, F2, typing or a
 * double-click; Enter / Tab commit, Escape cancels. Object cells can be
 * `readOnly` (computed subtotals), `balance`, or set `align`/`tone`; the
 * sheet-level `readOnly` flips the default for reports and projections.
 */
export function Spreadsheet({
  rows,
  onCellChange,
  columnLabels,
  readOnly = false,
  className,
  ...rest
}: SpreadsheetProps) {
  const grid = rows.map((row) => row.map(cellProps));
  const colCount = grid[0]?.length ?? 0;
  const key = (c: number) => `c${c}`;
  const isRight = (p: SpreadsheetCellProps) => (p.align ? p.align === 'right' : Number.isFinite(p.value));
  const editable = (r: number, c: number) => {
    const p = grid[r]?.[c];
    return p != null && !(p.readOnly ?? (p.balance || readOnly));
  };

  const columns: DataTableColumn[] = Array.from({ length: colCount }, (_, c) => ({
    key: key(c),
    label: columnLabels?.[c] ?? columnLabel(c),
    numeric: grid.every((row) => row[c] == null || isRight(row[c])),
    editable: (row: DataTableRow) => editable(Number(row.id), c),
  }));

  const tableRows: DataTableRow[] = grid.map((row, r) => ({
    id: String(r),
    cells: Object.fromEntries(
      row.map((p, c) => [
        key(c),
        {
          content: p.value,
          numeric: isRight(p),
          className: cn(p.tone && `cp-spreadsheet__cell--${p.tone}`, p.balance && 'cp-spreadsheet__cell--balance'),
        },
      ]),
    ),
    values: Object.fromEntries(row.map((p, c) => [key(c), p.value])),
  }));

  return (
    <DataTable
      grid
      rowNumbers
      className={cn('cp-spreadsheet', className)}
      columns={columns}
      rows={tableRows}
      onCellEdit={(rowId, colKey, value) => {
        const r = Number(rowId);
        const c = Number(colKey.slice(1));
        grid[r]?.[c]?.onValueChange?.(value);
        onCellChange?.(r, c, value);
      }}
      {...rest}
    />
  );
}
