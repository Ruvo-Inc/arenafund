# Visual Hierarchy Patterns Guide

This guide documents the comprehensive visual hierarchy system implemented for The Arena Fund website. The system provides consistent patterns across three main page types: marketing, legal, and application pages.

## Overview

The visual hierarchy system is designed to:
- Create clear information architecture across all page types
- Ensure consistent user experience and brand presentation
- Support accessibility and responsive design
- Provide semantic structure for both users and search engines

## Page Type Classifications

### Marketing Pages
- **Homepage** (`/`)
- **Process** (`/process`)
- **Team** (`/team`)
- **Founders** (`/founders`)
- **Investors** (`/investors`)
- **FAQ** (`/faq`)

### Legal Pages
- **Disclosures** (`/disclosures`)
- **Privacy** (`/privacy`)
- **Terms** (if applicable)

### Application Pages
- **Apply** (`/apply`)
- **Profile** (`/profile`)
- **Account** (`/account`)

## Marketing Page Hierarchy

### Structure
```
.marketing-page
├── .marketing-hero
│   ├── .marketing-hero-badge
│   ├── .marketing-hero-title
│   ├── .marketing-hero-subtitle
│   └── .marketing-hero-actions
├── .marketing-section / .marketing-section-alt
│   ├── .marketing-section-header
│   │   ├── .marketing-section-title
│   │   └── .marketing-section-subtitle
│   └── .marketing-card-grid
│       └── .marketing-card
│           ├── .marketing-card-icon
│           ├── .marketing-card-title
│           └── .marketing-card-description
```

### Visual Hierarchy Levels
1. **Hero Title** - Largest visual weight, primary message
2. **Section Titles** - Secondary hierarchy, section organization
3. **Card Titles** - Tertiary hierarchy, content grouping
4. **Body Text** - Base hierarchy, detailed information

### Typography Scale
- **Hero Title**: `--text-5xl` (mobile) → `--text-6xl` (desktop)
- **Section Title**: `--text-4xl`
- **Card Title**: `--text-xl`
- **Body Text**: `--text-base`

## Legal Page Hierarchy

### Structure
```
.legal-page
└── .legal-container
    ├── .legal-header
    │   ├── .legal-disclaimer
    │   ├── .legal-page-title
    │   └── .legal-page-meta
    ├── .legal-nav
    │   ├── .legal-nav-title
    │   └── .legal-nav-list
    └── .legal-section
        ├── .legal-section-title
        ├── .legal-subsection-title
        ├── .legal-text
        ├── .legal-list
        └── .legal-back-to-top
```

### Visual Hierarchy Levels
1. **Page Title** - Document identification
2. **Section Titles** - Major content divisions
3. **Subsection Titles** - Content organization
4. **Body Text** - Legal content
5. **Navigation** - Functional hierarchy

### Typography Scale
- **Page Title**: `--text-4xl`
- **Section Title**: `--text-2xl`
- **Subsection Title**: `--text-xl`
- **Body Text**: `--text-base`
- **Navigation**: `--text-sm`

## Application Page Hierarchy

### Structure
```
.application-page
├── .application-hero
│   ├── .application-hero-badge
│   ├── .application-hero-title
│   └── .application-hero-subtitle
├── .application-progress
│   └── .application-progress-title
└── .application-form
    └── .application-form-section
        ├── .application-form-section-title
        ├── .application-form-group
        │   ├── .application-form-field
        │   │   ├── .application-form-label
        │   │   ├── .application-form-input
        │   │   ├── .application-form-error
        │   │   └── .application-form-help
        └── .application-form-submit
```

### Visual Hierarchy Levels
1. **Hero Title** - Process identification
2. **Section Titles** - Form organization
3. **Field Labels** - Input identification
4. **Help Text** - Supporting information
5. **Error Messages** - Critical feedback

### Typography Scale
- **Hero Title**: `--text-4xl`
- **Section Title**: `--text-2xl`
- **Field Labels**: `--text-sm`
- **Body Text**: `--text-base`

## Color Hierarchy

### Semantic Color Usage
- **Primary Text**: `--color-foreground` (highest contrast)
- **Secondary Text**: `--color-muted-foreground` (medium contrast)
- **Tertiary Text**: `--color-muted` (lower contrast)
- **Interactive Elements**: `--color-primary` (brand color)
- **Success States**: `--color-success-*` (green scale)
- **Error States**: `--color-error-*` (red scale)
- **Warning States**: `--color-warning-*` (amber scale)

### Visual Weight Distribution
1. **Headlines** - `--color-foreground` + bold weight
2. **Body Text** - `--color-muted-foreground` + normal weight
3. **Metadata** - `--color-muted` + smaller size
4. **Interactive** - `--color-primary` + medium weight

## Spacing Hierarchy

### Vertical Rhythm
- **Section Spacing**: `--spacing-20` (80px)
- **Content Spacing**: `--spacing-16` (64px)
- **Element Spacing**: `--spacing-8` (32px)
- **Component Spacing**: `--spacing-6` (24px)
- **Text Spacing**: `--spacing-4` (16px)

### Container Widths
- **Marketing Content**: `--container-xl` (1280px)
- **Legal Content**: `--container-content` (1200px)
- **Application Forms**: `--container-md` (768px)

## Responsive Behavior

### Breakpoint Strategy
- **Mobile First**: Base styles for mobile devices
- **Tablet** (768px+): Enhanced typography and spacing
- **Desktop** (1024px+): Full hierarchy implementation
- **Large Desktop** (1280px+): Maximum scale optimization

### Typography Scaling
```css
/* Mobile */
.marketing-hero-title { font-size: var(--text-3xl); }

/* Tablet */
@media (min-width: 768px) {
  .marketing-hero-title { font-size: var(--text-5xl); }
}

/* Desktop */
@media (min-width: 1024px) {
  .marketing-hero-title { font-size: var(--text-6xl); }
}
```

## Accessibility Features

### Focus Management
- **Focus Rings**: Consistent `--color-ring` styling
- **Skip Links**: Screen reader navigation
- **Keyboard Navigation**: Tab order optimization

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Enhanced context
- **Landmark Roles**: Page structure identification

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  .marketing-card,
  .application-form-button {
    transition: none;
  }
}
```

## Implementation Guidelines

### Class Naming Convention
- **Page Type Prefix**: `marketing-`, `legal-`, `application-`
- **Component Structure**: `{type}-{component}-{element}`
- **State Modifiers**: `.success`, `.error`, `.active`

### CSS Organization
1. **Page-level containers** (`.marketing-page`)
2. **Section containers** (`.marketing-section`)
3. **Component containers** (`.marketing-card`)
4. **Element styles** (`.marketing-card-title`)
5. **State variations** (`.marketing-card:hover`)

### Usage Examples

#### Marketing Page
```jsx
<div className="marketing-page">
  <section className="marketing-hero">
    <div className="marketing-hero-badge">Status</div>
    <h1 className="marketing-hero-title">Main Headline</h1>
    <p className="marketing-hero-subtitle">Supporting text</p>
  </section>
  
  <section className="marketing-section">
    <div className="marketing-section-header">
      <h2 className="marketing-section-title">Section Title</h2>
    </div>
    <div className="marketing-card-grid">
      <div className="marketing-card">
        <h3 className="marketing-card-title">Card Title</h3>
        <p className="marketing-card-description">Description</p>
      </div>
    </div>
  </section>
</div>
```

#### Legal Page
```jsx
<main className="legal-page">
  <div className="legal-container">
    <header className="legal-header">
      <h1 className="legal-page-title">Document Title</h1>
    </header>
    
    <section className="legal-section">
      <h2 className="legal-section-title">Section Title</h2>
      <p className="legal-text">Legal content...</p>
    </section>
  </div>
</main>
```

#### Application Page
```jsx
<div className="application-page">
  <section className="application-hero">
    <h1 className="application-hero-title">Form Title</h1>
  </section>
  
  <form className="application-form">
    <div className="application-form-section">
      <h2 className="application-form-section-title">Section</h2>
      <div className="application-form-field">
        <label className="application-form-label">Field Label</label>
        <input className="application-form-input" />
      </div>
    </div>
  </form>
</div>
```

## Maintenance and Updates

### Adding New Page Types
1. Define page type classification
2. Create hierarchy structure
3. Implement CSS classes following naming convention
4. Update this documentation

### Modifying Existing Patterns
1. Update CSS variables for global changes
2. Modify component classes for specific changes
3. Test across all page types
4. Update documentation and examples

### Performance Considerations
- **CSS Optimization**: Use design tokens for consistency
- **Bundle Size**: Leverage shared patterns
- **Rendering**: Minimize layout shifts with consistent spacing