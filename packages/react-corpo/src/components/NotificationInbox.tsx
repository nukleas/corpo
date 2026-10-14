import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Button } from './Button';

export interface InboxNotification {
  id: string;
  title: ReactNode;
  body?: ReactNode;
  timestamp: ReactNode;
  unread?: boolean;
  /** Where the notification leads; otherwise it is a button that calls `onOpen`. */
  href?: string;
}

export interface NotificationInboxProps extends HTMLAttributes<HTMLDivElement> {
  /** Newest first. */
  notifications: InboxNotification[];
  /** Called when a notification is opened — mark it read and go to its record. */
  onOpen?: (id: string) => void;
  /** Shows "Mark all as read" while anything is unread. */
  onMarkAllRead?: () => void;
  /** @default 'Notifications' */
  heading?: string;
  /** @default "You're all caught up." */
  emptyText?: ReactNode;
}

/**
 * Corpo notification inbox — recent notifications with unread markers, an
 * unread count and "Mark all as read". Put it in a {@link Popover} opened from
 * a bell button in the {@link Topbar}, or on a page of its own.
 */
export function NotificationInbox({
  notifications,
  onOpen,
  onMarkAllRead,
  heading = 'Notifications',
  emptyText = "You're all caught up.",
  className,
  ...rest
}: NotificationInboxProps) {
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className={cn('cp-inbox', className)} {...rest}>
      <div className="cp-inbox__header">
        <span className="cp-inbox__heading">{heading}</span>
        {unread > 0 && <span className="cp-inbox__count">{unread} new</span>}
        {onMarkAllRead && unread > 0 && (
          <Button size="sm" variant="ghost" onClick={onMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="cp-inbox__empty">{emptyText}</p>
      ) : (
        <ul className="cp-inbox__list" aria-label={heading}>
          {notifications.map((n) => {
            const content = (
              <>
                <span className="cp-inbox__dot" aria-hidden="true" />
                <span className="cp-inbox__text">
                  <span className="cp-inbox__title">
                    {n.unread && <span className="cp-inbox__sr">Unread: </span>}
                    {n.title}
                  </span>
                  {n.body != null && <span className="cp-inbox__body">{n.body}</span>}
                </span>
                <span className="cp-inbox__time">{n.timestamp}</span>
              </>
            );
            const className = cn('cp-inbox__item', n.unread && 'cp-inbox__item--unread');
            return (
              <li key={n.id}>
                {n.href ? (
                  <a className={className} href={n.href} onClick={() => onOpen?.(n.id)}>
                    {content}
                  </a>
                ) : (
                  <button type="button" className={className} onClick={() => onOpen?.(n.id)}>
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
