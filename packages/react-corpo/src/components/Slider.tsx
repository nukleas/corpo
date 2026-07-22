import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Show the current numeric value beside the track. @default false */
  showValue?: boolean;
}

/** Corpo range slider — quiet accent track, no glow. */
export function Slider({ showValue = false, className, value, ...rest }: SliderProps) {
  return (
    <span className="cp-slider-wrap">
      <input type="range" className={cn('cp-slider', className)} value={value} {...rest} />
      {showValue && <span className="cp-slider-wrap__value">{value}</span>}
    </span>
  );
}
