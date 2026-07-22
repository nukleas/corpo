# Contributing to Corpo

Thanks for your interest in Corpo! This is a small design-system monorepo — contributions of any
size (typo fixes, new components, bug reports) are welcome.

## Setup

```bash
pnpm install
pnpm build      # CSS first, then React (styles get copied into the React package's dist)
```

See [AGENTS.md](./AGENTS.md) for the full command reference, and
[`packages/corpo/CLAUDE.md`](./packages/corpo/CLAUDE.md) /
[`packages/react-corpo/AGENTS.md`](./packages/react-corpo/AGENTS.md) for the conventions each
package follows (class naming, token usage, how to add a component).

## Before opening a PR

```bash
pnpm build
pnpm typecheck
pnpm build-storybook   # catches story/config errors
```

## Scope

Corpo intentionally does not port cyberdesign's cyber-only families (Terminal, HUD, Scanner,
Interference, Gauge, GlowCard, AugButton/AugPanel, Ticker, charts) — it's a calm, light-first,
general-purpose component set. New components should fit that brief: WCAG-AA contrast, quiet
elevation instead of glow, sentence-case content voice, verb-first button labels, no emoji.

## Reporting issues

Open a GitHub issue with a clear description and, for visual bugs, a screenshot or the
Storybook story that reproduces it.
