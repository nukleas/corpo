import type { HTMLAttributes } from 'react';

export interface TableColumn {
  key: string;
  label: string;
  numeric?: boolean;
  mono?: boolean;
}

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
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

export function Table({ columns, rows, compact = false, className = '', ...rest }: TableProps) {
  return (
    <div className={cx('cp-table', compact && 'cp-table--compact', className)} {...rest}>
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
