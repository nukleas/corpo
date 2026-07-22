/** Lightweight className join — filters falsy parts (no runtime dep). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
