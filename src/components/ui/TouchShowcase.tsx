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
        <TouchNavigation className="flex space-x-1 overflow-x-auto pb-4">
          {tabs.map((tab) => (
            <TouchNavigationItem
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
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
                <TouchButton variant="primary">
                  Primary Button
                </TouchButton>
                <TouchButton variant="secondary">
                  Secondary Button
                </TouchButton>
                <TouchButton variant="ghost">
                  Ghost Button
                </TouchButton>
                <TouchButton variant="destructive">
                  Destructive Button
                </TouchButton>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Button Sizes</h3>
              <div className="space-y-3">
                <TouchButton size="sm">Small Button</TouchButton>
                <TouchButton size="md">Medium Button</TouchButton>
                <TouchButton size="lg">Large Button</TouchButton>
                <TouchButton size="xl">Extra Large Button</TouchButton>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Special Features</h3>
            <div className="space-y-3">
              <TouchButton loading>
                Loading Button
              </TouchButton>
              <TouchButton fullWidth>
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
              />

              <TouchInput
                label="Input with Icon"
                placeholder="Search..."
                leftIcon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />

              <TouchInput
                label="Error State"
                value="Invalid input"
                error="This field is required"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Other Input Types</h3>
              
              <TouchTextarea
                label="Touch-Friendly Textarea"
                placeholder="Enter your message..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                rows={4}
              />

              <TouchSelect
                label="Touch-Friendly Select"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
              />
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
                  onToggle={() => setMenuOpen(!menuOpen)}
                />
                <span className="text-sm text-muted-foreground">
                  Menu is {menuOpen ? 'open' : 'closed'}
                </span>
              </div>
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
                className="p-6 text-center"
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">Swipe Me!</h4>
                  <p className="text-sm text-muted-foreground">
                    Swipe left or right to trigger actions
                  </p>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}