# Roadmap

## Shipped — 80+ components

**Forms**: Button, Input, Textarea, Select, Checkbox, Radio, RadioGroup, Switch, Field, Label,
Slider, Combobox, DatePicker, Toggle, ToggleGroup, ButtonGroup, InputGroup, Dropzone

**Display**: Card, Badge, Table, Stat, Kbd, KbdGroup, Avatar, Skeleton, SkeletonRow, Accordion,
Modal, AlertDialog, Sheet, Separator, Tooltip, Popover, Calendar, Spreadsheet, Collapsible, Chip,
StatusDot, StatusPill, StatusBar, Empty, AspectRatio, ScrollArea, SectionHeader, DescriptionList,
Timeline, Stepper, TreeView, ProfileCard, AssignmentSlots, LicenseCatalog, LicenseDetail

**Data**: LineChart, BarChart, DonutChart, Sparkline, DependencyGraph (CpDepGraph scene engine)

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

## Under consideration

Cyberdesign / shadcn-parity components that fit Corpo's brief (calm, light-first, business UI) but
haven't been ported yet, roughly in value order:

- **DataTable** — sorting/filtering/selection over the existing Table
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
