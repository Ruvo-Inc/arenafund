import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  striped?: boolean;
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    variant = 'default',
    size = 'md',
    showLabel = false,
    label,
    showPercentage = false,
    animated = false,
    striped = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const baseClasses = 'w-full bg-gray-200 rounded-full overflow-hidden';
    
    const variants = {
      default: 'bg-navy-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
      info: 'bg-navy-500',
    };

    const sizes = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    };

    const labelSizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    return (
      <div className={cn('w-full', className)} ref={ref} {...props}>
        {(showLabel || showPercentage) && (
          <div className="flex justify-between items-center mb-2">
            {showLabel && (
              <span className={cn('font-medium text-gray-700', labelSizes[size])}>
                {label}
              </span>
            )}
            {showPercentage && (
              <span className={cn('font-medium text-gray-600', labelSizes[size])}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        <div className={cn(baseClasses, sizes[size])}>
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out',
              variants[variant],
              striped && 'bg-stripes',
              animated && striped && 'animate-stripes'
            )}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={label || `Progress: ${Math.round(percentage)}%`}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;