/**
 * Newsletter Article Notification API Endpoint
 * 
 * This endpoint allows triggering article notifications to all active subscribers.
 * It's designed to be called when new articles are published.
 * 
 * Requirements covered:
 * - 4.1: Send email notifications to all active subscribers when new articles are published
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendArticleNotification, testNewsletterEmail, type ArticleNotification } from '@/lib/newsletter-email';

// Simple API key authentication for this endpoint
const API_KEY = process.env.NEWSLETTER_API_KEY || 'dev-key-change-in-production';

/**
 * POST /api/newsletter/send-article
 * Send article notification to all active subscribers
 */
export async function POST(request: NextRequest) {
  try {
    // Check API key authentication
    const authHeader = request.headers.get('authorization');
    const providedKey = authHeader?.replace('Bearer ', '');
    
    if (!providedKey || providedKey !== API_KEY) {
      console.warn('Unauthorized newsletter article send attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { article, testMode = false, testEmail } = body;

    // Validate article data
    if (!article || typeof article !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Article data is required' },
        { status: 400 }
      );
    }

    const requiredFields = ['articleId', 'title', 'excerpt', 'slug', 'publishDate', 'category'];
    const missingFields = requiredFields.filter(field => !article[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required article fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    const articleNotification: ArticleNotification = {
      articleId: article.articleId,
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      publishDate: article.publishDate,
      category: article.category,
      author: article.author,
      readTimeMinutes: article.readTimeMinutes,
    };

    console.log(`Processing article notification request: ${articleNotification.title} (test mode: ${testMode})`);

    // Handle test mode
    if (testMode) {
      if (!testEmail) {
        return NextResponse.json(
          { success: false, error: 'Test email is required in test mode' },
          { status: 400 }
        );
      }

      const testResult = await testNewsletterEmail(testEmail, articleNotification);
      
      if (testResult.success) {
        return NextResponse.json({
          success: true,
          message: 'Test email sent successfully',
          messageId: testResult.messageId,
          testMode: true,
        });
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: `Test email failed: ${testResult.error}`,
            testMode: true,
          },
          { status: 500 }
        );
      }
    }

    // Send to all active subscribers
    const result = await sendArticleNotification(articleNotification);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Article notification sent successfully',
        stats: {
          totalSubscribers: result.totalSubscribers,
          successCount: result.successCount,
          failureCount: result.failureCount,
        },
        errors: result.errors.length > 0 ? result.errors : undefined,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send article notification',
          stats: {
            totalSubscribers: result.totalSubscribers,
            successCount: result.successCount,
            failureCount: result.failureCount,
          },
          errors: result.errors,
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Newsletter article send endpoint error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred while sending article notification' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/newsletter/send-article
 * Get information about this endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/newsletter/send-article',
    method: 'POST',
    description: 'Send article notifications to all active newsletter subscribers',
    authentication: 'Bearer token required',
    parameters: {
      article: {
        required: true,
        type: 'object',
        fields: {
          articleId: 'string (required)',
          title: 'string (required)',
          excerpt: 'string (required)',
          slug: 'string (required)',
          publishDate: 'string (required)',
          category: 'string (required)',
          author: 'string (optional)',
          readTimeMinutes: 'number (optional)',
        },
      },
      testMode: {
        required: false,
        type: 'boolean',
        description: 'If true, sends test email instead of to all subscribers',
      },
      testEmail: {
        required: 'when testMode is true',
        type: 'string',
        description: 'Email address to send test email to',
      },
    },
    example: {
      article: {
        articleId: 'article-123',
        title: 'New Investment Insights',
        excerpt: 'Discover the latest trends in venture capital...',
        slug: 'new-investment-insights',
        publishDate: '2024-01-15',
        category: 'Investment Strategy',
        author: 'Arena Fund Team',
        readTimeMinutes: 5,
      },
      testMode: false,
    },
  });
}