import { createContext, useContext } from 'react';

/** Wiring a Field hands its control: the id its label points at, and the hint/error ids. */
export interface FieldControl {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

export const FieldContext = createContext<FieldControl | null>(null);

/**
 * ARIA/id props for a form control rendered inside a Field. Spread before the
 * caller's own props so an explicit `id` or `aria-*` still wins.
 */
export function useFieldControlProps(error: boolean) {
  const field = useContext(FieldContext);
  return {
    id: field?.id,
    'aria-describedby': field?.describedBy,
    'aria-invalid': error || field?.invalid || undefined,
    'aria-required': field?.required || undefined,
  };
}
