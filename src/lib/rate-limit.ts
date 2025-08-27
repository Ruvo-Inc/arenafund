interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Maximum number of unique tokens per interval
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory storage for rate limiting
// In production, use Redis or similar distributed cache
const tokenCache = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (limit: number, token: string): Promise<RateLimitResult> => {
      return new Promise((resolve) => {
        const now = Date.now();
        
        // Clean up expired entries
        for (const [key, value] of tokenCache.entries()) {
          if (value.resetTime <= now) {
            tokenCache.delete(key);
          }
        }
        
        // Get or create token entry
        let tokenData = tokenCache.get(token);
        if (!tokenData || tokenData.resetTime <= now) {
          tokenData = {
            count: 0,
            resetTime: now + config.interval
          };
        }
        
        // Check if limit exceeded
        if (tokenData.count >= limit) {
          resolve({
            success: false,
            limit,
            remaining: 0,
            reset: tokenData.resetTime
          });
          return;
        }
        
        // Increment counter
        tokenData.count++;
        tokenCache.set(token, tokenData);
        
        resolve({
          success: true,
          limit,
          remaining: limit - tokenData.count,
          reset: tokenData.resetTime
        });
      });
    }
  };
}