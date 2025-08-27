'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'cta';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  ripple?: boolean;
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    disabled, 
    leftIcon,
    rightIcon,
    fullWidth,
    ripple = false,
    hoverEffect = 'none',
    children,
    onClick,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const [isPressed, setIsPressed] = useState(false);

    const baseClasses = 'touch-target relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg overflow-hidden';
    
    const variants = {
      primary: 'btn-primary-interactive bg-primary text-white hover:bg-primary-hover active:bg-primary-active focus-visible:ring-ring shadow-sm',
      secondary: 'btn-secondary-interactive bg-secondary text-foreground hover:bg-secondary-hover active:bg-secondary-active focus-visible:ring-ring border border-border shadow-sm',
      outline: 'border border-border bg-background text-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-ring shadow-sm',
      ghost: 'btn-ghost-interactive text-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-ring',
      destructive: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500 shadow-sm',
      success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500 shadow-sm',
      cta: 'cta-enhanced text-white shadow-lg',
    };

    const sizes = {
      xs: 'h-8 px-2.5 text-xs gap-1 min-w-[44px]', // Increased from h-7 for touch
      sm: 'h-10 px-3 text-sm gap-1.5 min-w-[44px]', // Increased from h-8 for touch
      md: 'h-12 px-4 text-sm gap-2 min-w-[48px]', // Increased from h-10 for touch
      lg: 'h-14 px-6 text-base gap-2 min-w-[56px]', // Increased from h-12 for touch
      xl: 'h-16 px-8 text-lg gap-2.5 min-w-[64px]', // Increased from h-14 for touch
    };

    const hoverEffects = {
      lift: 'hover-lift',
      scale: 'hover-scale',
      glow: 'hover-glow',
      none: '',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const loadingClass = loading ? 'btn-loading' : '';

    const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      
      const newRipple: Ripple = {
        id: Date.now(),
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        createRipple(event);
      }
      onClick?.(event);
    };

    const handleMouseDown = () => {
      setIsPressed(true);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const handleMouseLeave = () => {
      setIsPressed(false);
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
          isPressed && 'transform scale-95',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
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

Button.displayName = 'Button';

export default Button;
