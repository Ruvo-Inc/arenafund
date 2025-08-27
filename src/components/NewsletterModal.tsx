'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NewsletterForm } from './NewsletterForm';
import { NewsletterSuccessMessage } from './ui/SuccessMessage';
import { useNewsletterAnalytics } from '@/hooks/useNewsletterAnalytics';
import { useNewsletterPerformance, useRenderPerformance, useMemoryTracking } from '@/hooks/useNewsletterPerformance';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerSource?: 'get-notified' | 'subscribe-updates';
}

export default function NewsletterModal({ isOpen, onClose, triggerSource }: NewsletterModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isFormLoading, setIsFormLoading] = React.useState(false);

  // Analytics tracking
  const { 
    trackModalOpen, 
    trackModalClose, 
    trackFormError,
    startPerformanceTimer 
  } = useNewsletterAnalytics({ 
    source: triggerSource || 'direct' 
  });

  // Performance monitoring
  const {
    startModalTimer,
    trackModalInteraction,
    getMetrics,
    resetMetrics
  } = useNewsletterPerformance();

  // Component render performance tracking
  const { renderCount } = useRenderPerformance('NewsletterModal');

  // Memory usage tracking
  const { trackMemoryUsage } = useMemoryTracking();

  // Enhanced focus and keyboard management with analytics and performance monitoring
  useEffect(() => {
    const endPerformanceTimer = startPerformanceTimer('modal_lifecycle');
    const endModalTimer = startModalTimer();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      // Handle escape key
      if (event.key === 'Escape') {
        event.preventDefault();
        trackModalInteraction('escape_key_close');
        trackModalClose();
        onClose();
        return;
      }

      // Handle tab key for focus trapping
      if (event.key === 'Tab') {
        handleTabKey(event);
        trackModalInteraction('tab_navigation');
      }
    };

    if (isOpen) {
      // Track modal open with performance
      trackModalOpen();
      trackModalInteraction('open');
      
      // Track memory usage when modal opens
      trackMemoryUsage();
      
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Add event listeners
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevent background scrolling with better mobile support
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
      
      // Focus management - focus close button initially for better mobile UX
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      // Track modal close if it was previously open
      if (previousActiveElement.current) {
        trackModalClose();
        trackModalInteraction('close');
        
        // End modal timer and get final metrics
        const modalDuration = endModalTimer();
        console.log('Modal performance metrics:', getMetrics());
      }
      
      // Restore scrolling
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
      
      // Restore focus to the element that opened the modal
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      
      // Reset success state when modal closes
      setShowSuccess(false);
      
      // Reset performance metrics for next interaction
      setTimeout(() => {
        resetMetrics();
      }, 1000);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      endPerformanceTimer();
      
      // Cleanup styles if component unmounts while modal is open
      if (isOpen) {
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    };
  }, [isOpen, onClose, trackModalOpen, trackModalClose, startPerformanceTimer, startModalTimer, trackModalInteraction, getMetrics, resetMetrics, trackMemoryUsage]);

  // Enhanced focus trapping with better mobile support
  const handleTabKey = (event: KeyboardEvent) => {
    if (!modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  // Handle overlay click with touch support and analytics
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      trackModalInteraction('overlay_click_close');
      trackModalClose();
      onClose();
    }
  };

  // Handle touch events for mobile
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      // Store initial touch position to prevent accidental closes during scrolling
      const touch = event.touches[0];
      overlayRef.current?.setAttribute('data-touch-start-y', touch.clientY.toString());
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      const startY = overlayRef.current?.getAttribute('data-touch-start-y');
      if (startY) {
        const touch = event.changedTouches[0];
        const deltaY = Math.abs(touch.clientY - parseInt(startY));
        
        // Only close if the touch didn't move much (not a scroll gesture)
        if (deltaY < 10) {
          trackModalInteraction('touch_close');
          trackModalClose();
          onClose();
        }
      }
      overlayRef.current?.removeAttribute('data-touch-start-y');
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      ref={overlayRef}
      className="newsletter-modal-overlay"
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-modal-title"
      aria-describedby="newsletter-modal-description"
      aria-live="polite"
    >
      <div 
        ref={modalRef}
        className="newsletter-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* Modal Header */}
        <div className="newsletter-modal-header">
          <h2 id="newsletter-modal-title" className="newsletter-modal-title">
            Stay Updated with Arena Fund Insights
            {isFormLoading && (
              <span className="ml-2 inline-block">
                <LoadingSpinner size="sm" className="border-primary border-t-primary/30" />
              </span>
            )}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={() => {
              trackModalInteraction('close_button_click');
              trackModalClose();
              onClose();
            }}
            className="newsletter-modal-close touch-target"
            aria-label="Close newsletter subscription modal"
            type="button"
            title="Close modal (Escape key)"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="newsletter-modal-body">
          <p id="newsletter-modal-description" className="newsletter-modal-description">
            Get notified when we publish new insights and analysis. Join our community of investors and entrepreneurs.
          </p>
          
          {showSuccess ? (
            <NewsletterSuccessMessage
              onClose={() => {
                setShowSuccess(false);
                trackModalInteraction('success_close');
                trackModalClose();
                onClose();
              }}
            />
          ) : (
            <div className={`relative ${isFormLoading ? 'pointer-events-none' : ''}`}>
              <NewsletterForm
                triggerSource={triggerSource}
                onSuccess={() => setShowSuccess(true)}
                onLoadingChange={setIsFormLoading}
              />
              {isFormLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <LoadingSpinner size="md" className="border-primary border-t-primary/30" />
                    <p className="mt-2 text-sm text-arena-hunter-green font-medium">Processing your subscription...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}