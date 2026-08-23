import { palette } from './base.js';

export const semanticTokens = {
  // raw neutral scale — only the steps component CSS reaches that the semantic aliases don't cover
  'white': palette.white,
  'gray-100': palette.gray100,
  'gray-200': palette.gray200,
  'gray-300': palette.gray300,
  'gray-400': palette.gray400,
  'gray-500': palette.gray500,
  'gray-900': palette.gray900,

  // surfaces
  'bg': palette.gray50,
  'bg-panel': palette.white,
  'bg-panel-hover': palette.gray100,
  'bg-inset': palette.gray100,

  // borders
  'border': palette.gray300,
  'border-dim': palette.gray200,
  'border-strong': palette.gray400,

  // text — all WCAG AA (≥4.5:1) on white: text 16.7:1, secondary 8.6:1, muted 5.6:1, dim 5.2:1.
  // `text-dim` is the dimmest *readable* tier: our own small captions (e.g. cp-stat__hint) use it,
  // so it must clear AA for normal text — the raw `gray-500` scale token stays for decorative/≥3:1 use.
  'text': palette.gray900,
  'text-secondary': palette.gray700,
  'text-muted': palette.gray600,
  'text-dim': palette.gray550,

  // status palette
  'green': palette.green,
  'red': palette.red,
  'amber': palette.amber,
  'blue': palette.blue,
  'purple': palette.purple,
  'magenta': palette.magenta,
  'teal': palette.teal,
  'green-subtle': palette.greenSubtle,
  'red-subtle': palette.redSubtle,
  'amber-subtle': palette.amberSubtle,
  'blue-subtle': palette.blueSubtle,

  // categorical chart series — fixed assignment order, never cycled; >5 series
  // fold into "Other". CVD-validated (six-check palette validator) on white;
  // themes/dark.ts carries the dark-surface steps. Status colors stay reserved
  // for status and are never chart series.
  'chart-1': '#00819c',
  'chart-2': '#b35100',
  'chart-3': '#2758c0',
  'chart-4': '#ad1a7d',
  'chart-5': '#6742c9',

  // default accent theme (teal) — amber/green/red/steel override just this block via .theme-*
  'accent': palette.teal,
  'accent-strong': '#0a5460',
  'accent-subtle': 'rgba(15, 111, 128, 0.09)',
  'accent-muted': 'rgba(15, 111, 128, 0.28)',
  'accent-border': 'rgba(15, 111, 128, 0.35)',  // accent @ 35% — card border treatment
  'on-accent': '#ffffff',

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
  'leading-normal': '1.5',
  'leading-relaxed': '1.65',

  // control sizing
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

  // motion — 120-150ms color/border/background transitions, no glitch/flicker
  'ease': 'cubic-bezier(0.2, 0, 0.2, 1)',
  'dur-fast': '120ms',
  'dur': '150ms',
  'dur-slow': '300ms',
} satisfies Record<string, string>;
