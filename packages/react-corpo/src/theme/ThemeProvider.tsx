import {
  createContext,
  useContext,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';
import type { CpTheme } from '../lib/types';

export interface ThemeProviderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Active accent theme. Sets `theme-{name}` so semantic tokens
   * like `--corpo-accent` resolve correctly.
   * @default 'teal'
   */
  theme?: CpTheme;
  /**
   * Opt into the heritage dark scope (`.corpo-dark`).
   * @default false
   */
  dark?: boolean;
  children?: ReactNode;
}

const ThemeContext = createContext<CpTheme>('teal');

/** Read the nearest {@link ThemeProvider} theme (falls back to `teal`). */
export function useTheme(): CpTheme {
  return useContext(ThemeContext);
}

/**
 * Root theme scope for Corpo. Apply once near the app root so
 * accent tokens (`--corpo-accent`, primary buttons) resolve.
 *
 * ```tsx
 * <ThemeProvider theme="amber">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  theme = 'teal',
  dark = false,
  className,
  children,
  ...rest
}: ThemeProviderProps) {
  const value = useMemo(() => theme, [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={cn(`theme-${theme}`, dark && 'corpo-dark', className)}
        data-corpo-theme={theme}
        {...rest}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
