import { isValidElement, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { FocusEvent, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Input } from './Input';
import { TableCell } from './Table';
import type { TableCellShorthand, TableColumn } from './Table';

export interface DataTableColumn extends TableColumn {
  /** Header click sorts this column (numeric-aware, asc → desc → cleared). @default false */
  sortable?: boolean;
  /**
   * Footer cell for this column, computed from the rows currently shown
   * (after filtering) — totals follow the quick filter. Any column with a
   * `summary` adds a `<tfoot>` row; it sticks to the bottom of a `grid`.
   */
  summary?: (rows: DataTableRow[]) => TableCellShorthand;
  /** Width in px. Set on any column, the table lays out at fixed widths (others share the rest). */
  width?: number;
  /**
   * With `grid` and `onCellEdit`: the column's cells can be edited in place —
   * `true`, or a predicate for per-row (per-cell) editability.
   */
  editable?: boolean | ((row: DataTableRow) => boolean);
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
  /**
   * Child rows — makes the table a tree (chart of accounts, bill of
   * materials). The first column gets an expand toggle; sorting orders
   * siblings, and the quick filter keeps the ancestors of matching rows.
   */
  children?: DataTableRow[];
}

export interface DataTableProps extends HTMLAttributes<HTMLDivElement> {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  /** Denser paddings. @default false */
  compact?: boolean;
  /**
   * Dense spreadsheet-like grid: full gridlines, ~28px rows, sticky header.
   * The table scrolls inside itself — bound its height for the header to stick.
   * @default false
   */
  grid?: boolean;
  /** Zebra rows. Requires `grid`. @default false */
  striped?: boolean;
  /** Keep the first data column (and the selection column) visible while scrolling sideways. Requires `grid`. @default false */
  pinFirstColumn?: boolean;
  /** Toolbar quick-filter across all columns' raw values. @default false */
  searchable?: boolean;
  /** More toolbar controls beside the quick filter — typically a {@link FilterBar}. */
  toolbar?: ReactNode;
  /** Render a selection checkbox column; requires `onSelectedChange`. @default false */
  selectable?: boolean;
  /** Selected row ids (controlled). */
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /**
   * Actions for the selected rows (buttons that read the caller's own
   * `selected`). While any row is selected, a bar under the table shows the
   * count, these actions, and a clear-selection button.
   */
  bulkActions?: ReactNode;
  /**
   * With `grid`: Enter on a body cell that holds no link or button (or Space,
   * when not `selectable`) activates its row — open the record, say.
   */
  onRowActivate?: (id: string) => void;
  /** Tree rows (`children`) expanded on first render. */
  defaultExpanded?: string[];
  /**
   * Shows a resize handle on each header; called with the column's new width
   * (px). Widths are the caller's — store them in `columns[].width`.
   */
  onColumnResize?: (key: string, width: number) => void;
  /**
   * Commits an in-place edit (`grid` + `columns[].editable`): Enter, F2, typing
   * or a double-click edits the active cell; Enter / Tab commit and move,
   * Escape cancels, Delete clears. The page updates its rows.
   */
  onCellEdit?: (rowId: string, key: string, value: string) => void;
  /** Number the rows in a row-header column, spreadsheet style. @default false */
  rowNumbers?: boolean;
  /**
   * With `grid` and a bounded height: render only the rows in view, for
   * thousands of rows. Keyboard navigation, ranges and editing still cover
   * every row; copy uses raw `values` for rows out of view. @default false
   */
  virtualize?: boolean;
}

const ROW_HEIGHT = 29;

const MIN_COLUMN_WIDTH = 56;
const RESIZE_STEP = 16;

/** A row as rendered: rows flattened depth-first through the expanded parents. */
interface ShownRow {
  row: DataTableRow;
  level: number;
  parentId?: string;
  expandable: boolean;
  expanded: boolean;
}

const INTERACTIVE = 'a[href], button, input, select, textarea, [role="separator"]';

const isEditor = (target: EventTarget | null) =>
  target instanceof Element && target.classList.contains('cp-table__editor');

/** The grid position of the cell an event happened in. */
function cellAt(target: EventTarget | null) {
  const cell = target instanceof Element ? target.closest('td, th') : null;
  const row = cell?.parentElement;
  // Rows carry their grid index in data-row: a virtualized body renders only a window of them.
  return cell instanceof HTMLTableCellElement && row instanceof HTMLTableRowElement && row.dataset.row
    ? { row: Number(row.dataset.row), col: cell.cellIndex }
    : null;
}

/** Extra props for a tree row's first cell: indent depth (CSS reads `data-level`) and the toggle. */
interface TreeCellProps {
  className: string;
  'data-level': number;
  children: ReactNode;
}

/** Where a key moves the active cell, or null when the grid doesn't handle it. */
function nextCell(
  e: KeyboardEvent,
  at: { row: number; col: number },
  size: { rows: number; cols: number; page: number },
) {
  const ctrl = e.ctrlKey || e.metaKey;
  switch (e.key) {
    case 'ArrowUp':
      return { row: at.row - 1, col: at.col };
    case 'ArrowDown':
      return { row: at.row + 1, col: at.col };
    case 'ArrowLeft':
      return { row: at.row, col: at.col - 1 };
    case 'ArrowRight':
      return { row: at.row, col: at.col + 1 };
    case 'Home':
      return { row: ctrl ? 0 : at.row, col: 0 };
    case 'End':
      return { row: ctrl ? size.rows - 1 : at.row, col: size.cols - 1 };
    case 'PageUp':
      return { row: at.row - size.page, col: at.col };
    case 'PageDown':
      return { row: at.row + size.page, col: at.col };
    default:
      return null;
  }
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

/** Sum of a column's numeric raw values (explicit `values` first, then bare numeric cells). */
export function sumColumn(rows: DataTableRow[], key: string): number {
  let total = 0;
  for (const row of rows) {
    const v = rawValue(row, key);
    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- raw values are string | number by contract
    if (typeof v === 'number' && !Number.isNaN(v)) total += v;
  }
  return total;
}

/**
 * Corpo data table — the interactive layer over {@link Table}'s chassis:
 * click-to-sort headers (on raw values, never rendered strings), a toolbar
 * quick filter, and a controlled selection column. Sort and filter state are
 * internal; selection is the caller's (`selected` + `onSelectedChange`), and
 * `bulkActions` puts batch actions in a bar while rows are selected. Column
 * `summary` functions add a totals row over the filtered rows.
 */
export function DataTable({
  columns,
  rows,
  compact = false,
  grid = false,
  striped = false,
  pinFirstColumn = false,
  searchable = false,
  toolbar,
  selectable = false,
  selected = [],
  onSelectedChange,
  bulkActions,
  onRowActivate,
  defaultExpanded = [],
  onColumnResize,
  onCellEdit,
  rowNumbers = false,
  virtualize = false,
  className,
  ...rest
}: DataTableProps) {
  const [sort, setSort] = useState<SortState>(null);
  const [query, setQuery] = useState('');
  // Grid mode: the one cell in the tab order. Row 0 is the header; the footer, if any, is last.
  const [active, setActive] = useState({ row: 0, col: 0 });
  const tableRef = useRef<HTMLTableElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cellEl = (row: number, col: number) =>
    tableRef.current?.querySelector<HTMLTableRowElement>(`tr[data-row="${row}"]`)?.cells[col];
  // A cell to focus once a virtualized row scrolls into the rendered window.
  const pendingFocus = useRef<{ row: number; col: number } | null>(null);
  // Range selection: the anchor cell; the range runs from it to the active cell. Null is a single cell.
  const [anchor, setAnchor] = useState<{ row: number; col: number } | null>(null);
  const dragging = useRef(false);
  const [copied, setCopied] = useState('');
  // In-place editing: the cell being edited and its draft; `seeded` when typing started the edit.
  const [editing, setEditing] = useState<{ row: number; col: number; draft: string; seeded: boolean } | null>(null);
  const closing = useRef(false);
  const base = useId();
  const fixedLayout = columns.some((c) => c.width != null);
  const resizeBy = (ci: number, delta: number, from?: number) => {
    const th = cellEl(0, ci + firstDataCol);
    const current = from ?? columns[ci].width ?? th?.getBoundingClientRect().width ?? MIN_COLUMN_WIDTH;
    onColumnResize?.(columns[ci].key, Math.max(MIN_COLUMN_WIDTH, Math.round(current + delta)));
  };
  const [expanded, setExpanded] = useState(() => new Set(defaultExpanded));
  const isTree = rows.some((r) => (r.children?.length ?? 0) > 0);
  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (row: DataTableRow): boolean =>
      columns.some((c) =>
        String(rawValue(row, c.key) ?? '')
          .toLowerCase()
          .includes(q),
      ) || (row.children ?? []).some(matches);
    const dir = sort?.dir === 'asc' ? 1 : -1;
    const out: ShownRow[] = [];
    const walk = (list: DataTableRow[], level: number, parentId?: string) => {
      const ordered = sort
        ? [...list].sort((a, b) => dir * compareValues(rawValue(a, sort.key), rawValue(b, sort.key)))
        : list;
      for (const row of ordered) {
        if (q && !matches(row)) continue;
        const expandable = (row.children?.length ?? 0) > 0;
        // While filtering, parents open to show the matches beneath them.
        const open = expandable && (q !== '' || expanded.has(row.id));
        out.push({ row, level, parentId, expandable, expanded: open });
        if (open) walk(row.children ?? [], level + 1, row.id);
      }
    };
    walk(rows, 1);
    return out;
  }, [rows, columns, query, sort, expanded]);
  const visible = shown.map((s) => s.row);
  const countRows = (list: DataTableRow[]): number => list.reduce((n, r) => n + 1 + countRows(r.children ?? []), 0);
  const total = countRows(rows);
  // Totals sum the top level only — in a tree, parents already roll up their children.
  const summaryRows = shown.filter((s) => s.level === 1).map((s) => s.row);

  const cycleSort = (key: string) =>
    setSort((prev) => (prev?.key !== key ? { key, dir: 'asc' } : prev.dir === 'asc' ? { key, dir: 'desc' } : null));

  const selectedSet = new Set(selected);
  const allVisibleSelected = visible.length > 0 && visible.every((r) => selectedSet.has(r.id));
  const someVisibleSelected = visible.some((r) => selectedSet.has(r.id));
  const toggleAll = () =>
    onSelectedChange?.(
      allVisibleSelected
        ? selected.filter((id) => !visible.some((r) => r.id === id))
        : [...new Set([...selected, ...visible.map((r) => r.id)])],
    );
  const hasSummary = columns.some((c) => c.summary);
  const toggleRow = (id: string) =>
    onSelectedChange?.(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  const rowCount = 1 + visible.length + (hasSummary ? 1 : 0);
  const numberCol = selectable ? 1 : 0;
  const firstDataCol = numberCol + (rowNumbers ? 1 : 0);
  const colCount = firstDataCol + columns.length;
  const at = { row: Math.min(active.row, rowCount - 1), col: Math.min(active.col, colCount - 1) };

  // oxlint-disable-next-line react/incompatible-library -- TanStack Virtual returns fresh functions each render; DataTable isn't compiler-memoized, so nothing goes stale
  const virtualizer = useVirtualizer({
    count: virtualize ? shown.length : 0,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });
  const windowed = virtualize ? virtualizer.getVirtualItems() : null;
  const bodyRows = windowed ? windowed.map((item) => item.index) : shown.map((_, i) => i);
  const padTop = windowed?.[0]?.start ?? 0;
  const padBottom = windowed?.length ? virtualizer.getTotalSize() - windowed[windowed.length - 1].end : 0;

  /** Focus a cell; a body row outside a virtualized window scrolls in first and is focused after render. */
  const focusCell = (row: number, col: number) => {
    const el = cellEl(row, col);
    if (el) {
      el.focus();
      return;
    }
    if (virtualize && row >= 1 && row <= visible.length) {
      pendingFocus.current = { row, col };
      virtualizer.scrollToIndex(row - 1, { align: 'auto' });
    }
  };
  useEffect(() => {
    const want = pendingFocus.current;
    const el = want && cellEl(want.row, want.col);
    if (!want || !el) return;
    pendingFocus.current = null;
    el.focus();
  });
  const range = anchor && {
    top: Math.min(anchor.row, at.row),
    bottom: Math.max(anchor.row, at.row),
    left: Math.min(anchor.col, at.col),
    right: Math.max(anchor.col, at.col),
  };
  const inRange = (row: number, col: number) =>
    range != null && row >= range.top && row <= range.bottom && col >= range.left && col <= range.right;
  const cellTab = (row: number, col: number) =>
    grid
      ? { tabIndex: row === at.row && col === at.col ? 0 : -1, 'aria-selected': inRange(row, col) || undefined }
      : {};

  const moveTo = (row: number, col: number, extend: boolean) => {
    if (extend) setAnchor((prev) => prev ?? at);
    else setAnchor(null);
    setActive({ row, col });
    focusCell(row, col);
  };

  const editTarget = (row: number, col: number) => {
    const bodyRow = row >= 1 && row <= visible.length ? visible[row - 1] : undefined;
    const column = columns[col - firstDataCol];
    const editable = column?.editable;
    if (!bodyRow || !column || !onCellEdit || editable === undefined || editable === false) return null;
    return editable === true || editable(bodyRow) ? { row: bodyRow, column } : null;
  };
  const startEdit = (row: number, col: number, seed?: string) => {
    const target = editTarget(row, col);
    if (!target) return false;
    closing.current = false;
    setAnchor(null);
    setEditing({
      row,
      col,
      draft: seed ?? String(rawValue(target.row, target.column.key) ?? ''),
      seeded: seed != null,
    });
    return true;
  };
  /** Ends the edit — committing the draft unless cancelled — and moves the active cell. */
  const finishEdit = (commit: boolean, move: 'down' | 'right' | 'left' | null) => {
    if (!editing) return;
    closing.current = true;
    const target = editTarget(editing.row, editing.col);
    if (commit && target && editing.draft !== String(rawValue(target.row, target.column.key) ?? '')) {
      onCellEdit?.(target.row.id, target.column.key, editing.draft);
    }
    const row = move === 'down' ? Math.min(visible.length, editing.row + 1) : editing.row;
    const col =
      move === 'right'
        ? Math.min(colCount - 1, editing.col + 1)
        : move === 'left'
          ? Math.max(firstDataCol, editing.col - 1)
          : editing.col;
    setEditing(null);
    setActive({ row, col });
    focusCell(row, col);
  };

  /** The range (or the active cell) as tab-separated text: raw values for body cells, text elsewhere. */
  const copyRange = () => {
    const table = tableRef.current;
    if (!table) return;
    const b = range ?? { top: at.row, bottom: at.row, left: at.col, right: at.col };
    const lines: string[] = [];
    for (let r = b.top; r <= b.bottom; r++) {
      const cells: string[] = [];
      for (let c = Math.max(b.left, firstDataCol); c <= b.right; c++) {
        const bodyRow = visible[r - 1];
        const column = columns[c - firstDataCol];
        const raw = bodyRow && column && r <= visible.length ? rawValue(bodyRow, column.key) : undefined;
        cells.push(String(raw ?? cellEl(r, c)?.textContent?.trim() ?? ''));
      }
      lines.push(cells.join('\t'));
    }
    const rows = b.bottom - b.top + 1;
    const cols = b.right - Math.max(b.left, firstDataCol) + 1;
    navigator.clipboard?.writeText(lines.join('\n')).then(
      () => setCopied(`Copied ${rows} ${rows === 1 ? 'row' : 'rows'} × ${cols} ${cols === 1 ? 'column' : 'columns'}`),
      () => setCopied("Couldn't copy — the browser blocked clipboard access"),
    );
  };

  // Grid mode keeps one tab stop: links and buttons inside cells leave the tab order and are reached
  // through their cell (Enter clicks them).
  useEffect(() => {
    if (!grid) return;
    tableRef.current?.querySelectorAll<HTMLElement>(INTERACTIVE).forEach((el) => {
      el.tabIndex = -1;
    });
  });

  const onGridKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    const table = tableRef.current;
    const cell = cellEl(at.row, at.col);
    if (!table || !cell) return;
    const rowHeight = cell.getBoundingClientRect().height || 28;
    const scroller = table.parentElement;
    const page = Math.max(1, Math.floor((scroller?.clientHeight ?? 0) / rowHeight) - 1);
    const treeRow = isTree && at.col === firstDataCol ? shown[at.row - 1] : undefined;
    if (treeRow && e.key === 'ArrowRight' && treeRow.expandable && !treeRow.expanded) {
      e.preventDefault();
      toggleExpanded(treeRow.row.id);
      return;
    }
    if (treeRow && e.key === 'ArrowLeft' && (treeRow.expanded || treeRow.parentId)) {
      e.preventDefault();
      if (treeRow.expanded) {
        toggleExpanded(treeRow.row.id);
        return;
      }
      const parent = shown.findIndex((s) => s.row.id === treeRow.parentId) + 1;
      moveTo(parent, at.col, false);
      return;
    }
    const ctrlKey = e.ctrlKey || e.metaKey;
    if (editTarget(at.row, at.col) && e.target === cell) {
      if (e.key === 'Enter' || e.key === 'F2') {
        e.preventDefault();
        startEdit(at.row, at.col);
        return;
      }
      if (e.key === 'Delete') {
        e.preventDefault();
        const target = editTarget(at.row, at.col);
        if (target) onCellEdit?.(target.row.id, target.column.key, '');
        return;
      }
      if (e.key.length === 1 && !ctrlKey && !e.altKey) {
        e.preventDefault();
        startEdit(at.row, at.col, e.key);
        return;
      }
    }
    // Alt+ArrowLeft/Right on a header resizes its column (its handle is out of the tab order).
    if (
      onColumnResize &&
      at.row === 0 &&
      at.col >= firstDataCol &&
      e.altKey &&
      (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
    ) {
      e.preventDefault();
      resizeBy(at.col - firstDataCol, e.key === 'ArrowRight' ? RESIZE_STEP : -RESIZE_STEP);
      return;
    }
    const ctrl = ctrlKey;
    if (ctrl && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      copyRange();
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'a' && visible.length > 0) {
      e.preventDefault();
      setAnchor({ row: 1, col: firstDataCol });
      setActive({ row: visible.length, col: colCount - 1 });
      focusCell(visible.length, colCount - 1);
      return;
    }
    if (e.key === 'Escape' && anchor) {
      e.preventDefault();
      setAnchor(null);
      return;
    }
    const next = nextCell(e, at, { rows: rowCount, cols: colCount, page });
    if (next) {
      e.preventDefault();
      moveTo(Math.min(rowCount - 1, Math.max(0, next.row)), Math.min(colCount - 1, Math.max(0, next.col)), e.shiftKey);
      return;
    }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target !== cell) return; // a widget inside the cell has focus and handles its own keys
    const bodyRow = visible[at.row - 1];
    const widget = cell.querySelector<HTMLElement>(INTERACTIVE);
    e.preventDefault();
    if (e.key === ' ' && selectable && bodyRow) toggleRow(bodyRow.id);
    else if (widget) widget.click();
    else if (bodyRow) onRowActivate?.(bodyRow.id);
  };

  return (
    <div className={cn('cp-datatable', grid && 'cp-datatable--grid', className)} {...rest}>
      {(searchable || toolbar != null) && (
        <div className="cp-datatable__toolbar">
          {searchable && (
            <Input
              size="sm"
              type="search"
              placeholder="Filter…"
              aria-label="Filter rows"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
          {toolbar}
          {query && (
            <span className="cp-datatable__count">
              {visible.length}/{total}
            </span>
          )}
        </div>
      )}
      <div
        ref={scrollerRef}
        className={cn(
          'cp-table',
          compact && 'cp-table--compact',
          grid && 'cp-table--grid',
          grid && striped && 'cp-table--striped',
          grid && pinFirstColumn && 'cp-table--pin-first',
        )}
      >
        <table
          ref={tableRef}
          className={cn('cp-table__table', fixedLayout && 'cp-table__table--fixed')}
          {...(grid && {
            role: isTree ? 'treegrid' : 'grid',
            'aria-multiselectable': true,
            'aria-rowcount': virtualize ? rowCount : undefined,
            onKeyDown: onGridKeyDown,
            // Clicking (or tabbing into) a cell makes it the active one.
            onFocus: (e: FocusEvent<HTMLTableElement>) => {
              const pos = cellAt(e.target);
              if (pos) setActive(pos);
            },
            // Pointer ranges: press starts one (Shift extends from the anchor), dragging grows it.
            onMouseDown: (e: MouseEvent<HTMLTableElement>) => {
              const pos = cellAt(e.target);
              if (!pos || e.button !== 0 || isEditor(e.target)) return;
              if (e.shiftKey) {
                e.preventDefault();
                moveTo(pos.row, pos.col, true);
                return;
              }
              setAnchor(pos);
              dragging.current = true;
            },
            onMouseMove: (e: MouseEvent<HTMLTableElement>) => {
              const pos = cellAt(e.target);
              if (!dragging.current || !pos || (pos.row === at.row && pos.col === at.col)) return;
              setActive(pos);
            },
            onDoubleClick: (e: MouseEvent<HTMLTableElement>) => {
              const pos = cellAt(e.target);
              if (pos && !isEditor(e.target)) startEdit(pos.row, pos.col);
            },
            onMouseUp: () => {
              dragging.current = false;
              if (anchor && anchor.row === at.row && anchor.col === at.col) setAnchor(null);
            },
          })}
        >
          {fixedLayout && (
            <colgroup>
              {selectable && <col className="cp-table__col-check" />}
              {rowNumbers && <col className="cp-table__col-rownum" />}
              {columns.map((c) => (
                <col key={c.key} style={c.width != null ? { width: c.width } : undefined} />
              ))}
            </colgroup>
          )}
          <thead>
            <tr data-row={0} aria-rowindex={virtualize ? 1 : undefined}>
              {selectable && (
                <th className="cp-table__check" {...cellTab(0, 0)}>
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
              {rowNumbers && <th className="cp-table__row-head" {...cellTab(0, numberCol)} />}
              {columns.map((c, ci) => (
                <th
                  key={c.key}
                  {...cellTab(0, ci + firstDataCol)}
                  data-numeric={c.numeric || undefined}
                  className={cn(onColumnResize && 'cp-table__th--resizable')}
                  aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {c.sortable ? (
                    <button type="button" className="cp-table__sort" onClick={() => cycleSort(c.key)}>
                      <span id={`${base}-col-${ci}`}>{c.label}</span>
                      <span className="cp-table__sort-icon" aria-hidden="true">
                        {sort?.key === c.key ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  ) : (
                    <span id={`${base}-col-${ci}`}>{c.label}</span>
                  )}
                  {onColumnResize && (
                    <ColumnResizeHandle
                      inGrid={grid}
                      labelledBy={`${base}-col-${ci}`}
                      width={c.width}
                      onKeyStep={(delta) => resizeBy(ci, delta)}
                      onDrag={(delta, startWidth) => resizeBy(ci, delta, startWidth)}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {padTop > 0 && <tr className="cp-table__spacer" aria-hidden="true" style={{ height: padTop }} />}
            {bodyRows.map((ri) => {
              const { row, level, expandable, expanded: open } = shown[ri];
              return (
                <tr
                  key={row.id}
                  data-row={ri + 1}
                  data-index={ri}
                  ref={virtualize ? virtualizer.measureElement : undefined}
                  aria-rowindex={virtualize ? ri + 2 : undefined}
                  className={cn(selectedSet.has(row.id) && 'cp-table__row--selected')}
                  {...(grid && isTree && { 'aria-level': level, 'aria-expanded': expandable ? open : undefined })}
                >
                  {selectable && (
                    <td className="cp-table__check" {...cellTab(ri + 1, 0)}>
                      <Checkbox
                        aria-label={`Select row ${row.id}`}
                        checked={selectedSet.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                      />
                    </td>
                  )}
                  {rowNumbers && (
                    <th
                      scope="row"
                      id={`${base}-row-${ri}`}
                      className="cp-table__row-head"
                      {...cellTab(ri + 1, numberCol)}
                    >
                      {ri + 1}
                    </th>
                  )}
                  {columns.map((c, ci) => {
                    const raw = row.cells[c.key];
                    const cell = raw == null || raw === true || raw === false ? { content: null } : raw;
                    const treeCell: TreeCellProps | undefined =
                      isTree && ci === 0
                        ? {
                            className: 'cp-table__tree-cell',
                            'data-level': Math.min(level, 6),
                            children: expandable && (
                              <button
                                type="button"
                                className="cp-table__tree-toggle"
                                aria-label={`${open ? 'Collapse' : 'Expand'} row ${row.id}`}
                                aria-expanded={open}
                                onClick={() => toggleExpanded(row.id)}
                              >
                                <span aria-hidden="true">›</span>
                              </button>
                            ),
                          }
                        : undefined;
                    const isEditing = editing?.row === ri + 1 && editing.col === ci + firstDataCol;
                    return TableCell.create(cell, {
                      key: c.key,
                      defaultProps: { numeric: c.numeric, mono: c.mono },
                      overrideProps: {
                        ...treeCell,
                        ...cellTab(ri + 1, ci + firstDataCol),
                        ...(isEditing && {
                          className: cn(treeCell?.className, 'cp-table__cell--editing'),
                          content: (
                            <input
                              className="cp-table__editor"
                              aria-labelledby={rowNumbers ? `${base}-col-${ci} ${base}-row-${ri}` : `${base}-col-${ci}`}
                              value={editing.draft}
                              ref={(el) => {
                                // Focus once on mount: select the value, or keep the caret after a typed seed.
                                if (!el || document.activeElement === el) return;
                                el.focus();
                                if (!editing.seeded) el.select();
                              }}
                              onChange={(e) => setEditing({ ...editing, draft: e.target.value })}
                              onKeyDown={(e) => {
                                // The editor owns its keys: arrows move the caret, Ctrl+A/C act on the text.
                                e.stopPropagation();
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  finishEdit(true, 'down');
                                } else if (e.key === 'Tab') {
                                  e.preventDefault();
                                  finishEdit(true, e.shiftKey ? 'left' : 'right');
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  finishEdit(false, null);
                                }
                              }}
                              onBlur={() => {
                                if (!closing.current) finishEdit(true, null);
                              }}
                            />
                          ),
                        }),
                      },
                    });
                  })}
                </tr>
              );
            })}
            {padBottom > 0 && <tr className="cp-table__spacer" aria-hidden="true" style={{ height: padBottom }} />}
          </tbody>
          {hasSummary && (
            <tfoot>
              <tr data-row={rowCount - 1} aria-rowindex={virtualize ? rowCount : undefined}>
                {selectable && <td className="cp-table__check" {...cellTab(rowCount - 1, 0)} />}
                {rowNumbers && <td className="cp-table__row-head" {...cellTab(rowCount - 1, numberCol)} />}
                {columns.map((c, ci) => {
                  const raw = c.summary?.(summaryRows);
                  const cell = raw == null || raw === true || raw === false ? { content: null } : raw;
                  return TableCell.create(cell, {
                    key: c.key,
                    defaultProps: { numeric: c.numeric, mono: c.mono },
                    overrideProps: cellTab(rowCount - 1, ci + firstDataCol),
                  });
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {grid && (
        <span className="cp-datatable__status" role="status">
          {copied}
        </span>
      )}
      {bulkActions != null && selected.length > 0 && (
        <div className="cp-datatable__bulk" role="region" aria-label="Bulk actions">
          <span className="cp-datatable__bulk-count">{selected.length} selected</span>
          {bulkActions}
          <Button size="sm" variant="ghost" onClick={() => onSelectedChange?.([])}>
            Clear selection
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * A column's resize handle: drag it, or focus it and use ArrowLeft/ArrowRight
 * (in grid mode it leaves the tab order — Alt+arrows on the header instead).
 */
function ColumnResizeHandle({
  inGrid,
  labelledBy,
  width,
  onKeyStep,
  onDrag,
}: {
  inGrid: boolean;
  labelledBy: string;
  width?: number;
  onKeyStep: (delta: number) => void;
  onDrag: (delta: number, startWidth: number) => void;
}) {
  const start = useRef<{ x: number; width: number } | null>(null);
  const node = useRef<HTMLSpanElement>(null);
  const [dragging, setDragging] = useState(false);
  // A focusable separator needs a value; a column without an explicit width reports its laid-out width.
  useLayoutEffect(() => {
    const el = node.current;
    const w = width ?? Math.round(el?.parentElement?.getBoundingClientRect().width ?? 0);
    el?.setAttribute('aria-valuenow', String(w));
    el?.setAttribute('aria-valuetext', `${w} pixels wide`);
  });
  return (
    <span
      ref={node}
      role="separator"
      tabIndex={inGrid ? -1 : 0}
      aria-orientation="vertical"
      aria-labelledby={labelledBy}
      aria-valuemin={MIN_COLUMN_WIDTH}
      className="cp-table__resize"
      data-dragging={dragging || undefined}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        e.stopPropagation();
        onKeyStep(e.key === 'ArrowRight' ? RESIZE_STEP : -RESIZE_STEP);
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const th = e.currentTarget.parentElement;
        start.current = { x: e.clientX, width: th?.getBoundingClientRect().width ?? MIN_COLUMN_WIDTH };
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      }}
      onPointerMove={(e) => {
        if (start.current) onDrag(e.clientX - start.current.x, start.current.width);
      }}
      onPointerUp={() => {
        start.current = null;
        setDragging(false);
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
