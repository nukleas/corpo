# corpo

Calm, light-first, WCAG-AA corporate design system — shared design tokens and CSS component primitives (`cp-*` classes). The company-friendly sibling of [cyberdesign](https://github.com/nukleas/cyberdesign): same skeleton (mono micro-labels, 1px borders, swappable accent themes), reworked for compliance-officer calm instead of neon CRT.

Part of the [corpo monorepo](../../README.md). For the full React API and Storybook, see [`react-corpo`](../react-corpo).

## Install

```bash
pnpm add @nukleas/corpo
```

```css
@import "@nukleas/corpo/css";
```

```html
<html>  <!-- teal is the default; add theme-amber | theme-green | theme-red | theme-steel to swap accent, corpo-dark for the heritage dark scope -->
```

## Build

From monorepo root:

```bash
pnpm build:css
pnpm demo   # http://localhost:4980/test/
```

## Exports

| Import | Contents |
| --- | --- |
| `@nukleas/corpo` / `@nukleas/corpo/css` | Full CSS bundle |
| `@nukleas/corpo/vars` | CSS variables only |
| `@nukleas/corpo/tailwind` | Variables + Tailwind v4 `@theme` |
| `@nukleas/corpo/react` | Thin React class wrappers (prefer `@nukleas/react-corpo` for apps) |
| `@nukleas/corpo/tokens` | TypeScript token constants |
