import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'white';
  speed?: 'slow' | 'normal' | 'fast';
  label?: string;
  showLabel?: boolean;
}

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    className, 
    size = 'md',
    variant = 'default',
    speed = 'normal',
    label = 'Loading...',
    showLabel = false,
    ...props 
  }, ref) => {
    const sizes = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    };

    const variants = {
      default: 'text-gray-600',
      primary: 'text-navy-600',
      secondary: 'text-gray-400',
      white: 'text-white',
    };

    const speeds = {
      slow: 'animate-spin-slow',
      normal: 'animate-spin',
      fast: 'animate-spin-fast',
    };

    const labelSizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };

    return (
      <div 
        className={cn('inline-flex flex-col items-center justify-center', className)} 
        ref={ref} 
        {...props}
      >
        <svg
          className={cn(
            sizes[size],
            variants[variant],
            speeds[speed]
          )}
          fill="none"
          viewBox="0 0 24 24"
          role="status"
          aria-label={label}
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        
        {showLabel && (
          <span className={cn('mt-2 font-medium', labelSizes[size], variants[variant])}>
            {label}
          </span>
        )}
        
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;