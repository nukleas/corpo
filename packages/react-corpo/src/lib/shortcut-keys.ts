/**
 * Shortcut strings: steps separated by spaces, keys in a step joined with `+`.
 * `mod` is ⌘ on Apple platforms and Ctrl elsewhere.
 *   'mod+k'   one chord
 *   '?'       one key (Shift is implied by the character)
 *   'g i'     a sequence: g, then i within a second
 */

export interface ShortcutStep {
  key: string;
  mod: boolean;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
}

export function isApple(): boolean {
  const nav: Navigator | undefined = globalThis.navigator;
  return nav !== undefined && /Mac|iPhone|iPad|iPod/.test(nav.platform || nav.userAgent);
}

export function parseShortcut(keys: string): ShortcutStep[] {
  return keys
    .trim()
    .split(/\s+/)
    .map((step) => {
      const parts = step.toLowerCase().split('+');
      const key = parts.pop() ?? '';
      return {
        key,
        mod: parts.includes('mod'),
        ctrl: parts.includes('ctrl'),
        alt: parts.includes('alt'),
        shift: parts.includes('shift'),
      };
    });
}

/** A step with no modifier fires from a plain character key — WCAG 2.1.4 lets users turn those off. */
export const isCharacterStep = (step: ShortcutStep) => !step.mod && !step.ctrl && !step.alt;

export function matchesStep(step: ShortcutStep, e: KeyboardEvent, apple = isApple()): boolean {
  const wantMeta = step.mod && apple;
  const wantCtrl = step.ctrl || (step.mod && !apple);
  if (e.metaKey !== wantMeta || e.ctrlKey !== wantCtrl || e.altKey !== step.alt) return false;
  const key = e.key.toLowerCase();
  // A letter or named key checks Shift; a symbol like `?` already encodes it.
  const symbol = step.key.length === 1 && !/[a-z0-9]/.test(step.key);
  if (!symbol && e.shiftKey !== step.shift) return false;
  return key === step.key;
}

const NAMES = new Map([
  ['escape', 'Esc'],
  ['arrowup', '↑'],
  ['arrowdown', '↓'],
  ['arrowleft', '←'],
  ['arrowright', '→'],
  ['enter', 'Enter'],
  ['space', 'Space'],
]);

/** Key labels per step, for {@link KbdGroup}: `'mod+k'` → `[['⌘', 'K']]` on a Mac. */
export function shortcutLabels(keys: string, apple = isApple()): string[][] {
  return parseShortcut(keys).map((step) => [
    ...(step.mod ? [apple ? '⌘' : 'Ctrl'] : []),
    ...(step.ctrl ? ['Ctrl'] : []),
    ...(step.alt ? [apple ? '⌥' : 'Alt'] : []),
    ...(step.shift ? ['Shift'] : []),
    NAMES.get(step.key) ?? (step.key.length === 1 ? step.key.toUpperCase() : step.key),
  ]);
}
