import type { ReactElement, TdHTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { createShorthandFactory } from '../lib/createShorthand';
import type { Shorthand } from '../lib/createShorthand';

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

export interface SpreadsheetCellProps
  extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Cell content. */
  value: string | number;
  /** Non-editable value cell (computed/report cells). Inherits the grid's `readOnly` default. */
  readOnly?: boolean;
  /** Column alignment. Defaults to `right` for `number` values, `left` otherwise. */
  align?: 'left' | 'right';
  /** Value emphasis — `muted` for derived/quiet cells, `danger` for negatives/alerts. */
  tone?: 'muted' | 'danger';
  /** Change handler; injected per-cell by the grid. */
  onValueChange?: (value: string) => void;
}

/**
 * One spreadsheet cell — an editable input or, when `readOnly`, a selectable
 * value. Usually written as shorthand inside {@link Spreadsheet} `rows`:
 * a bare `string | number`, a props object, or a ReactElement.
 */
export function SpreadsheetCell({
  value,
  readOnly = false,
  align,
  tone,
  onValueChange,
  className,
  ...rest
}: SpreadsheetCellProps) {
  const alignRight = align ? align === 'right' : typeof value === 'number';
  return (
    <td
      className={cn(
        'cp-spreadsheet__cell',
        alignRight && 'cp-spreadsheet__cell--num',
        tone && `cp-spreadsheet__cell--${tone}`,
        className,
      )}
      {...rest}
    >
      {readOnly ? (
        <div className="cp-spreadsheet__value">{value}</div>
      ) : (
        <input
          className="cp-spreadsheet__input"
          value={String(value)}
          onChange={(e) => onValueChange?.(e.target.value)}
        />
      )}
    </td>
  );
}

/** Normalizes cell shorthand — `12_400` / `{ value, readOnly, tone }` / element — to a {@link SpreadsheetCell}. */
SpreadsheetCell.create = createShorthandFactory<SpreadsheetCellProps>(SpreadsheetCell, (value) => ({ value }));

/** Shorthand accepted in {@link Spreadsheet} `rows`. */
export type SpreadsheetCellShorthand = Shorthand<SpreadsheetCellProps>;

export interface SpreadsheetProps {
  /** 2D array of cell shorthands — `rows[r][c]` is a `string | number`, {@link SpreadsheetCellProps}, or element. */
  rows: SpreadsheetCellShorthand[][];
  onCellChange?: (row: number, col: number, value: string) => void;
  /** Override auto A/B/C… column headers. */
  columnLabels?: string[];
  /** Default `readOnly` for cells that don't set their own (reports, projections). @default false */
  readOnly?: boolean;
}

/**
 * Corpo spreadsheet — grid with sticky row/column headers. Cells take
 * shorthand: bare values are editable inputs, props objects can mark
 * individual cells `readOnly` (computed subtotals) or set `align`/`tone`;
 * grid-level `readOnly` flips the default for report/projection sheets.
 */
export function Spreadsheet({ rows, onCellChange, columnLabels, readOnly = false }: SpreadsheetProps) {
  const colCount = rows[0]?.length ?? 0;
  return (
    <div className="cp-spreadsheet">
      <table className="cp-spreadsheet__table">
        <thead>
          <tr>
            <th className="cp-spreadsheet__corner" />
            {Array.from({ length: colCount }, (_, c) => (
              <th key={c} className="cp-spreadsheet__col-head">
                {columnLabels?.[c] ?? columnLabel(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              <th className="cp-spreadsheet__row-head">{r + 1}</th>
              {row.map((cell, c): ReactElement | null =>
                SpreadsheetCell.create(cell, {
                  key: c,
                  // Grid wiring is a default — a cell's own readOnly/onValueChange wins.
                  defaultProps: { readOnly, onValueChange: (v) => onCellChange?.(r, c, v) },
                }),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Spreadsheet.Cell = SpreadsheetCell;
