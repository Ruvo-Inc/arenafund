'use client';

import React, { forwardRef, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { motion, HTMLMotionProps, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useInteractionFeedback, useRippleEffect } from '@/hooks/useInteractionFeedback';
import { usePerformance } from '@/hooks/usePerformance';
import { withErrorBoundary } from './ErrorBoundary';

interface EnhancedButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'cta';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'gradient-shift' | 'magnetic' | 'none';
  ripple?: boolean;
  hapticFeedback?: boolean;
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal';
  priority?: 'high' | 'medium' | 'low';
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
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
    gradientDirection = 'horizontal',
    priority = 'medium',
    children,
    onClick,
    ...props 
  }, ref) => {
    const { 
      config: performanceConfig, 
      startMeasurement, 
      endMeasurement,
      getOptimizedTransition,
      shouldUseAdvancedAnimations 
    } = usePerformance('EnhancedButton');

    const { state, handlers } = useInteractionFeedback({
      disabled: disabled || loading,
      loading,
      hapticFeedback,
    });

    const { ripples, createRipple } = useRippleEffect();
    
    // Advanced motion values for magnetic effect (only in high performance mode)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const magneticX = useTransform(mouseX, [-100, 100], [-8, 8]);
    const magneticY = useTransform(mouseY, [-100, 100], [-8, 8]);

    // Performance monitoring
    useEffect(() => {
      const measurementId = startMeasurement();
      return () => {
        if (measurementId) endMeasurement();
      };
    }, [startMeasurement, endMeasurement]);

    const baseClasses = useMemo(() => 
      'relative inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-xl overflow-hidden touch-target will-change-transform',
      []
    );
    
    const variants = useMemo(() => ({
      primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-700 focus-visible:ring-slate-500 shadow-lg hover:shadow-xl',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400 border border-slate-200 shadow-sm hover:shadow-md',
      outline: 'border-2 border-slate-300 bg-transparent text-slate-700 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-slate-400 shadow-sm hover:shadow-md',
      ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
      gradient: `bg-gradient-to-${gradientDirection === 'horizontal' ? 'r' : gradientDirection === 'vertical' ? 'b' : 'br'} from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 focus-visible:ring-blue-500 shadow-lg hover:shadow-xl`,
      cta: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 focus-visible:ring-blue-500 shadow-xl hover:shadow-2xl border border-blue-500/20',
    }), [gradientDirection]);

    const sizes = {
      sm: 'h-10 px-4 text-sm gap-2 min-w-[44px]',
      md: 'h-12 px-6 text-base gap-2 min-w-[48px]',
      lg: 'h-14 px-8 text-lg gap-3 min-w-[56px]',
      xl: 'h-16 px-10 text-xl gap-3 min-w-[64px]',
    };

    const hoverEffects = {
      lift: 'hover:-translate-y-1',
      scale: 'hover:scale-105',
      glow: 'hover:shadow-2xl hover:shadow-blue-500/25',
      'gradient-shift': variant === 'gradient' || variant === 'cta' ? 'hover:bg-gradient-to-l' : '',
      none: '',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const loadingClass = loading ? 'cursor-not-allowed' : '';

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !loading) {
        createRipple(event);
      }
      onClick?.(event);
    }, [ripple, disabled, loading, createRipple, onClick]);

    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (hoverEffect === 'magnetic' && !disabled && !loading && shouldUseAdvancedAnimations()) {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(event.clientX - centerX);
        mouseY.set(event.clientY - centerY);
      }
    }, [hoverEffect, disabled, loading, mouseX, mouseY, shouldUseAdvancedAnimations]);

    const handleMouseLeave = useCallback(() => {
      if (hoverEffect === 'magnetic') {
        mouseX.set(0);
        mouseY.set(0);
      }
      handlers.onMouseLeave();
    }, [hoverEffect, mouseX, mouseY, handlers]);

    const motionProps = useMemo(() => {
      const baseTransition = getOptimizedTransition({
        type: 'spring',
        stiffness: 400,
        damping: 30,
        mass: 0.8
      });

      const baseProps = {
        whileTap: { scale: 0.98 },
        transition: baseTransition,
      };

      // Only use magnetic effect in high performance mode
      if (hoverEffect === 'magnetic' && shouldUseAdvancedAnimations()) {
        return {
          ...baseProps,
          style: { x: magneticX, y: magneticY },
        };
      }

      // Simplified animations for reduced motion or battery mode
      if (performanceConfig.reducedMotion || performanceConfig.mode === 'battery') {
        return {
          ...baseProps,
          whileHover: hoverEffect === 'scale' ? { scale: 1.02 } : {},
        };
      }

      return {
        ...baseProps,
        whileHover: 
          hoverEffect === 'scale' ? { scale: 1.05 } : 
          hoverEffect === 'lift' ? { y: -2 } : 
          hoverEffect === 'glow' ? { boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' } : {},
      };
    }, [hoverEffect, magneticX, magneticY, getOptimizedTransition, shouldUseAdvancedAnimations, performanceConfig]);

    return (
      <motion.button
        className={cn(
          baseClasses, 
          variants[variant], 
          sizes[size], 
          hoverEffect !== 'magnetic' ? hoverEffects[hoverEffect] : hoverEffects.none,
          widthClass,
          loadingClass,
          state.isPressed && 'transform scale-95',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handlers.onMouseEnter}
        onFocus={handlers.onFocus}
        onBlur={handlers.onBlur}
        onMouseDown={handlers.onMouseDown}
        onMouseUp={handlers.onMouseUp}
        onTouchStart={handlers.onTouchStart}
        onTouchEnd={handlers.onTouchEnd}
        {...motionProps}
        {...props}
      >
        {/* Ripple Effect */}
        {ripple && (
          <div className="absolute inset-0 overflow-hidden rounded-xl">
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

        {/* Gradient Overlay for Enhanced Effects */}
        {(variant === 'gradient' || variant === 'cta') && hoverEffect === 'gradient-shift' && (
          <div className="absolute inset-0 bg-gradient-to-l from-purple-600 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="h-5 w-5 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : (
          <>
            {leftIcon && (
              <motion.span 
                className="flex-shrink-0"
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {leftIcon}
              </motion.span>
            )}
            <span className={loading ? 'invisible' : 'relative z-10'}>{children as ReactNode}</span>
            {rightIcon && (
              <motion.span 
                className="flex-shrink-0 group-hover:translate-x-1 transition-transform"
                initial={{ x: 5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {rightIcon}
              </motion.span>
            )}
          </>
        )}

        {/* Shine Effect for CTA variant */}
        {variant === 'cta' && (
          <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        )}
      </motion.button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

// Export both wrapped and unwrapped versions
export { EnhancedButton };
export default withErrorBoundary(EnhancedButton, {
  fallback: (
    <button className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
      Button Error
    </button>
  ),
});