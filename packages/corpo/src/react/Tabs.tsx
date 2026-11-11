import { useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx';
import { moveRovingFocus } from './roving';

export interface TabItem {
  id: string;
  label: ReactNode;
  /** Optional count chip. */
  count?: number;
  /** This tab's panel. Inactive panels stay mounted (hidden), so form state survives a tab switch. */
  panel?: ReactNode;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: TabItem[];
  /** Controlled active tab id. */
  active?: string;
  /** Uncontrolled initial tab id. */
  defaultActive?: string;
  onChange?: (id: string) => void;
  /** Bordered pill triggers instead of an underline. @default false */
  pills?: boolean;
  /**
   * One panel shared by every tab, used when no tab has its own `panel` — e.g.
   * a table whose rows the tabs filter. Labelled by the active tab.
   */
  children?: ReactNode;
}

/**
 * Corpo tabs — Public Sans sentence-case triggers, accent underline (or pills), and
 * their panels. Follows the WAI-ARIA tabs pattern: one tab stop, arrow keys
 * and Home/End move between tabs and activate them. `className` and other
 * props go to the tablist.
 */
export function Tabs({
  tabs,
  active,
  defaultActive,
  onChange,
  pills = false,
  className,
  children,
  ...rest
}: TabsProps) {
  const [internal, setInternal] = useState(defaultActive ?? tabs[0]?.id);
  const current = active !== undefined ? active : internal;
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const ownPanels = tabs.some((t) => t.panel !== undefined);
  const sharedPanel = !ownPanels && children !== undefined;
  const tabId = (i: number) => `${base}-tab-${i}`;
  const panelId = (i: number) => (sharedPanel ? `${base}-panel` : `${base}-panel-${i}`);
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === current),
  );

  const select = (id: string) => {
    setInternal(id);
    onChange?.(id);
  };

  return (
    <>
      <div role="tablist" className={cx('cp-tabs', pills && 'cp-tabs--pills', className)} {...rest}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={tabId(i)}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-controls={ownPanels || sharedPanel ? panelId(i) : undefined}
            tabIndex={i === activeIndex ? 0 : -1}
            className="cp-tabs__tab"
            onClick={() => select(t.id)}
            onKeyDown={(e) => {
              const next = moveRovingFocus(e, refs.current);
              if (next >= 0) select(tabs[next].id);
            }}
          >
            {t.label}
            {t.count !== undefined && <span className="cp-tabs__count">{t.count}</span>}
          </button>
        ))}
      </div>
      {ownPanels &&
        tabs.map((t, i) => (
          <div
            key={t.id}
            id={panelId(i)}
            role="tabpanel"
            aria-labelledby={tabId(i)}
            hidden={i !== activeIndex}
            tabIndex={0}
            className="cp-tabs__panel"
          >
            {t.panel}
          </div>
        ))}
      {sharedPanel && (
        <div
          id={panelId(activeIndex)}
          role="tabpanel"
          aria-labelledby={tabId(activeIndex)}
          tabIndex={0}
          className="cp-tabs__panel"
        >
          {children}
        </div>
      )}
    </>
  );
}
