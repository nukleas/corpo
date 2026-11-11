import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { placeElement } from '../lib/place';

export interface LauncherModule {
  id: string;
  label: string;
  /** Short line under the label — what the module covers. */
  description?: string;
  icon?: ReactNode;
  href?: string;
  /** Custom link element for routed apps (e.g. a router `Link`). */
  as?: ElementType;
  /** Extra props for the link element, e.g. `{ to: '/sales' }` for router links. */
  // oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- deliberate verbatim passthrough to the caller-chosen link element (router props are untyped here by design)
  linkProps?: Record<string, unknown>;
}

export interface ModuleLauncherProps {
  modules: LauncherModule[];
  /** Id of the module the user is in. */
  activeId?: string | null;
  /** Fired on module click (also fires alongside link navigation). */
  onSelect?: (id: string, module: LauncherModule) => void;
  /** Names the button and the panel. @default 'Modules' */
  label?: string;
  /** Which edge of the button the panel lines up with. @default 'start' */
  align?: 'start' | 'end';
}

/**
 * Corpo module launcher — a grid button, typically in the {@link Topbar},
 * that opens a panel of the app's modules. The panel is navigation, not a
 * menu: modules are links you Tab through, and arrow keys move across the
 * grid. Escape, a click outside, or choosing a module closes it and returns
 * focus to the button.
 */
export function ModuleLauncher({
  modules,
  activeId,
  onSelect,
  label = 'Modules',
  align = 'start',
}: ModuleLauncherProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const panelId = useId();
  const titleId = useId();

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    if (!open || !panel || !toggle) return;
    const run = () => placeElement(panel, toggle.getBoundingClientRect(), 'bottom', align, 6);
    run();
    window.addEventListener('resize', run);
    window.addEventListener('scroll', run, true);
    return () => {
      window.removeEventListener('resize', run);
      window.removeEventListener('scroll', run, true);
    };
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('.cp-launcher__item') ?? []);
    (items.find((el) => el.getAttribute('aria-current') === 'page') ?? items[0])?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  // Arrow keys move through the grid by position, so they follow however many columns fit.
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('.cp-launcher__item'));
    const at = items.findIndex((el) => el === e.target);
    if (at < 0) return;
    const top = (el: HTMLElement) => el.getBoundingClientRect().top;
    const columns = items.filter((el) => top(el) === top(items[0])).length || 1;
    const clamp = (i: number) => Math.min(Math.max(i, 0), items.length - 1);
    let next: number;
    if (e.key === 'ArrowRight') next = clamp(at + 1);
    else if (e.key === 'ArrowLeft') next = clamp(at - 1);
    else if (e.key === 'ArrowDown') next = clamp(at + columns);
    else if (e.key === 'ArrowUp') next = clamp(at - columns);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    else return;
    e.preventDefault();
    items[next]?.focus();
  };

  return (
    <div
      className="cp-launcher"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={toggleRef}
        type="button"
        className="cp-launcher__toggle"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="cp-launcher__icon" aria-hidden="true" />
      </button>
      {open && (
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- arrow keys and Escape for the links inside; each module is its own link
        <nav ref={panelRef} id={panelId} aria-labelledby={titleId} className="cp-launcher__panel" onKeyDown={onKeyDown}>
          <p id={titleId} className="cp-launcher__title">
            {label}
          </p>
          <ul className="cp-launcher__grid">
            {modules.map((m) => {
              const isLink = Boolean(m.as || m.href);
              const Item: ElementType = m.as ?? (isLink ? 'a' : 'button');
              return (
                <li key={m.id}>
                  <Item
                    {...(isLink ? { href: m.href } : { type: 'button' })}
                    className="cp-launcher__item"
                    aria-current={m.id === activeId ? 'page' : undefined}
                    onClick={() => {
                      onSelect?.(m.id, m);
                      close();
                    }}
                    {...m.linkProps}
                  >
                    {m.icon != null && (
                      <span className="cp-launcher__item-icon" aria-hidden="true">
                        {m.icon}
                      </span>
                    )}
                    <span className="cp-launcher__item-label">{m.label}</span>
                    {m.description && <span className="cp-launcher__item-description">{m.description}</span>}
                  </Item>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
