'use client';

import React from 'react';
import NewsletterModal from './NewsletterModal';
import { useNewsletterModal } from '../hooks/useNewsletterModal';

export default function NewsletterModalDemo() {
  const { isOpen, triggerSource, openModal, closeModal } = useNewsletterModal();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Newsletter Modal Demo</h2>
      
      <div className="space-x-4">
        <button
          onClick={() => openModal('get-notified')}
          className="arena-btn-primary"
        >
          Get Notified
        </button>
        
        <button
          onClick={() => openModal('subscribe-updates')}
          className="arena-btn-secondary"
        >
          Subscribe for Updates
        </button>
      </div>

      <NewsletterModal
        isOpen={isOpen}
        onClose={closeModal}
        triggerSource={triggerSource}
      />
    </div>
  );
}