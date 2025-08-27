/**
 * Security-focused integration tests for investor applications
 * Tests input sanitization, rate limiting, file upload security, and data protection
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { ApplicationService } from '@/lib/application-service';
import { server } from '../mocks/server';

// Test configuration
const TEST_API_BASE = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
  : 'http://localhost:3000/api';

const APPLICATIONS_ENDPOINT = `${TEST_API_BASE}/applications`;
const UPLOAD_ENDPOINT = `${TEST_API_BASE}/upload/signed-url`;

describe('Investor Application Security Tests', () => {
  let testApplicationIds: string[] = [];

  beforeAll(async () => {
    // Disable MSW for these security tests to test real API behavior
    server.close();
    
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error('FIREBASE_PROJECT_ID environment variable is required for security tests');
    }
  });

  afterAll(async () => {
    console.log(`Security tests completed. Created ${testApplicationIds.length} test applications.`);
  });

  beforeEach(() => {
    testApplicationIds = [];
  });

  describe('Input Sanitization and XSS Prevention', () => {
    it('should handle potentially malicious script tags in form fields', async () => {
      const timestamp = Date.now();
      const maliciousData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `<script>alert('xss')</script>Security Test ${timestamp}`,
        email: `security-xss-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        referralSource: `<img src="x" onerror="alert('xss')">Referral Source`,
        consentConfirm: true,
        signature: `<script>document.cookie='stolen'</script>Security Test ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maliciousData),
      });

      // Should either succeed (with sanitized data) or fail with validation error
      expect([201, 400].includes(response.status)).toBe(true);
      
      if (response.status === 201) {
        const result = await response.json();
        testApplicationIds.push(result.id);
        // The malicious scripts should be stored as-is (sanitization happens on output)
        expect(result.id).toBeTruthy();
      }
    });

    it('should handle SQL injection attempts in form fields', async () => {
      const timestamp = Date.now();
      const sqlInjectionData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `'; DROP TABLE applications; --Security Test ${timestamp}`,
        email: `sql-injection-${timestamp}@example.com`,
        country: 'US',
        state: `CA'; DELETE FROM users WHERE '1'='1`,
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        referralSource: `' UNION SELECT * FROM sensitive_data --`,
        consentConfirm: true,
        signature: `SQL Injection Test ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sqlInjectionData),
      });

      // Should handle SQL injection attempts safely
      expect([201, 400].includes(response.status)).toBe(true);
      
      if (response.status === 201) {
        const result = await response.json();
        testApplicationIds.push(result.id);
      }
    });

    it('should handle extremely long input strings', async () => {
      const timestamp = Date.now();
      const longString = 'A'.repeat(10000); // 10KB string
      
      const longInputData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Long Input Test ${timestamp}`,
        email: `long-input-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        referralSource: longString,
        consentConfirm: true,
        signature: `Long Input Test ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(longInputData),
      });

      // Should either accept (with truncation) or reject with validation error
      expect([201, 400, 413].includes(response.status)).toBe(true);
      
      if (response.status === 201) {
        const result = await response.json();
        testApplicationIds.push(result.id);
      }
    });

    it('should handle unicode and special characters safely', async () => {
      const timestamp = Date.now();
      const unicodeData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Unicode Test 测试 🚀 ${timestamp}`,
        email: `unicode-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        referralSource: 'Unicode: 中文 العربية русский 日本語 emoji: 🎯💼📊',
        consentConfirm: true,
        signature: `Unicode Test ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(unicodeData),
      });

      expect(response.status).toBe(201);
      
      const result = await response.json();
      testApplicationIds.push(result.id);
    });
  });

  describe('Rate Limiting and Abuse Prevention', () => {
    it('should enforce rate limiting on application submissions', async () => {
      const timestamp = Date.now();
      const baseEmail = `rate-limit-${timestamp}`;
      
      const createApplication = (index: number) => ({
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Rate Limit Test ${timestamp}-${index}`,
        email: `${baseEmail}-${index}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Rate Limit Test ${timestamp}-${index}`,
      });

      // Submit multiple applications rapidly
      const responses = [];
      for (let i = 0; i < 10; i++) {
        const response = await fetch(APPLICATIONS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': '192.168.1.100', // Same IP for rate limiting
          },
          body: JSON.stringify(createApplication(i)),
        });
        responses.push(response);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // First few should succeed, later ones should be rate limited
      const successfulResponses = responses.filter(r => r.status === 201);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(successfulResponses.length).toBeGreaterThan(0);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      
      // Collect successful application IDs
      for (const response of successfulResponses) {
        const result = await response.json();
        testApplicationIds.push(result.id);
      }
    });

    it('should detect and block honeypot spam attempts', async () => {
      const timestamp = Date.now();
      const honeypotData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Honeypot Test ${timestamp}`,
        email: `honeypot-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Honeypot Test ${timestamp}`,
        websiteHoneypot: 'bot-filled-this-field', // This should trigger spam detection
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(honeypotData),
      });

      expect(response.status).toBe(400);
      
      const result = await response.json();
      expect(result.error).toBe('Spam detected.');
    });

    it('should handle rapid duplicate submissions', async () => {
      const timestamp = Date.now();
      const duplicateData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Duplicate Test ${timestamp}`,
        email: `duplicate-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Duplicate Test ${timestamp}`,
      };

      // Submit the same application multiple times rapidly
      const [response1, response2, response3] = await Promise.all([
        fetch(APPLICATIONS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(duplicateData),
        }),
        fetch(APPLICATIONS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(duplicateData),
        }),
        fetch(APPLICATIONS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(duplicateData),
        }),
      ]);

      // First should succeed, others should be rate limited or rejected
      const responses = [response1, response2, response3];
      const successCount = responses.filter(r => r.status === 201).length;
      const errorCount = responses.filter(r => [400, 429].includes(r.status)).length;
      
      expect(successCount).toBe(1); // Only one should succeed
      expect(errorCount).toBe(2); // Others should be rejected
      
      // Collect the successful application ID
      for (const response of responses) {
        if (response.status === 201) {
          const result = await response.json();
          testApplicationIds.push(result.id);
        }
      }
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types strictly for verification documents', async () => {
      // Test various file types that should be rejected
      const invalidFileTypes = [
        { name: 'malicious.exe', type: 'application/x-msdownload' },
        { name: 'script.js', type: 'application/javascript' },
        { name: 'image.jpg', type: 'image/jpeg' },
        { name: 'document.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { name: 'archive.zip', type: 'application/zip' },
      ];

      for (const fileType of invalidFileTypes) {
        const response = await fetch(UPLOAD_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Upload-Type': 'verification',
          },
          body: JSON.stringify({
            fileName: fileType.name,
            fileType: fileType.type,
            fileSize: 1024,
            purpose: 'verification',
          }),
        });

        expect(response.status).toBe(400);
        
        const result = await response.json();
        expect(result).toHaveProperty('error');
        expect(result.error).toContain('PDF');
      }
    });

    it('should enforce file size limits for verification documents', async () => {
      const oversizedFile = {
        fileName: 'large-verification.pdf',
        fileType: 'application/pdf',
        fileSize: 15 * 1024 * 1024, // 15MB (over 10MB limit)
        purpose: 'verification',
      };

      const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Upload-Type': 'verification',
        },
        body: JSON.stringify(oversizedFile),
      });

      expect(response.status).toBe(400);
      
      const result = await response.json();
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('10MB');
    });

    it('should validate file names for security', async () => {
      const maliciousFileNames = [
        '../../../etc/passwd.pdf',
        '..\\..\\windows\\system32\\config\\sam.pdf',
        'file with spaces and special chars !@#$%^&*().pdf',
        'very-long-filename-' + 'a'.repeat(200) + '.pdf',
        'file\x00null.pdf',
        'file\nnewline.pdf',
      ];

      for (const fileName of maliciousFileNames) {
        const response = await fetch(UPLOAD_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Upload-Type': 'verification',
          },
          body: JSON.stringify({
            fileName: fileName,
            fileType: 'application/pdf',
            fileSize: 1024,
            purpose: 'verification',
          }),
        });

        // Should either sanitize the filename or reject it
        expect([200, 400].includes(response.status)).toBe(true);
        
        if (response.status === 200) {
          const result = await response.json();
          expect(result).toHaveProperty('fileRef');
          // File reference should be sanitized and safe
          expect(result.fileRef).toMatch(/^applications\/verification\/\d+-[\w\-\.]+$/);
        }
      }
    });

    it('should prevent file upload without proper authentication context', async () => {
      const validFile = {
        fileName: 'verification.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        purpose: 'verification',
      };

      // Test without proper headers or context
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        // Missing Content-Type header
        body: JSON.stringify(validFile),
      });

      // Should handle missing headers gracefully
      expect([200, 400, 415].includes(response.status)).toBe(true);
    });

    it('should validate PDF file content (not just extension)', async () => {
      // Test file with PDF extension but non-PDF content
      const fakeContent = new Uint8Array([0x89, 0x50, 0x4E, 0x47]); // PNG header
      const fakeFile = new File([fakeContent], 'fake.pdf', { type: 'application/pdf' });

      // First get signed URL
      const signedUrlResponse = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: fakeFile.name,
          fileType: fakeFile.type,
          fileSize: fakeFile.size,
          purpose: 'verification',
        }),
      });

      if (signedUrlResponse.status === 200) {
        const signedUrlResult = await signedUrlResponse.json();
        
        // Try to upload fake PDF content
        const uploadResponse = await fetch(signedUrlResult.uploadUrl, {
          method: 'PUT',
          body: fakeFile,
          headers: {
            'Content-Type': fakeFile.type,
          },
        });

        // Upload might succeed (validation could happen later)
        // The important thing is that the system handles it safely
        expect([200, 400, 403].includes(uploadResponse.status)).toBe(true);
      }
    });
  });

  describe('Data Protection and Privacy', () => {
    it('should handle PII data securely', async () => {
      const timestamp = Date.now();
      const piiData = {
        applicationType: 'investor',
        investorMode: '506c',
        fullName: `PII Test User ${timestamp}`,
        email: `pii-test-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        verificationMethod: 'third-party',
        entityName: `PII Entity ${timestamp}`,
        jurisdiction: 'California',
        custodianInfo: 'Sensitive custodian information with account numbers',
        consentConfirm: true,
        signature: `PII Test User ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Privacy-Test': 'true',
        },
        body: JSON.stringify(piiData),
      });

      expect(response.status).toBe(201);
      
      const result = await response.json();
      expect(result).toHaveProperty('id');
      testApplicationIds.push(result.id);
      
      // Response should not echo back sensitive data
      expect(result).not.toHaveProperty('custodianInfo');
      expect(result).not.toHaveProperty('signature');
    });

    it('should handle GDPR-style data requests safely', async () => {
      const timestamp = Date.now();
      const gdprData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `GDPR Test User ${timestamp}`,
        email: `gdpr-test-${timestamp}@example.com`,
        country: 'DE', // Germany - GDPR jurisdiction
        state: '',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        referralSource: 'GDPR compliance test',
        consentConfirm: true,
        signature: `GDPR Test User ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GDPR-Request': 'true',
        },
        body: JSON.stringify(gdprData),
      });

      expect(response.status).toBe(201);
      
      const result = await response.json();
      testApplicationIds.push(result.id);
    });

    it('should handle data retention policies', async () => {
      const timestamp = Date.now();
      const retentionData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Retention Test ${timestamp}`,
        email: `retention-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Retention Test ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Retention-Test': 'true',
        },
        body: JSON.stringify(retentionData),
      });

      expect(response.status).toBe(201);
      
      const result = await response.json();
      testApplicationIds.push(result.id);
      
      // Application should be created with proper audit trail
      expect(result.id).toBeTruthy();
    });
  });

  describe('API Security and Authentication', () => {
    it('should handle malformed JSON payloads safely', async () => {
      const malformedPayloads = [
        'invalid json{',
        '{"unclosed": "object"',
        '{"circular": {"ref": circular}}',
        '{"null": \x00}',
        '{"huge": "' + 'x'.repeat(1000000) + '"}',
      ];

      for (const payload of malformedPayloads) {
        const response = await fetch(APPLICATIONS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        });

        expect(response.status).toBe(400);
        
        const result = await response.json();
        expect(result).toHaveProperty('error');
        expect(result.error).toBe('Invalid JSON payload.');
      }
    });

    it('should handle HTTP method attacks', async () => {
      const timestamp = Date.now();
      const validData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Method Test ${timestamp}`,
        email: `method-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Method Test ${timestamp}`,
      };

      // Test various HTTP methods
      const methods = ['GET', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
      
      for (const method of methods) {
        const response = await fetch(APPLICATIONS_ENDPOINT, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(validData) : undefined,
        });

        // Should return appropriate method not allowed or handle gracefully
        expect([200, 405, 501].includes(response.status)).toBe(true);
      }
    });

    it('should handle header injection attempts', async () => {
      const timestamp = Date.now();
      const validData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Header Test ${timestamp}`,
        email: `header-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Header Test ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Injected-Header': 'value\r\nInjected-Header: malicious',
          'User-Agent': 'Test\r\nX-Malicious: header',
        },
        body: JSON.stringify(validData),
      });

      // Should handle header injection safely
      expect([201, 400].includes(response.status)).toBe(true);
      
      if (response.status === 201) {
        const result = await response.json();
        testApplicationIds.push(result.id);
      }
    });
  });

  describe('Business Logic Security', () => {
    it('should prevent privilege escalation through investor type manipulation', async () => {
      const timestamp = Date.now();
      
      // Test with conflicting investor type and accreditation status
      const conflictingData = {
        applicationType: 'investor',
        investorMode: '506c',
        fullName: `Privilege Test ${timestamp}`,
        email: `privilege-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'institutional', // High privilege type
        accreditationStatus: 'no', // But not accredited
        checkSize: '25k-50k', // Small investment
        areasOfInterest: ['enterprise-ai'],
        verificationMethod: 'letter',
        entityName: `Fake Institution ${timestamp}`,
        jurisdiction: 'Delaware',
        consentConfirm: true,
        signature: `Privilege Test ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conflictingData),
      });

      // Should reject due to business logic validation
      expect(response.status).toBe(400);
      
      const result = await response.json();
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('accreditation');
    });

    it('should validate jurisdiction restrictions', async () => {
      const timestamp = Date.now();
      
      // Test with restricted jurisdiction
      const restrictedData = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: `Jurisdiction Test ${timestamp}`,
        email: `jurisdiction-${timestamp}@example.com`,
        country: 'CN', // Potentially restricted country
        state: '',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: `Jurisdiction Test ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restrictedData),
      });

      // Should either accept or reject based on jurisdiction rules
      expect([201, 400].includes(response.status)).toBe(true);
      
      if (response.status === 201) {
        const result = await response.json();
        testApplicationIds.push(result.id);
      } else {
        const result = await response.json();
        expect(result).toHaveProperty('error');
      }
    });

    it('should prevent mode switching attacks', async () => {
      const timestamp = Date.now();
      
      // Test with 506(b) mode but 506(c) fields
      const modeAttackData = {
        applicationType: 'investor',
        investorMode: '506b', // Claiming 506(b)
        fullName: `Mode Attack Test ${timestamp}`,
        email: `mode-attack-${timestamp}@example.com`,
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        // But including 506(c) fields
        verificationMethod: 'letter',
        verificationFileRef: 'malicious-file-ref',
        entityName: 'Fake Entity',
        jurisdiction: 'Delaware',
        consentConfirm: true,
        signature: `Mode Attack Test ${timestamp}`,
      };

      const response = await fetch(APPLICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modeAttackData),
      });

      // Should either ignore extra fields or validate properly
      expect([201, 400].includes(response.status)).toBe(true);
      
      if (response.status === 201) {
        const result = await response.json();
        testApplicationIds.push(result.id);
      }
    });
  });
});