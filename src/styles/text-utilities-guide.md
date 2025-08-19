# Arena Fund Text Utilities

Professional text styling utilities for consistent typography across the Arena Fund platform. These utilities complement the existing visual hierarchy system and provide granular control for component-level text styling.

## Integration with Existing System

These utilities work alongside the existing visual hierarchy classes (e.g., `marketing-hero-title`, `legal-section-title`) and provide additional flexibility for component-specific styling needs.

## Display Text Classes

### Hero Text
```css
.text-hero
```
- **Usage**: Main page headlines, hero sections
- **Font**: Outfit (display font)
- **Size**: Responsive (3xl mobile → 6xl desktop)
- **Weight**: Bold
- **Color**: Foreground
- **Example**: Homepage main headline

### Section Titles
```css
.text-section-title
```
- **Usage**: Major section headings
- **Font**: Outfit
- **Size**: 4xl (responsive to 3xl mobile)
- **Weight**: Bold
- **Example**: "Our Process", "Team", "Portfolio"

### Subsection Titles
```css
.text-subsection-title
```
- **Usage**: Secondary section headings
- **Font**: Outfit
- **Size**: 3xl (responsive to 2xl mobile)
- **Weight**: Semibold
- **Example**: Process step titles, feature categories

### Card Titles
```css
.text-card-title
```
- **Usage**: Card component headings
- **Font**: Outfit
- **Size**: 2xl
- **Weight**: Semibold
- **Example**: Portfolio company names, team member names

### Minor Titles
```css
.text-minor-title
```
- **Usage**: Small component headings
- **Font**: Outfit
- **Size**: xl
- **Weight**: Semibold
- **Example**: Form section titles, sidebar headings

### Label Titles
```css
.text-label-title
```
- **Usage**: Component labels, small headings
- **Font**: Outfit
- **Size**: lg
- **Weight**: Semibold
- **Example**: Form field group labels

## Body Text Classes

### Lead Text
```css
.text-lead
```
- **Usage**: Introductory paragraphs, hero subtitles
- **Font**: Inter (primary font)
- **Size**: xl
- **Color**: Muted foreground
- **Example**: Hero section descriptions

### Body Text Variants
```css
.text-body-large    /* Large body text (lg) */
.text-body          /* Standard body text (base) */
.text-body-small    /* Small body text (sm) */
.text-caption       /* Caption text (xs) */
```
- **Usage**: Various content hierarchy levels
- **Font**: Inter
- **Color**: Muted foreground (caption uses muted)
- **Line Height**: Relaxed for readability

## Emphasis and Accent Classes

### Emphasis Text
```css
.text-emphasis      /* Semibold emphasis */
.text-strong        /* Bold emphasis */
.text-accent        /* Primary color accent */
```
- **Usage**: Highlighting important content
- **Font**: Outfit for emphasis
- **Example**: Key metrics, important statements

### Status Colors
```css
.text-success       /* Success state text */
.text-warning       /* Warning state text */
.text-error         /* Error state text */
.text-muted         /* Muted/secondary text */
```
- **Usage**: Status indicators, form validation
- **Weight**: Medium for status colors

## Interactive Text Classes

### Links
```css
.text-link
```
- **Usage**: All text links
- **Color**: Primary with hover state
- **Decoration**: Underline with offset
- **Transition**: Smooth color change

### Buttons
```css
.text-button        /* Standard button text */
.text-button-small  /* Small button text */
```
- **Usage**: Button labels
- **Font**: Inter
- **Weight**: Semibold
- **Line Height**: Tight for buttons

## Form Text Classes

### Form Elements
```css
.text-form-label    /* Form field labels */
.text-form-help     /* Help text */
.text-form-error    /* Error messages */
```
- **Usage**: Form components
- **Font**: Inter
- **Colors**: Foreground, muted, error respectively
- **Example**: Application form, profile forms

## Status and Badge Classes

### Badges and Metrics
```css
.text-badge         /* Status badges */
.text-status        /* Status indicators */
.text-metric        /* Large metric values */
.text-metric-label  /* Metric descriptions */
```
- **Usage**: Status displays, metrics, badges
- **Transform**: Uppercase for badges and labels
- **Example**: Investment status, company metrics

## Navigation Text Classes

### Navigation Elements
```css
.text-nav           /* Navigation links */
.text-nav-active    /* Active navigation */
.text-breadcrumb    /* Breadcrumb text */
.text-breadcrumb-active /* Active breadcrumb */
```
- **Usage**: Navigation components
- **Font**: Inter
- **States**: Hover and active states included

## Legal and Document Classes

### Legal Content
```css
.text-legal-title      /* Legal document titles */
.text-legal-section    /* Legal section headings */
.text-legal-subsection /* Legal subsection headings */
.text-legal-body       /* Legal body text */
.text-legal-meta       /* Legal metadata */
```
- **Usage**: Legal pages (privacy, disclosures)
- **Hierarchy**: Clear visual hierarchy for legal content
- **Readability**: Optimized for long-form reading

## Component-Specific Classes

### FAQ Components
```css
.text-faq-question  /* FAQ question text */
.text-faq-answer    /* FAQ answer text */
```

### Team Components
```css
.text-team-name     /* Team member names */
.text-team-role     /* Team member roles */
.text-team-bio      /* Team member biographies */
```

### Process Components
```css
.text-process-title       /* Process step titles */
.text-process-description /* Process step descriptions */
```

### Portfolio Components
```css
.text-company-name        /* Company names */
.text-company-description /* Company descriptions */
.text-company-meta        /* Company metadata */
```

### Application Components
```css
.text-application-title   /* Application page titles */
.text-application-section /* Application section titles */
```

## Utility Modifiers

### Text Alignment
```css
.text-center    /* Center alignment */
.text-left      /* Left alignment */
.text-right     /* Right alignment */
```

### Text Transform
```css
.text-uppercase /* Uppercase with letter spacing */
.text-lowercase /* Lowercase */
.text-capitalize /* Capitalize */
```

### Text Decoration
```css
.text-underline    /* Underline with offset */
.text-no-underline /* Remove underline */
```

### Text Wrapping
```css
.text-balance   /* Balanced text wrapping */
.text-nowrap    /* Prevent wrapping */
.text-truncate  /* Truncate with ellipsis */
```

## Usage Examples

### Homepage Hero Section
```jsx
<section className="marketing-hero">
  <div className="text-hero">
    Hear the buyer <span className="text-accent">before you wire.</span>
  </div>
  <p className="text-lead">
    Curated B2B AI. Tiny slate. Heavy conviction.
  </p>
</section>
```

### Card Component
```jsx
<div className="card-base">
  <h3 className="text-card-title">Company Name</h3>
  <p className="text-company-description">
    Company description text here.
  </p>
  <div className="text-company-meta">
    Series A • B2B SaaS
  </div>
</div>
```

### Form Section
```jsx
<div className="form-section">
  <h3 className="text-application-section">Company Information</h3>
  <div className="form-field">
    <label className="text-form-label">Company Name</label>
    <input type="text" />
    <p className="text-form-help">Enter your company's legal name</p>
  </div>
</div>
```

### Navigation
```jsx
<nav>
  <a href="/" className="text-nav-active">Home</a>
  <a href="/process" className="text-nav">Process</a>
  <a href="/team" className="text-nav">Team</a>
</nav>
```

### Status Indicators
```jsx
<div className="status-indicator">
  <span className="text-badge">Active</span>
  <span className="text-status">Investment Complete</span>
</div>
```

## Responsive Behavior

All text classes automatically adjust for mobile devices:
- Hero text scales from 6xl → 3xl
- Section titles scale from 4xl → 3xl
- Lead text scales from xl → lg
- Maintains readability across all screen sizes

## Accessibility Features

- High contrast mode support
- Reduced motion respect
- Print-friendly styles
- Screen reader optimized
- Proper color contrast ratios

## Best Practices

1. **Consistency**: Use these classes instead of inline Tailwind typography classes
2. **Hierarchy**: Follow the established visual hierarchy
3. **Semantic HTML**: Combine with proper HTML elements (h1, h2, p, etc.)
4. **Color Usage**: Use semantic color classes for status and emphasis
5. **Responsive**: Classes handle responsive behavior automatically
6. **Accessibility**: Always include proper alt text and ARIA labels

## Migration Guide

### From Tailwind Classes
```jsx
// Before
<h1 className="text-4xl font-bold text-gray-900">Title</h1>

// After
<h1 className="text-section-title">Title</h1>
```

### From Custom Styles
```jsx
// Before
<p style={{fontSize: '18px', color: '#6b7280'}}>Description</p>

// After
<p className="text-body-large">Description</p>
```

This system provides consistent, maintainable, and accessible text styling across all Arena Fund components while preserving the sophisticated brand identity.