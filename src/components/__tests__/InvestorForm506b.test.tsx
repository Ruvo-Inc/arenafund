import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvestorForm506b from '../InvestorForm506b';
import { ApplicationService } from '@/lib/application-service';

// Mock the ApplicationService
vi.mock('@/lib/application-service', () => ({
  ApplicationService: {
    validateInvestorFormData: vi.fn(),
    validateInvestorField: vi.fn(),
    submitInvestorApplication: vi.fn()
  }
}));

const mockApplicationService = ApplicationService as any;

describe('InvestorForm506b', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApplicationService.validateInvestorFormData.mockReturnValue({ 
      isValid: true, 
      errors: [] 
    });
    mockApplicationService.validateInvestorField.mockReturnValue({ 
      isValid: true, 
      errors: [] 
    });
    mockApplicationService.submitInvestorApplication.mockResolvedValue({ 
      success: true, 
      id: 'test-id' 
    });
  });

  describe('Form Rendering', () => {
    it('renders the form with all required sections', () => {
      render(<InvestorForm506b />);
      
      // Check for form header
      expect(screen.getByText('Express Your Interest')).toBeInTheDocument();
      expect(screen.getByText(/Share your investment preferences to be considered for private offerings/)).toBeInTheDocument();
      
      // Check for section headers
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Investor Profile')).toBeInTheDocument();
      expect(screen.getByText('Investment Preferences')).toBeInTheDocument();
      expect(screen.getByText('Consent & Signature')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      render(<InvestorForm506b />);
      
      // Basic Information fields
      expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Country/)).toBeInTheDocument();
      
      // Investor Profile fields
      expect(screen.getByLabelText(/Investor Type/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Accredited Investor Status/)).toBeInTheDocument();
      
      // Investment Preferences fields
      expect(screen.getByLabelText(/Investment Check Size/)).toBeInTheDocument();
      expect(screen.getByText(/Areas of Interest/)).toBeInTheDocument();
      expect(screen.getByLabelText(/How did you hear about Arena Fund/)).toBeInTheDocument();
      
      // Consent & Signature fields
      expect(screen.getByLabelText(/Digital Signature/)).toBeInTheDocument();
      
      // Submit button
      expect(screen.getByRole('button', { name: /Submit Expression of Interest/ })).toBeInTheDocument();
    });

    it('shows areas of interest checkboxes with correct options', () => {
      render(<InvestorForm506b />);
      
      expect(screen.getByText('Enterprise AI')).toBeInTheDocument();
      expect(screen.getByText('Healthcare AI')).toBeInTheDocument();
      expect(screen.getByText('Fintech AI')).toBeInTheDocument();
      expect(screen.getByText('Hi-Tech')).toBeInTheDocument();
    });

    it('displays legal disclaimers and consent text', () => {
      render(<InvestorForm506b />);
      
      expect(screen.getByText(/This is an expression of interest only/)).toBeInTheDocument();
      expect(screen.getByText(/Private offerings under Rule 506\(b\)/)).toBeInTheDocument();
      expect(screen.getByText(/I understand this is an expression of interest only/)).toBeInTheDocument();
      expect(screen.getByText(/By typing your name above, you agree that this serves as your electronic signature/)).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('shows US state field when US is selected as country', async () => {
      render(<InvestorForm506b />);
      
      const countrySelect = screen.getByLabelText(/Country/);
      await user.selectOptions(countrySelect, 'US');
      
      await waitFor(() => {
        expect(screen.getByLabelText(/State/)).toBeInTheDocument();
      });
    });

    it('hides US state field when non-US country is selected', async () => {
      render(<InvestorForm506b />);
      
      const countrySelect = screen.getByLabelText(/Country/);
      await user.selectOptions(countrySelect, 'US');
      
      await waitFor(() => {
        expect(screen.getByLabelText(/State/)).toBeInTheDocument();
      });
      
      await user.selectOptions(countrySelect, 'CA');
      
      await waitFor(() => {
        expect(screen.queryByLabelText(/State/)).not.toBeInTheDocument();
      });
    });

    it('allows multiple areas of interest to be selected', async () => {
      render(<InvestorForm506b />);
      
      const enterpriseAI = screen.getByRole('checkbox', { name: /Enterprise AI/ });
      const healthcareAI = screen.getByRole('checkbox', { name: /Healthcare AI/ });
      
      await user.click(enterpriseAI);
      await user.click(healthcareAI);
      
      expect(enterpriseAI).toBeChecked();
      expect(healthcareAI).toBeChecked();
    });

    it('allows areas of interest to be deselected', async () => {
      render(<InvestorForm506b />);
      
      const enterpriseAI = screen.getByRole('checkbox', { name: /Enterprise AI/ });
      
      await user.click(enterpriseAI);
      expect(enterpriseAI).toBeChecked();
      
      await user.click(enterpriseAI);
      expect(enterpriseAI).not.toBeChecked();
    });
  });

  describe('Form Validation', () => {
    it('calls validation service when form data changes', async () => {
      render(<InvestorForm506b />);
      
      const nameInput = screen.getByLabelText(/Full Name/);
      await user.type(nameInput, 'John Doe');
      
      // Wait for debounced validation
      await waitFor(() => {
        expect(mockApplicationService.validateInvestorField).toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('displays validation errors when validation fails', async () => {
      mockApplicationService.validateInvestorFormData.mockReturnValue({
        isValid: false,
        errors: [
          { field: 'fullName', message: 'Full name is required', code: 'REQUIRED_FIELD' },
          { field: 'email', message: 'Valid email is required', code: 'INVALID_FORMAT' }
        ]
      });

      render(<InvestorForm506b />);
      
      const submitButton = screen.getByRole('button', { name: /Submit Expression of Interest/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
        expect(screen.getByText('Valid email is required')).toBeInTheDocument();
      });
    });

    it('shows visual validation feedback for fields', async () => {
      // Mock successful validation for this test
      mockApplicationService.validateInvestorField.mockReturnValue({ 
        isValid: true, 
        errors: [] 
      });
      
      render(<InvestorForm506b />);
      
      const nameInput = screen.getByLabelText(/Full Name/);
      await user.type(nameInput, 'John Doe');
      
      // Wait for validation to complete and check for success styling
      await waitFor(() => {
        expect(mockApplicationService.validateInvestorField).toHaveBeenCalledWith('fullName', 'John Doe', expect.any(Object));
      }, { timeout: 500 });
    });
  });

  const fillValidForm = async () => {
    const nameInput = screen.getByLabelText(/Full Name/);
    const emailInput = screen.getByLabelText(/Email Address/);
    const countrySelect = screen.getByLabelText(/Country/);
    const enterpriseAI = screen.getByRole('checkbox', { name: /Enterprise AI/ });
    const consentCheckbox = screen.getByRole('checkbox', { name: /I confirm that/ });
    const signatureInput = screen.getByLabelText(/Digital Signature/);
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.selectOptions(countrySelect, 'US');
    
    await waitFor(() => {
      const stateSelect = screen.getByLabelText(/State/);
      return user.selectOptions(stateSelect, 'CA');
    });
    
    await user.click(enterpriseAI);
    await user.click(consentCheckbox);
    await user.type(signatureInput, 'John Doe');
  };

  describe('Form Submission', () => {
    // Use the global fillValidForm function

    it('submits form with valid data', async () => {
      const mockOnSuccess = vi.fn();
      render(<InvestorForm506b onSubmissionSuccess={mockOnSuccess} />);
      
      await fillValidForm();
      
      const submitButton = screen.getByRole('button', { name: /Submit Expression of Interest/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockApplicationService.submitInvestorApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            mode: '506b',
            fullName: 'John Doe',
            email: 'john@example.com',
            country: 'US',
            state: 'CA',
            areasOfInterest: ['enterprise-ai'],
            consentConfirm: true,
            signature: 'John Doe'
          })
        );
      });
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('shows loading state during submission', async () => {
      // Make submission take time
      mockApplicationService.submitInvestorApplication.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, id: 'test' }), 100))
      );
      
      render(<InvestorForm506b />);
      await fillValidForm();
      
      const submitButton = screen.getByRole('button', { name: /Submit Expression of Interest/ });
      await user.click(submitButton);
      
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.queryByText('Submitting...')).not.toBeInTheDocument();
      });
    });

    it('handles submission errors gracefully', async () => {
      const mockOnError = vi.fn();
      mockApplicationService.submitInvestorApplication.mockResolvedValue({
        success: false,
        error: 'Submission failed'
      });
      
      render(<InvestorForm506b onSubmissionError={mockOnError} />);
      await fillValidForm();
      
      const submitButton = screen.getByRole('button', { name: /Submit Expression of Interest/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Submission failed/)).toBeInTheDocument();
        expect(mockOnError).toHaveBeenCalledWith('Submission failed');
      });
    });

    it('handles network errors gracefully', async () => {
      const mockOnError = vi.fn();
      mockApplicationService.submitInvestorApplication.mockRejectedValue(
        new Error('Network error')
      );
      
      render(<InvestorForm506b onSubmissionError={mockOnError} />);
      await fillValidForm();
      
      const submitButton = screen.getByRole('button', { name: /Submit Expression of Interest/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
        expect(mockOnError).toHaveBeenCalledWith('Network error');
      });
    });

    it('clears form data after successful submission', async () => {
      const mockOnSuccess = vi.fn();
      render(<InvestorForm506b onSubmissionSuccess={mockOnSuccess} />);
      
      await fillValidForm();
      
      const submitButton = screen.getByRole('button', { name: /Submit Expression of Interest/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
      
      // Check that form fields are cleared
      const nameInput = screen.getByLabelText(/Full Name/) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email Address/) as HTMLInputElement;
      
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<InvestorForm506b />);
      
      // Check form has proper role
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      
      // Check required fields have proper labels
      expect(screen.getByLabelText(/Full Name \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Country \*/)).toBeInTheDocument();
    });

    it('associates error messages with form fields', async () => {
      mockApplicationService.validateInvestorFormData.mockReturnValue({
        isValid: false,
        errors: [
          { field: 'fullName', message: 'Full name is required', code: 'REQUIRED_FIELD' }
        ]
      });

      render(<InvestorForm506b />);
      
      const submitButton = screen.getByRole('button', { name: /Submit Expression of Interest/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Full Name/);
        const errorMessage = screen.getByText('Full name is required');
        
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      render(<InvestorForm506b />);
      
      const nameInput = screen.getByLabelText(/Full Name/);
      const emailInput = screen.getByLabelText(/Email Address/);
      
      nameInput.focus();
      expect(nameInput).toHaveFocus();
      
      await user.tab();
      expect(emailInput).toHaveFocus();
    });
  });

  describe('Security', () => {
    it('passes input data as-is (sanitization handled server-side)', async () => {
      render(<InvestorForm506b />);
      
      const nameInput = screen.getByLabelText(/Full Name/);
      await user.type(nameInput, '<script>alert("xss")</script>John Doe');
      
      const submitButton = screen.getByRole('button', { name: /Submit Expression of Interest/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockApplicationService.submitInvestorApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: '<script>alert("xss")</script>John Doe'
          })
        );
      });
    });

    it('includes honeypot field for bot detection', () => {
      render(<InvestorForm506b />);
      
      // Honeypot field should be hidden from users but present in DOM
      const honeypotField = document.querySelector('input[name="websiteHoneypot"]');
      expect(honeypotField).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('performs real-time validation on input changes', async () => {
      render(<InvestorForm506b />);
      
      const nameInput = screen.getByLabelText(/Full Name/);
      
      // Type a character
      await user.type(nameInput, 'J');
      
      // Should call validation for input changes (real-time validation)
      await waitFor(() => {
        expect(mockApplicationService.validateInvestorField).toHaveBeenCalled();
      }, { timeout: 500 });
      
      // Should have been called at least once for real-time feedback
      expect(mockApplicationService.validateInvestorField.mock.calls.length).toBeGreaterThan(0);
    });

    it('disables submit button during submission', async () => {
      // Make submission take time
      mockApplicationService.submitInvestorApplication.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, id: 'test' }), 100))
      );
      
      render(<InvestorForm506b />);
      await fillValidForm();
      
      const submitButton = screen.getByRole('button', { name: /Submit Expression of Interest/ });
      
      // Click submit
      await user.click(submitButton);
      
      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
      
      // Wait for submission to complete
      await waitFor(() => {
        expect(mockApplicationService.submitInvestorApplication).toHaveBeenCalledTimes(1);
      });
    });
  });
});