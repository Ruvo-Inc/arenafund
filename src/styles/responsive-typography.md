# Responsive Typography Scale

## Overview

The Arena Fund website uses a comprehensive responsive typography system that scales seamlessly across all device sizes while maintaining consistent line heights, spacing, and visual hierarchy.

## Key Features

- **Mobile-first approach**: Base sizes optimized for mobile, enhanced for larger screens
- **Consistent line heights**: Semantic line height ratios for different content types
- **Automatic scaling**: Typography scales at defined breakpoints without manual intervention
- **Semantic classes**: Purpose-built classes for different content types
- **Design token integration**: All values use CSS custom properties for consistency

## Breakpoint Scaling

### Mobile (default)
- H1: 36px (2.25rem)
- H2: 30px (1.875rem) 
- H3: 24px (1.5rem)
- H4: 20px (1.25rem)
- Body: 16px (1rem)

### Tablet (768px+)
- H1: 48px (3rem)
- H2: 36px (2.25rem)
- H3: 28px (1.75rem)
- H4: 22px (1.375rem)
- Body: 16px (1rem)

### Desktop (1024px+)
- H1: 56px (3.5rem)
- H2: 40px (2.5rem)
- H3: 32px (2rem)
- H4: 22px (1.375rem)
- Body: 16px (1rem)

### Large Desktop (1280px+)
- H1: 64px (4rem)
- H2: 40px (2.5rem)
- H3: 32px (2rem)
- H4: 22px (1.375rem)
- Body: 16px (1rem)

## Line Height System

### Tight (1.25)
Used for headings and display text where space efficiency is important.

### Normal (1.5)
Used for UI elements, small text, and compact layouts.

### Relaxed (1.625)
Used for body text and content where readability is paramount.

## Implementation

### CSS Custom Properties

The system uses CSS custom properties that automatically update at breakpoints:

```css
:root {
  /* Base mobile sizes */
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
}

@media (min-width: 768px) {
  :root {
    --text-4xl: 3rem;
    --text-5xl: 3.75rem;
  }
}
```

### Tailwind Classes

#### Responsive Scaling Classes
```html
<!-- Automatically scales with breakpoints -->
<h1 class="text-responsive-5xl font-display font-bold">Hero Heading</h1>
<h2 class="text-responsive-4xl font-display font-semibold">Section Heading</h2>
<p class="text-responsive-lg">Large body text</p>
```

#### Semantic Classes
```html
<!-- Purpose-built classes with optimal settings -->
<h1 class="heading-hero">Hero Heading</h1>
<h2 class="heading-section">Section Heading</h2>
<h3 class="heading-subsection">Subsection Heading</h3>
<h4 class="heading-card">Card Heading</h4>
<h5 class="heading-minor">Minor Heading</h5>

<p class="lead">Lead paragraph</p>
<p class="body-large">Large body text</p>
<p class="body-base">Standard body text</p>
<p class="body-small">Small body text</p>
<p class="body-caption">Caption text</p>
```

### JavaScript/TypeScript

```typescript
import { typography, getResponsiveFontSize } from '@/styles/design-tokens';

// Get responsive font size
const heroSize = getResponsiveFontSize('5xl');

// Use in styled components or CSS-in-JS
const HeroHeading = styled.h1`
  font-size: ${typography.responsiveFontSize['5xl']};
  line-height: ${typography.lineHeight.tight};
`;
```

## Font Families

### Display Font (Outfit)
- Used for all headings (h1-h6)
- Used for emphasis text (strong, b, em)
- Used for display and emphasis utility classes
- Provides distinctive brand personality

### Body Font (Inter)
- Used for all body text and paragraphs
- Used for UI elements and forms
- Optimized for readability at small sizes

### Monospace Font (JetBrains Mono)
- Used for code blocks and technical content
- Maintains consistent character width

## Spacing Integration

The typography system integrates with the spacing scale for consistent margins:

- H1: `margin-bottom: var(--spacing-6)` (24px)
- H2: `margin-bottom: var(--spacing-5)` (20px)
- H3: `margin-bottom: var(--spacing-4)` (16px)
- H4-H6: `margin-bottom: var(--spacing-4)` (16px)
- Paragraphs: `margin-bottom: var(--spacing-4)` (16px)

## Accessibility

### Reduced Motion Support
The system respects `prefers-reduced-motion` settings and maintains readability without animations.

### Color Contrast
All text colors meet WCAG AA contrast requirements:
- Primary text: `var(--color-foreground)`
- Secondary text: `var(--color-muted-foreground)`
- Muted text: `var(--color-muted)`

### Screen Reader Support
Semantic HTML elements and proper heading hierarchy ensure screen reader compatibility.

## Testing

### Browser Testing
Test responsive scaling by:
1. Resizing browser window
2. Using browser dev tools device emulation
3. Inspecting computed font-size values
4. Verifying line-height consistency

### Device Testing
Validate on actual devices:
- Mobile phones (320px - 768px)
- Tablets (768px - 1024px)
- Laptops (1024px - 1280px)
- Desktop monitors (1280px+)

## Best Practices

### Do's
- Use semantic heading classes for consistent styling
- Leverage responsive font size classes for automatic scaling
- Maintain proper heading hierarchy (h1 → h2 → h3)
- Use appropriate line heights for content type
- Test across all breakpoints

### Don'ts
- Don't use fixed pixel values for font sizes
- Don't skip heading levels in HTML hierarchy
- Don't override line heights without considering readability
- Don't use display fonts for large blocks of body text
- Don't ignore mobile-first responsive design principles

## Maintenance

### Adding New Sizes
1. Add to CSS custom properties in `design-tokens.css`
2. Add responsive breakpoint overrides
3. Update TypeScript types in `design-tokens.ts`
4. Add Tailwind configuration if needed
5. Document the new size and its use cases

### Modifying Breakpoints
1. Update media queries in `design-tokens.css`
2. Test all existing typography scales
3. Update documentation with new breakpoint values
4. Verify no visual regressions across the site

## Performance

The responsive typography system is optimized for performance:
- Uses CSS custom properties for efficient updates
- Minimal CSS output through design token reuse
- No JavaScript required for responsive scaling
- Leverages browser-native media query handling