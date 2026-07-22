import type { InputHTMLAttributes } from 'react';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  showValue?: boolean;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Slider({ showValue = false, className = '', value, ...rest }: SliderProps) {
  return (
    <span className="cp-slider-wrap">
      <input type="range" className={cx('cp-slider', className)} value={value} {...rest} />
      {showValue && <span className="cp-slider-wrap__value">{value}</span>}
    </span>
  );
}
