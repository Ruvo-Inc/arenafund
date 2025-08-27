/**
 * Investor Application Integration Tests (Fixed)
 * Comprehensive integration testing with proper mocking
 */
import { describe, it, expect, beforeEach, beforeAll, afterEach } from 'vitest';
import { ApplicationService, InvestorFormData } from '@/lib/application-service';
import { 
  setupSuccessfulApiMocks, 
  setupRateLimitingMocks, 
  setupValidationErrorMocks, 
  resetMocks 
} from '../setup-integration-tests';

describe('Investor Application Integration Tests (Fixed)', () => {
  beforeAll(() => {
    // Setup test environment
    setupSuccessfulApiMocks();
  });

  beforeEach(() => {
    resetMocks();
    setupSuccessfulApiMocks();
  });

  afterEach(() => {
    resetMocks();
  });

  // Helper functions
  function createValid506bFormData(): InvestorFormData {
    return {
      mode: '506b',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      country: 'US',
      state: 'CA',
      investorType: 'individual',
      accreditationStatus: 'yes',
      checkSize: '50k-250k',
      areasOfInterest: ['enterprise-ai', 'healthcare-ai'],
      referralSource: 'Integration test',
      consentConfirm: true,
      signature: 'John Doe',
    };
  }

  function createValid506cFormData(): InvestorFormData {
    return {
      mode: '506c',
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      country: 'US',
      state: 'NY',
      investorType: 'institutional',
      accreditationStatus: 'yes',
      checkSize: '250k-plus',
      areasOfInterest: ['fintech-ai', 'hi-tech'],
      referralSource: 'Integration test',
      consentConfirm: true,
      signature: 'Jane Smith',
      verificationMethod: 'third-party',
      entityName: 'Smith Investment LLC',
      jurisdiction: 'Delaware',
      custodianInfo: 'Goldman Sachs',
    };
  }

  describe('Form Validation Integration', () => {
    it('validates complete 506(b) application successfully', async () => {
      const formData = createValid506bFormData();
      const result = ApplicationService.validateInvestorFormData(formData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates complete 506(c) application successfully', async () => {
      const formData = createValid506cFormData();
      const result = ApplicationService.validateInvestorFormData(formData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('handles validation errors properly', async () => {
      const invalidData = {
        ...createValid506bFormData(),
        email: 'invalid-email',
        fullName: '',
      };
      
      const result = ApplicationService.validateInvestorFormData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
      expect(result.errors.some(e => e.field === 'fullName')).toBe(true);
    });
  });

  describe('Application Submission Integration', () => {
    it('submits 506(b) application successfully', async () => {
      const formData = createValid506bFormData();
      const result = await ApplicationService.submitInvestorApplication(formData);
      
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('submits 506(c) application successfully', async () => {
      const formData = createValid506cFormData();
      const result = await ApplicationService.submitInvestorApplication(formData);
      
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('handles submission validation errors', async () => {
      setupValidationErrorMocks();
      
      const invalidData = {
        ...createValid506bFormData(),
        fullName: '',
        email: '',
      };
      
      const result = await ApplicationService.submitInvestorApplication(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors!.length).toBeGreaterThan(0);
    });

    it('handles rate limiting', async () => {
      setupRateLimitingMocks();
      
      const formData = createValid506bFormData();
      
      // First few submissions should succeed
      for (let i = 0; i < 3; i++) {
        const result = await ApplicationService.submitInvestorApplication(formData);
        expect(result.success).toBe(true);
      }
      
      // Fourth submission should be rate limited
      const rateLimitedResult = await ApplicationService.submitInvestorApplication(formData);
      expect(rateLimitedResult.success).toBe(false);
      expect(rateLimitedResult.error).toContain('Rate limit');
    });
  });

  describe('File Upload Integration', () => {
    it('uploads verification file successfully', async () => {
      const mockFile = new File(['test content'], 'verification.pdf', { type: 'application/pdf' });
      
      const result = await ApplicationService.uploadFile(mockFile);
      
      expect(result.success).toBe(true);
      expect(result.fileRef).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it('handles file upload errors gracefully', async () => {
      // Mock fetch to simulate upload failure
      const mockFetch = global.fetch as any;
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Upload failed' }),
      }));
      
      const mockFile = new File(['test content'], 'verification.pdf', { type: 'application/pdf' });
      
      const result = await ApplicationService.uploadFile(mockFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Cross-Field Validation Integration', () => {
    it('validates country-state relationships', () => {
      const errors = ApplicationService.validateCrossFields({
        country: 'US',
        state: undefined,
      });
      
      expect(errors.some(e => e.field === 'state')).toBe(true);
    });

    it('validates business logic constraints', () => {
      const errors = ApplicationService.validateCrossFields({
        investorType: 'institutional',
        checkSize: '25k-50k',
      });
      
      expect(errors.some(e => e.code === 'BUSINESS_LOGIC_MISMATCH')).toBe(true);
    });

    it('validates 506(c) accreditation requirements', () => {
      const errors = ApplicationService.validateCrossFields({
        mode: '506c',
        accreditationStatus: 'no',
      });
      
      expect(errors.some(e => e.code === 'ACCREDITATION_REQUIRED')).toBe(true);
    });
  });

  describe('Real-time Field Validation Integration', () => {
    it('validates email field in real-time', () => {
      const errors = ApplicationService.validateField('email', 'invalid-email', {});
      
      expect(errors.some(e => e.code === 'INVALID_EMAIL')).toBe(true);
    });

    it('validates country field in real-time', () => {
      const errors = ApplicationService.validateField('country', 'INVALID', {});
      
      expect(errors.some(e => e.code === 'INVALID_COUNTRY')).toBe(true);
    });

    it('validates state field for US investors', () => {
      const errors = ApplicationService.validateField('state', 'INVALID', { country: 'US' });
      
      expect(errors.some(e => e.code === 'INVALID_STATE')).toBe(true);
    });
  });

  describe('Jurisdiction Validation Integration', () => {
    it('validates supported countries', () => {
      const errors = ApplicationService.validateJurisdiction('UNSUPPORTED');
      
      expect(errors.some(e => e.code === 'INVALID_COUNTRY')).toBe(true);
    });

    it('validates US state requirements', () => {
      const errors = ApplicationService.validateJurisdiction('US', 'INVALID');
      
      expect(errors.some(e => e.code === 'INVALID_STATE')).toBe(true);
    });

    it('accepts valid jurisdiction combinations', () => {
      const errors = ApplicationService.validateJurisdiction('US', 'CA');
      
      expect(errors).toHaveLength(0);
    });
  });
});