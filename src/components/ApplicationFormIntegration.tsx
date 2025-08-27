// src/components/ApplicationFormIntegration.tsx
/**
 * Example integration component showing how to use ApplicationService
 * with the existing form structure. This demonstrates the integration
 * patterns for the form submission flow.
 */

import React from 'react';
import { useApplicationSubmission } from '@/hooks/useApplicationSubmission';
import { ApplicationFormError, FormField } from '@/components/ApplicationFormError';
import { ApplicationSubmissionStatus } from '@/components/ApplicationSubmissionStatus';
import type { FormData } from '@/types/application';

interface ApplicationFormIntegrationProps {
  formData: FormData;
  onSubmit: (formData: FormData) => void;
  className?: string;
}

/**
 * Integration wrapper that adds submission handling to existing form
 */
export function ApplicationFormIntegration({ 
  formData, 
  onSubmit, 
  className = '' 
}: ApplicationFormIntegrationProps) {
  const {
    submissionStatus,
    isSubmitting,
    validationErrors,
    submitApplication,
    getFieldError,
    hasFieldError,
    clearErrors
  } = useApplicationSubmission();

  const handleSubmit = async () => {
    clearErrors();
    await submitApplication(formData);
    
    // Call parent onSubmit if submission was successful
    if (submissionStatus.state === 'success') {
      onSubmit(formData);
    }
  };

  return (
    <div className={className}>
      {/* Display validation errors */}
      <ApplicationFormError 
        errors={validationErrors}
        onDismiss={clearErrors}
        className="mb-6"
      />

      {/* Display submission status */}
      <ApplicationSubmissionStatus 
        status={submissionStatus}
        className="mb-6"
      />

      {/* Submit button with loading state */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${
          isSubmitting
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-arena-gold text-arena-navy hover:bg-arena-gold-dark'
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-arena-navy mr-2"></div>
            {submissionStatus.message || 'Submitting...'}
          </div>
        ) : (
          'Submit Application'
        )}
      </button>
    </div>
  );
}

/**
 * Enhanced form input with error handling
 */
interface EnhancedInputProps {
  label: string;
  field: keyof FormData;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  validationErrors: any[];
  className?: string;
}

export function EnhancedFormInput({
  label,
  field,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  maxLength,
  validationErrors,
  className = ''
}: EnhancedInputProps) {
  const hasError = validationErrors.some(error => error.field === field);
  const errorMessage = validationErrors.find(error => error.field === field)?.message;

  return (
    <FormField
      label={label}
      required={required}
      error={errorMessage}
      className={className}
    >
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
          hasError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
        }`}
      />
    </FormField>
  );
}

/**
 * Enhanced textarea with error handling
 */
interface EnhancedTextareaProps {
  label: string;
  field: keyof FormData;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  validationErrors: any[];
  className?: string;
}

export function EnhancedFormTextarea({
  label,
  field,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  rows = 3,
  validationErrors,
  className = ''
}: EnhancedTextareaProps) {
  const hasError = validationErrors.some(error => error.field === field);
  const errorMessage = validationErrors.find(error => error.field === field)?.message;

  return (
    <FormField
      label={label}
      required={required}
      error={errorMessage}
      className={className}
    >
      <div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
            hasError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
          }`}
        />
        {maxLength && (
          <p className="text-xs text-gray-500 mt-1">
            {value.length}/{maxLength} characters
          </p>
        )}
      </div>
    </FormField>
  );
}

/**
 * Enhanced select with error handling
 */
interface EnhancedSelectProps {
  label: string;
  field: keyof FormData;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  validationErrors: any[];
  className?: string;
}

export function EnhancedFormSelect({
  label,
  field,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  validationErrors,
  className = ''
}: EnhancedSelectProps) {
  const hasError = validationErrors.some(error => error.field === field);
  const errorMessage = validationErrors.find(error => error.field === field)?.message;

  return (
    <FormField
      label={label}
      required={required}
      error={errorMessage}
      className={className}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-transparent ${
          hasError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}