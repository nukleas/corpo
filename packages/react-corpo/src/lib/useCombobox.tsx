import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from './cn';

export interface ComboboxOption {
  value: string;
  label: string;
  /** Second line under the label — an account number, an email, a SKU description. */
  description?: string;
}

export interface UseComboboxConfig {
  options: ComboboxOption[];
  isSelected: (value: string) => boolean;
  onPick: (option: ComboboxOption) => void;
  /** Close after a pick (single select) or stay open and clear the query (multi select). */
  closeOnPick: boolean;
  multiselectable?: boolean;
  onQueryChange?: (query: string) => void;
  onCreate?: (query: string) => void;
  loading?: boolean;
  emptyText: string;
}

/**
 * State and keyboard model shared by Combobox and MultiSelect — the WAI-ARIA
 * combobox with a listbox popup. Focus stays in the input; ArrowUp/ArrowDown
 * move the active option (`aria-activedescendant`), Enter picks it, Escape
 * and Tab close. Options are filtered locally unless `onQueryChange` is set,
 * in which case the caller searches and passes back `options`.
 */
export function useCombobox(config: UseComboboxConfig) {
  const { options, isSelected, onPick, closeOnPick, multiselectable, onQueryChange, onCreate, loading, emptyText } =
    config;
  const [open, setOpen] = useState(false);
  const [query, setQueryState] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();

  const setQuery = (next: string) => {
    setQueryState(next);
    setActive(0);
    onQueryChange?.(next);
  };
  // Closing drops the search, so the list reopens fresh.
  const close = () => {
    setOpen(false);
    setQueryState('');
  };

  const needle = query.trim().toLowerCase();
  const matches = onQueryChange ? options : options.filter((o) => o.label.toLowerCase().includes(needle));
  const createLabel =
    onCreate && needle !== '' && !options.some((o) => o.label.toLowerCase() === needle) ? query.trim() : null;
  const count = matches.length + (createLabel === null ? 0 : 1);
  const current = Math.min(active, count - 1);
  const optionId = (i: number) => `${listId}-${i}`;

  const pick = (i: number) => {
    if (i < matches.length) onPick(matches[i]);
    else if (createLabel !== null) onCreate?.(createLabel);
    if (closeOnPick) close();
    else setQuery('');
  };

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (root.current && e.target instanceof Node && !root.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [open]);

  useEffect(() => {
    if (open && current >= 0) document.getElementById(optionId(current))?.scrollIntoView({ block: 'nearest' });
  });

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const down = e.key === 'ArrowDown';
      if (!open) {
        setOpen(true);
        setActive(down ? 0 : count - 1);
      } else if (count > 0) {
        setActive((current + (down ? 1 : -1) + count) % count);
      }
    } else if (e.key === 'Enter' && open && current >= 0) {
      e.preventDefault();
      pick(current);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === 'Tab') {
      close();
    }
  };

  const inputProps = {
    role: 'combobox' as const,
    'aria-expanded': open,
    'aria-controls': open ? listId : undefined,
    'aria-autocomplete': 'list' as const,
    'aria-activedescendant': open && current >= 0 ? optionId(current) : undefined,
    onKeyDown,
  };

  const message = loading ? 'Searching…' : count === 0 ? emptyText : null;

  const popup = open && (
    <div className="cp-combobox__list">
      <div id={listId} role="listbox" aria-multiselectable={multiselectable || undefined}>
        {matches.map((o, i) => {
          const selected = isSelected(o.value);
          return (
            // oxlint-disable-next-line jsx-a11y/click-events-have-key-events -- keyboard picks through the combobox input (aria-activedescendant); options never take focus
            <div
              key={o.value}
              id={optionId(i)}
              role="option"
              tabIndex={-1}
              aria-selected={selected}
              className={cn(
                'cp-combobox__option',
                selected && 'cp-combobox__option--selected',
                i === current && 'cp-combobox__option--active',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={() => setActive(i)}
              onClick={() => pick(i)}
            >
              <span>{o.label}</span>
              {o.description && <span className="cp-combobox__option-description">{o.description}</span>}
            </div>
          );
        })}
        {createLabel !== null && (
          // oxlint-disable-next-line jsx-a11y/click-events-have-key-events -- as above: picked from the input with Enter
          <div
            id={optionId(matches.length)}
            role="option"
            tabIndex={-1}
            aria-selected={false}
            className={cn(
              'cp-combobox__option cp-combobox__option--create',
              current === matches.length && 'cp-combobox__option--active',
            )}
            onMouseDown={(e) => e.preventDefault()}
            onMouseMove={() => setActive(matches.length)}
            onClick={() => pick(matches.length)}
          >
            Create “{createLabel}”
          </div>
        )}
      </div>
      {message && (
        <div className="cp-combobox__empty" role="status">
          {message}
        </div>
      )}
    </div>
  );

  return { root, open, setOpen, query, setQuery, inputProps, popup };
}
