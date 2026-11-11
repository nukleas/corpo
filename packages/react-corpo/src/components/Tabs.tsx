import { useEffect, useId, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { moveRovingFocus } from '../lib/roving';
import { Button } from './Button';
import { Dropdown } from './Dropdown';

export interface TabItem {
  id: string;
  label: ReactNode;
  /** Count chip, only for a number that asks for action (unread, overdue, waiting on you), never a total. */
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
   * Tabs wider than the row: `scroll` the tablist (touch-friendly), or move the
   * ones that don't fit into a "More tabs" menu after it — for a few primary
   * tabs and a tail of rarely used ones. @default 'scroll'
   */
  overflow?: 'scroll' | 'menu';
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
  overflow = 'scroll',
  className,
  children,
  ...rest
}: TabsProps) {
  const [internal, setInternal] = useState(defaultActive ?? tabs[0]?.id);
  const current = active !== undefined ? active : internal;
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const menu = overflow === 'menu';
  // Tabs the tablist clips (menu mode), and how many tabs just before the selected one are
  // taken out so it fits. Both end up in the "More tabs" menu.
  const [clipped, setClipped] = useState<ReadonlySet<number>>(new Set());
  const [displaced, setDisplaced] = useState(0);
  const widths = useRef<number[]>([]);
  const focusPending = useRef(false);

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

  // Menu mode: a tab counts as clipped unless it is fully inside the tablist.
  useEffect(() => {
    const list = listRef.current;
    if (!menu || !list) return;
    const observer = new IntersectionObserver(
      (entries) =>
        setClipped((prev) => {
          const next = new Set(prev);
          for (const { target, intersectionRatio } of entries) {
            const i = refs.current.indexOf(target instanceof HTMLButtonElement ? target : null);
            if (i < 0) continue;
            if (intersectionRatio < 1) next.add(i);
            else next.delete(i);
          }
          return next;
        }),
      { root: list, threshold: 1 },
    );
    for (const el of refs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [menu, tabs.length]);

  // Keep the selected tab in the row: drop the tabs just before it, closest first, until it fits.
  // Widths are remembered while a tab is displayed, since a displaced tab measures 0.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!menu || !list) return;
    refs.current.forEach((el, i) => {
      if (el && el.offsetWidth > 0) widths.current[i] = el.offsetWidth;
    });
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    const row = (drop: number) =>
      widths.current.slice(0, activeIndex - drop).reduce((sum, w) => sum + w + gap, 0) +
      (widths.current[activeIndex] ?? 0);
    let drop = 0;
    while (drop < activeIndex && row(drop) > list.clientWidth) drop += 1;
    setDisplaced(drop);
  }, [menu, activeIndex, clipped]);

  // A tab chosen from the menu, or reached with the arrows while clipped, takes focus once it
  // is selected — the selected tab is never hidden. Runs after the menu returns focus to "More".
  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    refs.current[activeIndex]?.focus();
  }, [activeIndex]);

  useEffect(() => {
    if (menu) return;
    // Scroll mode: bring the selected tab into view inside the tablist only.
    const options: ScrollIntoViewOptions & { container?: 'nearest' } = {
      block: 'nearest',
      inline: 'nearest',
      container: 'nearest',
    };
    refs.current[activeIndex]?.scrollIntoView(options);
  }, [menu, activeIndex]);

  const isDisplaced = (i: number) => i < activeIndex && i >= activeIndex - displaced;
  const hiddenTabs = tabs.filter((_, i) => i !== activeIndex && (clipped.has(i) || isDisplaced(i)));

  const tablist = (
    <div
      ref={listRef}
      role="tablist"
      className={cn('cp-tabs', pills && 'cp-tabs--pills', menu && 'cp-tabs--menu', className)}
      {...rest}
    >
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
          tabIndex={i === activeIndex ? 0 : -1}
          className={cn(
            'cp-tabs__tab',
            menu && clipped.has(i) && 'is-clipped',
            menu && isDisplaced(i) && 'is-displaced',
          )}
          onClick={() => select(t.id)}
          onKeyDown={(e) => {
            const next = moveRovingFocus(e, refs.current);
            if (next < 0) return;
            select(tabs[next].id);
            if (menu) focusPending.current = true;
          }}
        >
          {t.label}
          {t.count !== undefined && <span className="cp-tabs__count">{t.count}</span>}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {menu ? (
        <div className="cp-tabs-bar">
          {tablist}
          {hiddenTabs.length > 0 && (
            <Dropdown
              align="right"
              trigger={
                <Button variant="ghost" size="sm" icon aria-label="More tabs">
                  ⋯
                </Button>
              }
              items={hiddenTabs.map((t) => ({
                id: t.id,
                label: t.label,
                onClick: () => {
                  focusPending.current = true;
                  select(t.id);
                },
              }))}
            />
          )}
        </div>
      ) : (
        tablist
      )}
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
