'use client';

import { HTMLAttributes, forwardRef, ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronRight,
  Grid3X3,
  List,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Star,
  Heart,
  Share,
  Bookmark,
  MoreHorizontal,
  Plus,
  Minus
} from 'lucide-react';
import { useInteractionFeedback } from '@/hooks/useInteractionFeedback';
import { useHapticFeedback } from '@/hooks/useGestures';

// ===== MOBILE CARD PATTERNS =====

interface MobileCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'interactive';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  expandable?: boolean;
  defaultExpanded?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  onExpand?: (expanded: boolean) => void;
  onInteract?: () => void;
}

const MobileCard = forwardRef<HTMLDivElement, MobileCardProps>(
  ({ 
    className,
    variant = 'default',
    size = 'md',
    interactive = false,
    expandable = false,
    defaultExpanded = false,
    header,
    footer,
    actions,
    onExpand,
    onInteract,
    children,
    ...props 
  }, ref) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const { state, handlers } = useInteractionFeedback({
      hapticFeedback: interactive,
    });
    const { triggerSelectionHaptic } = useHapticFeedback();

    const variants = {
      default: 'bg-card border border-border',
      elevated: 'bg-card border border-border shadow-md',
      outlined: 'bg-transparent border-2 border-border',
      ghost: 'bg-transparent',
      interactive: 'bg-card border border-border hover:shadow-md hover:border-primary/50 cursor-pointer',
    };

    const sizes = {
      sm: 'p-3 rounded-md',
      md: 'p-4 rounded-lg',
      lg: 'p-6 rounded-xl',
    };

    const handleExpand = () => {
      if (expandable) {
        triggerSelectionHaptic();
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        onExpand?.(newExpanded);
      }
    };

    const handleInteract = () => {
      if (interactive) {
        onInteract?.();
      }
    };

    return (
      <div
        className={cn(
          'mobile-card transition-all duration-200',
          variants[variant],
          sizes[size],
          interactive && 'touch-target',
          state.isPressed && interactive && 'transform scale-[0.98]',
          className
        )}
        onClick={interactive ? handleInteract : undefined}
        ref={ref}
        {...(interactive ? handlers : {})}
        {...props}
      >
        {/* Header */}
        {(header || expandable) && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              {header}
            </div>
            
            <div className="flex items-center gap-2 ml-3">
              {actions}
              {expandable && (
                <button
                  onClick={handleExpand}
                  className="touch-target p-1 rounded hover:bg-secondary transition-colors"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  <ChevronDown 
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isExpanded && 'rotate-180'
                    )} 
                  />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className={cn(
          expandable && !isExpanded && 'line-clamp-3 overflow-hidden'
        )}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-3 pt-3 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

MobileCard.displayName = 'MobileCard';

// ===== MOBILE LIST PATTERNS =====

interface MobileListProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'divided' | 'cards' | 'compact';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const MobileList = forwardRef<HTMLDivElement, MobileListProps>(
  ({ className, variant = 'default', spacing = 'md', interactive = false, children, ...props }, ref) => {
    const variants = {
      default: 'space-y-2',
      divided: 'divide-y divide-border',
      cards: 'space-y-3',
      compact: 'space-y-1',
    };

    const spacings = {
      none: variant === 'divided' ? '' : 'space-y-0',
      sm: variant === 'divided' ? '' : 'space-y-1',
      md: variant === 'divided' ? '' : 'space-y-2',
      lg: variant === 'divided' ? '' : 'space-y-4',
    };

    return (
      <div
        className={cn(
          'mobile-list',
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

MobileList.displayName = 'MobileList';

interface MobileListItemProps {
  className?: string;
  children?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  subtitle?: string;
  description?: string;
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  href?: string;
  onSelect?: () => void;
}

const MobileListItem = forwardRef<HTMLDivElement, MobileListItemProps>(
  ({ 
    className,
    leading,
    trailing,
    subtitle,
    description,
    interactive = false,
    selected = false,
    disabled = false,
    href,
    onSelect,
    children,
    ...props 
  }, ref) => {
    const { state, handlers } = useInteractionFeedback({
      disabled,
      hapticFeedback: interactive,
    });



    const content = (
      <>
        {leading && (
          <div className="flex-shrink-0 mr-3">
            {leading}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className={cn(
                'font-medium',
                selected && 'text-primary',
                disabled && 'text-muted-foreground'
              )}>
                {children}
              </div>
              {subtitle && (
                <div className="text-sm text-muted-foreground mt-0.5">
                  {subtitle}
                </div>
              )}
            </div>
            
            {trailing && (
              <div className="flex-shrink-0 ml-3">
                {trailing}
              </div>
            )}
          </div>
          
          {description && (
            <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </div>
          )}
        </div>
      </>
    );

    const baseClasses = cn(
      'mobile-list-item flex items-start p-3 rounded-lg transition-all',
      interactive && 'touch-target cursor-pointer hover:bg-secondary',
      selected && 'bg-primary/10 border border-primary/20',
      disabled && 'opacity-50 cursor-not-allowed',
      state.isPressed && interactive && 'transform scale-[0.98] bg-secondary',
      className
    );

    if (href && !disabled) {
      return (
        <a
          href={href}
          className={baseClasses}
          ref={ref as any}
          {...handlers}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (!disabled && interactive) {
              onSelect?.();
            }
          }}
        >
          {content}
        </a>
      );
    }

    return (
      <div
        className={baseClasses}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!disabled && interactive) {
            onSelect?.();
          }
        }}
        ref={ref}
        {...(interactive ? handlers : {})}
      >
        {content}
      </div>
    );
  }
);

MobileListItem.displayName = 'MobileListItem';

// ===== MOBILE GRID PATTERNS =====

interface MobileGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  responsive?: boolean;
  aspectRatio?: 'square' | '4:3' | '16:9' | 'auto';
}

const MobileGrid = forwardRef<HTMLDivElement, MobileGridProps>(
  ({ 
    className, 
    columns = 2, 
    gap = 'md', 
    responsive = true, 
    aspectRatio = 'auto',
    children, 
    ...props 
  }, ref) => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: responsive ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2',
      3: responsive ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
      4: responsive ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-4',
    };

    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-3 sm:gap-4',
      lg: 'gap-4 sm:gap-6',
    };

    const aspectRatioClasses = {
      square: '[&>*]:aspect-square',
      '4:3': '[&>*]:aspect-[4/3]',
      '16:9': '[&>*]:aspect-video',
      auto: '',
    };

    return (
      <div
        className={cn(
          'mobile-grid grid',
          columnClasses[columns],
          gapClasses[gap],
          aspectRatioClasses[aspectRatio],
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

MobileGrid.displayName = 'MobileGrid';

// ===== MOBILE STACK PATTERNS =====

interface MobileStackProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  divider?: boolean;
}

const MobileStack = forwardRef<HTMLDivElement, MobileStackProps>(
  ({ 
    className, 
    spacing = 'md', 
    align = 'stretch', 
    divider = false,
    children, 
    ...props 
  }, ref) => {
    const spacingClasses = {
      none: divider ? 'divide-y divide-border' : 'space-y-0',
      xs: divider ? 'divide-y divide-border [&>*]:py-1' : 'space-y-1',
      sm: divider ? 'divide-y divide-border [&>*]:py-2' : 'space-y-2',
      md: divider ? 'divide-y divide-border [&>*]:py-3' : 'space-y-3 sm:space-y-4',
      lg: divider ? 'divide-y divide-border [&>*]:py-4' : 'space-y-4 sm:space-y-6',
      xl: divider ? 'divide-y divide-border [&>*]:py-6' : 'space-y-6 sm:space-y-8',
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };

    return (
      <div
        className={cn(
          'mobile-stack flex flex-col',
          spacingClasses[spacing],
          alignClasses[align],
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

MobileStack.displayName = 'MobileStack';

// ===== MOBILE ACTION PATTERNS =====

interface MobileActionBarProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'floating' | 'sticky' | 'inline';
  position?: 'top' | 'bottom';
  actions: Array<{
    icon: ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'destructive';
    disabled?: boolean;
    badge?: string | number;
  }>;
}

const MobileActionBar = forwardRef<HTMLDivElement, MobileActionBarProps>(
  ({ 
    className,
    variant = 'sticky',
    position = 'bottom',
    actions,
    ...props 
  }, ref) => {
    const variants = {
      floating: cn(
        'fixed left-4 right-4 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg z-30',
        position === 'top' ? 'top-4' : 'bottom-4'
      ),
      sticky: cn(
        'sticky bg-background/95 backdrop-blur-sm border-t border-border z-20',
        position === 'top' ? 'top-0' : 'bottom-0'
      ),
      inline: 'bg-muted/30 rounded-lg',
    };

    return (
      <div
        className={cn(
          'mobile-action-bar p-3',
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="flex items-center justify-around gap-2">
          {actions.map((action, index) => (
            <MobileActionButton
              key={index}
              icon={action.icon}
              label={action.label}
              onClick={action.onClick}
              variant={action.variant}
              disabled={action.disabled}
              badge={action.badge}
            />
          ))}
        </div>
      </div>
    );
  }
);

MobileActionBar.displayName = 'MobileActionBar';

interface MobileActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  badge?: string | number;
  size?: 'sm' | 'md' | 'lg';
}

const MobileActionButton = ({ 
  icon, 
  label, 
  onClick, 
  variant = 'default',
  disabled = false,
  badge,
  size = 'md'
}: MobileActionButtonProps) => {
  const { state, handlers } = useInteractionFeedback({
    disabled,
    hapticFeedback: true,
  });

  const variants = {
    default: 'text-muted-foreground hover:text-foreground hover:bg-secondary',
    primary: 'text-primary hover:text-primary-foreground hover:bg-primary',
    secondary: 'text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary',
    destructive: 'text-destructive hover:text-destructive-foreground hover:bg-destructive',
  };

  const sizes = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'mobile-action-button touch-target relative flex flex-col items-center gap-1 rounded-lg transition-all min-w-0',
        variants[variant],
        sizes[size],
        state.isPressed && 'transform scale-95',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={label}
      {...handlers}
    >
      <div className="relative">
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="font-medium truncate max-w-full">
        {label}
      </span>
    </button>
  );
};

// ===== MOBILE SEARCH PATTERNS =====

interface MobileSearchBarProps extends HTMLAttributes<HTMLDivElement> {
  placeholder?: string;
  value?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  showFilter?: boolean;
  showSort?: boolean;
  onFilter?: () => void;
  onSort?: () => void;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}

const MobileSearchBar = forwardRef<HTMLDivElement, MobileSearchBarProps>(
  ({ 
    className,
    placeholder = 'Search...',
    value = '',
    onSearch,
    onClear,
    showFilter = false,
    showSort = false,
    onFilter,
    onSort,
    suggestions = [],
    onSuggestionSelect,
    ...props 
  }, ref) => {
    const [searchValue, setSearchValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSearchChange = (query: string) => {
      setSearchValue(query);
      onSearch?.(query);
      setShowSuggestions(query.length > 0 && suggestions.length > 0);
    };

    const handleClear = () => {
      setSearchValue('');
      onSearch?.('');
      onClear?.();
      setShowSuggestions(false);
    };

    const handleSuggestionSelect = (suggestion: string) => {
      setSearchValue(suggestion);
      onSearch?.(suggestion);
      onSuggestionSelect?.(suggestion);
      setShowSuggestions(false);
    };

    return (
      <div className={cn('mobile-search-bar relative', className)} ref={ref} {...props}>
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchValue && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            )}
          </div>
          
          {showFilter && (
            <button
              onClick={onFilter}
              className="touch-target p-2 rounded-md hover:bg-secondary transition-colors"
              aria-label="Filter"
            >
              <Filter className="w-5 h-5" />
            </button>
          )}
          
          {showSort && (
            <button
              onClick={onSort}
              className="touch-target p-2 rounded-md hover:bg-secondary transition-colors"
              aria-label="Sort"
            >
              <SortAsc className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors border-b border-border last:border-b-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

MobileSearchBar.displayName = 'MobileSearchBar';

export {
  MobileCard,
  MobileList,
  MobileListItem,
  MobileGrid,
  MobileStack,
  MobileActionBar,
  MobileActionButton,
  MobileSearchBar,
};