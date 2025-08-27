'use client';

import React, { HTMLAttributes, forwardRef, ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useAccessibility, useFocusManagement, useLiveRegion } from '@/hooks/useAccessibility';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface AccessibleMobileLayoutProps extends HTMLAttributes<HTMLDivElement> {
  skipLinkTarget?: string;
  skipLinkText?: string;
  mainContentId?: string;
  navigationId?: string;
  enableFocusTrap?: boolean;
  announcePageChanges?: boolean;
}

const AccessibleMobileLayout = forwardRef<HTMLDivElement, AccessibleMobileLayoutProps>(
  ({ 
    className,
    skipLinkTarget = '#main-content',
    skipLinkText = 'Skip to main content',
    mainContentId = 'main-content',
    navigationId = 'main-navigation',
    enableFocusTrap = false,
    announcePageChanges = true,
    children,
    ...props 
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { 
      prefersReducedMotion, 
      getOptimalStyles,
      announce,
    } = useAccessibility({ announceRouteChanges: announcePageChanges });
    
    const { isMobile, shouldShowMobileUI } = useMobileOptimization();
    const { trapFocus, releaseFocus } = useFocusManagement(containerRef as React.RefObject<HTMLElement | null>);
    const { message, liveRegionProps } = useLiveRegion();

    // Handle focus trap
    useEffect(() => {
      if (enableFocusTrap) {
        trapFocus();
        return releaseFocus;
      }
    }, [enableFocusTrap, trapFocus, releaseFocus]);

    const layoutStyles = getOptimalStyles({
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    });

    return (
      <div
        ref={containerRef}
        className={cn(
          'accessible-mobile-layout min-h-screen flex flex-col',
          prefersReducedMotion && 'motion-reduce',
          className
        )}
        style={layoutStyles}
        {...props}
      >
        {/* Skip Link */}
        <a
          href={skipLinkTarget}
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg"
          onClick={() => announce(`Skipped to ${skipLinkText.toLowerCase()}`)}
        >
          {skipLinkText}
        </a>

        {/* Live Region for Announcements */}
        <div {...liveRegionProps}>
          {message}
        </div>

        {/* Main Layout */}
        <div ref={ref} className="flex-1 flex flex-col">
          {children}
        </div>

        {/* Mobile-specific enhancements */}
        {shouldShowMobileUI() && (
          <div className="mobile-enhancements">
            {/* Safe area spacing for devices with notches */}
            <style jsx>{`
              .accessible-mobile-layout {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
                padding-left: env(safe-area-inset-left);
                padding-right: env(safe-area-inset-right);
              }
            `}</style>
          </div>
        )}
      </div>
    );
  }
);

AccessibleMobileLayout.displayName = 'AccessibleMobileLayout';

interface AccessibleHeaderProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode;
  navigation?: ReactNode;
  mobileMenuButton?: ReactNode;
  skipTarget?: string;
}

const AccessibleHeader = forwardRef<HTMLElement, AccessibleHeaderProps>(
  ({ 
    className,
    logo,
    navigation,
    mobileMenuButton,
    skipTarget = '#main-content',
    children,
    ...props 
  }, ref) => {
    const { getOptimalStyles, getButtonProps } = useAccessibility();
    const { isMobile } = useMobileOptimization();

    const headerStyles = getOptimalStyles({
      position: 'sticky',
      top: 0,
      zIndex: 40,
    });

    return (
      <header
        ref={ref}
        className={cn(
          'accessible-header sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          className
        )}
        style={headerStyles}
        role="banner"
        {...props}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          {logo && (
            <div className="flex items-center space-x-2">
              {logo}
            </div>
          )}

          {/* Desktop Navigation */}
          {!isMobile && navigation && (
            <nav
              className="hidden md:flex items-center space-x-6"
              role="navigation"
              aria-label="Main navigation"
            >
              {navigation}
            </nav>
          )}

          {/* Mobile Menu Button */}
          {isMobile && mobileMenuButton && (
            <div className="md:hidden">
              {mobileMenuButton}
            </div>
          )}

          {children}
        </div>
      </header>
    );
  }
);

AccessibleHeader.displayName = 'AccessibleHeader';

interface AccessibleMainProps extends HTMLAttributes<HTMLElement> {
  skipLinkId?: string;
  pageTitle?: string;
  announceTitle?: boolean;
}

const AccessibleMain = forwardRef<HTMLElement, AccessibleMainProps>(
  ({ 
    className,
    skipLinkId = 'main-content',
    pageTitle,
    announceTitle = true,
    children,
    ...props 
  }, ref) => {
    const { announce, getOptimalStyles } = useAccessibility();

    useEffect(() => {
      if (announceTitle && pageTitle) {
        announce(`${pageTitle} page loaded`);
      }
    }, [announceTitle, pageTitle, announce]);

    const mainStyles = getOptimalStyles({
      flex: 1,
      outline: 'none',
    });

    return (
      <main
        ref={ref}
        id={skipLinkId}
        className={cn('accessible-main flex-1 focus:outline-none', className)}
        style={mainStyles}
        role="main"
        tabIndex={-1}
        {...props}
      >
        {pageTitle && (
          <h1 className="sr-only">{pageTitle}</h1>
        )}
        {children}
      </main>
    );
  }
);

AccessibleMain.displayName = 'AccessibleMain';

interface AccessibleFooterProps extends HTMLAttributes<HTMLElement> {
  links?: ReactNode;
  copyright?: string;
}

const AccessibleFooter = forwardRef<HTMLElement, AccessibleFooterProps>(
  ({ 
    className,
    links,
    copyright,
    children,
    ...props 
  }, ref) => {
    const { getOptimalStyles } = useAccessibility();

    const footerStyles = getOptimalStyles({
      marginTop: 'auto',
    });

    return (
      <footer
        ref={ref}
        className={cn(
          'accessible-footer mt-auto border-t bg-background',
          className
        )}
        style={footerStyles}
        role="contentinfo"
        {...props}
      >
        <div className="container px-4 py-8">
          {links && (
            <nav
              className="mb-4"
              role="navigation"
              aria-label="Footer navigation"
            >
              {links}
            </nav>
          )}
          
          {copyright && (
            <div className="text-sm text-muted-foreground">
              {copyright}
            </div>
          )}
          
          {children}
        </div>
      </footer>
    );
  }
);

AccessibleFooter.displayName = 'AccessibleFooter';

interface AccessibleSectionProps extends HTMLAttributes<HTMLElement> {
  heading?: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  landmark?: 'region' | 'complementary' | 'aside' | 'section';
  ariaLabel?: string;
}

const AccessibleSection = forwardRef<HTMLElement, AccessibleSectionProps>(
  ({ 
    className,
    heading,
    headingLevel = 2,
    landmark = 'section',
    ariaLabel,
    children,
    ...props 
  }, ref) => {
    const { getOptimalStyles } = useAccessibility();
    const HeadingTag = `h${headingLevel}` as keyof React.JSX.IntrinsicElements;

    const sectionStyles = getOptimalStyles();

    return (
      <section
        ref={ref}
        className={cn('accessible-section', className)}
        style={sectionStyles}
        role={landmark}
        aria-label={ariaLabel || heading}
        {...props}
      >
        {heading && (
          <HeadingTag className="section-heading mb-4 text-2xl font-bold">
            {heading}
          </HeadingTag>
        )}
        {children}
      </section>
    );
  }
);

AccessibleSection.displayName = 'AccessibleSection';

interface AccessibleCardProps extends HTMLAttributes<HTMLDivElement> {
  heading?: string;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  interactive?: boolean;
  href?: string;
  onClick?: () => void;
}

const AccessibleCard = forwardRef<HTMLDivElement, AccessibleCardProps>(
  ({ 
    className,
    heading,
    headingLevel = 3,
    interactive = false,
    href,
    onClick,
    children,
    ...props 
  }, ref) => {
    const { getOptimalStyles, getButtonProps } = useAccessibility();
    const { optimizeTouchTarget } = useAccessibility();
    const cardRef = useRef<HTMLDivElement>(null);

    const HeadingTag = `h${headingLevel}` as keyof React.JSX.IntrinsicElements;

    useEffect(() => {
      if (interactive && cardRef.current) {
        optimizeTouchTarget(cardRef.current);
      }
    }, [interactive, optimizeTouchTarget]);

    const cardStyles = getOptimalStyles({
      cursor: interactive ? 'pointer' : 'default',
    });

    const cardProps = interactive 
      ? {
          ...getButtonProps(heading || 'Interactive card'),
          onClick,
          onKeyDown: (e: React.KeyboardEvent) => {
            if ((e.key === 'Enter' || e.key === ' ') && onClick) {
              e.preventDefault();
              onClick();
            }
          },
        }
      : {};

    const CardComponent = href ? 'a' : interactive ? 'div' : 'div';
    const linkProps = href ? { href } : {};

    return (
      <CardComponent
        ref={cardRef as any}
        className={cn(
          'accessible-card rounded-lg border bg-card p-6 shadow-sm transition-colors',
          interactive && 'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          className
        )}
        style={cardStyles}
        {...(linkProps as any)}
        {...(cardProps as any)}
        {...(props as any)}
      >
        {heading && (
          <HeadingTag className="card-heading mb-2 text-lg font-semibold">
            {heading}
          </HeadingTag>
        )}
        {children}
      </CardComponent>
    );
  }
);

AccessibleCard.displayName = 'AccessibleCard';

export {
  AccessibleMobileLayout,
  AccessibleHeader,
  AccessibleMain,
  AccessibleFooter,
  AccessibleSection,
  AccessibleCard,
};