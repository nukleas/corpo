import { useEffect, useRef } from 'react';
import { useFieldControlProps } from './field-context';
import { useCombobox, type ComboboxOption } from './useCombobox';

export type { ComboboxOption };

export interface ComboboxProps {
  /** Choices. With `onQueryChange`, the current search results — keep the selected option among them so its label shows. */
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  /** Accessible name when no {@link Field} label is associated. */
  'aria-label'?: string;
  /** Search remotely: called as the user types; the component stops filtering `options` itself. */
  onQueryChange?: (query: string) => void;
  /** Shows "Searching…" while remote results load. */
  loading?: boolean;
  /** Offers a "Create “query”" row when nothing matches exactly — e.g. a new customer. */
  onCreate?: (query: string) => void;
}

/**
 * Corpo combobox — searchable single-select and entity lookup. Arrow keys move
 * through the options, Enter picks, Escape closes. Options can carry a
 * `description` line; `onQueryChange` + `loading` turn it into a remote
 * search, and `onCreate` adds a create-new row.
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  emptyText = 'No results',
  'aria-label': ariaLabel,
  onQueryChange,
  loading,
  onCreate,
}: ComboboxProps) {
  const fieldProps = useFieldControlProps(false);
  const selected = options.find((o) => o.value === value);
  const { root, open, setOpen, query, setQuery, inputProps, popup } = useCombobox({
    options,
    isSelected: (v) => v === value,
    onPick: (o) => onChange?.(o.value),
    closeOnPick: true,
    onQueryChange,
    onCreate,
    loading,
    emptyText,
  });

  // After a pick the input shows the label, selected — the next keystroke starts a new search.
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open && document.activeElement === input.current) input.current?.select();
  }, [open]);

  return (
    <div ref={root} className="cp-combobox">
      <input
        ref={input}
        {...fieldProps}
        {...inputProps}
        className="cp-input"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={open ? query : (selected?.label ?? '')}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onClick={() => {
          if (open) return;
          setOpen(true);
          setQuery('');
        }}
        onChange={(e) => {
          setOpen(true);
          setQuery(e.target.value);
        }}
      />
      {popup}
    </div>
  );
}
