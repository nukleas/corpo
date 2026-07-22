# Roadmap

## Shipped — 52 components

**Forms**: Button, Input, Textarea, Select, Checkbox, Radio, RadioGroup, Switch, Field, Label,
Slider, Combobox, DatePicker, Toggle, ToggleGroup, ButtonGroup, InputGroup

**Display**: Card, Badge, Table, Stat, Kbd, KbdGroup, Avatar, Skeleton, SkeletonRow, Accordion,
Modal, AlertDialog, Sheet, Separator, Tooltip, Popover, Calendar, Spreadsheet, Collapsible, Chip,
StatusDot, StatusPill, StatusBar, Empty, AspectRatio, ScrollArea, SectionHeader

**Feedback**: Alert, Progress, Spinner, Toast

**Navigation**: Tabs, Breadcrumb, Dropdown, Pagination, Command

Each ships as CSS (`cp-*` classes) + a thin React wrapper (`corpo/react`) + a full documented React
component with a Storybook story (`react-corpo`).

## Under consideration

Cyberdesign / shadcn-parity components that fit Corpo's brief (calm, light-first, business UI) but
haven't been ported yet:

- **App shell / navigation**: Sidebar, Menubar, NavigationMenu, BottomNav
- **Overlays**: ContextMenu, HoverCard, a richer DropdownMenu (nested submenus, checkable items)
- **Forms**: InputOTP, Resizable panels
- **Display**: DataTable (sortable/filterable, built on Table), Carousel, FeedItem, Item

Have an opinion on priority, or a use case that needs one of these sooner? Open an issue — see
[CONTRIBUTING.md](./CONTRIBUTING.md).

## Not planned

Cyberdesign's cyber/terminal-only families are intentionally excluded — porting them would work
against Corpo's calm, light-first brief:

Terminal, HUD (Bar/Frame/Segment), Scanner, Interference, Gauge, GlowCard, AugButton/AugPanel,
Ticker, charts, Clock, Transport, HBar, Chat.

If a genuinely business-relevant use case for one of these emerges (e.g. a plain progress gauge
without the neon treatment), it would be evaluated on its own merits rather than ported as-is.
