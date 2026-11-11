import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';

export interface CommandItem {
  id: string;
  /** Searched text and visible name. */
  label: string;
  /** Second line — the client on an invoice, the path of a page. */
  description?: string;
  /** Extra search terms that are not shown, e.g. `['bill', 'AR']` for "Invoices". */
  keywords?: string[];
  /** Right-aligned hint, typically a {@link KbdGroup}. */
  shortcut?: ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
  /**
   * The items already match the query — server search results. They are shown
   * as-is; other groups are filtered locally by label, description and keywords.
   */
  filtered?: boolean;
}

export interface CommandProps {
  groups: CommandGroup[];
  /** Names the search input. @default 'Search commands' */
  label?: string;
  placeholder?: string;
  emptyText?: string;
  /** Fires on every keystroke — run a record search and pass the results back as a `filtered` group. */
  onQueryChange?: (query: string) => void;
  /** A search is in flight; announced in place of the empty text. */
  loading?: boolean;
  /** Fires after the item's own `onSelect` — route on `item.id`, or close a dialog. */
  onSelect?: (item: CommandItem) => void;
  /** Escape in the input. {@link CommandDialog} closes on it. */
  onEscape?: () => void;
  /** Focus the input on mount. @default true */
  autoFocus?: boolean;
}

const matches = (item: CommandItem, needle: string) =>
  [item.label, item.description ?? '', ...(item.keywords ?? [])].some((t) => t.toLowerCase().includes(needle));

/**
 * Corpo command palette — a search box over grouped commands and records.
 * Focus stays in the input; ArrowUp/ArrowDown move the active result
 * (`aria-activedescendant`), Enter runs it. Commands filter locally; record
 * search runs through `onQueryChange` and comes back as a `filtered` group.
 * Use {@link CommandDialog} for the ⌘K overlay.
 */
export function Command({
  groups,
  label = 'Search commands',
  placeholder = 'Type a command or search…',
  emptyText = 'No results found.',
  onQueryChange,
  loading,
  onSelect,
  onEscape,
  autoFocus = true,
}: CommandProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const optionId = (i: number) => `${listId}-${i}`;

  const needle = query.trim().toLowerCase();
  const visible = groups
    .map((g) => ({ ...g, items: g.filtered || !needle ? g.items : g.items.filter((i) => matches(i, needle)) }))
    .filter((g) => g.items.length > 0);
  const flat = visible.flatMap((g) => g.items);
  // Index of each group's first item in `flat` — option ids and the active index are flat positions.
  const starts = visible.map((_, gi) => visible.slice(0, gi).reduce((n, g) => n + g.items.length, 0));
  const enabled = flat.flatMap((item, i) => (item.disabled ? [] : [i]));
  const current = enabled.includes(active) ? active : (enabled[0] ?? -1);

  useEffect(() => {
    if (current >= 0) document.getElementById(optionId(current))?.scrollIntoView({ block: 'nearest' });
  });

  const run = (i: number) => {
    const item = flat[i];
    if (!item || item.disabled) return;
    item.onSelect?.();
    onSelect?.(item);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && enabled.length > 0) {
      e.preventDefault();
      const at = enabled.indexOf(current);
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive(enabled[(at + step + enabled.length) % enabled.length]);
    } else if (e.key === 'Enter' && current >= 0) {
      e.preventDefault();
      run(current);
    } else if (e.key === 'Escape' && onEscape) {
      e.preventDefault();
      e.stopPropagation();
      onEscape();
    }
  };

  const message = loading ? 'Searching…' : flat.length === 0 ? emptyText : null;

  return (
    <div className="cp-command">
      <div className="cp-command__input-row">
        <input
          className="cp-command__input"
          role="combobox"
          aria-label={label}
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={current >= 0 ? optionId(current) : undefined}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            onQueryChange?.(e.target.value);
          }}
          onKeyDown={onKeyDown}
          // oxlint-disable-next-line jsx-a11y/no-autofocus -- the palette opens to type; its input is the entry point
          autoFocus={autoFocus}
        />
      </div>
      <div id={listId} role="listbox" aria-label={label} className="cp-command__list">
        {visible.map((g, gi) => (
          <div key={g.id} role="group" aria-labelledby={`${listId}-${g.id}`}>
            <div id={`${listId}-${g.id}`} className="cp-command__group-label">
              {g.label}
            </div>
            {g.items.map((item, ii) => {
              const i = starts[gi] + ii;
              return (
                // oxlint-disable-next-line jsx-a11y/click-events-have-key-events -- keyboard runs items from the input (aria-activedescendant); options never take focus
                <div
                  key={item.id}
                  id={optionId(i)}
                  role="option"
                  tabIndex={-1}
                  aria-selected={i === current}
                  aria-disabled={item.disabled || undefined}
                  className={cn('cp-command__item', i === current && 'cp-command__item--active')}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseMove={() => !item.disabled && setActive(i)}
                  onClick={() => run(i)}
                >
                  <span className="cp-command__item-text">
                    <span className="cp-command__item-label">{item.label}</span>
                    {item.description && <span className="cp-command__item-description">{item.description}</span>}
                  </span>
                  {item.shortcut}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {message && (
        <div className="cp-command__empty" role="status">
          {message}
        </div>
      )}
    </div>
  );
}

export interface CommandDialogProps extends Omit<CommandProps, 'onEscape' | 'autoFocus'> {
  open: boolean;
  onClose: () => void;
  /** Names the dialog. @default 'Command palette' */
  title?: string;
}

/**
 * Corpo command palette as a modal overlay — the ⌘K pattern. Closes on Escape,
 * a backdrop click, or after a result runs, and returns focus to where it was.
 * Open it with `useShortcut({ keys: 'mod+k', … })` under a {@link ShortcutsProvider}.
 */
export function CommandDialog({ open, onClose, title = 'Command palette', onSelect, ...rest }: CommandDialogProps) {
  const panel = useRef<HTMLDivElement>(null);

  // Record where focus was before moving it into the input, so closing can put it back.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.current?.querySelector('input')?.focus();
    return () => opener?.focus();
  }, [open]);

  if (!open) return null;

  return createPortal(
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- backdrop click is a pointer convenience; keyboard users close with Escape
    <div
      className="cp-modal-backdrop cp-command-dialog"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      // The input is the only tab stop; keep Tab from leaving the modal.
      onKeyDown={(e) => e.key === 'Tab' && e.preventDefault()}
    >
      <div ref={panel} role="dialog" aria-modal="true" aria-label={title}>
        <Command
          {...rest}
          autoFocus={false}
          onEscape={onClose}
          onSelect={(item) => {
            onClose();
            onSelect?.(item);
          }}
        />
      </div>
    </div>,
    document.body,
  );
}
