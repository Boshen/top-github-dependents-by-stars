import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts'
  },
  format: ['cjs'],  // CLI tools typically use CJS for better compatibility
  platform: 'node',
  target: 'node16',
  dts: false,  // No need for .d.ts files for a CLI
  clean: true,
  shims: true,
  minify: true,  // Minify to reduce size
  sourcemap: false,
  unbundle: false,  // Bundle all dependencies for standalone CLI
  external: [],  // Bundle everything for a standalone executable
  outExtension: {
    '.js': '.cjs'
  },
  esbuildOptions: {
    // Preserve the shebang for CLI execution
    banner: {
      js: '#!/usr/bin/env node'
    }
  }
})