import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'inactive';
  variant?: 'dot' | 'badge' | 'pill' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showLabel?: boolean;
  pulse?: boolean;
}

const StatusIndicator = forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ 
    className, 
    status, 
    variant = 'dot', 
    size = 'md', 
    label,
    showLabel = false,
    pulse = false,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center transition-all duration-200';
    
    const statusColors = {
      success: {
        bg: 'bg-success-500',
        text: 'text-success-700',
        border: 'border-success-300',
        lightBg: 'bg-success-50',
      },
      warning: {
        bg: 'bg-warning-500',
        text: 'text-warning-700',
        border: 'border-warning-300',
        lightBg: 'bg-warning-50',
      },
      error: {
        bg: 'bg-error-500',
        text: 'text-error-700',
        border: 'border-error-300',
        lightBg: 'bg-error-50',
      },
      info: {
        bg: 'bg-navy-500',
        text: 'text-navy-700',
        border: 'border-navy-300',
        lightBg: 'bg-navy-50',
      },
      pending: {
        bg: 'bg-gray-400',
        text: 'text-gray-600',
        border: 'border-gray-300',
        lightBg: 'bg-gray-50',
      },
      inactive: {
        bg: 'bg-gray-300',
        text: 'text-gray-500',
        border: 'border-gray-200',
        lightBg: 'bg-gray-25',
      },
    };

    const sizes = {
      sm: {
        dot: 'w-2 h-2',
        badge: 'w-4 h-4',
        pill: 'px-2 py-0.5 text-xs',
        icon: 'w-4 h-4',
        gap: 'gap-1.5',
        text: 'text-xs',
      },
      md: {
        dot: 'w-3 h-3',
        badge: 'w-5 h-5',
        pill: 'px-2.5 py-1 text-sm',
        icon: 'w-5 h-5',
        gap: 'gap-2',
        text: 'text-sm',
      },
      lg: {
        dot: 'w-4 h-4',
        badge: 'w-6 h-6',
        pill: 'px-3 py-1.5 text-base',
        icon: 'w-6 h-6',
        gap: 'gap-2.5',
        text: 'text-base',
      },
    };

    const renderIndicator = () => {
      const colors = statusColors[status];
      const sizeClasses = sizes[size];
      
      switch (variant) {
        case 'dot':
          return (
            <div
              className={cn(
                'rounded-full',
                colors.bg,
                sizeClasses.dot,
                pulse && 'animate-pulse'
              )}
            />
          );
          
        case 'badge':
          return (
            <div
              className={cn(
                'rounded-full border-2 border-white shadow-sm',
                colors.bg,
                sizeClasses.badge,
                pulse && 'animate-pulse'
              )}
            />
          );
          
        case 'pill':
          return (
            <div
              className={cn(
                'rounded-full font-medium',
                colors.lightBg,
                colors.text,
                sizeClasses.pill,
                pulse && 'animate-pulse'
              )}
            >
              {label || status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          );
          
        case 'icon':
          return (
            <div
              className={cn(
                'rounded-full flex items-center justify-center',
                colors.bg,
                sizeClasses.icon,
                pulse && 'animate-pulse'
              )}
            >
              {renderStatusIcon()}
            </div>
          );
          
        default:
          return null;
      }
    };

    const renderStatusIcon = () => {
      const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-3.5 h-3.5';
      
      switch (status) {
        case 'success':
          return (
            <svg className={cn(iconSize, 'text-white')} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          );
        case 'warning':
          return (
            <svg className={cn(iconSize, 'text-white')} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          );
        case 'error':
          return (
            <svg className={cn(iconSize, 'text-white')} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          );
        case 'info':
          return (
            <svg className={cn(iconSize, 'text-white')} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          );
        case 'pending':
          return (
            <svg className={cn(iconSize, 'text-white animate-spin')} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          );
        case 'inactive':
          return (
            <svg className={cn(iconSize, 'text-white')} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 01-2 0V7zM8 13a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
            </svg>
          );
        default:
          return null;
      }
    };

    return (
      <div
        className={cn(
          baseClasses,
          showLabel && sizes[size].gap,
          className
        )}
        ref={ref}
        {...props}
      >
        {renderIndicator()}
        {showLabel && (label || variant === 'pill') && variant !== 'pill' && (
          <span className={cn('font-medium', statusColors[status].text, sizes[size].text)}>
            {label || status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>
    );
  }
);

StatusIndicator.displayName = 'StatusIndicator';

export default StatusIndicator;