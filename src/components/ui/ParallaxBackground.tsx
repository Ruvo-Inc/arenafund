'use client';

import React from 'react';
import { useParallax, useMultiLayerParallax, ParallaxConfig } from '@/hooks/useParallax';

export interface ParallaxBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  config?: ParallaxConfig;
  style?: React.CSSProperties;
}

export interface MultiLayerParallaxProps {
  children: React.ReactNode;
  layers: Array<{
    content: React.ReactNode;
    config: ParallaxConfig;
    className?: string;
    style?: React.CSSProperties;
  }>;
  containerClassName?: string;
}

/**
 * Production parallax background component with enterprise-grade performance
 */
export function ParallaxBackground({
  children,
  className = '',
  config = {},
  style = {}
}: ParallaxBackgroundProps) {
  const { ref, transform, shouldAnimate } = useParallax(config);

  return (
    <div
      ref={ref as any}
      className={className}
      style={{
        ...style,
        transform: shouldAnimate ? transform : 'translate3d(0, 0, 0)',
        willChange: shouldAnimate ? 'transform' : 'auto'
      }}
    >
      {children}
    </div>
  );
}

/**
 * Advanced multi-layer parallax system for sophisticated visual compositions
 */
export function MultiLayerParallax({
  children,
  layers,
  containerClassName = ''
}: MultiLayerParallaxProps) {
  const { containerRef, layerStates, shouldAnimate } = useMultiLayerParallax(
    layers.map(layer => layer.config)
  );

  return (
    <div ref={containerRef as any} className={`relative ${containerClassName}`}>
      {/* Parallax layers */}
      {layers.map((layer, index) => (
        <div
          key={index}
          className={`absolute inset-0 ${layer.className || ''}`}
          style={{
            ...layer.style,
            transform: shouldAnimate ? layerStates[index]?.transform : 'translate3d(0, 0, 0)',
            willChange: shouldAnimate ? 'transform' : 'auto',
            zIndex: -layers.length + index // Ensure proper layering
          }}
        >
          {layer.content}
        </div>
      ))}
      
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Professional parallax configurations optimized for Arena Fund's visual identity
 */
export const ParallaxPresets = {
  /**
   * Sophisticated upward movement for hero sections
   */
  HeroFloat: ({ children, className = '', ...props }: Omit<ParallaxBackgroundProps, 'config'>) => (
    <ParallaxBackground
      config={{ speed: 0.3, direction: 'up', enableOnMobile: false }}
      className={className}
      {...props}
    >
      {children}
    </ParallaxBackground>
  ),

  /**
   * Subtle background drift for content sections
   */
  ContentDrift: ({ children, className = '', ...props }: Omit<ParallaxBackgroundProps, 'config'>) => (
    <ParallaxBackground
      config={{ speed: 0.15, direction: 'down', enableOnMobile: false }}
      className={className}
      {...props}
    >
      {children}
    </ParallaxBackground>
  ),

  /**
   * Premium multi-layer gradient system for Arena Fund branding
   */
  BrandGradients: ({ children, containerClassName = '' }: { children: React.ReactNode; containerClassName?: string }) => (
    <MultiLayerParallax
      containerClassName={containerClassName}
      layers={[
        {
          content: <div className="w-full h-full bg-gradient-to-br from-slate-900/30 to-blue-900/20" />,
          config: { speed: 0.08, direction: 'up', enableOnMobile: false },
          className: 'opacity-70'
        },
        {
          content: <div className="w-full h-full bg-gradient-to-tl from-blue-800/15 to-indigo-700/10" />,
          config: { speed: 0.12, direction: 'down', enableOnMobile: false },
          className: 'opacity-50'
        },
        {
          content: <div className="w-full h-full bg-gradient-to-r from-indigo-900/8 to-slate-800/12" />,
          config: { speed: 0.1, direction: 'left', enableOnMobile: false },
          className: 'opacity-60'
        }
      ]}
    >
      {children}
    </MultiLayerParallax>
  )
};