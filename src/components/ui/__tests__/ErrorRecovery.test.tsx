import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorRecovery, useErrorRecovery } from '../ErrorRecovery';

describe('ErrorRecovery', () => {
  it('renders nothing when no error', () => {
    const { container } = render(
      <ErrorRecovery error={null} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders error message when error exists', () => {
    render(
      <ErrorRecovery error="Something went wrong" />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('handles Error object', () => {
    const error = new Error('Test error');
    render(
      <ErrorRecovery error={error} />
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('categorizes network errors correctly', () => {
    render(
      <ErrorRecovery error="Network error occurred" />
    );

    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText(/check your internet connection/)).toBeInTheDocument();
  });

  it('categorizes rate limit errors correctly', () => {
    render(
      <ErrorRecovery error="Rate limit exceeded" />
    );

    expect(screen.getByText('Too Many Requests')).toBeInTheDocument();
    expect(screen.getByText(/wait a moment/)).toBeInTheDocument();
  });

  it('categorizes server errors correctly', () => {
    render(
      <ErrorRecovery error="Server error 500" />
    );

    expect(screen.getByText('Server Error')).toBeInTheDocument();
    expect(screen.getByText(/wrong on our end/)).toBeInTheDocument();
  });

  it('categorizes already subscribed errors correctly', () => {
    render(
      <ErrorRecovery error="Already subscribed" />
    );

    expect(screen.getByText('Already Subscribed')).toBeInTheDocument();
    expect(screen.getByText(/already subscribed/)).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(
      <ErrorRecovery
        error="Something went wrong"
        onDismiss={onDismiss}
      />
    );

    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('useErrorRecovery', () => {
  it('initializes with no error', () => {
    const { result } = renderHook(() => useErrorRecovery());

    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
    expect(result.current.canRetry).toBe(true);
  });

  it('handles error correctly', () => {
    const { result } = renderHook(() => useErrorRecovery());

    act(() => {
      result.current.handleError('Test error');
    });

    expect(result.current.error).toBe('Test error');
  });

  it('handles Error object correctly', () => {
    const { result } = renderHook(() => useErrorRecovery());
    const error = new Error('Test error');

    act(() => {
      result.current.handleError(error);
    });

    expect(result.current.error).toBe(error);
  });

  it('clears error correctly', () => {
    const { result } = renderHook(() => useErrorRecovery());

    act(() => {
      result.current.handleError('Test error');
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
  });

  it('increments retry count on retry', () => {
    const { result } = renderHook(() => useErrorRecovery());
    const retryFn = vi.fn();

    act(() => {
      result.current.retry(retryFn);
    });

    expect(result.current.retryCount).toBe(1);
    expect(retryFn).toHaveBeenCalledTimes(1);
  });

  it('respects max retries limit', () => {
    const { result } = renderHook(() => useErrorRecovery(2));
    const retryFn = vi.fn();

    // First retry
    act(() => {
      result.current.retry(retryFn);
    });

    expect(result.current.canRetry).toBe(true);

    // Second retry
    act(() => {
      result.current.retry(retryFn);
    });

    expect(result.current.canRetry).toBe(false);

    // Third retry should not execute
    act(() => {
      result.current.retry(retryFn);
    });

    expect(retryFn).toHaveBeenCalledTimes(2);
    expect(result.current.retryCount).toBe(2);
  });

  it('handles async retry functions', async () => {
    const { result } = renderHook(() => useErrorRecovery());
    const asyncRetryFn = vi.fn().mockResolvedValue('success');

    act(() => {
      result.current.retry(asyncRetryFn);
    });

    expect(asyncRetryFn).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(result.current.retryCount).toBe(1);
    });
  });

  it('handles retry function errors', () => {
    const { result } = renderHook(() => useErrorRecovery());
    const errorRetryFn = vi.fn().mockImplementation(() => {
      throw new Error('Retry failed');
    });

    act(() => {
      result.current.retry(errorRetryFn);
    });

    expect(result.current.error).toEqual(new Error('Retry failed'));
    expect(result.current.retryCount).toBe(1);
  });
});