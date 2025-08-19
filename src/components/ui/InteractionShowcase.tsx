'use client';

import { useState } from 'react';
import InteractiveButton from './InteractiveButton';
import { InteractiveCard, CardHeader, CardTitle, CardContent } from './InteractiveCard';
import InteractiveInput from './InteractiveInput';
import InteractiveLink from './InteractiveLink';
import { useLoadingState, useFieldFeedback } from '@/hooks/useInteractionFeedback';

export default function InteractionShowcase() {
  const [selectedDemo, setSelectedDemo] = useState('buttons');
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const { feedback, showSuccess, showError, showWarning, clearFeedback } = useFieldFeedback();

  const demoSections = [
    { id: 'buttons', label: 'Interactive Buttons' },
    { id: 'cards', label: 'Interactive Cards' },
    { id: 'inputs', label: 'Interactive Inputs' },
    { id: 'links', label: 'Interactive Links' },
    { id: 'feedback', label: 'Feedback States' },
  ];

  const handleLoadingDemo = () => {
    startLoading();
    setTimeout(() => {
      stopLoading();
      showSuccess('Action completed successfully!');
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Arena Fund Interaction Showcase
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive demonstration of hover states, focus indicators, and interaction feedback 
          across all Arena Fund UI components.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        {demoSections.map((section) => (
          <InteractiveButton
            key={section.id}
            variant={selectedDemo === section.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedDemo(section.id)}
            hoverEffect="scale"
          >
            {section.label}
          </InteractiveButton>
        ))}
      </div>

      {/* Button Demos */}
      {selectedDemo === 'buttons' && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Interactive Buttons</h2>
            <p className="text-muted-foreground">
              Buttons with various hover effects, loading states, and haptic feedback
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Button Variants */}
            <InteractiveCard padding="lg">
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <InteractiveButton variant="primary" fullWidth hoverEffect="lift">
                    Primary Button
                  </InteractiveButton>
                  <InteractiveButton variant="secondary" fullWidth hoverEffect="scale">
                    Secondary Button
                  </InteractiveButton>
                  <InteractiveButton variant="ghost" fullWidth hoverEffect="glow">
                    Ghost Button
                  </InteractiveButton>
                  <InteractiveButton variant="cta" fullWidth>
                    CTA Button
                  </InteractiveButton>
                </div>
              </CardContent>
            </InteractiveCard>

            {/* Button Sizes */}
            <InteractiveCard padding="lg">
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <InteractiveButton size="xs" fullWidth>Extra Small</InteractiveButton>
                  <InteractiveButton size="sm" fullWidth>Small</InteractiveButton>
                  <InteractiveButton size="md" fullWidth>Medium</InteractiveButton>
                  <InteractiveButton size="lg" fullWidth>Large</InteractiveButton>
                  <InteractiveButton size="xl" fullWidth>Extra Large</InteractiveButton>
                </div>
              </CardContent>
            </InteractiveCard>

            {/* Interactive Features */}
            <InteractiveCard padding="lg">
              <CardHeader>
                <CardTitle>Interactive Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <InteractiveButton 
                    variant="primary" 
                    fullWidth 
                    ripple 
                    hapticFeedback
                  >
                    Ripple Effect
                  </InteractiveButton>
                  <InteractiveButton 
                    variant="secondary" 
                    fullWidth 
                    loading={isLoading}
                    onClick={handleLoadingDemo}
                  >
                    Loading Demo
                  </InteractiveButton>
                  <InteractiveButton variant="ghost" fullWidth disabled>
                    Disabled Button
                  </InteractiveButton>
                </div>
              </CardContent>
            </InteractiveCard>
          </div>
        </div>
      )}

      {/* Card Demos */}
      {selectedDemo === 'cards' && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Interactive Cards</h2>
            <p className="text-muted-foreground">
              Cards with hover effects, expandable content, and click interactions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Hover Effects */}
            <InteractiveCard 
              variant="interactive" 
              hoverEffect="lift"
              clickable
              onClick={() => showSuccess('Card clicked!')}
            >
              <CardHeader>
                <CardTitle>Lift Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This card lifts up when you hover over it. Click to see feedback!
                </p>
              </CardContent>
            </InteractiveCard>

            <InteractiveCard 
              variant="interactive" 
              hoverEffect="scale"
              clickable
            >
              <CardHeader>
                <CardTitle>Scale Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This card scales slightly when hovered. Try it out!
                </p>
              </CardContent>
            </InteractiveCard>

            <InteractiveCard 
              variant="interactive" 
              hoverEffect="glow"
              clickable
            >
              <CardHeader>
                <CardTitle>Glow Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This card glows with a subtle border when hovered.
                </p>
              </CardContent>
            </InteractiveCard>

            {/* Expandable Card */}
            <InteractiveCard 
              variant="expandable"
              expandOnHover
              hoverDelay={200}
              expandedContent={
                <div className="space-y-2">
                  <h4 className="font-semibold">Additional Details</h4>
                  <p className="text-sm text-muted-foreground">
                    This content appears when you hover over the card for a moment.
                    It includes additional information that's revealed on demand.
                  </p>
                  <InteractiveButton size="sm" variant="ghost">
                    Learn More
                  </InteractiveButton>
                </div>
              }
            >
              <CardHeader>
                <CardTitle>Expandable Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Hover over this card to see expandable content appear below.
                </p>
              </CardContent>
            </InteractiveCard>

            {/* Loading Card */}
            <InteractiveCard 
              variant="interactive"
              loading={isLoading}
              clickable
              onClick={handleLoadingDemo}
            >
              <CardHeader>
                <CardTitle>Loading State</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Click this card to see the loading state in action.
                </p>
              </CardContent>
            </InteractiveCard>
          </div>
        </div>
      )}

      {/* Input Demos */}
      {selectedDemo === 'inputs' && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Interactive Inputs</h2>
            <p className="text-muted-foreground">
              Form inputs with enhanced focus states, floating labels, and feedback
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InteractiveCard padding="lg">
              <CardHeader>
                <CardTitle>Standard Inputs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <InteractiveInput
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    helperText="We'll never share your email"
                  />
                  <InteractiveInput
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    rightIcon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  />
                  <InteractiveInput
                    label="Phone Number"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    leftIcon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    }
                  />
                </div>
              </CardContent>
            </InteractiveCard>

            <InteractiveCard padding="lg">
              <CardHeader>
                <CardTitle>Floating Label Inputs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <InteractiveInput
                    variant="floating"
                    label="Full Name"
                    placeholder=" "
                  />
                  <InteractiveInput
                    variant="floating"
                    label="Company Name"
                    placeholder=" "
                    success
                  />
                  <InteractiveInput
                    variant="floating"
                    label="Website URL"
                    placeholder=" "
                    error="Please enter a valid URL"
                  />
                  <InteractiveInput
                    variant="floating"
                    label="Loading Example"
                    placeholder=" "
                    loading
                  />
                </div>
              </CardContent>
            </InteractiveCard>
          </div>
        </div>
      )}

      {/* Link Demos */}
      {selectedDemo === 'links' && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Interactive Links</h2>
            <p className="text-muted-foreground">
              Links with various styles, hover effects, and interaction states
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InteractiveCard padding="lg">
              <CardHeader>
                <CardTitle>Link Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <InteractiveLink href="#" variant="default">
                      Default Link
                    </InteractiveLink>
                  </div>
                  <div>
                    <InteractiveLink href="#" variant="underline">
                      Underlined Link
                    </InteractiveLink>
                  </div>
                  <div>
                    <InteractiveLink href="#" variant="button">
                      Button Link
                    </InteractiveLink>
                  </div>
                  <div>
                    <InteractiveLink href="#" variant="arrow" showArrow>
                      Arrow Link
                    </InteractiveLink>
                  </div>
                  <div>
                    <InteractiveLink href="#" variant="minimal">
                      Minimal Link
                    </InteractiveLink>
                  </div>
                </div>
              </CardContent>
            </InteractiveCard>

            <InteractiveCard padding="lg">
              <CardHeader>
                <CardTitle>Link with Icons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <InteractiveLink 
                      href="#" 
                      leftIcon={
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      }
                    >
                      Email Us
                    </InteractiveLink>
                  </div>
                  <div>
                    <InteractiveLink 
                      href="#" 
                      rightIcon={
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      }
                    >
                      Call Us
                    </InteractiveLink>
                  </div>
                  <div>
                    <InteractiveLink href="#" external>
                      External Link
                    </InteractiveLink>
                  </div>
                </div>
              </CardContent>
            </InteractiveCard>

            <InteractiveCard padding="lg">
              <CardHeader>
                <CardTitle>Hover Effects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <InteractiveLink href="#" hoverEffect="slide">
                      Slide Effect
                    </InteractiveLink>
                  </div>
                  <div>
                    <InteractiveLink href="#" hoverEffect="glow">
                      Glow Effect
                    </InteractiveLink>
                  </div>
                  <div>
                    <InteractiveLink href="#" hoverEffect="scale">
                      Scale Effect
                    </InteractiveLink>
                  </div>
                  <div>
                    <InteractiveLink href="#" disabled>
                      Disabled Link
                    </InteractiveLink>
                  </div>
                </div>
              </CardContent>
            </InteractiveCard>
          </div>
        </div>
      )}

      {/* Feedback Demos */}
      {selectedDemo === 'feedback' && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Feedback States</h2>
            <p className="text-muted-foreground">
              Success, error, and warning feedback with animations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InteractiveCard padding="lg">
              <CardHeader>
                <CardTitle>Feedback Triggers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <InteractiveButton 
                    variant="success" 
                    fullWidth
                    onClick={() => showSuccess('Operation completed successfully!')}
                  >
                    Trigger Success
                  </InteractiveButton>
                  <InteractiveButton 
                    variant="destructive" 
                    fullWidth
                    onClick={() => showError('Something went wrong!')}
                  >
                    Trigger Error
                  </InteractiveButton>
                  <InteractiveButton 
                    variant="secondary" 
                    fullWidth
                    onClick={() => showWarning('Please review your input')}
                  >
                    Trigger Warning
                  </InteractiveButton>
                  <InteractiveButton 
                    variant="ghost" 
                    fullWidth
                    onClick={clearFeedback}
                  >
                    Clear Feedback
                  </InteractiveButton>
                </div>
              </CardContent>
            </InteractiveCard>

            <InteractiveCard padding="lg">
              <CardHeader>
                <CardTitle>Current Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.type ? (
                  <div className={`p-4 rounded-lg border ${
                    feedback.type === 'success' ? 'bg-success-background border-success-border text-success-foreground' :
                    feedback.type === 'error' ? 'bg-error-background border-error-border text-error-foreground' :
                    'bg-warning-background border-warning-border text-warning-foreground'
                  }`}>
                    <div className="flex items-center gap-2">
                      {feedback.type === 'success' && (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {feedback.type === 'error' && (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {feedback.type === 'warning' && (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      )}
                      <span className="font-medium capitalize">{feedback.type}</span>
                    </div>
                    <p className="mt-1">{feedback.message}</p>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No feedback to display</p>
                    <p className="text-sm mt-1">Click a button above to see feedback in action</p>
                  </div>
                )}
              </CardContent>
            </InteractiveCard>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-8 border-t border-border">
        <p className="text-muted-foreground">
          This showcase demonstrates the comprehensive interaction feedback system built for Arena Fund.
          All components support accessibility features, reduced motion preferences, and consistent design tokens.
        </p>
      </div>
    </div>
  );
}