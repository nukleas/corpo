// Reference-only — NOT compiled into dist/corpo.css. `build.ts` does plain
// string concatenation with no PostCSS step, so --corpo-* custom properties
// cannot be used inside @media conditions. These values exist so component
// authors have one place to look up the literal px numbers to repeat in
// @media rules. See packages/corpo/CLAUDE.md, "Adding responsive behavior".
export const breakpoints = {
  md: 768, // structural changes: off-canvas nav, column-count changes
  sm: 480, // content-density changes: further column/text collapse
} as const;
