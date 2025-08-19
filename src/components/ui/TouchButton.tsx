'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useInteractionFeedback, useRippleEffect } from '@/hooks/useInteractionFeedback';
import { useHapticFeedback, useLongPress } from '@/hooks/useGestures';

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success' | 'cta';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  touchFeedback?: 'ripple' | 'press' | 'lift' | 'bounce' | 'pulse' | 'none';
  hapticFeedback?: boolean;
  longPressAction?: () => void;
  longPressDelay?: number;
  swipeActions?: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
  };
}

const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    disabled, 
    leftIcon,
    rightIcon,
    fullWidth,
    touchFeedback = 'press',
    hapticFeedback = false,
    longPressAction,
    longPressDelay = 500,
    swipeActions,
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
    const { triggerImpactHaptic } = useHapticFeedback();

    const { handlers: longPressHandlers } = useLongPress({
      delay: longPressDelay,
      onLongPress: longPressAction,
      onLongPressStart: () => {
        if (hapticFeedback) {
          triggerImpactHaptic('medium');
        }
      },
    });

    const baseClasses = 'btn-touch touch-target relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg overflow-hidden';
    
    const variants = {
      primary: 'btn-touch-primary bg-primary text-white hover:bg-primary-hover active:bg-primary-active focus-visible:ring-ring shadow-sm',
      secondary: 'btn-touch-secondary bg-secondary text-foreground hover:bg-secondary-hover active:bg-secondary-active focus-visible:ring-ring border border-border shadow-sm',
      ghost: 'btn-touch-ghost text-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-ring',
      destructive: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500 shadow-sm',
      success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500 shadow-sm',
      cta: 'cta-enhanced text-white shadow-lg',
    };

    const sizes = {
      sm: 'h-10 px-3 text-sm gap-1.5 min-w-[44px]',
      md: 'h-12 px-4 text-sm gap-2 min-w-[48px]',
      lg: 'h-14 px-6 text-base gap-2 min-w-[56px]',
      xl: 'h-16 px-8 text-lg gap-2.5 min-w-[64px]',
    };

    const touchFeedbackClasses = {
      ripple: 'touch-ripple',
      press: 'touch-press',
      lift: 'touch-lift',
      bounce: 'touch-bounce',
      pulse: 'touch-pulse',
      none: '',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const loadingClass = loading ? 'btn-loading' : '';

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (touchFeedback === 'ripple') {
        createRipple(event);
      }
      
      if (hapticFeedback) {
        triggerImpactHaptic('light');
      }
      
      onClick?.(event);
    };

    const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
      if (touchFeedback === 'ripple') {
        createRipple(event as any);
      }
      
      handlers.onTouchStart();
      longPressHandlers.onTouchStart(event.nativeEvent);
    };

    const handleTouchMove = (event: React.TouchEvent<HTMLButtonElement>) => {
      longPressHandlers.onTouchMove(event.nativeEvent);
    };

    const handleTouchEnd = (event: React.TouchEvent<HTMLButtonElement>) => {
      handlers.onTouchEnd();
      longPressHandlers.onTouchEnd(event.nativeEvent);
    };

    return (
      <button
        className={cn(
          baseClasses, 
          variants[variant], 
          sizes[size], 
          touchFeedbackClasses[touchFeedback],
          widthClass,
          loadingClass,
          state.isPressed && touchFeedback === 'press' && 'transform scale-95',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handlers.onMouseEnter}
        onMouseLeave={handlers.onMouseLeave}
        onFocus={handlers.onFocus}
        onBlur={handlers.onBlur}
        onMouseDown={handlers.onMouseDown}
        onMouseUp={handlers.onMouseUp}
        {...props}
      >
        {/* Ripple Effect */}
        {touchFeedback === 'ripple' && (
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
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span className={loading ? 'invisible' : ''}>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}

        {/* Long Press Indicator */}
        {longPressAction && (
          <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/50 rounded-full opacity-60" />
        )}
      </button>
    );
  }
);

TouchButton.displayName = 'TouchButton';

export default TouchButton;