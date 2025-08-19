'use client';

import { InputHTMLAttributes, forwardRef, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { useInteractionFeedback, useFieldFeedback } from '@/hooks/useInteractionFeedback';

interface InteractiveInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating' | 'minimal';
  loading?: boolean;
  success?: boolean;
  showFeedback?: boolean;
}

const InteractiveInput = forwardRef<HTMLInputElement, InteractiveInputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    id, 
    leftIcon, 
    rightIcon, 
    size = 'md',
    variant = 'default',
    loading = false,
    success = false,
    showFeedback = true,
    disabled,
    onFocus,
    onBlur,
    onChange,
    ...props 
  }, ref) => {
    const [hasValue, setHasValue] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const { state, handlers } = useInteractionFeedback({
      disabled: disabled || loading,
      loading,
    });

    const { feedback } = useFieldFeedback();

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

    const baseInputClasses = 'input-interactive touch-target block w-full rounded-lg border bg-input text-foreground placeholder-muted-foreground shadow-sm transition-all focus:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50';

    const getInputClasses = () => {
      let classes = baseInputClasses;
      
      if (error) {
        classes += ' border-error-500 focus:border-error-500 focus:ring-error-500 feedback-error';
      } else if (success) {
        classes += ' border-success-500 focus:border-success-500 focus:ring-success-500 feedback-success';
      } else if (state.isFocused) {
        classes += ' border-primary focus:border-primary focus:ring-primary';
      } else {
        classes += ' border-border hover:border-border-strong';
      }

      return classes;
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      handlers.onFocus();
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      handlers.onBlur();
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      onChange?.(e);
    };

    const renderFloatingLabel = () => {
      if (variant !== 'floating' || !label) return null;
      
      return (
        <label
          htmlFor={inputId}
          className={cn(
            'floating-label absolute left-3 transition-all duration-200 pointer-events-none bg-input px-1',
            (state.isFocused || hasValue) 
              ? 'top-0 -translate-y-1/2 text-xs text-primary' 
              : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground'
          )}
        >
          {label}
        </label>
      );
    };

    const renderStandardLabel = () => {
      if (variant === 'floating' || !label) return null;
      
      return (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      );
    };

    const renderFeedback = () => {
      if (!showFeedback) return null;

      if (error) {
        return <p className="text-sm text-error-600 mt-1">{error}</p>;
      }
      
      if (success && !error) {
        return <p className="text-sm text-success-600 mt-1">✓ Looks good!</p>;
      }
      
      if (helperText && !error && !success) {
        return <p className="text-sm text-muted-foreground mt-1">{helperText}</p>;
      }

      return null;
    };

    return (
      <div className="space-y-1">
        {renderStandardLabel()}
        
        <div className={cn(
          'relative',
          variant === 'floating' && 'input-floating'
        )}>
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className={cn(
                'text-muted-foreground transition-colors',
                iconSizes[size],
                state.isFocused && 'text-primary'
              )}>
                {leftIcon}
              </span>
            </div>
          )}

          {/* Input Field */}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              getInputClasses(),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              loading && 'pr-10',
              sizes[size],
              className
            )}
            disabled={disabled || loading}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            onMouseEnter={handlers.onMouseEnter}
            onMouseLeave={handlers.onMouseLeave}
            {...props}
          />

          {/* Floating Label */}
          {renderFloatingLabel()}

          {/* Right Icon or Loading Spinner */}
          {(rightIcon || loading) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <span className={cn(
                  'text-muted-foreground transition-colors pointer-events-none',
                  iconSizes[size],
                  state.isFocused && 'text-primary'
                )}>
                  {rightIcon}
                </span>
              )}
            </div>
          )}

          {/* Focus Ring Enhancement */}
          {state.isFocused && (
            <div className="absolute inset-0 rounded-lg ring-2 ring-primary/20 ring-offset-2 pointer-events-none" />
          )}
        </div>

        {renderFeedback()}
      </div>
    );
  }
);

InteractiveInput.displayName = 'InteractiveInput';

export default InteractiveInput;