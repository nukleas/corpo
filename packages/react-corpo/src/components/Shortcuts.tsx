import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';
import { isCharacterStep, matchesStep, parseShortcut, shortcutLabels, type ShortcutStep } from '../lib/shortcut-keys';
import { KbdGroup } from './KbdGroup';
import { Modal } from './Modal';
import { Switch } from './Switch';

export interface ShortcutOptions {
  /** One shortcut string or alternatives: `'mod+k'`, `'?'`, `'g i'` (g, then i). `mod` is ⌘ on a Mac, Ctrl elsewhere. */
  keys: string | string[];
  /** Shown in the help overlay. Verb-first: "Open command palette". */
  description: string;
  /** Help-overlay heading. @default 'General' */
  group?: string;
  onTrigger: () => void;
  /** @default true */
  enabled?: boolean;
}

interface Entry {
  keys: string[];
  steps: ShortcutStep[][];
  description: string;
  group: string;
  enabled: boolean;
  run: () => void;
}

interface Registry {
  register: (id: string, entry: Entry) => () => void;
  entries: Entry[];
  characterKeys: boolean;
  setCharacterKeys: (on: boolean) => void;
}

const ShortcutsContext = createContext<Registry | null>(null);

const SEQUENCE_MS = 1000;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]') !== null);

export interface ShortcutsProviderProps {
  children?: ReactNode;
  /**
   * Single-character shortcuts (`?`, `g i`) start on; users can turn them off in the help
   * overlay (WCAG 2.1.4). Persist the choice with `onCharacterKeysChange`. @default true
   */
  defaultCharacterKeys?: boolean;
  onCharacterKeysChange?: (on: boolean) => void;
}

/**
 * Corpo keyboard shortcuts — one keydown listener for the app, a registry that
 * components add to with {@link useShortcut}, and a help overlay listing every
 * registered shortcut (`?` or `mod+/`). Shortcuts without a modifier are
 * ignored while typing in a field, and users can turn them off.
 */
export function ShortcutsProvider({
  children,
  defaultCharacterKeys = true,
  onCharacterKeysChange,
}: ShortcutsProviderProps) {
  const map = useRef(new Map<string, Entry>());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [characterKeys, setCharacterKeysState] = useState(defaultCharacterKeys);
  const [helpOpen, setHelpOpen] = useState(false);
  const pending = useRef<{ steps: ShortcutStep[]; at: number }[]>([]);

  // Stable, so registering (which updates `entries`) never re-runs a useShortcut effect.
  const register = useCallback((id: string, entry: Entry) => {
    map.current.set(id, entry);
    setEntries([...map.current.values()]);
    return () => {
      map.current.delete(id);
      setEntries([...map.current.values()]);
    };
  }, []);

  const registry = useMemo<Registry>(
    () => ({
      register,
      entries,
      characterKeys,
      setCharacterKeys: (on) => {
        setCharacterKeysState(on);
        onCharacterKeysChange?.(on);
      },
    }),
    [register, entries, characterKeys, onCharacterKeysChange],
  );

  // Layout effects, here and in useShortcut: shortcuts work as soon as the tree mounts.
  useLayoutEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.repeat || ['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
      const typing = isTyping(e.target);
      const usable = (step: ShortcutStep) => !isCharacterStep(step) || (characterKeys && !typing);
      const now = Date.now();
      // Sequences already under way, then every shortcut's first step. Later registrations win.
      const live = pending.current.filter((p) => now - p.at < SEQUENCE_MS);
      const candidates = [...map.current.values()]
        .reverse()
        .filter((entry) => entry.enabled)
        .flatMap((entry) => entry.steps.map((steps) => ({ entry, steps })));

      for (const { steps } of live) {
        const hit = candidates.find(
          (c) => c.steps.length === steps.length + 1 && steps.every((s, i) => c.steps[i] === s),
        );
        const last = hit?.steps[steps.length];
        if (hit && last && usable(last) && matchesStep(last, e)) {
          e.preventDefault();
          pending.current = [];
          hit.entry.run();
          return;
        }
      }
      pending.current = [];
      for (const { entry, steps } of candidates) {
        const first = steps[0];
        if (!first || !usable(first) || !matchesStep(first, e)) continue;
        if (steps.length === 1) {
          e.preventDefault();
          entry.run();
          return;
        }
        pending.current.push({ steps: steps.slice(0, 1), at: now });
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [characterKeys]);

  return (
    <ShortcutsContext.Provider value={registry}>
      <HelpShortcut onOpen={() => setHelpOpen(true)} />
      {children}
      <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </ShortcutsContext.Provider>
  );
}

function HelpShortcut({ onOpen }: { onOpen: () => void }) {
  useShortcut({ keys: ['?', 'mod+/'], description: 'Show keyboard shortcuts', onTrigger: onOpen });
  return null;
}

/**
 * Register a shortcut for as long as the calling component is mounted. The
 * newest registration of a key wins, so a page can take over a global key.
 * Needs a {@link ShortcutsProvider} above it.
 */
export function useShortcut({ keys, description, group = 'General', onTrigger, enabled = true }: ShortcutOptions) {
  const registry = useContext(ShortcutsContext);
  if (!registry) throw new Error('useShortcut needs a <ShortcutsProvider> above it');
  const { register } = registry;
  const id = useId();
  const handler = useRef(onTrigger);
  useEffect(() => {
    handler.current = onTrigger;
  });
  const list = Array.isArray(keys) ? keys : [keys];
  const signature = list.join('|');
  useLayoutEffect(() => {
    const all = signature.split('|');
    // Parsed once per registration: the listener compares steps by identity within a shortcut.
    return register(id, {
      keys: all,
      steps: all.map(parseShortcut),
      description,
      group,
      enabled,
      run: () => handler.current(),
    });
  }, [register, id, signature, description, group, enabled]);
}

export interface ShortcutKeysProps extends HTMLAttributes<HTMLSpanElement> {
  /** A shortcut string — `'mod+k'`, `'g i'`. */
  keys: string;
}

/** A shortcut string as keycaps, with "then" between the steps of a sequence. */
export function ShortcutKeys({ keys, className, ...rest }: ShortcutKeysProps) {
  const steps = shortcutLabels(keys);
  return (
    <span className={cn('cp-shortcut-keys', className)} {...rest}>
      {steps.map((labels, i) => (
        <span key={i} className="cp-shortcut-keys__step">
          {i > 0 && <span className="cp-shortcut-keys__then">then</span>}
          <KbdGroup keys={labels} />
        </span>
      ))}
    </span>
  );
}

function ShortcutsHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const registry = useContext(ShortcutsContext);
  const switchId = useId();
  if (!registry) return null;
  const groups = new Map<string, Entry[]>();
  for (const entry of registry.entries) groups.set(entry.group, [...(groups.get(entry.group) ?? []), entry]);

  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts">
      <div className="cp-shortcuts">
        {[...groups].map(([group, list]) => (
          <section key={group} className="cp-shortcuts__group" aria-labelledby={`${switchId}-${group}`}>
            <h3 id={`${switchId}-${group}`} className="cp-shortcuts__title">
              {group}
            </h3>
            <dl className="cp-shortcuts__list">
              {list.map((entry) => (
                <div key={entry.description} className="cp-shortcuts__row">
                  <dt className="cp-shortcuts__description">{entry.description}</dt>
                  <dd className="cp-shortcuts__keys">
                    {entry.keys.map((k, i) => (
                      <span key={k} className="cp-shortcuts__alt">
                        {i > 0 && <span className="cp-shortcuts__or">or</span>}
                        <ShortcutKeys keys={k} />
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <div className="cp-shortcuts__setting">
          <Switch
            label="Single-key shortcuts"
            checked={registry.characterKeys}
            onChange={(e) => registry.setCharacterKeys(e.target.checked)}
            aria-describedby={`${switchId}-hint`}
          />
          <p id={`${switchId}-hint`} className="cp-shortcuts__hint">
            Shortcuts like ? and G then I. Turn off if they get in the way of a screen reader or voice control.
          </p>
        </div>
      </div>
    </Modal>
  );
}
