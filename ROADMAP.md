# Roadmap

## Shipped — 0.6.0 calm chrome

Minor bump. Visual breaks, no compatibility shims. Package versions stay at the
current manifest until the publish workflow bumps them.

- **Control voice is Public Sans, sentence case, weight 600, tracking 0.** Buttons,
  tabs, badges, field labels, card titles, modal and sheet titles, record fact labels,
  sidenav group titles, stat labels, the donut caption, and status-bar labels.
  Uppercase mono remains on `.corpo-label`, the record eyebrow, and table headers.
  Figures, ids, kbd, timestamps, and numeric inputs stay mono.
- **Radius is 6px on controls and 8px on surfaces.** The switch pill is unchanged.
- **Cards, profile cards, and sheet edges use `border-dim`.** `accent-border` remains
  on the DataTable bulk bar only. The selected feed edge stays a solid accent stroke
  (`accent-edge`, falling back to `accent`). Record sections are cards, so they
  follow the card stroke. There is no separate record-section border.
- **Buttons and fields.** Neutral default hover, a fill press instead of a 1px nudge,
  disabled colors at full opacity, and a 2px focus ring. `Button` takes `loading`
  (`aria-busy`, stable width). Textarea and select follow the input treatment.
- **Dark accent is split so it passes WCAG 2.1 AA.** Fill `#0f6f80` with white text,
  edge `#1a7f90`, text and focus `#62b0bb`. One token cannot be all three. Light accent
  stays `#0f6f80`. Amber, green, red, and steel are unchanged.
- **Empty icons have no circle.** The docs h1 is Public Sans, the version badge matches
  the package manifest (`v0.4.0` until publish), and `pnpm build` writes
  `site/dist/corpo.css` so the existing `./dist/corpo.css` href resolves in the repo.
  Pages still copies the built CSS to `pages_dist/dist`.

## Shipped — 0.5.0 responsive

Minor bump. Three breaking changes, no compatibility shims:

- **Form grids follow their container.** `.cp-form` and `.cp-form-section` are the inline-size
  container. `.cp-form-grid--{2,3,4}` steps down to 2 columns at 768px and 1 column at 480px of
  *that container*. `FormGrid` now wraps the grid in `.cp-form`. A standalone `.cp-form-grid`
  without one of those ancestors no longer collapses with the viewport.
- **Top bars no longer wrap at 480px.** Link rows (`.cp-topbar__nav`, `.cp-navmenu__list`,
  `.cp-menubar`) stay on one line, scroll inside themselves, and fade at the edge only when they
  overflow. `.cp-topbar__actions` stays on screen.
- **Coarse pointers raise control height.** Under `@media (pointer: coarse)`, `--corpo-control-h`
  and `--corpo-control-h-sm` are 44px. Fine pointers keep 36px / 28px.

Also in this release: `CardGrid` (`.cp-card-grid`) collapses by its own container; the status bar
scrolls inside itself instead of widening the page; menus, popovers, combobox lists, and nav panels
flip and shift to stay in the viewport (no positioning dependency). The reference layout is the
*Examples/Responsive app shell* story: top bar at every width, sidebar drawer below 768px, bottom
nav on phones.

## Shipped — 80+ components

**Forms**: Button, Input, Textarea, Select, Checkbox, Radio, RadioGroup, Switch, Field, Label,
Slider, Combobox (keyboard, async lookup, create-new), MultiSelect, DatePicker, DateRangePicker (presets), NumberInput, OtpInput, FormGrid, FormSection, Toggle,
ToggleGroup, ButtonGroup, InputGroup, Dropzone

**Display**: Card, Badge, Table, Stat, Kbd, KbdGroup, Avatar, Skeleton, SkeletonRow, Accordion,
Modal, AlertDialog, Sheet, Separator, Tooltip, Popover, Calendar, Spreadsheet, Collapsible, Chip,
StatusDot, StatusPill, StatusBar, Empty, AspectRatio, ScrollArea, ResizablePanels, SplitView, Section, SectionHeader, DescriptionList, HoverCard,
Timeline, ActivityLog, AttachmentList, Approvals, NotificationInbox, Item, FeedItem, Stepper, TreeView, FilterBar, ProfileCard, AssignmentSlots, LicenseCatalog, LicenseDetail

**Data**: LineChart, BarChart, DonutChart, Sparkline, Gauge, ActivityGrid (sequential `--corpo-chart-seq-*` ramp), DependencyGraph (CpDepGraph scene engine)

**Accounting**: Amount, footing rules (`cp-foot`), Ledger (collapsible split postings), TAccount,
TrialBalance, JournalEntry (optional Combobox account pickers), Statement, LineItems (order/invoice
lines with catalog pickers and subtotal/tax/total), plus Spreadsheet
balance cells. TrialBalance has an account tree (`children` rows, on the DataTable tree styling).
Deferred from this family: cell flash-on-change and a formula bar.

**DataTable**: sorting/filtering/selection over the Table chassis — sortable headers on raw
values, toolbar quick filter, controlled checkbox selection, and a dense `grid` mode (gridlines,
sticky header, zebra rows, pinned first column) shared with Table, a sticky totals row from
per-column `summary`, and a bulk action bar for selected rows.

**Records**: RecordPage (header, status, actions, key facts, aside) — with FormSection and LineItems,
the *Examples/Sales order* story builds a full list → record → lines → totals screen.

**Feedback**: Alert, Progress, Spinner, Toast

**Navigation**: Tabs (with panels; WAI-ARIA keyboard model), Breadcrumb, Dropdown / ContextMenu / Menubar
(submenus, checkbox and radio items), NavigationMenu, BottomNav, Pagination, Command, AppShell, SideNav, Topbar

**Quality gates** (CI): Prettier, oxlint (anti-slop, React, hooks, jsx-a11y), stylelint, a design-system
contract check (classes, tokens, package parity, story coverage), and the Storybook test runner — every
story renders and passes axe WCAG 2.1 AA, with play functions for interactive components.

Each ships as CSS (`cp-*` classes) + a thin React wrapper (`corpo/react`) + a full documented React
component with a Storybook story (`react-corpo`).

## Next: CpRelGraph — large interactive relationship graphs

A Cytoscape.js alternative in the corpo register: zero-dep vanilla scene engine (`corpo/relgraph`,
same pattern as `corpo/depgraph`) + thin React wrapper. Token-styled — colors and type come from
`--corpo-*` custom properties, not a JSON style language — and WCAG-conscious (keyboard traversal,
reduced-motion, focus management). Target: 10k nodes / 20k edges at interactive framerates.

Built in layers, each shippable on its own:

1. **Core renderer** *(shipped)* — canvas 2D with devicePixelRatio-crisp text, quadtree hit-testing, viewport
   culling, pan/zoom/fit, hover/select, neighborhood highlighting, level-of-detail labels (labels
   surface as you zoom — the calm answer to hairballs). Accepts precomputed positions; reuses the
   depgraph tier layout for DAG input.
2. **Layouts** *(shipped)* — Barnes-Hut force-directed in a Web Worker with progressive settle (the graph is
   usable while it converges); radial/concentric; the depgraph layered layout promoted to a shared
   module.
3. **Navigating big graphs** *(shipped)* — gutter label packing with leader lines, kind/group
   filters with edge auto-hiding, scope drill-down, search-and-jump, node dragging with position
   persistence, box-select, minimap.
4. **Power features** — cluster collapse/expand, path tracing (animate a route through the graph),
   PNG/SVG export. A WebGL renderer only if a real use case outgrows canvas.

Explicitly not borrowed from cyberdesign: the isometric projection, hand-authored coordinates, and
innerHTML-rebuild render loop — corpo's engine does automatic layout and incremental drawing.

## Next: dense data grid — DataTable that feels like a spreadsheet

Agents building with corpo default to stacks of Cards for record-shaped data. The fix is a DataTable
dense and keyboardable enough to be the obvious choice. This grows `DataTable` (column-keyed
records) rather than adding a third table component; keyboard behavior lives in `react-corpo` (the
Combobox/Command precedent), and `corpo` owns only the visual states.

Built in layers, each shippable on its own:

1. **Dense grid chassis** *(shipped)* — `cp-table--grid`: full gridlines, ~28px rows, tabular
   numerals, sticky header inside a bounded height, `cp-table--striped` zebra rows, and
   `cp-table--pin-first` to pin the first data column (plus the selection column). Table and
   DataTable take `grid` / `striped` / `pinFirstColumn`. The README quick-starts now lead with a
   DataTable grid instead of a Card — the docs were why agents reached for Cards.
2. **Keyboard cell navigation** *(shipped)* — ARIA grid pattern on the existing `<table>`: roving tabindex,
   arrows / Home / End / PageUp / PageDown, a visible cell focus ring, Enter/Space act on the row
   (`onRowActivate`, Space selects when `selectable`). Read-only; on by default in `grid` mode.
3. **Range selection + clipboard** *(shipped)* — Shift+arrow, Shift+click, and drag ranges with a range CSS
   state; Cmd/Ctrl+C copies as TSV so it pastes cleanly into Excel/Sheets.
4. **Columns** *(shipped)* — resize handles (`onColumnResize`; widths reported to the caller, not
   persisted internally) and row grouping. *Tree rows shipped:* `DataTableRow.children` makes a treegrid (expand/collapse, ArrowRight/
   ArrowLeft, filter keeps ancestors), and TrialBalance's account tree uses the same tree styling.
5. **Spreadsheet on the grid** *(shipped)* — rebuild `Spreadsheet` as a preset over the same grid (A1 headers,
   row numbers, editable cells) so corpo has one keyboard/selection model, not two. Inline editing
   lands here, not in the DataTable layers.
6. **Row virtualization** *(shipped)* — `virtualize` on a height-bounded grid renders only the rows in
   view (TanStack Virtual, `@tanstack/react-virtual`); keyboard, ranges and editing still cover every row.

## Next: ERP readiness — business-document screens

Corpo covers primitives, overlays, the accounting family, charts, and graphs. An ERP is built from
record-management patterns on top of those: documents with line items, totals, lifecycles, and
bulk operations. The goal of the first four layers is one end-to-end proof point — a complete
sales-order screen (list → record → lines → totals) built only from corpo components.

1. **DataTable totals + bulk actions** *(shipped)* — a `<tfoot>` summary row computed from the filtered rows
   (per-column `summary`, `sumColumn` helper), sticky at the bottom of a grid; a bulk action bar that
   appears when rows are selected (count, caller's actions, clear selection).
2. **NumberInput + DateRangePicker** *(shipped)* — numeric entry with grouping, stepping, clamping,
   and prefix/suffix addons; a range picker with calendar-period presets (fiscal periods are
   presets the page supplies).
3. **Line-item editor** *(shipped as `LineItems`)* — product lookup × qty × unit price × discount × tax = line total, add/remove
   rows, and a subtotal/tax/total block. The general form of `JournalEntry`.
4. **Record page layout + form grid** *(shipped as `RecordPage`, `FormSection`, `FormGrid`)* — document header (number, status, key fields, primary
   actions), sectioned multi-column form grid, and a side panel slot for activity and attachments.

The sales-order screen works (*Examples/Sales order*). Async entity lookup (Combobox `onQueryChange`,
rich rows, "create new…") and multi-select / tag input (`MultiSelect`) have shipped, and so has a filter bar with saved views (`FilterBar` in the DataTable `toolbar`, pill
Tabs as the view switcher). An activity log (`ActivityLog`: comments, field-change
audit, events) has shipped too, and so has an attachment list (`AttachmentList`). Document approvals (`Approvals`, with
`Stepper` as the lifecycle path) have shipped. So has the tree grid (`DataTableRow.children`). So has the
master–detail split view (`SplitView`). So has a notification inbox (`NotificationInbox`) — the ERP
screen list is done. Module-specific and deferred: Kanban,
Gantt (over the depgraph engine), pivot report, resource scheduler, print layout. Permission matrix
and import wizard are recipes over existing components, not new components.

## Not ported from the parity list

Carousel (off-voice for corpo), and a separate Drawer — `Sheet side="bottom"` is the drawer.

## Not planned

Cyberdesign's cyber/terminal-only families are intentionally excluded — porting them would work
against Corpo's calm, light-first brief:

Terminal, HUD (Bar/Frame/Segment), Scanner, Interference, GlowCard, AugButton/AugPanel, Ticker,
Clock, Transport, HBar, Chat.

If a genuinely business-relevant use case for one of these emerges, it would be evaluated on its
own merits rather than ported as-is.
