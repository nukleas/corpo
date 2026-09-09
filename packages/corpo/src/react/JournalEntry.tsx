import type { HTMLAttributes } from 'react';
import { cx } from './cx';
import { Amount } from './Amount';

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
}

const EMPTY_POSTING: JournalPosting = { account: '', memo: '', debit: '', credit: '' };

function parseAmount(raw: string): number {
  const n = Number(raw.replace(/[,$\s]/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

/** Editable double-entry transaction — posting rows with a live out-of-balance proof bar. */
export function JournalEntry({ value, onChange, className = '', ...rest }: JournalEntryProps) {
  const totalDr = Math.round(value.postings.reduce((s, p) => s + parseAmount(p.debit), 0) * 100) / 100;
  const totalCr = Math.round(value.postings.reduce((s, p) => s + parseAmount(p.credit), 0) * 100) / 100;
  const diff = Math.round((totalDr - totalCr) * 100) / 100;
  const balanced = diff === 0 && totalDr > 0;

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
        className={cx('cp-journal__input', numeric && 'cp-journal__input--num')}
        aria-label={`${label}, line ${index + 1}`}
        value={posting[field]}
        onChange={(e) => patchPosting(index, { [field]: e.target.value })}
      />
    </td>
  );

  return (
    <div className={cx('cp-journal', className)} {...rest}>
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
        <span className={cx('cp-badge', balanced ? 'cp-badge--green' : 'cp-badge--red')}>
          {balanced ? 'Balanced' : (
            <>
              Out of balance (<Amount value={Math.abs(diff)} negative="minus" zeroDash={false} />
              {diff !== 0 && ` ${diff > 0 ? 'Dr' : 'Cr'} over`})
            </>
          )}
        </span>
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
              <tr key={i}>
                {input(posting, i, 'account', 'Account')}
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
            <tr className={cx('cp-foot', balanced ? 'cp-foot--grand' : 'cp-foot--total')}>
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
        <button
          type="button"
          className="cp-btn cp-btn--ghost cp-btn--sm"
          onClick={() => onChange({ ...value, postings: [...value.postings, { ...EMPTY_POSTING }] })}
        >
          Add line
        </button>
      </div>
    </div>
  );
}
