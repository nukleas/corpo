import type { HTMLAttributes, ReactNode } from 'react';

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: number;
  children?: ReactNode;
}

export function AspectRatio({ ratio = 16 / 9, style, children, ...rest }: AspectRatioProps) {
  return (
    <div style={{ aspectRatio: String(ratio), overflow: 'hidden', ...style }} {...rest}>
      {children}
    </div>
  );
}
