# Building with corpo

Rules for composing app screens with `@nukleas/react-corpo`. Written for people and for coding
agents: read it before you build a screen, and follow it over your own taste.

**Dense is fine. Decoration is the enemy.** Corpo is for business software that people use all
day: tight tables, many fields, small type. Never "fix" a screen by adding whitespace, cards, or
color. Fix it by removing whatever doesn't help someone do the job.

## Never

1. **Never draw a list of records as cards.** Invoices, orders, users, licenses, accounts: a list
   of things with the same fields is a `DataTable` (or `Table`) with `compact`. Cards in a grid
   hide the columns people compare and fit a fifth as many rows.
2. **Never put a card around a table**, and never nest a card inside a card. A table has its own
   frame. Use `Section` (heading + content, no frame) to separate parts of a page.
3. **Never add an eyebrow that repeats context.** If a breadcrumb, the page title, or the nav already
   says it's a sales order, `RecordPage` gets no `eyebrow`. An eyebrow is only for a type the
   page doesn't otherwise name.
4. **Never add a badge for a total.** Badges and tab or nav counts are for numbers that ask for
   action: unread, overdue, waiting on you. "Lines 3", "Activity 12", "Files 2": no.
5. **Never color a label for decoration.** Color means status, and status is one `StatusPill` or
   a table cell's `status`. Categories and tiers ("Enterprise", "Standard") are plain text.
6. **Never write a description that restates the title.** "Sales orders: a list of sales orders"
   is noise. Leave `description` out unless it says something the title can't.
7. **Never use a row of `Stat` tiles outside a dashboard.** On a list or record page, the numbers
   belong in the table's summary row or the record's facts.
8. **Never show more than one primary action** per page or dialog, and never more than three
   visible actions in a row. Use `ActionBar` (it moves the rest into "More") or `SplitButton`.
9. **Never use mono for words.** `--corpo-font-mono` is for figures, ids, codes and keys. Dates,
   names, tiers and labels use the sans font.
10. **Never repeat a value.** If the company is in the switcher, it isn't also a fact. If the total
    is in the header, it isn't also a stat.
11. **Never invent styling.** Use corpo components and their props. If something is missing, say
    so; don't paste one-off CSS or inline colors. Layout `style` is for gaps and widths only.
12. **Never add a decorative icon, illustration, or emoji.** Icons are for navigation (SideNav,
    ModuleLauncher) and controls. `Empty` takes an icon only when it helps recognition.

## Always

- **Lists:** `DataTable compact` with sortable columns, text left, numbers right (`numeric`),
  units in the header ("Amount (USD)"), "–" for empty cells, a summary row for totals, and row
  actions in one menu. Filters go above it in a `FilterBar`, not in cards.
- **Records:** `RecordPage` with a title, one `StatusPill`, no more than 5 `facts`, an `ActionBar`,
  and a `RecordPager` when the record came from a list. Use `Tabs` for sections people switch
  between, and `aside` for activity.
- **Forms:** `FormGrid` with labels of one to three words, no colons, and `hint` only when most
  people would get it wrong without it. Mark optional fields, not required ones, when most are
  required.
- **Navigation:** `AppShell` + `SideNav` (module tree) + `Topbar` with a `Breadcrumb`. The breadcrumb
  names where you are, so the topbar `title` and the record eyebrow don't also need to.
- **Feedback:** inline `Alert` for problems on the page, `Toast` for "done", `AlertDialog` only for
  destructive or irreversible actions.
- **Copy:** sentence case, verb-first buttons ("Create invoice"), no exclamation marks, no
  "Please". One term per concept: if it's an "order" in the nav, it isn't a "sale" in the title.

## Choosing a component

| You have | Use | Not |
| --- | --- | --- |
| Many records with the same fields | `DataTable compact` | `CardGrid`, `Card` per row, `Item` list |
| A few label/value pairs | `DescriptionList` or `RecordPage` facts | a `Table` with two columns |
| Money in a ledger or statement | `Ledger`, `Statement`, `TrialBalance`, `Amount` | hand-formatted strings |
| Editable lines on a document | `LineItems` | a `DataTable` with inputs |
| Steps a document goes through | `Stepper` | badges per step |
| History of a record | `ActivityLog` | a `Timeline` of cards |
| Separate objects someone picks one of | `Card` (or `Item`) | — this is what cards are for |
| A dashboard's headline numbers | `CardGrid` of `Stat` | stats on a list page |

## Before you finish

1. Remove one thing. Find the badge, eyebrow, description, icon or card that the screen works
   without, and delete it.
2. Check the screen at 1440, 768 and 390px wide. Lists stay tables; the action bar, tabs and
   breadcrumb overflow into their menus.
3. If you used `style={...}` for anything but layout, replace it with a component or prop.

## Reference screens

Copy the structure of these Storybook examples, not their data:

- `examples-sales-order--workspace`: an order list and an order record.
- `examples-erp-workspace--all-layers`: the full app shell, with navigation, command palette and shortcuts.
- `examples-accounting-workspace--default`: ledgers and statements.

Each component's Storybook page (autodocs) lists its props. `llms.txt` in this package is the
index.
