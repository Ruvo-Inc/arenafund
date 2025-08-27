'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface TouchNavigationProps {
  children: React.ReactNode;
  className?: string;
}

interface TouchNavigationItemProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export function TouchNavigation({ children, className }: TouchNavigationProps) {
  return (
    <nav className={cn('flex items-center space-x-4', className)}>
      {children}
    </nav>
  );
}

export function TouchNavigationItem({ 
  children, 
  active = false, 
  onClick, 
  className 
}: TouchNavigationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg transition-colors touch-target',
        active 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        className
      )}
    >
      {children}
    </button>
  );
}

export function MobileMenuToggle({ isOpen, onToggle, className }: MobileMenuToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors touch-target',
        className
      )}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span className={cn(
          'block w-5 h-0.5 bg-gray-600 transition-transform',
          isOpen && 'rotate-45 translate-y-1'
        )} />
        <span className={cn(
          'block w-5 h-0.5 bg-gray-600 mt-1 transition-opacity',
          isOpen && 'opacity-0'
        )} />
        <span className={cn(
          'block w-5 h-0.5 bg-gray-600 mt-1 transition-transform',
          isOpen && '-rotate-45 -translate-y-1'
        )} />
      </div>
    </button>
  );
}

export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className 
}: SwipeableCardProps) {
  const [startX, setStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX === null) return;
    
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (diff < 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
    
    setStartX(null);
  };

  return (
    <div
      className={cn('p-4 bg-white rounded-lg shadow-sm border', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}