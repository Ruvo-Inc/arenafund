import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, leftIcon, rightIcon, size = 'md', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const sizes = {
      sm: 'h-10 px-3 text-sm min-h-[44px]', // Increased for touch
      md: 'h-12 px-4 text-base min-h-[48px]', // Increased for touch
      lg: 'h-14 px-5 text-lg min-h-[56px]', // Increased for touch
    };

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className={cn('text-muted-foreground', iconSizes[size])}>
                {leftIcon}
              </span>
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'touch-target block w-full rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground shadow-sm transition-colors',
              'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50',
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              sizes[size],
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className={cn('text-muted-foreground', iconSizes[size])}>
                {rightIcon}
              </span>
            </div>
          )}
        </div>
        {error && <p className="text-sm text-error-600">{error}</p>}
        {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
