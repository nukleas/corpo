import type { InputHTMLAttributes } from 'react';
import { cx } from './cx';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  showValue?: boolean;
}

export function Slider({ showValue = false, className = '', value, ...rest }: SliderProps) {
  return (
    <span className="cp-slider-wrap">
      <input type="range" className={cx('cp-slider', className)} value={value} {...rest} />
      {showValue && <span className="cp-slider-wrap__value">{value}</span>}
    </span>
  );
}
