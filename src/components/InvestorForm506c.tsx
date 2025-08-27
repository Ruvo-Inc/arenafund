'use client';

import React, { useState, useCallback } from 'react';
import { ApplicationService, InvestorFormData, ValidationError } from '@/lib/application-service';
import ProgressSteps from '@/components/ui/ProgressSteps';
import VerificationFileUpload from '@/components/ui/VerificationFileUpload';
import { 
  Shield,
  Upload,
  Building2,
  Target,
  FileCheck,
  Mail,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  X,
  FileText
} from 'lucide-react';

interface InvestorForm506cProps {
  onSubmissionSuccess?: (data?: { name?: string; email?: string; entityName?: string }) => void;
  onSubmissionError?: (error: string) => void;
  className?: string;
  // Pre-filled basic information (from parent component)
  initialData?: Partial<InvestorFormData>;
}

type FormStep = 1 | 2 | 3 | 4;

interface StepValidation {
  [key: number]: (keyof InvestorFormData)[];
}

const STEP_FIELDS: StepValidation = {
  1: ['verificationMethod', 'verificationFile', 'accreditationStatus'],
  2: ['entityName', 'jurisdiction', 'custodianInfo'],
  3: ['checkSize', 'areasOfInterest'],
  4: ['consentConfirm', 'signature']
};

export default function InvestorForm506c({ 
  onSubmissionSuccess, 
  onSubmissionError, 
  className = '',
  initialData = {}
}: InvestorForm506cProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<InvestorFormData>({
    mode: '506c',
    fullName: initialData.fullName || '',
    email: initialData.email || '',
    country: initialData.country || '',
    state: initialData.state || '',
    investorType: initialData.investorType || 'individual',
    accreditationStatus: 'yes', // Default to yes for 506(c)
    checkSize: initialData.checkSize || '25k-50k',
    areasOfInterest: initialData.areasOfInterest || [],
    verificationMethod: 'letter',
    entityName: '',
    jurisdiction: '',
    custodianInfo: '',
    consentConfirm: false,
    signature: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [stepValidation, setStepValidation] = useState<{[key: number]: boolean}>({});

  // Step configuration
  const steps: Array<{
    id: string;
    title: string;
    description: string;
    status: 'completed' | 'current' | 'upcoming';
  }> = [
    {
      id: '1',
      title: 'Accreditation Verification',
      description: 'Upload verification documents',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming'
    },
    {
      id: '2', 
      title: 'Investor Profile',
      description: 'Entity and jurisdiction details',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming'
    },
    {
      id: '3',
      title: 'Investment Preferences', 
      description: 'Check size and interests',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'upcoming'
    },
    {
      id: '4',
      title: 'Document Access',
      description: 'Legal agreements and confirmation',
      status: currentStep === 4 ? 'current' : 'upcoming'
    }
  ] as const;

  // Update form data with validation
  const updateFormData = useCallback((field: keyof InvestorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors for this field when user updates it
    setValidationErrors(prev => prev.filter(error => error.field !== field));
  }, []);

  // Get validation error for a specific field
  const getFieldError = useCallback((field: string) => {
    return validationErrors.find(error => error.field === field)?.message || null;
  }, [validationErrors]);

  // Check if field has error
  const hasFieldError = useCallback((field: string) => {
    return validationErrors.some(error => error.field === field);
  }, [validationErrors]);

  // Get field validation status for styling with enhanced visual feedback
  const getFieldValidationClass = useCallback((field: string, baseClass: string) => {
    const hasError = hasFieldError(field);
    let classes = baseClass;
    
    if (hasError) {
      // Different error styles based on error severity
      const errorMessage = getFieldError(field);
      const isBusinessLogicError = errorMessage?.includes('typically') || errorMessage?.includes('Consider');
      const isWarning = errorMessage?.includes('may require') || errorMessage?.includes('suggestion');
      
      if (isWarning || isBusinessLogicError) {
        classes += ' border-yellow-300 bg-yellow-50'; // Warning style
      } else {
        classes += ' border-arena-bright-umber bg-arena-sunrise'; // Error style
      }
    } else {
      classes += ' border-gray-300'; // Default style
    }
    
    return classes;
  }, [hasFieldError, getFieldError]);

  // Enhanced error display component
  const renderFieldError = useCallback((field: string) => {
    const errorMessage = getFieldError(field);
    if (!errorMessage) return null;

    // Determine error type for appropriate styling and icons
    const isBusinessLogicError = errorMessage.includes('typically') || errorMessage.includes('Consider');
    const isWarning = errorMessage.includes('may require') || errorMessage.includes('suggestion') || errorMessage.includes('convenient');
    const isJurisdictionError = errorMessage.includes('jurisdiction') || errorMessage.includes('valid US') || errorMessage.includes('valid Canadian');
    
    if (isWarning) {
      return (
        <div className="flex items-start space-x-2 mt-1">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">{errorMessage}</p>
        </div>
      );
    } else if (isBusinessLogicError || isJurisdictionError) {
      return (
        <div className="flex items-start space-x-2 mt-1">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-700">{errorMessage}</p>
        </div>
      );
    } else {
      return (
        <div className="flex items-start space-x-2 mt-1">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      );
    }
  }, [getFieldError]);

  // Handle areas of interest selection
  const handleAreasOfInterestChange = useCallback((area: string, checked: boolean) => {
    const currentAreas = formData.areasOfInterest || [];
    let newAreas: string[];
    
    if (checked) {
      newAreas = [...currentAreas, area];
    } else {
      newAreas = currentAreas.filter(a => a !== area);
    }
    
    updateFormData('areasOfInterest', newAreas);
  }, [formData.areasOfInterest, updateFormData]);

  // Handle verification file upload
  const handleVerificationFileUpload = useCallback((fileRef: string, fileName: string) => {
    updateFormData('verificationFileRef', fileRef);
    // Clear any previous errors for this field
    setValidationErrors(prev => prev.filter(error => error.field !== 'verificationFile'));
  }, [updateFormData]);

  // Handle verification file removal
  const handleVerificationFileRemove = useCallback(() => {
    updateFormData('verificationFileRef', undefined);
    updateFormData('verificationFile', null);
  }, [updateFormData]);

  // Handle verification file upload error
  const handleVerificationFileError = useCallback((error: string) => {
    setValidationErrors(prev => [
      ...prev.filter(err => err.field !== 'verificationFile'),
      {
        field: 'verificationFile',
        message: error,
        code: 'UPLOAD_ERROR'
      }
    ]);
  }, []);

  // Validate current step with enhanced cross-field validation
  const validateCurrentStep = useCallback(() => {
    const stepFields = STEP_FIELDS[currentStep] || [];
    const tempFormData = { ...formData };
    
    // Add basic required fields for all steps
    if (currentStep === 1) {
      tempFormData.fullName = formData.fullName || 'temp'; // Will be filled from parent
      tempFormData.email = formData.email || 'temp@example.com';
      tempFormData.country = formData.country || 'US';
    }
    
    const validation = ApplicationService.validateInvestorFormData(tempFormData);
    const stepErrors = validation.errors.filter(error => 
      stepFields.includes(error.field as keyof InvestorFormData)
    );
    
    setValidationErrors(stepErrors);
    const isValid = stepErrors.length === 0;
    
    setStepValidation(prev => ({ ...prev, [currentStep]: isValid }));
    return isValid;
  }, [currentStep, formData]);

  // Real-time field validation for 506c form
  const validateFieldRealTime = useCallback(async (field: keyof InvestorFormData, value: any) => {
    try {
      // Use the enhanced field validation method
      const validation = ApplicationService.validateInvestorField(field, value, formData);
      const fieldErrors = validation.errors.filter(error => error.field === field);
      
      // Update validation errors for this field
      setValidationErrors(prev => {
        const otherErrors = prev.filter(error => error.field !== field);
        return [...otherErrors, ...fieldErrors];
      });

      // Cross-field validation for related fields
      if (field === 'country' && value && formData.jurisdiction) {
        const jurisdictionValidation = ApplicationService.validateInvestorField('jurisdiction', formData.jurisdiction, { ...formData, [field]: value });
        const jurisdictionErrors = jurisdictionValidation.errors.filter(error => error.field === 'jurisdiction');
        
        setValidationErrors(prev => {
          const otherErrors = prev.filter(error => error.field !== 'jurisdiction');
          return [...otherErrors, ...jurisdictionErrors];
        });
      }

      if (field === 'jurisdiction' && value && formData.country) {
        const validation = ApplicationService.validateInvestorField(field, value, formData);
        const fieldErrors = validation.errors.filter(error => error.field === field);
        
        setValidationErrors(prev => {
          const otherErrors = prev.filter(error => error.field !== field);
          return [...otherErrors, ...fieldErrors];
        });
      }

    } catch (error) {
      console.error('Real-time validation error:', error);
    }
  }, [formData]);

  // Navigate to next step
  const handleNextStep = useCallback(() => {
    if (validateCurrentStep() && currentStep < 4) {
      setCurrentStep(prev => (prev + 1) as FormStep);
    }
  }, [validateCurrentStep, currentStep]);

  // Navigate to previous step
  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as FormStep);
      setValidationErrors([]); // Clear errors when going back
    }
  }, [currentStep]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      // Final comprehensive validation
      const validation = ApplicationService.validateInvestorFormData(formData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setIsSubmitting(false);
        return;
      }

      // Submit investor application
      const result = await ApplicationService.submitInvestorApplication(formData);

      if (result.success) {
        // Success: Clear form and notify parent
        setFormData({
          mode: '506c',
          fullName: '',
          email: '',
          country: '',
          state: '',
          investorType: 'individual',
          accreditationStatus: 'yes',
          checkSize: '25k-50k',
          areasOfInterest: [],
          verificationMethod: 'letter',
          entityName: '',
          jurisdiction: '',
          custodianInfo: '',
          consentConfirm: false,
          signature: ''
        });
        setValidationErrors([]);
        setCurrentStep(1);
        
        if (onSubmissionSuccess) {
          onSubmissionSuccess({
            name: formData.fullName,
            email: formData.email,
            entityName: formData.entityName
          });
        }
      } else {
        // Handle API errors
        if (result.validationErrors && result.validationErrors.length > 0) {
          setValidationErrors(result.validationErrors);
        } else {
          const errorMessage = result.error || 'Application submission failed. Please try again.';
          setValidationErrors([{
            field: 'general',
            message: errorMessage,
            code: 'SUBMISSION_ERROR'
          }]);
          
          if (onSubmissionError) {
            onSubmissionError(errorMessage);
          }
        }
      }
    } catch (error) {
      console.error('Investor application submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setValidationErrors([{
        field: 'general',
        message: `${errorMessage}. Please check your connection and try again.`,
        code: 'NETWORK_ERROR'
      }]);
      
      if (onSubmissionError) {
        onSubmissionError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateCurrentStep, onSubmissionSuccess, onSubmissionError]);

  // Render Step 1: Accreditation Verification
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-arena-gold" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-arena-navy">Accreditation Verification</h3>
          <p className="text-gray-600">
            Upload your accreditation verification documents to proceed with the 506(c) investment process.
          </p>
        </div>
      </div>

      {/* Verification Method */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Verification Method *
        </label>
        <div className="space-y-3">
          {[
            { value: 'letter', label: 'Verification Letter from CPA/Attorney', description: 'Upload a letter from your CPA or attorney confirming accredited status' },
            { value: 'third-party', label: 'Third-Party Verification Service', description: 'Use a third-party service like VerifyInvestor.com' },
            { value: 'bank-brokerage', label: 'Bank/Brokerage Statement', description: 'Upload recent statements showing qualifying assets' }
          ].map((method) => (
            <label key={method.value} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="radio"
                name="verificationMethod"
                value={method.value}
                checked={formData.verificationMethod === method.value}
                onChange={(e) => updateFormData('verificationMethod', e.target.value)}
                className="w-4 h-4 text-arena-gold border-gray-300 focus:ring-arena-gold focus:ring-2 mt-1"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">{method.label}</span>
                <p className="text-xs text-gray-500 mt-1">{method.description}</p>
              </div>
            </label>
          ))}
        </div>
        {renderFieldError('verificationMethod')}
      </div>

      {/* File Upload for Letter Method */}
      {formData.verificationMethod === 'letter' && (
        <VerificationFileUpload
          onFileUpload={handleVerificationFileUpload}
          onFileRemove={handleVerificationFileRemove}
          onError={handleVerificationFileError}
          existingFileRef={formData.verificationFileRef}
          required={true}
          className="mt-4"
        />
      )}

      {/* Accreditation Status Confirmation */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Accreditation Status Confirmation *
        </label>
        <div className="p-4 bg-arena-abilene-lace border border-arena-hunter-green rounded-lg">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.accreditationStatus === 'yes'}
              onChange={(e) => updateFormData('accreditationStatus', e.target.checked ? 'yes' : 'no')}
              className="w-5 h-5 text-arena-gold border-gray-300 rounded focus:ring-arena-gold focus:ring-2 mt-0.5"
            />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">I confirm that I am an accredited investor</p>
              <p className="text-xs text-gray-600">
                I meet the SEC definition of an accredited investor under Rule 501 of Regulation D, 
                including having a net worth exceeding $1 million or annual income exceeding $200,000 
                ($300,000 with spouse) in each of the two most recent years.
              </p>
            </div>
          </label>
        </div>
        {renderFieldError('accreditationStatus')}
      </div>
    </div>
  );

  // Render Step 2: Investor Profile
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
          <Building2 className="w-8 h-8 text-arena-gold" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-arena-navy">Investor Profile</h3>
          <p className="text-gray-600">
            Provide details about your investment entity and jurisdiction for compliance purposes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Entity Name */}
        <div className="space-y-2">
          <label htmlFor="entityName" className="block text-sm font-medium text-gray-700">
            Entity Name *
          </label>
          <input
            type="text"
            id="entityName"
            name="entityName"
            value={formData.entityName || ''}
            onChange={(e) => {
              updateFormData('entityName', e.target.value);
              validateFieldRealTime('entityName', e.target.value);
            }}
            className={getFieldValidationClass('entityName', 'form-input-mobile block w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-arena-gold focus:border-transparent transition-colors')}
            placeholder="Enter the legal name of your investment entity"
            style={{ fontSize: '16px' }} // Prevents zoom on iOS
          />
          {renderFieldError('entityName')}
          <p className="text-xs text-gray-500">
            This should be the legal name of the entity making the investment (individual name, trust, LLC, etc.)
          </p>
        </div>

        {/* Jurisdiction */}
        <div className="space-y-2">
          <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700">
            Jurisdiction *
          </label>
          <input
            type="text"
            id="jurisdiction"
            name="jurisdiction"
            value={formData.jurisdiction || ''}
            onChange={(e) => {
              updateFormData('jurisdiction', e.target.value);
              validateFieldRealTime('jurisdiction', e.target.value);
            }}
            className={getFieldValidationClass('jurisdiction', 'form-input-mobile block w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-arena-gold focus:border-transparent transition-colors')}
            placeholder="e.g., Delaware, Cayman Islands, etc."
            style={{ fontSize: '16px' }} // Prevents zoom on iOS
          />
          {renderFieldError('jurisdiction')}
          <p className="text-xs text-gray-500">
            The jurisdiction where your investment entity is organized or domiciled
          </p>
        </div>

        {/* Custodian Information */}
        <div className="space-y-2">
          <label htmlFor="custodianInfo" className="block text-sm font-medium text-gray-700">
            Custodian/Prime Broker Information
          </label>
          <textarea
            id="custodianInfo"
            name="custodianInfo"
            rows={3}
            value={formData.custodianInfo || ''}
            onChange={(e) => updateFormData('custodianInfo', e.target.value)}
            className="form-input-mobile block w-full rounded-lg px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-arena-gold focus:border-transparent transition-colors resize-none"
            placeholder="Provide details about your custodian, prime broker, or asset management firm (optional)"
            style={{ fontSize: '16px' }} // Prevents zoom on iOS
          />
          <p className="text-xs text-gray-500">
            Optional: Information about where your assets are held or managed
          </p>
        </div>
      </div>
    </div>
  );

  // Render Step 3: Investment Preferences  
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
          <Target className="w-8 h-8 text-arena-gold" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-arena-navy">Investment Preferences</h3>
          <p className="text-gray-600">
            Share your investment preferences to help us match you with appropriate opportunities.
          </p>
        </div>
      </div>

      {/* Check Size */}
      <div className="space-y-2">
        <label htmlFor="checkSize" className="block text-sm font-medium text-gray-700">
          Investment Check Size *
        </label>
        <div className="relative">
          <select
            id="checkSize"
            name="checkSize"
            value={formData.checkSize}
            onChange={(e) => updateFormData('checkSize', e.target.value)}
            className={getFieldValidationClass('checkSize', 'form-input-mobile block w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-arena-gold focus:border-transparent transition-colors')}
            style={{ fontSize: '16px' }} // Prevents zoom on iOS
          >
            <option value="25k-50k">$25k - $50k</option>
            <option value="50k-250k">$50k - $250k</option>
            <option value="250k-plus">$250k+</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        {renderFieldError('checkSize')}
      </div>

      {/* Areas of Interest */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Areas of Interest * (Select all that apply)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: 'enterprise-ai', label: 'Enterprise AI' },
            { value: 'healthcare-ai', label: 'Healthcare AI' },
            { value: 'fintech-ai', label: 'Fintech AI' },
            { value: 'hi-tech', label: 'Hi-Tech' }
          ].map((area) => (
            <label key={area.value} className="touch-target flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors" style={{ WebkitTapHighlightColor: 'transparent' }}>
              <input
                type="checkbox"
                checked={formData.areasOfInterest.includes(area.value)}
                onChange={(e) => handleAreasOfInterestChange(area.value, e.target.checked)}
                className="w-5 h-5 text-arena-gold border-gray-300 rounded focus:ring-arena-gold focus:ring-2 flex-shrink-0"
              />
              <span className="mobile-text-base font-medium text-gray-700">{area.label}</span>
            </label>
          ))}
        </div>
        {renderFieldError('areasOfInterest')}
      </div>
    </div>
  );

  // Render Step 4: Document Access Confirmation
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
          <FileCheck className="w-8 h-8 text-orange-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-arena-navy">Document Access Confirmation</h3>
          <p className="text-gray-600">
            Review and confirm your understanding of the investment process and legal agreements.
          </p>
        </div>
      </div>

      {/* Legal Agreements */}
      <div className="space-y-4">
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Investment Process Overview</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• Upon verification, you will receive access to our secure data room</p>
            <p>• You will be able to review detailed investment materials and due diligence documents</p>
            <p>• Investment opportunities are subject to availability and suitability assessment</p>
            <p>• All investments are subject to subscription agreements and operating agreements</p>
          </div>
        </div>

        <div className="p-6 bg-arena-abilene-lace border border-arena-hunter-green rounded-lg">
          <h4 className="font-semibold text-arena-night-brown mb-3">506(c) Offering Disclosure</h4>
          <div className="space-y-2 text-sm text-arena-hunter-green">
            <p>• This is a 506(c) offering under Regulation D, available only to verified accredited investors</p>
            <p>• General solicitation and advertising are permitted for 506(c) offerings</p>
            <p>• All investors must be verified as accredited before investing</p>
            <p>• Investment involves substantial risk and may result in total loss of capital</p>
          </div>
        </div>
      </div>

      {/* Consent and Confirmation */}
      <div className="space-y-4">
        <label className="touch-target flex items-start space-x-3 cursor-pointer" style={{ WebkitTapHighlightColor: 'transparent' }}>
          <input
            type="checkbox"
            checked={formData.consentConfirm}
            onChange={(e) => updateFormData('consentConfirm', e.target.checked)}
            className="w-5 h-5 text-arena-gold border-gray-300 rounded focus:ring-arena-gold focus:ring-2 mt-0.5 flex-shrink-0"
          />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-2">I confirm and agree that:</p>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• I understand this is a 506(c) offering available only to verified accredited investors</li>
              <li>• I consent to verification of my accredited investor status</li>
              <li>• I understand the risks associated with private investments</li>
              <li>• I have read and agree to the Privacy Policy and Terms of Use</li>
              <li>• I consent to receiving investment-related communications from Arena Fund</li>
            </ul>
          </div>
        </label>
        {renderFieldError('consentConfirm')}
      </div>

      {/* Digital Signature */}
      <div className="space-y-2">
        <label htmlFor="signature" className="block text-sm font-medium text-gray-700">
          Digital Signature * (Type your full name)
        </label>
        <input
          type="text"
          id="signature"
          name="signature"
          value={formData.signature}
          onChange={(e) => {
            updateFormData('signature', e.target.value);
            validateFieldRealTime('signature', e.target.value);
          }}
          className={getFieldValidationClass('signature', 'form-input-mobile block w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-arena-gold focus:border-transparent transition-colors')}
          placeholder="Type your full name as your digital signature"
          style={{ fontSize: '16px' }} // Prevents zoom on iOS
        />
        {renderFieldError('signature')}
        <p className="text-xs text-gray-500">
          By typing your name above, you agree that this serves as your electronic signature.
        </p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-4 sm:p-8 ${className}`}>
      <div className="space-y-6 sm:space-y-8">
        {/* Form Header */}
        <div className="text-center space-y-4">
          <h2 className="arena-headline text-arena-navy">506(c) Investment Verification</h2>
          <p className="arena-body text-gray-600">
            Complete the verification process to access investment opportunities under Rule 506(c).
          </p>
        </div>

        {/* Honeypot field for spam protection - hidden from users */}
        <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
          <input
            type="text"
            name="websiteHoneypot"
            tabIndex={-1}
            value=""
            onChange={() => {}} // Intentionally empty
            autoComplete="off"
          />
        </div>

        {/* Progress Steps */}
        <div className="px-2 sm:px-4">
          <ProgressSteps 
            steps={steps}
            orientation="horizontal"
            variant="detailed"
            size="sm"
          />
        </div>

        {/* Error Display */}
        {validationErrors.some(error => error.field === 'general') && (
          <div className="p-4 bg-arena-sunrise border border-arena-bright-umber rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-arena-bright-umber mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                <p className="text-sm text-red-700 mt-1">
                  {getFieldError('general')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Step Content */}
        <div className="min-h-[300px] sm:min-h-[400px]">
          {renderCurrentStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className={`btn-mobile touch-target flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all order-2 sm:order-1 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="btn-mobile arena-btn-primary flex items-center justify-center space-x-2 order-1 sm:order-2"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span>Next Step</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-mobile arena-btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500 italic">
            This opportunity is available only to accredited investors. Verification is required before investing.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            506(c) offerings under Regulation D permit general solicitation but require verification of accredited investor status.
          </p>
        </div>
      </div>
    </div>
  );
}