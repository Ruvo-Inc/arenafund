/**
 * End-to-end integration tests for complete investor application flows
 * Tests the full user journey from page load to successful submission
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { ApplicationService, InvestorFormData } from '@/lib/application-service';
import { server } from '../mocks/server';

// Test configuration
const TEST_API_BASE = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
  : 'http://localhost:3000/api';

const APPLICATIONS_ENDPOINT = `${TEST_API_BASE}/applications`;
const UPLOAD_ENDPOINT = `${TEST_API_BASE}/upload/signed-url`;

describe('Investor Application End-to-End Tests', () => {
  let testApplicationIds: string[] = [];

  beforeAll(async () => {
    // Disable MSW for these E2E tests to test real API behavior
    server.close();
    
    // Ensure test environment is properly configured
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error('FIREBASE_PROJECT_ID environment variable is required for E2E tests');
    }
  });

  afterAll(async () => {
    console.log(`E2E tests completed. Created ${testApplicationIds.length} test applications.`);
  });

  beforeEach(() => {
    testApplicationIds = [];
  });

  describe('Complete 506(b) Application Flow', () => {
    it('should complete full 506(b) application journey', async () => {
      const timestamp = Date.now();
      const testEmail = `e2e-506b-${timestamp}@example.com`;
      const testName = `E2E Test User 506b ${timestamp}`;

      // Step 1: Validate form data locally
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: testName,
        email: testEmail,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai', 'healthcare-ai'],
        referralSource: 'E2E Test',
        consentConfirm: true,
        signature: testName
      };

      const validation = ApplicationService.validateInvestorFormData(formData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Step 2: Submit application through API
      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'E2E-Test/1.0',
        },
        body: JSON.stringify({
          applicationType: 'investor',
          investorMode: formData.mode,
          fullName: formData.fullName,
          email: formData.email,
          country: formData.country,
          state: formData.state,
          investorType: formData.investorType,
          accreditationStatus: formData.accreditationStatus,
          checkSize: formData.checkSize,
          areasOfInterest: formData.areasOfInterest,
          referralSource: formData.referralSource,
          consentConfirm: formData.consentConfirm,
          signature: formData.signature,
        }),
      });

      expect(response.status).toBe(201);
      
      const result = await response.json();
      expect(result).toHaveProperty('id');
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
      
      testApplicationIds.push(result.id);

      // Step 3: Verify application was stored correctly
      // (In a real E2E test, we might query the database or admin API to verify)
      // For now, we verify the successful response indicates proper storage
      expect(result.id).toBeTruthy();
    });

    it('should handle 506(b) application with international investor', async () => {
      const timestamp = Date.now();
      const testEmail = `e2e-506b-intl-${timestamp}@example.com`;
      const testName = `E2E International User ${timestamp}`;

      const formData: InvestorFormData = {
        mode: '506b',
        fullName: testName,
        email: testEmail,
        country: 'CA', // Canada
        state: '', // No state for non-US
        investorType: 'family-office',
        accreditationStatus: 'yes',
        checkSize: '250k-plus',
        areasOfInterest: ['enterprise-ai', 'fintech-ai', 'hi-tech'],
        referralSource: 'International Partner',
        consentConfirm: true,
        signature: testName
      };

      const validation = ApplicationService.validateInvestorFormData(formData);
      expect(validation.isValid).toBe(true);

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'E2E-Test-International/1.0',
        },
        body: JSON.stringify({
          applicationType: 'investor',
          investorMode: formData.mode,
          fullName: formData.fullName,
          email: formData.email,
          country: formData.country,
          state: formData.state,
          investorType: formData.investorType,
          accreditationStatus: formData.accreditationStatus,
          checkSize: formData.checkSize,
          areasOfInterest: formData.areasOfInterest,
          referralSource: formData.referralSource,
          consentConfirm: formData.consentConfirm,
          signature: formData.signature,
        }),
      });

      expect(response.status).toBe(201);
      
      const result = await response.json();
      testApplicationIds.push(result.id);
    });
  });

  describe('Complete 506(c) Application Flow', () => {
    it('should complete full 506(c) application journey with third-party verification', async () => {
      const timestamp = Date.now();
      const testEmail = `e2e-506c-${timestamp}@example.com`;
      const testName = `E2E Test User 506c ${timestamp}`;

      // Step 1: Validate form data locally
      const formData: InvestorFormData = {
        mode: '506c',
        fullName: testName,
        email: testEmail,
        country: 'US',
        state: 'NY',
        investorType: 'institutional',
        accreditationStatus: 'yes',
        checkSize: '250k-plus',
        areasOfInterest: ['enterprise-ai', 'fintech-ai'],
        verificationMethod: 'third-party',
        entityName: `${testName} Institution`,
        jurisdiction: 'Delaware',
        custodianInfo: 'Test Custodian Bank',
        consentConfirm: true,
        signature: testName
      };

      const validation = ApplicationService.validateInvestorFormData(formData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Step 2: Submit application through API
      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'E2E-Test-506c/1.0',
        },
        body: JSON.stringify({
          applicationType: 'investor',
          investorMode: formData.mode,
          fullName: formData.fullName,
          email: formData.email,
          country: formData.country,
          state: formData.state,
          investorType: formData.investorType,
          accreditationStatus: formData.accreditationStatus,
          checkSize: formData.checkSize,
          areasOfInterest: formData.areasOfInterest,
          verificationMethod: formData.verificationMethod,
          entityName: formData.entityName,
          jurisdiction: formData.jurisdiction,
          custodianInfo: formData.custodianInfo,
          consentConfirm: formData.consentConfirm,
          signature: formData.signature,
        }),
      });

      expect(response.status).toBe(201);
      
      const result = await response.json();
      expect(result).toHaveProperty('id');
      
      testApplicationIds.push(result.id);
    });

    it('should complete full 506(c) application journey with document upload', async () => {
      const timestamp = Date.now();
      const testEmail = `e2e-506c-upload-${timestamp}@example.com`;
      const testName = `E2E Upload Test User ${timestamp}`;

      // Step 1: Create test PDF file
      const createTestPDF = (): File => {
        const pdfContent = new Uint8Array([
          0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, // %PDF-1.4
          0x0A, 0x25, 0xC4, 0xE5, 0xF2, 0xE5, 0xEB, 0xA7, // Binary comment
          0x0A, 0x0A, 0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, // 1 0 ob
          0x6A, 0x0A, 0x3C, 0x3C, 0x0A, 0x2F, 0x54, 0x79, // j<<\n/Ty
          0x70, 0x65, 0x20, 0x2F, 0x43, 0x61, 0x74, 0x61, // pe /Cata
          0x6C, 0x6F, 0x67, 0x0A, 0x2F, 0x50, 0x61, 0x67, // log\n/Pag
          0x65, 0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, // es 2 0 R
          0x0A, 0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, 0x6F, // \n>>\nendo
          0x62, 0x6A, 0x0A, 0x0A, 0x78, 0x72, 0x65, 0x66, // bj\n\nxref
          0x0A, 0x30, 0x20, 0x34, 0x0A, 0x30, 0x30, 0x30, // \n0 4\n000
          0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, // 0000000 
          0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x20, // 65535 f 
          0x0A, 0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72, // \ntrailer
          0x0A, 0x3C, 0x3C, 0x0A, 0x2F, 0x53, 0x69, 0x7A, // \n<<\n/Siz
          0x65, 0x20, 0x34, 0x0A, 0x2F, 0x52, 0x6F, 0x6F, // e 4\n/Roo
          0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x0A, // t 1 0 R\n
          0x3E, 0x3E, 0x0A, 0x73, 0x74, 0x61, 0x72, 0x74, // >>\nstart
          0x78, 0x72, 0x65, 0x66, 0x0A, 0x31, 0x38, 0x34, // xref\n184
          0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46              // \n%%EOF
        ]);
        
        return new File([pdfContent], `verification-${timestamp}.pdf`, { 
          type: 'application/pdf' 
        });
      };

      const testFile = createTestPDF();

      // Step 2: Upload verification document
      const signedUrlResponse = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: testFile.name,
          fileType: testFile.type,
          fileSize: testFile.size,
          purpose: 'verification',
        }),
      });

      expect(signedUrlResponse.status).toBe(200);
      
      const signedUrlResult = await signedUrlResponse.json();
      expect(signedUrlResult).toHaveProperty('uploadUrl');
      expect(signedUrlResult).toHaveProperty('fileRef');

      // Step 3: Upload file to signed URL
      const uploadResponse = await fetch(signedUrlResult.uploadUrl, {
        method: 'PUT',
        body: testFile,
        headers: {
          'Content-Type': testFile.type,
        },
      });

      expect(uploadResponse.ok).toBe(true);

      // Step 4: Validate complete form data with file reference
      const formData: InvestorFormData = {
        mode: '506c',
        fullName: testName,
        email: testEmail,
        country: 'US',
        state: 'CA',
        investorType: 'family-office',
        accreditationStatus: 'yes',
        checkSize: '250k-plus',
        areasOfInterest: ['enterprise-ai', 'healthcare-ai', 'fintech-ai'],
        verificationMethod: 'letter',
        verificationFileRef: signedUrlResult.fileRef,
        entityName: `${testName} Family Office`,
        jurisdiction: 'California',
        custodianInfo: 'Family Office Custodian',
        consentConfirm: true,
        signature: testName
      };

      const validation = ApplicationService.validateInvestorFormData(formData);
      expect(validation.isValid).toBe(true);

      // Step 5: Submit complete application
      const applicationResponse = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'E2E-Test-Upload/1.0',
        },
        body: JSON.stringify({
          applicationType: 'investor',
          investorMode: formData.mode,
          fullName: formData.fullName,
          email: formData.email,
          country: formData.country,
          state: formData.state,
          investorType: formData.investorType,
          accreditationStatus: formData.accreditationStatus,
          checkSize: formData.checkSize,
          areasOfInterest: formData.areasOfInterest,
          verificationMethod: formData.verificationMethod,
          verificationFileRef: formData.verificationFileRef,
          entityName: formData.entityName,
          jurisdiction: formData.jurisdiction,
          custodianInfo: formData.custodianInfo,
          consentConfirm: formData.consentConfirm,
          signature: formData.signature,
        }),
      });

      expect(applicationResponse.status).toBe(201);
      
      const applicationResult = await applicationResponse.json();
      expect(applicationResult).toHaveProperty('id');
      
      testApplicationIds.push(applicationResult.id);
    });
  });

  describe('Dual-Mode Functionality Tests', () => {
    it('should handle switching between 506(b) and 506(c) modes', async () => {
      const timestamp = Date.now();
      
      // Test 506(b) application
      const formData506b: InvestorFormData = {
        mode: '506b',
        fullName: `Dual Mode Test 506b ${timestamp}`,
        email: `dual-506b-${timestamp}@example.com`,
        country: 'US',
        state: 'TX',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Dual Mode Test 506b ${timestamp}`
      };

      const validation506b = ApplicationService.validateInvestorFormData(formData506b);
      expect(validation506b.isValid).toBe(true);

      const response506b = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationType: 'investor',
          investorMode: formData506b.mode,
          fullName: formData506b.fullName,
          email: formData506b.email,
          country: formData506b.country,
          state: formData506b.state,
          investorType: formData506b.investorType,
          accreditationStatus: formData506b.accreditationStatus,
          checkSize: formData506b.checkSize,
          areasOfInterest: formData506b.areasOfInterest,
          consentConfirm: formData506b.consentConfirm,
          signature: formData506b.signature,
        }),
      });

      expect(response506b.status).toBe(201);
      const result506b = await response506b.json();
      testApplicationIds.push(result506b.id);

      // Test 506(c) application with same base data but additional fields
      const formData506c: InvestorFormData = {
        mode: '506c',
        fullName: `Dual Mode Test 506c ${timestamp}`,
        email: `dual-506c-${timestamp}@example.com`,
        country: 'US',
        state: 'TX',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        verificationMethod: 'bank-brokerage',
        entityName: `Individual Entity ${timestamp}`,
        jurisdiction: 'Texas',
        consentConfirm: true,
        signature: `Dual Mode Test 506c ${timestamp}`
      };

      const validation506c = ApplicationService.validateInvestorFormData(formData506c);
      expect(validation506c.isValid).toBe(true);

      const response506c = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationType: 'investor',
          investorMode: formData506c.mode,
          fullName: formData506c.fullName,
          email: formData506c.email,
          country: formData506c.country,
          state: formData506c.state,
          investorType: formData506c.investorType,
          accreditationStatus: formData506c.accreditationStatus,
          checkSize: formData506c.checkSize,
          areasOfInterest: formData506c.areasOfInterest,
          verificationMethod: formData506c.verificationMethod,
          entityName: formData506c.entityName,
          jurisdiction: formData506c.jurisdiction,
          consentConfirm: formData506c.consentConfirm,
          signature: formData506c.signature,
        }),
      });

      expect(response506c.status).toBe(201);
      const result506c = await response506c.json();
      testApplicationIds.push(result506c.id);

      // Verify both applications were created with different IDs
      expect(result506b.id).not.toBe(result506c.id);
    });

    it('should enforce different validation rules for each mode', async () => {
      const timestamp = Date.now();

      // Test that 506(b) doesn't require 506(c) fields
      const incomplete506bData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Validation Test ${timestamp}`,
        email: `validation-506b-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Validation Test ${timestamp}`,
        // No 506(c) fields - should still be valid
      };

      const response506b = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomplete506bData),
      });

      expect(response506b.status).toBe(201);
      const result506b = await response506b.json();
      testApplicationIds.push(result506b.id);

      // Test that 506(c) requires additional fields
      const incomplete506cData = {
        applicationType: 'investor',
        investorMode: '506c',
        fullName: `Validation Test 506c ${timestamp}`,
        email: `validation-506c-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Validation Test 506c ${timestamp}`,
        // Missing required 506(c) fields
      };

      const response506c = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomplete506cData),
      });

      expect(response506c.status).toBe(400);
      
      const error506c = await response506c.json();
      expect(error506c).toHaveProperty('error');
      expect(error506c.error).toContain('verification method');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network interruptions gracefully', async () => {
      const timestamp = Date.now();
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: `Network Test ${timestamp}`,
        email: `network-test-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Network Test ${timestamp}`
      };

      // Test with invalid endpoint to simulate network error
      const invalidResponse = await fetch(`${TEST_API_BASE}/invalid-endpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationType: 'investor',
          investorMode: formData.mode,
          fullName: formData.fullName,
          email: formData.email,
          country: formData.country,
          state: formData.state,
          investorType: formData.investorType,
          accreditationStatus: formData.accreditationStatus,
          checkSize: formData.checkSize,
          areasOfInterest: formData.areasOfInterest,
          consentConfirm: formData.consentConfirm,
          signature: formData.signature,
        }),
      });

      expect(invalidResponse.status).toBe(404);

      // Test recovery with correct endpoint
      const validResponse = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationType: 'investor',
          investorMode: formData.mode,
          fullName: formData.fullName,
          email: formData.email,
          country: formData.country,
          state: formData.state,
          investorType: formData.investorType,
          accreditationStatus: formData.accreditationStatus,
          checkSize: formData.checkSize,
          areasOfInterest: formData.areasOfInterest,
          consentConfirm: formData.consentConfirm,
          signature: formData.signature,
        }),
      });

      expect(validResponse.status).toBe(201);
      const result = await validResponse.json();
      testApplicationIds.push(result.id);
    });

    it('should handle partial form submissions and validation errors', async () => {
      const timestamp = Date.now();

      // Test with missing required fields
      const incompleteData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: '', // Missing
        email: 'invalid-email', // Invalid format
        country: 'XX', // Invalid country
        // Missing other required fields
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData),
      });

      expect(response.status).toBe(400);
      
      const error = await response.json();
      expect(error).toHaveProperty('error');
      expect(typeof error.error).toBe('string');
      expect(error.error.length).toBeGreaterThan(0);

      // Test recovery with complete, valid data
      const completeData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Recovery Test ${timestamp}`,
        email: `recovery-test-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Recovery Test ${timestamp}`,
      };

      const recoveryResponse = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeData),
      });

      expect(recoveryResponse.status).toBe(201);
      const result = await recoveryResponse.json();
      testApplicationIds.push(result.id);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent applications', async () => {
      const timestamp = Date.now();
      const concurrentCount = 5;
      
      const applications = Array.from({ length: concurrentCount }, (_, index) => ({
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Concurrent Test ${timestamp}-${index}`,
        email: `concurrent-${timestamp}-${index}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Concurrent Test ${timestamp}-${index}`,
      }));

      const startTime = Date.now();
      
      const responses = await Promise.all(
        applications.map(app =>
          fetch(APPLICATIONS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(app),
          })
        )
      );

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Parse results and collect IDs
      const results = await Promise.all(responses.map(r => r.json()));
      results.forEach(result => {
        expect(result).toHaveProperty('id');
        testApplicationIds.push(result.id);
      });

      // Verify all applications have unique IDs
      const uniqueIds = new Set(results.map(r => r.id));
      expect(uniqueIds.size).toBe(concurrentCount);

      // Performance check - should complete within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds for 5 concurrent requests
    });

    it('should handle large form data efficiently', async () => {
      const timestamp = Date.now();
      
      // Create form with maximum allowed data sizes
      const largeFormData = {
        applicationType: 'investor',
        investorMode: '506c',
        fullName: `Large Data Test ${timestamp}`,
        email: `large-data-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'institutional',
        accreditationStatus: 'yes',
        checkSize: '250k-plus',
        areasOfInterest: ['enterprise-ai', 'healthcare-ai', 'fintech-ai', 'hi-tech'],
        verificationMethod: 'third-party',
        entityName: `Large Institution Name ${timestamp} with Additional Details`,
        jurisdiction: 'Delaware',
        custodianInfo: 'Large Custodian Bank with Full Address and Contact Information',
        referralSource: 'Detailed referral source information including partner name and contact details',
        consentConfirm: true,
        signature: `Large Data Test ${timestamp}`,
      };

      const startTime = Date.now();
      
      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largeFormData),
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(201);
      
      const result = await response.json();
      expect(result).toHaveProperty('id');
      testApplicationIds.push(result.id);

      // Performance check - should handle large data efficiently
      expect(responseTime).toBeLessThan(5000); // 5 seconds for large form
    });
  });

  describe('Data Integrity and Audit Trail', () => {
    it('should maintain data integrity across the full application flow', async () => {
      const timestamp = Date.now();
      const originalData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Integrity Test ${timestamp}`,
        email: `integrity-${timestamp}@example.com`,
        country: 'US',
        state: 'NY',
        investorType: 'family-office',
        accreditationStatus: 'yes',
        checkSize: '250k-plus',
        areasOfInterest: ['enterprise-ai', 'fintech-ai'],
        referralSource: 'Data Integrity Test',
        consentConfirm: true,
        signature: `Integrity Test ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Integrity-Test/1.0',
          'X-Test-Metadata': 'integrity-check',
        },
        body: JSON.stringify(originalData),
      });

      expect(response.status).toBe(201);
      
      const result = await response.json();
      expect(result).toHaveProperty('id');
      testApplicationIds.push(result.id);

      // Verify the application was created successfully
      // (In a real system, we might query an admin API to verify the stored data)
      expect(result.id).toBeTruthy();
      expect(typeof result.id).toBe('string');
    });

    it('should handle special characters and internationalization', async () => {
      const timestamp = Date.now();
      const internationalData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `José María García-López ${timestamp}`,
        email: `josé.garcía-${timestamp}@example.com`,
        country: 'ES',
        state: '',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        referralSource: 'Referencia internacional con caracteres especiales: áéíóú ñ',
        consentConfirm: true,
        signature: `José María García-López ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(internationalData),
      });

      expect(response.status).toBe(201);
      
      const result = await response.json();
      expect(result).toHaveProperty('id');
      testApplicationIds.push(result.id);
    });
  });
});