# Composition lint

An [oxlint](https://oxc.rs/docs/guide/usage/linter/js-plugins.html) JS plugin that catches the
statically checkable rules in [`BUILDING.md`](../BUILDING.md). It ships inside
`@nukleas/react-corpo` as `@nukleas/react-corpo/oxlint`; you need only `oxlint` (1.79 or newer)
installed.

## Enable it

In your app's `.oxlintrc.json`:

```jsonc
{
  "jsPlugins": ["@nukleas/react-corpo/oxlint"],
  "rules": {
    "corpo/no-nested-card": "error",
    "corpo/no-card-around-table": "error",
    "corpo/no-card-list": "error",
    "corpo/one-primary-action": "error",
  },
}
```

To check only screens, move the `rules` into an `overrides` entry with `files` set to your screen
globs. When a rule is wrong for one spot, disable it there and say why:

```tsx
{/* oxlint-disable-next-line corpo/no-card-list -- plan picker: separate objects, pick one */}
```

## Rules

### `corpo/no-nested-card`

A `Card` anywhere inside another `Card`, including in its props (`footer`, `title`).

```tsx
// Bad
<Card title="Customer">
  <Card title="Address">400 Harbor Rd</Card>
</Card>

// Good
<Card title="Customer">
  <Section title="Address">400 Harbor Rd</Section>
</Card>
```

### `corpo/no-card-around-table`

A `Card` whose only child (ignoring whitespace and JSX comments) is a `Table` or `DataTable`.

```tsx
// Bad
<Card title="Invoices">
  <DataTable columns={columns} rows={invoices} />
</Card>

// Good
<Section title="Invoices">
  <DataTable compact columns={columns} rows={invoices} />
</Section>
```

### `corpo/no-card-list`

A `.map()` callback whose returned root element is a `Card`: one card per record.

```tsx
// Bad
<CardGrid>
  {invoices.map((invoice) => (
    <Card key={invoice.id} title={invoice.number}>{invoice.total}</Card>
  ))}
</CardGrid>

// Good
<DataTable compact columns={columns} rows={invoices} />
```

A `CardGrid` of mapped `Stat` tiles on a dashboard is fine and isn't flagged.

### `corpo/one-primary-action`

More than one `Button` or `SplitButton` with a literal `variant="primary"` in the same scope. A
scope is the nearest enclosing function (a component, a story's `render`) or corpo dialog
(`Modal`, `Sheet`, `AlertDialog`), so a dialog's primary doesn't count against the page's. Each
branch of a conditional (`a ? <x/> : <y/>`, `a && <x/>`) is its own scope, since only one renders.

```tsx
// Bad
<>
  <Button variant="primary">Save</Button>
  <Button variant="primary">Save and send</Button>
</>

// Good
<SplitButton variant="primary" items={[{ id: 'send', label: 'Save and send', onClick: send }]}>
  Save
</SplitButton>
```

## Limits

- **Matching is by name.** An element counts as `Card`, `Table`, `Button`, … only when that name
  is imported from `@nukleas/react-corpo`, or from a relative path that resolves to
  `components/<Name>` (how this repo imports). Aliases (`import { Card as Panel }`) are followed.
  Wrappers you write around corpo components, namespace imports (`<corpo.Card>`) and re-exports
  through your own barrel are not seen.
- **It sees one file at a time.** JSX built in a helper function, stored in a variable, or passed
  through another component is checked where it's written, not where it ends up rendering.
- `no-card-list` checks the root element a `.map()` callback returns; `<li><Card/></li>` or a
  fragment around the card is not caught.
- `one-primary-action` counts literal `variant="primary"` only. `variant={tone}` and `ActionBar`
  `actions` arrays (data, not JSX) are not counted.
- Tested against oxlint 1.79. oxlint's JS plugin API is still alpha; if a later oxlint breaks
  it, upgrade `@nukleas/react-corpo`.
- **The other rules stay guide-only.** Eyebrows that repeat context, badges for totals,
  descriptions that restate the title, decorative color, icons and mono text need judgment about
  content, so there is no lint for them. Read `BUILDING.md`.
