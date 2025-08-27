import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { validateEmail, validateName, sanitizeInput } from '@/lib/email-validation';
import { logSecurityEvent } from '@/lib/security-logging';
import { recordConsent, withdrawConsent } from '@/lib/consent-tracking';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { verifyCSRFToken, addCSRFTokenToResponse } from '@/lib/csrf-protection';
import { InputSanitizer, containsSuspiciousPatterns } from '@/lib/input-sanitization';
import { trackNewsletterApiError, trackNewsletterPerformance } from '@/lib/newsletter-analytics';
import { NewsletterCacheOperations, withCachePerformance } from '@/lib/newsletter-cache';
import crypto from 'crypto';

// Enhanced validation schema for newsletter subscription
const subscribeSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'\.]+$/, 'Name contains invalid characters')
    .refine((name) => {
      // Additional security validation
      const sanitized = InputSanitizer.sanitizeName(name);
      return sanitized === name.trim() && !containsSuspiciousPatterns(name);
    }, 'Name contains invalid or suspicious characters'),
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .max(254, 'Email address is too long')
    .email('Invalid email address')
    .refine((email) => {
      // Additional security validation
      const sanitized = InputSanitizer.sanitizeEmail(email);
      return sanitized === email.toLowerCase().trim() && !containsSuspiciousPatterns(email);
    }, 'Email contains invalid or suspicious characters'),
  source: z.string()
    .optional()
    .default('newsletter-form')
    .refine((source) => {
      // Validate source is from allowed list
      const allowedSources = ['newsletter-form', 'get-notified', 'subscribe-updates', 'homepage', 'insights'];
      return allowedSources.includes(source || 'newsletter-form');
    }, 'Invalid source'),
  metadata: z.object({
    userAgent: z.string().optional(),
    timestamp: z.string().optional(),
  }).optional(),
  consent: z.object({
    gdprApplies: z.boolean().optional().default(true),
    ccpaApplies: z.boolean().optional().default(true),
    consentMethod: z.enum(['checkbox', 'opt_in', 'implied']).optional().default('opt_in'),
    dataProcessingPurposes: z.array(z.string()).optional().default([
      'newsletter_delivery',
      'content_personalization',
      'service_improvement'
    ])
  }).optional(),
  csrfToken: z.string().optional() // CSRF token for additional security
});

interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribedAt: Timestamp;
  source: string;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    lastUpdated: Timestamp;
  };
  unsubscribeToken?: string;
}

// Enhanced rate limiting configuration with multiple tiers
function createRateLimiter() {
  return rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500, // Limit each IP to 500 requests per interval
  });
}

// Additional rate limiting for suspicious behavior
function createStrictRateLimiter() {
  return rateLimit({
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 100, // Stricter limit for suspicious IPs
  });
}

// Global rate limiter for the entire endpoint
function createGlobalRateLimiter() {
  return rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 1000, // Global limit across all IPs
  });
}

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

// Helper function to hash IP address for privacy
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.IP_HASH_SALT || 'default-salt').digest('hex').substring(0, 16);
}

// Helper function to generate secure unsubscribe token
function generateUnsubscribeToken(email: string): string {
  const timestamp = Date.now().toString();
  const data = `${email}:newsletter_subscription:${timestamp}`;
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET || 'default-unsubscribe-secret';
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
  
  // Combine timestamp and signature for token
  const tokenData = `${timestamp}:${signature}`;
  return Buffer.from(tokenData).toString('base64url');
}

// Helper function to verify unsubscribe token
function verifyUnsubscribeToken(token: string, email: string): boolean {
  try {
    const tokenData = Buffer.from(token, 'base64url').toString();
    const [timestamp, signature] = tokenData.split(':');
    
    if (!timestamp || !signature) return false;
    
    // Check if token is not too old (30 days)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    if (tokenAge > maxAge) return false;
    
    // Verify signature
    const data = `${email}:newsletter_subscription:${timestamp}`;
    const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET || 'default-unsubscribe-secret';
    const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Get client IP address
    const clientIP = getClientIP(request);
    
    // Multi-tier rate limiting
    const limiter = createRateLimiter();
    const strictLimiter = createStrictRateLimiter();
    const globalLimiter = createGlobalRateLimiter();
    
    // Check global rate limit first
    const globalRateLimit = await globalLimiter.check(1000, 'global');
    if (globalRateLimit && !globalRateLimit.success) {
      logSecurityEvent('GLOBAL_RATE_LIMIT_EXCEEDED', {
        ip: clientIP,
        userAgent: request.headers.get('user-agent'),
        endpoint: '/api/newsletter/subscribe'
      });
      
      // Track rate limit error
      const rateLimitError = new Error('Global rate limit exceeded');
      (rateLimitError as any).status = 503;
      trackNewsletterApiError('/api/newsletter/subscribe', rateLimitError, { type: 'global_rate_limit' });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Service temporarily unavailable. Please try again later.',
          error: 'SERVICE_UNAVAILABLE'
        },
        { status: 503 }
      );
    }
    
    // Check per-IP rate limit
    const rateLimitResult = await limiter.check(5, clientIP); // 5 requests per minute per IP
    
    if (rateLimitResult) {
      const { success, limit, reset, remaining } = rateLimitResult;
      
      if (!success) {
        // Apply strict rate limiting for repeated violations
        const strictRateLimit = await strictLimiter.check(1, clientIP);
        if (strictRateLimit && !strictRateLimit.success) {
          logSecurityEvent('STRICT_RATE_LIMIT_EXCEEDED', {
            ip: clientIP,
            userAgent: request.headers.get('user-agent'),
            endpoint: '/api/newsletter/subscribe'
          });
          
          // Track strict rate limit error
          const strictRateLimitError = new Error('Strict rate limit exceeded');
          (strictRateLimitError as any).status = 429;
          trackNewsletterApiError('/api/newsletter/subscribe', strictRateLimitError, { type: 'strict_rate_limit' });
          
          return NextResponse.json(
            { 
              success: false, 
              message: 'Too many requests from your IP. Please try again in 15 minutes.',
              error: 'IP_BLOCKED'
            },
            { 
              status: 429,
              headers: {
                'X-RateLimit-Limit': '1',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': strictRateLimit.reset.toString(),
                'Retry-After': '900', // 15 minutes
              }
            }
          );
        }
        
        logSecurityEvent('RATE_LIMIT_EXCEEDED', {
          ip: clientIP,
          userAgent: request.headers.get('user-agent'),
          endpoint: '/api/newsletter/subscribe'
        });
        
        // Track rate limit error
        const rateLimitError = new Error('Rate limit exceeded');
        (rateLimitError as any).status = 429;
        trackNewsletterApiError('/api/newsletter/subscribe', rateLimitError, { type: 'rate_limit' });
        
        return NextResponse.json(
          { 
            success: false, 
            message: 'Too many requests. Please try again later.',
            error: 'RATE_LIMITED'
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
              'X-Content-Type-Options': 'nosniff',
              'X-Frame-Options': 'DENY',
              'Retry-After': '60', // 1 minute
            }
          }
        );
      }
    } else {
      // Handle case where rate limit check fails (for testing)
      console.warn('Rate limit check returned undefined, skipping rate limiting');
    }

    // Parse request body with size limit
    let body: any;
    try {
      const text = await request.text();
      if (text.length > 10000) { // 10KB limit
        throw new Error('Request body too large');
      }
      body = JSON.parse(text);
    } catch (error) {
      logSecurityEvent('INVALID_REQUEST_BODY', {
        ip: clientIP,
        userAgent: request.headers.get('user-agent'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Track invalid request error
      const invalidRequestError = new Error('Invalid request body');
      (invalidRequestError as any).status = 400;
      trackNewsletterApiError('/api/newsletter/subscribe', invalidRequestError, { type: 'invalid_request' });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request format',
          error: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    // CSRF token verification (optional for now, can be made mandatory)
    if (body.csrfToken) {
      const isValidCSRF = verifyCSRFToken(body.csrfToken, request);
      if (!isValidCSRF) {
        logSecurityEvent('INVALID_CSRF_TOKEN', {
          ip: clientIP,
          userAgent: request.headers.get('user-agent'),
          endpoint: '/api/newsletter/subscribe'
        });
        
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid security token. Please refresh the page and try again.',
            error: 'INVALID_CSRF'
          },
          { status: 403 }
        );
      }
    }

    // Enhanced input validation and sanitization
    const validationResult = subscribeSchema.safeParse(body);
    
    if (!validationResult.success) {
      logSecurityEvent('INVALID_NEWSLETTER_SUBSCRIPTION_DATA', {
        ip: clientIP,
        userAgent: request.headers.get('user-agent'),
        errors: validationResult.error.issues
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid subscription data',
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const { name, email, source, metadata, consent } = validationResult.data;

    // Enhanced input sanitization
    const sanitizedName = InputSanitizer.sanitizeName(name);
    const sanitizedEmail = InputSanitizer.sanitizeEmail(email);

    // Additional security checks
    if (containsSuspiciousPatterns(name) || containsSuspiciousPatterns(email)) {
      logSecurityEvent('SUSPICIOUS_INPUT_DETECTED', {
        ip: clientIP,
        userAgent: request.headers.get('user-agent'),
        suspiciousFields: {
          name: containsSuspiciousPatterns(name),
          email: containsSuspiciousPatterns(email)
        }
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid input detected. Please check your information.',
          error: 'SUSPICIOUS_INPUT'
        },
        { status: 400 }
      );
    }

    // Enhanced name validation
    const nameValidation = validateName(sanitizedName);
    if (!nameValidation.isValid) {
      logSecurityEvent('INVALID_NAME_VALIDATION', {
        ip: clientIP,
        userAgent: request.headers.get('user-agent'),
        reason: nameValidation.reason
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: nameValidation.reason || 'Invalid name',
          error: 'INVALID_NAME'
        },
        { status: 400 }
      );
    }

    // Enhanced email validation with caching
    let emailValidation = NewsletterCacheOperations.getCachedEmailValidation(sanitizedEmail);
    
    if (!emailValidation) {
      emailValidation = await withCachePerformance(
        () => validateEmail(sanitizedEmail),
        'email_validation'
      );
      
      // Cache the validation result
      await NewsletterCacheOperations.cacheEmailValidation(
        sanitizedEmail,
        emailValidation.isValid,
        emailValidation.reason
      );
    }
    
    if (!emailValidation.isValid) {
      logSecurityEvent('INVALID_EMAIL_VALIDATION', {
        ip: clientIP,
        userAgent: request.headers.get('user-agent'),
        reason: emailValidation.reason
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: emailValidation.reason || 'Invalid email address',
          error: 'INVALID_EMAIL',
          suggestions: (emailValidation as any).suggestions
        },
        { status: 400 }
      );
    }

    // Use sanitized and normalized email
    const normalizedEmail = sanitizedEmail;
    
    // Initialize Firestore
    const db = getAdminDb();
    const subscribersCollection = db.collection('newsletter_subscribers');
    
    // Check cache first for existing subscriber
    let existingSubscriberData = NewsletterCacheOperations.getCachedSubscriberStatus(normalizedEmail);
    let existingSubscriberQuery: any = null;
    
    if (!existingSubscriberData) {
      // Query database with optimized query (using index on email field)
      existingSubscriberQuery = await withCachePerformance(
        () => subscribersCollection
          .where('email', '==', normalizedEmail)
          .select('status', 'name', 'source', 'subscribedAt') // Only select needed fields
          .limit(1)
          .get(),
        'subscriber_lookup'
      );
      
      if (!existingSubscriberQuery.empty) {
        const subscriber = existingSubscriberQuery.docs[0].data();
        existingSubscriberData = subscriber.status;
        
        // Cache the subscriber status
        await NewsletterCacheOperations.cacheSubscriberStatus(normalizedEmail, subscriber.status);
        await NewsletterCacheOperations.cacheSubscriberExists(normalizedEmail, true);
      } else {
        await NewsletterCacheOperations.cacheSubscriberExists(normalizedEmail, false);
      }
    }
    
    if (existingSubscriberData || (existingSubscriberQuery && !existingSubscriberQuery.empty)) {
      const existingSubscriber = existingSubscriberQuery ? 
        existingSubscriberQuery.docs[0].data() as NewsletterSubscriber :
        { status: existingSubscriberData };
      
      if (existingSubscriber.status === 'active') {
        // Log the attempt but return success to avoid revealing subscription status
        logSecurityEvent('DUPLICATE_NEWSLETTER_SUBSCRIPTION', {
          email: normalizedEmail,
          ip: clientIP,
          userAgent: request.headers.get('user-agent'),
          existingStatus: existingSubscriber.status
        });
        
        return NextResponse.json({
          success: true,
          message: 'Thank you for your interest! You\'re already subscribed to our newsletter.',
          isExistingSubscriber: true
        });
      } else {
        // Reactivate unsubscribed user with sanitized data
        if (existingSubscriberQuery && !existingSubscriberQuery.empty) {
          await withCachePerformance(
            () => subscribersCollection.doc(existingSubscriberQuery.docs[0].id).update({
              status: 'active',
              name: sanitizedName,
              source: source || 'newsletter-form',
              subscribedAt: Timestamp.now(),
              'metadata.lastUpdated': Timestamp.now(),
              'metadata.userAgent': metadata?.userAgent || request.headers.get('user-agent'),
              'metadata.ipAddress': hashIP(clientIP)
            }),
            'subscriber_reactivation'
          );
          
          // Invalidate cache after update
          NewsletterCacheOperations.invalidateSubscriberCache(normalizedEmail);
          
          logSecurityEvent('NEWSLETTER_RESUBSCRIPTION', {
            email: normalizedEmail,
            previousStatus: existingSubscriber.status,
            ip: clientIP
          });
          
          return NextResponse.json({
            success: true,
            message: 'Welcome back! You\'ve been resubscribed to our newsletter.',
            isResubscription: true
          });
        }
      }
    }

    // Create new subscription record
    const subscriptionId = `sub_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const unsubscribeToken = generateUnsubscribeToken(normalizedEmail);
    
    const newSubscriber: NewsletterSubscriber = {
      id: subscriptionId,
      name: sanitizedName,
      email: normalizedEmail,
      status: 'active',
      subscribedAt: Timestamp.now(),
      source: source || 'newsletter-form',
      metadata: {
        userAgent: metadata?.userAgent || request.headers.get('user-agent') || undefined,
        ipAddress: hashIP(clientIP),
        lastUpdated: Timestamp.now()
      },
      unsubscribeToken
    };

    // Store subscription in Firestore with performance monitoring
    await withCachePerformance(
      () => subscribersCollection.add(newSubscriber),
      'new_subscriber_creation'
    );
    
    // Invalidate relevant cache entries
    NewsletterCacheOperations.invalidateSubscriberCache(normalizedEmail);

    // Record consent for GDPR/CCPA compliance
    try {
      await recordConsent({
        email: normalizedEmail,
        consentType: 'newsletter_subscription',
        consentGiven: true,
        consentMethod: consent?.consentMethod || 'opt_in',
        consentSource: source || 'newsletter-form',
        ipAddress: clientIP,
        userAgent: metadata?.userAgent || request.headers.get('user-agent') || undefined,
        legalBasis: 'consent',
        dataProcessingPurposes: consent?.dataProcessingPurposes || [
          'newsletter_delivery',
          'content_personalization',
          'service_improvement'
        ],
        gdprApplies: consent?.gdprApplies,
        ccpaApplies: consent?.ccpaApplies
      });
    } catch (consentError) {
      console.error('Error recording consent:', consentError);
      // Don't fail the subscription if consent recording fails, but log it
      logSecurityEvent('CONSENT_RECORDING_FAILED', {
        subscriptionId,
        email: normalizedEmail,
        error: consentError instanceof Error ? consentError.message : 'Unknown error'
      });
    }

    // Log successful subscription
    logSecurityEvent('NEWSLETTER_SUBSCRIPTION_SUCCESS', {
      subscriptionId,
      email: normalizedEmail,
      source: source || 'newsletter-form',
      ip: clientIP,
      consentRecorded: true
    });

    // Track successful API performance
    const duration = performance.now() - startTime;
    trackNewsletterPerformance('api_subscription_success', Math.round(duration), 'ms');

    // Generate CSRF token for response
    const { token: responseCSRFToken, headers: securityHeaders } = addCSRFTokenToResponse(request);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      subscriptionId
    }, {
      headers: securityHeaders
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    const clientIP = getClientIP(request);
    
    logSecurityEvent('NEWSLETTER_SUBSCRIPTION_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip: clientIP,
      userAgent: request.headers.get('user-agent')
    });

    // Track API error with performance data
    const duration = performance.now() - startTime;
    trackNewsletterPerformance('api_subscription_error', Math.round(duration), 'ms');
    trackNewsletterApiError('/api/newsletter/subscribe', error as Error, { type: 'internal_error' });

    // Return different error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('Firebase') || error.message.includes('Firestore')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Database service temporarily unavailable. Please try again later.',
            error: 'DATABASE_ERROR'
          },
          { status: 503 }
        );
      }
      
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Request timeout. Please try again.',
            error: 'TIMEOUT_ERROR'
          },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while processing your subscription. Please try again.',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// OPTIONS endpoint for CSRF token generation and preflight requests
export async function OPTIONS(request: NextRequest) {
  try {
    const { token, headers } = addCSRFTokenToResponse(request);
    
    return NextResponse.json(
      { 
        success: true,
        csrfToken: token,
        message: 'CSRF token generated'
      },
      {
        status: 200,
        headers: {
          ...headers,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
          'Access-Control-Max-Age': '86400',
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve subscription status (for admin purposes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const clientIP = getClientIP(request);
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = await validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Initialize Firestore
    const db = getAdminDb();
    const subscribersCollection = db.collection('newsletter_subscribers');
    
    // Query for subscriber
    const subscriberQuery = await subscribersCollection
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();
    
    if (subscriberQuery.empty) {
      return NextResponse.json({
        success: true,
        subscribed: false,
        message: 'Email not found in subscription list'
      });
    }

    const subscriber = subscriberQuery.docs[0].data() as NewsletterSubscriber;
    
    // Log the check for security monitoring
    logSecurityEvent('NEWSLETTER_SUBSCRIPTION_CHECK', {
      email: normalizedEmail,
      status: subscriber.status,
      ip: clientIP
    });

    return NextResponse.json({
      success: true,
      subscribed: subscriber.status === 'active',
      status: subscriber.status,
      subscribedAt: subscriber.subscribedAt.toDate().toISOString(),
      source: subscriber.source
    });

  } catch (error) {
    console.error('Newsletter subscription check error:', error);
    
    const clientIP = getClientIP(request);
    logSecurityEvent('NEWSLETTER_SUBSCRIPTION_CHECK_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: clientIP
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while checking subscription status'
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token'); // For secure unsubscribe links
    const clientIP = getClientIP(request);
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = await validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Initialize Firestore
    const db = getAdminDb();
    const subscribersCollection = db.collection('newsletter_subscribers');
    
    // Query for subscriber
    const subscriberQuery = await subscribersCollection
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();
    
    if (subscriberQuery.empty) {
      return NextResponse.json({
        success: true,
        message: 'Email not found in subscription list'
      });
    }

    const subscriberDoc = subscriberQuery.docs[0];
    const subscriber = subscriberDoc.data() as NewsletterSubscriber;
    
    // Verify unsubscribe token if provided (for secure unsubscribe links)
    if (token && !verifyUnsubscribeToken(token, normalizedEmail)) {
      logSecurityEvent('INVALID_UNSUBSCRIBE_TOKEN', {
        email: normalizedEmail,
        providedToken: token,
        ip: clientIP
      });
      
      return NextResponse.json(
        { success: false, message: 'Invalid or expired unsubscribe token' },
        { status: 403 }
      );
    }

    // Mark as unsubscribed instead of deleting (for audit purposes)
    await subscriberDoc.ref.update({
      status: 'unsubscribed',
      'metadata.lastUpdated': Timestamp.now(),
      'metadata.unsubscribedAt': Timestamp.now(),
      'metadata.unsubscribeIP': hashIP(clientIP)
    });

    // Withdraw consent for GDPR/CCPA compliance
    try {
      await withdrawConsent(
        normalizedEmail,
        'newsletter_subscription',
        token ? 'email_unsubscribe_link' : 'direct_request',
        clientIP,
        request.headers.get('user-agent') || undefined
      );
    } catch (consentError) {
      console.error('Error withdrawing consent:', consentError);
      // Don't fail the unsubscribe if consent withdrawal fails, but log it
      logSecurityEvent('CONSENT_WITHDRAWAL_FAILED', {
        email: normalizedEmail,
        error: consentError instanceof Error ? consentError.message : 'Unknown error'
      });
    }

    logSecurityEvent('NEWSLETTER_UNSUBSCRIBE', {
      email: normalizedEmail,
      previousStatus: subscriber.status,
      method: token ? 'token' : 'direct',
      ip: clientIP,
      userAgent: request.headers.get('user-agent'),
      consentWithdrawn: true
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    
    const clientIP = getClientIP(request);
    logSecurityEvent('NEWSLETTER_UNSUBSCRIBE_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: clientIP
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while processing unsubscribe request'
      },
      { status: 500 }
    );
  }
}