'use client';

import React, { forwardRef, ReactElement, cloneElement, useState, useCallback, useMemo, useRef } from 'react';
import { motion, HTMLMotionProps, Variants, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface AnimatedIconProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  icon: LucideIcon | ReactElement;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'contained' | 'outlined' | 'ghost' | 'gradient';
  animation?: 'none' | 'pulse' | 'bounce' | 'spin' | 'scale' | 'rotate' | 'float' | 'wiggle';
  trigger?: 'hover' | 'focus' | 'always' | 'manual';
  color?: string;
  backgroundColor?: string;
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
  interactive?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  performance?: 'high' | 'balanced' | 'battery';
  reducedMotion?: boolean;
}

const AnimatedIcon = forwardRef<HTMLDivElement, AnimatedIconProps>(
  ({ 
    icon,
    size = 'md',
    variant = 'default',
    animation = 'scale',
    trigger = 'hover',
    color,
    backgroundColor,
    loading = false,
    error = false,
    disabled = false,
    interactive = false,
    gradientFrom = 'blue-500',
    gradientTo = 'purple-500',
    performance = 'balanced',
    reducedMotion = false,
    className,
    ...props 
  }, ref) => {
    const [isAnimating, setIsAnimating] = useState(trigger === 'always');
    const iconRef = useRef<HTMLDivElement>(null);
    
    // Motion values for advanced effects
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-50, 50], [10, -10]);
    const rotateY = useTransform(mouseX, [-50, 50], [-10, 10]);

    const sizes = {
      xs: 'w-4 h-4',
      sm: 'w-5 h-5',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-10 h-10',
      '2xl': 'w-12 h-12',
    };

    const containerSizes = {
      xs: 'w-8 h-8',
      sm: 'w-10 h-10',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20',
      '2xl': 'w-24 h-24',
    };

    const variants = {
      default: 'text-slate-600',
      contained: `rounded-full flex items-center justify-center ${backgroundColor ? `bg-${backgroundColor}` : 'bg-slate-100'} text-slate-700`,
      outlined: 'rounded-full flex items-center justify-center border-2 border-slate-300 text-slate-600',
      ghost: 'rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600',
      gradient: `rounded-full flex items-center justify-center bg-gradient-to-br from-${gradientFrom} to-${gradientTo} text-white shadow-lg`,
    };

    const animationVariants = useMemo(() => {
      const baseTransition = performance === 'battery' ? 
        { duration: 0.8, ease: 'easeInOut' as const } : 
        { duration: 0.3, ease: 'easeOut' as const };
      
      if (reducedMotion) {
        return {
          scale: { scale: [1, 1.05, 1], transition: baseTransition },
          none: {},
          pulse: {},
          bounce: {},
          spin: {},
          rotate: {},
          float: {},
          wiggle: {}
        };
      }

      return {
        pulse: {
          scale: [1, 1.1, 1],
          transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' as const }
        },
        bounce: {
          y: [0, -8, 0],
          transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' as const }
        },
        spin: {
          rotate: 360,
          transition: { duration: 2, repeat: Infinity, ease: 'linear' as const }
        },
        scale: {
          scale: [1, 1.2, 1],
          transition: baseTransition
        },
        rotate: {
          rotate: [0, 15, -15, 0],
          transition: { duration: 0.5, ease: 'easeInOut' as const }
        },
        float: {
          y: [0, -4, 0],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }
        },
        wiggle: {
          rotate: [0, 5, -5, 5, -5, 0],
          transition: { duration: 0.5, ease: 'easeInOut' as const }
        },
        none: {}
      };
    }, [performance, reducedMotion]);

    const loadingVariants: Variants = {
      loading: {
        rotate: 360,
        transition: { duration: 1, repeat: Infinity, ease: 'linear' }
      }
    };

    const errorVariants: Variants = {
      error: {
        x: [-2, 2, -2, 2, 0],
        transition: { duration: 0.4, ease: 'easeInOut' }
      }
    };

    const baseClasses = cn(
      'inline-flex items-center justify-center transition-colors duration-200',
      variant !== 'default' && containerSizes[size],
      variants[variant],
      disabled && 'opacity-50 cursor-not-allowed',
      interactive && 'cursor-pointer touch-target',
      error && 'text-red-500',
      className
    );

    const iconClasses = cn(
      sizes[size],
      color && `text-${color}`,
      'flex-shrink-0'
    );

    const handleTrigger = useCallback(() => {
      if (trigger === 'manual' || disabled) return;
      setIsAnimating(true);
      const timeout = performance === 'battery' ? 800 : 1000;
      setTimeout(() => setIsAnimating(false), timeout);
    }, [trigger, disabled, performance]);

    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (!iconRef.current || !interactive || disabled) return;
      
      const rect = iconRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(event.clientX - centerX);
      mouseY.set(event.clientY - centerY);
    }, [interactive, disabled, mouseX, mouseY]);

    const handleMouseLeave = useCallback(() => {
      mouseX.set(0);
      mouseY.set(0);
    }, [mouseX, mouseY]);

    const shouldAnimate = () => {
      if (loading || error || disabled) return false;
      if (trigger === 'always') return true;
      if (trigger === 'manual') return isAnimating;
      return false;
    };

    const getAnimationVariant = () => {
      if (loading) return 'loading';
      if (error) return 'error';
      if (shouldAnimate()) return animation;
      return 'none';
    };

    const renderIcon = () => {
      if (loading) {
        return (
          <motion.div
            className={iconClasses}
            variants={loadingVariants}
            animate="loading"
          >
            <div className="w-full h-full border-2 border-current border-t-transparent rounded-full" />
          </motion.div>
        );
      }

      if (error) {
        return (
          <motion.div
            className={iconClasses}
            variants={errorVariants}
            animate="error"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </motion.div>
        );
      }

      if (React.isValidElement(icon)) {
        return cloneElement(icon, {
          className: cn(iconClasses, (icon.props as any).className),
        } as any);
      }

      const IconComponent = icon as LucideIcon;
      return <IconComponent className={iconClasses} />;
    };

    return (
      <motion.div
        className={baseClasses}
        variants={animationVariants}
        animate={getAnimationVariant()}
        ref={(node) => {
          (iconRef as any).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as any).current = node;
        }}
        onMouseEnter={trigger === 'hover' ? handleTrigger : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onFocus={trigger === 'focus' ? handleTrigger : undefined}
        onClick={interactive ? handleTrigger : undefined}
        whileHover={interactive && !disabled && performance !== 'battery' ? { 
          scale: 1.05
        } : {}}
        whileTap={interactive && !disabled ? { scale: 0.95 } : {}}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        aria-label={interactive ? 'Animated icon button' : undefined}
        aria-disabled={disabled}
        style={{
          transformPerspective: interactive ? 1000 : undefined,
          willChange: performance === 'high' ? 'transform' : undefined,
          rotateX: interactive ? rotateX : undefined,
          rotateY: interactive ? rotateY : undefined
        }}
        {...props}
      >
        {renderIcon()}

        {/* Gradient overlay for enhanced effects */}
        {variant === 'gradient' && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Ripple effect for interactive icons */}
        {interactive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-current opacity-0"
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
            key={isAnimating ? 'animating' : 'idle'}
          />
        )}
      </motion.div>
    );
  }
);

AnimatedIcon.displayName = 'AnimatedIcon';

// Convenience wrapper for common icon patterns
interface IconButtonProps extends Omit<AnimatedIconProps, 'interactive'> {
  onClick?: () => void;
  'aria-label': string;
}

const IconButton = forwardRef<HTMLDivElement, IconButtonProps>(
  ({ onClick, ...props }, ref) => (
    <AnimatedIcon
      ref={ref}
      interactive
      onClick={onClick}
      {...props}
    />
  )
);

IconButton.displayName = 'IconButton';

// Preset animated icons for common use cases
interface PresetIconProps extends Omit<AnimatedIconProps, 'icon' | 'animation'> {
  type: 'loading' | 'success' | 'error' | 'warning' | 'info';
}

const PresetIcon = forwardRef<HTMLDivElement, PresetIconProps>(
  ({ type, ...props }, ref) => {
    const presets = {
      loading: {
        icon: (
          <div className="w-full h-full border-2 border-current border-t-transparent rounded-full" />
        ),
        animation: 'spin' as const,
        trigger: 'always' as const,
      },
      success: {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        ),
        animation: 'scale' as const,
        color: 'green-500',
      },
      error: {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ),
        animation: 'wiggle' as const,
        color: 'red-500',
      },
      warning: {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
        animation: 'pulse' as const,
        color: 'yellow-500',
      },
      info: {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        ),
        animation: 'float' as const,
        color: 'blue-500',
      },
    };

    const preset = presets[type];

    return (
      <AnimatedIcon
        ref={ref}
        {...preset}
        {...props}
      />
    );
  }
);

PresetIcon.displayName = 'PresetIcon';

export { AnimatedIcon, IconButton, PresetIcon };
export default AnimatedIcon;