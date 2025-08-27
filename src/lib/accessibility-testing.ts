/**
 * Comprehensive accessibility testing utilities for automated WCAG 2.1 AA compliance testing
 */

import { 
  calculateContrastRatio, 
  meetsContrastRequirement, 
  validateTouchTarget,
  WCAG_CONSTANTS,
  type AccessibilityReport 
} from './accessibility-utils';

export interface AccessibilityTestResult {
  passed: boolean;
  score: number;
  issues: AccessibilityIssue[];
  warnings: AccessibilityWarning[];
  recommendations: string[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    warningCount: number;
  };
}

export interface AccessibilityIssue {
  type: 'error' | 'warning';
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  rule: string;
  description: string;
  element?: HTMLElement;
  selector?: string;
  wcagReference?: string;
  suggestion?: string;
}

export interface AccessibilityWarning {
  type: 'warning';
  rule: string;
  description: string;
  element?: HTMLElement;
  selector?: string;
  suggestion?: string;
}

/**
 * Comprehensive accessibility testing class
 */
export class AccessibilityTester {
  private element: HTMLElement;
  private issues: AccessibilityIssue[] = [];
  private warnings: AccessibilityWarning[] = [];

  constructor(element: HTMLElement = document.body) {
    this.element = element;
  }

  /**
   * Run all accessibility tests
   */
  async runAllTests(): Promise<AccessibilityTestResult> {
    this.issues = [];
    this.warnings = [];

    // Run all test categories
    this.testColorContrast();
    this.testKeyboardNavigation();
    this.testSemanticStructure();
    this.testFormAccessibility();
    this.testImageAccessibility();
    this.testTouchTargets();
    this.testFocusManagement();
    this.testAriaUsage();
    this.testHeadingHierarchy();
    this.testLandmarks();
    this.testTextAlternatives();
    this.testMotionAndAnimation();

    return this.generateReport();
  }

  /**
   * Test color contrast compliance
   */
  private testColorContrast(): void {
    const textElements = this.element.querySelectorAll('p, span, div, a, button, h1, h2, h3, h4, h5, h6, label, li');
    
    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (this.isVisibleText(element as HTMLElement) && color && backgroundColor) {
        const foreground = this.rgbToHex(color);
        const background = this.rgbToHex(backgroundColor);
        
        if (foreground && background && foreground !== background) {
          const isLargeText = this.isLargeText(element as HTMLElement);
          
          if (!meetsContrastRequirement(foreground, background, 'AA', isLargeText)) {
            this.addIssue({
              type: 'error',
              severity: 'serious',
              rule: 'color-contrast',
              description: `Insufficient color contrast ratio. Current: ${calculateContrastRatio(foreground, background).toFixed(2)}:1, Required: ${isLargeText ? WCAG_CONSTANTS.CONTRAST_RATIOS.AA_LARGE : WCAG_CONSTANTS.CONTRAST_RATIOS.AA_NORMAL}:1`,
              element: element as HTMLElement,
              wcagReference: 'WCAG 2.1 AA 1.4.3',
              suggestion: 'Increase color contrast by using darker text on light backgrounds or lighter text on dark backgrounds',
            });
          }
        }
      }
    });
  }

  /**
   * Test keyboard navigation
   */
  private testKeyboardNavigation(): void {
    const interactiveElements = this.element.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"], [role="menuitem"]'
    );

    interactiveElements.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex');
      
      // Check for positive tabindex (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        this.addIssue({
          type: 'error',
          severity: 'moderate',
          rule: 'tabindex-positive',
          description: 'Positive tabindex values create unpredictable tab order',
          element: element as HTMLElement,
          wcagReference: 'WCAG 2.1 AA 2.4.3',
          suggestion: 'Use tabindex="0" or remove tabindex to follow natural DOM order',
        });
      }

      // Check for missing focus indicators
      if (!this.hasFocusIndicator(element as HTMLElement)) {
        this.addWarning({
          type: 'warning',
          rule: 'focus-indicator',
          description: 'Interactive element may lack visible focus indicator',
          element: element as HTMLElement,
          suggestion: 'Ensure focus indicators are visible and meet contrast requirements',
        });
      }
    });
  }

  /**
   * Test semantic structure
   */
  private testSemanticStructure(): void {
    // Check for proper use of semantic elements
    const divButtons = this.element.querySelectorAll('div[onclick], span[onclick]');
    divButtons.forEach((element) => {
      if (!element.getAttribute('role')) {
        this.addIssue({
          type: 'error',
          severity: 'serious',
          rule: 'semantic-structure',
          description: 'Interactive div/span without proper role',
          element: element as HTMLElement,
          wcagReference: 'WCAG 2.1 AA 4.1.2',
          suggestion: 'Use button element or add role="button" and keyboard event handlers',
        });
      }
    });

    // Check for proper list structure
    const listItems = this.element.querySelectorAll('li');
    listItems.forEach((li) => {
      const parent = li.parentElement;
      if (parent && !['ul', 'ol', 'menu'].includes(parent.tagName.toLowerCase())) {
        this.addIssue({
          type: 'error',
          severity: 'moderate',
          rule: 'list-structure',
          description: 'List item not contained in proper list element',
          element: li as HTMLElement,
          wcagReference: 'WCAG 2.1 AA 1.3.1',
          suggestion: 'Wrap list items in ul, ol, or menu elements',
        });
      }
    });
  }

  /**
   * Test form accessibility
   */
  private testFormAccessibility(): void {
    const formControls = this.element.querySelectorAll('input, select, textarea');
    
    formControls.forEach((control) => {
      const id = control.getAttribute('id');
      const ariaLabel = control.getAttribute('aria-label');
      const ariaLabelledBy = control.getAttribute('aria-labelledby');
      const label = id ? this.element.querySelector(`label[for="${id}"]`) : null;

      // Check for accessible labels
      if (!ariaLabel && !ariaLabelledBy && !label) {
        this.addIssue({
          type: 'error',
          severity: 'critical',
          rule: 'form-label',
          description: 'Form control missing accessible label',
          element: control as HTMLElement,
          wcagReference: 'WCAG 2.1 AA 1.3.1, 4.1.2',
          suggestion: 'Add aria-label, aria-labelledby, or associate with label element',
        });
      }

      // Check for error message association
      if (control.getAttribute('aria-invalid') === 'true') {
        const describedBy = control.getAttribute('aria-describedby');
        if (!describedBy) {
          this.addIssue({
            type: 'error',
            severity: 'serious',
            rule: 'error-message',
            description: 'Invalid form control missing error message association',
            element: control as HTMLElement,
            wcagReference: 'WCAG 2.1 AA 3.3.1',
            suggestion: 'Add aria-describedby pointing to error message element',
          });
        }
      }

      // Check required field indication
      if (control.hasAttribute('required') && !control.getAttribute('aria-required')) {
        this.addWarning({
          type: 'warning',
          rule: 'required-field',
          description: 'Required field should have aria-required="true"',
          element: control as HTMLElement,
          suggestion: 'Add aria-required="true" to required form controls',
        });
      }
    });

    // Check fieldset/legend usage
    const fieldsets = this.element.querySelectorAll('fieldset');
    fieldsets.forEach((fieldset) => {
      if (!fieldset.querySelector('legend')) {
        this.addIssue({
          type: 'error',
          severity: 'moderate',
          rule: 'fieldset-legend',
          description: 'Fieldset missing legend element',
          element: fieldset as HTMLElement,
          wcagReference: 'WCAG 2.1 AA 1.3.1',
          suggestion: 'Add legend element as first child of fieldset',
        });
      }
    });
  }

  /**
   * Test image accessibility
   */
  private testImageAccessibility(): void {
    const images = this.element.querySelectorAll('img');
    
    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      const role = img.getAttribute('role');
      
      if (alt === null && role !== 'presentation' && role !== 'none') {
        this.addIssue({
          type: 'error',
          severity: 'critical',
          rule: 'image-alt',
          description: 'Image missing alt attribute',
          element: img,
          wcagReference: 'WCAG 2.1 AA 1.1.1',
          suggestion: 'Add descriptive alt text or alt="" for decorative images',
        });
      }

      // Check for redundant text in alt
      if (alt && (alt.toLowerCase().includes('image of') || alt.toLowerCase().includes('picture of'))) {
        this.addWarning({
          type: 'warning',
          rule: 'alt-redundant',
          description: 'Alt text contains redundant phrases',
          element: img,
          suggestion: 'Remove "image of" or "picture of" from alt text',
        });
      }
    });

    // Check for complex images
    const complexImages = this.element.querySelectorAll('img[src*="chart"], img[src*="graph"], img[src*="diagram"]');
    complexImages.forEach((img) => {
      const longDesc = img.getAttribute('longdesc') || img.getAttribute('aria-describedby');
      if (!longDesc) {
        this.addWarning({
          type: 'warning',
          rule: 'complex-image',
          description: 'Complex image may need detailed description',
          element: img as HTMLElement,
          suggestion: 'Consider adding aria-describedby or longdesc for complex images',
        });
      }
    });
  }

  /**
   * Test touch target sizes
   */
  private testTouchTargets(): void {
    const touchTargets = this.element.querySelectorAll('button, input[type="button"], input[type="submit"], a, [role="button"]');
    
    touchTargets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      
      if (!validateTouchTarget(rect.width, rect.height)) {
        this.addIssue({
          type: 'error',
          severity: 'moderate',
          rule: 'touch-target-size',
          description: `Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px. Minimum: ${WCAG_CONSTANTS.TOUCH_TARGETS.MINIMUM}x${WCAG_CONSTANTS.TOUCH_TARGETS.MINIMUM}px`,
          element: target as HTMLElement,
          wcagReference: 'WCAG 2.1 AA 2.5.5',
          suggestion: `Increase touch target size to at least ${WCAG_CONSTANTS.TOUCH_TARGETS.MINIMUM}px`,
        });
      }
    });
  }

  /**
   * Test focus management
   */
  private testFocusManagement(): void {
    // Check for skip links
    const skipLinks = this.element.querySelectorAll('a[href^="#"]');
    if (skipLinks.length === 0) {
      this.addWarning({
        type: 'warning',
        rule: 'skip-links',
        description: 'No skip links found',
        suggestion: 'Add skip links to help keyboard users navigate efficiently',
      });
    }

    // Check for focus traps in modals
    const modals = this.element.querySelectorAll('[role="dialog"], [role="alertdialog"]');
    modals.forEach((modal) => {
      const focusableElements = modal.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) {
        this.addWarning({
          type: 'warning',
          rule: 'modal-focus',
          description: 'Modal dialog contains no focusable elements',
          element: modal as HTMLElement,
          suggestion: 'Ensure modals contain at least one focusable element',
        });
      }
    });
  }

  /**
   * Test ARIA usage
   */
  private testAriaUsage(): void {
    // Check for invalid ARIA attributes
    const elementsWithAria = this.element.querySelectorAll('[aria-expanded], [aria-selected], [aria-checked]');
    
    elementsWithAria.forEach((element) => {
      const expanded = element.getAttribute('aria-expanded');
      const selected = element.getAttribute('aria-selected');
      const checked = element.getAttribute('aria-checked');

      // Validate boolean ARIA attributes
      if (expanded && !['true', 'false'].includes(expanded)) {
        this.addIssue({
          type: 'error',
          severity: 'moderate',
          rule: 'aria-boolean',
          description: 'aria-expanded must be "true" or "false"',
          element: element as HTMLElement,
          wcagReference: 'WCAG 2.1 AA 4.1.2',
          suggestion: 'Set aria-expanded to "true" or "false"',
        });
      }

      if (selected && !['true', 'false'].includes(selected)) {
        this.addIssue({
          type: 'error',
          severity: 'moderate',
          rule: 'aria-boolean',
          description: 'aria-selected must be "true" or "false"',
          element: element as HTMLElement,
          wcagReference: 'WCAG 2.1 AA 4.1.2',
          suggestion: 'Set aria-selected to "true" or "false"',
        });
      }

      if (checked && !['true', 'false', 'mixed'].includes(checked)) {
        this.addIssue({
          type: 'error',
          severity: 'moderate',
          rule: 'aria-boolean',
          description: 'aria-checked must be "true", "false", or "mixed"',
          element: element as HTMLElement,
          wcagReference: 'WCAG 2.1 AA 4.1.2',
          suggestion: 'Set aria-checked to "true", "false", or "mixed"',
        });
      }
    });

    // Check for ARIA references
    const elementsWithRefs = this.element.querySelectorAll('[aria-describedby], [aria-labelledby], [aria-controls]');
    elementsWithRefs.forEach((element) => {
      const describedBy = element.getAttribute('aria-describedby');
      const labelledBy = element.getAttribute('aria-labelledby');
      const controls = element.getAttribute('aria-controls');

      [describedBy, labelledBy, controls].forEach((ref) => {
        if (ref) {
          const ids = ref.split(' ');
          ids.forEach((id) => {
            if (!this.element.querySelector(`#${id}`)) {
              this.addIssue({
                type: 'error',
                severity: 'serious',
                rule: 'aria-reference',
                description: `ARIA reference points to non-existent element: ${id}`,
                element: element as HTMLElement,
                wcagReference: 'WCAG 2.1 AA 4.1.2',
                suggestion: 'Ensure referenced elements exist in the DOM',
              });
            }
          });
        }
      });
    });
  }

  /**
   * Test heading hierarchy
   */
  private testHeadingHierarchy(): void {
    const headings = Array.from(this.element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let previousLevel = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (level > previousLevel + 1) {
        this.addIssue({
          type: 'error',
          severity: 'moderate',
          rule: 'heading-hierarchy',
          description: `Heading level skipped: ${heading.tagName} follows h${previousLevel}`,
          element: heading as HTMLElement,
          wcagReference: 'WCAG 2.1 AA 1.3.1',
          suggestion: 'Use heading levels in sequential order',
        });
      }
      
      previousLevel = level;
    });

    // Check for missing h1
    const h1Elements = this.element.querySelectorAll('h1');
    if (h1Elements.length === 0) {
      this.addWarning({
        type: 'warning',
        rule: 'missing-h1',
        description: 'Page missing h1 element',
        suggestion: 'Add h1 element to identify main page content',
      });
    } else if (h1Elements.length > 1) {
      this.addWarning({
        type: 'warning',
        rule: 'multiple-h1',
        description: 'Multiple h1 elements found',
        suggestion: 'Consider using only one h1 per page',
      });
    }
  }

  /**
   * Test landmark usage
   */
  private testLandmarks(): void {
    const landmarks = {
      main: this.element.querySelectorAll('main, [role="main"]'),
      navigation: this.element.querySelectorAll('nav, [role="navigation"]'),
      banner: this.element.querySelectorAll('header, [role="banner"]'),
      contentinfo: this.element.querySelectorAll('footer, [role="contentinfo"]'),
    };

    // Check for missing main landmark
    if (landmarks.main.length === 0) {
      this.addWarning({
        type: 'warning',
        rule: 'missing-main',
        description: 'Page missing main landmark',
        suggestion: 'Add main element or role="main" to identify primary content',
      });
    }

    // Check for multiple main landmarks
    if (landmarks.main.length > 1) {
      this.addIssue({
        type: 'error',
        severity: 'moderate',
        rule: 'multiple-main',
        description: 'Multiple main landmarks found',
        wcagReference: 'WCAG 2.1 AA 1.3.1',
        suggestion: 'Use only one main landmark per page',
      });
    }
  }

  /**
   * Test text alternatives
   */
  private testTextAlternatives(): void {
    // Check for empty links
    const links = this.element.querySelectorAll('a[href]');
    links.forEach((link) => {
      const text = link.textContent?.trim();
      const ariaLabel = link.getAttribute('aria-label');
      const title = link.getAttribute('title');
      
      if (!text && !ariaLabel && !title) {
        this.addIssue({
          type: 'error',
          severity: 'critical',
          rule: 'empty-link',
          description: 'Link has no accessible text',
          element: link as HTMLElement,
          wcagReference: 'WCAG 2.1 AA 2.4.4',
          suggestion: 'Add descriptive text, aria-label, or title attribute',
        });
      }
    });

    // Check for empty buttons
    const buttons = this.element.querySelectorAll('button');
    buttons.forEach((button) => {
      const text = button.textContent?.trim();
      const ariaLabel = button.getAttribute('aria-label');
      
      if (!text && !ariaLabel) {
        this.addIssue({
          type: 'error',
          severity: 'critical',
          rule: 'empty-button',
          description: 'Button has no accessible text',
          element: button,
          wcagReference: 'WCAG 2.1 AA 4.1.2',
          suggestion: 'Add descriptive text or aria-label attribute',
        });
      }
    });
  }

  /**
   * Test motion and animation
   */
  private testMotionAndAnimation(): void {
    // Check for respect of prefers-reduced-motion
    const animatedElements = this.element.querySelectorAll('[style*="animation"], [style*="transition"]');
    
    if (animatedElements.length > 0) {
      this.addWarning({
        type: 'warning',
        rule: 'reduced-motion',
        description: 'Animated elements found - ensure prefers-reduced-motion is respected',
        suggestion: 'Use CSS media query (prefers-reduced-motion: reduce) to disable animations',
      });
    }
  }

  /**
   * Helper methods
   */
  private isVisibleText(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element);
    return styles.display !== 'none' && 
           styles.visibility !== 'hidden' && 
           styles.opacity !== '0' &&
           element.textContent?.trim() !== '';
  }

  private isLargeText(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element);
    const fontSize = parseFloat(styles.fontSize);
    const fontWeight = styles.fontWeight;
    
    return fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
  }

  private hasFocusIndicator(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element, ':focus');
    return styles.outline !== 'none' || 
           styles.boxShadow !== 'none' || 
           styles.border !== styles.border; // Simplified check
  }

  private rgbToHex(rgb: string): string | null {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return null;
    
    const [, r, g, b] = match;
    return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
  }

  private addIssue(issue: Omit<AccessibilityIssue, 'selector'>): void {
    this.issues.push({
      ...issue,
      selector: issue.element ? this.getElementSelector(issue.element) : undefined,
    });
  }

  private addWarning(warning: Omit<AccessibilityWarning, 'selector'>): void {
    this.warnings.push({
      ...warning,
      selector: warning.element ? this.getElementSelector(warning.element) : undefined,
    });
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `${element.tagName.toLowerCase()}.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private generateReport(): AccessibilityTestResult {
    const totalTests = this.issues.length + this.warnings.length;
    const failedTests = this.issues.length;
    const passedTests = Math.max(0, totalTests - failedTests);
    const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100;

    const recommendations = [
      ...new Set([
        ...this.issues.map(issue => issue.suggestion).filter(Boolean),
        ...this.warnings.map(warning => warning.suggestion).filter(Boolean),
      ])
    ] as string[];

    return {
      passed: this.issues.length === 0,
      score,
      issues: this.issues,
      warnings: this.warnings,
      recommendations,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        warningCount: this.warnings.length,
      },
    };
  }
}

/**
 * Quick accessibility test function
 */
export const testAccessibility = async (element?: HTMLElement): Promise<AccessibilityTestResult> => {
  const tester = new AccessibilityTester(element);
  return await tester.runAllTests();
};

/**
 * Accessibility testing utilities
 */
export const AccessibilityTestUtils = {
  /**
   * Test specific WCAG criteria
   */
  testColorContrast: (element: HTMLElement) => {
    const tester = new AccessibilityTester(element);
    tester['testColorContrast']();
    return tester['generateReport']();
  },

  testKeyboardNavigation: (element: HTMLElement) => {
    const tester = new AccessibilityTester(element);
    tester['testKeyboardNavigation']();
    return tester['generateReport']();
  },

  testFormAccessibility: (element: HTMLElement) => {
    const tester = new AccessibilityTester(element);
    tester['testFormAccessibility']();
    return tester['generateReport']();
  },

  /**
   * Generate accessibility report for CI/CD
   */
  generateCIReport: async (element?: HTMLElement): Promise<string> => {
    const result = await testAccessibility(element);
    
    let report = `# Accessibility Test Report\n\n`;
    report += `**Score:** ${result.score}/100\n`;
    report += `**Status:** ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    if (result.issues.length > 0) {
      report += `## Issues (${result.issues.length})\n\n`;
      result.issues.forEach((issue, index) => {
        report += `### ${index + 1}. ${issue.rule}\n`;
        report += `- **Severity:** ${issue.severity}\n`;
        report += `- **Description:** ${issue.description}\n`;
        if (issue.wcagReference) report += `- **WCAG:** ${issue.wcagReference}\n`;
        if (issue.suggestion) report += `- **Suggestion:** ${issue.suggestion}\n`;
        report += '\n';
      });
    }
    
    if (result.warnings.length > 0) {
      report += `## Warnings (${result.warnings.length})\n\n`;
      result.warnings.forEach((warning, index) => {
        report += `### ${index + 1}. ${warning.rule}\n`;
        report += `- **Description:** ${warning.description}\n`;
        if (warning.suggestion) report += `- **Suggestion:** ${warning.suggestion}\n`;
        report += '\n';
      });
    }
    
    return report;
  },
};

export default AccessibilityTester;