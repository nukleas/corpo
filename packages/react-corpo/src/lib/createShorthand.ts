import { cloneElement, createElement, isValidElement } from 'react';
import type { ComponentType, ReactElement } from 'react';
import { cn } from './cn';

/**
 * A shorthand slot value (semantic-ui-react style):
 * - primitive (`string | number` by default) — mapped to the component's natural prop
 * - props object — spread onto the component
 * - ReactElement — cloned with the merged props
 * - `null | undefined | boolean` — renders nothing
 */
export type Shorthand<P, V = string | number> =
  | V
  | Partial<P>
  | ReactElement<Partial<P>>
  | null
  | undefined
  | boolean;

export interface ShorthandOptions<P> {
  /** Base props; the shorthand value's own props win over these. */
  defaultProps?: Partial<P>;
  /** Injected props; these win over the shorthand value's props. */
  overrideProps?: Partial<P>;
  /** React key for the created element (for list rendering). */
  key?: string | number;
}

/**
 * Builds a `Component.create(value, options)` normalizer for one component.
 * `mapValueToProps` says which prop a bare primitive fills
 * (e.g. `(value) => ({ value })` for a spreadsheet cell).
 *
 * Merge order: defaultProps ← value's props ← overrideProps;
 * classNames from all three layers are joined rather than replaced.
 */
export function createShorthandFactory<P extends { className?: string }, V = string | number>(
  Component: ComponentType<P>,
  mapValueToProps: (value: V) => Partial<P>,
) {
  return function create(value: Shorthand<P, V>, options: ShorthandOptions<P> = {}): ReactElement | null {
    if (value == null || typeof value === 'boolean') return null;
    const { defaultProps, overrideProps, key } = options;

    const usersProps: Partial<P> = isValidElement(value)
      ? (value.props as Partial<P>)
      : typeof value === 'object'
        ? (value as Partial<P>)
        : mapValueToProps(value as V);

    const props = { ...defaultProps, ...usersProps, ...overrideProps } as P & { key?: string | number };
    const className = cn(defaultProps?.className, usersProps.className, overrideProps?.className);
    if (className) props.className = className;
    if (key != null) props.key = key;

    if (isValidElement(value)) return cloneElement(value, props);
    return createElement(Component, props);
  };
}
