# Changelog

Visual breaks for the published packages. The publish workflow bumps both package
versions, tags the release, and writes the GitHub notes. This file is the in-repo
record. It does not bump `package.json`.

## Unreleased — 0.6.0 calm chrome

Breaking visual changes. No compatibility shims.

- Control labels that were uppercase mono are Public Sans, sentence case, weight 600,
  tracking 0: buttons, tabs, badges, field labels (`.cp-label`), card titles, modal
  and sheet titles, record fact labels, sidenav group titles, stat labels, the donut
  caption, and status-bar labels. Status-bar values stay mono. `.corpo-label`, the
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
  manifest (`v0.4.0` until publish; the publish workflow does not rewrite the badge).
  `./dist/corpo.css` is unchanged so GitHub Pages keeps resolving `pages_dist/dist`.
  The CSS build also copies that file to `site/dist/corpo.css`, which is gitignored,
  so the same href resolves in a built checkout.

Responsive behavior from 0.5.0 is unchanged: container form grids, top-bar scroll
fade, coarse-pointer 44px controls, and popover collision.
