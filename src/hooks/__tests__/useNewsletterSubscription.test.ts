import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNewsletterSubscription } from '../useNewsletterSubscription';

// Store original fetch
const originalFetch = global.fetch;

// Mock fetch
const mockFetch = vi.fn();

// Disable MSW for these tests
vi.mock('msw/node', () => ({
  setupServer: () => ({
    listen: vi.fn(),
    close: vi.fn(),
    use: vi.fn(),
  }),
}));

describe('useNewsletterSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockFetch.mockReset();
    // Replace global fetch with our mock
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original fetch
    global.fetch = originalFetch;
  });

  it('initializes with empty form data', () => {
    const { result } = renderHook(() => useNewsletterSubscription());
    
    expect(result.current.formData).toEqual({ name: '', email: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.submissionState).toEqual({
      isLoading: false,
      isSuccess: false,
      error: undefined
    });
  });

  it('handles input changes correctly', () => {
    const { result } = renderHook(() => useNewsletterSubscription());
    
    act(() => {
      result.current.handleInputChange('name', 'John Doe');
    });
    
    expect(result.current.formData.name).toBe('John Doe');
  });

  it('clears field errors when input changes', () => {
    const { result } = renderHook(() => useNewsletterSubscription());
    
    // Set initial error state
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    
    // Should have validation errors
    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.email).toBeDefined();
    
    // Clear error by changing input
    act(() => {
      result.current.handleInputChange('name', 'John');
    });
    
    expect(result.current.errors.name).toBeUndefined();
  });

  it('validates required fields on submit', async () => {
    const { result } = renderHook(() => useNewsletterSubscription());
    
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    
    expect(result.current.errors.name).toBe('Please enter your name');
    expect(result.current.errors.email).toBe('Please enter your email address');
  });

  it('validates email format', async () => {
    const { result } = renderHook(() => useNewsletterSubscription());
    
    act(() => {
      result.current.handleInputChange('name', 'John Doe');
      result.current.handleInputChange('email', 'invalid-email');
    });
    
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    
    expect(result.current.errors.email).toBe('Please enter a valid email address');
  });

  it('submits form with valid data', async () => {
    // Mock CSRF token request first
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Subscribed successfully' })
      });

    const { result } = renderHook(() => useNewsletterSubscription('test-source'));
    
    act(() => {
      result.current.handleInputChange('name', 'John Doe');
      result.current.handleInputChange('email', 'john@example.com');
    });
    
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    
    // Check that fetch was called twice (CSRF + actual request)
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/newsletter/subscribe', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'test-csrf-token'
      }),
      body: expect.stringContaining('John Doe')
    }));
    
    expect(result.current.submissionState.isSuccess).toBe(true);
    expect(result.current.submissionState.isLoading).toBe(false);
  });

  it('handles server errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' })
    });

    const { result } = renderHook(() => useNewsletterSubscription());
    
    act(() => {
      result.current.handleInputChange('name', 'John Doe');
      result.current.handleInputChange('email', 'john@example.com');
    });
    
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    
    expect(result.current.submissionState.isSuccess).toBe(false);
    expect(result.current.submissionState.error).toBeDefined();
    expect(result.current.errors.general).toBe('Something went wrong. Please try again later.');
  });

  it('handles rate limiting', async () => {
    // Mock CSRF token request first
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ message: 'Rate limited' })
      });

    const { result } = renderHook(() => useNewsletterSubscription());
    
    act(() => {
      result.current.handleInputChange('name', 'John Doe');
      result.current.handleInputChange('email', 'john@example.com');
    });
    
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    
    expect(result.current.errors.general).toBe('Too many requests. Please wait a moment before trying again.');
  });

  it('handles existing subscriber', async () => {
    // Mock CSRF token request first
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true, 
          message: 'Already subscribed',
          isExistingSubscriber: true 
        })
      });

    const { result } = renderHook(() => useNewsletterSubscription());
    
    act(() => {
      result.current.handleInputChange('name', 'John Doe');
      result.current.handleInputChange('email', 'john@example.com');
    });
    
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    
    expect(result.current.submissionState.isSuccess).toBe(true);
    expect(result.current.errors.general).toBe('You\'re already subscribed! Thank you for your interest.');
  });

  it('resets form correctly', () => {
    const { result } = renderHook(() => useNewsletterSubscription());
    
    // Set some data and errors
    act(() => {
      result.current.handleInputChange('name', 'John Doe');
      result.current.handleInputChange('email', 'john@example.com');
    });
    
    act(() => {
      result.current.resetForm();
    });
    
    expect(result.current.formData).toEqual({ name: '', email: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.submissionState).toEqual({
      isLoading: false,
      isSuccess: false,
      error: undefined
    });
  });

  it('sets loading state during submission', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    mockFetch.mockReturnValueOnce(promise);

    const { result } = renderHook(() => useNewsletterSubscription());
    
    act(() => {
      result.current.handleInputChange('name', 'John Doe');
      result.current.handleInputChange('email', 'john@example.com');
    });
    
    // Start submission
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    
    // Should be loading
    expect(result.current.submissionState.isLoading).toBe(true);
    
    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true, message: 'Success' })
      });
    });
    
    // Should no longer be loading
    expect(result.current.submissionState.isLoading).toBe(false);
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles network errors gracefully', async () => {
      // Mock CSRF token request to succeed, then network error on actual request
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' })
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useNewsletterSubscription());
      
      act(() => {
        result.current.handleInputChange('name', 'John Doe');
        result.current.handleInputChange('email', 'john@example.com');
      });
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });
      
      expect(result.current.submissionState.isSuccess).toBe(false);
      expect(result.current.errors.general).toBe('Something went wrong. Please try again later.');
    });

    it('handles malformed response gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      const { result } = renderHook(() => useNewsletterSubscription());
      
      act(() => {
        result.current.handleInputChange('name', 'John Doe');
        result.current.handleInputChange('email', 'john@example.com');
      });
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });
      
      expect(result.current.submissionState.isSuccess).toBe(false);
      expect(result.current.errors.general).toBe('Something went wrong. Please try again later.');
    });

    it('handles empty response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({})
      });

      const { result } = renderHook(() => useNewsletterSubscription());
      
      act(() => {
        result.current.handleInputChange('name', 'John Doe');
        result.current.handleInputChange('email', 'john@example.com');
      });
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });
      
      expect(result.current.errors.general).toBe('Something went wrong. Please try again later.');
    });

    it('validates email with various formats', async () => {
      const { result } = renderHook(() => useNewsletterSubscription());
      
      const testCases = [
        { email: '', expectedError: 'Please enter your email address' },
        { email: 'invalid', expectedError: 'Please enter a valid email address' },
        { email: '@example.com', expectedError: 'Please enter a valid email address' },
        { email: 'test@', expectedError: 'Please enter a valid email address' },
        { email: 'test..test@example.com', expectedError: 'Email cannot contain consecutive dots' },
        { email: 'test@example', expectedError: 'Please enter a valid email address' },
        { email: 'test@.com', expectedError: 'Please enter a valid email address' }
      ];

      for (const testCase of testCases) {
        act(() => {
          result.current.handleInputChange('name', 'John Doe');
          result.current.handleInputChange('email', testCase.email);
        });
        
        await act(async () => {
          await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
        });
        
        expect(result.current.errors.email).toBe(testCase.expectedError);
      }
    });

    it('validates name with various formats', async () => {
      const { result } = renderHook(() => useNewsletterSubscription());
      
      const testCases = [
        { name: '', expectedError: 'Please enter your name' },
        { name: '   ', expectedError: 'Please enter your name' },
        { name: 'a', expectedError: 'Name must be at least 2 characters long' },
        { name: 'A'.repeat(101), expectedError: 'Name must be less than 100 characters' }
      ];

      for (const testCase of testCases) {
        act(() => {
          result.current.handleInputChange('name', testCase.name);
          result.current.handleInputChange('email', 'john@example.com');
        });
        
        await act(async () => {
          await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
        });
        
        expect(result.current.errors.name).toBe(testCase.expectedError);
      }
    });

    it('handles concurrent submissions correctly', async () => {
      let resolveFirst: (value: any) => void;
      let resolveSecond: (value: any) => void;
      
      const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });
      
      const secondPromise = new Promise((resolve) => {
        resolveSecond = resolve;
      });

      // Mock CSRF token requests and actual requests
      mockFetch
        .mockReturnValueOnce(firstPromise) // First CSRF request
        .mockReturnValueOnce(secondPromise); // First actual request

      const { result } = renderHook(() => useNewsletterSubscription());
      
      act(() => {
        result.current.handleInputChange('name', 'John Doe');
        result.current.handleInputChange('email', 'john@example.com');
      });
      
      // Start first submission
      act(() => {
        result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });
      
      expect(result.current.submissionState.isLoading).toBe(true);
      
      // Try to start second submission while first is loading
      act(() => {
        result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });
      
      // Should still only have started one submission (CSRF + actual request)
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // Resolve CSRF request
      await act(async () => {
        resolveFirst!({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' })
        });
      });
      
      // Now the actual request should be made
      expect(mockFetch).toHaveBeenCalledTimes(2);
      
      // Resolve actual request
      await act(async () => {
        resolveSecond!({
          ok: true,
          json: async () => ({ success: true, message: 'Success' })
        });
      });
      
      expect(result.current.submissionState.isLoading).toBe(false);
      expect(result.current.submissionState.isSuccess).toBe(true);
    });

    it('handles source parameter correctly', async () => {
      // Mock CSRF token request first
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, message: 'Success' })
        });

      const { result } = renderHook(() => useNewsletterSubscription('custom-source'));
      
      act(() => {
        result.current.handleInputChange('name', 'John Doe');
        result.current.handleInputChange('email', 'john@example.com');
      });
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });
      
      expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/newsletter/subscribe', expect.objectContaining({
        body: expect.stringContaining('custom-source')
      }));
    });
  });

  describe('Performance and Memory', () => {
    it('should not cause memory leaks with rapid state changes', () => {
      const { result } = renderHook(() => useNewsletterSubscription());
      
      // Rapidly change form data
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.handleInputChange('name', `Name ${i}`);
          result.current.handleInputChange('email', `email${i}@example.com`);
        });
      }
      
      expect(result.current.formData.name).toBe('Name 99');
      expect(result.current.formData.email).toBe('email99@example.com');
    });

    it('should handle rapid reset calls', () => {
      const { result } = renderHook(() => useNewsletterSubscription());
      
      act(() => {
        result.current.handleInputChange('name', 'John Doe');
        result.current.handleInputChange('email', 'john@example.com');
      });
      
      // Rapidly reset multiple times
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.resetForm();
        });
      }
      
      expect(result.current.formData).toEqual({ name: '', email: '' });
      expect(result.current.errors).toEqual({});
    });
  });
});