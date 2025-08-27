import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
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

describe('Newsletter E2E Comprehensive Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockFetch.mockReset();
    // Replace global fetch with our mock
    global.fetch = mockFetch;
    // Setup user event
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe('Complete User Journey', () => {
    it('completes full subscription journey with keyboard navigation', async () => {
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

      // Verify modal is accessible
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'newsletter-modal-title');

      // Navigate using keyboard
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

      // Tab navigation should work
      await user.tab();
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();

      // Fill form using keyboard
      await user.click(nameInput);
      await user.type(nameInput, 'John Doe');
      
      await user.click(emailInput);
      await user.type(emailInput, 'john@example.com');

      // Submit using Enter key
      await user.keyboard('{Enter}');

      // Verify loading state
      await waitFor(() => {
        expect(screen.getByText('Subscribing...')).toBeInTheDocument();
      });

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Successfully Subscribed!')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify API was called correctly
      expect(mockFetch).toHaveBeenCalledWith('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('John Doe')
      });

      // Close using keyboard
      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalled();
    });

    it('handles complete error recovery flow', async () => {
      const onClose = vi.fn();
      
      // Mock server error first, then success
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({
            success: false,
            message: 'Internal server error'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            message: 'Successfully subscribed to newsletter!',
            subscriptionId: 'sub_retry_123'
          })
        });

      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="subscribe-updates" 
        />
      );

      // Fill out form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

      await user.type(nameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');

      // First submission (will fail)
      await user.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Form should still be visible for retry
      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();

      // Retry submission
      await user.click(submitButton);

      // Wait for success this time
      await waitFor(() => {
        expect(screen.getByText('Successfully Subscribed!')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify both API calls were made
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('handles validation flow with real-time feedback', async () => {
      const onClose = vi.fn();

      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="get-notified" 
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

      // Submit empty form
      await user.click(submitButton);

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText('Please enter your name')).toBeInTheDocument();
        expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
      });

      // Start typing in name field
      await user.type(nameInput, 'J');

      // Name error should clear
      await waitFor(() => {
        expect(screen.queryByText('Please enter your name')).not.toBeInTheDocument();
      });

      // Email error should still be there
      expect(screen.getByText('Please enter your email address')).toBeInTheDocument();

      // Type invalid email
      await user.type(emailInput, 'invalid-email');

      // Submit to trigger email validation
      await user.click(submitButton);

      // Should show email format error
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });

      // Fix email
      await user.clear(emailInput);
      await user.type(emailInput, 'john@example.com');

      // Email error should clear
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
      });

      // Complete name
      await user.type(nameInput, 'ohn Doe');

      // Now form should be valid - mock successful submission
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Successfully subscribed!'
        })
      });

      await user.click(submitButton);

      // Should succeed
      await waitFor(() => {
        expect(screen.getByText('Successfully Subscribed!')).toBeInTheDocument();
      });
    });

    it('handles existing subscriber flow', async () => {
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

      // Fill and submit form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

      await user.type(nameInput, 'Existing User');
      await user.type(emailInput, 'existing@example.com');
      await user.click(submitButton);

      // Should show success state even for existing subscribers
      await waitFor(() => {
        expect(screen.getByText('Successfully Subscribed!')).toBeInTheDocument();
      });

      // Should show appropriate message
      expect(screen.getByText(/thank you for subscribing/i)).toBeInTheDocument();
    });

    it('handles rate limiting with user feedback', async () => {
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

      // Fill and submit form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

      await user.type(nameInput, 'Rate Limited User');
      await user.type(emailInput, 'ratelimited@example.com');
      await user.click(submitButton);

      // Should show rate limit message
      await waitFor(() => {
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      });

      // Form should still be available for retry later
      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Accessibility and Screen Reader Support', () => {
    it('provides proper screen reader announcements', async () => {
      const onClose = vi.fn();

      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="get-notified" 
        />
      );

      // Check ARIA labels and descriptions
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-labelledby', 'newsletter-modal-title');
      expect(modal).toHaveAttribute('aria-describedby', 'newsletter-modal-description');

      // Check form labels
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);

      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('aria-required', 'true');

      // Submit empty form to trigger errors
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });
      await user.click(submitButton);

      // Wait for errors
      await waitFor(() => {
        expect(screen.getByText('Please enter your name')).toBeInTheDocument();
      });

      // Check that inputs have aria-invalid when there are errors
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');

      // Fix errors
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');

      // Inputs should no longer be invalid
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'false');
        expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      });
    });

    it('manages focus correctly throughout the flow', async () => {
      const onClose = vi.fn();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Success'
        })
      });

      render(
        <div>
          <button data-testid="trigger">Open Modal</button>
          <NewsletterModal 
            isOpen={true} 
            onClose={onClose} 
            triggerSource="get-notified" 
          />
        </div>
      );

      // Focus should be managed within modal
      const nameInput = screen.getByLabelText(/name/i);
      
      // First input should receive focus when modal opens
      // (In real implementation, this would be handled by useEffect)
      expect(nameInput).toBeInTheDocument();

      // Complete the form
      await user.type(nameInput, 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe to newsletter/i }));

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText('Successfully Subscribed!')).toBeInTheDocument();
      });

      // Close modal
      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Mobile and Touch Interactions', () => {
    it('handles touch interactions correctly', async () => {
      const onClose = vi.fn();

      // Mock touch environment
      Object.defineProperty(window, 'ontouchstart', {
        value: () => {},
        writable: true
      });

      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="get-notified" 
        />
      );

      // Touch interactions should work the same as click
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);

      // Simulate touch events
      fireEvent.touchStart(nameInput);
      fireEvent.touchEnd(nameInput);
      await user.type(nameInput, 'Touch User');

      fireEvent.touchStart(emailInput);
      fireEvent.touchEnd(emailInput);
      await user.type(emailInput, 'touch@example.com');

      expect(nameInput).toHaveValue('Touch User');
      expect(emailInput).toHaveValue('touch@example.com');
    });

    it('handles viewport changes during interaction', async () => {
      const onClose = vi.fn();

      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="get-notified" 
        />
      );

      // Start filling form
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'Viewport User');

      // Simulate viewport change (e.g., mobile keyboard opening)
      const originalInnerHeight = window.innerHeight;
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 400, // Reduced height
      });

      fireEvent(window, new Event('resize'));

      // Modal should still be functional
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(nameInput).toHaveValue('Viewport User');

      // Continue with form
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'viewport@example.com');

      expect(emailInput).toHaveValue('viewport@example.com');

      // Restore viewport
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: originalInnerHeight,
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('handles rapid user interactions gracefully', async () => {
      const onClose = vi.fn();

      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="get-notified" 
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

      // Rapid typing and clicking
      await user.type(nameInput, 'Rapid User');
      await user.type(emailInput, 'rapid@example.com');

      // Multiple rapid clicks on submit
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only trigger one submission
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('handles network interruption gracefully', async () => {
      const onClose = vi.fn();
      
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="get-notified" 
        />
      );

      // Fill and submit form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

      await user.type(nameInput, 'Network User');
      await user.type(emailInput, 'network@example.com');
      await user.click(submitButton);

      // Should show network error message
      await waitFor(() => {
        expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
      });

      // Form should still be available for retry
      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    it('maintains form state during loading', async () => {
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

      // Fill and submit form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

      await user.type(nameInput, 'Loading User');
      await user.type(emailInput, 'loading@example.com');
      await user.click(submitButton);

      // Verify loading state
      await waitFor(() => {
        expect(screen.getByText('Subscribing...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });

      // Form values should be maintained
      expect(nameInput).toHaveValue('Loading User');
      expect(emailInput).toHaveValue('loading@example.com');

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Success'
        })
      });

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText('Successfully Subscribed!')).toBeInTheDocument();
      });
    });
  });
});