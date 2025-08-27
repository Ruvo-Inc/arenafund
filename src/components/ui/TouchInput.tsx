'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef, ReactNode, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useInteractionFeedback, useFieldFeedback } from '@/hooks/useInteractionFeedback';

interface TouchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  loading?: boolean;
  hapticFeedback?: boolean;
}

const TouchInput = forwardRef<HTMLInputElement, TouchInputProps>(
  ({ 
    className,
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    size = 'md',
    variant = 'default',
    loading = false,
    disabled,
    hapticFeedback = false,
    id,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const { state, handlers } = useInteractionFeedback({
      disabled: disabled || loading,
      loading,
      hapticFeedback,
    });

    const { fieldState, setValid, setDirty, setTouched } = useFieldFeedback();

    // Touch-optimized sizes with minimum 44px height
    const sizes = {
      sm: 'h-11 px-3 text-sm', // 44px minimum
      md: 'h-12 px-4 text-base', // 48px comfortable
      lg: 'h-14 px-5 text-lg', // 56px large
    };

    const variants = {
      default: 'border border-border bg-background',
      filled: 'border-0 bg-muted',
      outlined: 'border-2 border-border bg-transparent',
    };

    const focusStyles = isFocused ? 'ring-2 ring-ring ring-offset-2' : '';
    const errorStyles = error ? 'border-destructive ring-destructive' : '';

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            className={cn(
              'w-full rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed touch-target',
              sizes[size],
              variants[variant],
              focusStyles,
              errorStyles,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              loading && 'cursor-wait',
              className
            )}
            ref={ref}
            disabled={disabled || loading}
            {...handlers}
            {...props}
            onFocus={(e) => {
              setIsFocused(true);
              setTouched();
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setDirty();
              props.onChange?.(e);
            }}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
          
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          )}
        </div>
        
        {(error || hint) && (
          <div className="text-sm">
            {error ? (
              <p className="text-destructive">{error}</p>
            ) : hint ? (
              <p className="text-muted-foreground">{hint}</p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

TouchInput.displayName = 'TouchInput';

interface TouchTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  loading?: boolean;
  hapticFeedback?: boolean;
  autoResize?: boolean;
}

const TouchTextarea = forwardRef<HTMLTextAreaElement, TouchTextareaProps>(
  ({ 
    className,
    label,
    error,
    hint,
    size = 'md',
    variant = 'default',
    loading = false,
    disabled,
    hapticFeedback = false,
    autoResize = false,
    id,
    rows = 4,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const { state, handlers } = useInteractionFeedback({
      disabled: disabled || loading,
      loading,
      hapticFeedback,
    });

    const sizes = {
      sm: 'p-3 text-sm min-h-[88px]', // 2 lines minimum
      md: 'p-4 text-base min-h-[96px]', // 2 lines minimum
      lg: 'p-5 text-lg min-h-[112px]', // 2 lines minimum
    };

    const variants = {
      default: 'border border-border bg-background',
      filled: 'border-0 bg-muted',
      outlined: 'border-2 border-border bg-transparent',
    };

    const focusStyles = isFocused ? 'ring-2 ring-ring ring-offset-2' : '';
    const errorStyles = error ? 'border-destructive ring-destructive' : '';

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
      props.onChange?.(e);
    };

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <textarea
            id={inputId}
            rows={rows}
            className={cn(
              'w-full rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none touch-target',
              sizes[size],
              variants[variant],
              focusStyles,
              errorStyles,
              loading && 'cursor-wait',
              className
            )}
            ref={(node) => {
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
              (textareaRef as any).current = node;
            }}
            disabled={disabled || loading}
            {...handlers}
            {...props}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={handleInput}
          />
          
          {loading && (
            <div className="absolute right-3 top-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          )}
        </div>
        
        {(error || hint) && (
          <div className="text-sm">
            {error ? (
              <p className="text-destructive">{error}</p>
            ) : hint ? (
              <p className="text-muted-foreground">{hint}</p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

TouchTextarea.displayName = 'TouchTextarea';

interface TouchSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  loading?: boolean;
  hapticFeedback?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

const TouchSelect = forwardRef<HTMLSelectElement, TouchSelectProps>(
  ({ 
    className,
    label,
    error,
    hint,
    size = 'md',
    variant = 'default',
    loading = false,
    disabled,
    hapticFeedback = false,
    options,
    id,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const { state, handlers } = useInteractionFeedback({
      disabled: disabled || loading,
      loading,
      hapticFeedback,
    });

    // Touch-optimized sizes with minimum 44px height
    const sizes = {
      sm: 'h-11 px-3 text-sm', // 44px minimum
      md: 'h-12 px-4 text-base', // 48px comfortable
      lg: 'h-14 px-5 text-lg', // 56px large
    };

    const variants = {
      default: 'border border-border bg-background',
      filled: 'border-0 bg-muted',
      outlined: 'border-2 border-border bg-transparent',
    };

    const focusStyles = isFocused ? 'ring-2 ring-ring ring-offset-2' : '';
    const errorStyles = error ? 'border-destructive ring-destructive' : '';

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            id={inputId}
            className={cn(
              'w-full rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none touch-target',
              sizes[size],
              variants[variant],
              focusStyles,
              errorStyles,
              loading && 'cursor-wait',
              'pr-10', // Space for dropdown arrow
              className
            )}
            ref={ref}
            disabled={disabled || loading}
            {...handlers}
            {...props}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
          >
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Dropdown Arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {loading && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          )}
        </div>
        
        {(error || hint) && (
          <div className="text-sm">
            {error ? (
              <p className="text-destructive">{error}</p>
            ) : hint ? (
              <p className="text-muted-foreground">{hint}</p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

TouchSelect.displayName = 'TouchSelect';

export { TouchInput, TouchTextarea, TouchSelect };