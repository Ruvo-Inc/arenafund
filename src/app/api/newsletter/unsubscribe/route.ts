/**
 * Newsletter Unsubscribe API Endpoint
 * 
 * This endpoint handles unsubscribe requests from newsletter emails.
 * It validates the unsubscribe token and updates the subscriber status.
 * 
 * Requirements covered:
 * - 4.3: Include an unsubscribe link in each email
 * - 4.4: Update subscriber status to "unsubscribed" when user clicks unsubscribe
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleUnsubscribe, sendUnsubscribeConfirmationEmail } from '@/lib/newsletter-email';
import { getSubscriberByToken, updateSubscriberStatus } from '@/lib/newsletter-db-schema';

// Rate limiting for unsubscribe requests
const unsubscribeAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = unsubscribeAttempts.get(ip);
  
  if (!attempts) {
    unsubscribeAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
    unsubscribeAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Check if under limit
  if (attempts.count < MAX_ATTEMPTS) {
    attempts.count++;
    attempts.lastAttempt = now;
    return true;
  }
  
  return false;
}

/**
 * GET /api/newsletter/unsubscribe
 * Handle unsubscribe requests from email links
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    // Get client IP for rate limiting and logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for unsubscribe request from IP: ${clientIP}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.' 
        },
        { status: 429 }
      );
    }
    
    // Validate required parameters
    if (!token || !email) {
      console.warn(`Invalid unsubscribe request - missing token or email from IP: ${clientIP}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid unsubscribe link. Missing required parameters.' 
        },
        { status: 400 }
      );
    }
    
    // Validate token format (should be 64 character hex string)
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      console.warn(`Invalid unsubscribe token format from IP: ${clientIP}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid unsubscribe link format.' 
        },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn(`Invalid email format in unsubscribe request from IP: ${clientIP}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format.' 
        },
        { status: 400 }
      );
    }
    
    console.log(`Processing unsubscribe request for email: ${email} from IP: ${clientIP}`);
    
    // Get subscriber by token to verify it exists and matches the email
    const subscriber = await getSubscriberByToken(token);
    
    if (!subscriber) {
      console.warn(`Unsubscribe token not found: ${token} from IP: ${clientIP}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid unsubscribe link. The link may have expired or is incorrect.' 
        },
        { status: 404 }
      );
    }
    
    // Verify the email matches the subscriber
    if (subscriber.email.toLowerCase() !== email.toLowerCase()) {
      console.warn(`Email mismatch in unsubscribe request. Token email: ${subscriber.email}, Request email: ${email} from IP: ${clientIP}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid unsubscribe link. Email does not match the subscription.' 
        },
        { status: 400 }
      );
    }
    
    // Check if already unsubscribed
    if (subscriber.status === 'unsubscribed') {
      console.log(`Subscriber already unsubscribed: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'You have already been unsubscribed from our newsletter.',
        alreadyUnsubscribed: true,
      });
    }
    
    // Update subscriber status to unsubscribed
    const result = await updateSubscriberStatus(email, 'unsubscribed', {
      unsubscribedAt: new Date() as any,
      unsubscribeIP: clientIP,
    });
    
    if (!result.success) {
      console.error(`Failed to update subscriber status for ${email}:`, result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to process unsubscribe request. Please try again.' 
        },
        { status: 500 }
      );
    }
    
    // Send confirmation email using Gmail API
    try {
      const emailResult = await sendUnsubscribeConfirmationEmail(subscriber);
      
      if (emailResult.success) {
        console.log(`Unsubscribe confirmation email sent for ${email}, message ID: ${emailResult.messageId}`);
      } else {
        console.error(`Failed to send unsubscribe confirmation email for ${email}:`, emailResult.error);
      }
    } catch (emailError) {
      // Don't fail the unsubscribe if email sending fails
      console.error(`Failed to send unsubscribe confirmation email to ${email}:`, emailError);
    }
    
    console.log(`Successfully unsubscribed: ${email} from IP: ${clientIP}`);
    
    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter. A confirmation email has been sent to you.',
    });
    
  } catch (error) {
    console.error('Unsubscribe endpoint error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/newsletter/unsubscribe
 * Handle unsubscribe requests from forms (alternative method)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email } = body;
    
    // Get client IP for rate limiting and logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.' 
        },
        { status: 429 }
      );
    }
    
    // Use the same logic as GET request
    const result = await handleUnsubscribe(email, token, clientIP);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'You have been successfully unsubscribed from our newsletter.',
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to process unsubscribe request.' 
        },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Unsubscribe POST endpoint error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.' 
      },
      { status: 500 }
    );
  }
}