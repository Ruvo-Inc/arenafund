'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useInteractionFeedback, useRippleEffect } from '@/hooks/useInteractionFeedback';

interface InteractiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success' | 'cta';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  ripple?: boolean;
  hapticFeedback?: boolean;
}

const InteractiveButton = forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    disabled, 
    leftIcon,
    rightIcon,
    fullWidth,
    hoverEffect = 'lift',
    ripple = false,
    hapticFeedback = false,
    children,
    onClick,
    ...props 
  }, ref) => {
    const { state, handlers } = useInteractionFeedback({
      disabled: disabled || loading,
      loading,
      hapticFeedback,
    });

    const { ripples, createRipple } = useRippleEffect();

    const baseClasses = 'touch-target relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg overflow-hidden';
    
    const variants = {
      primary: 'btn-primary-interactive bg-primary text-white hover:bg-primary-hover active:bg-primary-active focus-visible:ring-ring shadow-sm',
      secondary: 'btn-secondary-interactive bg-secondary text-foreground hover:bg-secondary-hover active:bg-secondary-active focus-visible:ring-ring border border-border shadow-sm',
      ghost: 'btn-ghost-interactive text-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-ring',
      destructive: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500 shadow-sm',
      success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500 shadow-sm',
      cta: 'cta-enhanced text-white shadow-lg',
    };

    const sizes = {
      xs: 'h-8 px-2.5 text-xs gap-1 min-w-[44px]', // Increased for touch
      sm: 'h-10 px-3 text-sm gap-1.5 min-w-[44px]', // Increased for touch
      md: 'h-12 px-4 text-sm gap-2 min-w-[48px]', // Increased for touch
      lg: 'h-14 px-6 text-base gap-2 min-w-[56px]', // Increased for touch
      xl: 'h-16 px-8 text-lg gap-2.5 min-w-[64px]', // Increased for touch
    };

    const hoverEffects = {
      lift: 'hover-lift',
      scale: 'hover-scale',
      glow: 'hover-glow',
      none: '',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const loadingClass = loading ? 'btn-loading' : '';

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        createRipple(event);
      }
      onClick?.(event);
    };

    return (
      <button
        className={cn(
          baseClasses, 
          variants[variant], 
          sizes[size], 
          hoverEffects[hoverEffect],
          widthClass,
          loadingClass,
          state.isPressed && 'transform scale-95',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        {...handlers}
        {...props}
      >
        {/* Ripple Effect */}
        {ripple && (
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                className="absolute animate-ping rounded-full bg-white/30"
                style={{
                  left: ripple.x - 10,
                  top: ripple.y - 10,
                  width: 20,
                  height: 20,
                }}
              />
            ))}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span className={loading ? 'invisible' : ''}>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

InteractiveButton.displayName = 'InteractiveButton';

export default InteractiveButton;