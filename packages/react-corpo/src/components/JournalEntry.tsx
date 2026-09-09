import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Amount, roundCents } from './Amount';
import { Badge } from './Badge';
import { Button } from './Button';
import { Combobox } from './Combobox';

export interface JournalPosting {
  account: string;
  memo: string;
  /** Raw input string — parsed leniently (`$`, commas, spaces stripped). */
  debit: string;
  /** Raw input string — parsed leniently (`$`, commas, spaces stripped). */
  credit: string;
}

export interface JournalEntryValue {
  date: string;
  memo: string;
  postings: JournalPosting[];
}

export interface JournalEntryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: JournalEntryValue;
  onChange: (next: JournalEntryValue) => void;
  /** Chart of accounts — when given, account cells become Combobox pickers instead of free text. */
  accounts?: string[];
}

const EMPTY_POSTING: JournalPosting = { account: '', memo: '', debit: '', credit: '' };

function parseAmount(raw: string): number {
  // Accept accounting output too: (1,234.00) and −1,234.00 parse as negatives.
  const stripped = raw.replace(/[,$\s]/g, '').replace('−', '-');
  const parenthesized = /^\(.*\)$/.test(stripped);
  const n = Number(parenthesized ? stripped.slice(1, -1) : stripped);
  if (Number.isNaN(n)) return 0;
  return parenthesized ? -n : n;
}

/**
 * Editable double-entry journal transaction — date/memo header, N posting
 * rows (account · memo · Dr · Cr), and a live proof bar. The out-of-balance
 * badge shows the difference until Σ Dr = Σ Cr, at which point the totals row
 * takes the proved double rule. Controlled: amounts stay raw strings in
 * `value` (controlled numeric inputs are lossy while typing); there is no
 * Dr/Cr auto-clearing — the caller owns data hygiene.
 */
export function JournalEntry({ value, onChange, accounts, className, ...rest }: JournalEntryProps) {
  const totalDr = roundCents(value.postings.reduce((s, p) => s + parseAmount(p.debit), 0));
  const totalCr = roundCents(value.postings.reduce((s, p) => s + parseAmount(p.credit), 0));
  const diff = roundCents(totalDr - totalCr);
  // A posting carries one side only — a line with both Dr and Cr can never prove.
  const oneSided = value.postings.every((p) => parseAmount(p.debit) === 0 || parseAmount(p.credit) === 0);
  const balanced = diff === 0 && totalDr > 0 && oneSided;

  const patchPosting = (index: number, patch: Partial<JournalPosting>) =>
    onChange({
      ...value,
      postings: value.postings.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    });

  const input = (
    posting: JournalPosting,
    index: number,
    field: keyof JournalPosting,
    label: string,
    numeric = false,
  ) => (
    <td className="cp-journal__cell" data-numeric={numeric || undefined}>
      <input
        className={cn('cp-journal__input', numeric && 'cp-journal__input--num')}
        aria-label={`${label}, line ${index + 1}`}
        value={posting[field]}
        onChange={(e) => patchPosting(index, { [field]: e.target.value })}
      />
    </td>
  );

  return (
    <div className={cn('cp-journal', className)} {...rest}>
      <div className="cp-journal__head">
        <input
          className="cp-journal__input cp-journal__input--date"
          aria-label="Date"
          placeholder="Date"
          value={value.date}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
        />
        <input
          className="cp-journal__input"
          aria-label="Memo"
          placeholder="Memo"
          value={value.memo}
          onChange={(e) => onChange({ ...value, memo: e.target.value })}
        />
        {balanced ? (
          <Badge color="green">Balanced</Badge>
        ) : diff === 0 && !oneSided ? (
          <Badge color="red">Two-sided posting</Badge>
        ) : (
          <Badge color="red">
            Out of balance (<Amount value={Math.abs(diff)} negative="minus" zeroDash={false} />
            {diff !== 0 && ` ${diff > 0 ? 'Dr' : 'Cr'} over`})
          </Badge>
        )}
      </div>
      <div className="cp-table cp-table--compact cp-ledger">
        <table className="cp-table__table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Memo</th>
              <th data-numeric="true">Dr</th>
              <th data-numeric="true">Cr</th>
              <th aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {value.postings.map((posting, i) => (
              // oxlint-disable-next-line react/no-array-index-key -- inputs are controlled by value, rows only append/remove
              <tr key={i}>
                {accounts ? (
                  <td className="cp-journal__cell">
                    <Combobox
                      options={accounts.map((a) => ({ value: a, label: a }))}
                      value={posting.account}
                      placeholder="Account…"
                      ariaLabel={`Account, line ${i + 1}`}
                      onChange={(account) => patchPosting(i, { account })}
                    />
                  </td>
                ) : (
                  input(posting, i, 'account', 'Account')
                )}
                {input(posting, i, 'memo', 'Posting memo')}
                {input(posting, i, 'debit', 'Debit', true)}
                {input(posting, i, 'credit', 'Credit', true)}
                <td className="cp-journal__cell">
                  {value.postings.length > 2 && (
                    <button
                      type="button"
                      className="cp-journal__remove"
                      aria-label={`Remove line ${i + 1}`}
                      onClick={() =>
                        onChange({ ...value, postings: value.postings.filter((_, pi) => pi !== i) })
                      }
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
            <tr className={cn('cp-foot', balanced ? 'cp-foot--grand' : 'cp-foot--total')}>
              <td>Totals</td>
              <td />
              <td data-numeric="true">
                <Amount value={totalDr} />
              </td>
              <td data-numeric="true">
                <Amount value={totalCr} />
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
      <div className="cp-journal__bar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ ...value, postings: [...value.postings, { ...EMPTY_POSTING }] })}
        >
          Add line
        </Button>
      </div>
    </div>
  );
}
