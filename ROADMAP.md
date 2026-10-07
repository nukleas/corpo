# Roadmap

## Shipped — 80+ components

**Forms**: Button, Input, Textarea, Select, Checkbox, Radio, RadioGroup, Switch, Field, Label,
Slider, Combobox, DatePicker, Toggle, ToggleGroup, ButtonGroup, InputGroup, Dropzone

**Display**: Card, Badge, Table, Stat, Kbd, KbdGroup, Avatar, Skeleton, SkeletonRow, Accordion,
Modal, AlertDialog, Sheet, Separator, Tooltip, Popover, Calendar, Spreadsheet, Collapsible, Chip,
StatusDot, StatusPill, StatusBar, Empty, AspectRatio, ScrollArea, SectionHeader, DescriptionList,
Timeline, Stepper, TreeView, ProfileCard, AssignmentSlots, LicenseCatalog, LicenseDetail

**Data**: LineChart, BarChart, DonutChart, Sparkline, DependencyGraph (CpDepGraph scene engine)

**Accounting**: Amount, footing rules (`cp-foot`), Ledger (collapsible split postings), TAccount,
TrialBalance, JournalEntry (optional Combobox account pickers), Statement, plus Spreadsheet
balance cells. Deferred from this family: cell flash-on-change, a formula bar, and a TrialBalance
account tree (best built on DataTable grouping).

**DataTable**: sorting/filtering/selection over the Table chassis — sortable headers on raw
values, toolbar quick filter, controlled checkbox selection, and a dense `grid` mode (gridlines,
sticky header, zebra rows, pinned first column) shared with Table.

**Feedback**: Alert, Progress, Spinner, Toast

**Navigation**: Tabs, Breadcrumb, Dropdown, Pagination, Command, AppShell, SideNav, Topbar

Each ships as CSS (`cp-*` classes) + a thin React wrapper (`corpo/react`) + a full documented React
component with a Storybook story (`react-corpo`).

## Next: CpRelGraph — large interactive relationship graphs

A Cytoscape.js alternative in the corpo register: zero-dep vanilla scene engine (`corpo/relgraph`,
same pattern as `corpo/depgraph`) + thin React wrapper. Token-styled — colors and type come from
`--corpo-*` custom properties, not a JSON style language — and WCAG-conscious (keyboard traversal,
reduced-motion, focus management). Target: 10k nodes / 20k edges at interactive framerates.

Built in layers, each shippable on its own:

1. **Core renderer** — canvas 2D with devicePixelRatio-crisp text, quadtree hit-testing, viewport
   culling, pan/zoom/fit, hover/select, neighborhood highlighting, level-of-detail labels (labels
   surface as you zoom — the calm answer to hairballs). Accepts precomputed positions; reuses the
   depgraph tier layout for DAG input.
2. **Layouts** — Barnes-Hut force-directed in a Web Worker with progressive settle (the graph is
   usable while it converges); radial/concentric; the depgraph layered layout promoted to a shared
   module.
3. **Navigating big graphs** — ported from cyberdesign's iso engine: gutter label packing with
   leader lines, multi-axis filters with edge auto-hiding, scope drill-down; plus search-and-jump,
   node dragging with position persistence, box-select, minimap.
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
2. **Keyboard cell navigation** — ARIA grid pattern on the existing `<table>`: roving tabindex,
   arrows / Home / End / PageUp / PageDown, a visible cell focus ring, Enter/Space act on the row.
   Read-only.
3. **Range selection + clipboard** — Shift+arrow, Shift+click, and drag ranges with a range CSS
   state; Cmd/Ctrl+C copies as TSV so it pastes cleanly into Excel/Sheets.
4. **Columns** — resize handles (widths reported to the caller, not persisted internally) and row
   grouping, which unlocks the deferred TrialBalance account tree.
5. **Spreadsheet on the grid** — rebuild `Spreadsheet` as a preset over the same grid (A1 headers,
   row numbers, editable cells) so corpo has one keyboard/selection model, not two. Inline editing
   lands here, not in the DataTable layers.
6. **Row virtualization** — only once a real use case outgrows plain rendering. Open decision:
   add a dependency (e.g. TanStack Virtual) to the published `react-corpo` vs a small in-house
   windowing hook.

## Under consideration

Cyberdesign / shadcn-parity components that fit Corpo's brief (calm, light-first, business UI) but
haven't been ported yet, roughly in value order:

- **Resizable** split panes
- **Overlays**: ContextMenu, HoverCard, a richer DropdownMenu (nested submenus, checkable items)
- **App shell / navigation**: Menubar, NavigationMenu, Drawer, BottomNav (corpo has no mobile nav)
- **Forms**: InputOTP
- **Display**: Item (generic list-row primitive), Carousel, FeedItem
- **Data**: Gauge (calm radial KPI meter — cyberdesign's core is neutral, its neon is all tokens),
  ActivityGrid (contribution-style heatmap)

Have an opinion on priority, or a use case that needs one of these sooner? Open an issue — see
[CONTRIBUTING.md](./CONTRIBUTING.md).

## Not planned

Cyberdesign's cyber/terminal-only families are intentionally excluded — porting them would work
against Corpo's calm, light-first brief:

Terminal, HUD (Bar/Frame/Segment), Scanner, Interference, GlowCard, AugButton/AugPanel, Ticker,
Clock, Transport, HBar, Chat.

If a genuinely business-relevant use case for one of these emerges, it would be evaluated on its
own merits rather than ported as-is.
