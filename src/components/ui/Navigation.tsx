import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NavigationProps extends HTMLAttributes<HTMLElement> {
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

const Navigation = forwardRef<HTMLElement, NavigationProps>(
  ({ className, variant = 'horizontal', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'flex';
    
    const variants = {
      horizontal: 'flex-row space-x-1',
      vertical: 'flex-col space-y-1',
    };

    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    return (
      <nav
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </nav>
    );
  }
);

Navigation.displayName = 'Navigation';

interface NavigationItemProps {
  href?: string;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavigationItem = forwardRef<HTMLAnchorElement, NavigationItemProps>(
  ({ href, active, disabled, children, className, onClick, ...props }, ref) => {
    const baseClasses = 'touch-target inline-flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[44px]';
    
    const stateClasses = cn(
      active 
        ? 'bg-primary text-white' 
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
    );

    if (href && !disabled) {
      return (
        <Link
          href={href}
          className={cn(baseClasses, stateClasses, className)}
          ref={ref}
          {...props}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(baseClasses, stateClasses, className)}
        ref={ref as any}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NavigationItem.displayName = 'NavigationItem';

interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {}

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, children, ...props }, ref) => (
    <nav
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
      ref={ref}
      {...props}
    >
      {children}
    </nav>
  )
);

Breadcrumb.displayName = 'Breadcrumb';

interface BreadcrumbItemProps {
  href?: string;
  active?: boolean;
  children: ReactNode;
  className?: string;
}

const BreadcrumbItem = forwardRef<HTMLAnchorElement, BreadcrumbItemProps>(
  ({ href, active, children, className, ...props }, ref) => {
    const baseClasses = 'hover:text-foreground transition-colors';
    const activeClasses = active ? 'text-foreground font-medium' : '';

    if (href && !active) {
      return (
        <Link
          href={href}
          className={cn(baseClasses, activeClasses, className)}
          ref={ref}
          {...props}
        >
          {children}
        </Link>
      );
    }

    return (
      <span
        className={cn(baseClasses, activeClasses, className)}
        ref={ref as any}
        {...props}
      >
        {children}
      </span>
    );
  }
);

BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbSeparator = () => (
  <svg
    className="h-4 w-4 text-muted-foreground"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, children, ...props }, ref) => (
    <div className={cn('w-full', className)} ref={ref} {...props}>
      {children}
    </div>
  )
);

Tabs.displayName = 'Tabs';

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
);

TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  active?: boolean;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, active, children, ...props }, ref) => (
    <button
      type="button"
      className={cn(
        'touch-target inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px]',
        active 
          ? 'bg-background text-foreground shadow-sm' 
          : 'hover:bg-background/50 hover:text-foreground',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
);

TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  active?: boolean;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, active, children, ...props }, ref) => (
    <div
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        !active && 'hidden',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
);

TabsContent.displayName = 'TabsContent';

export {
  Navigation,
  NavigationItem,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
};