import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewsletterModal from '../NewsletterModal';
import { NewsletterForm } from '../NewsletterForm';

// Mock the UI components
vi.mock('../ui/Input', () => ({
  Input: ({ children, ...props }: any) => <input {...props}>{children}</input>
}));

vi.mock('../ui/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => <div data-testid="loading-spinner" data-size={size}>Loading...</div>
}));

// Mock the hook with different states
const mockHook = {
  formData: { name: '', email: '' },
  errors: {},
  submissionState: { isLoading: false, isSuccess: false },
  handleInputChange: vi.fn(),
  handleSubmit: vi.fn(),
  resetForm: vi.fn()
};

vi.mock('../../hooks/useNewsletterSubscription', () => ({
  useNewsletterSubscription: vi.fn(() => mockHook)
}));

describe('Newsletter Success and Error Handling Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock hook to default state
    Object.assign(mockHook, {
      formData: { name: '', email: '' },
      errors: {},
      submissionState: { isLoading: false, isSuccess: false },
      handleInputChange: vi.fn(),
      handleSubmit: vi.fn(),
      resetForm: vi.fn()
    });
  });

  describe('Success Handling', () => {
    it('should display success message in modal after successful submission', async () => {
      const onClose = vi.fn();
      
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose}
          triggerSource="get-notified"
        />
      );

      // Initially should show the form
      expect(screen.getByText('Stay Updated with Arena Fund Insights')).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();

      // Simulate successful submission by updating the hook state
      Object.assign(mockHook, {
        submissionState: { isLoading: false, isSuccess: true }
      });

      // Re-render to trigger the success state
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose}
          triggerSource="get-notified"
        />
      );

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText('Successfully Subscribed!')).toBeInTheDocument();
        expect(screen.getByText(/Thank you for subscribing to Arena Fund insights/)).toBeInTheDocument();
      });

      // Should have close button
      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toBeInTheDocument();

      // Clicking close should call onClose
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });

    it('should show success message in standalone form', () => {
      const onSuccess = vi.fn();
      
      Object.assign(mockHook, {
        submissionState: { isLoading: false, isSuccess: true }
      });

      render(<NewsletterForm onSuccess={onSuccess} />);

      // onSuccess should be called when submission is successful
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display network error with retry option', () => {
      Object.assign(mockHook, {
        errors: {
          general: 'Unable to connect. Please check your internet connection.'
        }
      });

      render(<NewsletterForm />);

      // Should show network error message
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText(/check your internet connection/)).toBeInTheDocument();
      
      // Should have retry button
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    it('should display server error with retry option', () => {
      Object.assign(mockHook, {
        errors: {
          general: 'Something went wrong. Please try again later.'
        }
      });

      render(<NewsletterForm />);

      // Should show server error message
      expect(screen.getByText('Server Error')).toBeInTheDocument();
      expect(screen.getByText(/wrong on our end/)).toBeInTheDocument();
      
      // Should have retry button
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });

    it('should display rate limit error with auto-dismiss', () => {
      Object.assign(mockHook, {
        errors: {
          general: 'Too many requests. Please wait a moment before trying again.'
        }
      });

      render(<NewsletterForm />);

      // Should show rate limit error message
      expect(screen.getByText('Too Many Requests')).toBeInTheDocument();
      expect(screen.getByText(/too quickly/)).toBeInTheDocument();
      
      // Should only have dismiss button (no retry for rate limits)
      expect(screen.queryByRole('button', { name: 'Try Again' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    });

    it('should display already subscribed message as info', () => {
      Object.assign(mockHook, {
        errors: {
          general: "You're already subscribed! Thank you for your interest."
        }
      });

      render(<NewsletterForm />);

      // Should show already subscribed message
      expect(screen.getByText('Already Subscribed')).toBeInTheDocument();
      expect(screen.getByText(/already subscribed/)).toBeInTheDocument();
      
      // Should have OK button
      expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    });

    it('should handle field validation errors', () => {
      Object.assign(mockHook, {
        errors: {
          name: 'Please enter your name',
          email: 'Please enter a valid email address'
        }
      });

      render(<NewsletterForm />);

      // Should show field-specific errors
      expect(screen.getByText('Please enter your name')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      
      // Form fields should have error styling
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      
      expect(nameInput).toHaveClass('border-arena-bright-umber', 'bg-arena-sunrise');
      expect(emailInput).toHaveClass('border-arena-bright-umber', 'bg-arena-sunrise');
    });

    it('should handle retry functionality', () => {
      Object.assign(mockHook, {
        errors: {
          general: 'Network error occurred'
        }
      });

      render(<NewsletterForm />);

      // Should show retry button
      const retryButton = screen.getByRole('button', { name: 'Try Again' });
      expect(retryButton).toBeInTheDocument();

      // Clicking retry should call resetForm
      fireEvent.click(retryButton);
      expect(mockHook.resetForm).toHaveBeenCalled();
    });

    it('should handle error dismissal', () => {
      Object.assign(mockHook, {
        errors: {
          general: 'Something went wrong'
        }
      });

      render(<NewsletterForm />);

      // Should show dismiss button
      const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
      expect(dismissButton).toBeInTheDocument();

      // Clicking dismiss should clear the error (by calling handleInputChange)
      fireEvent.click(dismissButton);
      expect(mockHook.handleInputChange).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during submission', () => {
      Object.assign(mockHook, {
        submissionState: { isLoading: true, isSuccess: false }
      });

      render(<NewsletterForm />);

      // Should show loading spinner and text
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Subscribing...')).toBeInTheDocument();
      
      // Submit button should be disabled
      const submitButton = screen.getByRole('button', { name: /subscribing/i });
      expect(submitButton).toBeDisabled();
      
      // Form inputs should be disabled
      expect(screen.getByLabelText(/name/i)).toBeDisabled();
      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for success message', async () => {
      const onClose = vi.fn();
      
      Object.assign(mockHook, {
        submissionState: { isLoading: false, isSuccess: true }
      });

      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose}
          triggerSource="get-notified"
        />
      );

      await waitFor(() => {
        const successMessage = screen.getByRole('status');
        expect(successMessage).toHaveAttribute('aria-live', 'polite');
        expect(successMessage).toHaveAttribute('aria-atomic', 'true');
      });
    });

    it('should have proper ARIA attributes for error messages', () => {
      Object.assign(mockHook, {
        errors: {
          general: 'Something went wrong'
        }
      });

      render(<NewsletterForm />);

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
      expect(errorMessage).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have proper ARIA attributes for field errors', () => {
      Object.assign(mockHook, {
        errors: {
          name: 'Please enter your name',
          email: 'Please enter a valid email address'
        }
      });

      render(<NewsletterForm />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      
      // Error messages should have proper roles
      const nameError = screen.getByText('Please enter your name');
      const emailError = screen.getByText('Please enter a valid email address');
      
      expect(nameError).toHaveAttribute('role', 'alert');
      expect(emailError).toHaveAttribute('role', 'alert');
    });
  });
});