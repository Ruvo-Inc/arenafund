import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NewsletterForm } from '../NewsletterForm';

// Mock the UI components
vi.mock('../ui/Input', () => ({
  Input: ({ children, ...props }: any) => <input {...props}>{children}</input>
}));

vi.mock('../ui/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => <div data-testid="loading-spinner" data-size={size}>Loading...</div>
}));

// Mock the hook
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

describe('NewsletterForm', () => {
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

  it('renders form fields correctly', () => {
    render(<NewsletterForm />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe to newsletter/i })).toBeInTheDocument();
  });

  it('displays privacy notice', () => {
    render(<NewsletterForm />);
    
    expect(screen.getByText(/by subscribing, you consent to receive email notifications/i)).toBeInTheDocument();
  });

  it('shows loading state when submitting', () => {
    Object.assign(mockHook, {
      submissionState: { isLoading: true, isSuccess: false }
    });

    render(<NewsletterForm />);
    
    expect(screen.getByText('Subscribing...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribing/i })).toBeDisabled();
  });

  it('displays validation errors', () => {
    Object.assign(mockHook, {
      errors: {
        name: 'Please enter your name',
        email: 'Please enter a valid email address',
        general: 'Something went wrong'
      }
    });

    render(<NewsletterForm />);
    
    expect(screen.getByText('Please enter your name')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    // The general error is now displayed in a ServerErrorMessage component
    expect(screen.getByText('Something went wrong on our end. Please try again in a moment.')).toBeInTheDocument();
  });

  it('calls onSuccess when submission is successful', async () => {
    const onSuccess = vi.fn();
    
    const { rerender } = render(<NewsletterForm onSuccess={onSuccess} />);
    
    // Update to successful state
    Object.assign(mockHook, {
      submissionState: { isLoading: false, isSuccess: true }
    });

    rerender(<NewsletterForm onSuccess={onSuccess} />);
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('handles input changes', () => {
    render(<NewsletterForm />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    
    expect(mockHook.handleInputChange).toHaveBeenCalledWith('name', 'John Doe');
    expect(mockHook.handleInputChange).toHaveBeenCalledWith('email', 'john@example.com');
  });

  it('handles form submission', () => {
    Object.assign(mockHook, {
      formData: { name: 'John Doe', email: 'john@example.com' }
    });

    render(<NewsletterForm />);
    
    const form = screen.getByRole('button', { name: /subscribe to newsletter/i }).closest('form');
    fireEvent.submit(form!);
    
    expect(mockHook.handleSubmit).toHaveBeenCalled();
  });
});