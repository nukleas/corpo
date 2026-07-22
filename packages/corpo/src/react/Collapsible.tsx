import { useState, type ReactNode } from 'react';

export interface CollapsibleProps {
  trigger: ReactNode;
  defaultOpen?: boolean;
  children?: ReactNode;
}

export function Collapsible({ trigger, defaultOpen = false, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="cp-collapsible" data-open={open}>
      <button type="button" className="cp-collapsible__trigger" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {trigger}
        <span className="cp-collapsible__chevron" aria-hidden="true" />
      </button>
      <div className="cp-collapsible__region">
        <div className="cp-collapsible__content">
          <div className="cp-collapsible__content-inner">{children}</div>
        </div>
      </div>
    </div>
  );
}
