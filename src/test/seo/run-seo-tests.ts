#!/usr/bin/env node

import { spawn } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface TestResult {
  suite: string;
  passed: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
}

interface TestReport {
  timestamp: string;
  totalDuration: number;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

class SEOTestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<TestReport> {
    console.log('🚀 Starting comprehensive SEO testing infrastructure...\n');
    this.startTime = Date.now();

    // Ensure test results directory exists
    const resultsDir = join(process.cwd(), 'test-results');
    if (!existsSync(resultsDir)) {
      mkdirSync(resultsDir, { recursive: true });
    }

    // Run test suites in sequence
    await this.runTestSuite('Unit Tests', 'npm run test -- src/test/seo');
    await this.runTestSuite('Lighthouse SEO', 'npx vitest run src/test/seo/lighthouse-seo.test.ts');
    await this.runTestSuite('Content Optimization', 'npx vitest run src/test/seo/content-optimization.test.ts');
    await this.runTestSuite('Performance Regression', 'npx vitest run src/test/performance/regression.test.ts');
    await this.runTestSuite('Cross-Browser E2E', 'npx playwright test src/test/e2e/cross-browser-seo.spec.ts');
    await this.runTestSuite('Lighthouse CI', 'npx lhci autorun');

    const totalDuration = Date.now() - this.startTime;
    const report = this.generateReport(totalDuration);
    
    // Save report
    this.saveReport(report);
    this.printSummary(report);

    return report;
  }

  private async runTestSuite(name: string, command: string): Promise<void> {
    console.log(`📋 Running ${name}...`);
    const startTime = Date.now();
    
    try {
      const result = await this.executeCommand(command);
      const duration = Date.now() - startTime;
      
      this.results.push({
        suite: name,
        passed: result.success,
        duration,
        errors: result.errors,
        warnings: result.warnings
      });

      if (result.success) {
        console.log(`✅ ${name} completed successfully (${duration}ms)\n`);
      } else {
        console.log(`❌ ${name} failed (${duration}ms)`);
        result.errors.forEach(error => console.log(`   Error: ${error}`));
        console.log('');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`💥 ${name} crashed (${duration}ms): ${error}\n`);
      
      this.results.push({
        suite: name,
        passed: false,
        duration,
        errors: [String(error)],
        warnings: []
      });
    }
  }

  private executeCommand(command: string): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, { 
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true 
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (stderr) {
          const lines = stderr.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            if (line.toLowerCase().includes('error')) {
              errors.push(line);
            } else if (line.toLowerCase().includes('warn')) {
              warnings.push(line);
            }
          });
        }

        resolve({
          success: code === 0,
          errors,
          warnings
        });
      });

      process.on('error', (error) => {
        resolve({
          success: false,
          errors: [error.message],
          warnings: []
        });
      });
    });
  }

  private generateReport(totalDuration: number): TestReport {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const warnings = this.results.reduce((sum, r) => sum + r.warnings.length, 0);

    return {
      timestamp: new Date().toISOString(),
      totalDuration,
      results: this.results,
      summary: {
        total: this.results.length,
        passed,
        failed,
        warnings
      }
    };
  }

  private saveReport(report: TestReport): void {
    const reportPath = join(process.cwd(), 'test-results', 'seo-test-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Test report saved to: ${reportPath}`);
  }

  private printSummary(report: TestReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📈 SEO TESTING INFRASTRUCTURE SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Total Duration: ${report.totalDuration}ms`);
    console.log(`📊 Test Suites: ${report.summary.total}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log('');

    // Detailed results
    report.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.suite} (${result.duration}ms)`);
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          console.log(`   🔴 ${error}`);
        });
      }
      
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          console.log(`   🟡 ${warning}`);
        });
      }
    });

    console.log('\n' + '='.repeat(60));
    
    if (report.summary.failed === 0) {
      console.log('🎉 All SEO tests passed! Your optimization infrastructure is working correctly.');
    } else {
      console.log('🚨 Some tests failed. Please review the errors above and fix the issues.');
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new SEOTestRunner();
  runner.runAllTests().catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
}

export { SEOTestRunner };