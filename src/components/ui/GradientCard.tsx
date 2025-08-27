'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'custom';
  customGradient?: string;
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const gradients = {
  primary: 'from-primary/10 via-primary/5 to-transparent',
  secondary: 'from-secondary/10 via-secondary/5 to-transparent',
  success: 'from-success/10 via-success/5 to-transparent',
  warning: 'from-warning/10 via-warning/5 to-transparent',
  error: 'from-error/10 via-error/5 to-transparent',
  custom: '',
};

const hoverEffects = {
  lift: 'hover:-translate-y-1 hover:shadow-lg',
  scale: 'hover:scale-105',
  glow: 'hover:shadow-lg hover:shadow-primary/25',
  none: '',
};

const paddingSizes = {
  none: '',
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
};

const roundedSizes = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export function GradientCard({
  children,
  className,
  gradient = 'primary',
  customGradient,
  hoverEffect = 'none',
  padding = 'md',
  rounded = 'lg',
  ...props
}: GradientCardProps) {
  const gradientClass = gradient === 'custom' && customGradient 
    ? customGradient 
    : gradients[gradient];

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm',
        'bg-gradient-to-br',
        gradientClass,
        hoverEffects[hoverEffect],
        paddingSizes[padding],
        roundedSizes[rounded],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, as: Component = 'h3' }: CardTitleProps) {
  return (
    <Component className={cn('text-lg font-semibold text-foreground mb-2', className)}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-6 pt-4 border-t border-border/50', className)}>
      {children}
    </div>
  );
}

// Default export for convenience
export default GradientCard;
