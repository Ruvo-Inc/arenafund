// Debug validation issue
const { ApplicationService } = require('./src/lib/application-service.ts');

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

console.log('Testing validation with invalid accreditation status...');
const result = ApplicationService.validateInvestorFormData(testData);
console.log('Result:', JSON.stringify(result, null, 2));