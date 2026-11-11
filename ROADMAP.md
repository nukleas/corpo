# Roadmap

## Shipped — 0.5.0 responsive and calm chrome

Minor bump. Breaking changes, no compatibility shims. Responsive:

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

Calm chrome, in the same release:

- **Control voice is Public Sans, sentence case, weight 600, tracking 0.** Buttons,
  tabs, badges, field labels, card titles, modal and sheet titles, record fact labels,
  sidenav group titles, stat labels, the donut caption, status-bar labels, alert and
  toast titles, progress and spinner labels, breadcrumbs, description-list labels, and
  profile section titles.
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
  the package manifest, and `pnpm build` writes
  `site/dist/corpo.css` so the existing `./dist/corpo.css` href resolves in the repo.
  Pages still copies the built CSS to `pages_dist/dist`.

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

Each ships as CSS (`cp-*` classes) + a documented React component with a Storybook story
(`react-corpo`).

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

## Next: ERP navigation — menus and wayfinding for large module trees

Layered PRs, in order:

1. **Command palette** *(done, #57)* — keyboard model, `CommandDialog` (⌘K overlay), server
   record search as a `filtered` group, recent items while the query is empty.
2. **SideNav module trees** *(done, #58)* — nested collapsible groups, icons, a collapsed icon rail with
   tooltips, arrow-key navigation.
3. **Record action bar** *(done, #59)* — split button, a toolbar that moves actions into "More" when it runs
   out of room, and a record pager ("3 of 120") on `RecordPage`.
4. **Overflow** *(done, #62)* — Tabs that don't fit go into a "More" menu; long breadcrumbs collapse the middle.
5. **App-level switchers** *(done, #63)* — module launcher grid, company/entity switcher.
6. **Keyboard shortcuts** *(done, #64)* — a shortcut registry and a "?" help overlay.

## Next: no slop — functional density by default

Density is fine; corpo is for dense business screens. The problem is decorative noise that
agents add, and that corpo's own components and examples invite:

- an eyebrow above every title that repeats the breadcrumb;
- badges on everything, such as counts on every tab and nav item;
- colored uppercase tier or category labels;
- description lines that restate the heading;
- KPI stat rows on pages that aren't dashboards;
- profile and summary cards;
- record lists drawn as card grids where a tight table is clearer and denser.

The 2026-11-11 audit found it in our own examples:

- Admin console: the licenses are a grid of cards with colored tier labels, where they should be a
  compact table.
- ERP demo:
  - a "SALES ORDER" eyebrow above the title repeats the breadcrumb;
  - count badges on every tab;
  - a "Company" fact repeats the switcher.
- Every example: teal SectionHeader titles with a description and a rule under them.

Layered PRs, in order:

1. **The rules, written down and shipped.**
   - Add a "Building with corpo" guide plus `llms.txt` inside the npm package, as short "never…"
     rules with do/don't pairs. The npm package currently ships only `dist`.
   - Rules:
     - A list of records is a `Table`/`DataTable` (compact), never a card grid.
     - Cards only for genuinely separate objects, never around a table, never nested.
     - No eyebrow when the breadcrumb or title already names the type.
     - Badges only for counts that ask for action (unread, overdue), never for totals.
     - Status is one `StatusPill`, not color on labels.
     - No description that restates the title.
     - Stat rows only on dashboards.
     - Mono only for figures and ids.
     - 1 primary action, at most 3 visible actions, the rest in "More".
2. **Defaults that don't invite slop.**
   - `SectionHeader`: neutral title, and no rule unless asked for.
   - `RecordPage`: the eyebrow is documented as rare.
   - `Tabs`: counts are documented for actionable counts only.
   - `ActionBar`: primary plus 2 others visible.
   - `DataTable`/`Table`: compact, horizontal rules only.
3. **Rebuild the examples as clean reference screens**, dense and table-first, so agents copy
   the right thing.
   - Admin console licenses become a table.
   - The ERP demo drops the eyebrow, the tab counts and the duplicate facts.
4. **Composition lint for apps.** An oxlint JS plugin consumers enable:
   - `Card` inside `Card`;
   - `Card` wrapping a lone table;
   - `CardGrid` or `Card` mapped over a data array (use a table);
   - more than one primary `Button` per region;
   - an eyebrow next to a `Breadcrumb`;
   - `Badge` inside a `Tab` label or `SideNav` item without a count prop.
5. **Spacing tokens and `Stack`/`Inline`**, lower priority.
   - Component CSS uses 11 ad-hoc gaps.
   - The examples carry about 60 inline layout styles.
   - It's worth fixing for consistency, but it isn't what makes screens look like slop.

Sources: Carbon and Primer button rules, SAP Fiori action placement, ServiceTitan Anvil and
Forge card rules (no card around a lone table, no nesting), GOV.UK and GC table guidance,
Anthropic's frontend-design skill (no all-caps eyebrows, no "SaaS card kit"), and the
hvpandya, Tessera and reopt writeups on rule files and lint for LLM agents.

## Not ported from the parity list

Carousel (off-voice for corpo), and a separate Drawer — `Sheet side="bottom"` is the drawer.

## Not planned

Cyberdesign's cyber/terminal-only families are intentionally excluded — porting them would work
against Corpo's calm, light-first brief:

Terminal, HUD (Bar/Frame/Segment), Scanner, Interference, GlowCard, AugButton/AugPanel, Ticker,
Clock, Transport, HBar, Chat.

If a genuinely business-relevant use case for one of these emerges, it would be evaluated on its
own merits rather than ported as-is.
