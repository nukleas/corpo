import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
}

/** Corpo combobox — searchable single-select, filters options as you type. */
export function Combobox({ options, value, onChange, placeholder = 'Search…', emptyText = 'No results' }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="cp-combobox">
      <input
        className="cp-input"
        placeholder={placeholder}
        value={open ? query : selected?.label ?? ''}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onChange={(e) => setQuery(e.target.value)}
      />
      {open && (
        <div className="cp-combobox__list" role="listbox">
          {filtered.length === 0 && <div className="cp-combobox__empty">{emptyText}</div>}
          {filtered.map((o) => (
            <button
              key={o.value}
              type="button"
              className={cn('cp-combobox__option', o.value === value && 'cp-combobox__option--selected')}
              onClick={() => {
                onChange?.(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
