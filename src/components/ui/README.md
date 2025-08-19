# Arena Fund UI Component Library

A comprehensive, reusable component library built for The Arena Fund website, following the Arena Fund Visual Enhancement Design System.

## Overview

This component library provides a complete set of UI components that implement the Arena Fund design system, ensuring consistency across all pages and interactions. All components are built with TypeScript, React, and Tailwind CSS, following accessibility best practices and responsive design principles.

## Design Principles

- **Consistency**: All components follow the same design patterns and use standardized design tokens
- **Accessibility**: Components are built with ARIA attributes and keyboard navigation support
- **Responsiveness**: Mobile-first design with responsive breakpoints
- **Performance**: Optimized for fast loading and smooth animations
- **Flexibility**: Highly customizable with variant and size options

## Component Categories

### Core Components
- **Button**: Primary interaction element with multiple variants and states
- **Input**: Text input fields with validation and icon support
- **LoadingSpinner**: Loading indicators for async operations

### Form Components
- **Textarea**: Multi-line text input with resize options
- **Select**: Dropdown selection with custom styling
- **Checkbox**: Single selection with label and description support
- **Radio/RadioGroup**: Single choice from multiple options

### Layout Components
- **Container**: Responsive content containers with max-width constraints
- **Section**: Page sections with consistent padding and background options
- **Grid**: CSS Grid layouts with responsive column configurations
- **Flex**: Flexbox layouts with alignment and spacing utilities
- **Stack**: Vertical stacking with consistent spacing
- **Center**: Centering utilities for content alignment

### Card Components
- **Card**: Flexible content containers with multiple variants
- **CardHeader/CardTitle/CardDescription**: Structured card content
- **CardContent/CardFooter**: Card body and action areas

### Navigation Components
- **Navigation**: Horizontal and vertical navigation menus
- **NavigationItem**: Individual navigation links with active states
- **Breadcrumb**: Hierarchical navigation with separators
- **Tabs**: Tabbed content organization

### Feedback Components
- **Alert**: Status messages with multiple severity levels
- **Badge**: Small status indicators and labels

## Usage Examples

### Basic Button Usage
```tsx
import { Button } from '@/components/ui';

// Primary button
<Button variant="primary" size="md">
  Click me
</Button>

// Loading state
<Button loading>
  Processing...
</Button>

// With icons
<Button leftIcon={<Icon />} rightIcon={<Icon />}>
  Button with icons
</Button>
```

### Form Components
```tsx
import { Input, Textarea, Select, Checkbox } from '@/components/ui';

// Input with validation
<Input
  label="Email"
  type="email"
  error="Please enter a valid email"
  helperText="We'll never share your email"
/>

// Select with options
<Select
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' }
  ]}
  placeholder="Choose your country"
/>
```

### Layout Components
```tsx
import { Container, Section, Grid, Card } from '@/components/ui';

<Container size="content">
  <Section padding="lg">
    <Grid cols={3} gap="lg">
      <Card>Content 1</Card>
      <Card>Content 2</Card>
      <Card>Content 3</Card>
    </Grid>
  </Section>
</Container>
```

### Card Components
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card variant="elevated" hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

## Design Tokens Integration

All components use the Arena Fund design tokens defined in `src/styles/design-tokens.css` and `src/styles/design-tokens.ts`. This ensures:

- Consistent colors across all components
- Standardized spacing and typography
- Unified animation timing and easing
- Responsive breakpoints
- Accessible color contrasts

### Color System
- **Primary**: Navy deep (#1e3a8a) for main actions
- **Secondary**: Warm gray (#6b7280) for secondary actions
- **Success**: Green (#10b981) for positive feedback
- **Warning**: Amber (#f59e0b) for caution states
- **Error**: Red variants for error states

### Typography
- **Primary Font**: Inter for body text and UI elements
- **Display Font**: Outfit for headlines and emphasis
- **Monospace**: JetBrains Mono for code and data

### Spacing
- **Base Unit**: 4px for consistent spacing scale
- **Responsive**: Automatic scaling on different screen sizes

## Accessibility Features

All components include:
- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant color combinations
- **Reduced Motion**: Respects user motion preferences

## Responsive Design

Components are built mobile-first with responsive breakpoints:
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

## Animation System

Consistent animations using:
- **Duration**: 200ms for micro-interactions, 300ms for standard transitions
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1) for natural motion
- **Reduced Motion**: Automatic disabling for users who prefer reduced motion

## Component Variants

### Button Variants
- `primary`: Main call-to-action buttons
- `secondary`: Secondary actions
- `outline`: Subtle actions with border
- `ghost`: Minimal styling for less prominent actions
- `destructive`: Dangerous or destructive actions
- `success`: Positive confirmation actions

### Card Variants
- `default`: Standard card with border
- `elevated`: Card with shadow for emphasis
- `outlined`: Card with prominent border
- `interactive`: Clickable card with hover effects

### Alert Variants
- `default`: General information
- `success`: Positive feedback
- `warning`: Caution messages
- `error`: Error states
- `info`: Informational content

## Best Practices

### Component Usage
1. **Use semantic variants**: Choose variants that match the semantic meaning
2. **Consistent sizing**: Use the same size variants across similar components
3. **Proper spacing**: Use layout components for consistent spacing
4. **Accessibility first**: Always include proper labels and ARIA attributes

### Performance
1. **Import only what you need**: Use named imports to reduce bundle size
2. **Lazy loading**: Use React.lazy for components not immediately needed
3. **Memoization**: Use React.memo for components that don't change frequently

### Customization
1. **Use className prop**: Add custom styles through the className prop
2. **CSS custom properties**: Leverage design tokens for theming
3. **Variant extension**: Create new variants by extending existing ones

## Testing

Components are designed to be easily testable:
- **Predictable structure**: Consistent DOM structure across variants
- **Data attributes**: Test-friendly attributes for component identification
- **Accessibility testing**: Built-in support for accessibility testing tools

## Browser Support

Components support all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

When adding new components:
1. Follow the existing component structure and patterns
2. Use TypeScript for type safety
3. Include proper documentation and examples
4. Add accessibility features
5. Test across different screen sizes and browsers
6. Follow the design token system

## Migration Guide

### From Legacy Components
1. Replace old button classes with Button component
2. Update form inputs to use new Input/Textarea components
3. Convert card layouts to use Card components
4. Update navigation to use Navigation components

### Breaking Changes
- Component props may have changed from legacy implementations
- CSS classes are now handled internally through variants
- Some styling customizations may need to be updated

## Support

For questions or issues with the component library:
1. Check the component showcase at `/components/ui/ComponentShowcase`
2. Review the design tokens documentation
3. Refer to individual component TypeScript definitions
4. Test components in isolation before integration