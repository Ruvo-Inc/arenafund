import crypto from 'crypto';
import { NextRequest } from 'next/server';

interface CSRFTokenData {
  token: string;
  timestamp: number;
  userAgent: string;
  ipHash: string;
  environment: string;
  sessionId?: string;
}

// CSRF token configuration with environment awareness
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'staging';
const IS_LOCALHOST = process.env.NODE_ENV === 'development';

// Enhanced configuration for different environments
const CSRF_CONFIG = {
  development: {
    strictIPCheck: false,
    strictUserAgentCheck: false,
    allowLocalhostBypass: true,
    tokenExpiry: 2 * 60 * 60 * 1000, // 2 hours for development
  },
  production: {
    strictIPCheck: true,
    strictUserAgentCheck: true,
    allowLocalhostBypass: false,
    tokenExpiry: 60 * 60 * 1000, // 1 hour for production
  }
};

const currentConfig = IS_DEVELOPMENT ? CSRF_CONFIG.development : CSRF_CONFIG.production;

// Generate a secure CSRF token with environment awareness
export function generateCSRFToken(request: NextRequest): string {
  const timestamp = Date.now();
  const userAgent = request.headers.get('user-agent') || '';
  const clientIP = getClientIP(request);
  const ipHash = hashIP(clientIP);
  
  // Generate session ID for additional security in development
  const sessionId = IS_DEVELOPMENT ? crypto.randomBytes(16).toString('hex') : undefined;
  
  const tokenData: CSRFTokenData = {
    token: crypto.randomBytes(32).toString('hex'),
    timestamp,
    userAgent: currentConfig.strictUserAgentCheck ? userAgent : 'flexible',
    ipHash: currentConfig.strictIPCheck ? ipHash : 'flexible',
    environment: IS_DEVELOPMENT ? 'development' : 'production',
    ...(sessionId && { sessionId })
  };
  
  // Create HMAC signature
  const payload = JSON.stringify(tokenData);
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex');
  
  // Combine payload and signature
  const csrfToken = Buffer.from(`${payload}:${signature}`).toString('base64url');
  
  // Log token generation in development for debugging
  if (IS_DEVELOPMENT) {
    console.log('[CSRF] Token generated:', {
      clientIP,
      ipHash,
      userAgent: userAgent.substring(0, 50) + '...',
      timestamp: new Date(timestamp).toISOString(),
      environment: tokenData.environment
    });
  }
  
  return csrfToken;
}

// Verify CSRF token with enhanced environment-aware validation
export function verifyCSRFToken(token: string, request: NextRequest): boolean {
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64url').toString();
    const [payload, signature] = decoded.split(':');
    
    if (!payload || !signature) {
      if (IS_DEVELOPMENT) {
        console.log('[CSRF] Token verification failed: Invalid token format');
      }
      return false;
    }
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(payload)
      .digest('hex');
    
    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )) {
      if (IS_DEVELOPMENT) {
        console.log('[CSRF] Token verification failed: Invalid signature');
      }
      return false;
    }
    
    // Parse token data
    const tokenData: CSRFTokenData = JSON.parse(payload);
    
    // Check expiry with environment-specific timeout
    const now = Date.now();
    const expiryTime = currentConfig.tokenExpiry;
    if (now - tokenData.timestamp > expiryTime) {
      if (IS_DEVELOPMENT) {
        console.log('[CSRF] Token verification failed: Token expired', {
          tokenAge: now - tokenData.timestamp,
          maxAge: expiryTime
        });
      }
      return false;
    }
    
    // Environment-aware validation
    if (currentConfig.strictUserAgentCheck && tokenData.userAgent !== 'flexible') {
      const currentUserAgent = request.headers.get('user-agent') || '';
      if (tokenData.userAgent !== currentUserAgent) {
        if (IS_DEVELOPMENT) {
          console.log('[CSRF] Token verification failed: User-Agent mismatch', {
            expected: tokenData.userAgent.substring(0, 50) + '...',
            actual: currentUserAgent.substring(0, 50) + '...'
          });
        }
        return false;
      }
    }
    
    // Environment-aware IP validation
    if (currentConfig.strictIPCheck && tokenData.ipHash !== 'flexible') {
      const currentIP = getClientIP(request);
      const currentIPHash = hashIP(currentIP);
      
      // Special handling for localhost in development
      if (IS_LOCALHOST && (currentIP === '::1' || currentIP === '127.0.0.1' || currentIP === 'unknown')) {
        // Allow localhost variations in development
        const localhostHashes = [
          hashIP('::1'),
          hashIP('127.0.0.1'),
          hashIP('localhost'),
          hashIP('unknown')
        ];
        
        if (!localhostHashes.includes(tokenData.ipHash) && !localhostHashes.includes(currentIPHash)) {
          if (IS_DEVELOPMENT) {
            console.log('[CSRF] Token verification failed: IP hash mismatch (not localhost)', {
              expectedHash: tokenData.ipHash,
              actualHash: currentIPHash,
              currentIP
            });
          }
          return false;
        }
      } else if (tokenData.ipHash !== currentIPHash) {
        if (IS_DEVELOPMENT) {
          console.log('[CSRF] Token verification failed: IP hash mismatch', {
            expectedHash: tokenData.ipHash,
            actualHash: currentIPHash,
            currentIP
          });
        }
        return false;
      }
    }
    
    // Validate environment consistency
    const expectedEnvironment = IS_DEVELOPMENT ? 'development' : 'production';
    if (tokenData.environment && tokenData.environment !== expectedEnvironment) {
      if (IS_DEVELOPMENT) {
        console.log('[CSRF] Token verification failed: Environment mismatch', {
          expected: expectedEnvironment,
          actual: tokenData.environment
        });
      }
      return false;
    }
    
    if (IS_DEVELOPMENT) {
      console.log('[CSRF] Token verification successful:', {
        tokenAge: now - tokenData.timestamp,
        environment: tokenData.environment,
        strictChecks: {
          ip: currentConfig.strictIPCheck,
          userAgent: currentConfig.strictUserAgentCheck
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('[CSRF] Token verification error:', error);
    if (IS_DEVELOPMENT) {
      console.log('[CSRF] Token verification failed: Exception thrown', {
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token.substring(0, 50) + '...'
      });
    }
    return false;
  }
}

// Enhanced client IP detection with localhost handling
function getClientIP(request: NextRequest): string {
  // Check various IP headers in order of preference
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  // Handle X-Forwarded-For header (can contain multiple IPs)
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    // Return the first non-private IP, or the first IP if all are private
    for (const ip of ips) {
      if (ip && !isPrivateIP(ip)) {
        return ip;
      }
    }
    return ips[0] || 'unknown';
  }
  
  // Check other headers
  if (realIP && realIP !== 'unknown') {
    return realIP;
  }
  if (cfConnectingIP && cfConnectingIP !== 'unknown') {
    return cfConnectingIP;
  }
  if (remoteAddr && remoteAddr !== 'unknown') {
    return remoteAddr;
  }
  
  // In development/localhost, normalize to a consistent value
  if (IS_LOCALHOST) {
    return 'localhost';
  }
  
  return 'unknown';
}

// Helper function to check if IP is private/local
function isPrivateIP(ip: string): boolean {
  if (!ip || ip === 'unknown') return true;
  
  // IPv6 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return true;
  
  // IPv4 private ranges
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Regex);
  
  if (match) {
    const [, a, b, c, d] = match.map(Number);
    
    // 127.x.x.x (localhost)
    if (a === 127) return true;
    
    // 10.x.x.x (private)
    if (a === 10) return true;
    
    // 172.16.x.x - 172.31.x.x (private)
    if (a === 172 && b >= 16 && b <= 31) return true;
    
    // 192.168.x.x (private)
    if (a === 192 && b === 168) return true;
    
    // 169.254.x.x (link-local)
    if (a === 169 && b === 254) return true;
  }
  
  return false;
}

// Enhanced IP hashing with consistent localhost handling
function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'default-salt';
  
  // Normalize localhost variations for consistent hashing
  let normalizedIP = ip;
  if (IS_LOCALHOST && (ip === '::1' || ip === '127.0.0.1' || ip === 'unknown' || ip === 'localhost')) {
    normalizedIP = 'localhost';
  }
  
  const hash = crypto
    .createHash('sha256')
    .update(normalizedIP + salt)
    .digest('hex')
    .substring(0, 16);
    
  if (IS_DEVELOPMENT) {
    console.log('[CSRF] IP hash generated:', {
      originalIP: ip,
      normalizedIP,
      hash
    });
  }
  
  return hash;
}

// Middleware to add CSRF token to response headers
export function addCSRFTokenToResponse(request: NextRequest): { token: string; headers: Record<string, string> } {
  const token = generateCSRFToken(request);
  
  return {
    token,
    headers: {
      'X-CSRF-Token': token,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    }
  };
}