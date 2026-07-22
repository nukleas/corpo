import type { ReactNode } from 'react';
import { ThemeProvider } from '../theme/ThemeProvider';

export interface FlowShellProps {
  eyebrow?: string;
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
export function FlowShell({
  eyebrow = 'Halcyon Group — People Success',
  title,
  subtitle,
  children,
}: FlowShellProps) {
  return (
    <ThemeProvider theme="teal" style={{ background: 'var(--corpo-bg)', color: 'var(--corpo-text)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '4px 4px 40px' }}>
        <div
          style={{
            fontFamily: 'var(--corpo-font-mono)',
            fontSize: 'var(--corpo-text-xs)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--corpo-label-tracking-wide)',
            color: 'var(--corpo-accent)',
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </div>
        <h1
          style={{
            fontFamily: 'var(--corpo-font-mono)',
            fontSize: 'var(--corpo-text-xl)',
            margin: '0 0 8px',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              color: 'var(--corpo-text-secondary)',
              fontSize: 'var(--corpo-text-sm)',
              maxWidth: '58ch',
              margin: '0 0 24px',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>
        <p
          style={{
            marginTop: 32,
            paddingTop: 16,
            borderTop: '1px solid var(--corpo-border-dim)',
            fontFamily: 'var(--corpo-font-mono)',
            fontSize: 'var(--corpo-text-xs)',
            color: 'var(--corpo-text-dim)',
          }}
        >
          A note from People Success — this session may be reviewed to help us support you
          better. Thanks for being part of the Halcyon family.
        </p>
      </div>
    </ThemeProvider>
  );
}
