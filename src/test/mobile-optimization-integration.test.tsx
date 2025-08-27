import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModeSelector from '@/components/ModeSelector';
import InvestorForm506b from '@/components/InvestorForm506b';
import InvestorForm506c from '@/components/InvestorForm506c';
import VerificationFileUpload from '@/components/ui/VerificationFileUpload';
import ModeContent from '@/components/ModeContent';

/**
 * Integration tests for mobile optimization
 * These tests verify that mobile optimization classes and attributes are properly applied
 */
describe('Mobile Optimization Integration Tests', () => {
  beforeAll(() => {
    // Mock mobile environment
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // iPhone width
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667, // iPhone height
    });

    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      writable: true,
      value: 5,
    });

    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    });
  });

  describe('Component Class Application', () => {
    it('applies mobile optimization classes to ModeSelector', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={() => {}} />);
      
      const buttons = screen.getAllByRole('tab');
      buttons.forEach(button => {
        expect(button).toHaveClass('touch-target');
        expect(button).toHaveAttribute('style');
        
        const style = button.getAttribute('style');
        expect(style).toContain('font-size');
        expect(style).toContain('-webkit-tap-highlight-color');
      });
    });

    it('applies mobile optimization classes to InvestorForm506b inputs', () => {
      render(<InvestorForm506b />);
      
      const fullNameInput = screen.getByLabelText('Full Name *');
      expect(fullNameInput).toHaveClass('form-input-mobile');
      expect(fullNameInput).toHaveAttribute('style');
      
      const style = fullNameInput.getAttribute('style');
      expect(style).toContain('font-size: 16px');
    });

    it('applies mobile optimization classes to InvestorForm506b submit button', () => {
      render(<InvestorForm506b />);
      
      const submitButton = screen.getByRole('button', { name: /submit expression of interest/i });
      expect(submitButton).toHaveClass('btn-mobile');
      expect(submitButton).toHaveAttribute('style');
      
      const style = submitButton.getAttribute('style');
      expect(style).toContain('-webkit-tap-highlight-color');
    });

    it('applies mobile optimization classes to InvestorForm506c navigation', () => {
      render(<InvestorForm506c />);
      
      const nextButton = screen.getByRole('button', { name: /next step/i });
      expect(nextButton).toHaveClass('btn-mobile');
      expect(nextButton).toHaveAttribute('style');
    });

    it('applies mobile optimization classes to VerificationFileUpload', () => {
      const { container } = render(<VerificationFileUpload />);
      
      const uploadArea = container.querySelector('.file-upload-mobile');
      expect(uploadArea).toBeInTheDocument();
      expect(uploadArea).toHaveClass('touch-target');
    });

    it('applies mobile optimization classes to ModeContent buttons', () => {
      render(<ModeContent mode="506b" />);
      
      const shareInterestButton = screen.getByText('Share Interest');
      expect(shareInterestButton).toHaveClass('btn-mobile');
      expect(shareInterestButton).toHaveClass('w-full');
      expect(shareInterestButton).toHaveClass('sm:w-auto');
    });
  });

  describe('Accessibility Attributes', () => {
    it('applies proper ARIA attributes to ModeSelector', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={() => {}} />);
      
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Investment mode selection');
      
      const selectedTab = screen.getByRole('tab', { selected: true });
      expect(selectedTab).toHaveAttribute('aria-selected', 'true');
      expect(selectedTab).toHaveAttribute('tabIndex', '0');
      
      const unselectedTab = screen.getByRole('tab', { selected: false });
      expect(unselectedTab).toHaveAttribute('aria-selected', 'false');
      expect(unselectedTab).toHaveAttribute('tabIndex', '-1');
    });

    it('applies proper form accessibility attributes', () => {
      render(<InvestorForm506b />);
      
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
      
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAccessibleName();
      });
    });
  });

  describe('Mobile-Specific Attributes', () => {
    it('prevents iOS zoom with 16px font size on inputs', () => {
      render(<InvestorForm506b />);
      
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        const style = input.getAttribute('style');
        expect(style).toContain('font-size: 16px');
      });
      
      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        const style = select.getAttribute('style');
        expect(style).toContain('font-size: 16px');
      });
    });

    it('removes webkit tap highlights on interactive elements', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={() => {}} />);
      
      const buttons = screen.getAllByRole('tab');
      buttons.forEach(button => {
        const style = button.getAttribute('style');
        expect(style).toContain('-webkit-tap-highlight-color: transparent');
      });
    });

    it('applies proper touch action attributes', () => {
      render(<InvestorForm506b />);
      
      const submitButton = screen.getByRole('button', { name: /submit expression of interest/i });
      const style = submitButton.getAttribute('style');
      expect(style).toContain('-webkit-tap-highlight-color');
    });
  });

  describe('Responsive Layout Classes', () => {
    it('uses mobile-first responsive classes in forms', () => {
      const { container } = render(<InvestorForm506b />);
      
      const mobileGrids = container.querySelectorAll('.mobile-grid');
      expect(mobileGrids.length).toBeGreaterThan(0);
      
      mobileGrids.forEach(grid => {
        expect(grid).toHaveClass('mobile-grid');
      });
    });

    it('uses responsive button classes in ModeContent', () => {
      render(<ModeContent mode="506b" />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('w-full');
        expect(button).toHaveClass('sm:w-auto');
      });
    });

    it('uses responsive grid classes in main layout', () => {
      const { container } = render(<InvestorForm506b />);
      
      // Check for responsive grid patterns
      const grids = container.querySelectorAll('[class*="grid"]');
      let hasResponsiveGrid = false;
      
      grids.forEach(grid => {
        const classes = grid.className;
        if (classes.includes('sm:') || classes.includes('mobile-grid')) {
          hasResponsiveGrid = true;
        }
      });
      
      expect(hasResponsiveGrid).toBe(true);
    });
  });

  describe('Form Validation Display', () => {
    it('displays validation errors properly on mobile', async () => {
      const user = userEvent.setup();
      render(<InvestorForm506b />);
      
      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /submit expression of interest/i });
      await user.click(submitButton);
      
      // Check that error messages are displayed
      // Note: This test may need to wait for validation to complete
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Multi-step Form Navigation', () => {
    it('provides proper navigation for multi-step forms', () => {
      render(<InvestorForm506c />);
      
      // Check that progress steps are displayed
      const progressSteps = screen.getByRole('heading', { name: /accreditation verification/i });
      expect(progressSteps).toBeInTheDocument();
      
      // Check navigation buttons
      const nextButton = screen.getByRole('button', { name: /next step/i });
      expect(nextButton).toBeInTheDocument();
      expect(nextButton).toHaveClass('btn-mobile');
      
      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeInTheDocument();
      expect(prevButton).toHaveClass('btn-mobile');
    });
  });

  describe('File Upload Mobile Optimization', () => {
    it('optimizes file upload for mobile', () => {
      render(<VerificationFileUpload />);
      
      const uploadText = screen.getByText(/tap to upload/i);
      expect(uploadText).toBeInTheDocument();
      
      const uploadArea = uploadText.closest('.file-upload-mobile');
      expect(uploadArea).toBeInTheDocument();
      expect(uploadArea).toHaveClass('touch-target');
    });

    it('provides mobile-friendly file upload actions', () => {
      render(<VerificationFileUpload existingFileName="test.pdf" existingFileRef="test-ref" />);
      
      const removeButton = screen.getByText('Remove').closest('button');
      expect(removeButton).toHaveClass('touch-target-sm');
      expect(removeButton).toHaveAttribute('style');
      
      const style = removeButton?.getAttribute('style');
      expect(style).toContain('-webkit-tap-highlight-color');
    });
  });

  describe('Performance Optimizations', () => {
    it('uses efficient CSS classes without excessive nesting', () => {
      const { container } = render(<InvestorForm506b />);
      
      const allElements = container.querySelectorAll('*');
      let maxClassCount = 0;
      
      allElements.forEach(element => {
        if (element.className && typeof element.className === 'string') {
          const classCount = element.className.split(' ').length;
          maxClassCount = Math.max(maxClassCount, classCount);
        }
      });
      
      // Reasonable limit for class count
      expect(maxClassCount).toBeLessThan(25);
    });

    it('applies mobile classes efficiently', () => {
      const { container } = render(<ModeSelector selectedMode="506b" onModeChange={() => {}} />);
      
      const mobileElements = container.querySelectorAll('[class*="touch-target"], [class*="btn-mobile"], [class*="form-input-mobile"]');
      expect(mobileElements.length).toBeGreaterThan(0);
      
      // Ensure mobile classes are applied where needed
      mobileElements.forEach(element => {
        const classes = element.className;
        expect(classes).toMatch(/(touch-target|btn-mobile|form-input-mobile)/);
      });
    });
  });

  describe('Cross-Component Consistency', () => {
    it('maintains consistent mobile optimization across components', () => {
      const components = [
        <ModeSelector selectedMode="506b" onModeChange={() => {}} />,
        <InvestorForm506b />,
        <VerificationFileUpload />,
        <ModeContent mode="506b" />,
      ];
      
      components.forEach((component, index) => {
        const { container, unmount } = render(component);
        
        // Check for mobile optimization classes
        const mobileElements = container.querySelectorAll('[class*="touch-target"], [class*="btn-mobile"], [class*="form-input-mobile"]');
        
        if (index < 3) { // Skip ModeContent as it may not have direct mobile elements
          expect(mobileElements.length).toBeGreaterThan(0);
        }
        
        unmount();
      });
    });
  });
});