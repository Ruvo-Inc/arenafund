import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  error?: boolean;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  label?: string;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    variant = 'default',
    inputSize = 'md',
    error = false,
    success = false,
    leftIcon,
    rightIcon,
    helperText,
    label,
    required = false,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = [
      'w-full transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-muted-foreground'
    ];

    const variants = {
      default: [
        'border border-border bg-background',
        'focus:border-ring focus:ring-ring/20',
        error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
        success && 'border-success-500 focus:border-success-500 focus:ring-success-500/20'
      ],
      filled: [
        'border-0 bg-surface-muted',
        'focus:bg-background focus:ring-ring/20',
        error && 'bg-error-50 focus:ring-error-500/20',
        success && 'bg-success-50 focus:ring-success-500/20'
      ],
      outlined: [
        'border-2 border-border bg-transparent',
        'focus:border-ring focus:ring-ring/10',
        error && 'border-error-500 focus:border-error-500 focus:ring-error-500/10',
        success && 'border-success-500 focus:border-success-500 focus:ring-success-500/10'
      ]
    };

    const sizes = {
      sm: 'h-10 px-3 text-base rounded-md min-h-[44px]', // Increased for mobile touch targets
      md: 'h-12 px-4 text-base rounded-lg min-h-[48px]', // Increased for mobile touch targets
      lg: 'h-14 px-6 text-base rounded-lg min-h-[56px]'  // Increased for mobile touch targets
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
              iconSizes[inputSize]
            )}>
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            id={inputId}
            className={cn(
              baseClasses,
              variants[variant],
              sizes[inputSize],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              // Mobile optimizations
              'touch-manipulation', // Improves touch responsiveness
              'text-base', // Prevents zoom on iOS
              className
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground',
              iconSizes[inputSize]
            )}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {helperText && (
          <p className={cn(
            'text-xs',
            error && 'text-error-500',
            success && 'text-success-500',
            !error && !success && 'text-muted-foreground'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
