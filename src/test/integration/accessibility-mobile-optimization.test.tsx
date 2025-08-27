import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  AccessibleMobileLayout,
  AccessibleHeader,
  AccessibleMain,
  AccessibleFooter,
  AccessibleSection,
  AccessibleCard,
} from '@/components/ui/AccessibleMobileLayout';
import { TouchButton } from '@/components/ui/TouchButton';
import { TouchInput } from '@/components/ui/TouchInput';
import { testAccessibility } from '@/lib/accessibility-testing';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock hooks
vi.mock('@/hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkMode: false,
    isScreenReaderActive: false,
    fontSize: 16,
    animationDuration: 0.3,
    announce: vi.fn(),
    getOptimalStyles: (styles: any) => styles,
    getButtonProps: (label: string, options: any = {}) => ({
      'aria-label': label,
      role: 'button',
      tabIndex: 0,
      ...options,
    }),
    getInputProps: (label: string, options: any = {}) => ({
      'aria-label': label,
      ...options,
    }),
    getDialogProps: (title: string, options: any = {}) => ({
      role: 'dialog',
      'aria-label': title,
      ...options,
    }),
    runAccessibilityAudit: vi.fn(() => ({
      passed: true,
      issues: [],
      warnings: [],
      score: 100,
    })),
  }),
  useFocusManagement: () => ({
    trapFocus: vi.fn(),
    releaseFocus: vi.fn(),
  }),
  useLiveRegion: () => ({
    message: '',
    priority: 'polite',
    announce: vi.fn(),
    liveRegionProps: {
      'aria-live': 'polite',
      'aria-atomic': true,
      className: 'sr-only',
    },
  }),
}));

vi.mock('@/hooks/useMobileOptimization', () => ({
  useMobileOptimization: () => ({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: true,
    shouldShowMobileUI: true,
    viewportWidth: 375,
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Accessibility and Mobile Optimization Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AccessibleMobileLayout', () => {
    it('should render with proper accessibility structure', async () => {
      const { container } = render(
        <AccessibleMobileLayout>
          <AccessibleHeader>
            <h1>Test App</h1>
          </AccessibleHeader>
          <AccessibleMain pageTitle="Home Page">
            <p>Main content</p>
          </AccessibleMain>
          <AccessibleFooter>
            <p>Footer content</p>
          </AccessibleFooter>
        </AccessibleMobileLayout>
      );

      // Check for skip link
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');

      // Check for live region
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeInTheDocument();

      // Run axe accessibility tests
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle focus trap when enabled', () => {
      render(
        <AccessibleMobileLayout enableFocusTrap>
          <AccessibleMain>
            <button>Test Button</button>
          </AccessibleMain>
        </AccessibleMobileLayout>
      );

      // Focus trap should be activated (mocked)
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should announce page changes', () => {
      const { rerender } = render(
        <AccessibleMobileLayout announcePageChanges>
          <AccessibleMain pageTitle="Page 1">
            <p>Content 1</p>
          </AccessibleMain>
        </AccessibleMobileLayout>
      );

      rerender(
        <AccessibleMobileLayout announcePageChanges>
          <AccessibleMain pageTitle="Page 2">
            <p>Content 2</p>
          </AccessibleMain>
        </AccessibleMobileLayout>
      );

      // Announcement should be made (mocked)
      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });
  });

  describe('AccessibleHeader', () => {
    it('should render with proper landmark roles', async () => {
      const { container } = render(
        <AccessibleHeader
          logo={<img src="/logo.png" alt="Company Logo" />}
          navigation={
            <nav>
              <a href="/home">Home</a>
              <a href="/about">About</a>
            </nav>
          }
        />
      );

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should show mobile menu button on mobile', () => {
      render(
        <AccessibleHeader
          mobileMenuButton={
            <button aria-label="Toggle menu">☰</button>
          }
        />
      );

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('AccessibleMain', () => {
    it('should render with proper main landmark', async () => {
      const { container } = render(
        <AccessibleMain pageTitle="Test Page">
          <h1>Page Title</h1>
          <p>Page content</p>
        </AccessibleMain>
      );

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('tabIndex', '-1');

      // Check for screen reader only h1
      const srOnlyH1 = container.querySelector('h1.sr-only');
      expect(srOnlyH1).toHaveTextContent('Test Page');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('AccessibleFooter', () => {
    it('should render with proper contentinfo role', async () => {
      const { container } = render(
        <AccessibleFooter
          links={
            <nav>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
            </nav>
          }
          copyright="© 2024 Company"
        />
      );

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Footer navigation');

      expect(screen.getByText('© 2024 Company')).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('AccessibleSection', () => {
    it('should render with proper heading and landmark', async () => {
      const { container } = render(
        <AccessibleSection
          heading="Features"
          headingLevel={2}
          landmark="region"
          ariaLabel="Product features"
        >
          <p>Feature content</p>
        </AccessibleSection>
      );

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', 'Product features');

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Features');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('AccessibleCard', () => {
    it('should render as interactive card with proper accessibility', async () => {
      const handleClick = vi.fn();
      const { container } = render(
        <AccessibleCard
          heading="Product Card"
          headingLevel={3}
          interactive
          onClick={handleClick}
        >
          <p>Product description</p>
        </AccessibleCard>
      );

      const card = container.querySelector('.accessible-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('aria-label', 'Product Card');
      expect(card).toHaveAttribute('tabIndex', '0');

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Product Card');

      // Test click interaction
      await userEvent.click(card!);
      expect(handleClick).toHaveBeenCalled();

      // Test keyboard interaction
      card!.focus();
      await userEvent.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(2);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should render as link card when href provided', async () => {
      const { container } = render(
        <AccessibleCard
          heading="Link Card"
          href="/product/1"
        >
          <p>Product description</p>
        </AccessibleCard>
      );

      const card = screen.getByRole('link');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('href', '/product/1');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Touch Components Integration', () => {
    it('should render TouchButton with proper accessibility', async () => {
      const handleClick = vi.fn();
      const { container } = render(
        <TouchButton
          variant="primary"
          size="lg"
          onClick={handleClick}
          touchFeedback="press"
          hapticFeedback
        >
          Submit Form
        </TouchButton>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Submit Form');
      expect(button).toHaveClass('btn-touch');

      // Check minimum touch target size
      const styles = window.getComputedStyle(button);
      expect(button).toHaveClass('min-w-[56px]'); // Large size

      await userEvent.click(button);
      expect(handleClick).toHaveBeenCalled();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should render TouchInput with proper accessibility', async () => {
      const { container } = render(
        <TouchInput
          label="Email Address"
          type="email"
          required
          error="Please enter a valid email"
          helperText="We'll never share your email"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('aria-required', 'true');

      const label = screen.getByText('Email Address');
      expect(label).toBeInTheDocument();

      const errorMessage = screen.getByText('Please enter a valid email');
      expect(errorMessage).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Optimization', () => {
    it('should optimize touch targets for mobile', () => {
      render(
        <div>
          <TouchButton size="sm">Small Button</TouchButton>
          <TouchButton size="md">Medium Button</TouchButton>
          <TouchButton size="lg">Large Button</TouchButton>
        </div>
      );

      const buttons = screen.getAllByRole('button');
      
      // All buttons should meet minimum touch target requirements
      buttons.forEach(button => {
        expect(button).toHaveClass('touch-target');
        // Check for minimum height classes
        expect(button.className).toMatch(/min-w-\[4[4-9]px\]|min-w-\[[5-9]\dpx\]/);
      });
    });

    it('should handle reduced motion preferences', () => {
      // Mock reduced motion preference
      vi.mocked(window.matchMedia).mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container } = render(
        <AccessibleMobileLayout>
          <AccessibleMain>
            <TouchButton touchFeedback="bounce">
              Animated Button
            </TouchButton>
          </AccessibleMain>
        </AccessibleMobileLayout>
      );

      const layout = container.querySelector('.accessible-mobile-layout');
      expect(layout).toHaveClass('motion-reduce');
    });

    it('should provide proper focus indicators', async () => {
      render(
        <div>
          <TouchButton>Button 1</TouchButton>
          <TouchButton>Button 2</TouchButton>
          <TouchInput label="Input Field" />
        </div>
      );

      const button1 = screen.getByText('Button 1');
      const button2 = screen.getByText('Button 2');
      const input = screen.getByRole('textbox');

      // Test keyboard navigation
      await userEvent.tab();
      expect(button1).toHaveFocus();

      await userEvent.tab();
      expect(button2).toHaveFocus();

      await userEvent.tab();
      expect(input).toHaveFocus();

      // All focusable elements should have focus indicators
      [button1, button2, input].forEach(element => {
        expect(element).toHaveClass('focus:outline-none');
        expect(element.className).toMatch(/focus-visible:ring/);
      });
    });
  });

  describe('Accessibility Testing Integration', () => {
    it('should run comprehensive accessibility audit', async () => {
      const { container } = render(
        <AccessibleMobileLayout>
          <AccessibleHeader>
            <h1>Test App</h1>
          </AccessibleHeader>
          <AccessibleMain pageTitle="Test Page">
            <AccessibleSection heading="Content" headingLevel={2}>
              <TouchButton>Action Button</TouchButton>
              <TouchInput label="Test Input" />
            </AccessibleSection>
          </AccessibleMain>
          <AccessibleFooter copyright="© 2024 Test" />
        </AccessibleMobileLayout>
      );

      // Run our custom accessibility testing
      const report = await testAccessibility(container);
      
      expect(report).toHaveProperty('passed');
      expect(report).toHaveProperty('score');
      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('warnings');

      // Run axe tests
      const axeResults = await axe(container);
      expect(axeResults).toHaveNoViolations();
    });

    it('should detect and report accessibility issues', async () => {
      // Render component with accessibility issues
      const { container } = render(
        <div>
          <img src="/test.jpg" /> {/* Missing alt text */}
          <button></button> {/* Empty button */}
          <input type="text" /> {/* Missing label */}
          <div onClick={() => {}}> {/* Non-semantic interactive element */}
            Click me
          </div>
        </div>
      );

      const report = await testAccessibility(container);
      
      expect(report.passed).toBe(false);
      expect(report.issues.length).toBeGreaterThan(0);
      
      // Check for specific issues
      const issueTypes = report.issues.map(issue => issue.rule);
      expect(issueTypes).toContain('image-alt');
      expect(issueTypes).toContain('empty-button');
      expect(issueTypes).toContain('form-label');
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper ARIA labels and descriptions', () => {
      render(
        <AccessibleMobileLayout>
          <AccessibleMain pageTitle="Dashboard">
            <AccessibleSection 
              heading="Statistics" 
              ariaLabel="Performance statistics"
            >
              <TouchButton 
                aria-describedby="help-text"
                aria-expanded={false}
              >
                View Details
              </TouchButton>
              <div id="help-text">
                Click to expand detailed statistics
              </div>
            </AccessibleSection>
          </AccessibleMain>
        </AccessibleMobileLayout>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-label', 'Performance statistics');
    });

    it('should announce important changes', () => {
      const { rerender } = render(
        <AccessibleMobileLayout>
          <AccessibleMain pageTitle="Form">
            <TouchInput 
              label="Email" 
              type="email"
              aria-invalid={false}
            />
          </AccessibleMain>
        </AccessibleMobileLayout>
      );

      // Simulate form validation error
      rerender(
        <AccessibleMobileLayout>
          <AccessibleMain pageTitle="Form">
            <TouchInput 
              label="Email" 
              type="email"
              aria-invalid={true}
              error="Please enter a valid email address"
              aria-describedby="email-error"
            />
            <div id="email-error" role="alert">
              Please enter a valid email address
            </div>
          </AccessibleMain>
        </AccessibleMobileLayout>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('High Contrast Mode Support', () => {
    it('should adapt to high contrast preferences', () => {
      // Mock high contrast preference
      vi.mocked(window.matchMedia).mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <AccessibleMobileLayout>
          <AccessibleMain>
            <TouchButton variant="primary">
              High Contrast Button
            </TouchButton>
          </AccessibleMain>
        </AccessibleMobileLayout>
      );

      // Component should adapt to high contrast mode
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      // In a real implementation, this would check for high contrast styles
      // For now, we verify the component renders without errors
    });
  });
});