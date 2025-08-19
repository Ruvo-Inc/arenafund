'use client';

import { HTMLAttributes, forwardRef, ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { MobileNavigation } from './MobileNavigation';
import { MobileBreadcrumb, MobileBackButton } from './MobileNavigation';

interface MobileLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showNavigation?: boolean;
  showBreadcrumb?: boolean;
  showBackButton?: boolean;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
  backButtonLabel?: string;
  backButtonHref?: string;
  onBackButtonClick?: () => void;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  sidebarContent?: ReactNode;
  variant?: 'default' | 'full-width' | 'centered';
}

const MobileLayout = forwardRef<HTMLDivElement, MobileLayoutProps>(
  ({ 
    className,
    showNavigation = true,
    showBreadcrumb = false,
    showBackButton = false,
    breadcrumbItems = [],
    backButtonLabel = 'Back',
    backButtonHref,
    onBackButtonClick,
    headerContent,
    footerContent,
    sidebarContent,
    variant = 'default',
    children,
    ...props 
  }, ref) => {
    const [isNavigationOpen, setIsNavigationOpen] = useState(false);
    const pathname = usePathname();

    // Auto-generate breadcrumb items based on pathname if not provided
    const defaultBreadcrumbItems = breadcrumbItems.length > 0 ? breadcrumbItems : 
      pathname.split('/').filter(Boolean).map((segment, index, array) => ({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: index < array.length - 1 ? '/' + array.slice(0, index + 1).join('/') : undefined,
        active: index === array.length - 1,
      }));

    const variants = {
      default: 'max-w-screen-xl mx-auto px-4 sm:px-6',
      'full-width': 'w-full px-4 sm:px-6',
      centered: 'max-w-4xl mx-auto px-4 sm:px-6',
    };

    return (
      <div
        className={cn('mobile-layout min-h-screen flex flex-col', className)}
        ref={ref}
        {...props}
      >
        {/* Mobile Navigation */}
        {showNavigation && (
          <MobileNavigation 
            isOpen={isNavigationOpen}
            onToggle={setIsNavigationOpen}
          />
        )}

        {/* Header Content */}
        {headerContent && (
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
            <div className={variants[variant]}>
              {headerContent}
            </div>
          </header>
        )}

        {/* Navigation Bar */}
        {(showBreadcrumb || showBackButton) && (
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className={variants[variant]}>
              <div className="flex items-center justify-between py-3">
                {showBackButton && (
                  <MobileBackButton
                    href={backButtonHref}
                    onBack={onBackButtonClick}
                    label={backButtonLabel}
                    hapticFeedback
                  />
                )}
                
                {showBreadcrumb && defaultBreadcrumbItems.length > 0 && (
                  <MobileBreadcrumb
                    items={defaultBreadcrumbItems}
                    hapticFeedback
                    className="flex-1"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex">
          {/* Sidebar */}
          {sidebarContent && (
            <aside className="hidden lg:block w-64 border-r border-border bg-muted/30">
              <div className="sticky top-0 h-screen overflow-y-auto p-6">
                {sidebarContent}
              </div>
            </aside>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className={variants[variant]}>
              <div className="py-6 sm:py-8">
                {children}
              </div>
            </div>
          </div>
        </main>

        {/* Footer Content */}
        {footerContent && (
          <footer className="border-t border-border bg-muted/30">
            <div className={variants[variant]}>
              {footerContent}
            </div>
          </footer>
        )}
      </div>
    );
  }
);

MobileLayout.displayName = 'MobileLayout';

interface MobilePageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  backButton?: ReactNode;
  variant?: 'default' | 'centered' | 'minimal';
}

const MobilePageHeader = forwardRef<HTMLDivElement, MobilePageHeaderProps>(
  ({ 
    className,
    title,
    subtitle,
    actions,
    breadcrumb,
    backButton,
    variant = 'default',
    ...props 
  }, ref) => {
    const variants = {
      default: 'pb-6 border-b border-border mb-6',
      centered: 'pb-6 border-b border-border mb-6 text-center',
      minimal: 'pb-4 mb-4',
    };

    return (
      <div
        className={cn('mobile-page-header', variants[variant], className)}
        ref={ref}
        {...props}
      >
        {/* Navigation Elements */}
        {(breadcrumb || backButton) && (
          <div className="mb-4">
            {backButton}
            {breadcrumb}
          </div>
        )}

        {/* Header Content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base sm:text-lg text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-2">
                {actions}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

MobilePageHeader.displayName = 'MobilePageHeader';

interface MobilePageFooterProps extends HTMLAttributes<HTMLDivElement> {
  actions?: ReactNode;
  variant?: 'default' | 'sticky' | 'floating';
}

const MobilePageFooter = forwardRef<HTMLDivElement, MobilePageFooterProps>(
  ({ 
    className,
    actions,
    variant = 'default',
    children,
    ...props 
  }, ref) => {
    const variants = {
      default: 'pt-6 border-t border-border mt-6',
      sticky: 'sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-20',
      floating: 'fixed bottom-4 left-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg z-20',
    };

    return (
      <div
        className={cn('mobile-page-footer', variants[variant], className)}
        ref={ref}
        {...props}
      >
        {children}
        
        {actions && (
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            {actions}
          </div>
        )}
      </div>
    );
  }
);

MobilePageFooter.displayName = 'MobilePageFooter';

interface MobileSplitLayoutProps extends HTMLAttributes<HTMLDivElement> {
  leftContent: ReactNode;
  rightContent: ReactNode;
  leftWidth?: 'sm' | 'md' | 'lg';
  stackOnMobile?: boolean;
  gap?: 'sm' | 'md' | 'lg';
}

const MobileSplitLayout = forwardRef<HTMLDivElement, MobileSplitLayoutProps>(
  ({ 
    className,
    leftContent,
    rightContent,
    leftWidth = 'md',
    stackOnMobile = true,
    gap = 'md',
    ...props 
  }, ref) => {
    const leftWidths = {
      sm: 'lg:w-1/4',
      md: 'lg:w-1/3',
      lg: 'lg:w-1/2',
    };

    const gaps = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    };

    return (
      <div
        className={cn(
          'mobile-split-layout flex',
          stackOnMobile ? 'flex-col lg:flex-row' : 'flex-row',
          gaps[gap],
          className
        )}
        ref={ref}
        {...props}
      >
        <div className={cn('flex-shrink-0', leftWidths[leftWidth])}>
          {leftContent}
        </div>
        <div className="flex-1 min-w-0">
          {rightContent}
        </div>
      </div>
    );
  }
);

MobileSplitLayout.displayName = 'MobileSplitLayout';

interface MobileStackLayoutProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

const MobileStackLayout = forwardRef<HTMLDivElement, MobileStackLayoutProps>(
  ({ 
    className,
    spacing = 'md',
    align = 'stretch',
    children,
    ...props 
  }, ref) => {
    const spacings = {
      sm: 'space-y-3',
      md: 'space-y-4 sm:space-y-6',
      lg: 'space-y-6 sm:space-y-8',
      xl: 'space-y-8 sm:space-y-12',
    };

    const alignments = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };

    return (
      <div
        className={cn(
          'mobile-stack-layout flex flex-col',
          spacings[spacing],
          alignments[align],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MobileStackLayout.displayName = 'MobileStackLayout';

interface MobileCardLayoutProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const MobileCardLayout = forwardRef<HTMLDivElement, MobileCardLayoutProps>(
  ({ 
    className,
    variant = 'default',
    padding = 'md',
    interactive = false,
    children,
    ...props 
  }, ref) => {
    const variants = {
      default: 'bg-card border border-border',
      elevated: 'bg-card shadow-md border border-border',
      outlined: 'bg-transparent border-2 border-border',
      ghost: 'bg-transparent',
    };

    const paddings = {
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-6',
      lg: 'p-6 sm:p-8',
    };

    return (
      <div
        className={cn(
          'mobile-card-layout rounded-lg transition-all',
          variants[variant],
          paddings[padding],
          interactive && 'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MobileCardLayout.displayName = 'MobileCardLayout';

export {
  MobileLayout,
  MobilePageHeader,
  MobilePageFooter,
  MobileSplitLayout,
  MobileStackLayout,
  MobileCardLayout,
};