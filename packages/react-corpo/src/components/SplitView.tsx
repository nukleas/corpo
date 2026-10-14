import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { useMediaQuery } from '../lib/useMediaQuery';
import { Button } from './Button';
import { ResizablePanels } from './ResizablePanels';

export interface SplitViewProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The master pane — the list of records. */
  list: ReactNode;
  /** The selected record, or null when nothing is selected. */
  detail: ReactNode;
  /** What the list holds, e.g. "Invoices" — names the resize handle and the phone back button. */
  listLabel: string;
  /** Leaves the detail on a phone, where only one pane shows. Clear the selection here. */
  onBack: () => void;
  /** Shown in the detail pane while nothing is selected (wide screens). @default 'Select an item to see its details.' */
  emptyDetail?: ReactNode;
  /** First-pane size in percent. @default 35 */
  defaultSize?: number;
}

/**
 * Corpo split view — master–detail: a list beside the selected record with a
 * draggable divider ({@link ResizablePanels}). Below 768px it shows one pane
 * at a time — the list, or the detail with a back button. Bound its height.
 */
export function SplitView({
  list,
  detail,
  listLabel,
  onBack,
  emptyDetail = 'Select an item to see its details.',
  defaultSize = 35,
  className,
  ...rest
}: SplitViewProps) {
  const narrow = useMediaQuery('(max-width: 768px)');
  const hasDetail = detail != null && detail !== false;
  const detailPane = hasDetail ? (
    <div className="cp-split__pane">
      {narrow && (
        <div className="cp-split__back">
          <Button size="sm" variant="ghost" onClick={onBack}>
            ‹ {listLabel}
          </Button>
        </div>
      )}
      {detail}
    </div>
  ) : (
    <div className="cp-split__empty">{emptyDetail}</div>
  );

  return (
    <div className={cn('cp-split', className)} {...rest}>
      {narrow ? (
        hasDetail ? (
          detailPane
        ) : (
          <div className="cp-split__pane">{list}</div>
        )
      ) : (
        <ResizablePanels handleLabel={`Resize ${listLabel.toLowerCase()}`} defaultSize={defaultSize} min={20} max={60}>
          {[
            <div key="list" className="cp-split__pane">
              {list}
            </div>,
            <div key="detail" className="cp-split__detail">
              {detailPane}
            </div>,
          ]}
        </ResizablePanels>
      )}
    </div>
  );
}
