import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface TableColumn {
  /** Row-object key to read. */
  key: string;
  /** Header label. */
  label: string;
  /** Right-align + tabular nums + mono. */
  numeric?: boolean;
  /** Render the cell in mono. */
  mono?: boolean;
}

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  columns: TableColumn[];
  /** Row objects. `<key>Status: 'ok'|'warn'|'err'|'idle'` adds a status dot before that cell. */
  rows: Record<string, unknown>[];
  /** Denser paddings. @default false */
  compact?: boolean;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

const STATUS_CLASS: Record<string, string> = {
  ok: 'cp-table__status--ok',
  warn: 'cp-table__status--warn',
  err: 'cp-table__status--err',
  idle: 'cp-table__status--idle',
};

/** Corpo data table — mono uppercase headers, hairline rows, status dots. */
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
                const status = row[`${c.key}Status`] as string | undefined;
                return (
                  <td key={c.key} data-numeric={c.numeric || undefined} data-mono={c.mono || c.numeric || undefined}>
                    {status && <span className={cx('cp-table__status', STATUS_CLASS[status])} aria-hidden="true" />}
                    {row[c.key] as any}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
