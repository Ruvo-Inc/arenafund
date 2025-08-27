'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ApplicationService } from '@/lib/application-service';
import { 
  Rocket,
  FileText,
  Users,
  Building2,
  TrendingUp,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Target,
  Zap,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

interface FormData {
  // Founder & Team Info
  fullName: string;
  role: string;
  email: string;
  phone: string;
  linkedin: string;
  companyName: string;
  website: string;
  
  // Startup Snapshot
  stage: string;
  industry: string;
  oneLineDescription: string;
  problem: string;
  solution: string;
  traction: string;
  revenue: string;
  
  // Pitch Deck
  deckFile: File | null;
  deckLink: string;
  videoPitch: string;
  deckFileRef?: string; // Reference to uploaded file
  
  // Validation & Edge
  enterpriseEngagement: string;
  keyHighlights: string;
  
  // Funding
  capitalRaised: string;
  capitalRaisedAmount: string;
  capitalSought: string;
  
  // Consent
  accuracyConfirm: boolean;
  understandingConfirm: boolean;
  signature: string;
}

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    role: '',
    email: '',
    phone: '',
    linkedin: '',
    companyName: '',
    website: '',
    stage: '',
    industry: '',
    oneLineDescription: '',
    problem: '',
    solution: '',
    traction: '',
    revenue: '',
    deckFile: null,
    deckLink: '',
    videoPitch: '',
    deckFileRef: undefined,
    enterpriseEngagement: '',
    keyHighlights: '',
    capitalRaised: '',
    capitalRaisedAmount: '',
    capitalSought: '',
    accuracyConfirm: false,
    understandingConfirm: false,
    signature: ''
  });

  // File upload state
  const [fileUploadState, setFileUploadState] = useState<{
    isUploading: boolean;
    uploadProgress: number;
    uploadError: string | null;
    uploadedFileRef: string | null;
  }>({
    isUploading: false,
    uploadProgress: 0,
    uploadError: null,
    uploadedFileRef: null
  });

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<Array<{
    field: string;
    message: string;
    code: string;
  }>>([]);

  // Real-time validation state
  const [realTimeValidation, setRealTimeValidation] = useState<{
    [key: string]: {
      isValid: boolean;
      message: string | null;
      isValidating: boolean;
    }
  }>({});

  // Retry mechanism state
  const [retryState, setRetryState] = useState<{
    isRetrying: boolean;
    retryCount: number;
    maxRetries: number;
    retryAfter: number | null;
  }>({
    isRetrying: false,
    retryCount: 0,
    maxRetries: 3,
    retryAfter: null
  });

  // Countdown timer for rate limiting
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (retryState.retryAfter && retryState.retryAfter > 0) {
      interval = setInterval(() => {
        setRetryState(prev => {
          const newRetryAfter = prev.retryAfter ? prev.retryAfter - 1 : null;
          if (newRetryAfter === 0) {
            // Update error message when countdown reaches zero
            setValidationErrors(prevErrors => 
              prevErrors.map(error => 
                error.code === 'RATE_LIMITED' 
                  ? { ...error, message: 'You can now retry your submission.' }
                  : error
              )
            );
          }
          return { ...prev, retryAfter: newRetryAfter };
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [retryState.retryAfter]);

  const totalSteps = 5;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors for this field when user updates it
    setValidationErrors(prev => prev.filter(error => error.field !== field));
    
    // Trigger real-time validation for this field
    validateFieldRealTime(field, value);
  };

  // Real-time field validation with debouncing
  const validateFieldRealTime = async (field: keyof FormData, value: any) => {
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
        const tempFormData = { ...formData, [field]: value };
        const validation = ApplicationService.validateFormData(tempFormData);
        const fieldError = validation.errors.find(error => error.field === field);

        setRealTimeValidation(prev => ({
          ...prev,
          [field]: {
            isValid: !fieldError,
            message: fieldError?.message || null,
            isValidating: false
          }
        }));
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
  };

  // Get real-time validation state for a field
  const getFieldValidationState = (field: string) => {
    return realTimeValidation[field] || {
      isValid: true,
      message: null,
      isValidating: false
    };
  };

  // Handle file upload with progress tracking and error handling
  const handleFileUpload = async (file: File) => {
    setFileUploadState({
      isUploading: true,
      uploadProgress: 0,
      uploadError: null,
      uploadedFileRef: null
    });

    try {
      // Validate file before upload
      const validation = ApplicationService.validateFormData({
        ...formData,
        deckFile: file
      });

      const fileErrors = validation.errors.filter(error => error.field === 'deckFile');
      if (fileErrors.length > 0) {
        setFileUploadState(prev => ({
          ...prev,
          isUploading: false,
          uploadError: fileErrors[0].message
        }));
        return;
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setFileUploadState(prev => ({
          ...prev,
          uploadProgress: Math.min(prev.uploadProgress + 10, 90)
        }));
      }, 200);

      // Upload file using ApplicationService
      const result = await ApplicationService.uploadFile(file);

      clearInterval(progressInterval);

      if (result.success) {
        setFileUploadState({
          isUploading: false,
          uploadProgress: 100,
          uploadError: null,
          uploadedFileRef: result.fileRef || null
        });
        
        // Update form data with uploaded file and file reference
        updateFormData('deckFile', file);
        updateFormData('deckFileRef', result.fileRef);
        
        // Clear any existing deck link since we have a file now
        if (formData.deckLink) {
          updateFormData('deckLink', '');
        }
      } else {
        setFileUploadState(prev => ({
          ...prev,
          isUploading: false,
          uploadError: result.error || 'Upload failed'
        }));
      }
    } catch (error) {
      setFileUploadState(prev => ({
        ...prev,
        isUploading: false,
        uploadError: error instanceof Error ? error.message : 'Upload failed'
      }));
    }
  };

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Remove uploaded file
  const removeUploadedFile = () => {
    setFormData(prev => ({ ...prev, deckFile: null, deckFileRef: undefined }));
    setFileUploadState({
      isUploading: false,
      uploadProgress: 0,
      uploadError: null,
      uploadedFileRef: null
    });
  };

  // Get validation error for a specific field
  const getFieldError = (field: string) => {
    // Check for submission errors first
    const submissionError = validationErrors.find(error => error.field === field)?.message;
    if (submissionError) return submissionError;
    
    // Check for real-time validation errors
    const realTimeError = realTimeValidation[field];
    if (realTimeError && !realTimeError.isValid && realTimeError.message) {
      return realTimeError.message;
    }
    
    return null;
  };

  // Check if field has error
  const hasFieldError = (field: string) => {
    // Check for submission errors
    const hasSubmissionError = validationErrors.some(error => error.field === field);
    if (hasSubmissionError) return true;
    
    // Check for real-time validation errors
    const realTimeError = realTimeValidation[field];
    return realTimeError && !realTimeError.isValid;
  };

  // Check if field is currently being validated
  const isFieldValidating = (field: string) => {
    return realTimeValidation[field]?.isValidating || false;
  };

  // Get field validation status for styling
  const getFieldValidationClass = (field: string, baseClass: string) => {
    const hasError = hasFieldError(field);
    const isValidating = isFieldValidating(field);
    const realTimeState = realTimeValidation[field];
    
    let classes = baseClass;
    
    if (hasError) {
      classes += ' border-red-300 bg-red-50';
    } else if (realTimeState && realTimeState.isValid && !isValidating && formData[field as keyof FormData]) {
      classes += ' border-arena-hunter-green bg-arena-abilene-lace';
    } else {
      classes += ' border-gray-300';
    }
    
    return classes;
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Validate current step before proceeding with enhanced validation
      const validation = ApplicationService.validateFormData(formData);
      const currentStepFields = getFieldsForStep(currentStep);
      const currentStepErrors = validation.errors.filter(error => 
        currentStepFields.includes(error.field)
      );

      if (currentStepErrors.length > 0) {
        setValidationErrors(currentStepErrors);
        
        // Scroll to first error field
        setTimeout(() => {
          const firstErrorField = currentStepErrors[0].field;
          const errorElement = document.querySelector(`[name="${firstErrorField}"], [data-field="${firstErrorField}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
        return;
      }

      // Clear any existing errors and proceed
      setValidationErrors([]);
      setCurrentStep(currentStep + 1);
      
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper function to get fields for a specific step
  const getFieldsForStep = (step: number): string[] => {
    const stepFields = {
      1: ['fullName', 'role', 'email', 'phone', 'linkedin', 'companyName', 'website'],
      2: ['stage', 'industry', 'oneLineDescription', 'problem', 'solution', 'traction', 'revenue'],
      3: ['deckFile', 'deckLink', 'videoPitch'],
      4: ['enterpriseEngagement', 'keyHighlights', 'capitalRaised', 'capitalRaisedAmount', 'capitalSought'],
      5: ['accuracyConfirm', 'understandingConfirm', 'signature']
    };
    return stepFields[step as keyof typeof stepFields] || [];
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    await submitWithRetry();
  };

  // Enhanced submission with retry mechanism
  const submitWithRetry = async (isRetry: boolean = false) => {
    if (!isRetry) {
      setIsSubmitting(true);
      setValidationErrors([]);
      setRetryState(prev => ({ ...prev, retryCount: 0, retryAfter: null }));
    } else {
      setRetryState(prev => ({ ...prev, isRetrying: true }));
    }

    try {
      // Step 1: Comprehensive form validation before submission
      const validation = ApplicationService.validateFormData(formData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        
        // Navigate to the first step with errors and highlight fields
        const firstError = validation.errors[0];
        if (firstError) {
          const errorStep = getStepForField(firstError.field);
          if (errorStep && errorStep !== currentStep) {
            setCurrentStep(errorStep);
          }
        }
        
        setIsSubmitting(false);
        setRetryState(prev => ({ ...prev, isRetrying: false }));
        return;
      }

      // Step 2: Handle file upload if present and not already uploaded
      let fileRef: string | null = fileUploadState.uploadedFileRef;
      if (formData.deckFile && !fileRef) {
        const uploadResult = await ApplicationService.uploadFile(formData.deckFile);
        if (!uploadResult.success) {
          setValidationErrors([{
            field: 'deckFile',
            message: uploadResult.error || 'File upload failed',
            code: 'FILE_UPLOAD_ERROR'
          }]);
          setCurrentStep(3); // Navigate to pitch deck step
          setIsSubmitting(false);
          setRetryState(prev => ({ ...prev, isRetrying: false }));
          return;
        }
        fileRef = uploadResult.fileRef || null;
        
        // Update file upload state
        setFileUploadState(prev => ({
          ...prev,
          uploadedFileRef: fileRef || null
        }));
      }

      // Step 3: Submit application using ApplicationService with expanded API
      const result = await ApplicationService.submitApplication({
        ...formData,
        // Include file reference if available
        deckFileRef: fileRef || undefined
      });

      if (result.success) {
        // Success: Show confirmation page
        setIsSubmitted(true);
        setValidationErrors([]);
        setRetryState(prev => ({ ...prev, isRetrying: false, retryCount: 0 }));
        
        // Clear form data for security
        setFormData({
          fullName: '',
          role: '',
          email: '',
          phone: '',
          linkedin: '',
          companyName: '',
          website: '',
          stage: '',
          industry: '',
          oneLineDescription: '',
          problem: '',
          solution: '',
          traction: '',
          revenue: '',
          deckFile: null,
          deckLink: '',
          videoPitch: '',
          deckFileRef: undefined,
          enterpriseEngagement: '',
          keyHighlights: '',
          capitalRaised: '',
          capitalRaisedAmount: '',
          capitalSought: '',
          accuracyConfirm: false,
          understandingConfirm: false,
          signature: ''
        });
        
        // Clear file upload state
        setFileUploadState({
          isUploading: false,
          uploadProgress: 0,
          uploadError: null,
          uploadedFileRef: null
        });

        // Clear real-time validation state
        setRealTimeValidation({});
      } else {
        // Handle API errors with field-specific highlighting
        if (result.validationErrors && result.validationErrors.length > 0) {
          setValidationErrors(result.validationErrors);
          
          // Navigate to the first step with errors
          const firstError = result.validationErrors[0];
          if (firstError) {
            const errorStep = getStepForField(firstError.field);
            if (errorStep && errorStep !== currentStep) {
              setCurrentStep(errorStep);
            }
          }
          
          setRetryState(prev => ({ ...prev, isRetrying: false }));
        } else {
          // Handle rate limiting with retry after
          if (result.retryAfter) {
            setRetryState(prev => ({ 
              ...prev, 
              retryAfter: result.retryAfter || 30,
              isRetrying: false 
            }));
            
            setValidationErrors([{
              field: 'general',
              message: `Rate limited. Please wait ${result.retryAfter} seconds before trying again.`,
              code: 'RATE_LIMITED'
            }]);
            
            // Auto-retry after rate limit expires if user hasn't manually retried
            setTimeout(() => {
              setRetryState(prev => ({ ...prev, retryAfter: null }));
            }, (result.retryAfter || 30) * 1000);
          } else {
            // Check if this is a retryable error
            const isRetryableError = isErrorRetryable(result.error || '');
            
            if (isRetryableError && retryState.retryCount < retryState.maxRetries) {
              // Increment retry count and retry after delay
              setRetryState(prev => ({ 
                ...prev, 
                retryCount: prev.retryCount + 1,
                isRetrying: false 
              }));
              
              const retryDelay = Math.pow(2, retryState.retryCount) * 1000; // Exponential backoff
              
              setValidationErrors([{
                field: 'general',
                message: `Submission failed. Retrying in ${retryDelay / 1000} seconds... (Attempt ${retryState.retryCount + 1}/${retryState.maxRetries})`,
                code: 'RETRYING'
              }]);
              
              setTimeout(() => {
                submitWithRetry(true);
              }, retryDelay);
            } else {
              // Max retries reached or non-retryable error
              setValidationErrors([{
                field: 'general',
                message: result.error || 'Application submission failed. Please try again.',
                code: 'SUBMISSION_ERROR'
              }]);
              
              setRetryState(prev => ({ ...prev, isRetrying: false }));
            }
          }
        }
      }
    } catch (error) {
      console.error('Application submission error:', error);
      
      // Network or unexpected error handling with retry logic
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      const isNetworkError = isErrorRetryable(errorMessage);
      
      if (isNetworkError && retryState.retryCount < retryState.maxRetries) {
        // Increment retry count and retry after delay
        setRetryState(prev => ({ 
          ...prev, 
          retryCount: prev.retryCount + 1,
          isRetrying: false 
        }));
        
        const retryDelay = Math.pow(2, retryState.retryCount) * 1000; // Exponential backoff
        
        setValidationErrors([{
          field: 'general',
          message: `Network error. Retrying in ${retryDelay / 1000} seconds... (Attempt ${retryState.retryCount + 1}/${retryState.maxRetries})`,
          code: 'NETWORK_RETRY'
        }]);
        
        setTimeout(() => {
          submitWithRetry(true);
        }, retryDelay);
      } else {
        setValidationErrors([{
          field: 'general',
          message: `${errorMessage}. Please check your connection and try again.`,
          code: 'NETWORK_ERROR'
        }]);
        
        setRetryState(prev => ({ ...prev, isRetrying: false }));
      }
    } finally {
      if (!isRetry) {
        setIsSubmitting(false);
      }
    }
  };

  // Check if error is retryable
  const isErrorRetryable = (errorMessage: string): boolean => {
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /connection/i,
      /fetch/i,
      /server error/i,
      /internal server error/i,
      /service unavailable/i,
      /gateway timeout/i,
      /bad gateway/i
    ];
    
    return retryablePatterns.some(pattern => pattern.test(errorMessage));
  };

  // Manual retry function for user-initiated retries
  const handleManualRetry = () => {
    if (retryState.retryAfter) {
      setValidationErrors([{
        field: 'general',
        message: `Please wait ${retryState.retryAfter} more seconds before retrying.`,
        code: 'RATE_LIMITED'
      }]);
      return;
    }
    
    setRetryState(prev => ({ ...prev, retryCount: 0 }));
    submitWithRetry(false);
  };

  // Helper function to determine which step contains a field
  const getStepForField = (fieldName: string): number | null => {
    const stepFields = {
      1: ['fullName', 'role', 'email', 'phone', 'linkedin', 'companyName', 'website'],
      2: ['stage', 'industry', 'oneLineDescription', 'problem', 'solution', 'traction', 'revenue'],
      3: ['deckFile', 'deckLink', 'videoPitch'],
      4: ['enterpriseEngagement', 'keyHighlights', 'capitalRaised', 'capitalRaisedAmount', 'capitalSought'],
      5: ['accuracyConfirm', 'understandingConfirm', 'signature']
    };

    for (const [step, fields] of Object.entries(stepFields)) {
      if (fields.includes(fieldName)) {
        return parseInt(step);
      }
    }
    return null;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="arena-section flex items-center justify-center">
          <div className="text-center space-y-8 max-w-2xl">
            <div className="w-20 h-20 mx-auto bg-arena-abilene-lace rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-arena-hunter-green" />
            </div>
            <div className="space-y-4">
              <h1 className="arena-headline text-arena-navy">Application Submitted!</h1>
              <p className="arena-body-xl text-gray-600">
                Thank you for sharing your startup with Arena Fund. Our team personally reviews every application. 
                If there's a potential fit, we'll reach out within 2–3 weeks to discuss next steps.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/" className="arena-btn-primary">
                <Rocket className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <Link href="/faq" className="arena-btn-secondary">
                <FileText className="w-5 h-5 mr-2" />
                Read FAQ
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="arena-section bg-gradient-to-br from-white via-arena-cream to-white arena-subtle-pattern">
        <div className="arena-container">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="arena-badge">
                <Rocket className="w-4 h-4 mr-2" />
                Apply for Funding
              </div>
              
              <h1 className="arena-display text-arena-navy max-w-4xl mx-auto">
                Pitch your startup. We're here to back founders building the <span className="arena-gradient-text">future of AI</span>
              </h1>
              
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Arena Fund invests in early-stage, mission-led startups at the intersection of AI, enterprise, healthcare, 
                fintech, and hi-tech. If you're building systems that matter, we want to see your vision.
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-arena-navy">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-arena-gold h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>  
    {/* About Arena Fund */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="text-center space-y-12">
            <div className="space-y-6">
              <h2 className="arena-headline text-arena-navy">Why Arena Fund?</h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                We're based in San Francisco's "Arena," the hub of the global AI boom. 
                Here's what makes us different from other VCs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-arena-gold" />
                </div>
                <h3 className="font-semibold text-arena-navy">Pre-Seed to Series A</h3>
                <p className="text-sm text-gray-600">We invest across early stages when founders need us most</p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-arena-gold" />
                </div>
                <h3 className="font-semibold text-arena-navy">Fortune 500 Validation</h3>
                <p className="text-sm text-gray-600">We validate buyer demand before investing, reducing market risk</p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-arena-gold" />
                </div>
                <h3 className="font-semibold text-arena-navy">90% Pilot Success</h3>
                <p className="text-sm text-gray-600">Our orchestrated pilot programs achieve 90% pilot-to-purchase conversion</p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-arena-gold" />
                </div>
                <h3 className="font-semibold text-arena-navy">Move Fast</h3>
                <p className="text-sm text-gray-600">We treat every founder with respect and move quickly on decisions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="arena-section bg-arena-foggy-pith">
        <div className="arena-container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              
              {/* Enhanced Error Display with Retry Options */}
              {validationErrors.some(error => error.field === 'general') && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800">
                        {retryState.isRetrying ? 'Retrying Submission...' : 'Submission Error'}
                      </h3>
                      <p className="text-sm text-red-700 mt-1">
                        {getFieldError('general')}
                      </p>
                      
                      {/* Retry Options */}
                      {!retryState.isRetrying && !isSubmitting && (
                        <div className="mt-3 flex items-center space-x-3">
                          {/* Manual Retry Button */}
                          {(validationErrors.some(error => error.code === 'NETWORK_ERROR' || error.code === 'SUBMISSION_ERROR')) && (
                            <button
                              type="button"
                              onClick={handleManualRetry}
                              disabled={retryState.retryAfter !== null}
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ArrowRight className="w-3 h-3 mr-1" />
                              Try Again
                            </button>
                          )}
                          
                          {/* Rate Limit Countdown */}
                          {retryState.retryAfter && (
                            <span className="text-xs text-red-600">
                              Retry available in {retryState.retryAfter}s
                            </span>
                          )}
                          
                          {/* Retry Count Display */}
                          {retryState.retryCount > 0 && (
                            <span className="text-xs text-red-600">
                              Attempt {retryState.retryCount}/{retryState.maxRetries}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Retry Progress Indicator */}
                      {retryState.isRetrying && (
                        <div className="mt-3 flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                          <span className="text-xs text-red-600">
                            Retrying... ({retryState.retryCount}/{retryState.maxRetries})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Summary for Multiple Errors */}
              {validationErrors.length > 1 && !validationErrors.some(error => error.field === 'general') && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Please fix the following errors:</h3>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        {validationErrors.filter(error => error.field !== 'general').map((error, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mr-2"></span>
                            {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Form wrapper to prevent accidental submissions */}
              <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); }} noValidate>
              
              {/* Step 1: Founder & Team Info */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-arena-gold" />
                    </div>
                    <h2 className="arena-subtitle text-arena-navy">Tell us about yourself</h2>
                    <p className="text-gray-600">Let's start with some basic information about you and your team.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => updateFormData('fullName', e.target.value)}
                          className={getFieldValidationClass('fullName', 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent')}
                          placeholder="Your full name"
                          required
                        />
                        {isFieldValidating('fullName') && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          </div>
                        )}
                        {!isFieldValidating('fullName') && formData.fullName && !hasFieldError('fullName') && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                      </div>
                      {hasFieldError('fullName') && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                          {getFieldError('fullName')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role/Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => updateFormData('role', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
                          hasFieldError('role') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="CEO, CTO, Founder, etc."
                        required
                      />
                      {hasFieldError('role') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('role')}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          className={getFieldValidationClass('email', 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent')}
                          placeholder="your@email.com"
                          required
                        />
                        {isFieldValidating('email') && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          </div>
                        )}
                        {!isFieldValidating('email') && formData.email && !hasFieldError('email') && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                      </div>
                      {hasFieldError('email') && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                          {getFieldError('email')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
                          hasFieldError('phone') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {hasFieldError('phone') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => updateFormData('linkedin', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
                          hasFieldError('linkedin') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                      {hasFieldError('linkedin') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('linkedin')}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company/Startup Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => updateFormData('companyName', e.target.value)}
                          className={getFieldValidationClass('companyName', 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent')}
                          placeholder="Your company name"
                          required
                          name="companyName"
                        />
                        {isFieldValidating('companyName') && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          </div>
                        )}
                        {!isFieldValidating('companyName') && formData.companyName && !hasFieldError('companyName') && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                      </div>
                      {hasFieldError('companyName') && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                          {getFieldError('companyName')}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => updateFormData('website', e.target.value)}
                          className={getFieldValidationClass('website', 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent')}
                          placeholder="https://yourcompany.com"
                          name="website"
                        />
                        {isFieldValidating('website') && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          </div>
                        )}
                        {!isFieldValidating('website') && formData.website && !hasFieldError('website') && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                      </div>
                      {hasFieldError('website') && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                          {getFieldError('website')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )} 
             {/* Step 2: Startup Snapshot */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-arena-gold" />
                    </div>
                    <h2 className="arena-subtitle text-arena-navy">Your startup snapshot</h2>
                    <p className="text-gray-600">Help us understand your company's current stage and focus.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stage <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.stage}
                          onChange={(e) => updateFormData('stage', e.target.value)}
                          className={getFieldValidationClass('stage', 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent')}
                          required
                          name="stage"
                        >
                          <option value="">Select stage</option>
                          <option value="idea">Idea</option>
                          <option value="pre-seed">Pre-Seed</option>
                          <option value="seed">Seed</option>
                          <option value="series-a">Series A</option>
                        </select>
                        {!isFieldValidating('stage') && formData.stage && !hasFieldError('stage') && (
                          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                      </div>
                      {hasFieldError('stage') && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                          {getFieldError('stage')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => updateFormData('industry', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
                          hasFieldError('industry') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value="">Select industry</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="fintech">Fintech/Insurtech</option>
                        <option value="hi-tech">Hi-Tech</option>
                        <option value="other">Other</option>
                      </select>
                      {hasFieldError('industry') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('industry')}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        One-line description <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.oneLineDescription}
                        onChange={(e) => updateFormData('oneLineDescription', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
                          hasFieldError('oneLineDescription') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Describe your startup in one line (150 chars max)"
                        maxLength={150}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.oneLineDescription.length}/150 characters</p>
                      {hasFieldError('oneLineDescription') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('oneLineDescription')}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Problem you're solving <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.problem}
                        onChange={(e) => updateFormData('problem', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
                          hasFieldError('problem') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="What problem are you solving?"
                        maxLength={300}
                        rows={3}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.problem.length}/300 characters</p>
                      {hasFieldError('problem') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('problem')}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Solution <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.solution}
                        onChange={(e) => updateFormData('solution', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
                          hasFieldError('solution') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="How are you solving it?"
                        maxLength={300}
                        rows={3}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.solution.length}/300 characters</p>
                      {hasFieldError('solution') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('solution')}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current traction <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.traction}
                        onChange={(e) => updateFormData('traction', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
                          hasFieldError('traction') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value="">Select traction stage</option>
                        <option value="mvp">MVP</option>
                        <option value="pilot">Pilot</option>
                        <option value="paying-customers">Paying Customers</option>
                        <option value="scaling">Scaling</option>
                      </select>
                      {hasFieldError('traction') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('traction')}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Revenue (if any)
                      </label>
                      <select
                        value={formData.revenue}
                        onChange={(e) => updateFormData('revenue', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent"
                      >
                        <option value="">Select revenue range</option>
                        <option value="pre-revenue">Pre-revenue</option>
                        <option value="under-100k">&lt;$100k ARR</option>
                        <option value="100k-1m">$100k–$1M ARR</option>
                        <option value="1m-plus">$1M+ ARR</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}       
       {/* Step 3: Pitch Deck */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-arena-gold" />
                    </div>
                    <h2 className="arena-subtitle text-arena-navy">Share your pitch deck</h2>
                    <p className="text-gray-600">This is the fastest way for us to understand your company and consider you for Arena Fund.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-arena-cream p-6 rounded-lg border-l-4 border-arena-gold">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-arena-gold mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-arena-navy mb-2">Pitch Deck Required</h3>
                          <p className="text-sm text-gray-600">
                            Please share your most recent pitch deck. You can either upload a PDF file (up to 25MB) 
                            or provide a link to your deck on Google Drive, Dropbox, Notion, DocSend, etc.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* File Upload Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Deck (PDF, JPEG, PNG)
                        </label>
                        
                        {!formData.deckFile ? (
                          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            hasFieldError('deckFile') 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-300 hover:border-arena-gold'
                          }`}>
                            {fileUploadState.isUploading ? (
                              <div className="space-y-4">
                                <Loader2 className="w-8 h-8 text-arena-gold mx-auto animate-spin" />
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600">Uploading...</p>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-arena-gold h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${fileUploadState.uploadProgress}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500">{fileUploadState.uploadProgress}% complete</p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-2">Drop your file here or click to browse</p>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={handleFileChange}
                                  className="hidden"
                                  id="deck-upload"
                                  disabled={fileUploadState.isUploading}
                                />
                                <label
                                  htmlFor="deck-upload"
                                  className="inline-flex items-center px-4 py-2 bg-arena-gold text-arena-navy rounded-lg hover:bg-arena-gold-dark transition-colors cursor-pointer text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Choose File
                                </label>
                                <p className="text-xs text-gray-500 mt-2">Max file size: 25MB • PDF, JPEG, PNG</p>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="border border-arena-hunter-green bg-arena-abilene-lace rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-green-800">{formData.deckFile.name}</p>
                                  <p className="text-xs text-green-600">
                                    {(formData.deckFile.size / (1024 * 1024)).toFixed(1)} MB • Uploaded successfully
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={removeUploadedFile}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                type="button"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Upload Error Display */}
                        {fileUploadState.uploadError && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-red-800 font-medium">Upload Failed</p>
                                <p className="text-xs text-red-600 mt-1">{fileUploadState.uploadError}</p>
                                <button
                                  type="button"
                                  onClick={() => setFileUploadState(prev => ({ ...prev, uploadError: null }))}
                                  className="text-xs text-red-600 underline hover:text-red-800 mt-1"
                                >
                                  Try again or use the link option below
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Field Validation Error */}
                        {hasFieldError('deckFile') && !fileUploadState.uploadError && (
                          <p className="mt-2 text-sm text-red-600">{getFieldError('deckFile')}</p>
                        )}
                      </div>

                      {/* Link Input Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Or provide a link {formData.deckFile ? '(optional)' : ''}
                        </label>
                        <input
                          type="url"
                          value={formData.deckLink}
                          onChange={(e) => updateFormData('deckLink', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
                            hasFieldError('deckLink') 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                          placeholder="https://drive.google.com/..."
                          disabled={fileUploadState.isUploading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Google Drive, Dropbox, Notion, DocSend, etc.
                        </p>
                        {hasFieldError('deckLink') && (
                          <p className="mt-1 text-sm text-red-600">{getFieldError('deckLink')}</p>
                        )}
                      </div>
                    </div>

                    {/* Fallback Message */}
                    {fileUploadState.uploadError && !formData.deckFile && (
                      <div className="bg-arena-abilene-lace border border-arena-sunrise p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-arena-bright-umber mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-blue-800 font-medium mb-1">Having trouble uploading?</p>
                            <p className="text-blue-700">
                              No worries! You can share your pitch deck using the link option above. 
                              Upload your deck to Google Drive, Dropbox, or any file sharing service and paste the link.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Video Pitch Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Optional: Video pitch link
                      </label>
                      <input
                        type="url"
                        value={formData.videoPitch}
                        onChange={(e) => updateFormData('videoPitch', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
                          hasFieldError('videoPitch') 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="https://loom.com/... or https://youtube.com/..."
                        disabled={fileUploadState.isUploading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Loom, YouTube, or other video platform link
                      </p>
                      {hasFieldError('videoPitch') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('videoPitch')}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Validation & Funding */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-arena-gold" />
                    </div>
                    <h2 className="arena-subtitle text-arena-navy">Validation & funding</h2>
                    <p className="text-gray-600">Tell us about your enterprise engagement and funding needs.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Have you engaged with enterprise or Fortune 500 buyers? <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="enterpriseEngagement"
                            value="yes"
                            checked={formData.enterpriseEngagement === 'yes'}
                            onChange={(e) => updateFormData('enterpriseEngagement', e.target.value)}
                            className="mr-2"
                          />
                          Yes, we have enterprise buyer relationships
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="enterpriseEngagement"
                            value="no"
                            checked={formData.enterpriseEngagement === 'no'}
                            onChange={(e) => updateFormData('enterpriseEngagement', e.target.value)}
                            className="mr-2"
                          />
                          No, not yet
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Key highlights
                      </label>
                      <input
                        type="text"
                        value={formData.keyHighlights}
                        onChange={(e) => updateFormData('keyHighlights', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent"
                        placeholder="e.g., '3 pilots signed', '20k MAU', 'Fortune 500 LOI'"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capital raised so far
                        </label>
                        <select
                          value={formData.capitalRaised}
                          onChange={(e) => updateFormData('capitalRaised', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent"
                        >
                          <option value="">Select amount</option>
                          <option value="none">None</option>
                          <option value="friends-family">Friends & Family</option>
                          <option value="angel">Angel</option>
                          <option value="seed">Seed</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount (optional)
                        </label>
                        <input
                          type="text"
                          value={formData.capitalRaisedAmount}
                          onChange={(e) => updateFormData('capitalRaisedAmount', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent"
                          placeholder="$500k"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capital sought now <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.capitalSought}
                        onChange={(e) => updateFormData('capitalSought', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent"
                        required
                      >
                        <option value="">Select range</option>
                        <option value="under-500k">&lt;$500k</option>
                        <option value="500k-1m">$500k–$1M</option>
                        <option value="1m-3m">$1–3M</option>
                        <option value="3m-plus">$3M+</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}     
         {/* Step 5: Consent & Submit */}
              {currentStep === 5 && (
                <div className="space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-arena-gold" />
                    </div>
                    <h2 className="arena-subtitle text-arena-navy">Review & submit</h2>
                    <p className="text-gray-600">Please review your information and confirm your submission.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Application Summary */}
                    <div className="bg-arena-foggy-pith p-6 rounded-lg">
                      <h3 className="font-semibold text-arena-navy mb-4">Application Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Founder:</span> {formData.fullName}
                        </div>
                        <div>
                          <span className="font-medium">Company:</span> {formData.companyName}
                        </div>
                        <div>
                          <span className="font-medium">Stage:</span> {formData.stage}
                        </div>
                        <div>
                          <span className="font-medium">Industry:</span> {formData.industry}
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium">Description:</span> {formData.oneLineDescription}
                        </div>
                      </div>
                    </div>

                    {/* Consent Checkboxes */}
                    <div className="space-y-4">
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.accuracyConfirm}
                          onChange={(e) => updateFormData('accuracyConfirm', e.target.checked)}
                          className="mt-1"
                          required
                        />
                        <span className="text-sm text-gray-700">
                          I confirm the information provided is accurate to the best of my knowledge.
                        </span>
                      </label>

                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.understandingConfirm}
                          onChange={(e) => updateFormData('understandingConfirm', e.target.checked)}
                          className="mt-1"
                          required
                        />
                        <span className="text-sm text-gray-700">
                          I understand this is an application for consideration, not a guarantee of funding.
                        </span>
                      </label>
                    </div>

                    {/* E-signature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type your full name as e-signature <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.signature}
                        onChange={(e) => updateFormData('signature', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent"
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-arena-abilene-lace border border-arena-sunrise p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-arena-bright-umber mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-blue-800 font-medium mb-1">Privacy & Confidentiality</p>
                          <p className="text-blue-700">
                            Your application and all submitted materials will be kept confidential. 
                            Read our <Link href="/privacy" className="underline">Privacy Policy</Link> for more details.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-arena-navy hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i + 1 <= currentStep ? 'bg-arena-gold' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center px-6 py-3 bg-arena-navy text-white rounded-lg hover:bg-arena-navy-light transition-all font-medium"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* Form Validation Summary */}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Application Status</h4>
                      <div className="space-y-2">
                        {/* Required Fields Check */}
                        <div className="flex items-center text-sm">
                          {formData.fullName && formData.email && formData.companyName && formData.stage && formData.industry ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                          )}
                          <span className={formData.fullName && formData.email && formData.companyName && formData.stage && formData.industry ? 'text-green-700' : 'text-yellow-700'}>
                            Basic Information
                          </span>
                        </div>
                        
                        {/* Pitch Deck Check */}
                        <div className="flex items-center text-sm">
                          {(formData.deckFile || formData.deckLink) ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                          )}
                          <span className={(formData.deckFile || formData.deckLink) ? 'text-green-700' : 'text-yellow-700'}>
                            Pitch Materials
                          </span>
                        </div>
                        
                        {/* Consent Check */}
                        <div className="flex items-center text-sm">
                          {formData.accuracyConfirm && formData.understandingConfirm && formData.signature ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                          )}
                          <span className={formData.accuracyConfirm && formData.understandingConfirm && formData.signature ? 'text-green-700' : 'text-yellow-700'}>
                            Consent & Signature
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || retryState.isRetrying || !formData.accuracyConfirm || !formData.understandingConfirm || !formData.signature}
                      className={`inline-flex items-center px-8 py-3 rounded-lg font-medium transition-all ${
                        isSubmitting || retryState.isRetrying || !formData.accuracyConfirm || !formData.understandingConfirm || !formData.signature
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-arena-gold text-arena-navy hover:bg-arena-gold-dark'
                      }`}
                    >
                      {isSubmitting || retryState.isRetrying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {retryState.isRetrying ? 'Retrying submission...' : 
                           fileUploadState.isUploading ? 'Uploading files...' : 'Submitting application...'}
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}