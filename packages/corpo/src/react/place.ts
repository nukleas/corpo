import { useLayoutEffect, type RefObject } from 'react';

/** Preferred edge of the anchor the floating element opens toward. */
export type PlaceSide = 'top' | 'bottom' | 'left' | 'right';
/** Cross-axis alignment. `start` is left or top; `end` is right or bottom. */
export type PlaceAlign = 'start' | 'end';
/** Viewport coordinates for the floating element's top-left corner. */
export interface PlacePoint {
  top: number;
  left: number;
}

const FLIP = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
} satisfies Record<PlaceSide, PlaceSide>;

/**
 * Flip a floating box to the opposite side when it does not fit, then shift
 * it so the whole box stays inside the viewport. No positioning library.
 */
export function placeInViewport(
  anchor: DOMRect,
  size: { width: number; height: number },
  side: PlaceSide,
  align: PlaceAlign,
  gap: number,
  viewport = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight },
  margin = 8,
): PlacePoint {
  const room = {
    top: anchor.top - gap - margin,
    bottom: viewport.height - anchor.bottom - gap - margin,
    left: anchor.left - gap - margin,
    right: viewport.width - anchor.right - gap - margin,
  };
  const along = side === 'left' || side === 'right' ? size.width : size.height;
  const used = along > room[side] && room[FLIP[side]] > room[side] ? FLIP[side] : side;

  let top: number;
  let left: number;
  if (used === 'bottom') top = anchor.bottom + gap;
  else if (used === 'top') top = anchor.top - gap - size.height;
  else top = align === 'end' ? anchor.bottom - size.height : anchor.top;

  if (used === 'right') left = anchor.right + gap;
  else if (used === 'left') left = anchor.left - gap - size.width;
  else left = align === 'end' ? anchor.right - size.width : anchor.left;

  const maxLeft = Math.max(margin, viewport.width - size.width - margin);
  const maxTop = Math.max(margin, viewport.height - size.height - margin);
  return {
    left: Math.min(Math.max(left, margin), maxLeft),
    top: Math.min(Math.max(top, margin), maxTop),
  };
}

/** Pin `floating` to `anchor` with {@link placeInViewport}. Inline styles win over the CSS anchor. */
export function placeElement(
  floating: HTMLElement,
  anchor: DOMRect,
  side: PlaceSide,
  align: PlaceAlign,
  gap: number,
  options?: { matchWidth?: boolean },
): void {
  const viewport = {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };
  const margin = 8;
  const maxH = viewport.height - margin * 2;
  const maxW = viewport.width - margin * 2;
  if (floating.scrollHeight > maxH) {
    floating.style.maxHeight = `${maxH}px`;
    floating.style.overflowY = 'auto';
  } else {
    floating.style.maxHeight = '';
    floating.style.overflowY = '';
  }
  const rect = floating.getBoundingClientRect();
  const width = Math.min(options?.matchWidth ? anchor.width : rect.width, maxW);
  const height = Math.min(rect.height, maxH);
  const next = placeInViewport(anchor, { width, height }, side, align, gap, viewport, margin);
  floating.style.position = 'fixed';
  floating.style.top = `${next.top}px`;
  floating.style.left = `${next.left}px`;
  floating.style.right = 'auto';
  floating.style.bottom = 'auto';
  floating.style.width = `${width}px`;
}

/**
 * Keep a floating element inside the viewport while `open`. Repositions on
 * scroll and resize. The anchor must already be mounted.
 */
export function usePlace<T extends HTMLElement>(
  open: boolean,
  anchorRef: RefObject<T | null>,
  floatingRef: RefObject<HTMLElement | null>,
  side: PlaceSide,
  align: PlaceAlign,
  gap = 6,
  matchWidth = false,
): void {
  useLayoutEffect(() => {
    if (!open) return;
    const run = () => {
      const anchor = anchorRef.current;
      const floating = floatingRef.current;
      if (!anchor || !floating) return;
      placeElement(floating, anchor.getBoundingClientRect(), side, align, gap, { matchWidth });
    };
    run();
    window.addEventListener('resize', run);
    window.addEventListener('scroll', run, true);
    return () => {
      window.removeEventListener('resize', run);
      window.removeEventListener('scroll', run, true);
    };
  }, [open, anchorRef, floatingRef, side, align, gap, matchWidth]);
}
