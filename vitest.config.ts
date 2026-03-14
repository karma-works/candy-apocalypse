import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [ react() ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [ './tests/unit/setup.ts' ],
    include: [ 'tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx' ],
    exclude: [ 'node_modules', 'dist', 'tests/e2e' ],
    coverage: {
      provider: 'v8',
      reporter: [ 'text', 'json', 'html' ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
