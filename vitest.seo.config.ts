import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/test/seo/**/*.test.ts',
      'src/test/performance/**/*.test.ts'
    ],
    testTimeout: 60000, // 1 minute for SEO tests
    hookTimeout: 30000, // 30 seconds for setup/teardown
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/lib/seo-*.ts',
        'src/lib/ai-*.ts',
        'src/lib/performance-*.ts',
        'src/lib/structured-data.ts',
        'src/hooks/useSEO*.ts',
        'src/hooks/useAI*.ts'
      ],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    reporters: [
      'default',
      'json',
      'html',
      'junit'
    ],
    outputFile: {
      json: './test-results/seo-test-results.json',
      html: './test-results/seo-test-results.html',
      junit: './test-results/seo-test-results.xml'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.VITEST_SEO_TESTS': '"true"'
  }
})