import { isValidElement, useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Checkbox } from './Checkbox';
import { Input } from './Input';
import { TableCell } from './Table';
import type { TableCellShorthand, TableColumn } from './Table';

export interface DataTableColumn extends TableColumn {
  /** Header click sorts this column (numeric-aware, asc → desc → cleared). @default false */
  sortable?: boolean;
}

export interface DataTableRow {
  /** Stable row identity — selection and React keys hang off it. */
  id: string;
  /** Cells keyed by column `key`, same shorthand as {@link TableCell}. */
  cells: Record<string, TableCellShorthand>;
  /**
   * Raw values for sorting/filtering where a cell's shorthand isn't a bare
   * primitive (formatted amounts, status cells, elements). Sorting never
   * parses rendered strings.
   */
  values?: Record<string, string | number>;
}

export interface DataTableProps extends HTMLAttributes<HTMLDivElement> {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  /** Denser paddings. @default false */
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

/** Raw sort/filter value for one cell: explicit `values` entry, else the shorthand primitive. */
function rawValue(row: DataTableRow, key: string): string | number | undefined {
  const explicit = row.values?.[key];
  if (explicit !== undefined) return explicit;
  const cell = row.cells[key];
  if (cell == null || cell === true || cell === false || isValidElement(cell)) return undefined;
  // SAFETY: shorthand-shape classification — elements and nil/boolean are
  // excluded above, so a remaining object is a cell props object.
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- boundary shape classification (see above)
  if (typeof cell === 'object') {
    const content = cell.content;
    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- boundary shape classification (see above)
    return typeof content === 'string' || typeof content === 'number' ? content : undefined;
  }
  return cell;
}

function compareValues(a: string | number | undefined, b: string | number | undefined): number {
  // Missing values (and NaN, which would poison the comparator) sort last.
  const aMissing = a === undefined || Number.isNaN(a);
  const bMissing = b === undefined || Number.isNaN(b);
  if (aMissing) return bMissing ? 0 : 1;
  if (bMissing) return -1;
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- numeric vs lexicographic comparison branch
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'en', { numeric: true, sensitivity: 'base' });
}

/**
 * Corpo data table — the interactive layer over {@link Table}'s chassis:
 * click-to-sort headers (on raw values, never rendered strings), a toolbar
 * quick filter, and a controlled selection column. Sort and filter state are
 * internal; selection is the caller's (`selected` + `onSelectedChange`), so
 * batch actions can live wherever the page puts them.
 */
export function DataTable({
  columns,
  rows,
  compact = false,
  searchable = false,
  selectable = false,
  selected = [],
  onSelectedChange,
  className,
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
  const someVisibleSelected = visible.some((r) => selectedSet.has(r.id));
  const toggleAll = () =>
    onSelectedChange?.(
      allVisibleSelected
        ? selected.filter((id) => !visible.some((r) => r.id === id))
        : [...new Set([...selected, ...visible.map((r) => r.id)])],
    );
  const toggleRow = (id: string) =>
    onSelectedChange?.(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  return (
    <div className={cn('cp-datatable', className)} {...rest}>
      {searchable && (
        <div className="cp-datatable__toolbar">
          <Input
            size="sm"
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
      <div className={cn('cp-table', compact && 'cp-table--compact')}>
        <table className="cp-table__table">
          <thead>
            <tr>
              {selectable && (
                <th className="cp-table__check">
                  <Checkbox
                    aria-label="Select all rows"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected;
                    }}
                    onChange={toggleAll}
                  />
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
              <tr key={row.id} className={cn(selectedSet.has(row.id) && 'cp-table__row--selected')}>
                {selectable && (
                  <td className="cp-table__check">
                    <Checkbox
                      aria-label={`Select row ${row.id}`}
                      checked={selectedSet.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                )}
                {columns.map((c) => {
                  const raw = row.cells[c.key];
                  const cell = raw == null || raw === true || raw === false ? { content: null } : raw;
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
    </div>
  );
}
