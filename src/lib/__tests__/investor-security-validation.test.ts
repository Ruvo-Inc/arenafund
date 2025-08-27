// src/lib/__tests__/investor-security-validation.test.ts
import { ApplicationService, InvestorFormData, ValidationError } from '../application-service';

describe('Investor Security Validation', () => {
  beforeEach(() => {
    // Clear rate limiting storage before each test to prevent cross-test interference
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    });

    it('should allow initial submission', () => {
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '25k-50k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      expect(result.isValid).toBe(true);
    });

    it('should detect rate limiting after multiple submissions', () => {
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '25k-50k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: 'John Doe'
      };

      // Simulate multiple rapid submissions
      for (let i = 0; i < 6; i++) {
        ApplicationService.validateInvestorFormData(formData);
      }

      const result = ApplicationService.validateInvestorFormData(formData);
      const rateLimitError = result.errors.find(error => error.code === 'RATE_LIMITED');
      expect(rateLimitError).toBeDefined();
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize malicious script content in names', () => {
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: '<script>alert("xss")</script>John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '25k-50k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const nameError = result.errors.find(error => error.field === 'fullName' && error.code === 'SUSPICIOUS_CONTENT');
      expect(nameError).toBeDefined();
    });

    it('should sanitize SQL injection attempts', () => {
      const formData: InvestorFormData = {
        mode: '506c',
        fullName: "John'; DROP TABLE users; --",
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '25k-50k',
        areasOfInterest: ['enterprise-ai'],
        entityName: 'Test LLC',
        jurisdiction: 'Delaware',
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const nameError = result.errors.find(error => error.field === 'fullName' && error.code === 'SUSPICIOUS_CONTENT');
      expect(nameError).toBeDefined();
    });

    it('should sanitize JavaScript protocol attempts', () => {
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '25k-50k',
        areasOfInterest: ['enterprise-ai'],
        referralSource: 'javascript:alert("xss")',
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const referralError = result.errors.find(error => error.field === 'referralSource' && error.code === 'SUSPICIOUS_CONTENT');
      expect(referralError).toBeDefined();
    });
  });

  describe('International Address Validation', () => {
    it('should validate US addresses require state', () => {
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: '', // Missing state
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '25k-50k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const stateError = result.errors.find(error => error.field === 'state');
      expect(stateError).toBeDefined();
      expect(stateError?.message).toContain('State is required for US');
    });

    it('should validate Canadian addresses require province', () => {
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'CA',
        state: '', // Missing province
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '25k-50k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const stateError = result.errors.find(error => error.field === 'state');
      expect(stateError).toBeDefined();
      expect(stateError?.message).toContain('Province is required for CA');
    });

    it('should detect restricted jurisdictions', () => {
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'CN', // Restricted country
        state: '',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '25k-50k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const countryError = result.errors.find(error => error.field === 'country' && error.code === 'RESTRICTED_JURISDICTION');
      expect(countryError).toBeDefined();
    });
  });

  describe('Entity Name Validation', () => {
    it('should validate institutional entity names have formal indicators', () => {
      const formData: InvestorFormData = {
        mode: '506c',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'institutional',
        accreditationStatus: 'yes',
        checkSize: '250k-plus',
        areasOfInterest: ['enterprise-ai'],
        entityName: 'Random Name Without Indicators', // Missing formal indicators
        jurisdiction: 'Delaware',
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const entityError = result.errors.find(error => error.field === 'entityName' && error.code === 'BUSINESS_LOGIC_SUGGESTION');
      expect(entityError).toBeDefined();
    });

    it('should accept proper institutional entity names', () => {
      const formData: InvestorFormData = {
        mode: '506c',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'institutional',
        accreditationStatus: 'yes',
        checkSize: '250k-plus',
        areasOfInterest: ['enterprise-ai'],
        entityName: 'ABC Investment Fund LLC',
        jurisdiction: 'Delaware',
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const entityError = result.errors.find(error => error.field === 'entityName');
      expect(entityError).toBeUndefined();
    });
  });

  describe('Jurisdiction Validation', () => {
    it('should validate US jurisdictions', () => {
      const formData: InvestorFormData = {
        mode: '506c',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '25k-50k',
        areasOfInterest: ['enterprise-ai'],
        entityName: 'John Doe Trust',
        jurisdiction: 'Invalid State', // Invalid US jurisdiction
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const jurisdictionError = result.errors.find(error => error.field === 'jurisdiction' && error.code === 'JURISDICTION_MISMATCH');
      expect(jurisdictionError).toBeDefined();
    });

    it('should accept valid US jurisdictions', () => {
      const formData: InvestorFormData = {
        mode: '506c',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '25k-50k',
        areasOfInterest: ['enterprise-ai'],
        entityName: 'John Doe Trust',
        jurisdiction: 'Delaware',
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const jurisdictionError = result.errors.find(error => error.field === 'jurisdiction');
      expect(jurisdictionError).toBeUndefined();
    });
  });

  describe('File Security Validation', () => {
    it('should reject files with suspicious extensions', () => {
      const maliciousFile = new File(['test'], 'malicious.exe', { type: 'application/pdf' });
      
      const result = ApplicationService.validateVerificationFile(maliciousFile);
      expect(result.isValid).toBe(false);
      
      const extensionError = result.errors.find(error => error.code === 'SUSPICIOUS_FILENAME');
      expect(extensionError).toBeDefined();
    });

    it('should reject files with script content in names', () => {
      const maliciousFile = new File(['test'], '<script>alert("xss")</script>.pdf', { type: 'application/pdf' });
      
      const result = ApplicationService.validateVerificationFile(maliciousFile);
      expect(result.isValid).toBe(false);
      
      const filenameError = result.errors.find(error => error.code === 'SUSPICIOUS_FILENAME');
      expect(filenameError).toBeDefined();
    });

    it('should reject files that are too small (potentially corrupted)', () => {
      const tinyFile = new File(['x'], 'test.pdf', { type: 'application/pdf' });
      
      const result = ApplicationService.validateVerificationFile(tinyFile);
      expect(result.isValid).toBe(false);
      
      const sizeError = result.errors.find(error => error.code === 'FILE_TOO_SMALL');
      expect(sizeError).toBeDefined();
    });

    it('should reject hidden files', () => {
      const hiddenFile = new File(['test content'], '.hidden.pdf', { type: 'application/pdf' });
      
      const result = ApplicationService.validateVerificationFile(hiddenFile);
      expect(result.isValid).toBe(false);
      
      const hiddenError = result.errors.find(error => error.code === 'HIDDEN_FILE');
      expect(hiddenError).toBeDefined();
    });

    it('should accept valid PDF files', () => {
      // Create a file larger than 1KB to pass the minimum size check
      const pdfContent = '%PDF-1.4\n' + 'A'.repeat(1100); // 1100+ bytes
      const validFile = new File([pdfContent], 'verification-letter.pdf', { type: 'application/pdf' });
      
      const result = ApplicationService.validateVerificationFile(validFile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Cross-field Business Logic Validation', () => {
    it('should warn about institutional investors with small check sizes', () => {
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'institutional',
        accreditationStatus: 'yes',
        checkSize: '25k-50k', // Small for institutional
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const checkSizeError = result.errors.find(error => error.field === 'checkSize' && error.code === 'BUSINESS_LOGIC_MISMATCH');
      expect(checkSizeError).toBeDefined();
    });

    it('should warn about family offices with small check sizes', () => {
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'family-office',
        accreditationStatus: 'yes',
        checkSize: '25k-50k', // Small for family office
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const checkSizeError = result.errors.find(error => error.field === 'checkSize' && error.code === 'BUSINESS_LOGIC_MISMATCH');
      expect(checkSizeError).toBeDefined();
    });

    it('should warn about non-accredited institutional investors', () => {
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'institutional',
        accreditationStatus: 'no', // Unusual for institutional
        checkSize: '250k-plus',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const accreditationError = result.errors.find(error => error.field === 'accreditationStatus' && error.code === 'BUSINESS_LOGIC_MISMATCH');
      expect(accreditationError).toBeDefined();
    });
  });

  describe('Text Content Security', () => {
    it('should detect repetitive spam-like content', () => {
      const formData: InvestorFormData = {
        mode: '506b',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '25k-50k',
        areasOfInterest: ['enterprise-ai'],
        referralSource: 'spam spam spam spam spam spam spam spam spam spam spam spam', // Repetitive content
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const spamError = result.errors.find(error => error.field === 'referralSource' && error.code === 'REPETITIVE_CONTENT');
      expect(spamError).toBeDefined();
    });

    it('should detect NoSQL injection attempts', () => {
      const formData: InvestorFormData = {
        mode: '506c',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '25k-50k',
        areasOfInterest: ['enterprise-ai'],
        entityName: 'Test $where: function() { return true; } LLC',
        jurisdiction: 'Delaware',
        consentConfirm: true,
        signature: 'John Doe'
      };

      const result = ApplicationService.validateInvestorFormData(formData);
      const entityError = result.errors.find(error => error.field === 'entityName' && error.code === 'SUSPICIOUS_CONTENT');
      expect(entityError).toBeDefined();
    });
  });
});