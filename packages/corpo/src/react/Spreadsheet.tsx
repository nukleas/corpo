import { isValidElement } from 'react';
import type { ReactElement } from 'react';

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
  /** Non-editable value cell (computed/report cells). Inherits the grid's `readOnly` default. */
  readOnly?: boolean;
  /** Column alignment. Defaults to `right` for `number` values, `left` otherwise. */
  align?: 'left' | 'right';
  /** Value emphasis — `muted` for derived/quiet cells, `danger` for negatives/alerts. */
  tone?: 'muted' | 'danger';
}

/** Cell shorthand: bare value, props object, or a ready element (rendered as the cell body). */
export type SpreadsheetCellShorthand = string | number | SpreadsheetCellProps | ReactElement;

export interface SpreadsheetProps {
  /** 2D array of cell shorthands — `rows[r][c]`. */
  rows: SpreadsheetCellShorthand[][];
  onCellChange?: (row: number, col: number, value: string) => void;
  /** Override auto A/B/C… column headers. */
  columnLabels?: string[];
  /** Default `readOnly` for cells that don't set their own (reports, projections). @default false */
  readOnly?: boolean;
}

/** Corpo spreadsheet — sticky-headed grid; cell shorthand controls per-cell readOnly/align/tone. */
export function Spreadsheet({ rows, onCellChange, columnLabels, readOnly = false }: SpreadsheetProps) {
  const colCount = rows[0]?.length ?? 0;

  function renderCell(cell: SpreadsheetCellShorthand, r: number, c: number) {
    if (isValidElement(cell)) {
      return (
        <td key={c} className="cp-spreadsheet__cell">
          {cell}
        </td>
      );
    }
    const props: SpreadsheetCellProps =
      // oxlint-disable-next-line anti-slop/no-runtime-typeof -- cell-shorthand boundary: element case is excluded above, so object means props
      typeof cell === 'object' ? cell : { value: cell };
    const cellReadOnly = props.readOnly ?? readOnly;
    const alignRight = props.align ? props.align === 'right' : Number.isFinite(props.value);
    const tdClass = [
      'cp-spreadsheet__cell',
      alignRight && 'cp-spreadsheet__cell--num',
      props.tone && `cp-spreadsheet__cell--${props.tone}`,
    ].filter(Boolean).join(' ');
    return (
      <td key={c} className={tdClass}>
        {cellReadOnly ? (
          <div className="cp-spreadsheet__value">{props.value}</div>
        ) : (
          <input
            className="cp-spreadsheet__input"
            value={String(props.value)}
            onChange={(e) => onCellChange?.(r, c, e.target.value)}
          />
        )}
      </td>
    );
  }

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
              {row.map((cell, c) => renderCell(cell, r, c))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
