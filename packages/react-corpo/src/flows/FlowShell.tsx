import type { ReactNode } from 'react';
import { ThemeProvider } from '../theme/ThemeProvider';

export interface FlowShellProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}

/**
 * Shared chrome for the "Flows" storybook examples. Stays on corpo's normal
 * calm, light-first look on purpose — the "cyberpunk megacorp" register here
 * comes entirely from the copy (cheerful HR voice with a quiet edge), not
 * from a dark/neon reskin. That's cyberdesign's job.
 */
export function FlowShell({ title, subtitle, children }: FlowShellProps) {
  return (
    <ThemeProvider theme="teal" style={{ background: 'var(--corpo-bg)', color: 'var(--corpo-text)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '4px 4px 40px' }}>
        <h1 style={{ fontSize: 'var(--corpo-text-xl)', margin: '0 0 8px' }}>{title}</h1>
        {subtitle && (
          <p style={{ maxWidth: '58ch', margin: '0 0 20px', fontSize: 'var(--corpo-text-sm)' }}>{subtitle}</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>
      </div>
    </ThemeProvider>
  );
}
