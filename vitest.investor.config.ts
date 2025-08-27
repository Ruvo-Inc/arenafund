import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    name: 'investor-applications',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: [
      // Unit tests for investor components
      'src/components/__tests__/InvestorForm506b.test.tsx',
      'src/components/__tests__/InvestorForm506c.test.tsx',
      'src/components/__tests__/ModeSelector.test.tsx',
      'src/components/__tests__/ModeContent.test.tsx',
      'src/components/__tests__/InvestorSuccess.test.tsx',
      'src/components/__tests__/VerificationFileUpload.test.tsx',
      
      // Unit tests for investor validation logic
      'src/lib/__tests__/investor-validation.test.ts',
      'src/lib/__tests__/investor-api-validation.test.ts',
      'src/lib/__tests__/investor-security-validation.test.ts',
      
      // Integration tests
      'src/test/integration/investor-application.integration.test.ts',
      'src/test/integration/verification-file-upload.integration.test.ts',
      'src/test/integration/investor-application-e2e.test.ts',
      'src/test/integration/investor-security.test.ts',
      
      // Mobile optimization tests
      'src/test/mobile-optimization-integration.test.tsx'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'coverage/**'
    ],
    testTimeout: 30000, // 30 seconds for integration tests
    hookTimeout: 10000, // 10 seconds for setup/teardown
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/investor',
      include: [
        'src/components/InvestorForm506b.tsx',
        'src/components/InvestorForm506c.tsx',
        'src/components/ModeSelector.tsx',
        'src/components/ModeContent.tsx',
        'src/components/InvestorSuccess506b.tsx',
        'src/components/InvestorSuccess506c.tsx',
        'src/components/ui/VerificationFileUpload.tsx',
        'src/lib/application-service.ts',
        'src/app/api/applications/route.ts',
        'src/app/api/upload/signed-url/route.ts',
        'src/app/invest/page.tsx'
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/**/__tests__/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Specific thresholds for critical components
        'src/components/InvestorForm506b.tsx': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/components/InvestorForm506c.tsx': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/lib/application-service.ts': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    reporters: [
      'verbose',
      'json',
      'html'
    ],
    outputFile: {
      json: './test-results/investor-tests.json',
      html: './test-results/investor-tests.html'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    // Test environment variables
    'process.env.NODE_ENV': '"test"',
    'process.env.NEXT_PUBLIC_ENV': '"test"',
    'process.env.FIREBASE_PROJECT_ID': '"test-project"',
    'process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': '"test-project.appspot.com"'
  }
})