# Animation Utilities Documentation

## Overview

The Arena Fund animation utilities provide a comprehensive system for creating smooth, accessible animations with built-in reduced motion support. The system includes CSS classes, JavaScript utilities, and React hooks.

## Features

- ✅ **Reduced Motion Support**: Automatically respects `prefers-reduced-motion` setting
- ✅ **Consistent Easing**: Uses design token easing functions
- ✅ **Performance Optimized**: Uses `transform` and `opacity` for smooth animations
- ✅ **Accessibility First**: Proper focus management and high contrast support
- ✅ **React Integration**: Custom hooks for easy React integration
- ✅ **Vanilla JS Support**: Works without React for maximum flexibility

## Files Structure

```
src/
├── styles/
│   ├── animation-utilities.css    # CSS animations and classes
│   └── animation-utilities.md     # This documentation
├── lib/
│   └── animation-utils.ts         # JavaScript utilities
├── hooks/
│   └── useAnimations.ts           # React hooks
└── components/
    └── AnimationShowcase.tsx      # Example component
```

## CSS Animation Classes

### Fade Animations
```css
.animate-fade-in      /* Fade in from 0 to 1 opacity */
.animate-fade-out     /* Fade out from 1 to 0 opacity */
```

### Slide Animations
```css
.animate-slide-in-up     /* Slide up from below */
.animate-slide-in-down   /* Slide down from above */
.animate-slide-in-left   /* Slide in from left */
.animate-slide-in-right  /* Slide in from right */
```

### Scale Animations
```css
.animate-scale-in     /* Scale in from 90% to 100% */
.animate-scale-out    /* Scale out from 100% to 90% */
```

### Interactive Animations
```css
.animate-bounce       /* Bouncing animation */
.animate-pulse        /* Pulsing opacity */
.animate-spin         /* Continuous rotation */
```

### Specialized Animations
```css
.animate-count-up     /* For number counting animations */
.animate-progress-bar /* For progress bar fills */
.animate-shimmer      /* Loading skeleton effect */
```

### Animation Delays
```css
.animate-delay-75     /* 75ms delay */
.animate-delay-100    /* 100ms delay */
.animate-delay-150    /* 150ms delay */
.animate-delay-200    /* 200ms delay */
.animate-delay-300    /* 300ms delay */
.animate-delay-500    /* 500ms delay */
.animate-delay-700    /* 700ms delay */
.animate-delay-1000   /* 1000ms delay */
```

## Hover Effects

### Basic Hover Effects
```css
.hover-lift    /* Lifts element up with shadow */
.hover-scale   /* Scales element to 105% */
.hover-glow    /* Adds blue glow effect */
.hover-fade    /* Reduces opacity to 80% */
```

### Usage Example
```html
<div class="hover-lift p-6 bg-white rounded-lg">
  <h3>Hover me!</h3>
  <p>This card will lift up when hovered.</p>
</div>
```

## Focus Effects

### Focus Animations
```css
.focus-ring-animated  /* Animated focus ring */
.focus-scale         /* Scales element on focus */
```

### Usage Example
```html
<button class="focus-ring-animated btn-primary">
  Accessible Button
</button>
```

## Scroll Reveal Animations

### Scroll Reveal Classes
```css
.scroll-reveal        /* Fade in from bottom */
.scroll-reveal-left   /* Slide in from left */
.scroll-reveal-right  /* Slide in from right */
.scroll-reveal-scale  /* Scale in when visible */
```

### Staggered Animations
```css
.stagger-children     /* Container for staggered animations */
```

### Usage Example
```html
<div class="stagger-children">
  <div class="scroll-reveal">Item 1</div>
  <div class="scroll-reveal">Item 2</div>
  <div class="scroll-reveal">Item 3</div>
</div>
```

## Loading States

### Loading Components
```css
.loading-spinner   /* Rotating spinner */
.loading-dots      /* Three pulsing dots */
.loading-skeleton  /* Shimmer loading effect */
```

### Usage Example
```html
<!-- Spinner -->
<div class="loading-spinner"></div>

<!-- Skeleton -->
<div class="loading-skeleton h-4 rounded mb-2"></div>
<div class="loading-skeleton h-4 rounded w-3/4"></div>
```

## Progress Indicators

### Progress Bar
```html
<div class="progress-bar h-4">
  <div class="progress-bar-fill" style="width: 75%"></div>
</div>
```

### Progress Ring (SVG)
```html
<svg class="progress-ring w-16 h-16">
  <circle class="progress-ring-circle" cx="32" cy="32" r="28"></circle>
  <circle class="progress-ring-progress" cx="32" cy="32" r="28" 
          stroke-dasharray="176" stroke-dashoffset="44"></circle>
</svg>
```

## JavaScript Utilities

### Basic Usage
```javascript
import { 
  prefersReducedMotion, 
  getAnimationDuration, 
  ScrollReveal,
  CountUp 
} from '@/lib/animation-utils';

// Check if user prefers reduced motion
if (prefersReducedMotion()) {
  // Skip animations
}

// Get duration with reduced motion support
const duration = getAnimationDuration(300); // Returns 0 if reduced motion
```

### Scroll Reveal
```javascript
import { scrollReveal } from '@/lib/animation-utils';

// Observe element for scroll reveal
const element = document.querySelector('.my-element');
scrollReveal.observe(element, {
  threshold: 0.1,
  triggerOnce: true,
  stagger: 100 // For staggered children
});
```

### Count Up Animation
```javascript
import { CountUp } from '@/lib/animation-utils';

const element = document.getElementById('counter');
const countUp = new CountUp(element, {
  start: 0,
  end: 1000,
  duration: 2000,
  onUpdate: (value) => {
    element.textContent = Math.round(value).toLocaleString();
  }
});

countUp.start();
```

## React Hooks

### useReducedMotion
```jsx
import { useReducedMotion } from '@/hooks/useAnimations';

function MyComponent() {
  const prefersReduced = useReducedMotion();
  
  return (
    <div className={prefersReduced ? 'no-animation' : 'with-animation'}>
      Content
    </div>
  );
}
```

### useScrollReveal
```jsx
import { useScrollReveal } from '@/hooks/useAnimations';

function MyComponent() {
  const ref = useScrollReveal({ threshold: 0.2 });
  
  return (
    <div ref={ref} className="scroll-reveal">
      This will animate when scrolled into view
    </div>
  );
}
```

### useCountUp
```jsx
import { useCountUp } from '@/hooks/useAnimations';

function Counter() {
  const { ref, start } = useCountUp({
    end: 1000,
    duration: 2000
  });
  
  return (
    <div>
      <span ref={ref}>0</span>
      <button onClick={start}>Start Count</button>
    </div>
  );
}
```

### useStaggeredAnimation
```jsx
import { useStaggeredAnimation } from '@/hooks/useAnimations';

function StaggeredList() {
  const { ref, trigger } = useStaggeredAnimation('animate-fade-in', 100);
  
  return (
    <div ref={ref}>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
      <button onClick={trigger}>Animate</button>
    </div>
  );
}
```

### useProgressBar
```jsx
import { useProgressBar } from '@/hooks/useAnimations';

function ProgressExample() {
  const { percentage, triggerAnimation } = useProgressBar(75, true);
  
  return (
    <div>
      <div className="progress-bar h-4">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <button onClick={triggerAnimation}>Animate</button>
    </div>
  );
}
```

## Accessibility Features

### Reduced Motion Support
The system automatically detects and respects the user's `prefers-reduced-motion` setting:

- All animations are disabled or significantly reduced
- Transitions become instant (0.01ms)
- Scroll-triggered content appears immediately
- Loading states remain visible but without animation

### High Contrast Support
```css
@media (prefers-contrast: high) {
  /* Enhanced contrast for loading states */
  .loading-skeleton {
    background: var(--color-gray-300) !important;
  }
}
```

### Focus Management
- All interactive elements maintain visible focus indicators
- Focus rings are animated but respect reduced motion
- Keyboard navigation is fully supported

## Performance Optimizations

### GPU Acceleration
- Uses `transform` and `opacity` for smooth animations
- Applies `will-change` property during animations
- Removes `will-change` after animation completion

### Intersection Observer
- Efficient scroll-triggered animations
- Configurable thresholds and root margins
- Automatic cleanup to prevent memory leaks

## Browser Support

- **Modern Browsers**: Full support with all features
- **Legacy Browsers**: Graceful degradation with basic transitions
- **No JavaScript**: CSS-only animations still work

## Best Practices

### Do's
- ✅ Use design token durations and easing functions
- ✅ Test with reduced motion enabled
- ✅ Provide meaningful animations that enhance UX
- ✅ Use staggered animations for lists
- ✅ Clean up observers and animations on unmount

### Don'ts
- ❌ Don't create animations longer than 500ms for interactions
- ❌ Don't animate layout properties (width, height, top, left)
- ❌ Don't ignore reduced motion preferences
- ❌ Don't create distracting or excessive animations
- ❌ Don't forget to handle loading states

## Examples

See `src/components/AnimationShowcase.tsx` for comprehensive examples of all animation utilities in action.

## Customization

### Adding Custom Animations
```css
@keyframes myCustomAnimation {
  from { opacity: 0; transform: rotate(0deg); }
  to { opacity: 1; transform: rotate(360deg); }
}

.animate-my-custom {
  animation: myCustomAnimation var(--duration-500) var(--ease-standard);
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  .animate-my-custom {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
}
```

### Custom Easing Functions
```css
:root {
  --ease-custom: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

## Troubleshooting

### Common Issues

1. **Animations not working**: Check if reduced motion is enabled
2. **Performance issues**: Ensure you're using transform/opacity
3. **Scroll reveal not triggering**: Check intersection observer thresholds
4. **Staggered animations not working**: Verify container has proper class

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('animation-debug', 'true');
```

This will log animation events to the console for debugging purposes.