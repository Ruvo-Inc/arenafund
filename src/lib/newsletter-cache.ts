// Newsletter subscription caching utilities for performance optimization

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class NewsletterCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  // Set cache entry with TTL
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Clean up expired entries periodically
    this.cleanupExpired();
  }

  // Get cache entry if not expired
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Delete specific cache entry
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Get cache statistics
  getStats(): { size: number; hitRate: number; memoryUsage: number } {
    const size = this.cache.size;
    const memoryUsage = JSON.stringify([...this.cache.entries()]).length;
    
    return {
      size,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      memoryUsage,
    };
  }
}

// Global cache instance
const newsletterCache = new NewsletterCache();

// Cache key generators
export const CacheKeys = {
  subscriberExists: (email: string) => `subscriber_exists:${email}`,
  subscriberStatus: (email: string) => `subscriber_status:${email}`,
  subscriberCount: () => 'subscriber_count',
  recentSubscriptions: (limit: number) => `recent_subscriptions:${limit}`,
  emailValidation: (email: string) => `email_validation:${email}`,
} as const;

// Cache TTL constants (in milliseconds)
export const CacheTTL = {
  SUBSCRIBER_EXISTS: 2 * 60 * 1000, // 2 minutes
  SUBSCRIBER_STATUS: 5 * 60 * 1000, // 5 minutes
  SUBSCRIBER_COUNT: 10 * 60 * 1000, // 10 minutes
  EMAIL_VALIDATION: 30 * 60 * 1000, // 30 minutes
  RECENT_SUBSCRIPTIONS: 1 * 60 * 1000, // 1 minute
} as const;

// Cached operations for newsletter subscriptions
export class NewsletterCacheOperations {
  // Cache subscriber existence check
  static async cacheSubscriberExists(email: string, exists: boolean): Promise<void> {
    const key = CacheKeys.subscriberExists(email);
    newsletterCache.set(key, exists, CacheTTL.SUBSCRIBER_EXISTS);
  }

  static getCachedSubscriberExists(email: string): boolean | null {
    const key = CacheKeys.subscriberExists(email);
    return newsletterCache.get<boolean>(key);
  }

  // Cache subscriber status
  static async cacheSubscriberStatus(email: string, status: string): Promise<void> {
    const key = CacheKeys.subscriberStatus(email);
    newsletterCache.set(key, status, CacheTTL.SUBSCRIBER_STATUS);
  }

  static getCachedSubscriberStatus(email: string): string | null {
    const key = CacheKeys.subscriberStatus(email);
    return newsletterCache.get<string>(key);
  }

  // Cache email validation results
  static async cacheEmailValidation(email: string, isValid: boolean, reason?: string): Promise<void> {
    const key = CacheKeys.emailValidation(email);
    newsletterCache.set(key, { isValid, reason }, CacheTTL.EMAIL_VALIDATION);
  }

  static getCachedEmailValidation(email: string): { isValid: boolean; reason?: string } | null {
    const key = CacheKeys.emailValidation(email);
    return newsletterCache.get<{ isValid: boolean; reason?: string }>(key);
  }

  // Cache subscriber count
  static async cacheSubscriberCount(count: number): Promise<void> {
    const key = CacheKeys.subscriberCount();
    newsletterCache.set(key, count, CacheTTL.SUBSCRIBER_COUNT);
  }

  static getCachedSubscriberCount(): number | null {
    const key = CacheKeys.subscriberCount();
    return newsletterCache.get<number>(key);
  }

  // Invalidate cache entries when data changes
  static invalidateSubscriberCache(email: string): void {
    newsletterCache.delete(CacheKeys.subscriberExists(email));
    newsletterCache.delete(CacheKeys.subscriberStatus(email));
    newsletterCache.delete(CacheKeys.subscriberCount());
  }

  // Get cache statistics
  static getCacheStats() {
    return newsletterCache.getStats();
  }

  // Clear all newsletter cache
  static clearCache(): void {
    newsletterCache.clear();
  }
}

// Performance monitoring for cache operations
export function withCachePerformance<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = performance.now();
  
  return operation().then(result => {
    const duration = performance.now() - startTime;
    console.log(`Cache operation ${operationName} took ${duration.toFixed(2)}ms`);
    return result;
  }).catch(error => {
    const duration = performance.now() - startTime;
    console.error(`Cache operation ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  });
}

export default newsletterCache;