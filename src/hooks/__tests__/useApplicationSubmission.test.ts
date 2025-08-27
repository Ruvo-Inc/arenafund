/**
 * Tests for useApplicationSubmission Hook
 * Tests the application submission logic and state management
 */
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApplicationSubmission } from '../useApplicationSubmission';
import { ApplicationService } from '@/lib/application-service';
import type { InvestorFormData } from '@/lib/application-service';

// Hook tests should test hook behavior, not service implementation
// We mock ApplicationService methods, not fetch directly

// Mock ApplicationService methods
vi.mock('@/lib/application-service', () => ({
  ApplicationService: {
    submitApplication: vi.fn(),
    validateFormData: vi.fn(),
    detectPotentialSpam: vi.fn(),
    uploadFile: vi.fn(),
    createPerformanceMonitor: vi.fn(),
    generateFormAnalytics: vi.fn(),
    getFormCompletionPercentage: vi.fn(),
    getFieldErrorMessage: vi.fn(),
    hasFieldError: vi.fn(),
  }
}));

// Mock console methods to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('useApplicationSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    (ApplicationService.createPerformanceMonitor as Mock).mockReturnValue({
      mark: vi.fn(),
      getMetrics: vi.fn().mockReturnValue({}),
      getDuration: vi.fn().mockReturnValue(0)
    });
    
    (ApplicationService.detectPotentialSpam as Mock).mockReturnValue({
      isSpam: false,
      reasons: []
    });
    
    (ApplicationService.validateFormData as Mock).mockReturnValue({
      isValid: true,
      errors: []
    });
    
    (ApplicationService.generateFormAnalytics as Mock).mockReturnValue({
      completionPercentage: 100,
      fieldCount: 10,
      filledFields: 10,
      errorCount: 0,
      hasErrors: false,
      formType: 'startup',
      timestamp: new Date().toISOString()
    });
    
    (ApplicationService.getFormCompletionPercentage as Mock).mockReturnValue(100);
    (ApplicationService.getFieldErrorMessage as Mock).mockReturnValue(null);
    (ApplicationService.hasFieldError as Mock).mockReturnValue(false);
  });

  const createValidFormData = (): InvestorFormData => ({
    mode: '506b',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    country: 'US',
    state: 'CA',
    investorType: 'individual',
    accreditationStatus: 'yes',
    checkSize: '50k-250k',
    areasOfInterest: ['enterprise-ai'],
    referralSource: 'Test',
    consentConfirm: true,
    signature: 'John Doe',
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useApplicationSubmission());

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.applicationId).toBeNull();
      expect(result.current.validationErrors).toEqual([]);
      expect(typeof result.current.submitApplication).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('Successful Submission', () => {
    it('should handle successful 506(b) application submission', async () => {
      const mockResponse = {
        success: true,
        id: 'app-123',
      };

      (ApplicationService.submitApplication as Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useApplicationSubmission());
      const formData = createValidFormData();

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.applicationId).toBe('app-123');
      expect(result.current.validationErrors).toEqual([]);
    });

    it('should handle successful 506(c) application submission', async () => {
      const mockResponse = {
        success: true,
        id: 'app-506c-456',
      };

      (ApplicationService.submitApplication as Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useApplicationSubmission());
      const formData: InvestorFormData = {
        ...createValidFormData(),
        mode: '506c',
        verificationMethod: 'third-party',
        entityName: 'Test Entity',
        jurisdiction: 'Delaware',
      };

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.applicationId).toBe('app-506c-456');
    });

    it('should set isSubmitting to true during submission', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      (ApplicationService.submitApplication as Mock).mockReturnValueOnce(promise);

      const { result } = renderHook(() => useApplicationSubmission());
      const formData = createValidFormData();

      act(() => {
        result.current.submitApplication(formData);
      });

      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        resolvePromise!({
          success: true,
          id: 'test-id'
        });
        await promise;
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('Validation Errors', () => {
    it('should handle validation errors from server', async () => {
      const validationErrors = [
        { field: 'fullName', message: 'Full name is required', code: 'REQUIRED_FIELD' },
        { field: 'email', message: 'Invalid email format', code: 'INVALID_EMAIL' },
      ];

      (ApplicationService.submitApplication as Mock).mockResolvedValueOnce({
        success: false,
        validationErrors: validationErrors,
      });

      const { result } = renderHook(() => useApplicationSubmission());
      const formData = createValidFormData();

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBeNull(); // Should be null when we have validation errors
      expect(result.current.validationErrors).toEqual(validationErrors);
      expect(result.current.applicationId).toBeNull();
    });

    it('should clear previous validation errors on new submission', async () => {
      // First submission with validation errors
      const validationErrors = [
        { field: 'email', message: 'Invalid email', code: 'INVALID_EMAIL' },
      ];

      (ApplicationService.submitApplication as Mock).mockResolvedValueOnce({
        success: false,
        validationErrors: validationErrors,
      });

      const { result } = renderHook(() => useApplicationSubmission());
      const formData = createValidFormData();

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      expect(result.current.validationErrors).toEqual(validationErrors);

      // Second submission successful
      (ApplicationService.submitApplication as Mock).mockResolvedValueOnce({
        success: true,
        id: 'success-id'
      });

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      expect(result.current.validationErrors).toEqual([]);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('Server Errors', () => {
    it('should handle server errors', async () => {
      (ApplicationService.submitApplication as Mock).mockResolvedValueOnce({
        success: false,
        error: 'Internal server error',
      });

      const { result } = renderHook(() => useApplicationSubmission());
      const formData = createValidFormData();

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBe('Internal server error');
      expect(result.current.validationErrors).toEqual([]);
      expect(result.current.applicationId).toBeNull();
    });

    it('should handle network errors', async () => {
      (ApplicationService.submitApplication as Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useApplicationSubmission());
      const formData = createValidFormData();

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toContain('Network error');
      expect(result.current.applicationId).toBeNull();
    });

    it('should handle malformed server responses', async () => {
      (ApplicationService.submitApplication as Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to parse server response'
      });

      const { result } = renderHook(() => useApplicationSubmission());
      const formData = createValidFormData();

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toContain('Failed to parse server response');
    });
  });

  describe('Request Format', () => {
    it('should send correct request format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: 'test-id' }),
      });

      const { result } = renderHook(() => useApplicationSubmission());
      const formData = createValidFormData();

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
    });

    it('should handle form data with file references', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: 'test-id' }),
      });

      const { result } = renderHook(() => useApplicationSubmission());
      const formData: InvestorFormData = {
        ...createValidFormData(),
        mode: '506c',
        verificationMethod: 'third-party',
        entityName: 'Test Entity',
        jurisdiction: 'Delaware',
        verificationFileRef: 'verification-files/test-file.pdf',
      };

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      const sentData = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(sentData.verificationFileRef).toBe('verification-files/test-file.pdf');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset state to initial values', async () => {
      // First, submit an application to change state
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: 'test-id' }),
      });

      const { result } = renderHook(() => useApplicationSubmission());
      const formData = createValidFormData();

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.applicationId).toBe('test-id');

      // Now reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.applicationId).toBeNull();
      expect(result.current.validationErrors).toEqual([]);
    });

    it('should reset after validation errors', async () => {
      // Submit with validation errors
      const validationErrors = [
        { field: 'email', message: 'Invalid email', code: 'INVALID_EMAIL' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          errors: validationErrors,
        }),
      });

      const { result } = renderHook(() => useApplicationSubmission());
      const formData = createValidFormData();

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      expect(result.current.validationErrors).toEqual(validationErrors);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.validationErrors).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should reset after server errors', async () => {
      // Submit with server error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'Server error',
        }),
      });

      const { result } = renderHook(() => useApplicationSubmission());
      const formData = createValidFormData();

      await act(async () => {
        await result.current.submitApplication(formData);
      });

      expect(result.current.error).toBe('Server error');

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          errors: [{ field: 'mode', message: 'Mode is required', code: 'REQUIRED_FIELD' }],
        }),
      });

      const { result } = renderHook(() => useApplicationSubmission());
      const emptyFormData = {} as InvestorFormData;

      await act(async () => {
        await result.current.submitApplication(emptyFormData);
      });

      expect(result.current.validationErrors).toHaveLength(1);
      expect(result.current.validationErrors[0].field).toBe('mode');
    });

    it('should handle special characters in form data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: 'special-chars-id' }),
      });

      const { result } = renderHook(() => useApplicationSubmission());
      const specialCharsFormData: InvestorFormData = {
        ...createValidFormData(),
        fullName: 'José María O\'Connor-Smith',
        referralSource: 'Test with "quotes" & <tags> and émojis 🚀',
      };

      await act(async () => {
        await result.current.submitApplication(specialCharsFormData);
      });

      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('Concurrent Submissions', () => {
    it('should prevent multiple simultaneous submissions', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useApplicationSubmission());
      const formData = createValidFormData();

      // Start first submission
      act(() => {
        result.current.submitApplication(formData);
      });

      expect(result.current.isSubmitting).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Try to start second submission
      act(() => {
        result.current.submitApplication(formData);
      });

      // Should not make another request
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.current.isSubmitting).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ success: true, id: 'test-id' }),
        });
        await promise;
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });
});