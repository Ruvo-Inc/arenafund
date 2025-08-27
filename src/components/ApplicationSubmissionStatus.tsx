// src/components/ApplicationSubmissionStatus.tsx
/**
 * Component for displaying application submission status and progress
 * Shows loading states, progress indicators, and success/error messages
 */

import React from 'react';
import { CheckCircle, AlertCircle, Upload, Send, Loader2 } from 'lucide-react';
import type { SubmissionStatus } from '@/types/application';

interface ApplicationSubmissionStatusProps {
  status: SubmissionStatus;
  className?: string;
}

export function ApplicationSubmissionStatus({ 
  status, 
  className = '' 
}: ApplicationSubmissionStatusProps) {
  const { state, message, progress, applicationId } = status;

  if (state === 'idle') return null;

  return (
    <div className={`rounded-lg p-4 ${className} ${getStatusStyles(state)}`}>
      <div className="flex items-center">
        {getStatusIcon(state)}
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${getTextColor(state)}`}>
              {getStatusTitle(state)}
            </p>
            {state === 'success' && applicationId && (
              <span className="text-xs text-gray-500 font-mono">
                ID: {applicationId}
              </span>
            )}
          </div>
          
          {message && (
            <p className={`text-sm mt-1 ${getMessageColor(state)}`}>
              {message}
            </p>
          )}
          
          {/* Progress bar for upload/submit states */}
          {(state === 'uploading' || state === 'submitting') && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(state)}`}
                  style={{ 
                    width: progress !== undefined ? `${progress}%` : '0%',
                    animation: progress === undefined ? 'pulse 2s infinite' : undefined
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusStyles(state: string): string {
  switch (state) {
    case 'validating':
    case 'uploading':
    case 'submitting':
      return 'bg-blue-50 border border-blue-200';
    case 'success':
      return 'bg-green-50 border border-green-200';
    case 'error':
      return 'bg-red-50 border border-red-200';
    default:
      return 'bg-gray-50 border border-gray-200';
  }
}

function getTextColor(state: string): string {
  switch (state) {
    case 'validating':
    case 'uploading':
    case 'submitting':
      return 'text-blue-800';
    case 'success':
      return 'text-green-800';
    case 'error':
      return 'text-red-800';
    default:
      return 'text-gray-800';
  }
}

function getMessageColor(state: string): string {
  switch (state) {
    case 'validating':
    case 'uploading':
    case 'submitting':
      return 'text-blue-600';
    case 'success':
      return 'text-green-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

function getProgressColor(state: string): string {
  switch (state) {
    case 'uploading':
      return 'bg-blue-500';
    case 'submitting':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

function getStatusIcon(state: string): React.ReactNode {
  const iconClass = "w-5 h-5 flex-shrink-0";
  
  switch (state) {
    case 'validating':
      return <Loader2 className={`${iconClass} text-blue-600 animate-spin`} />;
    case 'uploading':
      return <Upload className={`${iconClass} text-blue-600`} />;
    case 'submitting':
      return <Send className={`${iconClass} text-blue-600`} />;
    case 'success':
      return <CheckCircle className={`${iconClass} text-green-600`} />;
    case 'error':
      return <AlertCircle className={`${iconClass} text-red-600`} />;
    default:
      return <Loader2 className={`${iconClass} text-gray-600`} />;
  }
}

function getStatusTitle(state: string): string {
  switch (state) {
    case 'validating':
      return 'Validating form data...';
    case 'uploading':
      return 'Uploading files...';
    case 'submitting':
      return 'Submitting application...';
    case 'success':
      return 'Application submitted successfully!';
    case 'error':
      return 'Submission failed';
    default:
      return 'Processing...';
  }
}

/**
 * Compact status indicator for inline use
 */
interface CompactStatusProps {
  state: string;
  className?: string;
}

export function CompactSubmissionStatus({ state, className = '' }: CompactStatusProps) {
  if (state === 'idle') return null;

  return (
    <div className={`inline-flex items-center ${className}`}>
      {getStatusIcon(state)}
      <span className={`ml-2 text-sm ${getTextColor(state)}`}>
        {getStatusTitle(state)}
      </span>
    </div>
  );
}