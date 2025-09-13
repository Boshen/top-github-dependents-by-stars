import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts'
  },
  format: ['esm'],  // Use ESM format
  platform: 'node',
  target: 'node16',
  dts: false,  // No need for .d.ts files for a CLI
  clean: true,
  shims: true,
  minify: false,
  sourcemap: false,
  unbundle: false,  // Bundle all dependencies for standalone CLI
  external: [],  // Bundle everything for a standalone executable
})
