import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import NewsletterModal from '../../components/NewsletterModal';

// Mock the portal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

// Mock the newsletter subscription hook
vi.mock('../../hooks/useNewsletterSubscription', () => ({
  useNewsletterSubscription: vi.fn(() => ({
    formData: { name: '', email: '' },
    errors: {},
    submissionState: { isLoading: false, isSuccess: false },
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    resetForm: vi.fn(),
  })),
}));

describe('Newsletter Modal - Mobile Responsiveness and Accessibility Integration', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    triggerSource: 'get-notified' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.scrollY for scroll position restoration
    Object.defineProperty(window, 'scrollY', {
      value: 100,
      writable: true,
    });
  });

  afterEach(() => {
    // Clean up any body styles that might persist
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
  });

  it('should implement all mobile responsiveness requirements', () => {
    render(<NewsletterModal {...defaultProps} />);
    
    // Check responsive design elements
    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveClass('newsletter-modal-overlay');
    
    const content = screen.getByRole('document');
    expect(content).toHaveClass('newsletter-modal-content');
    
    // Check touch targets
    const closeButton = screen.getByRole('button', { name: /close newsletter subscription modal/i });
    expect(closeButton).toHaveClass('touch-target');
    
    const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });
    expect(submitButton).toHaveClass('btn-mobile', 'touch-target');
  });

  it('should implement all accessibility requirements', () => {
    render(<NewsletterModal {...defaultProps} />);
    
    // Check ARIA attributes
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'newsletter-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'newsletter-modal-description');
    expect(dialog).toHaveAttribute('aria-live', 'polite');
    
    // Check form accessibility
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveAttribute('aria-required', 'true');
    expect(nameInput).toHaveAttribute('autoComplete', 'name');
    
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute('aria-required', 'true');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(emailInput).toHaveAttribute('inputMode', 'email');
    
    // Check screen reader support
    expect(screen.getByText('Enter your full name for newsletter subscription')).toHaveClass('sr-only');
    expect(screen.getByText('Enter your email address to receive newsletter updates')).toHaveClass('sr-only');
  });

  it('should handle keyboard navigation correctly', async () => {
    const user = userEvent.setup();
    render(<NewsletterModal {...defaultProps} />);
    
    // Focus should start on close button
    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /close newsletter subscription modal/i });
      expect(closeButton).toHaveFocus();
    });
    
    // Tab navigation should work
    await user.tab();
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveFocus();
    
    await user.tab();
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveFocus();
  });

  it('should handle touch events properly', () => {
    const onClose = vi.fn();
    render(<NewsletterModal {...defaultProps} onClose={onClose} />);
    
    const overlay = screen.getByRole('dialog');
    
    // Simulate touch start and end on overlay
    fireEvent.touchStart(overlay, {
      touches: [{ clientY: 100 }],
    });
    
    fireEvent.touchEnd(overlay, {
      changedTouches: [{ clientY: 105 }], // Small movement, should close
    });
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should prevent body scroll when modal is open', () => {
    render(<NewsletterModal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.width).toBe('100%');
    expect(document.body.style.top).toBe('-100px'); // Based on mocked scrollY
  });

  it('should restore body scroll when modal closes', () => {
    const { rerender } = render(<NewsletterModal {...defaultProps} />);
    
    // Modal is open, body scroll should be prevented
    expect(document.body.style.overflow).toBe('hidden');
    
    // Close modal
    rerender(<NewsletterModal {...defaultProps} isOpen={false} />);
    
    // Body scroll should be restored
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
    expect(document.body.style.width).toBe('');
    expect(document.body.style.top).toBe('');
  });

  it('should have mobile-optimized form inputs', () => {
    render(<NewsletterModal {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveClass('form-input-mobile');
    
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveClass('form-input-mobile');
    
    const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });
    expect(submitButton).toHaveClass('btn-mobile');
  });

  it('should close modal on Escape key', () => {
    const onClose = vi.fn();
    render(<NewsletterModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});