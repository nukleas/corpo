import { defineConfig } from 'tsup';

export default defineConfig({
  // lint/index is the oxlint plugin (`@nukleas/react-corpo/oxlint`); it bundles @oxlint/plugins' no-op helpers.
  entry: { index: 'src/index.ts', 'lint/index': 'lint/composition/index.ts' },
  format: ['esm', 'cjs'],
  dts: { entry: { index: 'src/index.ts' } },
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime', '@nukleas/corpo', '@tanstack/react-virtual'],
  treeshake: true,
  splitting: false,
  minify: false,
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
