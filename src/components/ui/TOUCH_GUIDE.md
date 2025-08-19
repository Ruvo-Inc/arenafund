# Touch-Friendly Components Guide

This guide covers the comprehensive touch-friendly interaction system implemented for Arena Fund's website, ensuring optimal mobile and tablet experiences.

## Overview

The touch-friendly system provides:
- **WCAG 2.1 AA compliant touch targets** (minimum 44px x 44px)
- **Gesture support** (swipe, pinch, long press, pull-to-refresh)
- **Haptic feedback** for supported devices
- **Enhanced mobile interactions** with visual feedback
- **Accessibility features** for all users

## Core Components

### TouchButton

Enhanced button component with touch-optimized sizing and feedback.

```tsx
import TouchButton from '@/components/ui/TouchButton';

// Basic usage
<TouchButton variant="primary" hapticFeedback>
  Touch Me
</TouchButton>

// With touch feedback types
<TouchButton touchFeedback="ripple" hapticFeedback>
  Ripple Effect
</TouchButton>

// With long press action
<TouchButton 
  longPressAction={() => console.log('Long pressed!')}
  hapticFeedback
>
  Long Press Me
</TouchButton>
```

**Props:**
- `touchFeedback`: 'ripple' | 'press' | 'lift' | 'bounce' | 'pulse' | 'none'
- `hapticFeedback`: boolean - Enable haptic feedback
- `longPressAction`: () => void - Action on long press
- `longPressDelay`: number - Long press delay in ms (default: 500)

### TouchInput, TouchTextarea, TouchSelect

Touch-optimized form inputs with enhanced sizing and feedback.

```tsx
import { TouchInput, TouchTextarea, TouchSelect } from '@/components/ui/TouchInput';

// Touch-friendly input
<TouchInput
  label="Email"
  placeholder="Enter your email"
  hapticFeedback
  clearable
  onClear={() => setValue('')}
/>

// Floating label variant
<TouchInput
  variant="floating"
  label="Floating Label"
  hapticFeedback
/>

// Touch-friendly textarea
<TouchTextarea
  label="Message"
  placeholder="Enter your message"
  hapticFeedback
  rows={4}
/>

// Touch-friendly select
<TouchSelect
  label="Choose Option"
  hapticFeedback
  placeholder="Select..."
>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</TouchSelect>
```

### TouchNavigation

Touch-optimized navigation components with gesture support.

```tsx
import { 
  TouchNavigation, 
  TouchNavigationItem, 
  MobileMenuToggle,
  SwipeableCard 
} from '@/components/ui/TouchNavigation';

// Touch-friendly navigation
<TouchNavigation variant="vertical" swipeEnabled hapticFeedback>
  <TouchNavigationItem href="/dashboard" active hapticFeedback>
    Dashboard
  </TouchNavigationItem>
  <TouchNavigationItem href="/profile" hapticFeedback badge="3">
    Profile
  </TouchNavigationItem>
</TouchNavigation>

// Mobile menu toggle
<MobileMenuToggle
  isOpen={menuOpen}
  onToggle={setMenuOpen}
  hapticFeedback
/>

// Swipeable card
<SwipeableCard
  onSwipeLeft={() => console.log('Swiped left')}
  onSwipeRight={() => console.log('Swiped right')}
  hapticFeedback
>
  Swipe me!
</SwipeableCard>
```

## Gesture Hooks

### useSwipeGesture

Handle swipe gestures with customizable thresholds and callbacks.

```tsx
import { useSwipeGesture } from '@/hooks/useGestures';

const { handlers, gestureState } = useSwipeGesture({
  threshold: 50,
  velocityThreshold: 0.3,
  onSwipeLeft: () => console.log('Swiped left'),
  onSwipeRight: () => console.log('Swiped right'),
  onSwipeUp: () => console.log('Swiped up'),
  onSwipeDown: () => console.log('Swiped down'),
});

return <div {...handlers}>Swipeable content</div>;
```

### usePinchGesture

Handle pinch/zoom gestures for image galleries or zoomable content.

```tsx
import { usePinchGesture } from '@/hooks/useGestures';

const { handlers, scale, isActive } = usePinchGesture({
  threshold: 0.1,
  onPinchStart: (scale) => console.log('Pinch started', scale),
  onPinchMove: (scale) => console.log('Pinching', scale),
  onPinchEnd: (scale) => console.log('Pinch ended', scale),
});

return (
  <div {...handlers} style={{ transform: `scale(${scale})` }}>
    Pinchable content
  </div>
);
```

### useLongPress

Handle long press gestures with customizable delay and movement threshold.

```tsx
import { useLongPress } from '@/hooks/useGestures';

const { handlers, isLongPressing } = useLongPress({
  delay: 500,
  threshold: 10,
  onLongPress: () => console.log('Long pressed'),
  onLongPressStart: () => console.log('Long press started'),
  onLongPressEnd: () => console.log('Long press ended'),
});

return <button {...handlers}>Long press me</button>;
```

### usePullToRefresh

Implement pull-to-refresh functionality for lists and content areas.

```tsx
import { usePullToRefresh } from '@/hooks/useGestures';

const { handlers, isRefreshing, isPulling } = usePullToRefresh(
  async () => {
    // Refresh logic
    await fetchNewData();
  },
  80 // threshold in pixels
);

return (
  <div {...handlers} className={isPulling ? 'pulling' : ''}>
    {isRefreshing && <div>Refreshing...</div>}
    Content to refresh
  </div>
);
```

### useHapticFeedback

Provide haptic feedback for supported devices.

```tsx
import { useHapticFeedback } from '@/hooks/useGestures';

const { 
  triggerHaptic, 
  triggerSelectionHaptic, 
  triggerImpactHaptic, 
  triggerNotificationHaptic 
} = useHapticFeedback();

// Light haptic feedback
triggerHaptic('light');

// Selection feedback (iOS)
triggerSelectionHaptic();

// Impact feedback with intensity
triggerImpactHaptic('medium'); // 'light' | 'medium' | 'heavy'

// Notification feedback
triggerNotificationHaptic('success'); // 'success' | 'warning' | 'error'
```

## CSS Classes

### Touch Target Sizing

```css
/* Base touch target - ensures minimum 44px x 44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Touch target variants */
.touch-target-sm { min-height: 44px; min-width: 44px; }
.touch-target-md { min-height: 48px; min-width: 48px; }
.touch-target-lg { min-height: 56px; min-width: 56px; }
.touch-target-xl { min-height: 64px; min-width: 64px; }
```

### Touch Feedback Effects

```css
/* Press feedback */
.touch-press:active {
  transform: scale(0.95);
  box-shadow: var(--shadow-sm);
}

/* Ripple effect */
.touch-ripple::before {
  content: '';
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transition: width 0.3s ease-out, height 0.3s ease-out;
}

.touch-ripple:active::before {
  width: 200px;
  height: 200px;
}

/* Lift feedback */
.touch-lift:active {
  transform: translateY(1px);
  box-shadow: var(--shadow-xs);
}
```

### Touch-Friendly Forms

```css
/* Touch-friendly input */
.form-input-touch {
  min-height: 48px;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: 16px; /* Prevents zoom on iOS */
  border-radius: var(--radius-lg);
}

/* Touch-friendly select */
.select-touch {
  min-height: 48px;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: 16px;
  background-size: 16px 12px;
}
```

### Navigation Enhancements

```css
/* Touch-friendly navigation item */
.nav-touch-item {
  min-height: 48px;
  padding: var(--spacing-3) var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

/* Mobile menu toggle */
.mobile-menu-toggle {
  min-height: 48px;
  min-width: 48px;
  padding: var(--spacing-3);
}
```

## Accessibility Features

### WCAG 2.1 AA Compliance

- **Touch targets**: Minimum 44px x 44px for all interactive elements
- **Spacing**: Minimum 8px between adjacent touch targets
- **Focus indicators**: Enhanced focus rings for keyboard navigation
- **Color contrast**: Meets AA standards for all interactive states

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .touch-feedback,
  .touch-ripple,
  .touch-press,
  .touch-lift {
    transition: none !important;
    animation: none !important;
  }
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  .touch-target,
  .btn-touch,
  .form-input-touch {
    border-width: 2px;
  }
  
  .touch-feedback:active {
    outline: 2px solid currentColor;
  }
}
```

## Mobile Optimizations

### Responsive Touch Targets

```css
@media (max-width: 768px) {
  .touch-target {
    min-height: 48px;
    min-width: 48px;
  }
  
  .btn-touch {
    min-height: 52px;
    padding: var(--spacing-4) var(--spacing-8);
  }
  
  .form-input-touch {
    min-height: 52px;
    padding: var(--spacing-4);
  }
}
```

### Touch-Safe Scrolling

```css
.touch-scroll {
  -webkit-overflow-scrolling: touch;
  overflow-scrolling: touch;
}
```

### Prevent Text Selection During Touch

```css
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```

## Best Practices

### Touch Target Guidelines

1. **Minimum size**: 44px x 44px for all interactive elements
2. **Recommended size**: 48px x 48px for primary actions
3. **Spacing**: Minimum 8px between adjacent touch targets
4. **Visual feedback**: Always provide immediate visual feedback on touch

### Gesture Implementation

1. **Swipe thresholds**: 50px minimum distance or 0.3 velocity
2. **Long press delay**: 500ms default, adjustable based on context
3. **Pinch sensitivity**: 0.1 scale threshold for smooth interaction
4. **Pull-to-refresh**: 80px threshold for activation

### Haptic Feedback Guidelines

1. **Light feedback**: For selections and minor interactions
2. **Medium feedback**: For button presses and confirmations
3. **Heavy feedback**: For errors and important notifications
4. **Respect preferences**: Always check user settings

### Performance Considerations

1. **Hardware acceleration**: Use `transform` instead of changing layout properties
2. **Debounce gestures**: Prevent excessive event firing
3. **Cleanup listeners**: Remove event listeners on component unmount
4. **Optimize animations**: Use `will-change` sparingly and remove after animation

## Testing

### Device Testing

Test on various devices and screen sizes:
- iPhone (various models and sizes)
- Android phones (various manufacturers)
- Tablets (iPad, Android tablets)
- Desktop with touch screens

### Accessibility Testing

- Screen reader compatibility
- Keyboard navigation
- High contrast mode
- Reduced motion preferences
- Voice control compatibility

### Performance Testing

- Touch response time (< 100ms)
- Gesture recognition accuracy
- Battery impact of haptic feedback
- Memory usage of gesture handlers

## Browser Support

### Touch Events
- iOS Safari: Full support
- Chrome Mobile: Full support
- Firefox Mobile: Full support
- Samsung Internet: Full support

### Haptic Feedback
- iOS Safari: Full support (Taptic Engine)
- Chrome Mobile: Vibration API
- Firefox Mobile: Vibration API
- Desktop: Limited support

### CSS Features
- `touch-action`: Widely supported
- `user-select`: Widely supported
- `@media (hover: none)`: Good support
- `@media (prefers-reduced-motion)`: Good support

## Migration Guide

### Updating Existing Components

1. **Add touch classes**: Include `touch-target` class on interactive elements
2. **Update sizing**: Ensure minimum 44px height/width
3. **Add haptic feedback**: Include haptic props where appropriate
4. **Test thoroughly**: Verify on actual devices

### Common Patterns

```tsx
// Before
<button className="h-8 px-3 text-sm">
  Click me
</button>

// After
<TouchButton size="md" hapticFeedback>
  Click me
</TouchButton>

// Before
<input className="h-8 px-3" />

// After
<TouchInput size="md" hapticFeedback />
```

This comprehensive touch-friendly system ensures Arena Fund's website provides an optimal experience across all devices while maintaining accessibility and performance standards.