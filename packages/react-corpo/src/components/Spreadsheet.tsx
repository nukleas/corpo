function columnLabel(index: number): string {
  let n = index + 1;
  let label = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}

export interface SpreadsheetProps {
  /** 2D array of cell strings — `rows[r][c]`. */
  rows: string[][];
  onCellChange?: (row: number, col: number, value: string) => void;
  /** Override auto A/B/C… column headers. */
  columnLabels?: string[];
}

/** Corpo spreadsheet — editable grid with sticky row/column headers. */
export function Spreadsheet({ rows, onCellChange, columnLabels }: SpreadsheetProps) {
  const colCount = rows[0]?.length ?? 0;
  return (
    <div className="cp-spreadsheet">
      <table className="cp-spreadsheet__table">
        <thead>
          <tr>
            <th className="cp-spreadsheet__corner" />
            {Array.from({ length: colCount }, (_, c) => (
              <th key={c} className="cp-spreadsheet__col-head">
                {columnLabels?.[c] ?? columnLabel(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              <th className="cp-spreadsheet__row-head">{r + 1}</th>
              {row.map((cell, c) => (
                <td key={c} className="cp-spreadsheet__cell">
                  <input className="cp-spreadsheet__input" value={cell} onChange={(e) => onCellChange?.(r, c, e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
