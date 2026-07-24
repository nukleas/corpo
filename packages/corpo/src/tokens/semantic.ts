import { palette } from './base.js';

export const semanticTokens: Record<string, string> = {
  // raw neutral scale — exposed so component CSS can reach a step the semantic aliases don't cover
  'white': palette.white,
  'grey-50': palette.grey50,
  'grey-100': palette.grey100,
  'grey-200': palette.grey200,
  'grey-300': palette.grey300,
  'grey-400': palette.grey400,
  'grey-500': palette.grey500,
  'grey-600': palette.grey600,
  'grey-700': palette.grey700,
  'grey-800': palette.grey800,
  'grey-900': palette.grey900,

  // surfaces
  'bg': palette.grey50,
  'bg-panel': palette.white,
  'bg-panel-hover': palette.grey100,
  'bg-inset': palette.grey100,

  // borders
  'border': palette.grey300,
  'border-dim': palette.grey200,
  'border-strong': palette.grey400,

  // text — all AA on white: text 16.7:1, secondary 8.6:1, muted 5.6:1, dim 3.6:1 (large/decorative only)
  'text': palette.grey900,
  'text-secondary': palette.grey700,
  'text-muted': palette.grey600,
  'text-dim': palette.grey500,

  // status palette
  'green': palette.green,
  'red': palette.red,
  'amber': palette.amber,
  'blue': palette.blue,
  'purple': palette.purple,
  'magenta': palette.magenta,
  'teal': palette.teal,
  'orange': palette.orange,
  'green-subtle': palette.greenSubtle,
  'red-subtle': palette.redSubtle,
  'amber-subtle': palette.amberSubtle,
  'blue-subtle': palette.blueSubtle,

  // default accent theme (teal) — amber/green/red/steel override just this block via .theme-*
  'accent': palette.teal,
  'accent-strong': '#0a5460',
  'accent-subtle': 'rgba(15, 111, 128, 0.09)',
  'accent-muted': 'rgba(15, 111, 128, 0.28)',
  'accent-border': 'rgba(15, 111, 128, 0.35)',  // accent @ 35% — card border treatment
  'on-accent': '#ffffff',
  'accent-secondary': palette.magenta,
  'accent-secondary-subtle': 'rgba(173, 26, 125, 0.09)',

  // fonts
  'font-sans': "'Public Sans', -apple-system, 'Segoe UI', system-ui, sans-serif",
  'font-mono': "'JetBrains Mono', ui-monospace, 'SF Mono', Consolas, monospace",

  // type scale (rem-based, larger than a dense terminal scale, for readability)
  'text-xs': '0.75rem',
  'text-sm': '0.8125rem',
  'text-base': '0.875rem',
  'text-md': '1rem',
  'text-lg': '1.125rem',
  'text-xl': '1.375rem',
  'text-2xl': '1.75rem',
  'label-tracking': '0.08em',
  'label-tracking-wide': '0.14em',
  'leading-tight': '1.25',
  'leading-normal': '1.5',
  'leading-relaxed': '1.65',

  // spacing
  'space-1': '4px',
  'space-2': '8px',
  'space-3': '12px',
  'space-4': '16px',
  'space-5': '24px',
  'space-6': '32px',
  'space-7': '48px',
  'space-8': '64px',
  'control-h': '36px',
  'control-h-sm': '28px',
  'control-h-lg': '44px',

  // geometry — controls get 2px, surfaces 4px (the Switch pill is the single rounded exception)
  'radius': '2px',
  'radius-lg': '4px',

  // shadows — quiet elevation, no neon glow
  'shadow-sm': '0 1px 2px rgba(16, 22, 35, 0.06)',
  'shadow-md': '0 2px 8px rgba(16, 22, 35, 0.08), 0 1px 2px rgba(16, 22, 35, 0.06)',
  'shadow-lg': '0 8px 28px rgba(16, 22, 35, 0.14), 0 2px 8px rgba(16, 22, 35, 0.08)',
  'ring': '0 0 0 2px var(--corpo-bg-panel), 0 0 0 4px var(--corpo-accent)',

  // motion — 120-150ms color/border/background transitions, no glitch/flicker
  'ease': 'cubic-bezier(0.2, 0, 0.2, 1)',
  'dur-fast': '120ms',
  'dur': '150ms',
  'dur-slow': '300ms',
};
