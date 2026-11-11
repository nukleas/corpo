import type { ReactNode } from 'react';
import type { MenuItem } from '../lib/types';
import { BrandContent } from './Brand';
import { Dropdown } from './Dropdown';

export interface Entity {
  id: string;
  /** Company or entity name. */
  name: string;
  /** Second line — country, currency, or entity code. */
  detail?: ReactNode;
  logo?: ReactNode;
}

export interface EntitySwitcherProps {
  entities: Entity[];
  /** Id of the entity the app is working in. */
  current: string;
  onChange: (id: string) => void;
  /** After the entities, below a separator — "Manage companies", "Add entity". */
  actions?: MenuItem[];
  /** Names the menu. @default 'Switch company' */
  label?: string;
}

/**
 * Corpo entity switcher — the brand row as a menu button that switches the
 * company, legal entity, or workspace the app is working in. Put it in
 * {@link SideNav}'s `brand` slot. The menu lists entities as radio items.
 */
export function EntitySwitcher({
  entities,
  current,
  onChange,
  actions = [],
  label = 'Switch company',
}: EntitySwitcherProps) {
  const active = entities.find((e) => e.id === current) ?? entities[0];
  const items: MenuItem[] = [
    ...entities.map((e): MenuItem => ({
      id: e.id,
      type: 'radio',
      label: e.name,
      checked: e.id === active?.id,
      onCheckedChange: () => onChange(e.id),
      closeOnSelect: true,
    })),
    ...(actions.length > 0
      ? [{ type: 'separator', id: 'entity-switcher-actions' } satisfies MenuItem, ...actions]
      : []),
  ];

  return (
    <Dropdown
      items={items}
      trigger={
        <button
          type="button"
          className="cp-brand cp-brand--switch"
          aria-label={active ? `${label}: ${active.name}` : label}
        >
          {active && <BrandContent name={active.name} detail={active.detail} logo={active.logo} />}
          <span className="cp-brand__chevron" aria-hidden="true" />
        </button>
      }
    />
  );
}
