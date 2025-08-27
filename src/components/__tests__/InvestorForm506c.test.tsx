import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvestorForm506c from '../InvestorForm506c';
import { ApplicationService } from '@/lib/application-service';

// Mock the ApplicationService
vi.mock('@/lib/application-service', () => ({
  ApplicationService: {
    validateInvestorFormData: vi.fn(),
    validateInvestorField: vi.fn(),
    submitInvestorApplication: vi.fn(),
    uploadFile: vi.fn(),
    validateVerificationFile: vi.fn()
  }
}));

// Mock the VerificationFileUpload component
vi.mock('@/components/ui/VerificationFileUpload', () => ({
  default: ({ onFileUpload, onFileRemove, existingFileName }: any) => (
    <div data-testid="verification-file-upload">
      <button onClick={() => onFileUpload?.({ fileRef: 'test-file-ref', fileName: 'test.pdf' })}>
        Upload File
      </button>
      {existingFileName && (
        <button onClick={() => onFileRemove?.()}>Remove File</button>
      )}
    </div>
  )
}));

const mockApplicationService = ApplicationService as any;

describe('InvestorForm506c', () => {
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
    mockApplicationService.uploadFile.mockResolvedValue({
      success: true,
      fileRef: 'test-file-ref',
      fileName: 'test.pdf'
    });
    mockApplicationService.validateVerificationFile.mockReturnValue({
      isValid: true,
      errors: []
    });
  });

  describe('Multi-step Form Structure', () => {
    it('renders the multi-step form with correct initial state', () => {
      render(<InvestorForm506c />);
      
      // Check form header
      expect(screen.getByText('Start Investor Verification')).toBeInTheDocument();
      expect(screen.getByText(/Complete the verification process to access investment documents/)).toBeInTheDocument();
      
      // Check step indicator
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
      expect(screen.getByText('Accreditation Verification')).toBeInTheDocument();
      
      // Check navigation buttons
      expect(screen.getByRole('button', { name: /Next/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Previous/ })).not.toBeInTheDocument();
    });

    it('shows all four steps in the progress indicator', () => {
      render(<InvestorForm506c />);
      
      // Check that all steps are indicated
      const stepIndicators = screen.getAllByText(/Step \d of 4/);
      expect(stepIndicators).toHaveLength(1); // Current step indicator
      
      // Check step titles are accessible
      expect(screen.getByText('Accreditation Verification')).toBeInTheDocument();
    });

    it('allows navigation between steps', async () => {
      render(<InvestorForm506c />);
      
      // Fill out step 1 (Accreditation Verification)
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      await user.selectOptions(verificationMethodSelect, 'third-party');
      
      const nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
        expect(screen.getByText('Investor Profile')).toBeInTheDocument();
      });
      
      // Check Previous button is now available
      expect(screen.getByRole('button', { name: /Previous/ })).toBeInTheDocument();
    });

    it('prevents navigation to next step with invalid data', async () => {
      mockApplicationService.validateInvestorFormData.mockReturnValue({
        isValid: false,
        errors: [{ field: 'verificationMethod', message: 'Verification method is required', code: 'REQUIRED_FIELD' }]
      });

      render(<InvestorForm506c />);
      
      const nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      // Should stay on step 1
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
      expect(screen.getByText('Verification method is required')).toBeInTheDocument();
    });
  });

  describe('Step 1: Accreditation Verification', () => {
    it('renders verification method options', () => {
      render(<InvestorForm506c />);
      
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      expect(verificationMethodSelect).toBeInTheDocument();
      
      // Check options
      expect(screen.getByRole('option', { name: /Select verification method/ })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Verification Letter/ })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Third-party Service/ })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Bank\/Brokerage Statement/ })).toBeInTheDocument();
    });

    it('shows file upload when letter method is selected', async () => {
      render(<InvestorForm506c />);
      
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      await user.selectOptions(verificationMethodSelect, 'letter');
      
      await waitFor(() => {
        expect(screen.getByTestId('verification-file-upload')).toBeInTheDocument();
      });
    });

    it('hides file upload when non-letter method is selected', async () => {
      render(<InvestorForm506c />);
      
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      await user.selectOptions(verificationMethodSelect, 'letter');
      
      await waitFor(() => {
        expect(screen.getByTestId('verification-file-upload')).toBeInTheDocument();
      });
      
      await user.selectOptions(verificationMethodSelect, 'third-party');
      
      await waitFor(() => {
        expect(screen.queryByTestId('verification-file-upload')).not.toBeInTheDocument();
      });
    });

    it('handles file upload correctly', async () => {
      render(<InvestorForm506c />);
      
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      await user.selectOptions(verificationMethodSelect, 'letter');
      
      await waitFor(() => {
        const uploadButton = screen.getByText('Upload File');
        return user.click(uploadButton);
      });
      
      // File should be uploaded and form updated
      await waitFor(() => {
        expect(mockApplicationService.uploadFile).toHaveBeenCalled();
      });
    });
  });

  describe('Step 2: Investor Profile', () => {
    const navigateToStep2 = async () => {
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      await user.selectOptions(verificationMethodSelect, 'third-party');
      
      const nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      });
    };

    it('renders investor profile fields', async () => {
      render(<InvestorForm506c />);
      await navigateToStep2();
      
      expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Country/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Investor Type/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Accredited Investor Status/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Entity Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Jurisdiction/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Custodian Information/)).toBeInTheDocument();
    });

    it('shows US state field when US is selected', async () => {
      render(<InvestorForm506c />);
      await navigateToStep2();
      
      const countrySelect = screen.getByLabelText(/Country/);
      await user.selectOptions(countrySelect, 'US');
      
      await waitFor(() => {
        expect(screen.getByLabelText(/State/)).toBeInTheDocument();
      });
    });

    it('validates required fields before proceeding', async () => {
      mockApplicationService.validateInvestorFormData.mockReturnValue({
        isValid: false,
        errors: [
          { field: 'fullName', message: 'Full name is required', code: 'REQUIRED_FIELD' },
          { field: 'entityName', message: 'Entity name is required', code: 'REQUIRED_FIELD' }
        ]
      });

      render(<InvestorForm506c />);
      await navigateToStep2();
      
      const nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
        expect(screen.getByText('Entity name is required')).toBeInTheDocument();
      });
      
      // Should stay on step 2
      expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    });
  });

  describe('Step 3: Investment Preferences', () => {
    const navigateToStep3 = async () => {
      // Navigate through steps 1 and 2
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      await user.selectOptions(verificationMethodSelect, 'third-party');
      
      let nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      });
      
      // Fill required fields in step 2
      await user.type(screen.getByLabelText(/Full Name/), 'Test User');
      await user.type(screen.getByLabelText(/Email Address/), 'test@example.com');
      await user.selectOptions(screen.getByLabelText(/Country/), 'US');
      await user.type(screen.getByLabelText(/Entity Name/), 'Test Entity');
      await user.type(screen.getByLabelText(/Jurisdiction/), 'Delaware');
      
      nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
      });
    };

    it('renders investment preference fields', async () => {
      render(<InvestorForm506c />);
      await navigateToStep3();
      
      expect(screen.getByLabelText(/Investment Check Size/)).toBeInTheDocument();
      expect(screen.getByText(/Areas of Interest/)).toBeInTheDocument();
      expect(screen.getByLabelText(/How did you hear about Arena Fund/)).toBeInTheDocument();
      
      // Check areas of interest options
      expect(screen.getByText('Enterprise AI')).toBeInTheDocument();
      expect(screen.getByText('Healthcare AI')).toBeInTheDocument();
      expect(screen.getByText('Fintech AI')).toBeInTheDocument();
      expect(screen.getByText('Hi-Tech')).toBeInTheDocument();
    });

    it('allows multiple areas of interest selection', async () => {
      render(<InvestorForm506c />);
      await navigateToStep3();
      
      const enterpriseAI = screen.getByRole('checkbox', { name: /Enterprise AI/ });
      const healthcareAI = screen.getByRole('checkbox', { name: /Healthcare AI/ });
      
      await user.click(enterpriseAI);
      await user.click(healthcareAI);
      
      expect(enterpriseAI).toBeChecked();
      expect(healthcareAI).toBeChecked();
    });
  });

  describe('Step 4: Document Access Confirmation', () => {
    const navigateToStep4 = async () => {
      // Navigate through all previous steps
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      await user.selectOptions(verificationMethodSelect, 'third-party');
      
      let nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      });
      
      // Fill step 2
      await user.type(screen.getByLabelText(/Full Name/), 'Test User');
      await user.type(screen.getByLabelText(/Email Address/), 'test@example.com');
      await user.selectOptions(screen.getByLabelText(/Country/), 'US');
      await user.type(screen.getByLabelText(/Entity Name/), 'Test Entity');
      await user.type(screen.getByLabelText(/Jurisdiction/), 'Delaware');
      
      nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
      });
      
      // Fill step 3
      const enterpriseAI = screen.getByRole('checkbox', { name: /Enterprise AI/ });
      await user.click(enterpriseAI);
      
      nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
      });
    };

    it('renders document access confirmation', async () => {
      render(<InvestorForm506c />);
      await navigateToStep4();
      
      expect(screen.getByText('Document Access Confirmation')).toBeInTheDocument();
      expect(screen.getByText(/By proceeding, you confirm/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Digital Signature/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit Verification Request/ })).toBeInTheDocument();
    });

    it('shows legal disclaimers and agreements', async () => {
      render(<InvestorForm506c />);
      await navigateToStep4();
      
      expect(screen.getByText(/This opportunity is available only to accredited investors/)).toBeInTheDocument();
      expect(screen.getByText(/Verification is required before investing/)).toBeInTheDocument();
      expect(screen.getByText(/I understand and agree to the terms/)).toBeInTheDocument();
    });

    it('requires consent and signature before submission', async () => {
      mockApplicationService.validateInvestorFormData.mockReturnValue({
        isValid: false,
        errors: [
          { field: 'consentConfirm', message: 'Consent is required', code: 'REQUIRED_FIELD' },
          { field: 'signature', message: 'Digital signature is required', code: 'REQUIRED_FIELD' }
        ]
      });

      render(<InvestorForm506c />);
      await navigateToStep4();
      
      const submitButton = screen.getByRole('button', { name: /Submit Verification Request/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Consent is required')).toBeInTheDocument();
        expect(screen.getByText('Digital signature is required')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const fillCompleteForm = async () => {
      // Step 1: Verification method
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      await user.selectOptions(verificationMethodSelect, 'third-party');
      
      let nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      // Step 2: Profile
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      });
      
      await user.type(screen.getByLabelText(/Full Name/), 'Jane Doe');
      await user.type(screen.getByLabelText(/Email Address/), 'jane@example.com');
      await user.selectOptions(screen.getByLabelText(/Country/), 'US');
      await user.selectOptions(screen.getByLabelText(/Investor Type/), 'family-office');
      await user.selectOptions(screen.getByLabelText(/Accredited Investor Status/), 'yes');
      await user.type(screen.getByLabelText(/Entity Name/), 'Doe Family Office');
      await user.type(screen.getByLabelText(/Jurisdiction/), 'Delaware');
      
      nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      // Step 3: Investment preferences
      await waitFor(() => {
        expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
      });
      
      await user.selectOptions(screen.getByLabelText(/Investment Check Size/), '250k-plus');
      const enterpriseAI = screen.getByRole('checkbox', { name: /Enterprise AI/ });
      await user.click(enterpriseAI);
      
      nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      // Step 4: Confirmation
      await waitFor(() => {
        expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
      });
      
      const consentCheckbox = screen.getByRole('checkbox', { name: /I understand and agree/ });
      await user.click(consentCheckbox);
      await user.type(screen.getByLabelText(/Digital Signature/), 'Jane Doe');
    };

    it('submits complete form successfully', async () => {
      const mockOnSuccess = vi.fn();
      render(<InvestorForm506c onSubmissionSuccess={mockOnSuccess} />);
      
      await fillCompleteForm();
      
      const submitButton = screen.getByRole('button', { name: /Submit Verification Request/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockApplicationService.submitInvestorApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            mode: '506c',
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            country: 'US',
            investorType: 'family-office',
            accreditationStatus: 'yes',
            checkSize: '250k-plus',
            areasOfInterest: ['enterprise-ai'],
            verificationMethod: 'third-party',
            entityName: 'Doe Family Office',
            jurisdiction: 'Delaware',
            consentConfirm: true,
            signature: 'Jane Doe'
          })
        );
      });
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('shows loading state during submission', async () => {
      mockApplicationService.submitInvestorApplication.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, id: 'test' }), 100))
      );
      
      render(<InvestorForm506c />);
      await fillCompleteForm();
      
      const submitButton = screen.getByRole('button', { name: /Submit Verification Request/ });
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
        error: 'Verification failed'
      });
      
      render(<InvestorForm506c onSubmissionError={mockOnError} />);
      await fillCompleteForm();
      
      const submitButton = screen.getByRole('button', { name: /Submit Verification Request/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Verification failed/)).toBeInTheDocument();
        expect(mockOnError).toHaveBeenCalledWith('Verification failed');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and step indicators', () => {
      render(<InvestorForm506c />);
      
      // Check form has proper role
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      
      // Check step indicator has proper ARIA
      const stepIndicator = screen.getByText('Step 1 of 4');
      expect(stepIndicator).toBeInTheDocument();
      
      // Check required fields have proper labels
      expect(screen.getByLabelText(/Verification Method \*/)).toBeInTheDocument();
    });

    it('supports keyboard navigation between steps', async () => {
      render(<InvestorForm506c />);
      
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      const nextButton = screen.getByRole('button', { name: /Next/ });
      
      verificationMethodSelect.focus();
      expect(verificationMethodSelect).toHaveFocus();
      
      await user.tab();
      expect(nextButton).toHaveFocus();
    });

    it('announces step changes to screen readers', async () => {
      render(<InvestorForm506c />);
      
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      await user.selectOptions(verificationMethodSelect, 'third-party');
      
      const nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);
      
      await waitFor(() => {
        const stepIndicator = screen.getByText('Step 2 of 4');
        expect(stepIndicator).toBeInTheDocument();
        expect(stepIndicator).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Security', () => {
    it('includes honeypot field for bot detection', () => {
      render(<InvestorForm506c />);
      
      const honeypotField = document.querySelector('input[name="websiteHoneypot"]');
      expect(honeypotField).toBeInTheDocument();
      expect(honeypotField).toHaveStyle({ display: 'none' });
    });

    it('validates file uploads securely', async () => {
      render(<InvestorForm506c />);
      
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      await user.selectOptions(verificationMethodSelect, 'letter');
      
      await waitFor(() => {
        const uploadButton = screen.getByText('Upload File');
        return user.click(uploadButton);
      });
      
      expect(mockApplicationService.validateVerificationFile).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('validates fields in real-time', async () => {
      render(<InvestorForm506c />);
      
      const verificationMethodSelect = screen.getByLabelText(/Verification Method/);
      await user.selectOptions(verificationMethodSelect, 'third-party');
      
      await waitFor(() => {
        expect(mockApplicationService.validateInvestorField).toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('prevents multiple submissions', async () => {
      render(<InvestorForm506c />);
      await fillCompleteForm();
      
      const submitButton = screen.getByRole('button', { name: /Submit Verification Request/ });
      
      // Click multiple times rapidly
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);
      
      // Should only submit once
      await waitFor(() => {
        expect(mockApplicationService.submitInvestorApplication).toHaveBeenCalledTimes(1);
      });
    });
  });
});