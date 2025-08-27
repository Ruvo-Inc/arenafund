# Comprehensive Test Architecture Fix

## Problem Analysis

Our test suite has architectural issues that need to be resolved:

### 1. **Hook Testing Mismatch**
- Hook calls `ApplicationService.submitApplication()`
- Tests expect direct `fetch` calls
- Need to align test expectations with actual implementation

### 2. **Mock Strategy Issues**
- Inconsistent mocking between unit and integration tests
- Some tests mock ApplicationService, others expect fetch calls
- Need clear separation between unit and integration test strategies

### 3. **Test Environment Configuration**
- Rate limiting affecting test execution
- Need proper test environment detection
- Missing test data factories

## Solution Strategy

### Phase 1: Fix Hook Tests (Unit Tests)
Hook tests should test the hook behavior, not the underlying service implementation.

```typescript
// Hook tests should mock ApplicationService and test hook state management
describe('useApplicationSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock ApplicationService methods
    (ApplicationService.submitApplication as Mock).mockResolvedValue({
      success: true,
      id: 'test-id'
    });
  });

  it('should handle successful submission', async () => {
    const { result } = renderHook(() => useApplicationSubmission());
    
    await act(async () => {
      await result.current.submitApplication(mockFormData);
    });
    
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.applicationId).toBe('test-id');
    expect(ApplicationService.submitApplication).toHaveBeenCalledWith(mockFormData);
  });
});
```

### Phase 2: Fix Integration Tests
Integration tests should test the full flow including network calls.

```typescript
// Integration tests should test actual API calls
describe('Application Submission Integration', () => {
  beforeEach(() => {
    // Mock fetch for integration tests
    global.fetch = vi.fn();
  });

  it('should submit application via API', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: 'test-id' })
    });

    const result = await ApplicationService.submitApplication(mockFormData);
    
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expectedPayload)
    });
  });
});
```

### Phase 3: Test Data Factories
Create consistent test data across all tests.

```typescript
export const TestDataFactory = {
  createValidFormData: (overrides = {}) => ({
    fullName: 'Test User',
    email: 'test@example.com',
    companyName: 'Test Company',
    // ... other required fields
    ...overrides
  }),
  
  createValidInvestorFormData: (overrides = {}) => ({
    mode: '506b' as const,
    fullName: 'Test Investor',
    email: 'investor@example.com',
    country: 'US',
    state: 'CA',
    investorType: 'individual' as const,
    accreditationStatus: 'yes' as const,
    checkSize: '25k-50k' as const,
    areasOfInterest: ['enterprise-ai'],
    consentConfirm: true,
    signature: 'Test Investor',
    ...overrides
  })
};
```

## Implementation Plan

### Step 1: Fix Hook Tests
1. Remove direct fetch mocking from hook tests
2. Mock ApplicationService methods properly
3. Test hook state management, not service implementation
4. Focus on user interaction flows

### Step 2: Fix Integration Tests
1. Keep fetch mocking for integration tests
2. Test actual service-to-API communication
3. Verify request/response formats
4. Test error handling and retry logic

### Step 3: Add Test Environment Configuration
1. Proper test environment detection
2. Skip rate limiting in tests
3. Consistent test data factories
4. Proper cleanup between tests

### Step 4: Separate Test Types
1. **Unit Tests**: Test individual components/hooks in isolation
2. **Integration Tests**: Test service-to-API communication
3. **E2E Tests**: Test complete user workflows

This approach will give us:
- ✅ Fast, reliable unit tests
- ✅ Comprehensive integration tests
- ✅ Clear separation of concerns
- ✅ Consistent test data
- ✅ Proper mocking strategies