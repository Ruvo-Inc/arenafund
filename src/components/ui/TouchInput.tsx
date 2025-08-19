'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef, ReactNode, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useInteractionFeedback, useFieldFeedback } from '@/hooks/useInteractionFeedback';
import { useHapticFeedback } from '@/hooks/useGestures';

interface TouchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
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
  hapticFeedback?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

const TouchInput = forwardRef<HTMLInputElement, TouchInputProps>(
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
    hapticFeedback = false,
    clearable = false,
    disabled,
    value,
    onFocus,
    onBlur,
    onChange,
    onClear,
    ...props 
  }, ref) => {
    const [hasValue, setHasValue] = useState(Boolean(value));
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const { state, handlers } = useInteractionFeedback({
      disabled: disabled || loading,
      loading,
      hapticFeedback,
    });

    const { triggerSelectionHaptic } = useHapticFeedback();

    const sizes = {
      sm: 'h-10 px-3 text-sm min-h-[44px]',
      md: 'h-12 px-4 text-base min-h-[48px]',
      lg: 'h-14 px-5 text-lg min-h-[56px]',
    };

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    const baseInputClasses = 'form-input-touch block w-full rounded-lg border bg-input text-foreground placeholder-muted-foreground shadow-sm transition-all focus:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50';

    const getInputClasses = () => {
      let classes = baseInputClasses;
      
      if (error) {
        classes += ' border-error-500 focus:border-error-500 focus:ring-error-500 feedback-error';
      } else if (success) {
        classes += ' border-success-500 focus:border-success-500 focus:ring-success-500 feedback-success';
      } else if (isFocused) {
        classes += ' border-primary focus:border-primary focus:ring-primary';
      } else {
        classes += ' border-border hover:border-border-strong';
      }

      return classes;
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (hapticFeedback) {
        triggerSelectionHaptic();
      }
      handlers.onFocus();
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      handlers.onBlur();
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      onChange?.(e);
    };

    const handleClear = () => {
      setHasValue(false);
      if (hapticFeedback) {
        triggerSelectionHaptic();
      }
      onClear?.();
    };

    const renderFloatingLabel = () => {
      if (variant !== 'floating' || !label) return null;
      
      return (
        <label
          htmlFor={inputId}
          className={cn(
            'floating-label absolute left-4 transition-all duration-200 pointer-events-none bg-input px-1',
            (isFocused || hasValue) 
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
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      );
    };

    const renderFeedback = () => {
      if (!showFeedback) return null;

      if (error) {
        return <p className="text-sm text-error-600 mt-2">{error}</p>;
      }
      
      if (success && !error) {
        return <p className="text-sm text-success-600 mt-2">✓ Looks good!</p>;
      }
      
      if (helperText && !error && !success) {
        return <p className="text-sm text-muted-foreground mt-2">{helperText}</p>;
      }

      return null;
    };

    return (
      <div className="space-y-1">
        {renderStandardLabel()}
        
        <div className={cn(
          'relative touch-target',
          variant === 'floating' && 'input-floating'
        )}>
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <span className={cn(
                'text-muted-foreground transition-colors',
                iconSizes[size],
                isFocused && 'text-primary'
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
              leftIcon && 'pl-12',
              (rightIcon || loading || clearable) && 'pr-12',
              sizes[size],
              className
            )}
            disabled={disabled || loading}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            onTouchStart={handlers.onTouchStart}
            onTouchEnd={handlers.onTouchEnd}
            {...props}
          />

          {/* Floating Label */}
          {renderFloatingLabel()}

          {/* Right Icons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 space-x-2">
            {clearable && hasValue && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="touch-target-sm text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {loading && (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
            
            {rightIcon && !loading && (
              <span className={cn(
                'text-muted-foreground transition-colors pointer-events-none',
                iconSizes[size],
                isFocused && 'text-primary'
              )}>
                {rightIcon}
              </span>
            )}
          </div>

          {/* Focus Ring Enhancement */}
          {isFocused && (
            <div className="absolute inset-0 rounded-lg ring-2 ring-primary/20 ring-offset-2 pointer-events-none" />
          )}
        </div>

        {renderFeedback()}
      </div>
    );
  }
);

TouchInput.displayName = 'TouchInput';

interface TouchTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  success?: boolean;
  showFeedback?: boolean;
  hapticFeedback?: boolean;
  resizable?: boolean;
}

const TouchTextarea = forwardRef<HTMLTextAreaElement, TouchTextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    id, 
    size = 'md',
    loading = false,
    success = false,
    showFeedback = true,
    hapticFeedback = false,
    resizable = true,
    disabled,
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const { triggerSelectionHaptic } = useHapticFeedback();

    const sizes = {
      sm: 'min-h-[80px] p-3 text-sm',
      md: 'min-h-[100px] p-4 text-base',
      lg: 'min-h-[120px] p-5 text-lg',
    };

    const baseClasses = 'form-input-touch block w-full rounded-lg border bg-input text-foreground placeholder-muted-foreground shadow-sm transition-all focus:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50';

    const getTextareaClasses = () => {
      let classes = baseClasses;
      
      if (error) {
        classes += ' border-error-500 focus:border-error-500 focus:ring-error-500 feedback-error';
      } else if (success) {
        classes += ' border-success-500 focus:border-success-500 focus:ring-success-500 feedback-success';
      } else if (isFocused) {
        classes += ' border-primary focus:border-primary focus:ring-primary';
      } else {
        classes += ' border-border hover:border-border-strong';
      }

      if (!resizable) {
        classes += ' resize-none';
      }

      return classes;
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      if (hapticFeedback) {
        triggerSelectionHaptic();
      }
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        
        <div className="relative touch-target">
          <textarea
            id={inputId}
            ref={ref}
            className={cn(
              getTextareaClasses(),
              sizes[size],
              className
            )}
            disabled={disabled || loading}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {/* Loading Indicator */}
          {loading && (
            <div className="absolute top-3 right-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {/* Focus Ring Enhancement */}
          {isFocused && (
            <div className="absolute inset-0 rounded-lg ring-2 ring-primary/20 ring-offset-2 pointer-events-none" />
          )}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <>
            {error && <p className="text-sm text-error-600 mt-2">{error}</p>}
            {success && !error && <p className="text-sm text-success-600 mt-2">✓ Looks good!</p>}
            {helperText && !error && !success && <p className="text-sm text-muted-foreground mt-2">{helperText}</p>}
          </>
        )}
      </div>
    );
  }
);

TouchTextarea.displayName = 'TouchTextarea';

interface TouchSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  success?: boolean;
  showFeedback?: boolean;
  hapticFeedback?: boolean;
  placeholder?: string;
}

const TouchSelect = forwardRef<HTMLSelectElement, TouchSelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    id, 
    size = 'md',
    loading = false,
    success = false,
    showFeedback = true,
    hapticFeedback = false,
    placeholder,
    disabled,
    onFocus,
    onBlur,
    onChange,
    children,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const { triggerSelectionHaptic } = useHapticFeedback();

    const sizes = {
      sm: 'h-10 px-3 text-sm min-h-[44px]',
      md: 'h-12 px-4 text-base min-h-[48px]',
      lg: 'h-14 px-5 text-lg min-h-[56px]',
    };

    const baseClasses = 'select-touch block w-full rounded-lg border bg-input text-foreground shadow-sm transition-all focus:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 appearance-none';

    const getSelectClasses = () => {
      let classes = baseClasses;
      
      if (error) {
        classes += ' border-error-500 focus:border-error-500 focus:ring-error-500 feedback-error';
      } else if (success) {
        classes += ' border-success-500 focus:border-success-500 focus:ring-success-500 feedback-success';
      } else if (isFocused) {
        classes += ' border-primary focus:border-primary focus:ring-primary';
      } else {
        classes += ' border-border hover:border-border-strong';
      }

      return classes;
    };

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(true);
      if (hapticFeedback) {
        triggerSelectionHaptic();
      }
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (hapticFeedback) {
        triggerSelectionHaptic();
      }
      onChange?.(e);
    };

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        
        <div className="relative touch-target">
          <select
            id={inputId}
            ref={ref}
            className={cn(
              getSelectClasses(),
              sizes[size],
              'pr-10', // Space for dropdown arrow
              className
            )}
            disabled={disabled || loading}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>

          {/* Dropdown Arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>

          {/* Focus Ring Enhancement */}
          {isFocused && (
            <div className="absolute inset-0 rounded-lg ring-2 ring-primary/20 ring-offset-2 pointer-events-none" />
          )}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <>
            {error && <p className="text-sm text-error-600 mt-2">{error}</p>}
            {success && !error && <p className="text-sm text-success-600 mt-2">✓ Looks good!</p>}
            {helperText && !error && !success && <p className="text-sm text-muted-foreground mt-2">{helperText}</p>}
          </>
        )}
      </div>
    );
  }
);

TouchSelect.displayName = 'TouchSelect';

export { TouchInput, TouchTextarea, TouchSelect };