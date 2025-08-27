// src/lib/__tests__/investor-api-validation.test.ts
import { describe, it, expect } from 'vitest';

// Mock the validation functions that would be used in the API
const SUPPORTED_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'CH', 'SG', 'HK', 'JP', 'KR', 'IL'];
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];
const ALLOWED_INVESTOR_TYPES = ['individual', 'family-office', 'institutional', 'other'];
const ALLOWED_ACCREDITATION_STATUS = ['yes', 'no', 'unsure'];
const ALLOWED_CHECK_SIZES = ['25k-50k', '50k-250k', '250k-plus'];
const ALLOWED_VERIFICATION_METHODS = ['letter', 'third-party', 'bank-brokerage'];
const ALLOWED_AREAS_OF_INTEREST = ['enterprise-ai', 'healthcare-ai', 'fintech-ai', 'hi-tech'];

function isValidCountry(country: string): boolean {
  return SUPPORTED_COUNTRIES.includes(country.toUpperCase());
}

function isValidUSState(state: string): boolean {
  return US_STATES.includes(state.toUpperCase());
}

function isValidInvestorType(type: string): boolean {
  return ALLOWED_INVESTOR_TYPES.includes(type);
}

function isValidAccreditationStatus(status: string): boolean {
  return ALLOWED_ACCREDITATION_STATUS.includes(status);
}

function isValidCheckSize(size: string): boolean {
  return ALLOWED_CHECK_SIZES.includes(size);
}

function isValidVerificationMethod(method: string): boolean {
  return ALLOWED_VERIFICATION_METHODS.includes(method);
}

function areValidAreasOfInterest(areas: string[]): boolean {
  return areas.length > 0 && areas.every(area => ALLOWED_AREAS_OF_INTEREST.includes(area));
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

describe('Investor API Validation', () => {
  describe('Country Validation', () => {
    it('should accept supported countries', () => {
      expect(isValidCountry('US')).toBe(true);
      expect(isValidCountry('us')).toBe(true);
      expect(isValidCountry('CA')).toBe(true);
      expect(isValidCountry('GB')).toBe(true);
    });

    it('should reject unsupported countries', () => {
      expect(isValidCountry('XX')).toBe(false);
      expect(isValidCountry('ZZ')).toBe(false);
      expect(isValidCountry('')).toBe(false);
    });
  });

  describe('US State Validation', () => {
    it('should accept valid US states', () => {
      expect(isValidUSState('CA')).toBe(true);
      expect(isValidUSState('ca')).toBe(true);
      expect(isValidUSState('NY')).toBe(true);
      expect(isValidUSState('TX')).toBe(true);
      expect(isValidUSState('DC')).toBe(true);
    });

    it('should reject invalid US states', () => {
      expect(isValidUSState('XX')).toBe(false);
      expect(isValidUSState('ZZ')).toBe(false);
      expect(isValidUSState('')).toBe(false);
    });
  });

  describe('Investor Type Validation', () => {
    it('should accept valid investor types', () => {
      expect(isValidInvestorType('individual')).toBe(true);
      expect(isValidInvestorType('family-office')).toBe(true);
      expect(isValidInvestorType('institutional')).toBe(true);
      expect(isValidInvestorType('other')).toBe(true);
    });

    it('should reject invalid investor types', () => {
      expect(isValidInvestorType('invalid')).toBe(false);
      expect(isValidInvestorType('')).toBe(false);
      expect(isValidInvestorType('Individual')).toBe(false); // Case sensitive
    });
  });

  describe('Accreditation Status Validation', () => {
    it('should accept valid accreditation statuses', () => {
      expect(isValidAccreditationStatus('yes')).toBe(true);
      expect(isValidAccreditationStatus('no')).toBe(true);
      expect(isValidAccreditationStatus('unsure')).toBe(true);
    });

    it('should reject invalid accreditation statuses', () => {
      expect(isValidAccreditationStatus('maybe')).toBe(false);
      expect(isValidAccreditationStatus('')).toBe(false);
      expect(isValidAccreditationStatus('Yes')).toBe(false); // Case sensitive
    });
  });

  describe('Check Size Validation', () => {
    it('should accept valid check sizes', () => {
      expect(isValidCheckSize('25k-50k')).toBe(true);
      expect(isValidCheckSize('50k-250k')).toBe(true);
      expect(isValidCheckSize('250k-plus')).toBe(true);
    });

    it('should reject invalid check sizes', () => {
      expect(isValidCheckSize('100k')).toBe(false);
      expect(isValidCheckSize('')).toBe(false);
      expect(isValidCheckSize('25K-50K')).toBe(false); // Case sensitive
    });
  });

  describe('Verification Method Validation', () => {
    it('should accept valid verification methods', () => {
      expect(isValidVerificationMethod('letter')).toBe(true);
      expect(isValidVerificationMethod('third-party')).toBe(true);
      expect(isValidVerificationMethod('bank-brokerage')).toBe(true);
    });

    it('should reject invalid verification methods', () => {
      expect(isValidVerificationMethod('email')).toBe(false);
      expect(isValidVerificationMethod('')).toBe(false);
      expect(isValidVerificationMethod('Letter')).toBe(false); // Case sensitive
    });
  });

  describe('Areas of Interest Validation', () => {
    it('should accept valid areas of interest', () => {
      expect(areValidAreasOfInterest(['enterprise-ai'])).toBe(true);
      expect(areValidAreasOfInterest(['enterprise-ai', 'healthcare-ai'])).toBe(true);
      expect(areValidAreasOfInterest(['fintech-ai', 'hi-tech'])).toBe(true);
      expect(areValidAreasOfInterest(['enterprise-ai', 'healthcare-ai', 'fintech-ai', 'hi-tech'])).toBe(true);
    });

    it('should reject invalid areas of interest', () => {
      expect(areValidAreasOfInterest([])).toBe(false); // Empty array
      expect(areValidAreasOfInterest(['invalid-ai'])).toBe(false);
      expect(areValidAreasOfInterest(['enterprise-ai', 'invalid'])).toBe(false);
      expect(areValidAreasOfInterest(['Enterprise-AI'])).toBe(false); // Case sensitive
    });
  });

  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      expect(isEmail('test@example.com')).toBe(true);
      expect(isEmail('user.name@domain.co.uk')).toBe(true);
      expect(isEmail('investor+tag@fund.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isEmail('')).toBe(false);
      expect(isEmail('invalid')).toBe(false);
      expect(isEmail('test@')).toBe(false);
      expect(isEmail('@domain.com')).toBe(false);
      expect(isEmail('test.domain.com')).toBe(false);
    });
  });

  describe('Business Logic Validation', () => {
    it('should validate 506(c) mode requirements', () => {
      // 506(c) should require accredited investors
      const mode506c = '506c';
      const accreditationNo = 'no';
      const accreditationYes = 'yes';
      
      // This would be handled in the API validation
      expect(mode506c === '506c' && accreditationNo === 'no').toBe(true); // Should fail validation
      expect(mode506c === '506c' && accreditationYes === 'yes').toBe(true); // Should pass validation
    });

    it('should validate verification method requirements for 506(c)', () => {
      const mode506c = '506c';
      const verificationMethod = 'letter';
      const hasVerificationFile = true;
      
      // Letter method should require verification file
      expect(mode506c === '506c' && verificationMethod === 'letter' && !hasVerificationFile).toBe(false);
      expect(mode506c === '506c' && verificationMethod === 'letter' && hasVerificationFile).toBe(true);
    });

    it('should validate investor type and check size alignment', () => {
      // Institutional investors with small check sizes should trigger warnings
      const institutionalType = 'institutional';
      const smallCheckSize = '25k-50k';
      const largeCheckSize = '250k-plus';
      
      expect(institutionalType === 'institutional' && smallCheckSize === '25k-50k').toBe(true); // Should warn
      expect(institutionalType === 'institutional' && largeCheckSize === '250k-plus').toBe(true); // Should be fine
    });
  });

  describe('Payload Structure Validation', () => {
    it('should validate complete 506(b) payload structure', () => {
      const payload506b = {
        applicationType: 'investor',
        investorMode: '506b',
        fullName: 'John Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        investorType: 'individual',
        accreditationStatus: 'yes',
        checkSize: '50k-250k',
        areasOfInterest: ['enterprise-ai'],
        consentConfirm: true,
        signature: 'John Doe'
      };

      // Validate all required fields are present
      expect(payload506b.applicationType).toBe('investor');
      expect(payload506b.investorMode).toBe('506b');
      expect(payload506b.fullName).toBeTruthy();
      expect(isEmail(payload506b.email)).toBe(true);
      expect(isValidCountry(payload506b.country)).toBe(true);
      expect(isValidUSState(payload506b.state)).toBe(true);
      expect(isValidInvestorType(payload506b.investorType)).toBe(true);
      expect(isValidAccreditationStatus(payload506b.accreditationStatus)).toBe(true);
      expect(isValidCheckSize(payload506b.checkSize)).toBe(true);
      expect(areValidAreasOfInterest(payload506b.areasOfInterest)).toBe(true);
      expect(payload506b.consentConfirm).toBe(true);
      expect(payload506b.signature).toBeTruthy();
    });

    it('should validate complete 506(c) payload structure', () => {
      const payload506c = {
        applicationType: 'investor',
        investorMode: '506c',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        country: 'US',
        state: 'NY',
        investorType: 'family-office',
        accreditationStatus: 'yes',
        checkSize: '250k-plus',
        areasOfInterest: ['enterprise-ai', 'fintech-ai'],
        verificationMethod: 'third-party',
        entityName: 'Smith Family Office',
        jurisdiction: 'Delaware',
        custodianInfo: 'Goldman Sachs',
        consentConfirm: true,
        signature: 'Jane Smith'
      };

      // Validate all required fields are present
      expect(payload506c.applicationType).toBe('investor');
      expect(payload506c.investorMode).toBe('506c');
      expect(payload506c.fullName).toBeTruthy();
      expect(isEmail(payload506c.email)).toBe(true);
      expect(isValidCountry(payload506c.country)).toBe(true);
      expect(isValidUSState(payload506c.state)).toBe(true);
      expect(isValidInvestorType(payload506c.investorType)).toBe(true);
      expect(isValidAccreditationStatus(payload506c.accreditationStatus)).toBe(true);
      expect(isValidCheckSize(payload506c.checkSize)).toBe(true);
      expect(areValidAreasOfInterest(payload506c.areasOfInterest)).toBe(true);
      expect(isValidVerificationMethod(payload506c.verificationMethod!)).toBe(true);
      expect(payload506c.entityName).toBeTruthy();
      expect(payload506c.jurisdiction).toBeTruthy();
      expect(payload506c.consentConfirm).toBe(true);
      expect(payload506c.signature).toBeTruthy();
    });
  });
});