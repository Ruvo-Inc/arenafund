'use client';

import { 
  HTMLAttributes, 
  AnchorHTMLAttributes, 
  ButtonHTMLAttributes, 
  forwardRef, 
  ReactNode, 
  useState, 
  useEffect 
} from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  Settings, 
  Search,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';
import { useInteractionFeedback } from '@/hooks/useInteractionFeedback';

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  items?: NavigationItem[];
  variant?: 'slide' | 'overlay' | 'push';
  position?: 'left' | 'right' | 'bottom';
}

interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
}

const MobileNavigation = forwardRef<HTMLDivElement, MobileNavigationProps>(
  ({ 
    isOpen,
    onToggle,
    items = [],
    variant = 'slide',
    position = 'left',
    ...props 
  }, ref) => {
    const pathname = usePathname();

    const defaultItems: NavigationItem[] = [
      { label: 'Home', href: '/', icon: <Home size={20} /> },
      { label: 'About', href: '/about', icon: <User size={20} /> },
      { label: 'Thesis', href: '/thesis', icon: <Settings size={20} /> },
      { label: 'Insights', href: '/insights', icon: <Search size={20} /> },
    ];

    const navigationItems = items.length > 0 ? items : defaultItems;

    const variants = {
      slide: 'transform transition-transform duration-300 ease-in-out',
      overlay: 'transform transition-all duration-300 ease-in-out',
      push: 'transform transition-transform duration-300 ease-in-out',
    };

    const positions = {
      left: {
        container: 'left-0 top-0 h-full w-80',
        transform: isOpen ? 'translate-x-0' : '-translate-x-full',
      },
      right: {
        container: 'right-0 top-0 h-full w-80',
        transform: isOpen ? 'translate-x-0' : 'translate-x-full',
      },
      bottom: {
        container: 'bottom-0 left-0 right-0 h-96',
        transform: isOpen ? 'translate-y-0' : 'translate-y-full',
      },
    };

    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => onToggle(false)}
          />
        )}

        {/* Navigation Panel */}
        <nav
          className={cn(
            'fixed bg-background border-r border-border z-50 lg:hidden',
            positions[position].container,
            variants[variant],
            positions[position].transform
          )}
          ref={ref}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={() => onToggle(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navigationItems.map((item, index) => (
                <li key={index}>
                  <MobileNavigationItem
                    href={item.href}
                    icon={item.icon}
                    badge={item.badge}
                    active={pathname === item.href}
                    disabled={item.disabled}
                    onClick={() => onToggle(false)}
                  >
                    {item.label}
                  </MobileNavigationItem>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </>
    );
  }
);

MobileNavigation.displayName = 'MobileNavigation';

interface MobileNavigationItemProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  icon?: ReactNode;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

const MobileNavigationItem = forwardRef<HTMLAnchorElement, MobileNavigationItemProps>(
  ({ 
    className,
    href,
    icon,
    badge,
    active = false,
    disabled = false,
    hapticFeedback = false,
    children,
    ...props 
  }, ref) => {
    const { state, handlers } = useInteractionFeedback({
      disabled,
      hapticFeedback,
    });

    if (disabled) {
      return (
        <span
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground cursor-not-allowed opacity-50',
            className
          )}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="flex-1">{children}</span>
          {badge && (
            <span className="flex-shrink-0 px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
              {badge}
            </span>
          )}
        </span>
      );
    }

    return (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors touch-target',
          active 
            ? 'bg-primary text-primary-foreground' 
            : 'text-foreground hover:bg-muted',
          state.isPressed && 'scale-95',
          className
        )}
        ref={ref}
        {...handlers}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
        {badge && (
          <span className={cn(
            'flex-shrink-0 px-2 py-0.5 text-xs rounded-full',
            active 
              ? 'bg-primary-foreground/20 text-primary-foreground' 
              : 'bg-primary text-primary-foreground'
          )}>
            {badge}
          </span>
        )}
      </Link>
    );
  }
);

MobileNavigationItem.displayName = 'MobileNavigationItem';

interface MobileBreadcrumbProps extends HTMLAttributes<HTMLDivElement> {
  items: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
  separator?: ReactNode;
  hapticFeedback?: boolean;
}

const MobileBreadcrumb = forwardRef<HTMLDivElement, MobileBreadcrumbProps>(
  ({ 
    className,
    items,
    separator = <ChevronRight size={16} />,
    hapticFeedback = false,
    ...props 
  }, ref) => {
    return (
      <nav
        className={cn('flex items-center space-x-1 text-sm', className)}
        ref={ref}
        {...props}
      >
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <span className="text-muted-foreground mx-1">
                {separator}
              </span>
            )}
            {item.href && !item.active ? (
              <MobileBreadcrumbLink
                href={item.href}
                hapticFeedback={hapticFeedback}
              >
                {item.label}
              </MobileBreadcrumbLink>
            ) : (
              <span
                className={cn(
                  'px-2 py-1 rounded',
                  item.active 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground'
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

interface MobileBreadcrumbLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  hapticFeedback?: boolean;
}

const MobileBreadcrumbLink = forwardRef<HTMLAnchorElement, MobileBreadcrumbLinkProps>(
  ({ 
    className,
    href,
    hapticFeedback = false,
    children,
    ...props 
  }, ref) => {
    const { state, handlers } = useInteractionFeedback({
      hapticFeedback,
    });

    return (
      <Link
        href={href}
        className={cn(
          'px-2 py-1 rounded text-muted-foreground hover:text-foreground transition-colors touch-target',
          state.isPressed && 'scale-95',
          className
        )}
        ref={ref}
        {...handlers}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

MobileBreadcrumbLink.displayName = 'MobileBreadcrumbLink';

interface MobileBackButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  href?: string;
  onBack?: () => void;
  label?: string;
  icon?: ReactNode;
  hapticFeedback?: boolean;
}

const MobileBackButton = forwardRef<HTMLButtonElement, MobileBackButtonProps>(
  ({ 
    className,
    href,
    onBack,
    label = 'Back',
    icon = <ArrowLeft size={16} />,
    hapticFeedback = false,
    ...props 
  }, ref) => {
    const { state, handlers } = useInteractionFeedback({
      hapticFeedback,
    });

    const handleClick = () => {
      if (onBack) {
        onBack();
      } else if (href) {
        window.location.href = href;
      } else {
        window.history.back();
      }
    };

    return (
      <button
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors touch-target rounded-lg hover:bg-muted',
          state.isPressed && 'scale-95',
          className
        )}
        onClick={handleClick}
        ref={ref}
        {...handlers}
        {...props}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }
);

MobileBackButton.displayName = 'MobileBackButton';

export {
  MobileNavigation,
  MobileNavigationItem,
  MobileBreadcrumb,
  MobileBackButton,
};