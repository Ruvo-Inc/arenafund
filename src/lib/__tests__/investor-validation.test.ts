// src/lib/__tests__/investor-validation.test.ts
import { describe, test, expect } from 'vitest';
import { ApplicationService } from '../application-service';
import type { InvestorFormData } from '../application-service';

// Mock complete investor form data
const createMockInvestorFormData = (overrides: Partial<InvestorFormData> = {}): InvestorFormData => ({
  mode: '506b',
  fullName: 'John Doe',
  email: 'john@example.com',
  country: 'US',
  state: 'CA',
  investorType: 'individual',
  accreditationStatus: 'yes',
  checkSize: '50k-250k',
  areasOfInterest: ['enterprise-ai', 'fintech-ai'],
  consentConfirm: true,
  signature: 'John Doe',
  ...overrides
});

describe('Investor Form Validation', () => {
  test('validates complete 506(b) form successfully', () => {
    const formData = createMockInvestorFormData();
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validates complete 506(c) form successfully', () => {
    const formData = createMockInvestorFormData({
      mode: '506c',
      verificationMethod: 'letter',
      verificationFileRef: 'test-verification-file-ref',
      entityName: 'Test Entity LLC',
      jurisdiction: 'Delaware',
      custodianInfo: 'Test Custodian'
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('catches missing required fields', () => {
    const formData = createMockInvestorFormData({
      fullName: '',
      email: ''
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.field === 'fullName')).toBe(true);
    expect(result.errors.some(e => e.field === 'email')).toBe(true);
  });

  test('validates email format', () => {
    const formData = createMockInvestorFormData({
      email: 'invalid-email'
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'email' && e.code === 'INVALID_FORMAT')).toBe(true);
  });

  test('validates investor type', () => {
    const formData = createMockInvestorFormData({
      investorType: 'invalid-type' as any
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'investorType' && e.code === 'INVALID_INVESTOR_TYPE')).toBe(true);
  });

  test('validates accreditation status', () => {
    const formData = createMockInvestorFormData({
      accreditationStatus: 'invalid-status' as any
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'accreditationStatus' && e.code === 'INVALID_ACCREDITATION_STATUS')).toBe(true);
  });

  test('validates areas of interest', () => {
    const formData = createMockInvestorFormData({
      areasOfInterest: []
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'areasOfInterest')).toBe(true);
  });

  test('validates invalid areas of interest', () => {
    const formData = createMockInvestorFormData({
      areasOfInterest: ['invalid-area']
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'areasOfInterest' && e.code === 'INVALID_AREAS_OF_INTEREST')).toBe(true);
  });

  test('validates 506(c) specific requirements', () => {
    const formData = createMockInvestorFormData({
      mode: '506c'
      // Missing required 506(c) fields
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'verificationMethod')).toBe(true);
    expect(result.errors.some(e => e.field === 'entityName')).toBe(true);
    expect(result.errors.some(e => e.field === 'jurisdiction')).toBe(true);
  });

  test('validates 506(c) accreditation requirement', () => {
    const formData = createMockInvestorFormData({
      mode: '506c',
      accreditationStatus: 'no',
      verificationMethod: 'letter',
      entityName: 'Test Entity',
      jurisdiction: 'Delaware'
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'ACCREDITATION_REQUIRED')).toBe(true);
  });

  test('validates US state requirement', () => {
    const formData = createMockInvestorFormData({
      country: 'US',
      state: ''
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'state')).toBe(true);
  });

  test('validates invalid US state', () => {
    const formData = createMockInvestorFormData({
      country: 'US',
      state: 'INVALID'
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'state' && e.code === 'INVALID_STATE')).toBe(true);
  });

  test('validates unsupported country', () => {
    const formData = createMockInvestorFormData({
      country: 'UNSUPPORTED'
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'country' && e.code === 'INVALID_COUNTRY')).toBe(true);
  });

  test('validates business logic - institutional investor with low check size', () => {
    const formData = createMockInvestorFormData({
      mode: '506c',
      investorType: 'institutional',
      checkSize: '25k-50k',
      verificationMethod: 'letter',
      verificationFileRef: 'test-verification-file-ref',
      entityName: 'Test Institution',
      jurisdiction: 'Delaware'
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'BUSINESS_LOGIC_MISMATCH')).toBe(true);
  });

  test('validates business logic - family office with low check size', () => {
    const formData = createMockInvestorFormData({
      investorType: 'family-office',
      checkSize: '25k-50k'
    });
    const result = ApplicationService.validateInvestorFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'BUSINESS_LOGIC_MISMATCH')).toBe(true);
  });

  test('validates real-time field validation', () => {
    const formData = createMockInvestorFormData();
    
    // Test individual field validation
    const emailResult = ApplicationService.validateInvestorField('email', 'invalid-email', formData);
    expect(emailResult.isValid).toBe(false);
    expect(emailResult.errors.some(e => e.field === 'email')).toBe(true);

    const validEmailResult = ApplicationService.validateInvestorField('email', 'test@example.com', formData);
    expect(validEmailResult.isValid).toBe(true);
  });

  test('validates cross-field validation in real-time', () => {
    const formData = createMockInvestorFormData({
      investorType: 'individual',
      accreditationStatus: 'yes'
    });
    
    // Test cross-field validation when changing investor type
    const result = ApplicationService.validateInvestorField('investorType', 'institutional', formData);
    expect(result.isValid).toBe(true); // Should be valid since accreditation is 'yes'

    // Test with non-accredited institutional investor
    const formDataNonAccredited = createMockInvestorFormData({
      investorType: 'individual',
      accreditationStatus: 'no'
    });
    
    const resultNonAccredited = ApplicationService.validateInvestorField('investorType', 'institutional', formDataNonAccredited);
    expect(resultNonAccredited.isValid).toBe(false);
    expect(resultNonAccredited.errors.some(e => e.code === 'BUSINESS_LOGIC_MISMATCH')).toBe(true);
  });

  test('validates jurisdiction for different countries', () => {
    const formData = createMockInvestorFormData({
      mode: '506c',
      country: 'US',
      verificationMethod: 'letter',
      verificationFileRef: 'test-file',
      entityName: 'Test Entity',
      jurisdiction: 'Delaware'
    });
    
    const result = ApplicationService.validateInvestorField('jurisdiction', 'Delaware', formData);
    expect(result.isValid).toBe(true);

    // Test invalid US jurisdiction
    const invalidResult = ApplicationService.validateInvestorField('jurisdiction', 'InvalidState', formData);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.some(e => e.code === 'JURISDICTION_MISMATCH')).toBe(true);
  });

  test('validates international investor requirements', () => {
    const formData = createMockInvestorFormData({
      country: 'CA', // Canada
      mode: '506c',
      verificationMethod: 'letter',
      verificationFileRef: 'test-file',
      entityName: 'Test Entity',
      jurisdiction: 'Ontario'
    });
    
    const result = ApplicationService.validateInvestorFormData(formData);
    expect(result.isValid).toBe(true);

    // Test with restricted country
    const restrictedFormData = createMockInvestorFormData({
      country: 'CN', // China (restricted)
      mode: '506c',
      verificationMethod: 'letter',
      verificationFileRef: 'test-file',
      entityName: 'Test Entity',
      jurisdiction: 'Beijing'
    });
    
    const restrictedResult = ApplicationService.validateInvestorFormData(restrictedFormData);
    expect(restrictedResult.isValid).toBe(false);
    expect(restrictedResult.errors.some(e => e.code === 'RESTRICTED_JURISDICTION')).toBe(true);
  });
});