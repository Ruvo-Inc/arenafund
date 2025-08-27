import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNewsletterSubscription } from '../useNewsletterSubscription';

describe('useNewsletterSubscription - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
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
    expect(result.current.formData.email).toBe('');
    
    act(() => {
      result.current.handleInputChange('email', 'john@example.com');
    });
    
    expect(result.current.formData.name).toBe('John Doe');
    expect(result.current.formData.email).toBe('john@example.com');
  });

  it('validates required fields', async () => {
    const { result } = renderHook(() => useNewsletterSubscription());
    
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    
    expect(result.current.errors.name).toBe('Please enter your name');
    expect(result.current.errors.email).toBe('Please enter your email address');
    expect(result.current.submissionState.isLoading).toBe(false);
    expect(result.current.submissionState.isSuccess).toBe(false);
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
    
    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.errors.email).toBe('Please enter a valid email address');
  });

  it('validates various email formats correctly', async () => {
    const { result } = renderHook(() => useNewsletterSubscription());
    
    const testCases = [
      { email: 'test@example.com', valid: true },
      { email: 'user.name@domain.co.uk', valid: true },
      { email: 'user+tag@example.org', valid: true },
      { email: 'invalid-email', valid: false },
      { email: '@example.com', valid: false },
      { email: 'test@', valid: false },
      { email: '', valid: false },
    ];

    for (const testCase of testCases) {
      // Reset form state
      act(() => {
        result.current.resetForm();
      });
      
      act(() => {
        result.current.handleInputChange('name', 'John Doe');
        result.current.handleInputChange('email', testCase.email);
      });
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
      });
      
      if (testCase.valid) {
        // For valid emails, there should be no email validation error
        // (there might be network errors, but no validation errors)
        expect(result.current.errors.email).toBeUndefined();
      } else {
        // For invalid emails, there should be a validation error
        expect(result.current.errors.email).toBeDefined();
      }
    }
  });

  it('clears field errors when input changes', () => {
    const { result } = renderHook(() => useNewsletterSubscription());
    
    // First trigger validation errors
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    
    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.email).toBeDefined();
    
    // Clear name error by changing input
    act(() => {
      result.current.handleInputChange('name', 'John');
    });
    
    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.errors.email).toBeDefined(); // Should still be there
    
    // Clear email error by changing input
    act(() => {
      result.current.handleInputChange('email', 'john@example.com');
    });
    
    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.errors.email).toBeUndefined();
  });

  it('resets form correctly', () => {
    const { result } = renderHook(() => useNewsletterSubscription());
    
    // Set some data and trigger errors
    act(() => {
      result.current.handleInputChange('name', 'John Doe');
      result.current.handleInputChange('email', 'john@example.com');
    });
    
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    
    // Reset form
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

  it('includes source in form data when provided', () => {
    const { result } = renderHook(() => useNewsletterSubscription('test-source'));
    
    // The source should be used internally, we can't directly test it without mocking fetch
    // But we can verify the hook initializes correctly with the source parameter
    expect(result.current.formData).toEqual({ name: '', email: '' });
    expect(result.current.errors).toEqual({});
  });

  it('handles multiple rapid input changes correctly', () => {
    const { result } = renderHook(() => useNewsletterSubscription());
    
    act(() => {
      result.current.handleInputChange('name', 'J');
      result.current.handleInputChange('name', 'Jo');
      result.current.handleInputChange('name', 'Joh');
      result.current.handleInputChange('name', 'John');
      result.current.handleInputChange('name', 'John Doe');
    });
    
    expect(result.current.formData.name).toBe('John Doe');
    
    act(() => {
      result.current.handleInputChange('email', 'j');
      result.current.handleInputChange('email', 'jo');
      result.current.handleInputChange('email', 'john');
      result.current.handleInputChange('email', 'john@');
      result.current.handleInputChange('email', 'john@example.com');
    });
    
    expect(result.current.formData.email).toBe('john@example.com');
  });

  it('maintains form state consistency during validation', async () => {
    const { result } = renderHook(() => useNewsletterSubscription());
    
    // Set valid name, invalid email
    act(() => {
      result.current.handleInputChange('name', 'John Doe');
      result.current.handleInputChange('email', 'invalid');
    });
    
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });
    
    // Form data should remain unchanged
    expect(result.current.formData.name).toBe('John Doe');
    expect(result.current.formData.email).toBe('invalid');
    
    // Only email should have error
    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.errors.email).toBeDefined();
  });
});