import { useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { StatusPill } from './StatusPill';
import { Textarea } from './Textarea';

export type ApprovalDecision = 'pending' | 'approved' | 'rejected';

export interface Approver {
  id: string;
  name: string;
  /** What they approve as, e.g. "Finance". */
  role?: string;
  decision: ApprovalDecision;
  decidedAt?: ReactNode;
  comment?: ReactNode;
}

export interface ApprovalsProps extends HTMLAttributes<HTMLDivElement> {
  /** In approval order. */
  approvers: Approver[];
  /** The signed-in user. When they are a pending approver and `onDecide` is set, the decide box shows. */
  actorId?: string;
  /** Called with the decision and comment (required to reject). The page records it. */
  onDecide?: (decision: 'approved' | 'rejected', comment: string) => void;
}

const PILL = {
  pending: { tone: 'idle', text: 'Pending' },
  approved: { tone: 'ok', text: 'Approved' },
  rejected: { tone: 'err', text: 'Rejected' },
} as const;

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

/**
 * Corpo approvals — who signs off on a document and what each decided, in
 * order, with Approve / Reject for the signed-in approver. Rejecting needs a
 * reason. Pair it with a {@link Stepper} for the document's lifecycle.
 */
export function Approvals({ approvers, actorId, onDecide, className, ...rest }: ApprovalsProps) {
  const [comment, setComment] = useState('');
  const commentId = useId();
  const approved = approvers.filter((a) => a.decision === 'approved').length;
  const rejected = approvers.some((a) => a.decision === 'rejected');
  const canDecide = onDecide && approvers.some((a) => a.id === actorId && a.decision === 'pending');

  const decide = (decision: 'approved' | 'rejected') => {
    onDecide?.(decision, comment.trim());
    setComment('');
  };

  return (
    <div className={cn('cp-approvals', className)} {...rest}>
      <p className="cp-approvals__summary">{rejected ? 'Rejected' : `${approved} of ${approvers.length} approved`}</p>
      <ol className="cp-approvals__list" aria-label="Approvers">
        {approvers.map((a) => (
          <li key={a.id} className="cp-approvals__item">
            <Avatar size="sm" initials={initialsOf(a.name)} aria-hidden="true" />
            <div className="cp-approvals__body">
              <span className="cp-approvals__name">{a.name}</span>
              {a.role && <span className="cp-approvals__role">{a.role}</span>}
              {a.comment != null && <p className="cp-approvals__comment">{a.comment}</p>}
            </div>
            <div className="cp-approvals__decision">
              <StatusPill tone={PILL[a.decision].tone}>{PILL[a.decision].text}</StatusPill>
              {a.decidedAt != null && <span className="cp-approvals__time">{a.decidedAt}</span>}
            </div>
          </li>
        ))}
      </ol>
      {canDecide && (
        <div className="cp-approvals__decide">
          <label className="cp-label" htmlFor={commentId}>
            Comment
          </label>
          <Textarea
            id={commentId}
            rows={2}
            placeholder="Required to reject"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="cp-approvals__actions">
            <Button size="sm" variant="danger" disabled={!comment.trim()} onClick={() => decide('rejected')}>
              Reject
            </Button>
            <Button size="sm" variant="primary" onClick={() => decide('approved')}>
              Approve
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
