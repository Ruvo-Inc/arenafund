import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModeContent from '../ModeContent';

// Mock the InvestorForm506b component
vi.mock('../InvestorForm506b', () => ({
  default: ({ onSubmissionSuccess, onSubmissionError }: any) => (
    <div data-testid="investor-form-506b">
      <button onClick={() => onSubmissionSuccess?.({ name: 'Test User', email: 'test@example.com' })}>
        Mock Submit Success
      </button>
      <button onClick={() => onSubmissionError?.('Mock error')}>Mock Submit Error</button>
    </div>
  )
}));

// Mock the InvestorForm506c component
vi.mock('../InvestorForm506c', () => ({
  default: ({ onSubmissionSuccess, onSubmissionError }: any) => (
    <div data-testid="investor-form-506c">
      <button onClick={() => onSubmissionSuccess?.({ name: 'Test User', email: 'test@example.com', entityName: 'Test Entity' })}>
        Mock Submit Success
      </button>
      <button onClick={() => onSubmissionError?.('Mock error')}>Mock Submit Error</button>
    </div>
  )
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
}));

describe('ModeContent', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('506(b) Mode - Default State', () => {
    it('renders 506(b) mode content with correct CTAs', () => {
      render(<ModeContent mode="506b" />);
      
      expect(screen.getByText('Share Interest')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
      expect(screen.getByText(/This is an expression of interest only/)).toBeInTheDocument();
      expect(screen.getByText(/Private offerings under Rule 506\(b\)/)).toBeInTheDocument();
    });

    it('shows 506(b) specific benefits', () => {
      render(<ModeContent mode="506b" />);
      
      expect(screen.getByText('Private Offering Benefits')).toBeInTheDocument();
      expect(screen.getByText(/Streamlined expression of interest process/)).toBeInTheDocument();
      expect(screen.getByText(/Access to exclusive private investment opportunities/)).toBeInTheDocument();
      expect(screen.getByText(/Direct relationship building with Arena Fund team/)).toBeInTheDocument();
    });

    it('shows form when Share Interest button is clicked', async () => {
      render(<ModeContent mode="506b" />);
      
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      expect(screen.getByTestId('investor-form-506b')).toBeInTheDocument();
      expect(screen.getByText('Back to Information')).toBeInTheDocument();
    });
  });

  describe('506(c) Mode - Default State', () => {
    it('renders 506(c) mode content with correct CTAs', () => {
      render(<ModeContent mode="506c" />);
      
      expect(screen.getByText('Start Investor Verification')).toBeInTheDocument();
      expect(screen.getByText('Verification Process')).toBeInTheDocument();
      expect(screen.getByText(/This opportunity is available only to.*accredited investors/)).toBeInTheDocument();
      expect(screen.getByText(/Public offerings under Rule 506\(c\)/)).toBeInTheDocument();
    });

    it('shows 506(c) specific benefits', () => {
      render(<ModeContent mode="506c" />);
      
      expect(screen.getByText('Verified Investor Advantages')).toBeInTheDocument();
      expect(screen.getByText(/Immediate access to investment documents upon verification/)).toBeInTheDocument();
      expect(screen.getByText(/Priority consideration for investment opportunities/)).toBeInTheDocument();
      expect(screen.getByText(/Access to comprehensive due diligence materials/)).toBeInTheDocument();
    });

    it('calls onStartApplication when verification button is clicked', async () => {
      const mockOnStartApplication = vi.fn();
      render(<ModeContent mode="506c" onStartApplication={mockOnStartApplication} />);
      
      const verificationButton = screen.getByText('Start Investor Verification');
      await user.click(verificationButton);
      
      expect(mockOnStartApplication).toHaveBeenCalled();
    });
  });

  describe('Form State Management', () => {
    it('shows back button when form is displayed', async () => {
      render(<ModeContent mode="506b" />);
      
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      const backButton = screen.getByText('Back to Information');
      expect(backButton).toBeInTheDocument();
    });

    it('returns to default state when back button is clicked', async () => {
      render(<ModeContent mode="506b" />);
      
      // Go to form
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      expect(screen.getByTestId('investor-form-506b')).toBeInTheDocument();
      
      // Go back
      const backButton = screen.getByText('Back to Information');
      await user.click(backButton);
      
      expect(screen.queryByTestId('investor-form-506b')).not.toBeInTheDocument();
      expect(screen.getByText('Share Interest')).toBeInTheDocument();
    });

    it('shows success state after form submission', async () => {
      render(<ModeContent mode="506b" />);
      
      // Go to form
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      // Submit form successfully
      const mockSubmitButton = screen.getByText('Mock Submit Success');
      await user.click(mockSubmitButton);
      
      expect(screen.getByText('Interest Submitted!')).toBeInTheDocument();
      expect(screen.getByText(/Thank you for expressing interest in Arena Fund/)).toBeInTheDocument();
      expect(screen.getByText(/reach out within 2–3 weeks/)).toBeInTheDocument();
    });

    it('shows success disclaimers in success state', async () => {
      render(<ModeContent mode="506b" />);
      
      // Navigate to success state
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      const mockSubmitButton = screen.getByText('Mock Submit Success');
      await user.click(mockSubmitButton);
      
      expect(screen.getByText(/This was an expression of interest only/)).toBeInTheDocument();
      expect(screen.getByText(/We will contact you only if there is a suitable investment opportunity/)).toBeInTheDocument();
    });

    it('provides navigation options in success state', async () => {
      render(<ModeContent mode="506b" />);
      
      // Navigate to success state
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      const mockSubmitButton = screen.getByText('Mock Submit Success');
      await user.click(mockSubmitButton);
      
      expect(screen.getByText('Back to Information')).toBeInTheDocument();
      expect(screen.getByText('Read FAQ')).toBeInTheDocument();
    });

    it('returns to default state from success state', async () => {
      render(<ModeContent mode="506b" />);
      
      // Navigate to success state
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      const mockSubmitButton = screen.getByText('Mock Submit Success');
      await user.click(mockSubmitButton);
      
      // Go back from success
      const backButton = screen.getByText('Back to Information');
      await user.click(backButton);
      
      expect(screen.queryByText('Interest Submitted!')).not.toBeInTheDocument();
      expect(screen.getByText('Share Interest')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles form submission errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<ModeContent mode="506b" />);
      
      // Go to form
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      // Trigger error
      const mockErrorButton = screen.getByText('Mock Submit Error');
      await user.click(mockErrorButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Form submission error:', 'Mock error');
      
      consoleSpy.mockRestore();
    });

    it('stays in form state when submission fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<ModeContent mode="506b" />);
      
      // Go to form
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      // Trigger error
      const mockErrorButton = screen.getByText('Mock Submit Error');
      await user.click(mockErrorButton);
      
      // Should still be in form state
      expect(screen.getByTestId('investor-form-506b')).toBeInTheDocument();
      expect(screen.queryByText('Interest Submitted!')).not.toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles and labels', () => {
      render(<ModeContent mode="506b" />);
      
      const shareInterestButton = screen.getByRole('button', { name: /Share Interest/ });
      expect(shareInterestButton).toBeInTheDocument();
      
      const learnMoreLink = screen.getByRole('link', { name: /Learn More/ });
      expect(learnMoreLink).toBeInTheDocument();
    });

    it('maintains focus management when navigating states', async () => {
      render(<ModeContent mode="506b" />);
      
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      const backButton = screen.getByText('Back to Information');
      expect(backButton).toBeInTheDocument();
      
      await user.click(backButton);
      
      // Should return to original state
      expect(screen.getByText('Share Interest')).toBeInTheDocument();
    });

    it('provides clear visual hierarchy in success state', async () => {
      render(<ModeContent mode="506b" />);
      
      // Navigate to success state
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      const mockSubmitButton = screen.getByText('Mock Submit Success');
      await user.click(mockSubmitButton);
      
      // Check for proper heading structure
      const heading = screen.getByText('Interest Submitted!');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });
  });

  describe('Props and Configuration', () => {
    it('applies custom className', () => {
      const { container } = render(<ModeContent mode="506b" className="custom-class" />);
      
      const contentDiv = container.firstChild as HTMLElement;
      expect(contentDiv).toHaveClass('custom-class');
    });

    it('handles missing onStartApplication prop gracefully', async () => {
      render(<ModeContent mode="506c" />);
      
      const verificationButton = screen.getByText('Start Investor Verification');
      
      // Should not throw error when clicked without onStartApplication
      expect(() => user.click(verificationButton)).not.toThrow();
    });

    it('switches content based on mode prop', () => {
      const { rerender } = render(<ModeContent mode="506b" />);
      
      expect(screen.getByText('Share Interest')).toBeInTheDocument();
      expect(screen.queryByText('Start Investor Verification')).not.toBeInTheDocument();
      
      rerender(<ModeContent mode="506c" />);
      
      expect(screen.queryByText('Share Interest')).not.toBeInTheDocument();
      expect(screen.getByText('Start Investor Verification')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('passes correct props to InvestorForm506b', async () => {
      render(<ModeContent mode="506b" />);
      
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      // Form should be rendered with proper test id
      expect(screen.getByTestId('investor-form-506b')).toBeInTheDocument();
    });

    it('handles form success callback correctly', async () => {
      render(<ModeContent mode="506b" />);
      
      // Go to form
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      // Submit successfully
      const mockSubmitButton = screen.getByText('Mock Submit Success');
      await user.click(mockSubmitButton);
      
      // Should transition to success state
      expect(screen.getByText('Interest Submitted!')).toBeInTheDocument();
      expect(screen.queryByTestId('investor-form-506b')).not.toBeInTheDocument();
    });

    it('links to correct FAQ page', () => {
      render(<ModeContent mode="506b" />);
      
      const learnMoreLink = screen.getByRole('link', { name: /Learn More/ });
      expect(learnMoreLink).toHaveAttribute('href', '/faq');
    });

    it('links to correct FAQ page in success state', async () => {
      render(<ModeContent mode="506b" />);
      
      // Navigate to success state
      const shareInterestButton = screen.getByText('Share Interest');
      await user.click(shareInterestButton);
      
      const mockSubmitButton = screen.getByText('Mock Submit Success');
      await user.click(mockSubmitButton);
      
      const faqLink = screen.getByRole('link', { name: /Read FAQ/ });
      expect(faqLink).toHaveAttribute('href', '/faq');
    });
  });
});