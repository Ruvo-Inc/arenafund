'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface UseMobileNavigationOptions {
  autoClose?: boolean;
  preventBodyScroll?: boolean;
  hapticFeedback?: boolean;
}

interface UseMobileNavigationReturn {
  // Navigation state
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  open: () => void;
  
  // Navigation items
  navigationSections: NavigationSection[];
  setNavigationSections: (sections: NavigationSection[]) => void;
  
  // Current page info
  currentPath: string;
  pageTitle: string;
  breadcrumbs: Array<{ label: string; href?: string; active?: boolean }>;
  
  // Navigation history
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
  
  // Utility functions
  isActivePage: (href: string) => boolean;
  generateBreadcrumbs: (path?: string) => Array<{ label: string; href?: string; active?: boolean }>;
}

const defaultNavigationSections: NavigationSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Home', href: '/' },
      { label: 'Investors', href: '/investors' },
      { label: 'Founders', href: '/founders' },
      { label: 'Process', href: '/process' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Team', href: '/team' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Disclosures', href: '/disclosures' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
];

const pageLabels: Record<string, string> = {
  '/': 'Home',
  '/investors': 'Investors',
  '/founders': 'Founders',
  '/process': 'Process',
  '/faq': 'FAQ',
  '/team': 'Team',
  '/disclosures': 'Disclosures',
  '/privacy': 'Privacy',
  '/account': 'Account',
  '/profile': 'Profile',
  '/apply': 'Apply',
};

export function useMobileNavigation(options: UseMobileNavigationOptions = {}): UseMobileNavigationReturn {
  const {
    autoClose = true,
    preventBodyScroll = true,
    hapticFeedback = true,
  } = options;

  const pathname = usePathname();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [navigationSections, setNavigationSections] = useState<NavigationSection[]>(defaultNavigationSections);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // Track navigation history
  useEffect(() => {
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1] !== pathname) {
        newHistory.push(pathname);
        // Keep only last 20 entries
        return newHistory.slice(-20);
      }
      return newHistory;
    });
  }, [pathname]);

  // Auto-close navigation on route change
  useEffect(() => {
    if (autoClose && isOpen) {
      setIsOpen(false);
    }
  }, [pathname, autoClose, isOpen]);

  // Prevent body scroll when navigation is open
  useEffect(() => {
    if (!preventBodyScroll) return;

    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen, preventBodyScroll]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const isActivePage = useCallback((href: string) => {
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  }, [pathname]);

  const generateBreadcrumbs = useCallback((path?: string) => {
    const currentPath = path || pathname;
    const segments = currentPath.split('/').filter(Boolean);
    
    const breadcrumbs: Array<{ label: string; href?: string; active?: boolean }> = [{ label: 'Home', href: '/', active: false }];
    
    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = pageLabels[href] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      const active = index === segments.length - 1;
      
      breadcrumbs.push({
        label,
        ...(active ? {} : { href }),
        active,
      });
    });

    return breadcrumbs;
  }, [pathname]);

  const canGoBack = navigationHistory.length > 1;
  const canGoForward = false; // Browser forward navigation

  const goBack = useCallback(() => {
    if (canGoBack) {
      router.back();
    }
  }, [canGoBack, router]);

  const goForward = useCallback(() => {
    router.forward();
  }, [router]);

  const pageTitle = pageLabels[pathname] || 'Page';
  const breadcrumbs = generateBreadcrumbs();

  return {
    // Navigation state
    isOpen,
    setIsOpen,
    toggle,
    close,
    open,
    
    // Navigation items
    navigationSections,
    setNavigationSections,
    
    // Current page info
    currentPath: pathname,
    pageTitle,
    breadcrumbs,
    
    // Navigation history
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    
    // Utility functions
    isActivePage,
    generateBreadcrumbs,
  };
}