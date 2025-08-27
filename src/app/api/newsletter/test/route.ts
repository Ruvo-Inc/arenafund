/**
 * Newsletter Test API Endpoint
 * 
 * This endpoint allows testing the newsletter email infrastructure
 * by sending test emails to verify everything is working correctly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { testNewsletterEmail, sendWelcomeEmail } from '@/lib/newsletter-email';
import { getActiveSubscribers, getSubscriberStats } from '@/lib/newsletter-db-schema';

// Simple API key authentication for this endpoint
const API_KEY = process.env.NEWSLETTER_API_KEY || 'dev-key-change-in-production';

/**
 * POST /api/newsletter/test
 * Send test emails to verify the newsletter infrastructure
 */
export async function POST(request: NextRequest) {
  try {
    // Check API key authentication
    const authHeader = request.headers.get('authorization');
    const providedKey = authHeader?.replace('Bearer ', '');
    
    if (!providedKey || providedKey !== API_KEY) {
      console.warn('Unauthorized newsletter test attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { testEmail, testType = 'basic' } = body;

    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: 'Test email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log(`Processing newsletter test request: ${testType} to ${testEmail}`);

    let result;
    let message;

    switch (testType) {
      case 'basic':
        result = await testNewsletterEmail(testEmail);
        message = 'Basic test email sent';
        break;

      case 'welcome':
        // Create a mock subscriber for testing
        const mockSubscriber = {
          id: 'test-subscriber-' + Date.now(),
          name: 'Test User',
          email: testEmail,
          status: 'active' as const,
          subscribedAt: new Date() as any,
          source: 'test',
          metadata: {
            lastUpdated: new Date() as any,
          },
          unsubscribeToken: 'test-token-' + Date.now(),
        };
        
        result = await sendWelcomeEmail(mockSubscriber);
        message = 'Welcome email test sent';
        break;

      case 'article':
        const testArticle = {
          articleId: 'test-article-' + Date.now(),
          title: 'Test Article: Newsletter Infrastructure Verification',
          excerpt: 'This is a test article notification to verify that the newsletter email infrastructure is working correctly. The system can successfully send formatted article notifications to subscribers.',
          slug: 'test-newsletter-infrastructure-verification',
          publishDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          category: 'System Test',
          author: 'Arena Fund Team',
          readTimeMinutes: 3,
        };
        
        result = await testNewsletterEmail(testEmail, testArticle);
        message = 'Article notification test sent';
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid test type. Use: basic, welcome, or article' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message,
        testType,
        testEmail,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: `Test email failed: ${result.error}`,
          testType,
          testEmail,
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Newsletter test endpoint error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred while sending test email' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/newsletter/test
 * Get newsletter system status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check API key authentication
    const authHeader = request.headers.get('authorization');
    const providedKey = authHeader?.replace('Bearer ', '');
    
    if (!providedKey || providedKey !== API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get subscriber statistics
    const subscriberStats = await getSubscriberStats();
    
    // Get a few active subscribers (without exposing email addresses)
    const activeSubscribers = await getActiveSubscribers(5);
    const subscriberSample = activeSubscribers.map(sub => ({
      id: sub.id,
      source: sub.source,
      subscribedAt: sub.subscribedAt,
      status: sub.status,
    }));

    return NextResponse.json({
      success: true,
      system: {
        status: 'operational',
        emailService: 'Gmail API',
        timestamp: new Date().toISOString(),
      },
      subscribers: subscriberStats,
      sampleSubscribers: subscriberSample,
      testEndpoint: {
        url: '/api/newsletter/test',
        method: 'POST',
        testTypes: ['basic', 'welcome', 'article'],
        example: {
          testEmail: 'test@example.com',
          testType: 'basic',
        },
      },
    });

  } catch (error) {
    console.error('Newsletter test status endpoint error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get newsletter system status',
        system: {
          status: 'error',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}