import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '../lib/cn';
import { moveRovingFocus } from '../lib/roving';
import type { MenuItem } from '../lib/types';
import { Button } from './Button';
import { Dropdown } from './Dropdown';

export interface ActionBarAction {
  id: string;
  /** Button text, and the menu item text once it overflows. Verb-first. */
  label: string;
  onClick?: () => void;
  /** `danger` becomes a red menu item when it overflows. @default 'default' */
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}

export interface ActionBarProps {
  /** In priority order: the last ones move into "More" first. */
  actions: ActionBarAction[];
  /** Always in "More", after any overflowed actions — duplicate, archive, delete. */
  menu?: MenuItem[];
  /** Names the toolbar. @default 'Record actions' */
  label?: string;
  /** Text of the overflow button. @default 'More' */
  moreLabel?: string;
  className?: string;
}

/**
 * Corpo action bar — a record's actions as one toolbar (a single tab stop;
 * ArrowLeft/ArrowRight/Home/End move between buttons). Actions that do not
 * fit move into a "More" menu from the end; the first action never does, so
 * put the primary action first.
 */
export function ActionBar({
  actions,
  menu = [],
  label = 'Record actions',
  moreLabel = 'More',
  className,
}: ActionBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(actions.length);
  const [focus, setFocus] = useState(0);

  // Measure every button off-screen once, then fit as many as the bar's width allows.
  useLayoutEffect(() => {
    const bar = barRef.current;
    const measure = measureRef.current;
    if (!bar || !measure) return;
    const run = () => {
      const widths = Array.from(measure.children, (el) => el.getBoundingClientRect().width);
      const more = widths.pop() ?? 0;
      const gap = parseFloat(getComputedStyle(bar).columnGap) || 0;
      const room = bar.clientWidth;
      const width = (n: number) => widths.slice(0, n).reduce((sum, w) => sum + w + gap, 0);
      let n = widths.length;
      const needsMore = (count: number) => count < widths.length || menu.length > 0;
      // The first action is the primary one: it stays on the bar even when nothing else fits.
      while (n > 1 && width(n) + (needsMore(n) ? more : -gap) > room) n -= 1;
      setFit(n);
    };
    run();
    // Web fonts change button widths without resizing the bar, so measure again once they load.
    let live = true;
    void document.fonts.ready.then(() => live && run());
    const observer = new ResizeObserver(run);
    observer.observe(bar);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [actions, menu.length]);

  const shown = actions.slice(0, fit);
  const overflow: MenuItem[] = actions.slice(fit).map((a) => ({
    id: a.id,
    label: a.label,
    disabled: a.disabled,
    danger: a.variant === 'danger',
    onClick: a.onClick,
  }));
  const items: MenuItem[] =
    overflow.length > 0 && menu.length > 0
      ? [...overflow, { type: 'separator', id: 'action-bar-split' }, ...menu]
      : [...overflow, ...menu];
  const count = shown.length + (items.length > 0 ? 1 : 0);
  const current = Math.min(focus, count - 1);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const buttons = Array.from(barRef.current?.querySelectorAll<HTMLElement>('[data-action-bar-item]') ?? []);
    const at = moveRovingFocus(e, buttons, 'horizontal');
    if (at >= 0) setFocus(at);
  };
  const itemProps = (i: number) => ({
    'data-action-bar-item': '',
    tabIndex: i === current ? 0 : -1,
    onFocus: () => setFocus(i),
    onKeyDown,
  });

  return (
    <div ref={barRef} role="toolbar" aria-label={label} className={cn('cp-action-bar', className)}>
      {shown.map((a, i) => (
        <Button key={a.id} variant={a.variant} disabled={a.disabled} onClick={a.onClick} {...itemProps(i)}>
          {a.label}
        </Button>
      ))}
      {items.length > 0 && (
        <Dropdown align="right" items={items} trigger={<Button {...itemProps(shown.length)}>{moreLabel}</Button>} />
      )}
      <div ref={measureRef} className="cp-action-bar__measure" aria-hidden="true" inert>
        {actions.map((a) => (
          <Button key={a.id} variant={a.variant} tabIndex={-1}>
            {a.label}
          </Button>
        ))}
        <Button tabIndex={-1}>{moreLabel}</Button>
      </div>
    </div>
  );
}
