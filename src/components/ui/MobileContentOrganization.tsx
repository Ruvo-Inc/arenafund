'use client';

import { HTMLAttributes, forwardRef, ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronUp, 
  Grid, 
  List, 
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff
} from 'lucide-react';
import { useInteractionFeedback } from '@/hooks/useInteractionFeedback';
import { useHapticFeedback } from '@/hooks/useGestures';

interface MobileContentContainerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'padded' | 'full-width';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const MobileContentContainer = forwardRef<HTMLDivElement, MobileContentContainerProps>(
  ({ className, variant = 'default', spacing = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'max-w-screen-xl mx-auto',
      padded: 'max-w-screen-xl mx-auto px-4 sm:px-6',
      'full-width': 'w-full',
    };

    const spacings = {
      none: '',
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8',
    };

    return (
      <div
        className={cn(
          variants[variant],
          spacings[spacing],
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

MobileContentContainer.displayName = 'MobileContentContainer';

interface MobileContentSectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  headerActions?: ReactNode;
  variant?: 'default' | 'card' | 'bordered';
}

const MobileContentSection = forwardRef<HTMLElement, MobileContentSectionProps>(
  ({ 
    className, 
    title, 
    subtitle,
    collapsible = false,
    defaultExpanded = true,
    headerActions,
    variant = 'default',
    children, 
    ...props 
  }, ref) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const { triggerSelectionHaptic } = useHapticFeedback();

    const variants = {
      default: '',
      card: 'bg-card border border-border rounded-lg p-4 sm:p-6',
      bordered: 'border-b border-border pb-6 mb-6',
    };

    const handleToggle = () => {
      triggerSelectionHaptic();
      setIsExpanded(!isExpanded);
    };

    return (
      <section
        className={cn(variants[variant], className)}
        ref={ref}
        {...props}
      >
        {(title || subtitle || headerActions || collapsible) && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
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
              
              <div className="flex items-center gap-2">
                {headerActions}
                {collapsible && (
                  <button
                    onClick={handleToggle}
                    className="touch-target p-2 rounded-lg hover:bg-secondary transition-colors"
                    aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
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
      </section>
    );
  }
);

MobileContentSection.displayName = 'MobileContentSection';

interface MobileContentGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

const MobileContentGrid = forwardRef<HTMLDivElement, MobileContentGridProps>(
  ({ className, columns = 1, gap = 'md', responsive = true, children, ...props }, ref) => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: responsive ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2',
      3: responsive ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
    };

    const gapClasses = {
      sm: 'gap-3',
      md: 'gap-4 sm:gap-6',
      lg: 'gap-6 sm:gap-8',
    };

    return (
      <div
        className={cn(
          'grid',
          columnClasses[columns],
          gapClasses[gap],
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

MobileContentGrid.displayName = 'MobileContentGrid';

interface MobileContentListProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'divided' | 'cards';
  spacing?: 'sm' | 'md' | 'lg';
}

const MobileContentList = forwardRef<HTMLDivElement, MobileContentListProps>(
  ({ className, variant = 'default', spacing = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'space-y-2',
      divided: 'divide-y divide-border',
      cards: 'space-y-3',
    };

    const spacings = {
      sm: variant === 'divided' ? '' : 'space-y-1',
      md: variant === 'divided' ? '' : 'space-y-2',
      lg: variant === 'divided' ? '' : 'space-y-4',
    };

    return (
      <div
        className={cn(
          variants[variant],
          variant !== 'divided' && spacings[spacing],
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

MobileContentList.displayName = 'MobileContentList';

interface MobileContentFilterProps extends HTMLAttributes<HTMLDivElement> {
  onViewChange?: (view: 'grid' | 'list') => void;
  onSortChange?: (sort: 'asc' | 'desc') => void;
  onFilterChange?: (filter: string) => void;
  onSearchChange?: (search: string) => void;
  currentView?: 'grid' | 'list';
  currentSort?: 'asc' | 'desc';
  showViewToggle?: boolean;
  showSortToggle?: boolean;
  showFilter?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  filterOptions?: Array<{ label: string; value: string }>;
}

const MobileContentFilter = forwardRef<HTMLDivElement, MobileContentFilterProps>(
  ({ 
    className,
    onViewChange,
    onSortChange,
    onFilterChange,
    onSearchChange,
    currentView = 'grid',
    currentSort = 'asc',
    showViewToggle = true,
    showSortToggle = true,
    showFilter = false,
    showSearch = false,
    searchPlaceholder = 'Search...',
    filterOptions = [],
    ...props 
  }, ref) => {
    const [searchValue, setSearchValue] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const { triggerSelectionHaptic } = useHapticFeedback();

    const handleSearchChange = (value: string) => {
      setSearchValue(value);
      onSearchChange?.(value);
    };

    const handleFilterChange = (value: string) => {
      setFilterValue(value);
      onFilterChange?.(value);
    };

    const handleViewToggle = () => {
      triggerSelectionHaptic();
      onViewChange?.(currentView === 'grid' ? 'list' : 'grid');
    };

    const handleSortToggle = () => {
      triggerSelectionHaptic();
      onSortChange?.(currentSort === 'asc' ? 'desc' : 'asc');
    };

    const handleFilterToggle = () => {
      triggerSelectionHaptic();
      setIsExpanded(!isExpanded);
    };

    return (
      <div
        className={cn('mobile-content-filter', className)}
        ref={ref}
        {...props}
      >
        {/* Main Filter Bar */}
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
          {/* Search */}
          {showSearch && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {/* Filter Toggle */}
          {(showFilter && filterOptions.length > 0) && (
            <button
              onClick={handleFilterToggle}
              className="touch-target p-2 rounded-md hover:bg-secondary transition-colors"
              aria-label="Toggle filters"
            >
              <Filter className="w-5 h-5" />
            </button>
          )}

          {/* Sort Toggle */}
          {showSortToggle && (
            <button
              onClick={handleSortToggle}
              className="touch-target p-2 rounded-md hover:bg-secondary transition-colors"
              aria-label={`Sort ${currentSort === 'asc' ? 'descending' : 'ascending'}`}
            >
              {currentSort === 'asc' ? (
                <SortAsc className="w-5 h-5" />
              ) : (
                <SortDesc className="w-5 h-5" />
              )}
            </button>
          )}

          {/* View Toggle */}
          {showViewToggle && (
            <button
              onClick={handleViewToggle}
              className="touch-target p-2 rounded-md hover:bg-secondary transition-colors"
              aria-label={`Switch to ${currentView === 'grid' ? 'list' : 'grid'} view`}
            >
              {currentView === 'grid' ? (
                <List className="w-5 h-5" />
              ) : (
                <Grid className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Expanded Filter Options */}
        {isExpanded && showFilter && filterOptions.length > 0 && (
          <div className="mt-3 p-3 bg-muted/20 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={cn(
                    'touch-target px-3 py-2 text-sm rounded-md transition-colors text-left',
                    filterValue === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-secondary'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

MobileContentFilter.displayName = 'MobileContentFilter';

interface MobileContentAccordionProps extends HTMLAttributes<HTMLDivElement> {
  items: Array<{
    id: string;
    title: string;
    content: ReactNode;
    defaultExpanded?: boolean;
  }>;
  allowMultiple?: boolean;
  hapticFeedback?: boolean;
}

const MobileContentAccordion = forwardRef<HTMLDivElement, MobileContentAccordionProps>(
  ({ 
    className, 
    items, 
    allowMultiple = false,
    hapticFeedback = true,
    ...props 
  }, ref) => {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(
      new Set(items.filter(item => item.defaultExpanded).map(item => item.id))
    );
    const { triggerSelectionHaptic } = useHapticFeedback();

    const handleToggle = (itemId: string) => {
      if (hapticFeedback) {
        triggerSelectionHaptic();
      }

      setExpandedItems(prev => {
        const newSet = new Set(prev);
        
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          if (!allowMultiple) {
            newSet.clear();
          }
          newSet.add(itemId);
        }
        
        return newSet;
      });
    };

    return (
      <div
        className={cn('mobile-content-accordion space-y-2', className)}
        ref={ref}
        {...props}
      >
        {items.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          
          return (
            <div
              key={item.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => handleToggle(item.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary transition-colors"
                aria-expanded={isExpanded}
              >
                <span className="font-medium">{item.title}</span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border">
                  <div className="pt-4">
                    {item.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

MobileContentAccordion.displayName = 'MobileContentAccordion';

interface MobileContentTabsProps extends HTMLAttributes<HTMLDivElement> {
  tabs: Array<{
    id: string;
    label: string;
    content: ReactNode;
    badge?: string | number;
  }>;
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  hapticFeedback?: boolean;
}

const MobileContentTabs = forwardRef<HTMLDivElement, MobileContentTabsProps>(
  ({ 
    className, 
    tabs, 
    defaultTab,
    onTabChange,
    variant = 'default',
    hapticFeedback = true,
    ...props 
  }, ref) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
    const { triggerSelectionHaptic } = useHapticFeedback();

    const handleTabChange = (tabId: string) => {
      if (hapticFeedback) {
        triggerSelectionHaptic();
      }
      setActiveTab(tabId);
      onTabChange?.(tabId);
    };

    const variants = {
      default: {
        container: 'border-b border-border',
        tab: 'px-4 py-3 font-medium text-sm border-b-2 transition-colors',
        activeTab: 'border-primary text-primary',
        inactiveTab: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
      },
      pills: {
        container: 'bg-muted p-1 rounded-lg',
        tab: 'px-4 py-2 font-medium text-sm rounded-md transition-colors',
        activeTab: 'bg-background text-foreground shadow-sm',
        inactiveTab: 'text-muted-foreground hover:text-foreground',
      },
      underline: {
        container: '',
        tab: 'px-4 py-3 font-medium text-sm relative transition-colors',
        activeTab: 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary',
        inactiveTab: 'text-muted-foreground hover:text-foreground',
      },
    };

    const currentVariant = variants[variant];

    return (
      <div
        className={cn('mobile-content-tabs', className)}
        ref={ref}
        {...props}
      >
        {/* Tab Headers */}
        <div className={cn('flex overflow-x-auto touch-scroll', currentVariant.container)}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'touch-target flex-shrink-0 flex items-center gap-2',
                currentVariant.tab,
                activeTab === tab.id ? currentVariant.activeTab : currentVariant.inactiveTab
              )}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                'transition-all duration-200',
                activeTab === tab.id ? 'block' : 'hidden'
              )}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

MobileContentTabs.displayName = 'MobileContentTabs';

export {
  MobileContentContainer,
  MobileContentSection,
  MobileContentGrid,
  MobileContentList,
  MobileContentFilter,
  MobileContentAccordion,
  MobileContentTabs,
};