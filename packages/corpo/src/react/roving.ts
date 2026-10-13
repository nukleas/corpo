import type { KeyboardEvent } from 'react';

const STEP_KEYS = {
  horizontal: ['ArrowLeft', 'ArrowRight'],
  vertical: ['ArrowUp', 'ArrowDown'],
} as const;

const enabled = (el: HTMLElement | null): el is HTMLElement =>
  el !== null && !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true';

/**
 * Roving-focus keyboard model shared by tablists, menus and toolbars: arrow
 * keys step to the previous/next enabled item (wrapping), Home and End jump to
 * the ends. Focuses the target and returns its index in `items`, or -1 when
 * the key isn't part of the model (the event is then left untouched).
 */
export function moveRovingFocus(
  event: KeyboardEvent,
  items: (HTMLElement | null)[],
  orientation: 'horizontal' | 'vertical' = 'horizontal',
): number {
  const [prev, next] = STEP_KEYS[orientation];
  const usable = items.filter(enabled);
  if (usable.length === 0) return -1;
  const at = usable.findIndex((el) => el === event.target);

  let target: HTMLElement | undefined;
  if (event.key === prev) target = usable[(at - 1 + usable.length) % usable.length];
  else if (event.key === next) target = usable[(at + 1) % usable.length];
  else if (event.key === 'Home') target = usable[0];
  else if (event.key === 'End') target = usable[usable.length - 1];
  if (!target) return -1;

  event.preventDefault();
  target.focus();
  return items.indexOf(target);
}
