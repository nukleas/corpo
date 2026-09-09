import { isValidElement, useMemo, useState } from 'react';
import type { HTMLAttributes, ReactElement } from 'react';
import { cx } from './cx';
import type { TableCellProps, TableCellShorthand, TableColumn } from './Table';

export interface DataTableColumn extends TableColumn {
  /** Header click sorts this column (numeric-aware, asc → desc → cleared). @default false */
  sortable?: boolean;
}

export interface DataTableRow {
  /** Stable row identity — selection and React keys hang off it. */
  id: string;
  /** Cells keyed by column `key`. */
  cells: Record<string, TableCellShorthand>;
  /** Raw values for sorting/filtering where a cell's shorthand isn't a bare primitive. */
  values?: Record<string, string | number>;
}

export interface DataTableProps extends HTMLAttributes<HTMLDivElement> {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  compact?: boolean;
  /** Toolbar quick-filter across all columns' raw values. @default false */
  searchable?: boolean;
  /** Render a selection checkbox column; requires `onSelectedChange`. @default false */
  selectable?: boolean;
  /** Selected row ids (controlled). */
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null;

function rawValue(row: DataTableRow, key: string): string | number | undefined {
  const explicit = row.values?.[key];
  if (explicit !== undefined) return explicit;
  const cell = row.cells[key];
  if (cell == null || isValidElement(cell)) return undefined;
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- boundary shape classification (see SAFETY below)
  if (typeof cell === 'object') {
    // SAFETY: shorthand-shape classification — element and nil cases are
    // excluded above, so a remaining object is a cell props object.
    const content = (cell as TableCellProps).content;
    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- boundary shape classification (see above)
    return typeof content === 'string' || typeof content === 'number' ? content : undefined;
  }
  return cell;
}

function compareValues(a: string | number | undefined, b: string | number | undefined): number {
  if (a === undefined) return b === undefined ? 0 : 1;
  if (b === undefined) return -1;
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- numeric vs lexicographic comparison branch
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'en', { numeric: true, sensitivity: 'base' });
}

/** Sorting/filtering/selection layer over the cp-table chassis. */
export function DataTable({
  columns,
  rows,
  compact = false,
  searchable = false,
  selectable = false,
  selected = [],
  onSelectedChange,
  className = '',
  ...rest
}: DataTableProps) {
  const [sort, setSort] = useState<SortState>(null);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    let out = rows;
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter((row) =>
        columns.some((c) => String(rawValue(row, c.key) ?? '').toLowerCase().includes(q)),
      );
    }
    if (sort) {
      const dir = sort.dir === 'asc' ? 1 : -1;
      out = [...out].sort((a, b) => dir * compareValues(rawValue(a, sort.key), rawValue(b, sort.key)));
    }
    return out;
  }, [rows, columns, query, sort]);

  const cycleSort = (key: string) =>
    setSort((prev) =>
      prev?.key !== key ? { key, dir: 'asc' }
        : prev.dir === 'asc' ? { key, dir: 'desc' }
          : null,
    );

  const selectedSet = new Set(selected);
  const allVisibleSelected = visible.length > 0 && visible.every((r) => selectedSet.has(r.id));
  const toggleAll = () =>
    onSelectedChange?.(
      allVisibleSelected
        ? selected.filter((id) => !visible.some((r) => r.id === id))
        : [...new Set([...selected, ...visible.map((r) => r.id)])],
    );
  const toggleRow = (id: string) =>
    onSelectedChange?.(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  function renderCell(raw: TableCellShorthand, col: TableColumn): ReactElement {
    // SAFETY: cell-shorthand boundary parser — nil and element cases are
    // excluded first, so a remaining object is by contract a props object.
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
    <div className={cx('cp-datatable', className)} {...rest}>
      {searchable && (
        <div className="cp-datatable__toolbar">
          <input
            className="cp-input cp-input--sm"
            type="search"
            placeholder="Filter…"
            aria-label="Filter rows"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <span className="cp-datatable__count">
              {visible.length}/{rows.length}
            </span>
          )}
        </div>
      )}
      <div className={cx('cp-table', compact && 'cp-table--compact')}>
        <table className="cp-table__table">
          <thead>
            <tr>
              {selectable && (
                <th className="cp-table__check">
                  <label className="cp-checkbox">
                    <input
                      type="checkbox"
                      className="cp-checkbox__input"
                      aria-label="Select all rows"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                    />
                    <span className="cp-checkbox__box" aria-hidden="true" />
                  </label>
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  data-numeric={c.numeric || undefined}
                  aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {c.sortable ? (
                    <button type="button" className="cp-table__sort" onClick={() => cycleSort(c.key)}>
                      {c.label}
                      <span className="cp-table__sort-icon" aria-hidden="true">
                        {sort?.key === c.key ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className={selectedSet.has(row.id) ? 'cp-table__row--selected' : undefined}>
                {selectable && (
                  <td className="cp-table__check">
                    <label className="cp-checkbox">
                      <input
                        type="checkbox"
                        className="cp-checkbox__input"
                        aria-label={`Select row ${row.id}`}
                        checked={selectedSet.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                      />
                      <span className="cp-checkbox__box" aria-hidden="true" />
                    </label>
                  </td>
                )}
                {columns.map((c) => renderCell(row.cells[c.key], c))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
