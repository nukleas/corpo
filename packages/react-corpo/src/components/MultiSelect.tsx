import { useFieldControlProps } from '../lib/field-context';
import { useCombobox, type ComboboxOption } from '../lib/useCombobox';
import { Chip } from './Chip';

export interface MultiSelectProps {
  /** Choices. With `onQueryChange`, the current search results — keep selected options among them so their chips show labels. */
  options: ComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  /** Accessible name when no {@link Field} label is associated. */
  'aria-label'?: string;
  /** Search remotely: called as the user types; the component stops filtering `options` itself. */
  onQueryChange?: (query: string) => void;
  /** Shows "Searching…" while remote results load. */
  loading?: boolean;
  /** Offers a "Create “query”" row when nothing matches exactly — e.g. a new tag. */
  onCreate?: (query: string) => void;
}

/**
 * Corpo multi-select — a {@link Combobox} that collects several values as
 * chips: tags, recipients, cost centers. Picking keeps the list open; Backspace
 * in an empty search removes the last chip.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  emptyText = 'No results',
  'aria-label': ariaLabel,
  onQueryChange,
  loading,
  onCreate,
}: MultiSelectProps) {
  const fieldProps = useFieldControlProps(false);
  const labels = new Map(options.map((o) => [o.value, o.label]));
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  const { root, setOpen, query, setQuery, inputProps, popup } = useCombobox({
    options,
    isSelected: (v) => value.includes(v),
    onPick: (o) => toggle(o.value),
    closeOnPick: false,
    multiselectable: true,
    onQueryChange,
    onCreate,
    loading,
    emptyText,
  });

  return (
    <div ref={root} className="cp-combobox">
      <div className="cp-multiselect">
        {value.map((v) => {
          const label = labels.get(v) ?? v;
          return (
            <Chip key={v} removeLabel={`Remove ${label}`} onRemove={() => toggle(v)}>
              {label}
            </Chip>
          );
        })}
        <input
          {...fieldProps}
          {...inputProps}
          className="cp-multiselect__input"
          aria-label={ariaLabel}
          placeholder={value.length === 0 ? placeholder : undefined}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setOpen(true);
            setQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && query === '' && value.length > 0) onChange(value.slice(0, -1));
            inputProps.onKeyDown(e);
          }}
        />
      </div>
      {popup}
    </div>
  );
}
