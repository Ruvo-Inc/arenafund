// Simple debug test
import { ApplicationService } from './src/lib/application-service.js';

const testData = {
  mode: '506b',
  fullName: 'John Doe',
  email: 'john@example.com',
  country: 'US',
  state: 'CA',
  investorType: 'individual',
  accreditationStatus: 'invalid-status',
  checkSize: '50k-250k',
  areasOfInterest: ['enterprise-ai', 'fintech-ai'],
  consentConfirm: true,
  signature: 'John Doe'
};

console.log('Testing validation...');
try {
  const result = ApplicationService.validateInvestorFormData(testData);
  console.log('Validation result:', result);
  console.log('Errors:', result.errors);
} catch (error) {
  console.error('Error during validation:', error);
}