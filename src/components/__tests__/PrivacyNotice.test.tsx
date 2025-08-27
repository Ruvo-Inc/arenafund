import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { PrivacyNotice } from '../PrivacyNotice';
import { it } from 'zod/v4/locales';
import { describe } from 'node:test';
import { it } from 'zod/v4/locales';
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
import { describe } from 'node:test';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { describe } from 'node:test';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { describe } from 'node:test';
import { describe } from 'node:test';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  }
}));

describe('PrivacyNotice', () => {
  describe('Modal variant', () => {
    it('renders privacy notice with basic information', () => {
      render(<PrivacyNotice variant="modal" />);
      
      expect(screen.getByText('Privacy & Data Protection')).toBeInTheDocument();
      expect(screen.getByText(/By subscribing, you consent to receive email notifications/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Privacy Policy/ })).toBeInTheDocument();
    });

    it('shows expandable content when learn more is clicked', async () => {
      render(<PrivacyNotice variant="modal" />);
      
      const learnMoreButton = screen.getByText('Learn more about data handling');
      fireEvent.click(learnMoreButton);
      
      await waitFor(() => {
        expect(screen.getByText('What we collect:')).toBeInTheDocument();
        expect(screen.getByText('How we use it:')).toBeInTheDocument();
        expect(screen.getByText('Your rights:')).toBeInTheDocument();
      });
    });

    it('toggles between expanded and collapsed states', async () => {
      render(<PrivacyNotice variant="modal" />);
      
      const learnMoreButton = screen.getByText('Learn more about data handling');
      
      // Expand
      fireEvent.click(learnMoreButton);
      await waitFor(() => {
        expect(screen.getByText('What we collect:')).toBeInTheDocument();
      });
      
      // Collapse
      const showLessButton = screen.getByText('Show less');
      fireEvent.click(showLessButton);
      await waitFor(() => {
        expect(screen.queryByText('What we collect:')).not.toBeInTheDocument();
      });
    });

    it('displays GDPR compliance information', async () => {
      render(<PrivacyNotice variant="modal" />);
      
      fireEvent.click(screen.getByText('Learn more about data handling'));
      
      await waitFor(() => {
        expect(screen.getByText(/GDPR & CCPA Compliant/)).toBeInTheDocument();
        expect(screen.getByText(/privacy@thearenafund.com/)).toBeInTheDocument();
      });
    });
  });

  describe('Inline variant', () => {
    it('renders expanded content by default', () => {
      render(<PrivacyNotice variant="inline" />);
      
      expect(screen.getByText('What we collect:')).toBeInTheDocument();
      expect(screen.getByText('How we use it:')).toBeInTheDocument();
      expect(screen.getByText('Your rights:')).toBeInTheDocument();
    });

    it('does not show learn more button', () => {
      render(<PrivacyNotice variant="inline" />);
      
      expect(screen.queryByText('Learn more about data handling')).not.toBeInTheDocument();
    });
  });

  describe('Compact variant', () => {
    it('renders minimal privacy notice', () => {
      render(<PrivacyNotice variant="compact" />);
      
      expect(screen.getByText(/By subscribing, you agree to our/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Privacy Policy/ })).toBeInTheDocument();
      expect(screen.getByText(/You can unsubscribe at any time/)).toBeInTheDocument();
    });

    it('does not show detailed information', () => {
      render(<PrivacyNotice variant="compact" />);
      
      expect(screen.queryByText('Privacy & Data Protection')).not.toBeInTheDocument();
      expect(screen.queryByText('What we collect:')).not.toBeInTheDocument();
    });
  });

  describe('Consent checkbox functionality', () => {
    it('renders consent checkbox when showConsentCheckbox is true', () => {
      render(<PrivacyNotice showConsentCheckbox={true} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('calls onConsentChange when checkbox is toggled', () => {
      const mockOnConsentChange = vi.fn();
      render(
        <PrivacyNotice 
          showConsentCheckbox={true} 
          onConsentChange={mockOnConsentChange}
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(mockOnConsentChange).toHaveBeenCalledWith(true);
      expect(checkbox).toBeChecked();
      
      fireEvent.click(checkbox);
      expect(mockOnConsentChange).toHaveBeenCalledWith(false);
      expect(checkbox).not.toBeChecked();
    });

    it('marks checkbox as required when consentRequired is true', () => {
      render(
        <PrivacyNotice 
          showConsentCheckbox={true} 
          consentRequired={true}
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeRequired();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('displays consent text with withdrawal information', () => {
      render(<PrivacyNotice showConsentCheckbox={true} />);
      
      expect(screen.getByText(/I consent to the collection and processing/)).toBeInTheDocument();
      expect(screen.getByText(/I can withdraw this consent at any time/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and structure', () => {
      render(<PrivacyNotice variant="modal" />);
      
      expect(screen.getByRole('link', { name: /Privacy Policy/ })).toHaveAttribute('target', '_blank');
    });

    it('maintains focus management for expandable content', async () => {
      render(<PrivacyNotice variant="modal" />);
      
      const learnMoreButton = screen.getByText('Learn more about data handling');
      fireEvent.click(learnMoreButton);
      
      await waitFor(() => {
        const showLessButton = screen.getByText('Show less');
        expect(showLessButton).toBeInTheDocument();
      });
    });
  });

  describe('External links', () => {
    it('opens privacy policy in new tab', () => {
      render(<PrivacyNotice variant="modal" />);
      
      const privacyLink = screen.getByRole('link', { name: /Privacy Policy/ });
      expect(privacyLink).toHaveAttribute('target', '_blank');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('includes external link icon', () => {
      render(<PrivacyNotice variant="modal" />);
      
      // The ExternalLink icon should be present
      const privacyLink = screen.getByRole('link', { name: /Privacy Policy/ });
      expect(privacyLink.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <PrivacyNotice className="custom-privacy-notice" />
      );
      
      expect(container.firstChild).toHaveClass('custom-privacy-notice');
    });
  });
});