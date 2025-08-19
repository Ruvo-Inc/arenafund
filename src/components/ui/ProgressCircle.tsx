import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    size = 'md',
    variant = 'default',
    strokeWidth,
    showLabel = false,
    label,
    showPercentage = true,
    animated = true,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizes = {
      sm: { 
        dimension: 48, 
        defaultStroke: 3,
        textSize: 'text-xs',
        labelSize: 'text-xs',
      },
      md: { 
        dimension: 64, 
        defaultStroke: 4,
        textSize: 'text-sm',
        labelSize: 'text-sm',
      },
      lg: { 
        dimension: 96, 
        defaultStroke: 6,
        textSize: 'text-lg',
        labelSize: 'text-base',
      },
      xl: { 
        dimension: 128, 
        defaultStroke: 8,
        textSize: 'text-2xl',
        labelSize: 'text-lg',
      },
    };

    const variants = {
      default: {
        stroke: 'stroke-navy-500',
        background: 'stroke-gray-200',
        text: 'text-navy-600',
      },
      success: {
        stroke: 'stroke-success-500',
        background: 'stroke-gray-200',
        text: 'text-success-600',
      },
      warning: {
        stroke: 'stroke-warning-500',
        background: 'stroke-gray-200',
        text: 'text-warning-600',
      },
      error: {
        stroke: 'stroke-error-500',
        background: 'stroke-gray-200',
        text: 'text-error-600',
      },
      info: {
        stroke: 'stroke-navy-500',
        background: 'stroke-gray-200',
        text: 'text-navy-600',
      },
    };

    const sizeConfig = sizes[size];
    const variantConfig = variants[variant];
    const stroke = strokeWidth || sizeConfig.defaultStroke;
    const radius = (sizeConfig.dimension - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div 
        className={cn('inline-flex flex-col items-center', className)} 
        ref={ref} 
        {...props}
      >
        <div className="relative inline-flex items-center justify-center">
          <svg
            width={sizeConfig.dimension}
            height={sizeConfig.dimension}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={sizeConfig.dimension / 2}
              cy={sizeConfig.dimension / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              className={variantConfig.background}
            />
            
            {/* Progress circle */}
            <circle
              cx={sizeConfig.dimension / 2}
              cy={sizeConfig.dimension / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              className={cn(
                variantConfig.stroke,
                animated && 'transition-all duration-500 ease-out'
              )}
              style={{
                strokeDasharray,
                strokeDashoffset,
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {showPercentage && (
              <span className={cn('font-bold', sizeConfig.textSize, variantConfig.text)}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
        
        {showLabel && label && (
          <span className={cn('mt-2 font-medium text-center text-gray-700', sizeConfig.labelSize)}>
            {label}
          </span>
        )}
      </div>
    );
  }
);

ProgressCircle.displayName = 'ProgressCircle';

export default ProgressCircle;