import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';
import { placeElement } from '../lib/place';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  /** Custom link element for routed apps (e.g. a router `Link`). */
  as?: ElementType;
  /** Extra props for the link element, e.g. `{ to: '/invoices' }` for router links. */
  // oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- deliberate verbatim passthrough to the caller-chosen link element (router props are untyped here by design)
  linkProps?: Record<string, unknown>;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

const isLink = (it: BreadcrumbItem) => Boolean(it.href || it.as);

/**
 * Corpo breadcrumb trail — sentence-case links with `/` separators. When a
 * trail of more than three items does not fit, it keeps the first item and the
 * last two and puts the middle behind a "…" button that lists those links.
 */
export function Breadcrumb({ items, className, ...rest }: BreadcrumbProps) {
  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLOListElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const collapsible = items.length > 3;
  const showCollapsed = collapsible && collapsed;
  const hidden = showCollapsed ? items.slice(1, -2) : [];

  // Compare the full trail (an off-screen copy) with the room the nav has.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const full = measureRef.current;
    if (!collapsible || !nav || !full) return;
    const run = () => setCollapsed(full.scrollWidth > nav.clientWidth);
    run();
    // Web fonts change the trail's width without resizing the nav, so measure again once they load.
    let live = true;
    void document.fonts.ready.then(() => live && run());
    const observer = new ResizeObserver(run);
    observer.observe(nav);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [collapsible, items]);

  useLayoutEffect(() => {
    if (open && panelRef.current && toggleRef.current) {
      placeElement(panelRef.current, toggleRef.current.getBoundingClientRect(), 'bottom', 'start', 4);
    }
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  // The off-screen measuring copy passes `copy` so only the real trail marks the current page.
  const crumb = (it: BreadcrumbItem, last: boolean, linkClass = 'cp-breadcrumb__link', copy = false) => {
    if (last || !isLink(it)) {
      return (
        <span aria-current={last && !copy ? 'page' : undefined} className={last ? 'cp-breadcrumb__current' : undefined}>
          {it.label}
        </span>
      );
    }
    const LinkComponent: ElementType = it.as ?? 'a';
    return (
      <LinkComponent href={it.href} className={linkClass} {...it.linkProps}>
        {it.label}
      </LinkComponent>
    );
  };

  const sep = (
    <span aria-hidden="true" className="cp-breadcrumb__sep">
      /
    </span>
  );

  const visible = showCollapsed
    ? [{ it: items[0], i: 0 }, null, ...items.slice(-2).map((it, k) => ({ it, i: items.length - 2 + k }))]
    : items.map((it, i) => ({ it, i }));

  return (
    <nav ref={navRef} aria-label="Breadcrumb" className={cn('cp-breadcrumb', className)} {...rest}>
      <ol className="cp-breadcrumb__list">
        {visible.map((entry) =>
          entry === null ? (
            <li key="more" className="cp-breadcrumb__item">
              <button
                ref={toggleRef}
                type="button"
                className="cp-breadcrumb__more"
                aria-label={`Show ${hidden.length} more`}
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={() => setOpen((v) => !v)}
              >
                …
              </button>
              {open && (
                // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Escape and focusout close the list; its links are the controls
                <ul
                  ref={panelRef}
                  id={panelId}
                  className="cp-breadcrumb__menu"
                  onKeyDown={(e) => {
                    if (e.key !== 'Escape') return;
                    e.preventDefault();
                    close();
                  }}
                  onBlur={(e) => {
                    if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setOpen(false);
                  }}
                >
                  {hidden.map((it, k) => (
                    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- a click on a link inside closes the list; the link handles the keyboard itself
                    <li key={k} onClick={() => setOpen(false)}>
                      {crumb(it, false, 'cp-breadcrumb__menu-link')}
                    </li>
                  ))}
                </ul>
              )}
              {sep}
            </li>
          ) : (
            <li key={entry.i} className="cp-breadcrumb__item">
              {crumb(entry.it, entry.i === items.length - 1)}
              {entry.i < items.length - 1 && sep}
            </li>
          ),
        )}
      </ol>
      {collapsible && (
        <ol ref={measureRef} className="cp-breadcrumb__list cp-breadcrumb__measure" aria-hidden="true" inert>
          {items.map((it, i) => (
            <li key={i} className="cp-breadcrumb__item">
              {crumb(it, i === items.length - 1, 'cp-breadcrumb__link', true)}
              {i < items.length - 1 && sep}
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
