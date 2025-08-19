'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface MobileNavigationContextType {
  isNavigationOpen: boolean;
  setNavigationOpen: (open: boolean) => void;
  toggleNavigation: () => void;
  closeNavigation: () => void;
  currentPage: string;
  navigationHistory: string[];
  canGoBack: boolean;
  goBack: () => void;
}

const MobileNavigationContext = createContext<MobileNavigationContextType | undefined>(undefined);

interface MobileNavigationProviderProps {
  children: ReactNode;
}

export function MobileNavigationProvider({ children }: MobileNavigationProviderProps) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const pathname = usePathname();

  // Track navigation history
  useEffect(() => {
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1] !== pathname) {
        newHistory.push(pathname);
        // Keep only last 10 entries
        return newHistory.slice(-10);
      }
      return newHistory;
    });
  }, [pathname]);

  // Close navigation on route change
  useEffect(() => {
    setIsNavigationOpen(false);
  }, [pathname]);

  // Prevent body scroll when navigation is open
  useEffect(() => {
    if (isNavigationOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isNavigationOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNavigationOpen) {
        setIsNavigationOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isNavigationOpen]);

  const setNavigationOpen = (open: boolean) => {
    setIsNavigationOpen(open);
  };

  const toggleNavigation = () => {
    setIsNavigationOpen(prev => !prev);
  };

  const closeNavigation = () => {
    setIsNavigationOpen(false);
  };

  const canGoBack = navigationHistory.length > 1;

  const goBack = () => {
    if (canGoBack) {
      window.history.back();
    }
  };

  const value: MobileNavigationContextType = {
    isNavigationOpen,
    setNavigationOpen,
    toggleNavigation,
    closeNavigation,
    currentPage: pathname,
    navigationHistory,
    canGoBack,
    goBack,
  };

  return (
    <MobileNavigationContext.Provider value={value}>
      {children}
    </MobileNavigationContext.Provider>
  );
}

export function useMobileNavigation() {
  const context = useContext(MobileNavigationContext);
  if (context === undefined) {
    throw new Error('useMobileNavigation must be used within a MobileNavigationProvider');
  }
  return context;
}