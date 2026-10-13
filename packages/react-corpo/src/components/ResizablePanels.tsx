import { useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

const STEP = 5;

export interface ResizablePanelsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The two panes, first to last. */
  children: [ReactNode, ReactNode];
  /** `horizontal` puts the panes side by side; `vertical` stacks them. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Controlled size of the first pane, in percent. */
  size?: number;
  /** Uncontrolled initial size of the first pane, in percent. @default 50 */
  defaultSize?: number;
  onSizeChange?: (size: number) => void;
  /** Smallest first-pane size, in percent. @default 10 */
  min?: number;
  /** Largest first-pane size, in percent. @default 90 */
  max?: number;
  /** Names the handle for assistive tech, e.g. "Resize invoice list". */
  handleLabel: string;
}

/**
 * Corpo resizable panels — two panes split by a draggable handle (the WAI-ARIA
 * window splitter). Drag the handle, or focus it and use the arrow keys
 * (Home/End jump to `min`/`max`). Bound the container's height for a vertical
 * split or for panes that scroll.
 */
export function ResizablePanels({
  children,
  orientation = 'horizontal',
  size,
  defaultSize = 50,
  onSizeChange,
  min = 10,
  max = 90,
  handleLabel,
  className,
  ...rest
}: ResizablePanelsProps) {
  const [internal, setInternal] = useState(defaultSize);
  const [dragging, setDragging] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const firstId = useId();
  const current = size ?? internal;
  const horizontal = orientation === 'horizontal';

  const resize = (next: number) => {
    const clamped = Math.round(Math.min(max, Math.max(min, next)) * 10) / 10;
    setInternal(clamped);
    onSizeChange?.(clamped);
  };

  const [back, forward] = horizontal ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
  const sizeForKey = (key: string) => {
    switch (key) {
      case back:
        return current - STEP;
      case forward:
        return current + STEP;
      case 'Home':
        return min;
      case 'End':
        return max;
      default:
        return null;
    }
  };

  return (
    <div ref={root} className={cn('cp-resizable', !horizontal && 'cp-resizable--vertical', className)} {...rest}>
      <div id={firstId} className="cp-resizable__pane" style={{ flex: `0 0 ${current}%` }}>
        {children[0]}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-label={handleLabel}
        aria-controls={firstId}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-valuenow={Math.round(current)}
        aria-valuemin={min}
        aria-valuemax={max}
        data-dragging={dragging || undefined}
        className="cp-resizable__handle"
        onKeyDown={(e) => {
          const next = sizeForKey(e.key);
          if (next === null) return;
          e.preventDefault();
          resize(next);
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
        }}
        onPointerMove={(e) => {
          const box = root.current?.getBoundingClientRect();
          if (!dragging || !box) return;
          resize(horizontal ? ((e.clientX - box.left) / box.width) * 100 : ((e.clientY - box.top) / box.height) * 100);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      />
      <div className="cp-resizable__pane">{children[1]}</div>
    </div>
  );
}
