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
  src/lib/createShorthand.ts  semantic-ui-react-style shorthand slots — `X.create(value)` normalizes
                        `string | number | props object | element` (see Spreadsheet.Cell)
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

## Shorthand slots (semantic-ui-react style)

Data-driven components with a repeated item slot (Table cells, Spreadsheet cells)
take **shorthand** instead of a fixed value type. A slot value may be:

- a bare `string | number` — mapped to the item's natural prop (`content`/`value`)
- a props object — `{ content: 'Paid', status: 'ok' }`
- a `<Component.Item>` element — cloned with merged props (arbitrary foreign
  elements go in `{ content: <Badge/> }`, not bare)
- `null | undefined | boolean` — renders nothing (containers that must keep
  alignment, like table rows, coalesce these to an empty item themselves)

Implement with `createShorthandFactory` from `src/lib/createShorthand.ts`:
attach it as `Item.create` and expose the item as `Parent.Item`. Merge order is
`defaultProps ← value's props ← overrideProps` — container wiring (grid
defaults, injected change handlers) goes in **defaultProps** so an item's own
props always win; reserve `overrideProps` for values the item must never
control. Don't reach for shorthand on simple one-off `ReactNode` slots
(Card `title`, Alert `children`) — plain props are already right there.

Reference implementations: `Spreadsheet.Cell`, `Table.Cell`. Source study copy
of semantic-ui-react lives in gitignored `_references/semantic-ui-react`.

## `as` element polymorphism

Components whose element genuinely varies by context take an `as` prop typed
with `PolymorphicProps<C, OwnProps>` from `src/lib/polymorphic.ts` — the
rendered element's attributes typecheck against `as` (`<Button as="a" href>`,
`<Button as={Link} to>`). Data-driven item slots use a lighter form: an
`as?: ElementType` on the item plus a `linkProps` passthrough (see
`BreadcrumbItem`; for generated items like Pagination pages, `linkProps` is a
function of the item — `(page) => ({ to })`). Adopt `as` only where the swap
is a real need (buttons as links, nav items as router links) — not as a
blanket prop on every component.

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
