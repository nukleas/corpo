import { isValidElement } from 'react';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

export type TableCellStatus = 'ok' | 'warn' | 'err' | 'idle';

export interface TableCellProps {
  /** Cell content. */
  content?: ReactNode;
  /** Status dot rendered before the content. */
  status?: TableCellStatus;
  /** Right-align + tabular nums + mono. Defaults from the column. */
  numeric?: boolean;
  /** Render in mono. Defaults from the column. */
  mono?: boolean;
}

/** Cell shorthand: bare content, a props object, or a ready element (rendered as the cell body). */
export type TableCellShorthand = string | number | TableCellProps | ReactElement | null | undefined;

export interface TableColumn {
  key: string;
  label: ReactNode;
  numeric?: boolean;
  mono?: boolean;
}

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  columns: TableColumn[];
  /** Row objects keyed by column `key`; each value is cell shorthand. */
  rows: Record<string, TableCellShorthand>[];
  compact?: boolean;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Table({ columns, rows, compact = false, className = '', ...rest }: TableProps) {
  function renderCell(raw: TableCellShorthand, col: TableColumn) {
    // SAFETY: cell-shorthand boundary parser — nil/boolean and element cases
    // are excluded first, so a remaining object is by contract a props object.
    const props: TableCellProps =
      raw == null ? {}
        : isValidElement(raw) ? { content: raw }
          : // oxlint-disable-next-line anti-slop/no-runtime-typeof -- boundary shape classification (see above)
            typeof raw === 'object' ? (raw as TableCellProps)
            : { content: raw };
    const numeric = props.numeric ?? col.numeric;
    const mono = props.mono ?? col.mono;
    return (
      <td key={col.key} data-numeric={numeric || undefined} data-mono={mono || numeric || undefined}>
        {props.status && (
          <span className={cx('cp-table__status', `cp-table__status--${props.status}`)} aria-hidden="true" />
        )}
        {props.content}
      </td>
    );
  }

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
            <tr key={ri}>{columns.map((c) => renderCell(row[c.key], c))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
