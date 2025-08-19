/**
 * Animation Showcase Component
 * 
 * Demonstrates all the animation utilities and provides examples for developers.
 */

'use client';

import React, { useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { 
  useCountUp, 
  useStaggeredAnimation,
  useProgressBar,
  useHoverAnimation,
  useFocusAnimation,
  useLoadingState
} from '@/hooks/useAnimations';

export const AnimationShowcase: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);
  const [progressTarget, setProgressTarget] = useState(75);
  
  // Scroll reveal examples - using simplified refs for now
  const fadeInRef = React.useRef<HTMLDivElement>(null);
  const slideUpRef = React.useRef<HTMLDivElement>(null);
  const slideLeftRef = React.useRef<HTMLDivElement>(null);
  const scaleInRef = React.useRef<HTMLDivElement>(null);
  
  // Count up example
  const { ref: countRef, value: countValue, start: startCount } = useCountUp(1250000, 2000);
  
  // Staggered animation example
  const { ref: staggerRef, trigger: triggerStagger } = useStaggeredAnimation('animate-slide-in-up', 150);
  
  // Progress bar example
  const { percentage, triggerAnimation } = useProgressBar(progressTarget, true);
  
  // Hover and focus examples
  const hoverLiftRef = useHoverAnimation('lift') as React.RefObject<HTMLDivElement>;
  const hoverScaleRef = useHoverAnimation('scale') as React.RefObject<HTMLDivElement>;
  const focusRingRef = useFocusAnimation('ring') as React.RefObject<HTMLButtonElement>;
  
  // Loading state example
  const showLoading = useLoadingState(isLoading);
  
  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Animation Utilities Showcase
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Comprehensive animation system with reduced motion support
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm">
          <div className={`w-3 h-3 rounded-full ${prefersReduced ? 'bg-warning-500' : 'bg-success-500'}`} />
          {prefersReduced ? 'Reduced Motion Enabled' : 'Animations Enabled'}
        </div>
      </div>

      {/* Scroll Reveal Animations */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-foreground">Scroll Reveal Animations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            ref={fadeInRef}
            className="scroll-reveal p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <h3 className="font-semibold mb-2">Fade In</h3>
            <p className="text-sm text-muted-foreground">
              Simple opacity transition when scrolled into view.
            </p>
          </div>
          
          <div 
            ref={slideUpRef}
            className="scroll-reveal p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <h3 className="font-semibold mb-2">Slide Up</h3>
            <p className="text-sm text-muted-foreground">
              Slides up from below with fade in effect.
            </p>
          </div>
          
          <div 
            ref={slideLeftRef}
            className="scroll-reveal-left p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <h3 className="font-semibold mb-2">Slide Left</h3>
            <p className="text-sm text-muted-foreground">
              Slides in from the right side.
            </p>
          </div>
          
          <div 
            ref={scaleInRef}
            className="scroll-reveal-scale p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <h3 className="font-semibold mb-2">Scale In</h3>
            <p className="text-sm text-muted-foreground">
              Scales up from 90% to 100% size.
            </p>
          </div>
        </div>
      </section>

      {/* Count Up Animation */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-foreground">Count Up Animation</h2>
        <div className="text-center p-8 bg-gradient-to-r from-navy-50 to-navy-100 rounded-xl">
          <div className="text-4xl font-bold text-navy-600 mb-2">
            <span ref={countRef as React.RefObject<HTMLSpanElement>}>${countValue.toLocaleString()}</span>
          </div>
          <p className="text-navy-600 mb-4">Total Funding Raised</p>
          <button 
            onClick={startCount}
            className="btn-primary"
          >
            Start Animation
          </button>
        </div>
      </section>

      {/* Staggered Animations */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-foreground">Staggered Animations</h2>
        <div className="text-center mb-6">
          <button 
            onClick={triggerStagger}
            className="btn-primary"
          >
            Trigger Stagger Animation
          </button>
        </div>
        <div ref={staggerRef as React.RefObject<HTMLDivElement>} className="stagger-children grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-navy-100 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-navy-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">First Item</h3>
            <p className="text-sm text-muted-foreground">
              This item animates first in the sequence.
            </p>
          </div>
          
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-navy-100 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-navy-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Second Item</h3>
            <p className="text-sm text-muted-foreground">
              This item follows with a slight delay.
            </p>
          </div>
          
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-navy-100 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-navy-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Third Item</h3>
            <p className="text-sm text-muted-foreground">
              This item animates last in the sequence.
            </p>
          </div>
        </div>
      </section>

      {/* Progress Bar Animation */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-foreground">Progress Bar Animation</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label htmlFor="progress-target" className="text-sm font-medium">
              Target Percentage:
            </label>
            <input
              id="progress-target"
              type="range"
              min="0"
              max="100"
              value={progressTarget}
              onChange={(e) => setProgressTarget(Number(e.target.value))}
              className="flex-1 max-w-xs"
            />
            <span className="text-sm font-mono">{progressTarget}%</span>
            <button 
              onClick={triggerAnimation}
              className="btn-secondary text-sm px-4 py-2"
            >
              Animate
            </button>
          </div>
          
          <div className="progress-bar h-4">
            <div 
              className="progress-bar-fill h-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            Current: {Math.round(percentage)}%
          </div>
        </div>
      </section>

      {/* Hover Effects */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-foreground">Hover Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            ref={hoverLiftRef}
            className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer"
          >
            <h3 className="font-semibold mb-2">Hover Lift</h3>
            <p className="text-sm text-muted-foreground">
              Lifts up with shadow on hover.
            </p>
          </div>
          
          <div 
            ref={hoverScaleRef}
            className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer"
          >
            <h3 className="font-semibold mb-2">Hover Scale</h3>
            <p className="text-sm text-muted-foreground">
              Scales up slightly on hover.
            </p>
          </div>
          
          <div className="hover-glow p-6 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer">
            <h3 className="font-semibold mb-2">Hover Glow</h3>
            <p className="text-sm text-muted-foreground">
              Adds a glow effect on hover.
            </p>
          </div>
          
          <div className="hover-fade p-6 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer">
            <h3 className="font-semibold mb-2">Hover Fade</h3>
            <p className="text-sm text-muted-foreground">
              Reduces opacity on hover.
            </p>
          </div>
        </div>
      </section>

      {/* Focus Effects */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-foreground">Focus Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            ref={focusRingRef}
            className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-left"
          >
            <h3 className="font-semibold mb-2">Animated Focus Ring</h3>
            <p className="text-sm text-muted-foreground">
              Click or tab to see the animated focus ring.
            </p>
          </button>
          
          <button className="focus-scale p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-left">
            <h3 className="font-semibold mb-2">Focus Scale</h3>
            <p className="text-sm text-muted-foreground">
              Scales up slightly when focused.
            </p>
          </button>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-foreground">Loading States</h2>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={simulateLoading}
              className="btn-primary"
              disabled={isLoading}
            >
              {showLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Loading...
                </>
              ) : (
                'Start Loading'
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <h3 className="font-semibold mb-4">Spinner</h3>
              <div className="loading-spinner" />
            </div>
            
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <h3 className="font-semibold mb-4">Pulse</h3>
              <div className="w-8 h-8 bg-navy-500 rounded animate-pulse" />
            </div>
            
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <h3 className="font-semibold mb-4">Skeleton</h3>
              <div className="space-y-2">
                <div className="h-4 loading-skeleton rounded" />
                <div className="h-4 loading-skeleton rounded w-3/4" />
                <div className="h-4 loading-skeleton rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CSS Classes Reference */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-foreground">CSS Classes Reference</h2>
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="font-semibold mb-4">Available Animation Classes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm font-mono">
            <div>
              <h4 className="font-semibold text-navy-600 mb-2">Fade Animations</h4>
              <ul className="space-y-1 text-gray-600">
                <li>.animate-fade-in</li>
                <li>.animate-fade-out</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-navy-600 mb-2">Slide Animations</h4>
              <ul className="space-y-1 text-gray-600">
                <li>.animate-slide-in-up</li>
                <li>.animate-slide-in-down</li>
                <li>.animate-slide-in-left</li>
                <li>.animate-slide-in-right</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-navy-600 mb-2">Scale Animations</h4>
              <ul className="space-y-1 text-gray-600">
                <li>.animate-scale-in</li>
                <li>.animate-scale-out</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-navy-600 mb-2">Interactive</h4>
              <ul className="space-y-1 text-gray-600">
                <li>.animate-bounce</li>
                <li>.animate-pulse</li>
                <li>.animate-spin</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-navy-600 mb-2">Hover Effects</h4>
              <ul className="space-y-1 text-gray-600">
                <li>.hover-lift</li>
                <li>.hover-scale</li>
                <li>.hover-glow</li>
                <li>.hover-fade</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-navy-600 mb-2">Scroll Reveal</h4>
              <ul className="space-y-1 text-gray-600">
                <li>.scroll-reveal</li>
                <li>.scroll-reveal-left</li>
                <li>.scroll-reveal-right</li>
                <li>.scroll-reveal-scale</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};