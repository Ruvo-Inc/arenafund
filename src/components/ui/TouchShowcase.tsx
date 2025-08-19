'use client';

import { useState } from 'react';
import TouchButton from './TouchButton';
import { TouchInput, TouchTextarea, TouchSelect } from './TouchInput';
import { TouchNavigation, TouchNavigationItem, MobileMenuToggle, SwipeableCard } from './TouchNavigation';
import { usePullToRefresh } from '@/hooks/useGestures';

export default function TouchShowcase() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [menuOpen, setMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const { handlers: pullToRefreshHandlers, isRefreshing } = usePullToRefresh(
    async () => {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  );

  const tabs = [
    { id: 'buttons', label: 'Touch Buttons' },
    { id: 'inputs', label: 'Touch Inputs' },
    { id: 'navigation', label: 'Touch Navigation' },
    { id: 'gestures', label: 'Gestures' },
  ];

  return (
    <div 
      className="max-w-4xl mx-auto p-6 space-y-8"
      onTouchStart={(e) => pullToRefreshHandlers.onTouchStart(e.nativeEvent)}
      onTouchMove={(e) => pullToRefreshHandlers.onTouchMove(e.nativeEvent)}
      onTouchEnd={(e) => pullToRefreshHandlers.onTouchEnd(e.nativeEvent)}
    >
      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-primary">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Refreshing...</span>
          </div>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Touch-Friendly Components Showcase</h1>
        <p className="text-muted-foreground mb-8">
          Demonstrating enhanced touch interactions, gestures, and mobile-optimized components
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <TouchNavigation variant="horizontal" className="flex space-x-1 overflow-x-auto pb-4">
          {tabs.map((tab) => (
            <TouchNavigationItem
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              hapticFeedback
              className="whitespace-nowrap"
            >
              {tab.label}
            </TouchNavigationItem>
          ))}
        </TouchNavigation>
      </div>

      {/* Touch Buttons Section */}
      {activeTab === 'buttons' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Touch-Friendly Buttons</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Button Variants</h3>
              <div className="space-y-3">
                <TouchButton variant="primary" hapticFeedback>
                  Primary Button
                </TouchButton>
                <TouchButton variant="secondary" hapticFeedback>
                  Secondary Button
                </TouchButton>
                <TouchButton variant="ghost" hapticFeedback>
                  Ghost Button
                </TouchButton>
                <TouchButton variant="cta" hapticFeedback>
                  CTA Button
                </TouchButton>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Touch Feedback Types</h3>
              <div className="space-y-3">
                <TouchButton touchFeedback="press" hapticFeedback>
                  Press Feedback
                </TouchButton>
                <TouchButton touchFeedback="ripple" hapticFeedback>
                  Ripple Effect
                </TouchButton>
                <TouchButton touchFeedback="bounce" hapticFeedback>
                  Bounce Effect
                </TouchButton>
                <TouchButton touchFeedback="pulse" hapticFeedback>
                  Pulse Effect
                </TouchButton>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Button Sizes (All Touch-Optimized)</h3>
            <div className="flex flex-wrap gap-3">
              <TouchButton size="sm" hapticFeedback>Small (44px min)</TouchButton>
              <TouchButton size="md" hapticFeedback>Medium (48px min)</TouchButton>
              <TouchButton size="lg" hapticFeedback>Large (56px min)</TouchButton>
              <TouchButton size="xl" hapticFeedback>Extra Large (64px min)</TouchButton>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Special Features</h3>
            <div className="space-y-3">
              <TouchButton 
                hapticFeedback 
                longPressAction={() => alert('Long press detected!')}
                className="relative"
              >
                Long Press Me (500ms)
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </TouchButton>
              <TouchButton loading hapticFeedback>
                Loading Button
              </TouchButton>
              <TouchButton fullWidth hapticFeedback>
                Full Width Button
              </TouchButton>
            </div>
          </div>
        </div>
      )}

      {/* Touch Inputs Section */}
      {activeTab === 'inputs' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Touch-Friendly Form Inputs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Input Variants</h3>
              
              <TouchInput
                label="Standard Input"
                placeholder="Enter text here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                hapticFeedback
                clearable
                onClear={() => setInputValue('')}
              />

              <TouchInput
                label="Input with Icon"
                placeholder="Search..."
                leftIcon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                hapticFeedback
              />

              <TouchInput
                variant="floating"
                label="Floating Label"
                placeholder=" "
                hapticFeedback
              />

              <TouchInput
                label="Success State"
                value="Valid input"
                success
                hapticFeedback
              />

              <TouchInput
                label="Error State"
                value="Invalid input"
                error="This field is required"
                hapticFeedback
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Other Input Types</h3>
              
              <TouchTextarea
                label="Touch-Friendly Textarea"
                placeholder="Enter your message..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                hapticFeedback
                rows={4}
              />

              <TouchSelect
                label="Touch-Friendly Select"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                hapticFeedback
                placeholder="Choose an option..."
              >
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </TouchSelect>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Touch-Friendly Checkboxes</label>
                <div className="space-y-2">
                  <label className="checkbox-touch + label flex items-center gap-3 p-3 rounded-md hover:bg-secondary cursor-pointer">
                    <input type="checkbox" className="checkbox-touch" />
                    <span>Option A</span>
                  </label>
                  <label className="checkbox-touch + label flex items-center gap-3 p-3 rounded-md hover:bg-secondary cursor-pointer">
                    <input type="checkbox" className="checkbox-touch" />
                    <span>Option B</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Touch Navigation Section */}
      {activeTab === 'navigation' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Touch-Friendly Navigation</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Mobile Menu Toggle</h3>
              <div className="flex items-center gap-4">
                <MobileMenuToggle
                  isOpen={menuOpen}
                  onToggle={setMenuOpen}
                  hapticFeedback
                />
                <span className="text-sm text-muted-foreground">
                  Menu is {menuOpen ? 'open' : 'closed'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Vertical Navigation</h3>
              <TouchNavigation variant="vertical" className="max-w-xs">
                <TouchNavigationItem 
                  href="#" 
                  active 
                  hapticFeedback
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                  }
                >
                  Dashboard
                </TouchNavigationItem>
                <TouchNavigationItem 
                  href="#" 
                  hapticFeedback
                  badge="3"
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  }
                >
                  Messages
                </TouchNavigationItem>
                <TouchNavigationItem 
                  href="#" 
                  hapticFeedback
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                >
                  Profile
                </TouchNavigationItem>
                <TouchNavigationItem 
                  href="#" 
                  hapticFeedback
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                >
                  Settings
                </TouchNavigationItem>
              </TouchNavigation>
            </div>
          </div>
        </div>
      )}

      {/* Gestures Section */}
      {activeTab === 'gestures' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Touch Gestures</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Swipeable Cards</h3>
              <SwipeableCard
                onSwipeLeft={() => alert('Swiped left!')}
                onSwipeRight={() => alert('Swiped right!')}
                hapticFeedback
                className="p-6 text-center"
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">Swipe Me!</h4>
                  <p className="text-sm text-muted-foreground">
                    Swipe left or right to trigger actions
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <span className="text-xs bg-secondary px-2 py-1 rounded">← Left</span>
                    <span className="text-xs bg-secondary px-2 py-1 rounded">Right →</span>
                  </div>
                </div>
              </SwipeableCard>

              <SwipeableCard
                onSwipeUp={() => alert('Swiped up!')}
                onSwipeDown={() => alert('Swiped down!')}
                hapticFeedback
                className="p-6 text-center"
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">Vertical Swipe</h4>
                  <p className="text-sm text-muted-foreground">
                    Swipe up or down to trigger actions
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <span className="text-xs bg-secondary px-2 py-1 rounded">↑ Up</span>
                    <span className="text-xs bg-secondary px-2 py-1 rounded">↓ Down</span>
                  </div>
                </div>
              </SwipeableCard>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pull to Refresh</h3>
              <div className="p-6 border border-border rounded-lg text-center">
                <div className="space-y-2">
                  <h4 className="font-semibold">Pull Down to Refresh</h4>
                  <p className="text-sm text-muted-foreground">
                    Pull down on this entire showcase to trigger refresh
                  </p>
                  {isRefreshing && (
                    <div className="text-primary">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Touch Feedback Examples</h3>
                <div className="space-y-2">
                  <div className="p-4 border border-border rounded-lg touch-press cursor-pointer">
                    <p className="text-sm">Touch Press Effect</p>
                    <p className="text-xs text-muted-foreground">Tap to see scale effect</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg touch-ripple cursor-pointer">
                    <p className="text-sm">Touch Ripple Effect</p>
                    <p className="text-xs text-muted-foreground">Tap to see ripple</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg touch-lift cursor-pointer">
                    <p className="text-sm">Touch Lift Effect</p>
                    <p className="text-xs text-muted-foreground">Tap to see lift</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Accessibility Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All touch targets meet WCAG 2.1 AA standards (minimum 44px)</li>
              <li>• Haptic feedback respects user preferences</li>
              <li>• Reduced motion support for animations</li>
              <li>• High contrast mode compatibility</li>
              <li>• Keyboard navigation support</li>
              <li>• Screen reader optimized</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}