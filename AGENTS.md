# corpo monorepo — agent context

pnpm workspace with two publishable packages:

```
packages/
  corpo/           name: corpo          CSS + tokens + thin React wrappers
  react-corpo/     name: react-corpo    Full React API + Storybook
```

Root is private (`corpo-monorepo`). Do not publish the root package.

Corpo is a company-friendly, WCAG-AA sibling of [cyberdesign](https://github.com/nukleas/cyberdesign)'s
cyber/terminal design system — same token-and-component skeleton, reworked for calm corporate UI
(light-first, Public Sans body text, quiet elevation, sentence-case content voice, verb-first buttons,
no emoji). Cyberdesign's cyber-only families (Terminal, HUD, Scanner, Gauge, GlowCard, Ticker, etc.)
are intentionally not ported.

## Package roles

| Package | Responsibility |
| --- | --- |
| `corpo` | Source of visual truth: tokens, CSS (`cp-*` / `--corpo-*`), HTML demo harness |
| `react-corpo` | Official React API: semantic props, ThemeProvider, Storybook docs |

`packages/corpo/src/react/` holds **thin** class wrappers (design-sync / lightweight `corpo/react` export). Prefer `react-corpo` for real app UI.

## Commands (from repo root)

```bash
pnpm install
pnpm build              # both packages
pnpm build:css          # packages/corpo only
pnpm build:react        # packages/react-corpo (needs CSS dist)
pnpm storybook          # http://localhost:6006
pnpm demo               # CSS harness on :4980 → /test/
pnpm typecheck
```

Build order matters: **CSS before React** (React copies `corpo/dist/corpo.css` → `dist/styles.css`).

## Adding CSS components

Work in `packages/corpo`:

1. `src/css/components/<name>.css` — `--corpo-*` tokens, `cp-` class prefix
2. Register in `build.ts` bundle array
3. Demo section in `test/index.html`
4. `pnpm build:css`

## Adding React components

Work in `packages/react-corpo`:

1. Confirm CSS exists in `packages/corpo`
2. `src/components/<Name>.tsx` — map props to `cp-*` classes via `cn`
3. Export from `src/index.ts`
4. `src/components/<Name>.stories.tsx` with `tags: ['autodocs']`
5. `pnpm typecheck` and `pnpm storybook`

Hard rules (React): never invent styling; only emit classes from corpo CSS; use shared types from `src/lib/types.ts`.

## Themes

Apply `theme-amber` | `theme-green` | `theme-red` | `theme-steel` on an ancestor (or use `ThemeProvider`) — teal is the default and needs no class. Add `corpo-dark` for the heritage dark scope.

## `_*/` directories

Gitignored internal reference material only. Never commit or depend on them.

## Detailed package docs

- [`packages/corpo/CLAUDE.md`](./packages/corpo/CLAUDE.md) — CSS conventions
- [`packages/react-corpo/AGENTS.md`](./packages/react-corpo/AGENTS.md) — React conventions
