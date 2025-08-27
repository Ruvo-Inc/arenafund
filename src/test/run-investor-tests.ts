#!/usr/bin/env node

/**
 * Comprehensive test runner for investor application functionality
 * Runs unit tests, integration tests, and end-to-end tests for investor applications
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

interface TestSuite {
  name: string;
  description: string;
  command: string;
  files: string[];
  required: boolean;
}

const testSuites: TestSuite[] = [
  {
    name: 'Unit Tests - Investor Forms',
    description: 'Tests for InvestorForm506b and InvestorForm506c components',
    command: 'npx vitest run src/components/__tests__/InvestorForm506b.test.tsx src/components/__tests__/InvestorForm506c.test.tsx',
    files: [
      'src/components/__tests__/InvestorForm506b.test.tsx',
      'src/components/__tests__/InvestorForm506c.test.tsx'
    ],
    required: true
  },
  {
    name: 'Unit Tests - Mode Components',
    description: 'Tests for ModeSelector and ModeContent components',
    command: 'npx vitest run src/components/__tests__/ModeSelector.test.tsx src/components/__tests__/ModeContent.test.tsx',
    files: [
      'src/components/__tests__/ModeSelector.test.tsx',
      'src/components/__tests__/ModeContent.test.tsx'
    ],
    required: true
  },
  {
    name: 'Unit Tests - Success Components',
    description: 'Tests for InvestorSuccess506b and InvestorSuccess506c components',
    command: 'npx vitest run src/components/__tests__/InvestorSuccess.test.tsx',
    files: [
      'src/components/__tests__/InvestorSuccess.test.tsx'
    ],
    required: true
  },
  {
    name: 'Unit Tests - File Upload',
    description: 'Tests for VerificationFileUpload component',
    command: 'npx vitest run src/components/__tests__/VerificationFileUpload.test.tsx',
    files: [
      'src/components/__tests__/VerificationFileUpload.test.tsx'
    ],
    required: true
  },
  {
    name: 'Unit Tests - Validation Logic',
    description: 'Tests for investor validation rules and business logic',
    command: 'npx vitest run src/lib/__tests__/investor-validation.test.ts src/lib/__tests__/investor-api-validation.test.ts src/lib/__tests__/investor-security-validation.test.ts',
    files: [
      'src/lib/__tests__/investor-validation.test.ts',
      'src/lib/__tests__/investor-api-validation.test.ts',
      'src/lib/__tests__/investor-security-validation.test.ts'
    ],
    required: true
  },
  {
    name: 'Integration Tests - API Routes',
    description: 'Tests for investor application API endpoints and data flow',
    command: 'npx vitest run src/test/integration/investor-application.integration.test.ts',
    files: [
      'src/test/integration/investor-application.integration.test.ts'
    ],
    required: true
  },
  {
    name: 'Integration Tests - File Upload',
    description: 'Tests for verification document upload functionality',
    command: 'npx vitest run src/test/integration/verification-file-upload.integration.test.ts',
    files: [
      'src/test/integration/verification-file-upload.integration.test.ts'
    ],
    required: true
  },
  {
    name: 'End-to-End Tests',
    description: 'Complete investor application flow tests',
    command: 'npx vitest run src/test/integration/investor-application-e2e.test.ts',
    files: [
      'src/test/integration/investor-application-e2e.test.ts'
    ],
    required: true
  },
  {
    name: 'Security Tests',
    description: 'Security and vulnerability tests for investor applications',
    command: 'npx vitest run src/test/integration/investor-security.test.ts',
    files: [
      'src/test/integration/investor-security.test.ts'
    ],
    required: true
  },
  {
    name: 'Mobile Optimization Tests',
    description: 'Mobile responsiveness and optimization tests',
    command: 'npx vitest run src/test/mobile-optimization-integration.test.tsx',
    files: [
      'src/test/mobile-optimization-integration.test.tsx'
    ],
    required: false
  }
];

interface TestResult {
  suite: string;
  passed: boolean;
  duration: number;
  output: string;
  error?: string;
}

class InvestorTestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Investor Application Test Suite');
    console.log('=' .repeat(60));
    console.log();

    // Check if all required test files exist
    this.checkTestFiles();

    // Run each test suite
    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }

    // Generate summary report
    this.generateSummaryReport();
  }

  private checkTestFiles(): void {
    console.log('📋 Checking test file availability...');
    
    const missingFiles: string[] = [];
    const availableFiles: string[] = [];

    for (const suite of testSuites) {
      for (const file of suite.files) {
        const fullPath = path.resolve(process.cwd(), file);
        if (existsSync(fullPath)) {
          availableFiles.push(file);
        } else {
          missingFiles.push(file);
          if (suite.required) {
            console.log(`❌ Missing required test file: ${file}`);
          } else {
            console.log(`⚠️  Missing optional test file: ${file}`);
          }
        }
      }
    }

    console.log(`✅ Found ${availableFiles.length} test files`);
    if (missingFiles.length > 0) {
      console.log(`⚠️  Missing ${missingFiles.length} test files`);
    }
    console.log();
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`🧪 Running: ${suite.name}`);
    console.log(`   ${suite.description}`);

    // Check if all files for this suite exist
    const missingFiles = suite.files.filter(file => !existsSync(path.resolve(process.cwd(), file)));
    
    if (missingFiles.length > 0) {
      if (suite.required) {
        console.log(`   ❌ Skipping - missing required files: ${missingFiles.join(', ')}`);
        this.results.push({
          suite: suite.name,
          passed: false,
          duration: 0,
          output: '',
          error: `Missing required files: ${missingFiles.join(', ')}`
        });
      } else {
        console.log(`   ⚠️  Skipping - missing optional files: ${missingFiles.join(', ')}`);
        this.results.push({
          suite: suite.name,
          passed: true,
          duration: 0,
          output: 'Skipped - optional files missing',
          error: undefined
        });
      }
      console.log();
      return;
    }

    const suiteStartTime = Date.now();
    
    try {
      const output = execSync(suite.command, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000, // 5 minute timeout
        env: {
          ...process.env,
          NODE_ENV: 'test',
          VITEST_REPORTER: 'verbose'
        }
      });

      const duration = Date.now() - suiteStartTime;
      
      console.log(`   ✅ Passed (${duration}ms)`);
      
      this.results.push({
        suite: suite.name,
        passed: true,
        duration,
        output,
        error: undefined
      });

    } catch (error: any) {
      const duration = Date.now() - suiteStartTime;
      
      console.log(`   ❌ Failed (${duration}ms)`);
      console.log(`   Error: ${error.message}`);
      
      this.results.push({
        suite: suite.name,
        passed: false,
        duration,
        output: error.stdout || '',
        error: error.message
      });
    }
    
    console.log();
  }

  private generateSummaryReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.filter(r => !r.passed).length;
    const totalTests = this.results.length;

    console.log('📊 Test Summary Report');
    console.log('=' .repeat(60));
    console.log(`Total Test Suites: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log();

    if (failedTests > 0) {
      console.log('❌ Failed Test Suites:');
      this.results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`   • ${result.suite}`);
          if (result.error) {
            console.log(`     Error: ${result.error}`);
          }
        });
      console.log();
    }

    console.log('✅ Passed Test Suites:');
    this.results
      .filter(r => r.passed)
      .forEach(result => {
        console.log(`   • ${result.suite} (${result.duration}ms)`);
      });
    console.log();

    // Coverage recommendations
    this.generateCoverageRecommendations();

    // Exit with appropriate code
    if (failedTests > 0) {
      console.log('❌ Some tests failed. Please review and fix the issues.');
      process.exit(1);
    } else {
      console.log('🎉 All tests passed successfully!');
      process.exit(0);
    }
  }

  private generateCoverageRecommendations(): void {
    console.log('📈 Test Coverage Recommendations:');
    console.log();

    const recommendations = [
      {
        area: 'Component Testing',
        description: 'All investor form components have comprehensive unit tests',
        status: this.results.some(r => r.suite.includes('Investor Forms') && r.passed) ? '✅' : '❌'
      },
      {
        area: 'Validation Testing',
        description: 'Business logic and validation rules are thoroughly tested',
        status: this.results.some(r => r.suite.includes('Validation Logic') && r.passed) ? '✅' : '❌'
      },
      {
        area: 'API Integration',
        description: 'API endpoints and data flow are integration tested',
        status: this.results.some(r => r.suite.includes('API Routes') && r.passed) ? '✅' : '❌'
      },
      {
        area: 'File Upload Security',
        description: 'File upload functionality is security tested',
        status: this.results.some(r => r.suite.includes('File Upload') && r.passed) ? '✅' : '❌'
      },
      {
        area: 'End-to-End Flows',
        description: 'Complete user journeys are tested end-to-end',
        status: this.results.some(r => r.suite.includes('End-to-End') && r.passed) ? '✅' : '❌'
      },
      {
        area: 'Security Testing',
        description: 'Security vulnerabilities and edge cases are tested',
        status: this.results.some(r => r.suite.includes('Security') && r.passed) ? '✅' : '❌'
      },
      {
        area: 'Mobile Optimization',
        description: 'Mobile responsiveness and touch interactions are tested',
        status: this.results.some(r => r.suite.includes('Mobile') && r.passed) ? '✅' : '⚠️'
      }
    ];

    recommendations.forEach(rec => {
      console.log(`   ${rec.status} ${rec.area}: ${rec.description}`);
    });
    console.log();

    // Additional recommendations
    console.log('💡 Additional Testing Recommendations:');
    console.log('   • Add performance tests for large form submissions');
    console.log('   • Add accessibility tests with axe-core');
    console.log('   • Add cross-browser compatibility tests');
    console.log('   • Add load testing for concurrent applications');
    console.log('   • Add monitoring and alerting for test failures');
    console.log();
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  const runner = new InvestorTestRunner();
  runner.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export { InvestorTestRunner, testSuites };