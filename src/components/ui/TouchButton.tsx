'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  ripple?: boolean;
  children: React.ReactNode;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function TouchButton({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth,
  ripple = true,
  children,
  onClick,
  ...props
}: TouchButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = 'touch-target relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg overflow-hidden min-h-[44px] min-w-[44px]';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active focus-visible:ring-ring shadow-sm',
    secondary: 'bg-secondary text-foreground hover:bg-secondary-hover active:bg-secondary-active focus-visible:ring-ring border border-border shadow-sm',
    outline: 'border border-border bg-background text-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-ring shadow-sm',
    ghost: 'text-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-ring',
    destructive: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500 shadow-sm',
    success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500 shadow-sm',
  };

  const sizes = {
    xs: 'h-10 px-3 text-xs gap-1.5 min-w-[44px]',
    sm: 'h-12 px-4 text-sm gap-2 min-w-[48px]',
    md: 'h-14 px-6 text-sm gap-2 min-w-[56px]',
    lg: 'h-16 px-8 text-base gap-2.5 min-w-[64px]',
    xl: 'h-20 px-10 text-lg gap-3 min-w-[80px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const loadingClass = loading ? 'cursor-not-allowed' : '';

  const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    const newRipple: Ripple = {
      id: Date.now(),
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    setRipples(prev => [...prev, newRipple]);

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

  const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    if (ripple) {
      createRipple(event);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <motion.button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        widthClass,
        loadingClass,
        isPressed && 'transform scale-95',
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {/* Ripple Effect */}
      {ripple && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute rounded-full bg-white/30"
                style={{
                  left: ripple.x - 10,
                  top: ripple.y - 10,
                  width: 20,
                  height: 20,
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      {/* Content */}
      <div className={cn('flex items-center gap-2', loading && 'invisible')}>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </div>
    </motion.button>
  );
}