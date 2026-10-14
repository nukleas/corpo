import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { StatusDot } from './StatusDot';
import { Textarea } from './Textarea';

export interface ActivityChange {
  field: string;
  /** Previous value; omit for a field that was empty. */
  from?: ReactNode;
  to: ReactNode;
}

interface EntryBase {
  id: string;
  timestamp: ReactNode;
}

/** One entry in a record's history: a comment, a set of field changes, or a system event. */
export type ActivityEntry =
  | (EntryBase & { type: 'comment'; author: string; initials?: string; body: ReactNode })
  | (EntryBase & { type: 'change'; author: string; initials?: string; changes: ActivityChange[] })
  | (EntryBase & { type: 'event'; title: ReactNode; tone?: 'ok' | 'warn' | 'err' | 'idle' | 'info' });

export interface ActivityLogProps extends HTMLAttributes<HTMLDivElement> {
  /** Newest first. */
  entries: ActivityEntry[];
  /** Shows a comment box; called with the trimmed text. The page appends the new entry. */
  onComment?: (text: string) => void;
  /** @default 'Add a comment…' */
  placeholder?: string;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

/**
 * Corpo activity log — a record's history in one feed: comments, field-change
 * audit entries ("Status: Draft → Confirmed") and system events, with an
 * optional comment box (Ctrl/⌘+Enter posts). Sits in {@link RecordPage}'s
 * aside; for a plain event rail use {@link Timeline}.
 */
export function ActivityLog({
  entries,
  onComment,
  placeholder = 'Add a comment…',
  className,
  ...rest
}: ActivityLogProps) {
  const [draft, setDraft] = useState('');
  const post = () => {
    const text = draft.trim();
    if (!text) return;
    onComment?.(text);
    setDraft('');
  };

  return (
    <div className={cn('cp-activity-log', className)} {...rest}>
      {onComment && (
        <div className="cp-activity-log__composer">
          <Textarea
            rows={2}
            aria-label="Comment"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                post();
              }
            }}
          />
          <div className="cp-activity-log__composer-actions">
            <span className="cp-activity-log__hint">Ctrl+Enter to post</span>
            <Button size="sm" variant="primary" disabled={!draft.trim()} onClick={post}>
              Post comment
            </Button>
          </div>
        </div>
      )}
      <ol className="cp-activity-log__list" aria-label="Activity">
        {entries.map((entry) => (
          <li key={entry.id} className="cp-activity-log__entry">
            <span className="cp-activity-log__marker" aria-hidden="true">
              {entry.type === 'event' ? (
                <StatusDot tone={entry.tone ?? 'idle'} />
              ) : (
                <Avatar size="sm" initials={entry.initials ?? initialsOf(entry.author)} />
              )}
            </span>
            <div className="cp-activity-log__content">
              <div className="cp-activity-log__head">
                {entry.type === 'event' ? (
                  <span className="cp-activity-log__title">{entry.title}</span>
                ) : (
                  <>
                    <span className="cp-activity-log__author">{entry.author}</span>
                    <span className="cp-activity-log__action">
                      {entry.type === 'comment'
                        ? 'commented'
                        : `changed ${entry.changes.length === 1 ? '1 field' : `${entry.changes.length} fields`}`}
                    </span>
                  </>
                )}
                <span className="cp-activity-log__time">{entry.timestamp}</span>
              </div>
              {entry.type === 'comment' && <div className="cp-activity-log__comment">{entry.body}</div>}
              {entry.type === 'change' && (
                <ul className="cp-activity-log__changes">
                  {entry.changes.map((c) => (
                    <li key={c.field}>
                      <span className="cp-activity-log__field">{c.field}</span>{' '}
                      {c.from != null && (
                        <>
                          <del className="cp-activity-log__from">{c.from}</del> <span aria-hidden="true">→</span>
                          <span className="cp-activity-log__sr"> to</span>{' '}
                        </>
                      )}
                      <ins className="cp-activity-log__to">{c.to}</ins>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
