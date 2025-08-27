import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  variant = 'default',
  showLabel = false,
  label = 'Loading...',
  className 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const variantClasses = {
    default: 'border-gray-300 border-t-blue-600',
    primary: 'border-gray-300 border-t-primary',
    secondary: 'border-gray-300 border-t-secondary',
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className={cn(
          'animate-spin rounded-full border-2',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        role="status"
        aria-label={label}
      >
        <span className="sr-only">{label}</span>
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600">{label}</span>
      )}
    </div>
  );
};