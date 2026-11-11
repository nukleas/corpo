# Changelog

Visual and API breaks for the published packages, newest first. The GitHub release
notes for each tag carry the same list.

## Unreleased

- New `ShortcutsProvider` and `useShortcut`: one keydown listener and a registry of
  shortcuts (`'mod+k'`, `'?'`, `'g i'` sequences; `mod` is ⌘ on Apple, Ctrl elsewhere).
  Shortcuts without a modifier are ignored while typing and can be turned off from the
  help overlay (WCAG 2.1.4), which lists every registered shortcut by group and opens
  with `?` or `mod+/`. New `ShortcutKeys` renders a shortcut string as keycaps.
- `Modal` moves focus into the dialog on open and returns it to the opener on close.
- New `Brand`: a mark (logo, or initials on the accent), the name and a detail line, for
  `SideNav`'s `brand` slot; the collapsed rail shows the mark only. New `EntitySwitcher`:
  the brand row as a menu button that switches company or entity (radio items, closes on
  choice). New `ModuleLauncher`: a grid button that opens a panel of module links, with
  arrow keys across the grid. Radio menu items take `closeOnSelect`.
- `Tabs` takes `overflow="menu"`: tabs that don't fit go into a "More tabs" menu (an icon
  button outside the tablist), and the selected tab always stays in the row. The default
  stays `scroll`, which now scrolls the selected tab into view. Tabs no longer set
  `aria-controls`, and the selected underline is a border on `::after` instead of a
  box-shadow, so it survives forced-colors mode.
- `Breadcrumb` collapses a trail of more than three items that doesn't fit: it keeps the
  first item and the last two, and lists the middle from a "…" button. Breadcrumb items
  no longer wrap.
- **Breaking:** `@nukleas/corpo/react` is removed. Its 81 thin wrappers were a hand-kept
  second copy of `@nukleas/react-corpo` that had drifted from it. Import components from
  `@nukleas/react-corpo` instead. `@nukleas/corpo` no longer has a `react` peer dependency.
- `Command` items take a string `label` (it is the searched text), plus optional
  `description`, `keywords` and `disabled`. Results are `role="option"` elements driven
  from the input with `aria-activedescendant`, not buttons. New `CommandDialog` is the
  ⌘K overlay.
- `SideNav` items take `icon` and nested `items`. An item with `items` is a group toggle
  (`aria-expanded`) that opens in place; the active page's groups open on their own.
  Arrow keys move through visible items and open, close, enter and leave groups.
  `collapsed` turns the nav into a 56px icon rail with label tooltips and group flyouts.
- New `ActionBar`: a record's actions as one toolbar (single tab stop, arrow keys).
  Actions that do not fit move into a trailing "More" menu from the end; `menu` items
  always live there. New `SplitButton` (main action + menu arrow) and `RecordPager`
  ("3 of 120" with previous / next).
- `RecordPage` takes `pager`, rendered after the actions. `.cp-record__actions` now grows
  into the room beside the heading and right-aligns its contents, including when it
  wraps below the heading; with an ActionBar inside it does not wrap.

## 0.5.0 — responsive, calm chrome

Breaking changes. No compatibility shims.

### Responsive

- A standalone `.cp-form-grid` no longer collapses by viewport. Form grids collapse by
  their `.cp-form` or `.cp-form-section` container, and `FormGrid` renders that wrapper.
- Top bars no longer wrap at 480px. Link rows scroll inside themselves.
- Under `pointer: coarse`, `--corpo-control-h` and `--corpo-control-h-sm` are 44px.

### Calm chrome


- Control labels that were uppercase mono are Public Sans, sentence case, weight 600,
  tracking 0: buttons, tabs, badges, field labels (`.cp-label`), card titles, modal
  and sheet titles, record fact labels, sidenav group titles, stat labels, the donut
  caption, status-bar labels, alert and toast titles, progress and spinner labels,
  breadcrumbs, description-list labels, and profile section titles. Status-bar values stay mono. `.corpo-label`, the
  record eyebrow, and table headers stay uppercase mono. Figures, ids, kbd,
  timestamps, and numeric inputs stay mono.
- `--corpo-radius` is 6px (was 2px). `--corpo-radius-lg` is 8px (was 4px). The switch
  track and thumb stay pills.
- `.cp-card` and `.cp-profile` strokes are `--corpo-border-dim` (were
  `--corpo-accent-border`). Sheet outer edges are `--corpo-border-dim` (were
  `--corpo-border`). `--corpo-accent-border` remains on the DataTable bulk bar only.
  The selected feed edge stays a solid accent stroke (`--corpo-accent-edge`, falling
  back to `--corpo-accent`); it was never `accent-border`. Record sections are
  `.cp-card`s; `.cp-section` has no stroke.
- Default buttons hover with the neutral panel colors. Pressed buttons fill
  `--corpo-bg-inset` instead of translating. Disabled buttons, inputs, textareas, and
  selects use full opacity with inset background, dim border, and dim text. Focus on
  those controls is a 2px ring (`--corpo-accent-text`, falling back to `--corpo-accent`).
- `Button` accepts `loading`. It sets `aria-busy="true"`, disables a native button
  (or `aria-disabled` and `tabIndex={-1}` when rendered as a link), and keeps the
  label in the layout so the width does not change. The spinner is `aria-hidden`.
- Dark accent no longer uses one color for fill and text. Measured WCAG 2.1 AA:
  `--corpo-accent` `#0f6f80` (white text 5.82:1; 2.97:1 as text on `#151b24`, so it
  is fill only), `--corpo-accent-edge` / `--corpo-accent-strong` `#1a7f90` (3.69:1
  on `#151b24`, white text 4.68:1 on the hover fill), `--corpo-accent-text` `#62b0bb`
  (7.55:1 on `#0e1218`, 6.96:1 on `#151b24`, 6.28:1 on `#1c2431`). Those two extra
  tokens exist only on `.corpo-dark`. Light mode and the other accent themes keep
  using `--corpo-accent`. Dark link text, including hover, uses `--corpo-accent-text`
  because `#1a7f90` fails 4.5:1 as text. Subtle and muted washes are retinted off
  `#54c3d4` onto `rgba(15, 111, 128, 0.18)` and `0.40`.
- `.cp-empty__icon` no longer draws a 40px circle. The icon stays.
- Docs: homepage and prose h1 use Public Sans. The version badge matches the package
  manifest; bump it in the release commit.
  `./dist/corpo.css` is unchanged so GitHub Pages keeps resolving `pages_dist/dist`.
  The CSS build also copies that file to `site/dist/corpo.css`, which is gitignored,
  so the same href resolves in a built checkout.
