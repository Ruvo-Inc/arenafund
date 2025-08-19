'use client';

import React, { forwardRef, ReactNode, useCallback, useMemo, useRef } from 'react';
import { motion, HTMLMotionProps, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useInteractionFeedback } from '@/hooks/useInteractionFeedback';

interface GradientCardProps extends Omit<HTMLMotionProps<'div'>, 'size'> {
  variant?: 'default' | 'elevated' | 'glass' | 'dark' | 'gradient' | 'interactive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'tilt' | 'none';
  clickable?: boolean;
  loading?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
  backgroundPattern?: 'none' | 'dots' | 'grid' | 'waves' | 'noise';
  borderGlow?: boolean;
  parallax?: boolean;
  magneticEffect?: boolean;
  performance?: 'high' | 'balanced' | 'battery';
}

const GradientCard = forwardRef<HTMLDivElement, GradientCardProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md',
    padding = 'md', 
    hover = false,
    hoverEffect = 'lift',
    clickable = false,
    loading = false,
    gradientFrom = 'blue-600',
    gradientTo = 'purple-600',
    gradientDirection = 'diagonal',
    backgroundPattern = 'none',
    borderGlow = false,
    parallax = false,
    magneticEffect = false,
    performance = 'balanced',
    children,
    onClick,
    ...props 
  }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const { state, handlers } = useInteractionFeedback({
      disabled: loading,
      loading,
    });

    // Advanced motion values for 3D effects
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
    const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
    const springConfig = { stiffness: 300, damping: 30 };
    const x = useSpring(useTransform(mouseX, [-300, 300], [-12, 12]), springConfig);
    const y = useSpring(useTransform(mouseY, [-300, 300], [-12, 12]), springConfig);

    const baseClasses = useMemo(() => 
      cn(
        'relative rounded-2xl focus:outline-none overflow-hidden',
        performance === 'high' ? 'will-change-transform' : '',
        'transition-all duration-300'
      ), 
      [performance]
    );
    
    const variants = {
      default: 'bg-white border border-slate-200 shadow-sm',
      elevated: 'bg-white border border-slate-200 shadow-lg',
      glass: 'bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-lg',
      dark: 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-white/10 shadow-xl',
      gradient: `bg-gradient-to-${gradientDirection === 'horizontal' ? 'r' : gradientDirection === 'vertical' ? 'b' : gradientDirection === 'radial' ? 'br' : 'br'} from-${gradientFrom} to-${gradientTo} text-white shadow-xl`,
      interactive: 'bg-white border border-slate-200 shadow-md hover:shadow-xl cursor-pointer touch-target',
    };

    const sizes = {
      sm: 'min-h-[120px]',
      md: 'min-h-[160px]',
      lg: 'min-h-[200px]',
      xl: 'min-h-[240px]',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    const hoverEffects = {
      lift: 'hover:-translate-y-2 hover:shadow-2xl',
      scale: 'hover:scale-105',
      glow: 'hover:shadow-2xl hover:shadow-blue-500/25',
      tilt: 'hover:rotate-1 hover:-translate-y-1',
      none: '',
    };

    const backgroundPatterns = useMemo(() => ({
      none: '',
      dots: 'bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]',
      grid: 'bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]',
      waves: 'bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_50%)]',
      noise: 'bg-[url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")]',
    }), []);

    const hoverClasses = hover ? hoverEffects[hoverEffect] : '';
    const interactiveClasses = clickable ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 touch-target' : '';
    const loadingClass = loading ? 'opacity-60 pointer-events-none' : '';
    const borderGlowClass = borderGlow ? 'ring-1 ring-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : '';

    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || (!magneticEffect && hoverEffect !== 'tilt')) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(event.clientX - centerX);
      mouseY.set(event.clientY - centerY);
    }, [magneticEffect, hoverEffect, mouseX, mouseY]);

    const handleMouseLeave = useCallback(() => {
      mouseX.set(0);
      mouseY.set(0);
      handlers.onMouseLeave();
    }, [mouseX, mouseY, handlers]);

    const motionProps = useMemo(() => {
      const baseProps = {
        whileTap: clickable ? { scale: 0.98 } : {},
        transition: { 
          type: 'spring' as const,
          stiffness: 300,
          damping: 30
        },
      };

      if (magneticEffect) {
        return {
          ...baseProps,
          style: { 
            x: performance === 'high' ? x : 0, 
            y: performance === 'high' ? y : 0,
            rotateX: hoverEffect === 'tilt' ? rotateX : 0,
            rotateY: hoverEffect === 'tilt' ? rotateY : 0,
            transformPerspective: 1000
          },
        };
      }

      return {
        ...baseProps,
        whileHover: 
          hoverEffect === 'scale' ? { scale: 1.02 } : 
          hoverEffect === 'lift' ? { y: -4 } : 
          hoverEffect === 'tilt' ? { rotateX: 5, rotateY: 5 } : 
          hoverEffect === 'glow' ? { boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)' } : {},
      };
    }, [clickable, magneticEffect, performance, x, y, rotateX, rotateY, hoverEffect]);

    return (
      <motion.div
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          paddings[padding],
          hoverClasses,
          interactiveClasses,
          loadingClass,
          borderGlowClass,
          backgroundPattern !== 'none' && backgroundPatterns[backgroundPattern],
          state.isPressed && clickable && 'transform scale-98',
          className
        )}
        ref={(node) => {
          (cardRef as any).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as any).current = node;
        }}
        onClick={clickable ? onClick : undefined}
        onMouseEnter={handlers.onMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onFocus={handlers.onFocus}
        onBlur={handlers.onBlur}
        onMouseDown={clickable ? handlers.onMouseDown : undefined}
        onMouseUp={clickable ? handlers.onMouseUp : undefined}
        onTouchStart={clickable ? handlers.onTouchStart : undefined}
        onTouchEnd={clickable ? handlers.onTouchEnd : undefined}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? 'button' : undefined}
        {...motionProps}
        {...props}
      >
        {/* Background Pattern Overlay */}
        {backgroundPattern !== 'none' && (
          <div className={cn(
            'absolute inset-0 opacity-50',
            backgroundPatterns[backgroundPattern]
          )} />
        )}

        {/* Border Glow Effect */}
        {borderGlow && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm -z-10" />
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl z-20">
            <motion.div 
              className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col">
          {children as ReactNode}
        </div>

        {/* Hover Shine Effect */}
        {(variant === 'gradient' || variant === 'dark') && state.isHovered && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}

        {/* Interactive Indicator */}
        {clickable && state.isHovered && (
          <div className="absolute top-3 right-3 opacity-60">
            <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
          </div>
        )}
      </motion.div>
    );
  }
);

GradientCard.displayName = 'GradientCard';

// Card sub-components for structured content
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, gradient = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-2 pb-4',
        gradient && 'bg-gradient-to-r from-white/10 to-transparent p-4 -m-4 mb-4 rounded-t-2xl',
        className
      )}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  gradient?: boolean;
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', gradient = false, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'text-2xl font-bold leading-tight tracking-tight',
        gradient && 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
        className
      )}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  muted?: boolean;
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, muted = true, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-base leading-relaxed',
        muted ? 'text-slate-600' : 'text-current',
        className
      )}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  centered?: boolean;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, centered = false, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'flex-1',
        centered && 'flex items-center justify-center text-center',
        className
      )} 
      {...props} 
    />
  )
);

CardContent.displayName = 'CardContent';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between';
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, justify = 'start', ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center pt-4 gap-3',
          justifyClasses[justify],
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { 
  GradientCard, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
};

export default GradientCard;