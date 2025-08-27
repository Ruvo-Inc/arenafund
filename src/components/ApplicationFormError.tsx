// src/components/ApplicationFormError.tsx
/**
 * Component for displaying application form validation errors
 * Provides consistent error messaging and styling
 */

import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import type { ValidationError } from '@/types/application';

interface ApplicationFormErrorProps {
  errors: ValidationError[];
  onDismiss?: () => void;
  className?: string;
}

interface FieldErrorProps {
  error: string | null;
  className?: string;
}

/**
 * Display validation errors in a summary format
 */
export function ApplicationFormError({ 
  errors, 
  onDismiss, 
  className = '' 
}: ApplicationFormErrorProps) {
  if (errors.length === 0) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={`${error.field}-${index}`} className="flex items-start">
                <span className="inline-block w-1 h-1 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                <span>{error.message}</span>
              </li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Dismiss errors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Display error for a specific field
 */
export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div className={`flex items-center mt-1 text-sm text-red-600 ${className}`}>
      <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

/**
 * Higher-order component to add error styling to form inputs
 */
interface WithErrorStylesProps {
  hasError?: boolean;
  children: React.ReactElement;
}

export function WithErrorStyles({ hasError, children }: WithErrorStylesProps) {
  if (!hasError) return children;

  const childProps = children.props as any;
  return React.cloneElement(children, {
    ...childProps,
    className: `${childProps.className || ''} border-red-300 focus:ring-red-500 focus:border-red-500`.trim()
  } as any);
}

/**
 * Form field wrapper with error handling
 */
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactElement;
  className?: string;
}

export function FormField({ 
  label, 
  required = false, 
  error, 
  children, 
  className = '' 
}: FormFieldProps) {
  const hasError = !!error;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <WithErrorStyles hasError={hasError}>
        {children}
      </WithErrorStyles>
      <FieldError error={error || null} />
    </div>
  );
}