'use client';

import React, { useState, useCallback } from 'react';
import { ApplicationService, InvestorFormData, ValidationError } from '@/lib/application-service';
import { 
  Users,
  Mail,
  MapPin,
  Building2,
  DollarSign,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';

interface InvestorForm506bProps {
  onSubmissionSuccess?: (data?: { name?: string; email?: string }) => void;
  onSubmissionError?: (error: string) => void;
  className?: string;
}

export default function InvestorForm506b({ 
  onSubmissionSuccess, 
  onSubmissionError, 
  className = '' 
}: InvestorForm506bProps) {
  const [formData, setFormData] = useState<InvestorFormData>({
    mode: '506b',
    fullName: '',
    email: '',
    country: '',
    state: '',
    investorType: 'individual',
    accreditationStatus: 'unsure',
    checkSize: '25k-50k',
    areasOfInterest: [],
    referralSource: '',
    consentConfirm: false,
    signature: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [realTimeValidation, setRealTimeValidation] = useState<{
    [key: string]: {
      isValid: boolean;
      message: string | null;
      isValidating: boolean;
    }
  }>({});

  // Update form data with validation
  const updateFormData = useCallback((field: keyof InvestorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors for this field when user updates it
    setValidationErrors(prev => prev.filter(error => error.field !== field));
    
    // Trigger real-time validation for this field
    validateFieldRealTime(field, value);
  }, []);

  // Real-time field validation with debouncing and cross-field validation
  const validateFieldRealTime = useCallback(async (field: keyof InvestorFormData, value: any) => {
    // Set validating state
    setRealTimeValidation(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        isValidating: true
      }
    }));

    // Debounce validation to avoid excessive calls
    setTimeout(async () => {
      try {
        // Use the new field-specific validation method for better real-time feedback
        const validation = ApplicationService.validateInvestorField(field, value, formData);
        const fieldError = validation.errors.find(error => error.field === field);

        setRealTimeValidation(prev => ({
          ...prev,
          [field]: {
            isValid: !fieldError,
            message: fieldError?.message || null,
            isValidating: false
          }
        }));

        // Also validate related fields for cross-field validation
        if (field === 'investorType' || field === 'accreditationStatus') {
          // Validate the other field in the pair
          const relatedField = field === 'investorType' ? 'accreditationStatus' : 'investorType';
          const relatedValue = field === 'investorType' ? formData.accreditationStatus : formData.investorType;
          
          if (relatedValue) {
            const relatedValidation = ApplicationService.validateInvestorField(relatedField, relatedValue, { ...formData, [field]: value });
            const relatedError = relatedValidation.errors.find(error => error.field === relatedField);
            
            setRealTimeValidation(prev => ({
              ...prev,
              [relatedField]: {
                isValid: !relatedError,
                message: relatedError?.message || null,
                isValidating: false
              }
            }));
          }
        }

        // Validate check size when investor type changes
        if (field === 'investorType' && formData.checkSize) {
          const checkSizeValidation = ApplicationService.validateInvestorField('checkSize', formData.checkSize, { ...formData, [field]: value });
          const checkSizeError = checkSizeValidation.errors.find(error => error.field === 'checkSize');
          
          setRealTimeValidation(prev => ({
            ...prev,
            checkSize: {
              isValid: !checkSizeError,
              message: checkSizeError?.message || null,
              isValidating: false
            }
          }));
        }

        // Validate state when country changes
        if (field === 'country' && value === 'US' && formData.state) {
          const stateValidation = ApplicationService.validateInvestorField('state', formData.state, { ...formData, [field]: value });
          const stateError = stateValidation.errors.find(error => error.field === 'state');
          
          setRealTimeValidation(prev => ({
            ...prev,
            state: {
              isValid: !stateError,
              message: stateError?.message || null,
              isValidating: false
            }
          }));
        }

      } catch (error) {
        setRealTimeValidation(prev => ({
          ...prev,
          [field]: {
            isValid: false,
            message: 'Validation error occurred',
            isValidating: false
          }
        }));
      }
    }, 300); // 300ms debounce
  }, [formData]);

  // Get validation error for a specific field
  const getFieldError = useCallback((field: string) => {
    // Check for submission errors first
    const submissionError = validationErrors.find(error => error.field === field)?.message;
    if (submissionError) return submissionError;
    
    // Check for real-time validation errors
    const realTimeError = realTimeValidation[field];
    if (realTimeError && !realTimeError.isValid && realTimeError.message) {
      return realTimeError.message;
    }
    
    return null;
  }, [validationErrors, realTimeValidation]);

  // Check if field has error
  const hasFieldError = useCallback((field: string) => {
    // Check for submission errors
    const hasSubmissionError = validationErrors.some(error => error.field === field);
    if (hasSubmissionError) return true;
    
    // Check for real-time validation errors
    const realTimeError = realTimeValidation[field];
    return realTimeError && !realTimeError.isValid;
  }, [validationErrors, realTimeValidation]);

  // Check if field is currently being validated
  const isFieldValidating = useCallback((field: string) => {
    return realTimeValidation[field]?.isValidating || false;
  }, [realTimeValidation]);

  // Get field validation status for styling with enhanced visual feedback
  const getFieldValidationClass = useCallback((field: string, baseClass: string) => {
    const hasError = hasFieldError(field);
    const isValidating = isFieldValidating(field);
    const realTimeState = realTimeValidation[field];
    const fieldValue = formData[field as keyof InvestorFormData];
    
    let classes = baseClass;
    
    if (hasError) {
      // Different error styles based on error severity
      const errorMessage = getFieldError(field);
      const isBusinessLogicError = errorMessage?.includes('typically') || errorMessage?.includes('Consider');
      
      if (isBusinessLogicError) {
        classes += ' border-yellow-300 bg-yellow-50'; // Warning style for business logic mismatches
      } else {
        classes += ' border-arena-bright-umber bg-arena-sunrise'; // Error style for validation failures
      }
    } else if (realTimeState && realTimeState.isValid && !isValidating && fieldValue) {
      classes += ' border-arena-gold bg-arena-gold-light'; // Success style
    } else if (isValidating) {
      classes += ' border-arena-hunter-green bg-arena-abilene-lace'; // Validating style
    } else {
      classes += ' border-gray-300'; // Default style
    }
    
    return classes;
  }, [hasFieldError, isFieldValidating, realTimeValidation, formData, getFieldError]);

  // Get error display component with enhanced messaging
  const renderFieldError = useCallback((field: string) => {
    const errorMessage = getFieldError(field);
    if (!errorMessage) return null;

    // Determine error type for appropriate styling and icons
    const isBusinessLogicError = errorMessage.includes('typically') || errorMessage.includes('Consider');
    const isWarning = errorMessage.includes('may require') || errorMessage.includes('suggestion');
    
    if (isWarning) {
      return (
        <div className="flex items-start space-x-2 mt-1">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-700">{errorMessage}</p>
        </div>
      );
    } else if (isBusinessLogicError) {
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

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      // Comprehensive form validation before submission
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
          mode: '506b',
          fullName: '',
          email: '',
          country: '',
          state: '',
          investorType: 'individual',
          accreditationStatus: 'unsure',
          checkSize: '25k-50k',
          areasOfInterest: [],
          referralSource: '',
          consentConfirm: false,
          signature: ''
        });
        setValidationErrors([]);
        setRealTimeValidation({});
        
        if (onSubmissionSuccess) {
          onSubmissionSuccess({
            name: formData.fullName,
            email: formData.email
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
  }, [formData, onSubmissionSuccess, onSubmissionError]);

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-4 sm:p-8 ${className}`}>
      <div className="space-y-6 sm:space-y-8">
        {/* Form Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-arena-gold" />
          </div>
          <div className="space-y-2">
            <h2 className="arena-headline text-arena-navy">Express Your Interest</h2>
            <p className="arena-body text-gray-600">
              Share your investment preferences to be considered for private offerings under Rule 506(b).
            </p>
          </div>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" role="form">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
              <Users className="w-5 h-5 text-arena-gold" />
              <h3 className="font-semibold text-arena-navy">Basic Information</h3>
            </div>

            <div className="mobile-grid gap-4 sm:gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    className={getFieldValidationClass('fullName', 'form-input-mobile block w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-arena-gold focus:border-transparent transition-colors')}
                    placeholder="Enter your full name"
                    aria-invalid={hasFieldError('fullName')}
                    style={{ fontSize: '16px' }} // Prevents zoom on iOS
                  />
                  {isFieldValidating('fullName') && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
                {renderFieldError('fullName')}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={getFieldValidationClass('email', 'form-input-mobile block w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-arena-gold focus:border-transparent transition-colors')}
                    placeholder="Enter your email address"
                    style={{ fontSize: '16px' }} // Prevents zoom on iOS
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isFieldValidating('email') ? (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                {renderFieldError('email')}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <div className="relative">
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={(e) => updateFormData('country', e.target.value)}
                    className={getFieldValidationClass('country', 'form-input-mobile block w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-arena-gold focus:border-transparent transition-colors')}
                    style={{ fontSize: '16px' }} // Prevents zoom on iOS
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="NL">Netherlands</option>
                    <option value="CH">Switzerland</option>
                    <option value="SG">Singapore</option>
                    <option value="HK">Hong Kong</option>
                    <option value="JP">Japan</option>
                    <option value="KR">South Korea</option>
                    <option value="IL">Israel</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                {renderFieldError('country')}
              </div>

              {/* State (for US only) */}
              {formData.country === 'US' && (
                <div className="space-y-2">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State *
                  </label>
                  <div className="relative">
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      className={getFieldValidationClass('state', 'form-input-mobile block w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-arena-gold focus:border-transparent transition-colors')}
                      style={{ fontSize: '16px' }} // Prevents zoom on iOS
                    >
                      <option value="">Select State</option>
                      <option value="AL">Alabama</option>
                      <option value="AK">Alaska</option>
                      <option value="AZ">Arizona</option>
                      <option value="AR">Arkansas</option>
                      <option value="CA">California</option>
                      <option value="CO">Colorado</option>
                      <option value="CT">Connecticut</option>
                      <option value="DE">Delaware</option>
                      <option value="FL">Florida</option>
                      <option value="GA">Georgia</option>
                      <option value="HI">Hawaii</option>
                      <option value="ID">Idaho</option>
                      <option value="IL">Illinois</option>
                      <option value="IN">Indiana</option>
                      <option value="IA">Iowa</option>
                      <option value="KS">Kansas</option>
                      <option value="KY">Kentucky</option>
                      <option value="LA">Louisiana</option>
                      <option value="ME">Maine</option>
                      <option value="MD">Maryland</option>
                      <option value="MA">Massachusetts</option>
                      <option value="MI">Michigan</option>
                      <option value="MN">Minnesota</option>
                      <option value="MS">Mississippi</option>
                      <option value="MO">Missouri</option>
                      <option value="MT">Montana</option>
                      <option value="NE">Nebraska</option>
                      <option value="NV">Nevada</option>
                      <option value="NH">New Hampshire</option>
                      <option value="NJ">New Jersey</option>
                      <option value="NM">New Mexico</option>
                      <option value="NY">New York</option>
                      <option value="NC">North Carolina</option>
                      <option value="ND">North Dakota</option>
                      <option value="OH">Ohio</option>
                      <option value="OK">Oklahoma</option>
                      <option value="OR">Oregon</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="RI">Rhode Island</option>
                      <option value="SC">South Carolina</option>
                      <option value="SD">South Dakota</option>
                      <option value="TN">Tennessee</option>
                      <option value="TX">Texas</option>
                      <option value="UT">Utah</option>
                      <option value="VT">Vermont</option>
                      <option value="VA">Virginia</option>
                      <option value="WA">Washington</option>
                      <option value="WV">West Virginia</option>
                      <option value="WI">Wisconsin</option>
                      <option value="WY">Wyoming</option>
                      <option value="DC">District of Columbia</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  {renderFieldError('state')}
                </div>
              )}
            </div>
          </div>

          {/* Investor Profile Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
              <Building2 className="w-5 h-5 text-arena-gold" />
              <h3 className="font-semibold text-arena-navy">Investor Profile</h3>
            </div>

            <div className="mobile-grid gap-4 sm:gap-6">
              {/* Investor Type */}
              <div className="space-y-2">
                <label htmlFor="investorType" className="block text-sm font-medium text-gray-700">
                  Investor Type *
                </label>
                <select
                  id="investorType"
                  name="investorType"
                  value={formData.investorType}
                  onChange={(e) => updateFormData('investorType', e.target.value)}
                  className={getFieldValidationClass('investorType', 'form-input-mobile block w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-arena-gold focus:border-transparent transition-colors')}
                  style={{ fontSize: '16px' }} // Prevents zoom on iOS
                >
                  <option value="individual">Individual</option>
                  <option value="family-office">Family Office</option>
                  <option value="institutional">Institutional</option>
                  <option value="other">Other</option>
                </select>
                {renderFieldError('investorType')}
              </div>

              {/* Accreditation Status */}
              <div className="space-y-2">
                <label htmlFor="accreditationStatus" className="block text-sm font-medium text-gray-700">
                  Accredited Investor Status *
                </label>
                <select
                  id="accreditationStatus"
                  name="accreditationStatus"
                  value={formData.accreditationStatus}
                  onChange={(e) => updateFormData('accreditationStatus', e.target.value)}
                  className={getFieldValidationClass('accreditationStatus', 'form-input-mobile block w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-arena-gold focus:border-transparent transition-colors')}
                  style={{ fontSize: '16px' }} // Prevents zoom on iOS
                >
                  <option value="yes">Yes, I am accredited</option>
                  <option value="no">No, I am not accredited</option>
                  <option value="unsure">Unsure</option>
                </select>
                {renderFieldError('accreditationStatus')}
              </div>
            </div>
          </div>

          {/* Investment Preferences Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
              <Target className="w-5 h-5 text-arena-gold" />
              <h3 className="font-semibold text-arena-navy">Investment Preferences</h3>
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
                      className="w-5 h-5 text-arena-gold border-gray-300 rounded focus:ring-arena-gold focus:ring-2"
                    />
                    <span className="mobile-text-base font-medium text-gray-700">{area.label}</span>
                  </label>
                ))}
              </div>
              {renderFieldError('areasOfInterest')}
            </div>

            {/* Referral Source */}
            <div className="space-y-2">
              <label htmlFor="referralSource" className="block text-sm font-medium text-gray-700">
                How did you hear about Arena Fund? (Optional)
              </label>
              <input
                type="text"
                id="referralSource"
                name="referralSource"
                value={formData.referralSource || ''}
                onChange={(e) => updateFormData('referralSource', e.target.value)}
                className="form-input-mobile block w-full rounded-lg px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-arena-gold focus:border-transparent transition-colors"
                placeholder="e.g., LinkedIn, referral, conference, etc."
                style={{ fontSize: '16px' }} // Prevents zoom on iOS
              />
            </div>
          </div>

          {/* Consent and Signature Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
              <CheckCircle className="w-5 h-5 text-arena-gold" />
              <h3 className="font-semibold text-arena-navy">Consent & Signature</h3>
            </div>

            {/* Consent Checkbox */}
            <div className="space-y-3">
              <label className="touch-target flex items-start space-x-3 cursor-pointer" style={{ WebkitTapHighlightColor: 'transparent' }}>
                <input
                  type="checkbox"
                  checked={formData.consentConfirm}
                  onChange={(e) => updateFormData('consentConfirm', e.target.checked)}
                  className="w-5 h-5 text-arena-gold border-gray-300 rounded focus:ring-arena-gold focus:ring-2 mt-0.5 flex-shrink-0"
                />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-2">I confirm that:</p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li>• I understand this is an expression of interest only and not an offer or solicitation</li>
                    <li>• I may be contacted by Arena Fund regarding investment opportunities</li>
                    <li>• I consent to the collection and processing of my personal information as described in the Privacy Policy</li>
                    <li>• I understand that private offerings under Rule 506(b) have specific investor requirements</li>
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
                onChange={(e) => updateFormData('signature', e.target.value)}
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

          {/* Honeypot field for bot detection */}
          <input
            type="text"
            name="websiteHoneypot"
            value=""
            onChange={() => {}} // Intentionally empty
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-mobile w-full arena-btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Expression of Interest</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Legal Disclaimer */}
          <div className="pt-4 text-center">
            <p className="text-xs text-gray-500 italic">
              This is an expression of interest only. It is not an offer or solicitation.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Private offerings under Rule 506(b) are limited to accredited investors and up to 35 sophisticated non-accredited investors.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}