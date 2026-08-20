import type { HTMLAttributes, ReactNode, TdHTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { createShorthandFactory } from '../lib/createShorthand';
import type { Shorthand } from '../lib/createShorthand';

export type TableCellStatus = 'ok' | 'warn' | 'err' | 'idle';

export interface TableCellProps
  extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'content'> {
  /** Cell content. */
  content?: ReactNode;
  /** Status dot rendered before the content. */
  status?: TableCellStatus;
  /** Right-align + tabular nums + mono. Defaults from the column. */
  numeric?: boolean;
  /** Render in mono. Defaults from the column. */
  mono?: boolean;
}

/**
 * One table cell. Usually written as shorthand inside {@link Table} `rows`:
 * a bare `string | number`, a props object (`{ content, status }`), or a
 * `<Table.Cell>` element.
 */
export function TableCell({
  content,
  status,
  numeric = false,
  mono = false,
  className,
  children,
  ...rest
}: TableCellProps) {
  return (
    <td
      className={className || undefined}
      data-numeric={numeric || undefined}
      data-mono={mono || numeric || undefined}
      {...rest}
    >
      {status && <span className={cn('cp-table__status', `cp-table__status--${status}`)} aria-hidden="true" />}
      {content}
      {children}
    </td>
  );
}

/** Normalizes cell shorthand — `'Paid'` / `{ content, status }` / element — to a {@link TableCell}. */
TableCell.create = createShorthandFactory<TableCellProps>(TableCell, (content) => ({ content }));

/** Shorthand accepted as a row value in {@link Table} `rows`. */
export type TableCellShorthand = Shorthand<TableCellProps>;

export interface TableColumn {
  /** Row-object key to read. */
  key: string;
  /** Header label. */
  label: ReactNode;
  /** Right-align + tabular nums + mono for the column's cells. */
  numeric?: boolean;
  /** Render the column's cells in mono. */
  mono?: boolean;
}

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  columns: TableColumn[];
  /** Row objects keyed by column `key`; each value is {@link TableCellShorthand}. */
  rows: Record<string, TableCellShorthand>[];
  /** Denser paddings. @default false */
  compact?: boolean;
}

/**
 * Corpo data table — mono uppercase headers, hairline rows, status dots.
 * Row values take cell shorthand: bare content, `{ content, status, numeric }`
 * to add a status dot or override the column defaults, or a `<Table.Cell>`
 * element for full control.
 */
export function Table({ columns, rows, compact = false, className, ...rest }: TableProps) {
  return (
    <div className={cn('cp-table', compact && 'cp-table--compact', className)} {...rest}>
      <table className="cp-table__table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} data-numeric={c.numeric || undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {columns.map((c) => {
                // Nil/boolean shorthand renders nothing — coalesce to an empty
                // cell so columns stay aligned.
                const raw = row[c.key];
                const cell = raw == null || typeof raw === 'boolean' ? { content: null } : raw;
                return TableCell.create(cell, {
                  key: c.key,
                  defaultProps: { numeric: c.numeric, mono: c.mono },
                });
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Table.Cell = TableCell;
