import type { HTMLAttributes, ReactNode } from 'react';

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Off-canvas sidebar visibility below 768px. */
  navOpen?: boolean;
  /** Fired when the mobile scrim is clicked. */
  onNavClose?: () => void;
  children?: ReactNode;
}

export function AppShell({ navOpen = false, onNavClose, className = '', children, ...rest }: AppShellProps) {
  return (
    <div className={cx('cp-shell', navOpen && 'cp-shell--nav-open', className)} {...rest}>
      {children}
      {navOpen && (
        <button type="button" className="cp-shell__scrim" aria-label="Close navigation" onClick={onNavClose} />
      )}
    </div>
  );
}

export function AppShellSidebar({ className = '', children, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <aside className={cx('cp-shell__sidebar', className)} {...rest}>
      {children}
    </aside>
  );
}

export function AppShellMain({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('cp-shell__main', className)} {...rest}>
      {children}
    </div>
  );
}

export function AppShellContent({ className = '', children, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <main className={cx('cp-shell__content', className)} {...rest}>
      {children}
    </main>
  );
}

AppShell.Sidebar = AppShellSidebar;
AppShell.Main = AppShellMain;
AppShell.Content = AppShellContent;
