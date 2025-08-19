'use client';

import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useInteractionFeedback, useHoverCard } from '@/hooks/useInteractionFeedback';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive' | 'expandable';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'expand' | 'none';
  clickable?: boolean;
  loading?: boolean;
  expandOnHover?: boolean;
  expandedContent?: ReactNode;
  hoverDelay?: number;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md', 
    hover = false,
    hoverEffect = 'lift',
    clickable = false,
    loading = false,
    expandOnHover = false,
    expandedContent,
    hoverDelay = 300,
    children,
    onClick,
    ...props 
  }, ref) => {
    const { state, handlers } = useInteractionFeedback({
      disabled: loading,
      loading,
    });

    const { isVisible: isExpanded, showCard, hideCard } = useHoverCard(hoverDelay);

    const baseClasses = 'rounded-lg transition-all duration-300 focus:outline-none';
    
    const variants = {
      default: 'bg-background border border-border',
      elevated: 'bg-background shadow-md border border-border',
      outlined: 'bg-background border-2 border-border',
      interactive: 'card-interactive card-touch bg-background border border-border cursor-pointer touch-target',
      expandable: 'card-expandable card-expandable-touch bg-background border border-border cursor-pointer touch-target',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    const hoverEffects = {
      lift: 'hover-lift',
      scale: 'hover-scale',
      glow: 'hover-glow card-glow',
      expand: 'card-expandable',
      none: '',
    };

    const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';
    const interactiveClasses = clickable ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 touch-target min-h-[44px]' : '';
    const loadingClass = loading ? 'card-loading opacity-60 pointer-events-none' : '';

    const handleMouseEnter = () => {
      handlers.onMouseEnter();
      if (expandOnHover) {
        showCard();
      }
    };

    const handleMouseLeave = () => {
      handlers.onMouseLeave();
      if (expandOnHover) {
        hideCard();
      }
    };

    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          paddings[padding],
          hoverClasses,
          hoverEffects[hoverEffect],
          interactiveClasses,
          loadingClass,
          state.isPressed && clickable && 'transform scale-98',
          className
        )}
        ref={ref}
        onClick={clickable ? onClick : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handlers.onFocus}
        onBlur={handlers.onBlur}
        onMouseDown={clickable ? handlers.onMouseDown : undefined}
        onMouseUp={clickable ? handlers.onMouseUp : undefined}
        onTouchStart={clickable ? handlers.onTouchStart : undefined}
        onTouchEnd={clickable ? handlers.onTouchEnd : undefined}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? 'button' : undefined}
        {...props}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* Main Content */}
        <div className={loading ? 'relative' : ''}>
          {children}
        </div>

        {/* Expanded Content */}
        {expandOnHover && expandedContent && (
          <div
            className={cn(
              'overflow-hidden transition-all duration-300 ease-in-out',
              isExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            )}
          >
            <div className="border-t border-border pt-4">
              {expandedContent}
            </div>
          </div>
        )}

        {/* Hover Indicator */}
        {state.isHovered && hoverEffect !== 'none' && (
          <div className="absolute top-2 right-2 opacity-50">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn('text-xl font-semibold leading-none tracking-tight text-foreground', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };