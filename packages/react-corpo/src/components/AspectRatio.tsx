import type { HTMLAttributes, ReactNode } from 'react';

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** Width/height ratio. @default 16/9 */
  ratio?: number;
  children?: ReactNode;
}

/** Corpo aspect ratio — constrains children to a fixed width/height ratio (e.g. media embeds). */
export function AspectRatio({ ratio = 16 / 9, style, children, ...rest }: AspectRatioProps) {
  return (
    <div style={{ aspectRatio: String(ratio), overflow: 'hidden', ...style }} {...rest}>
      {children}
    </div>
  );
}
