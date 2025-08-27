// src/hooks/useApplicationSubmission.ts
/**
 * React hook for managing application form submission
 * Provides state management and error handling for the application service
 */

import { useState, useCallback } from 'react';
import { ApplicationService } from '@/lib/application-service';
import type { 
  FormData, 
  ValidationError, 
  SubmissionState, 
  SubmissionStatus,
  FileUploadResponse 
} from '@/types/application';

interface UseApplicationSubmissionReturn {
  // State
  submissionStatus: SubmissionStatus;
  isSubmitting: boolean;
  isSuccess: boolean;
  isUploading: boolean;
  error: string | null;
  applicationId: string | null;
  validationErrors: ValidationError[];
  performanceMetrics: Record<string, number>;
  submissionAttempts: number;
  
  // Actions
  submitApplication: (formData: FormData) => Promise<void>;
  uploadFile: (file: File) => Promise<FileUploadResponse>;
  validateForm: (formData: FormData) => ValidationError[];
  clearErrors: () => void;
  reset: () => void;
  resetSubmission: () => void;
  
  // Utilities
  getFieldError: (field: string) => string | null;
  hasFieldError: (field: string) => boolean;
  getFormAnalytics: (formData: FormData) => ReturnType<typeof ApplicationService.generateFormAnalytics>;
  getCompletionPercentage: (formData: FormData) => number;
}

export function useApplicationSubmission(): UseApplicationSubmissionReturn {
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({
    state: 'idle'
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, number>>({});
  const [submissionAttempts, setSubmissionAttempts] = useState(0);

  // Derived state
  const isSubmitting = submissionStatus.state === 'submitting' || submissionStatus.state === 'validating';
  const isUploading = submissionStatus.state === 'uploading';
  const isSuccess = submissionStatus.state === 'success';
  const error = submissionStatus.state === 'error' ? (submissionStatus.message || null) : null;
  const applicationId = submissionStatus.applicationId || null;

  /**
   * Submit application form with comprehensive monitoring
   */
  const submitApplication = useCallback(async (formData: FormData) => {
    const monitor = ApplicationService.createPerformanceMonitor();
    
    try {
      setSubmissionAttempts(prev => prev + 1);
      monitor.mark('submission_start');

      // Start validation
      setSubmissionStatus({ state: 'validating', message: 'Validating form data...' });
      setValidationErrors([]);

      // Spam detection
      const spamCheck = ApplicationService.detectPotentialSpam(formData);
      if (spamCheck.isSpam) {
        setSubmissionStatus({
          state: 'error',
          message: 'Submission blocked due to suspicious content'
        });
        return;
      }

      monitor.mark('validation_start');

      // Client-side validation
      const validation = ApplicationService.validateFormData(formData);
      if (!validation.isValid) {
        monitor.mark('validation_failed');
        setValidationErrors(validation.errors);
        setSubmissionStatus({ 
          state: 'error', 
          message: 'Please fix the validation errors',
          errors: validation.errors
        });
        setPerformanceMetrics(monitor.getMetrics());
        return;
      }

      monitor.mark('validation_complete');

      // Handle file upload if needed
      if (formData.deckFile) {
        setSubmissionStatus({ state: 'uploading', message: 'Uploading pitch deck...', progress: 0 });
        monitor.mark('upload_start');
        
        // Progress simulation for better UX
        const progressInterval = setInterval(() => {
          setSubmissionStatus(prev => ({
            ...prev,
            progress: Math.min((prev.progress || 0) + 10, 90)
          }));
        }, 500);

        // Clear interval after upload
        setTimeout(() => clearInterval(progressInterval), 5000);
      }

      // Submit application
      setSubmissionStatus({ state: 'submitting', message: 'Submitting application...' });
      monitor.mark('api_call_start');
      
      const result = await ApplicationService.submitApplication(formData);
      monitor.mark('api_call_complete');

      if (result.success) {
        monitor.mark('submission_success');
        setSubmissionStatus({ 
          state: 'success', 
          message: 'Application submitted successfully!',
          applicationId: result.id
        });
        setValidationErrors([]);
        
        // Analytics tracking
        const analytics = ApplicationService.generateFormAnalytics(formData, []);
        console.log('Submission analytics:', { ...analytics, performanceMetrics: monitor.getMetrics() });
      } else {
        monitor.mark('submission_failed');
        setValidationErrors(result.validationErrors || []);
        
        // If we have validation errors, don't set a general error message
        const hasValidationErrors = result.validationErrors && result.validationErrors.length > 0;
        const errorMessage = hasValidationErrors ? undefined : (result.error || 'Submission failed');
        
        setSubmissionStatus({ 
          state: 'error', 
          message: errorMessage,
          errors: result.validationErrors
        });
      }

      setPerformanceMetrics(monitor.getMetrics());

    } catch (error) {
      monitor.mark('submission_error');
      console.error('Application submission error:', error);
      setSubmissionStatus({ 
        state: 'error', 
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
      setPerformanceMetrics(monitor.getMetrics());
    }
  }, []);

  /**
   * Upload file independently (for preview/validation)
   */
  const uploadFile = useCallback(async (file: File): Promise<FileUploadResponse> => {
    try {
      setSubmissionStatus({ state: 'uploading', message: 'Uploading file...', progress: 0 });
      
      const result = await ApplicationService.uploadFile(file);
      
      if (result.success) {
        setSubmissionStatus({ state: 'idle' });
      } else {
        setSubmissionStatus({ 
          state: 'error', 
          message: result.error || 'File upload failed'
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'File upload failed';
      setSubmissionStatus({ state: 'error', message: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Validate form without submitting
   */
  const validateForm = useCallback((formData: FormData): ValidationError[] => {
    const validation = ApplicationService.validateFormData(formData);
    setValidationErrors(validation.errors);
    return validation.errors;
  }, []);

  /**
   * Clear validation errors
   */
  const clearErrors = useCallback(() => {
    setValidationErrors([]);
    if (submissionStatus.state === 'error') {
      setSubmissionStatus({ state: 'idle' });
    }
  }, [submissionStatus.state]);

  /**
   * Reset submission state
   */
  const resetSubmission = useCallback(() => {
    setSubmissionStatus({ state: 'idle' });
    setValidationErrors([]);
  }, []);

  /**
   * Reset all state (alias for resetSubmission for test compatibility)
   */
  const reset = resetSubmission;

  /**
   * Get error message for specific field
   */
  const getFieldError = useCallback((field: string): string | null => {
    return ApplicationService.getFieldErrorMessage(field, validationErrors);
  }, [validationErrors]);

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback((field: string): boolean => {
    return ApplicationService.hasFieldError(field, validationErrors);
  }, [validationErrors]);

  /**
   * Get form analytics
   */
  const getFormAnalytics = useCallback((formData: FormData) => {
    return ApplicationService.generateFormAnalytics(formData, validationErrors);
  }, [validationErrors]);

  /**
   * Get form completion percentage
   */
  const getCompletionPercentage = useCallback((formData: FormData) => {
    return ApplicationService.getFormCompletionPercentage(formData);
  }, []);

  return {
    // State
    submissionStatus,
    isSubmitting,
    isSuccess,
    isUploading,
    error,
    applicationId,
    validationErrors,
    performanceMetrics,
    submissionAttempts,
    
    // Actions
    submitApplication,
    uploadFile,
    validateForm,
    clearErrors,
    reset,
    resetSubmission,
    
    // Utilities
    getFieldError,
    hasFieldError,
    getFormAnalytics,
    getCompletionPercentage,
  };
}