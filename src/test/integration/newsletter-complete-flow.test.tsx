import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NewsletterModal from '../../components/NewsletterModal';

// Store original fetch
const originalFetch = global.fetch;

// Mock the UI components
vi.mock('../../components/ui/Input', () => ({
  Input: React.forwardRef<HTMLInputElement, any>(({ children, ...props }, ref) => 
    <input ref={ref} {...props}>{children}</input>
  )
}));

vi.mock('../../components/ui/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => <div data-testid="loading-spinner" data-size={size}>Loading...</div>
}));

// Mock MSW to prevent interference
vi.mock('msw/node', () => ({
  setupServer: () => ({
    listen: vi.fn(),
    close: vi.fn(),
    use: vi.fn(),
  }),
}));

// Mock the API
const mockFetch = vi.fn();

describe('Newsletter Complete Flow Integration', () => {
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

  it('completes full newsletter subscription flow successfully', async () => {
    const onClose = vi.fn();
    
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Successfully subscribed to newsletter!',
        subscriptionId: 'sub_123456'
      })
    });

    render(
      <NewsletterModal 
        isOpen={true} 
        onClose={onClose} 
        triggerSource="get-notified" 
      />
    );

    // Verify modal is open and form is visible
    expect(screen.getByText('Stay Updated with Arena Fund Insights')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();

    // Fill out the form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Verify loading state
    await waitFor(() => {
      expect(screen.getByText('Subscribing...')).toBeInTheDocument();
    });

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText('Successfully Subscribed!')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify success message
    expect(screen.getByText(/thank you for subscribing to arena fund insights/i)).toBeInTheDocument();

    // Verify API was called correctly
    expect(mockFetch).toHaveBeenCalledWith('/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('John Doe')
    });

    // Close the modal using the success state close button
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('handles validation errors correctly', async () => {
    const onClose = vi.fn();

    render(
      <NewsletterModal 
        isOpen={true} 
        onClose={onClose} 
        triggerSource="subscribe-updates" 
      />
    );

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });
    fireEvent.click(submitButton);

    // Verify validation errors appear for empty form
    await waitFor(() => {
      expect(screen.getByText('Please enter your name')).toBeInTheDocument();
      expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
    });

    // Fill name to clear that error
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    // Name error should be cleared when typing
    await waitFor(() => {
      expect(screen.queryByText('Please enter your name')).not.toBeInTheDocument();
    });

    // Email error should still be there
    expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
  });

  it('handles server errors gracefully', async () => {
    const onClose = vi.fn();
    
    // Mock server error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        message: 'Internal server error'
      })
    });

    render(
      <NewsletterModal 
        isOpen={true} 
        onClose={onClose} 
        triggerSource="get-notified" 
      />
    );

    // Fill out the form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    // Form should still be visible (not success state)
    expect(screen.queryByText('Successfully Subscribed!')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('handles rate limiting correctly', async () => {
    const onClose = vi.fn();
    
    // Mock rate limit response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        success: false,
        message: 'Too many requests',
        error: 'RATE_LIMITED'
      })
    });

    render(
      <NewsletterModal 
        isOpen={true} 
        onClose={onClose} 
        triggerSource="get-notified" 
      />
    );

    // Fill out and submit form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);

    // Wait for rate limit error message
    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });
  });

  it('handles existing subscriber correctly', async () => {
    const onClose = vi.fn();
    
    // Mock existing subscriber response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Already subscribed',
        isExistingSubscriber: true
      })
    });

    render(
      <NewsletterModal 
        isOpen={true} 
        onClose={onClose} 
        triggerSource="get-notified" 
      />
    );

    // Fill out and submit form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.click(submitButton);

    // Wait for success state with existing subscriber message
    await waitFor(() => {
      expect(screen.getByText('Successfully Subscribed!')).toBeInTheDocument();
    });

    // Should show success even for existing subscribers
    expect(screen.getByText(/thank you for subscribing/i)).toBeInTheDocument();
  });

  it('handles keyboard navigation correctly', async () => {
    const onClose = vi.fn();

    render(
      <NewsletterModal 
        isOpen={true} 
        onClose={onClose} 
        triggerSource="get-notified" 
      />
    );

    // Test escape key closes modal
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('handles overlay click correctly', async () => {
    const onClose = vi.fn();

    render(
      <NewsletterModal 
        isOpen={true} 
        onClose={onClose} 
        triggerSource="get-notified" 
      />
    );

    // Click on overlay (not the modal content)
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('prevents form submission when loading', async () => {
    const onClose = vi.fn();
    
    // Mock slow response
    let resolvePromise: (value: any) => void;
    const slowPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    mockFetch.mockReturnValueOnce(slowPromise);

    render(
      <NewsletterModal 
        isOpen={true} 
        onClose={onClose} 
        triggerSource="get-notified" 
      />
    );

    // Fill out form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    // Submit form
    fireEvent.click(submitButton);

    // Verify loading state
    await waitFor(() => {
      expect(screen.getByText('Subscribing...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    // Try to submit again while loading
    fireEvent.click(submitButton);

    // Should still only have one fetch call
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Resolve the promise
    resolvePromise!({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Success'
      })
    });
  });

  it('clears errors when user starts typing', async () => {
    const onClose = vi.fn();

    render(
      <NewsletterModal 
        isOpen={true} 
        onClose={onClose} 
        triggerSource="get-notified" 
      />
    );

    // Submit empty form to trigger validation errors
    const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });
    fireEvent.click(submitButton);

    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText('Please enter your name')).toBeInTheDocument();
      expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
    });

    // Start typing in name field
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'J' } });

    // Name error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Please enter your name')).not.toBeInTheDocument();
    });

    // Email error should still be there
    expect(screen.getByText('Please enter your email address')).toBeInTheDocument();

    // Start typing in email field
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'j' } });

    // Email error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Please enter your email address')).not.toBeInTheDocument();
    });
  });
});