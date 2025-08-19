'use client';

import { HTMLAttributes, forwardRef, ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  Share, 
  Bookmark, 
  MoreVertical,
  ChevronUp,
  Search,
  Filter
} from 'lucide-react';
import { MobileLayout, MobilePageHeader, MobilePageFooter } from './MobileLayout';
import { MobileBreadcrumb, MobileBackButton } from './MobileNavigation';
import { MobileContentFilter } from './MobileContentOrganization';
import { useInteractionFeedback } from '@/hooks/useInteractionFeedback';
import { useHapticFeedback } from '@/hooks/useGestures';

interface MobilePageWrapperProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showBreadcrumb?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  showShare?: boolean;
  showBookmark?: boolean;
  showScrollToTop?: boolean;
  headerActions?: ReactNode;
  footerActions?: ReactNode;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
  searchPlaceholder?: string;
  filterOptions?: Array<{ label: string; value: string }>;
  onSearch?: (query: string) => void;
  onFilter?: (filter: string) => void;
  onShare?: () => void;
  onBookmark?: () => void;
  variant?: 'default' | 'centered' | 'full-width';
  contentSpacing?: 'sm' | 'md' | 'lg';
}

const MobilePageWrapper = forwardRef<HTMLDivElement, MobilePageWrapperProps>(
  ({ 
    className,
    title,
    subtitle,
    showBackButton = true,
    showBreadcrumb = false,
    showSearch = false,
    showFilter = false,
    showShare = false,
    showBookmark = false,
    showScrollToTop = true,
    headerActions,
    footerActions,
    breadcrumbItems = [],
    searchPlaceholder = 'Search...',
    filterOptions = [],
    onSearch,
    onFilter,
    onShare,
    onBookmark,
    variant = 'default',
    contentSpacing = 'md',
    children,
    ...props 
  }, ref) => {
    const pathname = usePathname();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const { triggerImpactHaptic } = useHapticFeedback();

    // Auto-generate breadcrumb items if not provided
    const defaultBreadcrumbItems = breadcrumbItems.length > 0 ? breadcrumbItems : 
      pathname.split('/').filter(Boolean).map((segment, index, array) => ({
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        href: index < array.length - 1 ? '/' + array.slice(0, index + 1).join('/') : undefined,
        active: index === array.length - 1,
      }));

    // Add home breadcrumb if not present
    if (defaultBreadcrumbItems.length > 0 && defaultBreadcrumbItems[0].label !== 'Home') {
      defaultBreadcrumbItems.unshift({ label: 'Home', href: '/' });
    }

    // Handle scroll to top visibility
    useEffect(() => {
      const handleScroll = () => {
        setShowScrollTop(window.scrollY > 400);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScrollToTop = () => {
      triggerImpactHaptic('light');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    };

    const handleFilter = (filter: string) => {
      setFilterValue(filter);
      onFilter?.(filter);
    };

    const handleShare = () => {
      triggerImpactHaptic('medium');
      if (navigator.share) {
        navigator.share({
          title: title,
          text: subtitle,
          url: window.location.href,
        });
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
      onShare?.();
    };

    const handleBookmark = () => {
      triggerImpactHaptic('light');
      onBookmark?.();
    };

    // Build header actions
    const allHeaderActions = (
      <div className="flex items-center gap-2">
        {headerActions}
        
        {showBookmark && (
          <MobileActionButton
            icon={<Bookmark className="w-5 h-5" />}
            label="Bookmark"
            onClick={handleBookmark}
          />
        )}
        
        {showShare && (
          <MobileActionButton
            icon={<Share className="w-5 h-5" />}
            label="Share"
            onClick={handleShare}
          />
        )}
        
        <MobileActionButton
          icon={<MoreVertical className="w-5 h-5" />}
          label="More options"
          onClick={() => {}}
        />
      </div>
    );

    const spacingClasses = {
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8',
    };

    return (
      <MobileLayout
        showNavigation={true}
        showBreadcrumb={showBreadcrumb}
        showBackButton={showBackButton}
        breadcrumbItems={defaultBreadcrumbItems}
        variant={variant}
        className={className}
        ref={ref}
        {...props}
      >
        <MobilePageHeader
          title={title}
          subtitle={subtitle}
          actions={allHeaderActions}
          variant="default"
        />

        {/* Search and Filter Bar */}
        {(showSearch || showFilter) && (
          <div className="mb-6">
            <MobileContentFilter
              showSearch={showSearch}
              showFilter={showFilter}
              showViewToggle={false}
              showSortToggle={false}
              searchPlaceholder={searchPlaceholder}
              filterOptions={filterOptions}
              onSearchChange={handleSearch}
              onFilterChange={handleFilter}
            />
          </div>
        )}

        {/* Main Content */}
        <div className={cn(spacingClasses[contentSpacing])}>
          {children}
        </div>

        {/* Footer Actions */}
        {footerActions && (
          <MobilePageFooter variant="sticky">
            {footerActions}
          </MobilePageFooter>
        )}

        {/* Scroll to Top Button */}
        {showScrollToTop && showScrollTop && (
          <button
            onClick={handleScrollToTop}
            className="fixed bottom-6 right-6 z-30 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 touch-target"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </MobileLayout>
    );
  }
);

MobilePageWrapper.displayName = 'MobilePageWrapper';

interface MobileActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'secondary';
}

const MobileActionButton = ({ 
  icon, 
  label, 
  onClick, 
  disabled = false,
  variant = 'default' 
}: MobileActionButtonProps) => {
  const { state, handlers } = useInteractionFeedback({
    disabled,
    hapticFeedback: true,
  });

  const variants = {
    default: 'text-muted-foreground hover:text-foreground hover:bg-secondary',
    primary: 'text-primary hover:text-primary-foreground hover:bg-primary',
    secondary: 'text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'touch-target p-2 rounded-lg transition-all',
        variants[variant],
        state.isPressed && 'transform scale-95',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={label}
      {...handlers}
    >
      {icon}
    </button>
  );
};

interface MobileQuickActionsProps {
  actions: Array<{
    icon: ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary';
    disabled?: boolean;
  }>;
  className?: string;
}

const MobileQuickActions = ({ actions, className }: MobileQuickActionsProps) => (
  <div className={cn('flex items-center gap-2 p-3 bg-muted/30 rounded-lg', className)}>
    {actions.map((action, index) => (
      <MobileActionButton
        key={index}
        icon={action.icon}
        label={action.label}
        onClick={action.onClick}
        variant={action.variant}
        disabled={action.disabled}
      />
    ))}
  </div>
);

interface MobilePageSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  variant?: 'default' | 'card' | 'bordered';
}

const MobilePageSection = forwardRef<HTMLDivElement, MobilePageSectionProps>(
  ({ 
    className,
    title,
    subtitle,
    actions,
    collapsible = false,
    defaultExpanded = true,
    variant = 'default',
    children,
    ...props 
  }, ref) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const { triggerSelectionHaptic } = useHapticFeedback();

    const variants = {
      default: 'space-y-4',
      card: 'bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4',
      bordered: 'border-b border-border pb-6 mb-6 space-y-4',
    };

    const handleToggle = () => {
      triggerSelectionHaptic();
      setIsExpanded(!isExpanded);
    };

    return (
      <div
        className={cn(variants[variant], className)}
        ref={ref}
        {...props}
      >
        {(title || subtitle || actions || collapsible) && (
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {actions}
              {collapsible && (
                <button
                  onClick={handleToggle}
                  className="touch-target p-2 rounded-lg hover:bg-secondary transition-colors"
                  aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                >
                  <ChevronUp 
                    className={cn(
                      'w-5 h-5 transition-transform',
                      !isExpanded && 'rotate-180'
                    )} 
                  />
                </button>
              )}
            </div>
          </div>
        )}
        
        {(!collapsible || isExpanded) && (
          <div className={cn(
            'transition-all duration-300',
            collapsible && !isExpanded && 'opacity-0 max-h-0 overflow-hidden'
          )}>
            {children}
          </div>
        )}
      </div>
    );
  }
);

MobilePageSection.displayName = 'MobilePageSection';

export {
  MobilePageWrapper,
  MobileActionButton,
  MobileQuickActions,
  MobilePageSection,
};