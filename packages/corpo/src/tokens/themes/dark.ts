// Dark scope (.corpo-dark). Surfaces stay the desaturated set. The accent is split
// because one teal cannot be both a fill under white text and readable text on
// these surfaces (WCAG 2.1 AA, measured):
//   accent #0f6f80 — solid fills. White on it is 5.82:1. As text on #151b24 it is 2.97:1.
//   accent-edge #1a7f90 — borders and other non-text edges. 3.69:1 on #151b24, 3.33:1 on
//     #1c2431, 4.01:1 on #0e1218. White on it as a hover fill is 4.68:1.
//   accent-text #62b0bb — links, selected labels, focus rings. 7.55:1 on #0e1218,
//     6.96:1 on #151b24, 6.28:1 on #1c2431, 5.98:1 on the 18% subtle mix. Not used on light.
// Light mode and the amber/green/red/steel themes do not set accent-text or accent-edge;
// CSS falls back to accent.
export const darkTheme = {
  bg: '#0e1218',
  'bg-panel': '#151b24',
  'bg-panel-hover': '#1c2431',
  'bg-inset': '#0e1218',
  border: '#2c3847',
  'border-dim': '#212b38',
  'border-strong': '#3e4d61',
  text: '#e8ecf2',
  'text-secondary': '#b6c1d1',
  'text-muted': '#93a1b5',
  'text-dim': '#7c8ba1', // AA (≥4.5:1) on dark surfaces — was #6d7c92 (4.1:1, sub-AA)
  accent: '#0f6f80',
  'accent-strong': '#1a7f90',
  'accent-edge': '#1a7f90',
  'accent-text': '#62b0bb',
  'accent-subtle': 'rgba(15, 111, 128, 0.18)',
  'accent-muted': 'rgba(15, 111, 128, 0.40)',
  'on-accent': '#ffffff',
  green: '#4cc088',
  red: '#f26d88',
  amber: '#d9a03c',
  'ledger-bar': 'rgba(76, 192, 136, 0.07)',
  blue: '#7ba4f0',
  // chart series — muted dark-surface steps (validated on #151b24), same fixed order
  'chart-1': '#0d9cb5',
  'chart-2': '#c9762e',
  'chart-3': '#5b83d6',
  'chart-4': '#d44f92',
  'chart-5': '#7a68e0',
  // sequential ramp — anchor flipped for the dark surface: more is lighter (validated on #151b24)
  'chart-seq-1': '#1d6574',
  'chart-seq-2': '#2d8a9d',
  'chart-seq-3': '#45adc0',
  'chart-seq-4': '#86d6e3',
  'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
  'shadow-md': '0 2px 8px rgba(0, 0, 0, 0.45)',
  'shadow-lg': '0 8px 28px rgba(0, 0, 0, 0.55)',
} satisfies Record<string, string>;
