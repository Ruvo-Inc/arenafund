'use client';

import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Lazy load the NewsletterModal component
const NewsletterModal = lazy(() => import('./NewsletterModal'));

interface NewsletterModalLazyProps {
  isOpen: boolean;
  onClose: () => void;
  triggerSource?: 'get-notified' | 'subscribe-updates';
}

// Loading fallback component for the modal
function ModalLoadingFallback() {
  return (
    <div className="newsletter-modal-overlay">
      <div className="newsletter-modal-content">
        <div className="newsletter-modal-header">
          <h2 className="newsletter-modal-title">Loading...</h2>
        </div>
        <div className="newsletter-modal-body">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" className="border-primary border-t-primary/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsletterModalLazy({ isOpen, onClose, triggerSource }: NewsletterModalLazyProps) {
  // Only render the modal when it's open to enable lazy loading
  if (!isOpen) {
    return null;
  }

  return (
    <Suspense fallback={<ModalLoadingFallback />}>
      <NewsletterModal
        isOpen={isOpen}
        onClose={onClose}
        triggerSource={triggerSource}
      />
    </Suspense>
  );
}