// src/components/ApplicationProgressIndicator.tsx
/**
 * Advanced progress indicator for application form
 * Shows completion status, validation state, and provides navigation
 */

import React from 'react';
import { CheckCircle, AlertCircle, Clock, FileText, Users, Building2, TrendingUp, Send } from 'lucide-react';
import type { FormData, ValidationError } from '@/types/application';
import { ApplicationService } from '@/lib/application-service';

interface ApplicationProgressIndicatorProps {
  formData: FormData;
  validationErrors: ValidationError[];
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

interface StepConfig {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: (keyof FormData)[];
  description: string;
}

const STEP_CONFIGS: StepConfig[] = [
  {
    id: 1,
    title: 'Founder & Team',
    icon: Users,
    fields: ['fullName', 'role', 'email', 'phone', 'linkedin', 'companyName', 'website'],
    description: 'Basic information about you and your company'
  },
  {
    id: 2,
    title: 'Startup Snapshot',
    icon: Building2,
    fields: ['stage', 'industry', 'oneLineDescription', 'problem', 'solution', 'traction', 'revenue'],
    description: 'Overview of your startup and current status'
  },
  {
    id: 3,
    title: 'Pitch Deck',
    icon: FileText,
    fields: ['deckFile', 'deckLink', 'videoPitch'],
    description: 'Share your pitch materials'
  },
  {
    id: 4,
    title: 'Validation & Funding',
    icon: TrendingUp,
    fields: ['enterpriseEngagement', 'keyHighlights', 'capitalRaised', 'capitalRaisedAmount', 'capitalSought'],
    description: 'Enterprise engagement and funding details'
  },
  {
    id: 5,
    title: 'Review & Submit',
    icon: Send,
    fields: ['accuracyConfirm', 'understandingConfirm', 'signature'],
    description: 'Final review and submission'
  }
];

export function ApplicationProgressIndicator({
  formData,
  validationErrors,
  currentStep,
  totalSteps,
  onStepClick,
  className = ''
}: ApplicationProgressIndicatorProps) {
  const overallCompletion = ApplicationService.getFormCompletionPercentage(formData);
  
  const getStepStatus = (step: StepConfig) => {
    const stepErrors = validationErrors.filter(error => 
      step.fields.includes(error.field as keyof FormData)
    );
    
    const completedFields = step.fields.filter(field => {
      const value = formData[field];
      if (typeof value === 'boolean') return value;
      if (field === 'deckFile' || field === 'deckLink') {
        return formData.deckFile || formData.deckLink.trim();
      }
      return value && String(value).trim();
    });
    
    const completion = (completedFields.length / step.fields.length) * 100;
    
    if (stepErrors.length > 0) return 'error';
    if (completion === 100) return 'complete';
    if (completion > 0) return 'in-progress';
    return 'pending';
  };

  const getStepIcon = (step: StepConfig, status: string) => {
    const IconComponent = step.icon;
    const baseClasses = "w-5 h-5";
    
    switch (status) {
      case 'complete':
        return <CheckCircle className={`${baseClasses} text-green-600`} />;
      case 'error':
        return <AlertCircle className={`${baseClasses} text-red-600`} />;
      case 'in-progress':
        return <Clock className={`${baseClasses} text-blue-600`} />;
      default:
        return <IconComponent className={`${baseClasses} text-gray-400`} />;
    }
  };

  const getStepStyles = (step: StepConfig, status: string, isActive: boolean) => {
    const baseClasses = "relative flex items-center p-4 rounded-lg border-2 transition-all duration-200";
    
    if (isActive) {
      return `${baseClasses} border-arena-gold bg-arena-gold-light shadow-md`;
    }
    
    switch (status) {
      case 'complete':
        return `${baseClasses} border-green-200 bg-green-50 hover:bg-green-100`;
      case 'error':
        return `${baseClasses} border-red-200 bg-red-50 hover:bg-red-100`;
      case 'in-progress':
        return `${baseClasses} border-blue-200 bg-blue-50 hover:bg-blue-100`;
      default:
        return `${baseClasses} border-gray-200 bg-gray-50 hover:bg-gray-100`;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Progress */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Application Progress</h3>
          <span className="text-sm font-medium text-gray-600">{overallCompletion}% Complete</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-arena-gold to-arena-gold-dark h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallCompletion}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Started</span>
          <span>In Progress</span>
          <span>Complete</span>
        </div>
      </div>

      {/* Step Progress */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-900">Steps</h4>
        
        {STEP_CONFIGS.map((step, index) => {
          const status = getStepStatus(step);
          const isActive = currentStep === step.id;
          const isClickable = onStepClick && (status === 'complete' || status === 'in-progress' || isActive);
          
          const stepErrors = validationErrors.filter(error => 
            step.fields.includes(error.field as keyof FormData)
          );
          
          const completedFields = step.fields.filter(field => {
            const value = formData[field];
            if (typeof value === 'boolean') return value;
            if (field === 'deckFile' || field === 'deckLink') {
              return formData.deckFile || formData.deckLink.trim();
            }
            return value && String(value).trim();
          });
          
          const stepCompletion = (completedFields.length / step.fields.length) * 100;
          
          return (
            <div
              key={step.id}
              className={getStepStyles(step, status, isActive)}
              onClick={isClickable ? () => onStepClick!(step.id) : undefined}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
            >
              {/* Step Number/Icon */}
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-current flex items-center justify-center">
                  {getStepIcon(step, status)}
                </div>
              </div>
              
              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-sm font-medium text-gray-900 truncate">
                    {step.title}
                  </h5>
                  <span className="text-xs text-gray-500 ml-2">
                    {Math.round(stepCompletion)}%
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                
                {/* Step Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      status === 'error' ? 'bg-red-500' :
                      status === 'complete' ? 'bg-green-500' :
                      status === 'in-progress' ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`}
                    style={{ width: `${stepCompletion}%` }}
                  />
                </div>
                
                {/* Error Count */}
                {stepErrors.length > 0 && (
                  <div className="mt-2 flex items-center text-xs text-red-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {stepErrors.length} error{stepErrors.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -right-1 -top-1 w-3 h-3 bg-arena-gold rounded-full border-2 border-white" />
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">
              {STEP_CONFIGS.filter(step => getStepStatus(step) === 'complete').length}
            </div>
            <div className="text-xs text-gray-600">Complete</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {STEP_CONFIGS.filter(step => getStepStatus(step) === 'in-progress').length}
            </div>
            <div className="text-xs text-gray-600">In Progress</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600">
              {validationErrors.length}
            </div>
            <div className="text-xs text-gray-600">Errors</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for mobile or sidebar use
 */
export function CompactProgressIndicator({
  formData,
  currentStep,
  totalSteps,
  className = ''
}: Pick<ApplicationProgressIndicatorProps, 'formData' | 'currentStep' | 'totalSteps' | 'className'>) {
  const completion = ApplicationService.getFormCompletionPercentage(formData);
  
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-xs text-gray-500">{completion}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-arena-gold h-2 rounded-full transition-all duration-300"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>
      <div className="text-sm text-gray-600">
        {currentStep}/{totalSteps}
      </div>
    </div>
  );
}