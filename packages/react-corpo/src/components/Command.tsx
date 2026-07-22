import { useMemo, useState, type ReactNode } from 'react';

export interface CommandItem {
  id: string;
  label: ReactNode;
  shortcut?: ReactNode;
  onSelect?: () => void;
}

export interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
}

export interface CommandProps {
  groups: CommandGroup[];
  placeholder?: string;
  emptyText?: string;
}

/** Corpo command palette — grouped, searchable action list (e.g. behind a ⌘K shortcut). */
export function Command({ groups, placeholder = 'Type a command or search…', emptyText = 'No results found.' }: CommandProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return groups;
    const q = query.toLowerCase();
    return groups
      .map((g) => ({ ...g, items: g.items.filter((i) => typeof i.label === 'string' && i.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  const isEmpty = filtered.every((g) => g.items.length === 0);

  return (
    <div className="cp-command">
      <div className="cp-command__input-row">
        <input className="cp-command__input" placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
      </div>
      <div className="cp-command__list">
        {isEmpty && <div className="cp-command__empty">{emptyText}</div>}
        {filtered.map((g) => (
          <div key={g.id}>
            <div className="cp-command__group-label">{g.label}</div>
            {g.items.map((item) => (
              <button key={item.id} type="button" className="cp-command__item" onClick={item.onSelect}>
                <span>{item.label}</span>
                {item.shortcut}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
