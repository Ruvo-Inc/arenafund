/**
 * Design Token Example Component
 * 
 * This component demonstrates how to use the Arena Fund design tokens
 * in React components. It shows various approaches including:
 * - Tailwind CSS classes with design tokens
 * - CSS custom properties
 * - TypeScript token imports
 */

import React from 'react';
import { colors, spacing, typography, animation, getSemanticColor, getStatusColor, getButtonColor } from '@/styles/design-tokens';

interface DesignTokenExampleProps {
  className?: string;
}

export default function DesignTokenExample({ className = '' }: DesignTokenExampleProps) {
  // Example of using TypeScript design tokens for dynamic styling
  const dynamicStyles = {
    backgroundColor: colors.navy[50],
    padding: spacing[6],
    borderRadius: '8px',
    transition: animation.transition.base,
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Typography Examples */}
      <section className="space-y-4">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Typography System
        </h2>
        
        <div className="space-y-2">
          <h1 className="font-display text-5xl font-bold text-foreground leading-tight">
            Display Heading (H1)
          </h1>
          <h2 className="font-display text-3xl font-semibold text-foreground leading-tight">
            Section Heading (H2)
          </h2>
          <h3 className="font-display text-2xl font-semibold text-foreground leading-tight">
            Subsection Heading (H3)
          </h3>
          <h4 className="font-display text-lg font-semibold text-foreground leading-tight">
            Component Heading (H4)
          </h4>
          <p className="font-primary text-base text-muted-foreground leading-relaxed">
            This is body text using the primary font family (Inter). It demonstrates 
            the relaxed line height and muted foreground color for optimal readability.
          </p>
        </div>
      </section>

      {/* Enhanced Semantic Color System */}
      <section className="space-y-6">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Enhanced Semantic Color System
        </h2>
        
        {/* Status Colors with Variants */}
        <div className="space-y-4">
          <h3 className="font-display text-xl font-semibold text-foreground">
            Status Colors with Semantic Variants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['success', 'warning', 'error', 'info'] as const).map((status) => (
              <div key={status} className="space-y-2">
                <h4 className="font-display text-sm font-semibold text-foreground capitalize">
                  {status}
                </h4>
                <div className="space-y-1">
                  <div 
                    className="p-3 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: getStatusColor(status) }}
                  >
                    Default
                  </div>
                  <div 
                    className="p-2 rounded border text-sm"
                    style={{ 
                      backgroundColor: getStatusColor(status, 'background'),
                      borderColor: getStatusColor(status, 'border'),
                      color: getStatusColor(status)
                    }}
                  >
                    Subtle Background
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Button Variants with States */}
        <div className="space-y-4">
          <h3 className="font-display text-xl font-semibold text-foreground">
            Button Variants with Interactive States
          </h3>
          <div className="space-y-4">
            {(['primary', 'secondary', 'ghost', 'destructive'] as const).map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-4">
                <span className="font-display text-sm font-medium text-foreground w-20 capitalize">
                  {variant}
                </span>
                <button 
                  className="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  style={{
                    backgroundColor: getButtonColor(variant, 'default', 'background'),
                    color: getButtonColor(variant, 'default', 'text'),
                    border: `1px solid ${getButtonColor(variant, 'default', 'border')}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = getButtonColor(variant, 'hover', 'background');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = getButtonColor(variant, 'default', 'background');
                  }}
                >
                  Default
                </button>
                <button 
                  className="px-4 py-2 rounded-lg font-medium opacity-50 cursor-not-allowed"
                  style={{
                    backgroundColor: getButtonColor(variant, 'disabled', 'background'),
                    color: getButtonColor(variant, 'disabled', 'text'),
                    border: `1px solid ${getButtonColor(variant, 'disabled', 'border')}`,
                  }}
                  disabled
                >
                  Disabled
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Text Hierarchy */}
        <div className="space-y-4">
          <h3 className="font-display text-xl font-semibold text-foreground">
            Text Hierarchy with Semantic Colors
          </h3>
          <div className="space-y-3">
            <p className="text-primary text-lg font-semibold">
              Primary text - Main headings and important content
            </p>
            <p className="text-secondary text-base">
              Secondary text - Supporting information and descriptions
            </p>
            <p className="text-tertiary text-sm">
              Tertiary text - Captions, metadata, and less important details
            </p>
            <p className="text-disabled text-sm">
              Disabled text - Inactive or unavailable content
            </p>
            <div className="space-y-1">
              <a href="#" className="text-link hover:text-link-hover text-base underline">
                Link text - Interactive elements and navigation
              </a>
              <p className="text-xs text-tertiary">Hover to see color change</p>
            </div>
          </div>
        </div>

        {/* Surface Colors */}
        <div className="space-y-4">
          <h3 className="font-display text-xl font-semibold text-foreground">
            Surface Colors for Different Elevations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'surface', label: 'Base Surface', desc: 'Default background' },
              { key: 'surfaceElevated', label: 'Elevated Surface', desc: 'Cards and modals' },
              { key: 'surfaceMuted', label: 'Muted Surface', desc: 'Subtle backgrounds' },
              { key: 'surfaceSubtle', label: 'Subtle Surface', desc: 'Very light backgrounds' }
            ].map(({ key, label, desc }) => (
              <div 
                key={key}
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: getSemanticColor(key as keyof typeof colors.semantic),
                  borderColor: getSemanticColor('borderDefault')
                }}
              >
                <h4 className="font-display text-sm font-semibold mb-2 text-primary">
                  {label}
                </h4>
                <p className="text-xs text-secondary">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Badge Variants */}
        <div className="space-y-4">
          <h3 className="font-display text-xl font-semibold text-foreground">
            Badge Variants with Semantic Colors
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              { variant: 'default', label: 'Default' },
              { variant: 'primary', label: 'Primary' },
              { variant: 'success', label: 'Success' },
              { variant: 'warning', label: 'Warning' },
              { variant: 'error', label: 'Error' }
            ].map(({ variant, label }) => (
              <span 
                key={variant}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: getSemanticColor(`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof colors.semantic),
                  color: getSemanticColor(`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}Text` as keyof typeof colors.semantic),
                }}
              >
                {label} Badge
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Spacing Examples */}
      <section className="space-y-4">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Spacing System
        </h2>
        
        <div className="space-y-4">
          <div className="bg-navy-50 p-2 rounded-lg">
            <div className="bg-primary text-white p-2 rounded">Spacing 2 (8px)</div>
          </div>
          <div className="bg-navy-50 p-4 rounded-lg">
            <div className="bg-primary text-white p-4 rounded">Spacing 4 (16px)</div>
          </div>
          <div className="bg-navy-50 p-6 rounded-lg">
            <div className="bg-primary text-white p-6 rounded">Spacing 6 (24px)</div>
          </div>
          <div className="bg-navy-50 p-8 rounded-lg">
            <div className="bg-primary text-white p-8 rounded">Spacing 8 (32px)</div>
          </div>
        </div>
      </section>

      {/* Button Examples */}
      <section className="space-y-4">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Interactive Elements
        </h2>
        
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary">
            Primary Button
          </button>
          <button className="btn-secondary">
            Secondary Button
          </button>
          <button className="bg-success hover:bg-success-600 text-white px-6 py-3 rounded-lg font-medium transition-base">
            Success Button
          </button>
          <button className="bg-warning hover:bg-warning-600 text-white px-6 py-3 rounded-lg font-medium transition-base">
            Warning Button
          </button>
        </div>
      </section>

      {/* Animation Examples */}
      <section className="space-y-4">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Animation System
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-navy-50 p-6 rounded-lg hover:bg-navy-100 transition-fast cursor-pointer">
            <h3 className="font-display font-semibold text-foreground mb-2">Fast Transition</h3>
            <p className="text-muted-foreground text-sm">150ms transition on hover</p>
          </div>
          <div className="bg-navy-50 p-6 rounded-lg hover:bg-navy-100 transition-base cursor-pointer">
            <h3 className="font-display font-semibold text-foreground mb-2">Base Transition</h3>
            <p className="text-muted-foreground text-sm">200ms standard transition</p>
          </div>
          <div className="bg-navy-50 p-6 rounded-lg hover:bg-navy-100 transition-slow cursor-pointer">
            <h3 className="font-display font-semibold text-foreground mb-2">Slow Transition</h3>
            <p className="text-muted-foreground text-sm">300ms slower transition</p>
          </div>
        </div>
      </section>

      {/* Dynamic Styling Example */}
      <section className="space-y-4">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Dynamic Styling (TypeScript)
        </h2>
        
        <div style={dynamicStyles}>
          <h3 className="font-display font-semibold text-foreground mb-2">
            Dynamically Styled Component
          </h3>
          <p className="text-muted-foreground">
            This component uses TypeScript design tokens for dynamic styling. 
            The background color, padding, and border radius are all applied 
            using imported design token values.
          </p>
        </div>
      </section>

      {/* Enhanced Form Examples */}
      <section className="space-y-4">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Form Elements with Semantic States
        </h2>
        
        <div className="max-w-2xl space-y-6">
          {/* Default Input */}
          <div>
            <label htmlFor="default-input" className="block text-sm font-semibold mb-2 text-primary">
              Default Input
            </label>
            <input
              type="text"
              id="default-input"
              placeholder="Enter some text..."
              className="input-default w-full rounded-lg px-4 py-3 text-base transition-base"
            />
            <p className="text-xs mt-1 text-tertiary">This input uses semantic color tokens</p>
          </div>
          
          {/* Success Input */}
          <div>
            <label htmlFor="success-input" className="block text-sm font-semibold mb-2 text-primary">
              Success Input
            </label>
            <input
              type="text"
              id="success-input"
              placeholder="Valid input..."
              value="john@example.com"
              className="w-full rounded-lg px-4 py-3 text-base transition-base"
              style={{
                backgroundColor: getSemanticColor('inputBackground'),
                borderColor: getStatusColor('success', 'border'),
                color: getSemanticColor('inputText'),
                border: '1px solid'
              }}
              readOnly
            />
            <p className="text-xs mt-1" style={{ color: getStatusColor('success') }}>
              ✓ Email format is valid
            </p>
          </div>
          
          {/* Error Input */}
          <div>
            <label htmlFor="error-input" className="block text-sm font-semibold mb-2 text-primary">
              Error Input
            </label>
            <input
              type="text"
              id="error-input"
              placeholder="Invalid input..."
              className="input-error w-full rounded-lg px-4 py-3 text-base transition-base"
            />
            <p className="text-xs mt-1" style={{ color: getStatusColor('error') }}>
              ✗ This field is required
            </p>
          </div>
          
          {/* Disabled Input */}
          <div>
            <label htmlFor="disabled-input" className="block text-sm font-semibold mb-2 text-disabled">
              Disabled Input
            </label>
            <input
              type="text"
              id="disabled-input"
              placeholder="Disabled input..."
              className="input-disabled w-full rounded-lg px-4 py-3 text-base cursor-not-allowed"
              disabled
            />
            <p className="text-xs mt-1 text-disabled">This field is not available</p>
          </div>
          
          {/* Textarea with Focus States */}
          <div>
            <label htmlFor="example-textarea" className="block text-sm font-semibold mb-2 text-primary">
              Textarea with Focus Ring
            </label>
            <textarea
              id="example-textarea"
              rows={4}
              placeholder="Enter a longer message..."
              className="input-default w-full rounded-lg px-4 py-3 text-base transition-base resize-none"
            />
            <p className="text-xs mt-1 text-tertiary">Focus to see the semantic focus ring</p>
          </div>
        </div>
      </section>
    </div>
  );
}