import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Off-canvas sidebar visibility below 768px (no effect on desktop). */
  navOpen?: boolean;
  /** Fired when the mobile scrim is clicked — close the nav here. */
  onNavClose?: () => void;
  children?: ReactNode;
}

/**
 * Application page scaffold — compose with {@link AppShellSidebar} (hosting a
 * {@link SideNav}), and {@link AppShellMain} wrapping a {@link Topbar} plus
 * {@link AppShellContent}. The sidebar goes off-canvas below 768px; the host
 * owns `navOpen` (wire {@link Topbar}'s `onNavToggle` to it).
 */
export function AppShell({ navOpen = false, onNavClose, className, children, ...rest }: AppShellProps) {
  return (
    <div className={cn('cp-shell', navOpen && 'cp-shell--nav-open', className)} {...rest}>
      {children}
      {navOpen && (
        <button
          type="button"
          className="cp-shell__scrim"
          aria-label="Close navigation"
          onClick={onNavClose}
        />
      )}
    </div>
  );
}

export interface AppShellSidebarProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/** Fixed 240px sidebar column — host for a {@link SideNav}. */
export function AppShellSidebar({ className, children, ...rest }: AppShellSidebarProps) {
  return (
    <aside className={cn('cp-shell__sidebar', className)} {...rest}>
      {children}
    </aside>
  );
}

export interface AppShellMainProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** Main column — a {@link Topbar} followed by {@link AppShellContent}. */
export function AppShellMain({ className, children, ...rest }: AppShellMainProps) {
  return (
    <div className={cn('cp-shell__main', className)} {...rest}>
      {children}
    </div>
  );
}

export interface AppShellContentProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/** Scrolling content region. */
export function AppShellContent({ className, children, ...rest }: AppShellContentProps) {
  return (
    <main className={cn('cp-shell__content', className)} {...rest}>
      {children}
    </main>
  );
}

AppShell.Sidebar = AppShellSidebar;
AppShell.Main = AppShellMain;
AppShell.Content = AppShellContent;
