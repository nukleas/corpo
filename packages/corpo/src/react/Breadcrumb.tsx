import type { ElementType, HTMLAttributes, ReactNode } from 'react';

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

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Breadcrumb({ items, className = '', ...rest }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cx('cp-breadcrumb', className)} {...rest}>
      <ol className="cp-breadcrumb__list">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          const LinkComponent: ElementType = it.as ?? 'a';
          return (
            <li key={i} className="cp-breadcrumb__item">
              {last || (!it.href && !it.as) ? (
                <span aria-current={last ? 'page' : undefined} className={last ? 'cp-breadcrumb__current' : undefined}>
                  {it.label}
                </span>
              ) : (
                <LinkComponent href={it.href} className="cp-breadcrumb__link" {...it.linkProps}>
                  {it.label}
                </LinkComponent>
              )}
              {!last && (
                <span aria-hidden="true" className="cp-breadcrumb__sep">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
