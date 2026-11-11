import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { isApple } from '../lib/shortcut-keys';
import { Button } from './Button';
import { CommandDialog } from './Command';
import { Field } from './Field';
import { Input } from './Input';
import { ShortcutKeys, ShortcutsProvider, useShortcut } from './Shortcuts';

const meta: Meta<typeof ShortcutsProvider> = {
  title: 'Navigation/Shortcuts',
  component: ShortcutsProvider,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ShortcutsProvider>;

function Workspace() {
  const [page, setPage] = useState('Dashboard');
  const [palette, setPalette] = useState(false);
  useShortcut({ keys: 'mod+k', description: 'Open command palette', onTrigger: () => setPalette(true) });
  useShortcut({
    keys: 'g i',
    description: 'Go to invoices',
    group: 'Navigation',
    onTrigger: () => setPage('Invoices'),
  });
  useShortcut({
    keys: 'g o',
    description: 'Go to sales orders',
    group: 'Navigation',
    onTrigger: () => setPage('Sales orders'),
  });
  useShortcut({ keys: 'n', description: 'New invoice', group: 'Invoices', onTrigger: () => setPage('New invoice') });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
      <p style={{ margin: 0 }}>
        Page: <strong>{page}</strong>
      </p>
      <p style={{ margin: 0, fontSize: 'var(--corpo-text-sm)', color: 'var(--corpo-text-muted)' }}>
        Try <ShortcutKeys keys="g i" />, <ShortcutKeys keys="mod+k" /> or <ShortcutKeys keys="?" />.
      </p>
      <Field label="Memo">
        <Input placeholder="Typing here does not trigger single-key shortcuts" />
      </Field>
      <Button onClick={() => setPalette(true)}>Search</Button>
      <CommandDialog
        open={palette}
        onClose={() => setPalette(false)}
        groups={[
          {
            id: 'go',
            label: 'Go to',
            items: [
              {
                id: 'inv',
                label: 'Invoices',
                shortcut: <ShortcutKeys keys="g i" />,
                onSelect: () => setPage('Invoices'),
              },
              {
                id: 'so',
                label: 'Sales orders',
                shortcut: <ShortcutKeys keys="g o" />,
                onSelect: () => setPage('Sales orders'),
              },
            ],
          },
        ]}
      />
    </div>
  );
}

/**
 * Components register shortcuts with `useShortcut`; the provider owns the one
 * listener and the help overlay (`?` or `mod+/`). Single-key shortcuts are
 * ignored while typing and can be turned off in the overlay (WCAG 2.1.4).
 */
export const Registry: Story = {
  render: () => (
    <ShortcutsProvider>
      <Workspace />
    </ShortcutsProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const page = (name: string) => canvas.getByText(name, { selector: 'strong' });
    const mod = isApple() ? 'Meta' : 'Control';
    // Leave any field, so single-key shortcuts apply.
    const leaveField = () => {
      const active = canvasElement.ownerDocument.activeElement;
      if (active instanceof HTMLElement) active.blur();
    };
    leaveField();

    await userEvent.keyboard('gi');
    await expect(page('Invoices')).toBeInTheDocument();
    await userEvent.keyboard('n');
    await expect(page('New invoice')).toBeInTheDocument();

    // Not while typing in a field.
    await userEvent.type(canvas.getByRole('textbox', { name: 'Memo' }), 'go');
    await expect(page('New invoice')).toBeInTheDocument();

    // A modifier shortcut works from a field.
    await userEvent.keyboard(`{${mod}>}k{/${mod}}`);
    const palette = await body.findByRole('dialog', { name: 'Command palette' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(palette).not.toBeInTheDocument());

    // `?` opens the help overlay, grouped, and the switch turns single-key shortcuts off.
    leaveField();
    await userEvent.keyboard('?');
    const help = await body.findByRole('dialog', { name: 'Keyboard shortcuts' });
    await expect(within(help).getByRole('heading', { name: 'Navigation' })).toBeInTheDocument();
    await expect(within(help).getByText('Go to invoices')).toBeInTheDocument();
    await userEvent.click(within(help).getByRole('switch', { name: 'Single-key shortcuts' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());

    leaveField();
    await userEvent.keyboard('go');
    await expect(page('New invoice')).toBeInTheDocument();
    // …while mod+/ still opens help.
    await userEvent.keyboard(`{${mod}>}/{/${mod}}`);
    await expect(await body.findByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

/** `ShortcutKeys` renders a shortcut string as keycaps — for menus, tooltips and command items. */
export const Keys: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ShortcutKeys keys="mod+k" />
      <ShortcutKeys keys="shift+mod+p" />
      <ShortcutKeys keys="g i" />
      <ShortcutKeys keys="?" />
    </div>
  ),
};
