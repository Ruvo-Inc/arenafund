'use client';

import { AnchorHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useInteractionFeedback } from '@/hooks/useInteractionFeedback';

interface InteractiveLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href?: string;
  variant?: 'default' | 'underline' | 'button' | 'arrow' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  external?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showArrow?: boolean;
  hoverEffect?: 'slide' | 'glow' | 'scale' | 'none';
}

const InteractiveLink = forwardRef<HTMLAnchorElement, InteractiveLinkProps>(
  ({ 
    className, 
    href,
    variant = 'default',
    size = 'md',
    external = false,
    disabled = false,
    leftIcon,
    rightIcon,
    showArrow = false,
    hoverEffect = 'slide',
    children,
    onClick,
    ...props 
  }, ref) => {
    const { state, handlers } = useInteractionFeedback({
      disabled,
    });

    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const variants = {
      default: 'link-interactive text-link hover:text-link-hover',
      underline: 'text-link hover:text-link-hover underline hover:no-underline',
      button: 'inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors',
      arrow: 'link-arrow text-link hover:text-link-hover',
      minimal: 'text-foreground hover:text-primary transition-colors',
    };

    const hoverEffects = {
      slide: variant === 'arrow' ? '' : 'hover-slide-right',
      glow: 'hover-glow',
      scale: 'hover-scale',
      none: '',
    };

    const baseClasses = 'inline-flex items-center gap-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const linkClasses = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      hoverEffects[hoverEffect],
      disabled && 'cursor-not-allowed opacity-50',
      state.isPressed && 'transform scale-95',
      className
    );

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const linkContent = (
      <>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        {showArrow && !rightIcon && (
          <span className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        )}
      </>
    );

    // External link
    if (external || !href) {
      return (
        <a
          ref={ref}
          href={href}
          className={cn(linkClasses, 'group')}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          {...handlers}
          {...props}
        >
          {linkContent}
          {external && !rightIcon && !showArrow && (
            <span className="flex-shrink-0 ml-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          )}
        </a>
      );
    }

    // Internal Next.js link
    return (
      <Link
        href={href}
        className={cn(linkClasses, 'group')}
        ref={ref}
        onClick={handleClick}
        {...handlers}
        {...props}
      >
        {linkContent}
      </Link>
    );
  }
);

InteractiveLink.displayName = 'InteractiveLink';

export default InteractiveLink;