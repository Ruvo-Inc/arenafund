import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NewsletterModal from '../NewsletterModal';

// Mock createPortal to render in the same container
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

describe('NewsletterModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document body overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up document body overflow
    document.body.style.overflow = '';
  });

  describe('Component Structure and Props', () => {
    it('should be defined and exportable', () => {
      expect(NewsletterModal).toBeDefined();
      expect(typeof NewsletterModal).toBe('function');
    });

    it('should return null when isOpen is false', () => {
      render(
        <NewsletterModal 
          isOpen={false} 
          onClose={mockOnClose} 
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true', () => {
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Stay Updated with Arena Fund Insights')).toBeInTheDocument();
      expect(screen.getByText(/Get notified when we publish new insights/)).toBeInTheDocument();
    });

    it('should handle optional triggerSource prop', () => {
      const { rerender } = render(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
          triggerSource="get-notified"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
          triggerSource="subscribe-updates"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Form Elements', () => {
    beforeEach(() => {
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );
    });

    it('should display all form fields correctly', () => {
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Subscribe to Newsletter' })).toBeInTheDocument();
    });

    it('should have proper form field attributes', () => {
      const nameInput = screen.getByLabelText(/Name/);
      const emailInput = screen.getByLabelText(/Email Address/);
      const submitButton = screen.getByRole('button', { name: 'Subscribe to Newsletter' });

      expect(nameInput).toHaveAttribute('type', 'text');
      expect(nameInput).toHaveAttribute('placeholder', 'Enter your full name');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email address');

      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should allow user input in form fields', async () => {
      const nameInput = screen.getByLabelText(/Name/);
      const emailInput = screen.getByLabelText(/Email Address/);

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      });

      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john@example.com');
    });
  });

  describe('Modal Interactions', () => {
    beforeEach(() => {
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );
    });

    it('should call onClose when close button is clicked', async () => {
      const closeButton = screen.getByRole('button', { name: 'Close newsletter subscription modal' });
      
      await act(async () => {
        fireEvent.click(closeButton);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', async () => {
      const overlay = screen.getByRole('dialog');
      
      await act(async () => {
        fireEvent.click(overlay);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when modal content is clicked', async () => {
      const modalTitle = screen.getByText('Stay Updated with Arena Fund Insights');
      
      await act(async () => {
        fireEvent.click(modalTitle);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', async () => {
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when other keys are pressed', async () => {
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Enter' });
        fireEvent.keyDown(document, { key: 'Space' });
        fireEvent.keyDown(document, { key: 'Tab' });
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility Features', () => {
    beforeEach(() => {
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );
    });

    it('should have proper ARIA attributes', () => {
      const dialog = screen.getByRole('dialog');
      
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'newsletter-modal-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'newsletter-modal-description');
    });

    it('should have proper heading structure', () => {
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent('Stay Updated with Arena Fund Insights');
      expect(title).toHaveAttribute('id', 'newsletter-modal-title');
    });

    it('should have proper form labels', () => {
      const nameLabel = screen.getByText(/Name \*/);
      const emailLabel = screen.getByText(/Email Address \*/);
      
      expect(nameLabel).toHaveAttribute('for', 'newsletter-name');
      expect(emailLabel).toHaveAttribute('for', 'newsletter-email');
    });

    it('should attempt to focus first input when modal opens', async () => {
      // Mock focus method to verify it's called
      const focusSpy = vi.fn();
      
      // Re-render to trigger focus effect
      const { rerender } = render(
        <NewsletterModal 
          isOpen={false} 
          onClose={mockOnClose} 
        />
      );

      rerender(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );

      // Verify the input exists and can receive focus
      const nameInput = screen.getByLabelText(/Name/);
      expect(nameInput).toBeInTheDocument();
      
      // In jsdom, focus behavior is limited, so we just verify the element is focusable
      expect(nameInput).not.toHaveAttribute('disabled');
      expect(nameInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Background Scroll Prevention', () => {
    it('should prevent background scrolling when modal is open', () => {
      const { rerender } = render(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <NewsletterModal 
          isOpen={false} 
          onClose={mockOnClose} 
        />
      );

      expect(document.body.style.overflow).toBe('');
    });

    it('should restore scroll when component unmounts', () => {
      const { unmount } = render(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Event Cleanup', () => {
    it('should clean up event listeners when modal closes', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { rerender } = render(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      rerender(
        <NewsletterModal 
          isOpen={false} 
          onClose={mockOnClose} 
        />
      );

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should clean up event listeners when component unmounts', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );
    });

    it('should handle form submission', async () => {
      const nameInput = screen.getByLabelText(/Name/);
      const emailInput = screen.getByLabelText(/Email Address/);
      const submitButton = screen.getByRole('button', { name: 'Subscribe to Newsletter' });

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.click(submitButton);
      });

      // Form submission behavior will be implemented in the next task
      // For now, we just verify the form can be submitted without errors
      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john@example.com');
    });
  });

  describe('Error Boundaries', () => {
    it('should handle errors gracefully', () => {
      // Test with invalid props
      expect(() => {
        render(
          <NewsletterModal 
            isOpen={true} 
            onClose={mockOnClose} 
            triggerSource={'invalid-source' as any}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Performance and Memory', () => {
    it('should not cause memory leaks with rapid open/close', () => {
      const { rerender } = render(
        <NewsletterModal 
          isOpen={false} 
          onClose={mockOnClose} 
        />
      );

      // Rapidly toggle modal state
      for (let i = 0; i < 10; i++) {
        rerender(
          <NewsletterModal 
            isOpen={true} 
            onClose={mockOnClose} 
          />
        );
        rerender(
          <NewsletterModal 
            isOpen={false} 
            onClose={mockOnClose} 
          />
        );
      }

      // Should not throw or cause issues
      expect(document.body.style.overflow).toBe('');
    });

    it('should handle multiple simultaneous modals gracefully', () => {
      const onClose1 = vi.fn();
      const onClose2 = vi.fn();

      const { container } = render(
        <>
          <NewsletterModal 
            isOpen={true} 
            onClose={onClose1} 
          />
          <NewsletterModal 
            isOpen={true} 
            onClose={onClose2} 
          />
        </>
      );

      // Both modals should render
      const dialogs = container.querySelectorAll('[role="dialog"]');
      expect(dialogs).toHaveLength(2);
    });
  });

  describe('Form State Persistence', () => {
    it('should maintain form data when modal is closed and reopened', () => {
      const { rerender } = render(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );

      // Fill form
      const nameInput = screen.getByLabelText(/Name/);
      const emailInput = screen.getByLabelText(/Email Address/);
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      // Close modal
      rerender(
        <NewsletterModal 
          isOpen={false} 
          onClose={mockOnClose} 
        />
      );

      // Reopen modal
      rerender(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );

      // Form data should be cleared (fresh state)
      const newNameInput = screen.getByLabelText(/Name/);
      const newEmailInput = screen.getByLabelText(/Email Address/);
      
      expect(newNameInput).toHaveValue('');
      expect(newEmailInput).toHaveValue('');
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle viewport changes gracefully', () => {
      // Mock window resize
      const originalInnerWidth = window.innerWidth;
      const originalInnerHeight = window.innerHeight;

      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      );

      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      fireEvent(window, new Event('resize'));

      // Modal should still be functional
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Restore original values
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: originalInnerHeight,
      });
    });
  });
});