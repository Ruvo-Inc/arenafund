import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Enhanced lazy loading with error boundaries and loading states
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: ComponentType;
    errorFallback?: ComponentType<{ error: Error; retry: () => void }>;
    preload?: boolean;
  } = {}
): LazyExoticComponent<T> {
  const LazyComponent = lazy(importFn);
  
  // Preload the component if requested
  if (options.preload && typeof window !== 'undefined') {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importFn().catch(() => {
        // Silently fail preloading
      });
    }, 100);
  }
  
  return LazyComponent;
}

/**
 * Preload a lazy component
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): Promise<{ default: T }> {
  return importFn();
}

/**
 * Create a lazy component with intersection observer for viewport-based loading
 */
export function createViewportLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    rootMargin?: string;
    threshold?: number;
  } = {}
): LazyExoticComponent<T> {
  const { rootMargin = '50px', threshold = 0.1 } = options;
  
  // Create a wrapper that only loads when in viewport
  const ViewportLazyComponent = lazy(async () => {
    // Wait for intersection observer if available
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      return new Promise<{ default: T }>((resolve) => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                observer.disconnect();
                importFn().then(resolve);
              }
            });
          },
          { rootMargin, threshold }
        );
        
        // Observe a temporary element
        const tempElement = document.createElement('div');
        tempElement.style.height = '1px';
        document.body.appendChild(tempElement);
        observer.observe(tempElement);
        
        // Cleanup after 10 seconds if not intersected
        setTimeout(() => {
          observer.disconnect();
          document.body.removeChild(tempElement);
          importFn().then(resolve);
        }, 10000);
      });
    }
    
    // Fallback to immediate loading
    return importFn();
  });
  
  return ViewportLazyComponent;
}

/**
 * Lazy load images with intersection observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();
  
  constructor(options: IntersectionObserverInit = {}) {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          this.loadImage(img);
          this.observer?.unobserve(img);
          this.images.delete(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01,
      ...options,
    });
  }
  
  /**
   * Add an image to lazy loading
   */
  observe(img: HTMLImageElement) {
    if (!this.observer) {
      this.loadImage(img);
      return;
    }
    
    this.images.add(img);
    this.observer.observe(img);
  }
  
  /**
   * Load an image
   */
  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    }
    
    if (srcset) {
      img.srcset = srcset;
      img.removeAttribute('data-srcset');
    }
    
    // Add loaded class for CSS transitions
    img.classList.add('loaded');
  }
  
  /**
   * Disconnect the observer
   */
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

/**
 * Global lazy image loader instance
 */
export const globalLazyImageLoader = new LazyImageLoader();

/**
 * Initialize lazy loading for the application
 */
export function initLazyLoading() {
  if (typeof window === 'undefined') return;
  
  // Lazy load existing images
  document.querySelectorAll('img[data-src]').forEach((img) => {
    globalLazyImageLoader.observe(img as HTMLImageElement);
  });
  
  // Observe for new images added to the DOM
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Check if the added element is an image with data-src
          if (element.tagName === 'IMG' && element.hasAttribute('data-src')) {
            globalLazyImageLoader.observe(element as HTMLImageElement);
          }
          
          // Check for images within the added element
          element.querySelectorAll('img[data-src]').forEach((img) => {
            globalLazyImageLoader.observe(img as HTMLImageElement);
          });
        }
      });
    });
  });
  
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    globalLazyImageLoader.disconnect();
    mutationObserver.disconnect();
  });
}

/**
 * Route-based code splitting utilities
 */
export const LazyComponents = {
  // Newsletter components
  NewsletterModal: createLazyComponent(
    () => import('@/components/NewsletterModal'),
    { preload: false }
  ),
  NewsletterForm: createLazyComponent(
    () => import('@/components/NewsletterForm').then(module => ({ default: module.NewsletterForm })),
    { preload: false }
  ),
  
  // Application forms
  InvestorForm506b: createLazyComponent(
    () => import('@/components/InvestorForm506b'),
    { preload: false }
  ),
  InvestorForm506c: createLazyComponent(
    () => import('@/components/InvestorForm506c'),
    { preload: false }
  ),
  
  // UI components that are not always needed
  VerificationFileUpload: createViewportLazyComponent(
    () => import('@/components/ui/VerificationFileUpload'),
    { rootMargin: '100px' }
  ),
  
  // Analytics components
  PerformanceDashboard: createLazyComponent(
    () => import('@/components/WebVitalsMonitor').then(mod => ({ default: mod.PerformanceDashboard })),
    { preload: process.env.NODE_ENV === 'development' }
  ),
};