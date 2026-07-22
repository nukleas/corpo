# corpo monorepo

![CI](https://github.com/nukleas/corpo/actions/workflows/ci.yml/badge.svg)

**[Live demo →](https://nukleas.github.io/corpo/)** — Storybook, a raw-CSS visual demo, and a
composed console example.

Calm, light-first, WCAG-AA corporate design system — the company-friendly sibling of
[cyberdesign](https://github.com/nukleas/cyberdesign)'s cyber/terminal aesthetic. Same skeleton
(mono micro-labels, 1px borders, swappable accent themes), reworked for compliance-officer calm:
Public Sans body copy, quiet elevation instead of neon glow, sentence-case content voice.

| Package | Path | Publish name | What it is |
| --- | --- | --- | --- |
| CSS core | [`packages/corpo`](./packages/corpo) | `corpo` | Tokens, CSS (`cp-*`), thin React class bindings |
| React + Storybook | [`packages/react-corpo`](./packages/react-corpo) | `react-corpo` | Full React API, semantic props, Storybook |

## Components

52 components across four groups — the general-purpose subset of cyberdesign's catalog, plus the
shadcn-parity extras that fit a calm business UI. Cyber-only families (Terminal, HUD, Scanner,
Interference, Gauge, GlowCard, AugButton/AugPanel, Ticker, charts) are intentionally not ported.

- **Forms**: Button, Input, Textarea, Select, Checkbox, Radio, RadioGroup, Switch, Field, Label, Slider, Combobox, DatePicker, Toggle, ToggleGroup, ButtonGroup, InputGroup
- **Display**: Card, Badge, Table, Stat, Kbd, KbdGroup, Avatar, Skeleton, SkeletonRow, Accordion, Modal, AlertDialog, Sheet, Separator, Tooltip, Popover, Calendar, Spreadsheet, Collapsible, Chip, StatusDot, StatusPill, StatusBar, Empty, AspectRatio, ScrollArea, SectionHeader
- **Feedback**: Alert, Progress, Spinner, Toast
- **Navigation**: Tabs, Breadcrumb, Dropdown, Pagination, Command

See [ROADMAP.md](./ROADMAP.md) for what's under consideration next and what's intentionally out of scope.

## Setup

```bash
pnpm install
pnpm build          # CSS first, then React (styles copied into react dist)
```

## Commands

| Command | Description |
| --- | --- |
| `pnpm build` | Build both packages |
| `pnpm build:css` | Build CSS tokens + bundle only |
| `pnpm build:react` | Build React library (needs CSS dist) |
| `pnpm dev` | Watch-rebuild CSS |
| `pnpm storybook` | Storybook for React components → http://localhost:6006 |
| `pnpm demo` | Static CSS harness → serve `packages/corpo` on :4980 |
| `pnpm typecheck` | Typecheck React package |

### Storybook

```bash
pnpm build:css      # once (or after CSS changes)
pnpm storybook      # http://localhost:6006
```

### CSS visual harness

```bash
pnpm build:css
pnpm demo
# open http://localhost:4980/test/
```

### CI

Every push/PR builds both packages, typechecks, and builds Storybook (`.github/workflows/ci.yml`). The repo is private, so there's no hosted preview — instead, download the `storybook-static` artifact from the workflow run in the Actions tab and open its `index.html` locally to preview without running the build yourself. A `package-dist` artifact with both packages' built output is attached the same way.

## Consuming

### CSS only

```bash
pnpm add corpo
# or local: "corpo": "workspace:*" / "file:../corpo/packages/corpo"
```

```css
@import "corpo/css";
```

```html
<html>  <!-- teal is the default accent; add theme-amber | theme-green | theme-red | theme-steel to swap, corpo-dark for the heritage dark scope -->
```

### React components

```bash
pnpm add react-corpo
```

```tsx
import { ThemeProvider, Button, Card } from 'react-corpo';
import 'react-corpo/styles.css';

export function App() {
  return (
    <ThemeProvider theme="amber">
      <Card title="Renewal">
        <Button variant="primary">Save changes</Button>
      </Card>
    </ThemeProvider>
  );
}
```

## Workspace layout

```
packages/
  corpo/           # CSS source of truth (tokens → dist/*.css)
  react-corpo/     # React bindings + Storybook over corpo CSS
```

Visual styles always live in `corpo`. React only maps props → `cp-*` classes.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and conventions, and
[ROADMAP.md](./ROADMAP.md) for what's planned. Please follow the
[Code of Conduct](./CODE_OF_CONDUCT.md) in all interactions.

## License

[MIT](./LICENSE)
