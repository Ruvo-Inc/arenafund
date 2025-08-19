import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming' | 'error';
}

interface ProgressStepsProps extends HTMLAttributes<HTMLDivElement> {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'minimal' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  showConnectors?: boolean;
}

const ProgressSteps = forwardRef<HTMLDivElement, ProgressStepsProps>(
  ({ 
    className, 
    steps,
    orientation = 'horizontal',
    variant = 'default',
    size = 'md',
    showConnectors = true,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'flex',
      orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
      className
    );

    const stepSizes = {
      sm: {
        circle: 'w-6 h-6',
        text: 'text-xs',
        title: 'text-sm',
        description: 'text-xs',
        spacing: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4',
      },
      md: {
        circle: 'w-8 h-8',
        text: 'text-sm',
        title: 'text-base',
        description: 'text-sm',
        spacing: orientation === 'horizontal' ? 'space-x-6' : 'space-y-6',
      },
      lg: {
        circle: 'w-10 h-10',
        text: 'text-base',
        title: 'text-lg',
        description: 'text-base',
        spacing: orientation === 'horizontal' ? 'space-x-8' : 'space-y-8',
      },
    };

    const getStepStyles = (status: Step['status']) => {
      switch (status) {
        case 'completed':
          return {
            circle: 'bg-success-500 text-white border-success-500',
            title: 'text-gray-900 font-semibold',
            description: 'text-gray-600',
            connector: 'bg-success-500',
          };
        case 'current':
          return {
            circle: 'bg-navy-500 text-white border-navy-500 ring-4 ring-navy-100',
            title: 'text-navy-700 font-semibold',
            description: 'text-gray-700',
            connector: 'bg-gray-300',
          };
        case 'error':
          return {
            circle: 'bg-error-500 text-white border-error-500',
            title: 'text-error-700 font-semibold',
            description: 'text-gray-600',
            connector: 'bg-gray-300',
          };
        case 'upcoming':
        default:
          return {
            circle: 'bg-white text-gray-400 border-gray-300',
            title: 'text-gray-500',
            description: 'text-gray-400',
            connector: 'bg-gray-300',
          };
      }
    };

    const renderStepIcon = (step: Step, index: number) => {
      const styles = getStepStyles(step.status);
      const sizeClasses = stepSizes[size];
      
      return (
        <div
          className={cn(
            'flex items-center justify-center rounded-full border-2 font-medium transition-all duration-200',
            sizeClasses.circle,
            sizeClasses.text,
            styles.circle
          )}
        >
          {step.status === 'completed' ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : step.status === 'error' ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            index + 1
          )}
        </div>
      );
    };

    const renderConnector = (step: Step, isLast: boolean) => {
      if (!showConnectors || isLast) return null;
      
      const styles = getStepStyles(step.status);
      
      if (orientation === 'horizontal') {
        return (
          <div className="flex-1 mx-4">
            <div className={cn('h-0.5 transition-colors duration-200', styles.connector)} />
          </div>
        );
      } else {
        return (
          <div className="flex justify-center my-2">
            <div className={cn('w-0.5 h-8 transition-colors duration-200', styles.connector)} />
          </div>
        );
      }
    };

    const renderStepContent = (step: Step) => {
      const styles = getStepStyles(step.status);
      const sizeClasses = stepSizes[size];
      
      if (variant === 'minimal') {
        return null;
      }
      
      return (
        <div className={cn(
          'flex flex-col',
          orientation === 'horizontal' ? 'text-center mt-2' : 'ml-4'
        )}>
          <span className={cn('font-medium transition-colors duration-200', sizeClasses.title, styles.title)}>
            {step.title}
          </span>
          {variant === 'detailed' && step.description && (
            <span className={cn('mt-1 transition-colors duration-200', sizeClasses.description, styles.description)}>
              {step.description}
            </span>
          )}
        </div>
      );
    };

    return (
      <div className={baseClasses} ref={ref} {...props}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          
          if (orientation === 'horizontal') {
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {renderStepIcon(step, index)}
                  {renderConnector(step, isLast)}
                </div>
                {renderStepContent(step)}
              </div>
            );
          } else {
            return (
              <div key={step.id} className="flex items-start">
                <div className="flex flex-col items-center">
                  {renderStepIcon(step, index)}
                  {renderConnector(step, isLast)}
                </div>
                {renderStepContent(step)}
              </div>
            );
          }
        })}
      </div>
    );
  }
);

ProgressSteps.displayName = 'ProgressSteps';

export default ProgressSteps;