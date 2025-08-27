// Test file for comprehensive form validation
import { ApplicationService } from '../application-service';

describe('Form Validation', () => {
  const validFormData = {
    fullName: 'John Doe',
    role: 'CEO',
    email: 'john@example.com',
    phone: '+1234567890',
    linkedin: 'https://linkedin.com/in/johndoe',
    companyName: 'Test Company',
    website: 'https://testcompany.com',
    stage: 'seed',
    industry: 'enterprise',
    oneLineDescription: 'We solve problems',
    problem: 'There is a big problem',
    solution: 'We have the solution',
    traction: 'customers',
    revenue: '100k-500k',
    deckFile: null,
    deckLink: 'https://example.com/deck.pdf',
    videoPitch: '',
    enterpriseEngagement: 'yes',
    keyHighlights: 'Great team',
    capitalRaised: 'yes',
    capitalRaisedAmount: '100k',
    capitalSought: '500k-1m',
    accuracyConfirm: true,
    understandingConfirm: true,
    signature: 'John Doe'
  };

  test('validates complete form successfully', () => {
    const result = ApplicationService.validateFormData(validFormData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('catches missing required fields', () => {
    const invalidData = { ...validFormData, fullName: '', email: '' };
    const result = ApplicationService.validateFormData(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.field === 'fullName')).toBe(true);
    expect(result.errors.some(e => e.field === 'email')).toBe(true);
  });

  test('validates email format', () => {
    const invalidData = { ...validFormData, email: 'invalid-email' };
    const result = ApplicationService.validateFormData(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'email' && e.code === 'INVALID_FORMAT')).toBe(true);
  });
});