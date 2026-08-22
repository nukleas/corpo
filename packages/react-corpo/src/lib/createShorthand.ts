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
    // This factory IS the shorthand boundary parser — its whole job is to
    // classify the runtime shape of `value` (nil/boolean, element, props
    // object, or primitive) before any typed code consumes it.
    if (value == null || value === true || value === false) return null;
    const { defaultProps, overrideProps, key } = options;

    // SAFETY: the branches exhaust the shorthand contract — an element is a
    // `<Parent.Item>` whose props are the item's props; nil/boolean and
    // elements excluded, a remaining object is a partial props object; and
    // the only shorthand left after that is the primitive form V.
    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- boundary shape classification (see above)
    const usersProps: Partial<P> = isValidElement(value)
      ? (value.props as Partial<P>)
      : // oxlint-disable-next-line anti-slop/no-runtime-typeof -- boundary shape classification (see above)
        typeof value === 'object'
        ? (value as Partial<P>)
        : mapValueToProps(value as V);

    // SAFETY: the three merge layers are all Partial<P>; required members are
    // the caller's responsibility exactly as with JSX spread. `key` is
    // extracted by React, not forwarded to the component.
    const props = { ...defaultProps, ...usersProps, ...overrideProps } as P & { key?: string | number };
    const className = cn(defaultProps?.className, usersProps.className, overrideProps?.className);
    if (className) props.className = className;
    if (key != null) props.key = key;

    if (isValidElement(value)) return cloneElement(value, props);
    return createElement(Component, props);
  };
}
