import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'content';
  padding?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'content', padding = true, children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-container-sm',
      md: 'max-w-container-md',
      lg: 'max-w-container-lg',
      xl: 'max-w-container-xl',
      '2xl': 'max-w-container-2xl',
      content: 'max-w-container-content',
    };

    const paddingClasses = padding ? 'px-6 sm:px-8' : '';

    return (
      <div
        className={cn(
          'mx-auto w-full',
          sizeClasses[size],
          paddingClasses,
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

Container.displayName = 'Container';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'muted' | 'primary' | 'secondary';
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, padding = 'lg', background = 'default', children, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-24',
    };

    const backgroundClasses = {
      default: 'bg-background',
      muted: 'bg-muted/10',
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary',
    };

    return (
      <section
        className={cn(
          paddingClasses[padding],
          backgroundClasses[background],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 'md', responsive = true, children, ...props }, ref) => {
    const colClasses = {
      1: 'grid-cols-1',
      2: responsive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2',
      3: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
      4: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4',
      5: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' : 'grid-cols-5',
      6: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'grid-cols-6',
      12: 'grid-cols-12',
    };

    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    };

    return (
      <div
        className={cn(
          'grid',
          colClasses[cols],
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

Grid.displayName = 'Grid';

interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({ 
    className, 
    direction = 'row', 
    align = 'start', 
    justify = 'start', 
    wrap = false,
    gap = 'none',
    children, 
    ...props 
  }, ref) => {
    const directionClasses = {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse',
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    };

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };

    const gapClasses = {
      none: '',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    return (
      <div
        className={cn(
          'flex',
          directionClasses[direction],
          alignClasses[align],
          justifyClasses[justify],
          wrap && 'flex-wrap',
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

Flex.displayName = 'Flex';

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, spacing = 'md', align = 'stretch', children, ...props }, ref) => {
    const spacingClasses = {
      none: 'space-y-0',
      xs: 'space-y-1',
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
      xl: 'space-y-8',
      '2xl': 'space-y-12',
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
          'flex flex-col',
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

Stack.displayName = 'Stack';

interface CenterProps extends HTMLAttributes<HTMLDivElement> {
  axis?: 'both' | 'horizontal' | 'vertical';
}

const Center = forwardRef<HTMLDivElement, CenterProps>(
  ({ className, axis = 'both', children, ...props }, ref) => {
    const axisClasses = {
      both: 'flex items-center justify-center',
      horizontal: 'flex justify-center',
      vertical: 'flex items-center',
    };

    return (
      <div
        className={cn(axisClasses[axis], className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Center.displayName = 'Center';

export { Container, Section, Grid, Flex, Stack, Center };