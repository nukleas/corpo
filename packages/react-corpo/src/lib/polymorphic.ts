import type { ComponentPropsWithoutRef, ElementType } from 'react';

/**
 * Props for a component that renders as a configurable element
 * (semantic-ui-react's `as` prop, typed): the component's own props, `as`,
 * and the rendered element's attributes — `<Button as="a" href>` typechecks
 * `href`, `<Button as={Link} to>` typechecks `to`.
 */
export type PolymorphicProps<C extends ElementType, OwnProps> = OwnProps & {
  /** Element or component to render as. */
  as?: C;
} & Omit<ComponentPropsWithoutRef<C>, keyof OwnProps | 'as'>;
