'use client';

import { HTMLAttributes, forwardRef, ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Building, 
  HelpCircle, 
  FileText, 
  User,
  ChevronRight,
  ArrowLeft,
  Briefcase
} from 'lucide-react';
import { useSwipeGesture, useHapticFeedback } from '@/hooks/useGestures';
import { useInteractionFeedback } from '@/hooks/useInteractionFeedback';

interface MobileNavigationProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  hapticFeedback?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const MobileNavigation = forwardRef<HTMLElement, MobileNavigationProps>(
  ({ 
    className, 
    isOpen: controlledIsOpen, 
    onToggle,
    hapticFeedback = true,
    children, 
    ...props 
  }, ref) => {
    const pathname = usePathname();
    const { triggerImpactHaptic } = useHapticFeedback();
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    
    // Use controlled or internal state
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const setIsOpen = onToggle || setInternalIsOpen;
    
    // Close menu on route change
    useEffect(() => {
      if (isOpen) {
        setIsOpen(false);
      }
    }, [pathname]);

    // Close menu on escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          setIsOpen(false);
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, setIsOpen]);

    // Prevent body scroll when menu is open
    useEffect(() => {
      if (isOpen) {
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
      } else {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    const handleToggle = () => {
      if (hapticFeedback) {
        triggerImpactHaptic('light');
      }
      setIsOpen(!isOpen);
    };

    return (
      <>
        {/* Mobile Menu Toggle Button */}
        <MobileMenuToggle 
          isOpen={isOpen} 
          onToggle={handleToggle}
          hapticFeedback={hapticFeedback}
          className="md:hidden"
        />

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => onToggle?.(false)}
          />
        )}

        {/* Mobile Menu Panel */}
        <nav
          className={cn(
            'fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-background border-l border-border transform transition-transform duration-300 ease-out md:hidden',
            isOpen ? 'translate-x-0' : 'translate-x-full',
            className
          )}
          ref={ref}
          {...props}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="The Arena Fund" 
                  className="w-8 h-8 object-contain"
                />
                <span className="font-display text-lg font-bold">
                  The Arena Fund
                </span>
              </div>
              <button
                onClick={() => onToggle?.(false)}
                className="touch-target p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <MobileNavigationSection title="Main">
                <MobileNavigationItem 
                  href="/" 
                  icon={<Home className="w-5 h-5" />}
                  active={pathname === '/'}
                  hapticFeedback={hapticFeedback}
                >
                  Home
                </MobileNavigationItem>
                <MobileNavigationItem 
                  href="/investors" 
                  icon={<Users className="w-5 h-5" />}
                  active={pathname === '/investors'}
                  hapticFeedback={hapticFeedback}
                >
                  Investors
                </MobileNavigationItem>
                <MobileNavigationItem 
                  href="/founders" 
                  icon={<Building className="w-5 h-5" />}
                  active={pathname === '/founders'}
                  hapticFeedback={hapticFeedback}
                >
                  Founders
                </MobileNavigationItem>
                <MobileNavigationItem 
                  href="/process" 
                  icon={<Briefcase className="w-5 h-5" />}
                  active={pathname === '/process'}
                  hapticFeedback={hapticFeedback}
                >
                  Process
                </MobileNavigationItem>
                <MobileNavigationItem 
                  href="/apply" 
                  icon={<FileText className="w-5 h-5" />}
                  active={pathname === '/apply'}
                  hapticFeedback={hapticFeedback}
                >
                  Apply
                </MobileNavigationItem>
              </MobileNavigationSection>

              <MobileNavigationSection title="Support">
                <MobileNavigationItem 
                  href="/faq" 
                  icon={<HelpCircle className="w-5 h-5" />}
                  active={pathname === '/faq'}
                  hapticFeedback={hapticFeedback}
                >
                  FAQ
                </MobileNavigationItem>
                <MobileNavigationItem 
                  href="/team" 
                  icon={<Users className="w-5 h-5" />}
                  active={pathname === '/team'}
                  hapticFeedback={hapticFeedback}
                >
                  Team
                </MobileNavigationItem>
              </MobileNavigationSection>

              <MobileNavigationSection title="Legal">
                <MobileNavigationItem 
                  href="/disclosures" 
                  icon={<FileText className="w-5 h-5" />}
                  active={pathname === '/disclosures'}
                  hapticFeedback={hapticFeedback}
                >
                  Disclosures
                </MobileNavigationItem>
                <MobileNavigationItem 
                  href="/privacy" 
                  icon={<FileText className="w-5 h-5" />}
                  active={pathname === '/privacy'}
                  hapticFeedback={hapticFeedback}
                >
                  Privacy
                </MobileNavigationItem>
              </MobileNavigationSection>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-border space-y-2">
              <MobileNavigationItem 
                href="/account" 
                icon={<User className="w-5 h-5" />}
                active={pathname === '/account'}
                hapticFeedback={hapticFeedback}
                variant="primary"
              >
                Account
              </MobileNavigationItem>
              <MobileNavigationItem 
                href="/profile" 
                icon={<User className="w-5 h-5" />}
                active={pathname === '/profile'}
                hapticFeedback={hapticFeedback}
                variant="secondary"
              >
                Profile
              </MobileNavigationItem>
            </div>
          </div>
        </nav>
      </>
    );
  }
);

MobileNavigation.displayName = 'MobileNavigation';

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

    return (
      <button
        type="button"
        className={cn(
          'mobile-menu-toggle touch-target relative inline-flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          state.isPressed && 'transform scale-95',
          className
        )}
        onClick={() => onToggle?.(!isOpen)}
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

interface MobileNavigationSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const MobileNavigationSection = ({ title, children, className }: MobileNavigationSectionProps) => (
  <div className={cn('px-6 py-2', className)}>
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
      {title}
    </h3>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

interface MobileNavigationItemProps {
  href?: string;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hapticFeedback?: boolean;
  icon?: ReactNode;
  badge?: string | number;
  variant?: 'default' | 'primary' | 'secondary';
}

const MobileNavigationItem = forwardRef<HTMLAnchorElement, MobileNavigationItemProps>(
  ({ 
    href, 
    active, 
    disabled, 
    children, 
    className, 
    onClick,
    hapticFeedback = false,
    icon,
    badge,
    variant = 'default',
    ...props 
  }, ref) => {
    const { state, handlers } = useInteractionFeedback({
      disabled,
      hapticFeedback,
    });

    const { triggerSelectionHaptic } = useHapticFeedback();

    const baseClasses = 'nav-touch-item touch-target relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 no-select';
    
    const variantClasses = {
      default: cn(
        active 
          ? 'bg-primary text-primary-foreground shadow-sm' 
          : 'text-foreground hover:bg-secondary',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        state.isPressed && 'transform scale-95'
      ),
      primary: cn(
        'bg-primary text-primary-foreground hover:bg-primary/90',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        state.isPressed && 'transform scale-95'
      ),
      secondary: cn(
        'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        state.isPressed && 'transform scale-95'
      ),
    };

    const handleClick = () => {
      if (hapticFeedback) {
        triggerSelectionHaptic();
      }
      onClick?.();
    };

    const content = (
      <>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1 text-left">{children}</span>
        {badge && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {badge}
          </span>
        )}
        {active && variant === 'default' && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </>
    );

    if (href && !disabled) {
      return (
        <Link
          href={href}
          className={cn(baseClasses, variantClasses[variant], className)}
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
        className={cn(baseClasses, variantClasses[variant], 'w-full', className)}
        ref={ref as any}
        {...handlers}
        {...props}
      >
        {content}
      </button>
    );
  }
);

MobileNavigationItem.displayName = 'MobileNavigationItem';

interface MobileBreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
  hapticFeedback?: boolean;
}

const MobileBreadcrumb = forwardRef<HTMLElement, MobileBreadcrumbProps>(
  ({ className, items, hapticFeedback = false, ...props }, ref) => {
    const { triggerSelectionHaptic } = useHapticFeedback();

    const handleClick = () => {
      if (hapticFeedback) {
        triggerSelectionHaptic();
      }
    };

    return (
      <nav
        className={cn(
          'flex items-center space-x-1 text-sm text-muted-foreground overflow-x-auto touch-scroll py-2',
          className
        )}
        ref={ref}
        {...props}
      >
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-1 flex-shrink-0">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            )}
            {item.href && !item.active ? (
              <Link
                href={item.href}
                className="touch-target px-2 py-1 rounded hover:text-foreground hover:bg-secondary transition-colors"
                onClick={handleClick}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'px-2 py-1 rounded',
                  item.active && 'text-foreground font-medium bg-secondary'
                )}
              >
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
    );
  }
);

MobileBreadcrumb.displayName = 'MobileBreadcrumb';

interface MobileBackButtonProps extends HTMLAttributes<HTMLButtonElement> {
  href?: string;
  onBack?: () => void;
  hapticFeedback?: boolean;
  label?: string;
}

const MobileBackButton = forwardRef<HTMLButtonElement, MobileBackButtonProps>(
  ({ 
    className, 
    href, 
    onBack,
    hapticFeedback = false,
    label = 'Back',
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
      if (onBack) {
        onBack();
      } else if (href) {
        window.location.href = href;
      } else {
        window.history.back();
      }
    };

    const content = (
      <>
        <ArrowLeft className="w-5 h-5" />
        <span>{label}</span>
      </>
    );

    if (href) {
      return (
        <Link
          href={href}
          className={cn(
            'touch-target inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors',
            state.isPressed && 'transform scale-95',
            className
          )}
          onClick={handleClick}
          {...handlers}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={cn(
          'touch-target inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors',
          state.isPressed && 'transform scale-95',
          className
        )}
        onClick={handleClick}
        ref={ref}
        {...handlers}
        {...props}
      >
        {content}
      </button>
    );
  }
);

MobileBackButton.displayName = 'MobileBackButton';

export {
  MobileNavigation,
  MobileMenuToggle,
  MobileNavigationSection,
  MobileNavigationItem,
  MobileBreadcrumb,
  MobileBackButton,
};