import type { HTMLAttributes, ReactNode } from 'react';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
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
          return (
            <li key={i} className="cp-breadcrumb__item">
              {last || !it.href ? (
                <span aria-current={last ? 'page' : undefined} className={last ? 'cp-breadcrumb__current' : undefined}>
                  {it.label}
                </span>
              ) : (
                <a href={it.href} className="cp-breadcrumb__link">
                  {it.label}
                </a>
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
