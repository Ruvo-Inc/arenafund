# Investor Application Test Suite Documentation

This document provides comprehensive documentation for the investor application test suite, covering all aspects of testing for the dual-mode (506(b) and 506(c)) investor application functionality.

## Overview

The investor application test suite ensures the reliability, security, and user experience of the investor application system. It covers:

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoints and data flow testing  
- **End-to-End Tests**: Complete user journey testing
- **Security Tests**: Vulnerability and abuse prevention testing
- **Mobile Tests**: Responsive design and touch interaction testing

## Test Structure

### Unit Tests (`src/components/__tests__/`)

#### InvestorForm506b.test.tsx
Tests the 506(b) expression of interest form component:
- **Form Rendering**: Validates all required sections and fields are displayed
- **Form Interactions**: Tests user input, validation, and state management
- **Form Validation**: Ensures proper validation rules and error display
- **Form Submission**: Tests successful submission and error handling
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Security**: Input sanitization and honeypot detection
- **Performance**: Real-time validation and submission prevention

#### InvestorForm506c.test.tsx
Tests the 506(c) multi-step verification form component:
- **Multi-step Structure**: Navigation between 4 steps with proper validation
- **Step 1 - Accreditation Verification**: Verification method selection and file upload
- **Step 2 - Investor Profile**: Personal and entity information collection
- **Step 3 - Investment Preferences**: Investment size and sector preferences
- **Step 4 - Document Access**: Legal agreements and signature collection
- **Form Submission**: Complete multi-step form submission flow
- **Accessibility**: Step indicators, navigation, and screen reader support
- **Security**: File upload validation and input sanitization
- **Performance**: Step validation and submission handling

#### ModeSelector.test.tsx
Tests the mode selection component for choosing between 506(b) and 506(c):
- **Rendering**: Both mode options with descriptions
- **Interaction**: Mode switching and selection state
- **Accessibility**: ARIA attributes and keyboard navigation
- **Visual States**: Selected, unselected, hover, and focus states
- **Responsive Design**: Mobile-friendly layout and touch targets

#### ModeContent.test.tsx
Tests the mode-specific content display component:
- **Content Rendering**: Mode-specific information and CTAs
- **Mode Switching**: Dynamic content updates based on selected mode
- **Button Actions**: Proper event handling for mode-specific actions
- **Accessibility**: Content structure and navigation
- **Responsive Design**: Mobile optimization

#### InvestorSuccess.test.tsx
Tests the success confirmation components for both modes:
- **506(b) Success**: Expression of interest confirmation
- **506(c) Success**: Verification request confirmation
- **Content Display**: Mode-specific messaging and next steps
- **Navigation**: Links to additional resources
- **Accessibility**: Success message announcement

#### VerificationFileUpload.test.tsx
Tests the file upload component for verification documents:
- **File Selection**: PDF file selection and validation
- **Upload Process**: File upload with progress indication
- **File Management**: File removal and replacement
- **Validation**: File type, size, and security validation
- **Error Handling**: Upload failures and retry mechanisms
- **Accessibility**: File upload accessibility features

### Validation Tests (`src/lib/__tests__/`)

#### investor-validation.test.ts
Tests core validation logic for investor form data:
- **506(b) Validation**: Required fields and business rules
- **506(c) Validation**: Additional verification requirements
- **Cross-field Validation**: Business logic consistency checks
- **Real-time Validation**: Individual field validation
- **International Support**: Country-specific validation rules
- **Edge Cases**: Boundary conditions and error scenarios

#### investor-api-validation.test.ts
Tests API-level validation rules:
- **Payload Structure**: Request format validation
- **Field Validation**: Individual field rules and formats
- **Business Logic**: Cross-field validation rules
- **Security Validation**: Input sanitization and security checks
- **Error Responses**: Proper error message formatting

#### investor-security-validation.test.ts
Tests security-specific validation:
- **Input Sanitization**: XSS and injection prevention
- **Rate Limiting**: Abuse prevention mechanisms
- **File Security**: Upload validation and path traversal prevention
- **Data Protection**: PII handling and privacy compliance

### Integration Tests (`src/test/integration/`)

#### investor-application.integration.test.ts
Tests complete API integration for investor applications:
- **API Route Testing**: POST /api/applications endpoint
- **Data Flow**: Form submission to database storage
- **Email Notifications**: Operations team notification system
- **File Upload Integration**: Verification document handling
- **Dual-mode Support**: Both 506(b) and 506(c) flows
- **Error Handling**: API error responses and recovery
- **Concurrent Submissions**: Multiple simultaneous applications
- **Data Integrity**: Audit logging and metadata storage

#### verification-file-upload.integration.test.ts
Tests file upload functionality integration:
- **Signed URL Generation**: Secure upload URL creation
- **File Upload Process**: Complete upload workflow
- **File Validation**: Server-side file validation
- **Security Measures**: Path validation and access control
- **Error Scenarios**: Upload failures and edge cases

#### investor-application-e2e.test.ts
Tests complete end-to-end user journeys:
- **506(b) Complete Flow**: Expression of interest submission
- **506(c) Complete Flow**: Verification process with file upload
- **Dual-mode Functionality**: Switching between modes
- **Error Recovery**: Handling failures and retries
- **Performance Testing**: Response times and scalability
- **Data Integrity**: End-to-end data consistency

#### investor-security.test.ts
Tests security aspects of the investor application system:
- **Input Sanitization**: XSS and injection attack prevention
- **Rate Limiting**: Abuse prevention and throttling
- **File Upload Security**: Malicious file detection and prevention
- **Data Protection**: PII handling and privacy compliance
- **API Security**: Authentication and authorization
- **Business Logic Security**: Privilege escalation prevention

### Mobile Tests (`src/test/mobile-optimization-integration.test.tsx`)

Tests mobile-specific functionality:
- **Responsive Design**: Layout adaptation for mobile devices
- **Touch Interactions**: Touch-friendly controls and navigation
- **Form Usability**: Mobile form input and validation
- **File Upload**: Mobile file selection and upload
- **Performance**: Mobile-optimized loading and interactions

## Test Configuration

### vitest.investor.config.ts
Specialized configuration for investor application tests:
- **Test Environment**: jsdom for component testing
- **Coverage Thresholds**: High coverage requirements for critical components
- **Test Timeouts**: Extended timeouts for integration tests
- **File Inclusion**: Specific test file patterns
- **Reporting**: Comprehensive test result reporting

### Test Runner (run-investor-tests.ts)
Automated test execution with comprehensive reporting:
- **Test Suite Organization**: Logical grouping of related tests
- **Dependency Checking**: Verification of required test files
- **Progress Reporting**: Real-time test execution status
- **Summary Reports**: Detailed results and recommendations
- **Coverage Analysis**: Test coverage assessment and recommendations

## Running Tests

### Individual Test Suites

```bash
# Unit tests for investor forms
npm run test src/components/__tests__/InvestorForm506b.test.tsx
npm run test src/components/__tests__/InvestorForm506c.test.tsx

# Validation logic tests
npm run test src/lib/__tests__/investor-validation.test.ts

# Integration tests
npm run test src/test/integration/investor-application.integration.test.ts

# End-to-end tests
npm run test src/test/integration/investor-application-e2e.test.ts

# Security tests
npm run test src/test/integration/investor-security.test.ts
```

### Complete Test Suite

```bash
# Run all investor application tests
npx tsx src/test/run-investor-tests.ts

# Run with specific configuration
npx vitest --config vitest.investor.config.ts

# Run with coverage
npx vitest --config vitest.investor.config.ts --coverage
```

### Continuous Integration

```bash
# CI-friendly test execution
npm run test:investor:ci

# With coverage reporting
npm run test:investor:coverage
```

## Test Data and Mocking

### Mock Data
- **Valid Form Data**: Complete, valid investor applications for both modes
- **Invalid Data**: Various invalid inputs for validation testing
- **Edge Cases**: Boundary conditions and unusual scenarios
- **Security Payloads**: Malicious inputs for security testing

### API Mocking
- **MSW (Mock Service Worker)**: API response mocking for unit tests
- **Real API Testing**: Integration tests use actual API endpoints
- **File Upload Mocking**: Simulated file upload scenarios

### Environment Setup
- **Test Environment Variables**: Isolated test configuration
- **Database Mocking**: Firestore emulator for integration tests
- **Email Service Mocking**: Email notification testing

## Coverage Requirements

### Component Coverage
- **Critical Components**: 90% coverage requirement
  - InvestorForm506b.tsx
  - InvestorForm506c.tsx
  - ApplicationService validation methods
- **Supporting Components**: 80% coverage requirement
  - ModeSelector.tsx
  - VerificationFileUpload.tsx
  - Success components

### Test Types Coverage
- **Unit Tests**: All components and utility functions
- **Integration Tests**: All API endpoints and data flows
- **End-to-End Tests**: Complete user journeys for both modes
- **Security Tests**: All input validation and security measures
- **Mobile Tests**: Responsive design and touch interactions

## Quality Assurance

### Test Quality Metrics
- **Test Reliability**: Tests should pass consistently
- **Test Performance**: Tests should complete within reasonable time
- **Test Maintainability**: Tests should be easy to update and extend
- **Test Coverage**: High coverage of critical functionality

### Best Practices
- **Descriptive Test Names**: Clear, specific test descriptions
- **Isolated Tests**: Each test should be independent
- **Realistic Data**: Use realistic test data and scenarios
- **Error Testing**: Test both success and failure scenarios
- **Accessibility Testing**: Include accessibility validation
- **Security Testing**: Test for common vulnerabilities

## Troubleshooting

### Common Issues
- **Test Timeouts**: Increase timeout for slow integration tests
- **Mock Failures**: Verify mock service worker configuration
- **File Upload Tests**: Ensure proper file creation and cleanup
- **API Tests**: Check environment variable configuration

### Debugging
- **Verbose Output**: Use `--reporter=verbose` for detailed test output
- **Test Isolation**: Run individual tests to isolate issues
- **Console Logging**: Add temporary logging for debugging
- **Coverage Reports**: Use coverage reports to identify untested code

## Maintenance

### Regular Updates
- **Test Data**: Update test data to reflect current requirements
- **Mock Responses**: Keep API mocks synchronized with actual responses
- **Security Tests**: Add new security tests for emerging threats
- **Performance Baselines**: Update performance expectations

### Monitoring
- **Test Execution Time**: Monitor for performance degradation
- **Test Failure Rates**: Track test reliability over time
- **Coverage Trends**: Monitor coverage changes over time
- **Security Test Results**: Regular security test execution

## Contributing

### Adding New Tests
1. Follow existing test patterns and naming conventions
2. Include both positive and negative test cases
3. Add appropriate mocking and test data
4. Update test runner configuration if needed
5. Document new test functionality

### Test Review Process
1. Ensure comprehensive coverage of new functionality
2. Verify test reliability and performance
3. Review test data and mocking strategies
4. Validate accessibility and security testing
5. Update documentation as needed

This comprehensive test suite ensures the investor application system is reliable, secure, and provides an excellent user experience across all supported scenarios and devices.