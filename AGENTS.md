# corpo monorepo — agent context

pnpm workspace with two publishable packages:

```
packages/
  corpo/           name: @nukleas/corpo          CSS + tokens + vanilla JS engines
  react-corpo/     name: @nukleas/react-corpo    Full React API + Storybook
```

The unscoped `corpo` / `react-corpo` names on npm are stale early publishes — do not install them.
The source of truth for what exists is `ROADMAP.md` and `packages/react-corpo/src/index.ts`, not an
installed copy.

Root is private (`corpo-monorepo`). Do not publish the root package.

Corpo is a company-friendly, WCAG-AA sibling of [cyberdesign](https://github.com/nukleas/cyberdesign)'s
cyber/terminal design system — same token-and-component skeleton, reworked for calm corporate UI
(light-first, Public Sans body text, quiet elevation, sentence-case content voice, verb-first buttons,
no emoji). Cyberdesign's cyber-only families (Terminal, HUD, Scanner, Gauge, GlowCard, Ticker, etc.)
are intentionally not ported.

## Building screens with corpo

[`packages/react-corpo/BUILDING.md`](./packages/react-corpo/BUILDING.md) is the composition guide, and it ships in the npm
package. Follow it for every story, example, and harness demo too: dense is fine, decoration is not.
That means tables over card grids, no eyebrows or badges that repeat context, and one primary action.

## Engineering principles

- Do not preserve backward compatibility inside the monorepo: remove obsolete classes, props, and tokens instead of aliasing or shimming them, and update both packages + demo harness + stories in the same change. Because `@nukleas/corpo`/`@nukleas/react-corpo` are published to npm, breaking changes ship as a semver bump with a changelog note — never as runtime compat layers.
- Choose the simplest implementation that meets the current requirement. No speculative props, variants, or theme knobs for hypothetical futures.
- Grow in layers: CSS source of truth first, the React component second. Never ship a React component whose classes the CSS does not define.

## Package roles

| Package | Responsibility |
| --- | --- |
| `corpo` | Source of visual truth: tokens, CSS (`cp-*` / `--corpo-*`), HTML demo harness |
| `react-corpo` | Official React API: semantic props, ThemeProvider, Storybook docs |

React lives only in `react-corpo`; `corpo` has no React code.

## Commands (from repo root)

```bash
pnpm install
pnpm build              # both packages
pnpm build:css          # packages/corpo only
pnpm build:react        # packages/react-corpo (needs CSS dist)
pnpm storybook          # http://localhost:6006
pnpm demo               # CSS harness on :4980 → /test/
pnpm typecheck          # both packages (corpo: tokens, build.ts)
```

## Quality gates (all run in CI)

```bash
pnpm format             # Prettier (format:check in CI)
pnpm lint               # oxlint --type-aware: anti-slop, react, rules-of-hooks + exhaustive-deps,
                        # jsx-a11y, no-floating-promises; warnings fail
pnpm lint:css           # stylelint: cp-* classes, kebab custom props, no raw colors
pnpm check:contract     # emitted cp-* classes exist, --corpo-* tokens resolve,
                        # every component has a story
pnpm build-storybook && pnpm test
                        # every story renders, play functions pass, axe finds no WCAG 2.1 AA issues
```

A lint disable needs a `-- reason`. Story `render` functions that call hooks are named
(`render: function Render() {…}`) so rules-of-hooks sees a component. Await `expect` in play functions. New tokens go in `src/tokens/`, never as raw colors in CSS. Interactive
behavior gets a `play` function in its story.

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
