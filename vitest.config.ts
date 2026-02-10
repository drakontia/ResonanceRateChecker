import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.d.ts',
        '**/node_modules/**',
        '**/.next/**',
        '**/coverage/**',
        '**/public/**',
        '**/scripts/**',
        '**/tests/**',
        '**/next-env.d.ts',
        '**/next.config.ts',
        '**/postcss.config.mjs',
        '**/tailwind.config.js',
        '**/eslint.config.mjs',
        '**/vitest.config.ts',
        '**/components/ui/**',
        '**/components/filters.tsx',
        '**/components/price-table.tsx',
        '**/components/table.tsx',
        '**/lib/cityDb.ts',
        '**/lib/tradeDb.ts',
        '**/app/layout.tsx',
        '**/app/manifest.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
