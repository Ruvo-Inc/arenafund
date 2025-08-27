'use client';

import { useState, useCallback } from 'react';

interface UseNewsletterModalReturn {
  isOpen: boolean;
  triggerSource: 'get-notified' | 'subscribe-updates' | undefined;
  openModal: (source?: 'get-notified' | 'subscribe-updates') => void;
  closeModal: () => void;
}

export function useNewsletterModal(): UseNewsletterModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerSource, setTriggerSource] = useState<'get-notified' | 'subscribe-updates' | undefined>();

  const openModal = useCallback((source?: 'get-notified' | 'subscribe-updates') => {
    setTriggerSource(source);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Reset trigger source after a brief delay to allow for animations
    setTimeout(() => {
      setTriggerSource(undefined);
    }, 300);
  }, []);

  return {
    isOpen,
    triggerSource,
    openModal,
    closeModal,
  };
}