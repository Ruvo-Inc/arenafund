import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNewsletterModal } from '../useNewsletterModal';

describe('useNewsletterModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Hook Definition and Interface', () => {
    it('should be defined and exportable', () => {
      expect(useNewsletterModal).toBeDefined();
      expect(typeof useNewsletterModal).toBe('function');
    });

    it('should return the expected interface', () => {
      const { result } = renderHook(() => useNewsletterModal());

      expect(result.current).toHaveProperty('isOpen');
      expect(result.current).toHaveProperty('triggerSource');
      expect(result.current).toHaveProperty('openModal');
      expect(result.current).toHaveProperty('closeModal');

      expect(typeof result.current.isOpen).toBe('boolean');
      expect(typeof result.current.openModal).toBe('function');
      expect(typeof result.current.closeModal).toBe('function');
    });
  });

  describe('Initial State', () => {
    it('should initialize with modal closed', () => {
      const { result } = renderHook(() => useNewsletterModal());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.triggerSource).toBeUndefined();
    });
  });

  describe('Opening Modal', () => {
    it('should open modal without trigger source', () => {
      const { result } = renderHook(() => useNewsletterModal());

      act(() => {
        result.current.openModal();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.triggerSource).toBeUndefined();
    });

    it('should open modal with get-notified trigger source', () => {
      const { result } = renderHook(() => useNewsletterModal());

      act(() => {
        result.current.openModal('get-notified');
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.triggerSource).toBe('get-notified');
    });

    it('should open modal with subscribe-updates trigger source', () => {
      const { result } = renderHook(() => useNewsletterModal());

      act(() => {
        result.current.openModal('subscribe-updates');
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.triggerSource).toBe('subscribe-updates');
    });

    it('should update trigger source when opening modal multiple times', () => {
      const { result } = renderHook(() => useNewsletterModal());

      act(() => {
        result.current.openModal('get-notified');
      });

      expect(result.current.triggerSource).toBe('get-notified');

      act(() => {
        result.current.openModal('subscribe-updates');
      });

      expect(result.current.triggerSource).toBe('subscribe-updates');
    });
  });

  describe('Closing Modal', () => {
    it('should close modal and reset trigger source after delay', () => {
      const { result } = renderHook(() => useNewsletterModal());

      // Open modal first
      act(() => {
        result.current.openModal('get-notified');
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.triggerSource).toBe('get-notified');

      // Close modal
      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.triggerSource).toBe('get-notified'); // Still set initially

      // Fast-forward time to trigger the timeout
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.triggerSource).toBeUndefined();
    });

    it('should handle closing modal when already closed', () => {
      const { result } = renderHook(() => useNewsletterModal());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.triggerSource).toBeUndefined();
    });
  });

  describe('Multiple Open/Close Cycles', () => {
    it('should handle multiple open and close cycles', () => {
      const { result } = renderHook(() => useNewsletterModal());

      // First open/close cycle
      act(() => {
        result.current.openModal('get-notified');
      });
      expect(result.current.isOpen).toBe(true);
      expect(result.current.triggerSource).toBe('get-notified');

      act(() => {
        result.current.closeModal();
      });
      expect(result.current.isOpen).toBe(false);

      // Wait for trigger source reset
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current.triggerSource).toBeUndefined();

      // Second open/close cycle with different source
      act(() => {
        result.current.openModal('subscribe-updates');
      });
      expect(result.current.isOpen).toBe(true);
      expect(result.current.triggerSource).toBe('subscribe-updates');

      act(() => {
        result.current.closeModal();
      });
      expect(result.current.isOpen).toBe(false);

      // Wait for trigger source reset
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current.triggerSource).toBeUndefined();
    });

    it('should handle rapid open/close cycles', () => {
      const { result } = renderHook(() => useNewsletterModal());

      // Rapid open/close without waiting for timeout
      act(() => {
        result.current.openModal('get-notified');
        result.current.closeModal();
        result.current.openModal('subscribe-updates');
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.triggerSource).toBe('subscribe-updates');
    });
  });

  describe('Function Stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useNewsletterModal());

      const initialOpenModal = result.current.openModal;
      const initialCloseModal = result.current.closeModal;

      rerender();

      expect(result.current.openModal).toBe(initialOpenModal);
      expect(result.current.closeModal).toBe(initialCloseModal);
    });

    it('should maintain stable function references across state changes', () => {
      const { result } = renderHook(() => useNewsletterModal());

      const initialOpenModal = result.current.openModal;
      const initialCloseModal = result.current.closeModal;

      // Change state
      act(() => {
        result.current.openModal('get-notified');
      });

      expect(result.current.openModal).toBe(initialOpenModal);
      expect(result.current.closeModal).toBe(initialCloseModal);

      // Change state again
      act(() => {
        result.current.closeModal();
      });

      expect(result.current.openModal).toBe(initialOpenModal);
      expect(result.current.closeModal).toBe(initialCloseModal);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid trigger source gracefully', () => {
      const { result } = renderHook(() => useNewsletterModal());

      expect(() => {
        act(() => {
          result.current.openModal('invalid-source' as any);
        });
      }).not.toThrow();

      expect(result.current.isOpen).toBe(true);
      expect(result.current.triggerSource).toBe('invalid-source');
    });

    it('should handle timeout cleanup on unmount', () => {
      const { result, unmount } = renderHook(() => useNewsletterModal());

      act(() => {
        result.current.openModal('get-notified');
        result.current.closeModal();
      });

      // Unmount before timeout completes
      unmount();

      // Should not throw or cause memory leaks
      act(() => {
        vi.advanceTimersByTime(300);
      });
    });

    it('should handle multiple close calls before timeout', () => {
      const { result } = renderHook(() => useNewsletterModal());

      act(() => {
        result.current.openModal('get-notified');
      });

      act(() => {
        result.current.closeModal();
        result.current.closeModal(); // Multiple calls
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.triggerSource).toBeUndefined();
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct trigger source types', () => {
      const { result } = renderHook(() => useNewsletterModal());

      // These should work without TypeScript errors
      act(() => {
        result.current.openModal();
        result.current.openModal('get-notified');
        result.current.openModal('subscribe-updates');
      });

      expect(result.current.isOpen).toBe(true);
    });
  });
});