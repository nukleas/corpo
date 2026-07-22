# react-corpo — agent context

React component library built on **corpo** (workspace package at `../corpo`).
CSS-first design system; this package is the official React API with semantic props and Storybook docs.

**Goal:** calm, light-first, WCAG-AA corporate UI covering forms/display/feedback/navigation — the
"normie" subset of Cyberdesign's component list. Visual styles always live in corpo CSS; React only maps props.

## Architecture

```
../corpo                tokens + CSS (cp-* classes, --corpo-* vars) — source of visual truth
react-corpo/
  src/components/       one file per component (PascalCase = export name)
  src/lib/cn.ts          className join helper
  src/lib/types.ts       CpColor, CpTheme, CpSize
  src/theme/             ThemeProvider, useTheme
  src/styles/index.css   Storybook CSS entry → imports corpo/css
  src/index.ts           public barrel
  .storybook/            Storybook 8 (Vite) + autodocs
```

## Hard rules

1. **Never invent styling.** Only emit `cp-*` classes that exist in corpo
   (`../corpo/src/css/components/*.css`). No inline styles except layout one-offs a story needs.
2. **Semantic props** like shadcn/Mantine: `variant`, `size`, `color`/`tone`, boolean modifiers.
   Map them to BEM modifiers: `cp-btn--primary`, `cp-input--sm`.
3. **Extend native HTML attributes**; always merge `className` and spread `...rest`.
   `Omit` colliding names (`title`, `size` when types differ).
4. **JSDoc on exported props and components** — Storybook autodocs and consumers read these.
5. **Use `cn` from `../lib/cn`** — do not paste a local class helper.
6. **Shared types** — import `CpColor` / `CpTheme` / `CpSize` from `../lib/types`.
7. **Named function exports**, no `React.FC`. `import type` for types.
8. **Voice**: sentence case everywhere except micro-labels (uppercase mono by style, not typing);
   verb-first button copy ("Save changes", not "Submit"); no exclamation marks, no emoji.
9. **Theme is optional for accents** — teal resolves without any class; other themes need
   `theme-{name}` (or `<ThemeProvider theme="...">`) on an ancestor.

## Adding a component

1. Confirm CSS exists in corpo (`src/css/components/<name>.css` + demo in `test/index.html`).
2. Add `src/components/<Name>.tsx` following Button / Alert / Tabs patterns.
3. Export from `src/index.ts`.
4. Add `src/components/<Name>.stories.tsx` with `tags: ['autodocs']`.
5. `pnpm typecheck` and check Storybook (from monorepo root: `pnpm storybook`).

## Discovering the CSS contract

1. Read `../corpo/src/css/components/<x>.css` for modifiers (`.cp-x--*`) and parts (`.cp-x__*`).
2. Read the matching section in `../corpo/test/index.html` for canonical DOM.
3. Thin wrappers in `../corpo/src/react/` are a useful reference for prop names.

## Commands

From monorepo root:

```bash
pnpm build:css          # regenerate CSS if tokens/components changed
pnpm install
pnpm storybook
pnpm build:react
pnpm typecheck
```

From this package:

```bash
pnpm build
pnpm storybook
pnpm typecheck
```

## Build outputs

| Path | Contents |
| --- | --- |
| `dist/index.js` / `.cjs` | Library bundle |
| `dist/index.d.ts` | Types |
| `dist/styles.css` | Copied full corpo CSS bundle |

Consumers:

```ts
import { Button, ThemeProvider } from 'react-corpo';
import 'react-corpo/styles.css';
```

## Do not

- Hand-edit corpo `dist/` — build it from corpo source.
- Add Tailwind as a hard dependency of this package (corpo CSS is enough).
- Duplicate token definitions; import or reference corpo.
- Port Cyberdesign's cyber-only families (Terminal, HUD, Scanner, Gauge, GlowCard, Ticker, etc.) — intentionally excluded.
