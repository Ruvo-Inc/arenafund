# Arena Fund Design Tokens

This directory contains the comprehensive design system tokens for The Arena Fund website. The design tokens provide a consistent foundation for colors, typography, spacing, animations, and other design elements across the entire application.

## Files Overview

- **`design-tokens.css`** - CSS custom properties (CSS variables) for use in stylesheets
- **`design-tokens.ts`** - TypeScript/JavaScript exports for use in components and dynamic styling
- **`animation-utilities.css`** - Comprehensive animation system with reduced motion support
- **`animation-utilities.md`** - Animation utilities documentation
- **`page-components.css`** - Page-specific component styles using design tokens
- **`README.md`** - This documentation file

## Enhanced CSS Custom Properties Implementation

The design tokens are now fully integrated across all pages through CSS custom properties, providing:

- **Consistent theming** across all components and pages
- **Automatic dark mode support** through CSS custom property overrides
- **Reduced motion support** for accessibility compliance
- **Page-specific component classes** for common UI patterns
- **Seamless Tailwind integration** with design token values

## Usage

### CSS Custom Properties

The design tokens are available as CSS custom properties (CSS variables) throughout the application:

```css
/* Colors */
.my-component {
  background-color: var(--color-primary);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
}

/* Typography */
.heading {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

/* Spacing */
.card {
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-4);
  border-radius: var(--radius-lg);
}

/* Animations */
.button {
  transition: background-color var(--transition-base);
}
```

### Tailwind CSS Classes

The design tokens are integrated with Tailwind CSS and available as utility classes:

```jsx
// Colors
<div className="bg-primary text-white border-border">
  <h1 className="text-foreground">Heading</h1>
</div>

// Typography
<h1 className="font-display text-4xl font-bold leading-tight">
  Display Heading
</h1>

// Spacing and Layout
<div className="p-6 mb-4 rounded-lg max-w-container-content">
  Content
</div>

// Animations
<button className="transition-base hover:bg-primary-hover">
  Button
</button>
```

### TypeScript/JavaScript

Import and use design tokens in your components:

```typescript
import { colors, spacing, typography, animation } from '@/styles/design-tokens';

// Direct token access
const primaryColor = colors.navy.deep;
const largePadding = spacing[6];

// Utility functions
import { getColor, createTransition, mediaQuery } from '@/styles/design-tokens';

const buttonStyles = {
  backgroundColor: getColor('navy.600'),
  padding: spacing[3],
  transition: createTransition(['background-color'], 200, 'standard'),
};

// Media queries
const responsiveStyles = `
  padding: ${spacing[4]};
  
  ${mediaQuery.md} {
    padding: ${spacing[6]};
  }
`;
```

## Design System Structure

### Color System

The color system is built around semantic color assignments and brand colors:

#### Brand Colors
- **Navy Deep** (`--color-navy-deep`): Primary brand color for headers and CTAs
- **Navy Light** (`--color-navy-light`): Secondary brand color for accents
- **Warm Gray** (`--color-gray-warm`): Sophisticated neutral for text and backgrounds

#### Semantic Colors
- **Primary**: Main interactive elements (buttons, links)
- **Secondary**: Secondary interactive elements
- **Success**: Success states and positive feedback
- **Warning**: Warning states and caution indicators
- **Error**: Error states and negative feedback

#### Usage Examples
```css
/* Primary actions */
.cta-button {
  background-color: var(--color-primary);
  color: var(--color-white);
}

/* Success feedback */
.success-message {
  background-color: var(--color-success-50);
  color: var(--color-success-700);
  border: 1px solid var(--color-success-200);
}
```

### Typography System

The typography system uses two primary font families:

#### Font Families
- **Primary** (`--font-primary`): Inter - Used for body text, UI elements, and general content
- **Display** (`--font-display`): Outfit - Used for headings, emphasis, and brand elements
- **Mono** (`--font-mono`): JetBrains Mono - Used for code and data display

#### Font Scale
The font scale follows a consistent progression from 12px (xs) to 128px (9xl):

```css
/* Heading hierarchy */
h1 { font-size: var(--font-size-4xl); } /* 36px */
h2 { font-size: var(--font-size-2xl); } /* 24px */
h3 { font-size: var(--font-size-xl); }  /* 20px */
h4 { font-size: var(--font-size-lg); }  /* 18px */

/* Body text */
p { font-size: var(--font-size-base); } /* 16px */
```

### Spacing System

The spacing system is based on a 4px base unit, providing consistent rhythm and alignment:

#### Base Unit: 4px
- `--spacing-1` = 4px
- `--spacing-2` = 8px
- `--spacing-3` = 12px
- `--spacing-4` = 16px
- etc.

#### Usage Patterns
```css
/* Component spacing */
.card {
  padding: var(--spacing-6);        /* 24px */
  margin-bottom: var(--spacing-4);  /* 16px */
  gap: var(--spacing-3);           /* 12px */
}

/* Layout spacing */
.section {
  padding-top: var(--spacing-16);    /* 64px */
  padding-bottom: var(--spacing-16); /* 64px */
}
```

### Animation System

The animation system provides consistent timing and easing for all interactions with comprehensive reduced motion support:

#### Duration Guidelines
- **75-150ms**: Micro-interactions (hover states, focus rings)
- **200-300ms**: Standard transitions (page elements, modals)
- **500ms+**: Complex animations (page transitions, data visualization)

#### Easing Functions
- **Standard** (`--ease-standard`): Default easing for most transitions
- **Emphasized** (`--ease-emphasized`): For important state changes
- **Bounce** (`--ease-bounce`): For playful interactions (use sparingly)

#### Animation Classes
The system includes comprehensive CSS animation classes:

```css
/* Fade animations */
.animate-fade-in, .animate-fade-out

/* Slide animations */
.animate-slide-in-up, .animate-slide-in-down
.animate-slide-in-left, .animate-slide-in-right

/* Scale animations */
.animate-scale-in, .animate-scale-out

/* Interactive animations */
.animate-bounce, .animate-pulse, .animate-spin

/* Hover effects */
.hover-lift, .hover-scale, .hover-glow, .hover-fade

/* Scroll reveal */
.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right
```

#### JavaScript Integration
```typescript
import { 
  prefersReducedMotion, 
  scrollReveal, 
  CountUp 
} from '@/lib/animation-utils';

// Check reduced motion preference
if (!prefersReducedMotion()) {
  // Apply animations
}

// Scroll-triggered animations
scrollReveal.observe(element);

// Count up animations
const counter = new CountUp(element, { end: 1000 });
counter.start();
```

#### React Hooks
```jsx
import { 
  useReducedMotion, 
  useScrollReveal, 
  useCountUp 
} from '@/hooks/useAnimations';

function MyComponent() {
  const prefersReduced = useReducedMotion();
  const scrollRef = useScrollReveal();
  const { ref: countRef, start } = useCountUp({ end: 100 });
  
  return (
    <div ref={scrollRef} className="scroll-reveal">
      <span ref={countRef}>0</span>
    </div>
  );
}
```

#### Usage Examples
```css
/* Standard button hover */
.button {
  transition: background-color var(--transition-base);
}

/* Complex modal animation */
.modal {
  transition: opacity var(--transition-complex),
              transform var(--transition-complex);
}

/* Scroll reveal content */
.content-section {
  /* Will animate when scrolled into view */
}
```

For detailed animation documentation, see [`animation-utilities.md`](./animation-utilities.md).

### Accessibility Features

The design tokens include built-in accessibility support:

#### Reduced Motion
The system automatically respects `prefers-reduced-motion` settings:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations are disabled or reduced */
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Color Contrast
All color combinations meet WCAG AA contrast requirements:

```css
/* High contrast text combinations */
.text-on-primary {
  background-color: var(--color-primary);
  color: var(--color-white); /* Meets AA contrast */
}
```

#### Focus Management
Consistent focus indicators across all interactive elements:

```css
:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}
```

## Dark Mode Support

The design tokens automatically adapt to dark mode preferences:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-gray-900);
    --color-foreground: var(--color-gray-50);
    /* Other dark mode overrides */
  }
}
```

## Best Practices

### Do's
✅ Use semantic color tokens (`--color-primary`) instead of specific colors (`--color-navy-600`)
✅ Use the spacing scale consistently for all layout decisions
✅ Use the typography scale for consistent text hierarchy
✅ Use transition presets for consistent animation timing
✅ Test all color combinations for accessibility compliance

### Don'ts
❌ Don't hardcode color values in components
❌ Don't use arbitrary spacing values outside the scale
❌ Don't mix font families inconsistently
❌ Don't create custom animations without considering reduced motion
❌ Don't override design tokens without considering the global impact

## Extending the Design System

When adding new tokens:

1. **Add to CSS file**: Update `design-tokens.css` with new custom properties
2. **Add to TypeScript file**: Update `design-tokens.ts` with corresponding exports
3. **Update Tailwind config**: Add new tokens to `tailwind.config.ts` if needed
4. **Document usage**: Update this README with usage examples
5. **Test accessibility**: Ensure new tokens meet accessibility requirements

## Migration Guide

When migrating existing styles to use design tokens:

1. **Identify hardcoded values**: Look for specific colors, sizes, and spacing
2. **Map to tokens**: Find the appropriate design token for each value
3. **Update styles**: Replace hardcoded values with token references
4. **Test thoroughly**: Ensure visual consistency is maintained
5. **Update components**: Use Tailwind classes where possible for better maintainability

## Page-Specific Component Classes

The `page-components.css` file provides pre-built component classes that use design tokens:

### Layout Classes
```css
.section-standard      /* Standard section padding */
.section-alternate     /* Alternate background section */
.section-dark          /* Dark background section */
.container-responsive  /* Responsive container with design token padding */
```

### Component Classes
```css
.hero-section         /* Homepage hero styling */
.feature-card         /* Feature card with hover effects */
.process-step         /* Process step with numbered indicator */
.team-member-card     /* Team member profile card */
.faq-item            /* FAQ accordion item */
.form-container      /* Form wrapper with design token styling */
.dashboard-card      /* Dashboard stat card */
.legal-container     /* Legal content wrapper */
```

### Interactive Classes
```css
.hover-lift          /* Lift effect on hover */
.hover-scale         /* Scale effect on hover */
.focus-ring-primary  /* Primary focus ring */
.focus-ring-success  /* Success focus ring */
```

### Grid Classes
```css
.grid-responsive-2   /* 2-column responsive grid */
.grid-responsive-3   /* 3-column responsive grid */
```

## Usage Examples

### Using Page Component Classes
```jsx
// Homepage hero section
<section className="hero-section">
  <div className="container-responsive">
    <h1 className="hero-title">Welcome to Arena Fund</h1>
    <p className="hero-subtitle">Buyer-validated B2B AI investments</p>
  </div>
</section>

// Feature cards grid
<div className="grid-responsive-3">
  <div className="feature-card hover-lift">
    <div className="feature-card-icon blue">
      <Icon />
    </div>
    <h3 className="feature-card-title">Feature Title</h3>
    <p className="feature-card-description">Feature description</p>
  </div>
</div>

// Form with design tokens
<div className="form-container">
  <div className="form-section">
    <h2 className="form-section-title">Contact Information</h2>
    <div className="form-field">
      <label className="form-label">Email</label>
      <input className="form-input" type="email" />
    </div>
  </div>
</div>
```

## Support

For questions about the design system or design tokens:

1. Check this documentation first
2. Review the design document at `.kiro/specs/arena-fund-visual-enhancements/design.md`
3. Consult the requirements document for context on design decisions
4. Test changes thoroughly across different devices and accessibility settings
5. Use the `DesignTokenExample` component to see all tokens in action