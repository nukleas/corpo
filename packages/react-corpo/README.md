# react-corpo

React component library for **[corpo](../corpo)** — calm, light-first corporate UI with semantic props in the style of shadcn and Mantine.

Visual styles come from corpo CSS (`cp-*` classes, `--corpo-*` tokens). This package provides typed React components, a theme provider, and Storybook documentation.

## Features

- **30 components across forms, display, feedback, navigation** — Button, Input, Textarea, Select, Checkbox, Radio, Switch, Field, Label, Slider, Card, Badge, Table, Stat, Kbd, KbdGroup, Avatar, Skeleton, SkeletonRow, Accordion, Modal, Separator, Tooltip, Alert, Progress, Spinner, Toast, Tabs, Breadcrumb, Dropdown, Pagination
- **Semantic props** — `variant`, `size`, `color`/`tone`, plus native HTML attributes
- **Multi themes** — `teal` (default) · `amber` · `green` · `red` · `steel`, plus a `corpo-dark` heritage scope
- **Storybook autodocs** — prop tables from JSDoc
- **Zero style reinvention** — thin bindings over corpo CSS

## Install

This package lives in the corpo monorepo next to the CSS package.

```bash
# monorepo workspace (preferred during development)
pnpm add react-corpo --filter <your-app>

# or from a local path
pnpm add file:../corpo/packages/react-corpo

# styles (required once in your app)
import 'react-corpo/styles.css';
```

Ensure corpo CSS is built first (`pnpm build:css` from monorepo root).

## Quick start

```tsx
import {
  ThemeProvider,
  Button,
  Input,
  Field,
  Label,
  Card,
  Badge,
} from 'react-corpo';
import 'react-corpo/styles.css';

export function App() {
  return (
    <ThemeProvider theme="amber">
      <Card title="Renewal">
        <Field>
          <Label htmlFor="q">Search</Label>
          <Input id="q" placeholder="Search invoices…" accent />
        </Field>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Button variant="primary">Save changes</Button>
          <Badge color="green" dot>Paid</Badge>
        </div>
      </Card>
    </ThemeProvider>
  );
}
```

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
# one-time: build design tokens/CSS
(cd ../corpo && npm install && npm run build)

npm install
npm run storybook    # http://localhost:6006
npm run build        # dist/ ESM + CJS + types + styles.css
npm run typecheck
```

## Package layout

```
src/
  components/     React components + Storybook stories
  lib/            cn(), shared types (CpColor, CpTheme, CpSize)
  theme/          ThemeProvider + useTheme
  styles/         CSS entry for Storybook (imports corpo)
  index.ts        public API
```

## Relationship to corpo

| Package | Responsibility |
| --- | --- |
| `corpo` | Tokens, CSS components, Tailwind theme export |
| `react-corpo` | React API, docs, theme provider |

When CSS gains a new modifier, update the matching React prop map here and add/adjust a story.

## License

MIT
