import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewsletterModal from '../NewsletterModal';

import { vi } from 'vitest';
import { it } from 'zod/v4/locales';
import { describe } from 'node:test';
import { it } from 'zod/v4/locales';
import { describe } from 'node:test';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { describe } from 'node:test';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { describe } from 'node:test';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { describe } from 'node:test';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { describe } from 'node:test';
import { afterEach } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

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

describe('NewsletterModal - Mobile Responsiveness and Accessibility', () => {
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

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<NewsletterModal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'newsletter-modal-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'newsletter-modal-description');
      expect(dialog).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper heading structure', () => {
      render(<NewsletterModal {...defaultProps} />);
      
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent('Stay Updated with Arena Fund Insights');
      expect(title).toHaveAttribute('id', 'newsletter-modal-title');
    });

    it('should have accessible close button', () => {
      render(<NewsletterModal {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: /close newsletter subscription modal/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close newsletter subscription modal');
      expect(closeButton).toHaveAttribute('title', 'Close modal (Escape key)');
    });

    it('should have proper form labels and descriptions', () => {
      render(<NewsletterModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-help');
      
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-help');
    });

    it('should announce form errors to screen readers', async () => {
      const { useNewsletterSubscription } = await import('../../hooks/useNewsletterSubscription');
      vi.mocked(useNewsletterSubscription).mockReturnValue({
        formData: { name: '', email: '' },
        errors: { name: 'Name is required', email: 'Email is required' },
        submissionState: { isLoading: false, isSuccess: false },
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        resetForm: vi.fn(),
      });

      render(<NewsletterModal {...defaultProps} />);
      
      const nameError = screen.getByRole('alert', { name: /name is required/i });
      expect(nameError).toHaveAttribute('aria-live', 'polite');
      
      const emailError = screen.getByRole('alert', { name: /email is required/i });
      expect(emailError).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should focus close button when modal opens', async () => {
      render(<NewsletterModal {...defaultProps} />);
      
      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close newsletter subscription modal/i });
        expect(closeButton).toHaveFocus();
      });
    });

    it('should close modal on Escape key', async () => {
      const onClose = vi.fn();
      render(<NewsletterModal {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      render(<NewsletterModal {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: /close newsletter subscription modal/i });
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });
      
      // Focus should start on close button
      await waitFor(() => expect(closeButton).toHaveFocus());
      
      // Tab should move to name input
      await user.tab();
      expect(nameInput).toHaveFocus();
      
      // Tab should move to email input
      await user.tab();
      expect(emailInput).toHaveFocus();
      
      // Tab should move to submit button
      await user.tab();
      expect(submitButton).toHaveFocus();
      
      // Tab should wrap back to close button
      await user.tab();
      expect(closeButton).toHaveFocus();
      
      // Shift+Tab should go backwards
      await user.tab({ shift: true });
      expect(submitButton).toHaveFocus();
    });

    it('should restore focus when modal closes', async () => {
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Open Modal';
      document.body.appendChild(triggerButton);
      triggerButton.focus();
      
      const { rerender } = render(<NewsletterModal {...defaultProps} />);
      
      // Modal should be open and focus should be trapped
      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close newsletter subscription modal/i });
        expect(closeButton).toHaveFocus();
      });
      
      // Close modal
      rerender(<NewsletterModal {...defaultProps} isOpen={false} />);
      
      // Focus should be restored to trigger button
      expect(triggerButton).toHaveFocus();
      
      document.body.removeChild(triggerButton);
    });
  });

  describe('Mobile Touch Support', () => {
    it('should have proper touch targets', () => {
      render(<NewsletterModal {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: /close newsletter subscription modal/i });
      expect(closeButton).toHaveClass('touch-target');
      
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });
      expect(submitButton).toHaveClass('btn-mobile', 'touch-target');
    });

    it('should have mobile-optimized form inputs', () => {
      render(<NewsletterModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveClass('form-input-mobile');
      expect(nameInput).toHaveAttribute('autoComplete', 'name');
      
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveClass('form-input-mobile');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('inputMode', 'email');
    });

    it('should handle touch events on overlay', () => {
      const onClose = vi.fn();
      render(<NewsletterModal {...defaultProps} onClose={onClose} />);
      
      const overlay = screen.getByRole('dialog');
      
      // Simulate touch start and end on overlay (not modal content)
      fireEvent.touchStart(overlay, {
        touches: [{ clientY: 100 }],
      });
      
      fireEvent.touchEnd(overlay, {
        changedTouches: [{ clientY: 105 }], // Small movement, should still close
      });
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should not close on touch if user scrolled significantly', () => {
      const onClose = vi.fn();
      render(<NewsletterModal {...defaultProps} onClose={onClose} />);
      
      const overlay = screen.getByRole('dialog');
      
      // Simulate touch start and end with significant movement (scroll gesture)
      fireEvent.touchStart(overlay, {
        touches: [{ clientY: 100 }],
      });
      
      fireEvent.touchEnd(overlay, {
        changedTouches: [{ clientY: 150 }], // Large movement, should not close
      });
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Management', () => {
    it('should prevent body scroll when modal opens', () => {
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
  });

  describe('Success State Accessibility', () => {
    it('should announce success state to screen readers', async () => {
      const { useNewsletterSubscription } = await import('../../hooks/useNewsletterSubscription');
      vi.mocked(useNewsletterSubscription).mockReturnValue({
        formData: { name: '', email: '' },
        errors: {},
        submissionState: { isLoading: false, isSuccess: true },
        handleInputChange: vi.fn(),
        handleSubmit: vi.fn(),
        resetForm: vi.fn(),
      });

      const { rerender } = render(<NewsletterModal {...defaultProps} />);
      
      // Trigger success state
      rerender(<NewsletterModal {...defaultProps} />);
      
      const successMessage = screen.getByRole('status');
      expect(successMessage).toHaveAttribute('aria-live', 'polite');
      expect(successMessage).toHaveAttribute('aria-atomic', 'true');
      
      const successTitle = screen.getByText('Successfully Subscribed!');
      expect(successTitle).toHaveAttribute('id', 'success-title');
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAttribute('aria-describedby', 'success-title success-description');
    });
  });

  describe('Responsive Design', () => {
    it('should apply mobile classes correctly', () => {
      render(<NewsletterModal {...defaultProps} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('newsletter-modal-overlay');
      
      const content = screen.getByRole('document');
      expect(content).toHaveClass('newsletter-modal-content');
    });
  });
});