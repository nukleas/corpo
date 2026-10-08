# react-corpo

React component library for **[corpo](../corpo)** — calm, light-first corporate UI with semantic props in the style of shadcn and Mantine.

Visual styles come from corpo CSS (`cp-*` classes, `--corpo-*` tokens). This package provides typed React components, a theme provider, and Storybook documentation.

## Features

- **80+ components across forms, display, feedback, navigation** — including Button, Input, Select, Checkbox, Switch, Slider, Combobox, DatePicker, Toggle(Group), Card, Table, DataTable, Avatar, Skeleton, Accordion, Modal, AlertDialog, Sheet, Popover, Calendar, Spreadsheet, Chip, Status(Dot/Pill/Bar), Empty, Alert, Progress, Toast, Tabs, Breadcrumb, Dropdown, Pagination, Command — see [`packages/corpo`](../corpo) for the full list
- **Semantic props** — `variant`, `size`, `color`/`tone`, plus native HTML attributes
- **Multi themes** — `teal` (default) · `amber` · `green` · `red` · `steel`, plus a `corpo-dark` heritage scope
- **Storybook autodocs** — prop tables from JSDoc
- **Zero style reinvention** — thin bindings over corpo CSS

## Install

```bash
pnpm add @nukleas/react-corpo
```

```tsx
// styles (required once in your app)
import '@nukleas/react-corpo/styles.css';
```

## Quick start

```tsx
import { ThemeProvider, Button, DataTable } from '@nukleas/react-corpo';
import type { DataTableRow } from '@nukleas/react-corpo';
import '@nukleas/react-corpo/styles.css';
import { useState } from 'react';

const columns = [
  { key: 'id', label: 'Invoice', mono: true, sortable: true },
  { key: 'client', label: 'Client', sortable: true },
  { key: 'total', label: 'Total', numeric: true, sortable: true },
  { key: 'status', label: 'Status' },
];

const rows: DataTableRow[] = [
  { id: 'INV-1042', cells: { id: 'INV-1042', client: 'Acme Inc.', total: 12_400, status: { content: 'Paid', status: 'ok' } } },
  { id: 'INV-1043', cells: { id: 'INV-1043', client: 'Northwind', total: 8_150, status: { content: 'Pending', status: 'warn' } } },
];

export function App() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <ThemeProvider theme="amber">
      <Button variant="primary" disabled={!selected.length}>Send reminders</Button>
      <DataTable
        columns={columns}
        rows={rows}
        grid
        pinFirstColumn
        searchable
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        style={{ height: 480 }}
      />
    </ThemeProvider>
  );
}
```

Lists of records belong in a `DataTable` with `grid` — dense rows, gridlines, a sticky header,
sorting, filtering, selection, a totals row (column `summary`), and a bulk action bar. Keep `Card` for
a handful of summary items, not one per record.

One record's detail screen is a `RecordPage` (title, status, actions, key facts, aside) holding
`FormSection`s of `Field`s and, for documents, `LineItems`. See the *Examples/Sales order* story.

## Semantic props

| Prop | Purpose | Typical values |
| --- | --- | --- |
| `variant` | Emphasis or layout mode | `default`, `primary`, `danger`, `pills`, … |
| `size` | Density | `sm`, `md`, `lg` |
| `color` / `tone` | Palette family | `neutral`, `accent`, `green`, `red`, `amber`, … |
| native attrs | Full element surface | `disabled`, `onClick`, `aria-*`, `className` |

Example (Button):

```tsx
<Button variant="primary" size="sm" disabled={loading}>
  Save changes
</Button>
```

## Theme

`--corpo-accent` resolves to teal by default; apply a theme class to change it:

```tsx
<ThemeProvider theme="amber">{/* app */}</ThemeProvider>
// or on <html className="theme-amber">, add "corpo-dark" for the heritage dark scope
```

## Develop

```bash
pnpm install                              # from the repo root
pnpm --filter @nukleas/corpo run build    # one-time: build design tokens/CSS

pnpm run storybook    # http://localhost:6006
pnpm run build        # dist/ ESM + CJS + types + styles.css
pnpm run typecheck
```

## Package layout

```
src/
  components/     React components + Storybook stories
  lib/            cn(), shared types (CpColor, CpTheme, CpSize)
  theme/          ThemeProvider + useTheme
  styles/         CSS entry for Storybook (imports corpo)
  flows/          multi-component Storybook flow fixtures (not in the bundle)
  examples/       Storybook example fixtures (not in the bundle)
  index.ts        public API
```

## Relationship to corpo

| Package | Responsibility |
| --- | --- |
| `@nukleas/corpo` | Tokens, CSS components, Tailwind theme export |
| `@nukleas/react-corpo` | React API, docs, theme provider |

When CSS gains a new modifier, update the matching React prop map here and add/adjust a story.

## License

MIT
