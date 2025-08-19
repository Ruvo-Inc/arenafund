'use client';

import { HTMLAttributes, forwardRef, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSwipeGesture, useHapticFeedback } from '@/hooks/useGestures';
import { useInteractionFeedback } from '@/hooks/useInteractionFeedback';

interface TouchNavigationProps extends HTMLAttributes<HTMLElement> {
  variant?: 'horizontal' | 'vertical' | 'mobile-menu';
  size?: 'sm' | 'md' | 'lg';
  swipeEnabled?: boolean;
  hapticFeedback?: boolean;
}

const TouchNavigation = forwardRef<HTMLElement, TouchNavigationProps>(
  ({ 
    className, 
    variant = 'horizontal', 
    size = 'md', 
    swipeEnabled = false,
    hapticFeedback = false,
    children, 
    ...props 
  }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { triggerSelectionHaptic } = useHapticFeedback();

    const { handlers: swipeHandlers } = useSwipeGesture({
      onSwipeLeft: () => {
        if (swipeEnabled && hapticFeedback) {
          triggerSelectionHaptic();
        }
      },
      onSwipeRight: () => {
        if (swipeEnabled && hapticFeedback) {
          triggerSelectionHaptic();
        }
      },
    });

    const baseClasses = 'flex touch-scroll';
    
    const variants = {
      horizontal: 'flex-row space-x-1 overflow-x-auto',
      vertical: 'flex-col space-y-1',
      'mobile-menu': 'flex-col space-y-2 p-4',
    };

    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const navigationProps = swipeEnabled ? swipeHandlers : {};

    return (
      <nav
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...navigationProps}
        {...props}
      >
        {children}
      </nav>
    );
  }
);

TouchNavigation.displayName = 'TouchNavigation';

interface TouchNavigationItemProps {
  href?: string;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hapticFeedback?: boolean;
  badge?: string | number;
  icon?: ReactNode;
}

const TouchNavigationItem = forwardRef<HTMLAnchorElement, TouchNavigationItemProps>(
  ({ 
    href, 
    active, 
    disabled, 
    children, 
    className, 
    onClick,
    hapticFeedback = false,
    badge,
    icon,
    ...props 
  }, ref) => {
    const { state, handlers } = useInteractionFeedback({
      disabled,
      hapticFeedback,
    });

    const { triggerSelectionHaptic } = useHapticFeedback();

    const baseClasses = 'nav-touch-item touch-target relative inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 no-select';
    
    const stateClasses = cn(
      active 
        ? 'bg-primary text-white shadow-sm' 
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      state.isPressed && 'transform scale-95'
    );

    const handleClick = () => {
      if (hapticFeedback) {
        triggerSelectionHaptic();
      }
      onClick?.();
    };

    const content = (
      <>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
        {badge && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {badge}
          </span>
        )}
        {active && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
        )}
      </>
    );

    if (href && !disabled) {
      return (
        <Link
          href={href}
          className={cn(baseClasses, stateClasses, className)}
          ref={ref}
          onClick={handleClick}
          {...handlers}
          {...props}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(baseClasses, stateClasses, className)}
        ref={ref as any}
        {...handlers}
        {...props}
      >
        {content}
      </button>
    );
  }
);

TouchNavigationItem.displayName = 'TouchNavigationItem';

interface MobileMenuToggleProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  hapticFeedback?: boolean;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const MobileMenuToggle = forwardRef<HTMLButtonElement, MobileMenuToggleProps>(
  ({ 
    className, 
    isOpen = false, 
    onToggle,
    hapticFeedback = false,
    ...props 
  }, ref) => {
    const { state, handlers } = useInteractionFeedback({
      hapticFeedback,
    });

    const { triggerImpactHaptic } = useHapticFeedback();

    const handleClick = () => {
      if (hapticFeedback) {
        triggerImpactHaptic('light');
      }
      onToggle?.(!isOpen);
    };

    return (
      <button
        type="button"
        className={cn(
          'mobile-menu-toggle touch-target relative inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          state.isPressed && 'transform scale-95',
          className
        )}
        onClick={handleClick}
        ref={ref}
        aria-expanded={isOpen}
        aria-label="Toggle navigation menu"
        {...handlers}
        {...props}
      >
        <div className={cn('hamburger', isOpen && 'open')}>
          <div className="hamburger-line" />
          <div className="hamburger-line" />
          <div className="hamburger-line" />
        </div>
      </button>
    );
  }
);

MobileMenuToggle.displayName = 'MobileMenuToggle';

interface TouchTabsProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  hapticFeedback?: boolean;
  swipeEnabled?: boolean;
}

const TouchTabs = forwardRef<HTMLDivElement, TouchTabsProps>(
  ({ 
    className, 
    value,
    onValueChange,
    hapticFeedback = false,
    swipeEnabled = false,
    children, 
    ...props 
  }, ref) => {
    const { handlers: swipeHandlers } = useSwipeGesture({
      onSwipeLeft: () => {
        // Handle swipe to next tab
        if (swipeEnabled && hapticFeedback) {
          // Implementation would depend on tab structure
        }
      },
      onSwipeRight: () => {
        // Handle swipe to previous tab
        if (swipeEnabled && hapticFeedback) {
          // Implementation would depend on tab structure
        }
      },
    });

    const tabsProps = swipeEnabled ? swipeHandlers : {};

    return (
      <div 
        className={cn('w-full', className)} 
        ref={ref} 
        {...tabsProps}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TouchTabs.displayName = 'TouchTabs';

interface TouchTabsListProps extends HTMLAttributes<HTMLDivElement> {
  hapticFeedback?: boolean;
}

const TouchTabsList = forwardRef<HTMLDivElement, TouchTabsListProps>(
  ({ className, hapticFeedback = false, children, ...props }, ref) => (
    <div
      className={cn(
        'inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground touch-spacing',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
);

TouchTabsList.displayName = 'TouchTabsList';

interface TouchTabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  active?: boolean;
  hapticFeedback?: boolean;
}

const TouchTabsTrigger = forwardRef<HTMLButtonElement, TouchTabsTriggerProps>(
  ({ 
    className, 
    value, 
    active, 
    hapticFeedback = false,
    children, 
    onClick,
    ...props 
  }, ref) => {
    const { state, handlers } = useInteractionFeedback({
      hapticFeedback,
    });

    const { triggerSelectionHaptic } = useHapticFeedback();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback) {
        triggerSelectionHaptic();
      }
      onClick?.(event);
    };

    return (
      <button
        type="button"
        className={cn(
          'touch-target inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          active 
            ? 'bg-background text-foreground shadow-sm' 
            : 'hover:bg-background/50 hover:text-foreground',
          state.isPressed && 'transform scale-95',
          className
        )}
        onClick={handleClick}
        ref={ref}
        {...handlers}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TouchTabsTrigger.displayName = 'TouchTabsTrigger';

interface SwipeableCardProps extends HTMLAttributes<HTMLDivElement> {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  hapticFeedback?: boolean;
  swipeThreshold?: number;
}

const SwipeableCard = forwardRef<HTMLDivElement, SwipeableCardProps>(
  ({ 
    className,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    hapticFeedback = false,
    swipeThreshold = 50,
    children,
    ...props 
  }, ref) => {
    const { triggerImpactHaptic } = useHapticFeedback();

    const { handlers } = useSwipeGesture({
      threshold: swipeThreshold,
      onSwipeLeft: () => {
        if (hapticFeedback) {
          triggerImpactHaptic('light');
        }
        onSwipeLeft?.();
      },
      onSwipeRight: () => {
        if (hapticFeedback) {
          triggerImpactHaptic('light');
        }
        onSwipeRight?.();
      },
      onSwipeUp: () => {
        if (hapticFeedback) {
          triggerImpactHaptic('light');
        }
        onSwipeUp?.();
      },
      onSwipeDown: () => {
        if (hapticFeedback) {
          triggerImpactHaptic('light');
        }
        onSwipeDown?.();
      },
    });

    return (
      <div
        className={cn(
          'swipeable card-touch relative overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all',
          className
        )}
        ref={ref}
        onTouchStart={(e) => handlers.onTouchStart(e.nativeEvent)}
        onTouchMove={(e) => handlers.onTouchMove(e.nativeEvent)}
        onTouchEnd={(e) => handlers.onTouchEnd(e.nativeEvent)}
        onMouseDown={(e) => handlers.onMouseDown(e.nativeEvent)}
        onMouseMove={(e) => handlers.onMouseMove(e.nativeEvent)}
        onMouseUp={(e) => handlers.onMouseUp(e.nativeEvent)}
        {...props}
      >
        {children}
        
        {/* Swipe indicators */}
        {(onSwipeLeft || onSwipeRight) && (
          <div className="absolute top-1/2 right-2 transform -translate-y-1/2 opacity-30">
            <div className="w-2 h-2 bg-muted-foreground rounded-full" />
          </div>
        )}
      </div>
    );
  }
);

SwipeableCard.displayName = 'SwipeableCard';

export {
  TouchNavigation,
  TouchNavigationItem,
  MobileMenuToggle,
  TouchTabs,
  TouchTabsList,
  TouchTabsTrigger,
  SwipeableCard,
};