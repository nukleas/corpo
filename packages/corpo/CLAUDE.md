# corpo — developer context

CSS package in the corpo monorepo (`packages/corpo`). Calm, light-first, WCAG-AA corporate design
system — the company-friendly sibling of [cyberdesign](https://github.com/nukleas/cyberdesign).
Pure CSS + TypeScript tokens + thin React class bindings under `src/react/`. Full React API +
Storybook live in `../react-corpo`.

## Architecture

```
src/tokens/          TypeScript token definitions
  base.ts            raw hex palette (greys, status colors, accent families)
  semantic.ts         purpose-mapped --corpo-* token names + values (teal accent is the default)
  themes/amber.ts     accent-family overrides for .theme-amber
  themes/green.ts     accent-family overrides for .theme-green
  themes/red.ts       accent-family overrides for .theme-red
  themes/steel.ts     accent-family overrides for .theme-steel
  themes/dark.ts      heritage dark-scope overrides for .corpo-dark
  index.ts            re-exports all

build.ts             codegen script — reads tokens, reads src/css/, writes dist/

src/css/
  base.css           font load (Public Sans + JetBrains Mono), reset, :root defaults, focus ring
  components/        one file per component (17 files, ~20 components — some pairs like
                      Checkbox/Radio and Field/Label share a file)

src/react/           thin class wrappers, one per component (design-sync / lightweight export)

dist/                generated, gitignored — run `npm run build` to regenerate
  corpo.css
  corpo-vars-only.css
  tailwind-theme.css

test/index.html      visual demo harness — live theme toggle (teal default / amber / green / red / steel / dark)
examples/console.html  composed admin-console example using every component family
```

## Conventions

- All CSS classes are prefixed `cp-`. Modifiers use `--` (BEM-ish): `cp-btn cp-btn--primary`.
- CSS variables are all `--corpo-*`. Never use raw hex values in component CSS — always reference a token.
- `--corpo-accent` is the semantic accent; it resolves to the active theme's accent color (teal by
  default, no class needed). Use this instead of `--corpo-teal` directly in component CSS.
- Geometry is soft, not sharp: `--corpo-radius` (2px, controls) and `--corpo-radius-lg` (4px, surfaces) —
  never `border-radius: 0`. The Switch pill is the one fully-rounded exception.
- No neon glow, scanlines, or CRT effects — elevation comes from `--corpo-shadow-sm/md/lg` only.
- `_*/` directories are gitignored and for internal reference only. Never commit them.

## Adding a component

1. Create `src/css/components/<name>.css` — use `--corpo-*` tokens, prefix classes with `cp-`
2. Add a `readCss('components/<name>.css')` entry to the bundle array in `build.ts`
3. Add a demo section to `test/index.html`
4. Run `npm run build` to verify the bundle compiles cleanly

## Adding a token

1. Add the raw value to `src/tokens/base.ts` if it's a new palette entry
2. Map it to a semantic name in `src/tokens/semantic.ts` (key becomes `--corpo-<key>`)
3. If it's theme-specific (accent family), add it to the relevant `src/tokens/themes/<name>.ts`
4. Run `npm run build`

## Adding a theme

1. Create `src/tokens/themes/<name>.ts` — export a `Record<string, string>` of accent overrides
   (`accent`, `accent-strong`, `accent-subtle`, `accent-muted`, `accent-secondary`, `accent-secondary-subtle`)
2. Import it in `build.ts` and add it to the `THEME_BLOCKS` list (wired into all three output files)
3. Add `.theme-<name>` handling to `test/index.html`'s theme toggle

## Dev workflow

From monorepo root:

```bash
pnpm build:css           # one-shot build
pnpm dev                 # watch mode — rebuilds dist/ on every src/ change
pnpm demo                # serve this package; open http://localhost:4980/test/
pnpm storybook           # React Storybook (packages/react-corpo)
```

## Key CSS variables

| Token | Purpose |
|---|---|
| `--corpo-bg` | page background (grey-50) |
| `--corpo-bg-panel` | card / panel background (white) |
| `--corpo-text` | primary text |
| `--corpo-text-secondary` | dimmed text |
| `--corpo-text-muted` | secondary labels/helpers |
| `--corpo-text-dim` | decorative/metadata (large/decorative only, ~3.6:1) |
| `--corpo-accent` | theme accent (teal by default) |
| `--corpo-accent-strong` | darker accent for hover/press |
| `--corpo-border` / `--corpo-border-dim` / `--corpo-border-strong` | border weights |
| `--corpo-radius` / `--corpo-radius-lg` | 2px controls / 4px surfaces |
| `--corpo-shadow-sm` / `-md` / `-lg` | quiet elevation, no glow |
| `--corpo-font-sans` | Public Sans — body/headings |
| `--corpo-font-mono` | JetBrains Mono — labels, data, code |
| `--corpo-text-xs` … `--corpo-text-2xl` | rem-based type scale |
