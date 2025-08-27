/**
 * Newsletter Email Infrastructure
 * 
 * This module provides email sending capabilities for newsletter notifications,
 * using the existing Gmail infrastructure for reliable email delivery.
 * 
 * Requirements covered:
 * - 4.1: Send email notifications to all active subscribers when new articles are published
 * - 4.2: Include article title, excerpt, and link to full article
 * - 4.3: Include an unsubscribe link in each email
 * - 4.4: Update subscriber status to "unsubscribed" when user clicks unsubscribe
 */

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { getActiveSubscribers, updateSubscriberStatus, type NewsletterSubscriber } from './newsletter-db-schema';

const {
  GMAIL_CLIENT_EMAIL,
  GMAIL_PRIVATE_KEY,
  GMAIL_IMPERSONATED_USER,
  GMAIL_FROM_ADDRESS,
  NEXT_PUBLIC_BASE_URL,
} = process.env as Record<string, string | undefined>;

// Newsletter email configuration
export const NEWSLETTER_CONFIG = {
  FROM_NAME: 'Arena Fund Insights',
  FROM_EMAIL: GMAIL_FROM_ADDRESS || GMAIL_IMPERSONATED_USER || '',
  REPLY_TO: GMAIL_FROM_ADDRESS || GMAIL_IMPERSONATED_USER || '',
  BATCH_SIZE: 50, // Send emails in batches to avoid Gmail rate limits
  RETRY_ATTEMPTS: 3,
  BASE_URL: NEXT_PUBLIC_BASE_URL || 'https://arenafund.com',
} as const;

// Article notification data structure
export interface ArticleNotification {
  articleId: string;
  title: string;
  excerpt: string;
  slug: string;
  publishDate: string;
  category: string;
  author?: string;
  readTimeMinutes?: number;
}

// Email template data structure
export interface NewsletterEmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  unsubscribeUrl: string;
}

/**
 * Get JWT client for Gmail API authentication
 */
function getJwtClient(): JWT {
  if (!GMAIL_CLIENT_EMAIL || !GMAIL_PRIVATE_KEY || !GMAIL_IMPERSONATED_USER) {
    throw new Error('Missing Gmail service account environment variables for newsletter emails');
  }

  // Private key may include literal \n when coming from Secret Manager. Normalize.
  const privateKey = GMAIL_PRIVATE_KEY.replace(/\\n/g, '\n');

  return new JWT({
    email: GMAIL_CLIENT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: GMAIL_IMPERSONATED_USER,
  });
}

/**
 * Retry helper with exponential backoff for Gmail API calls
 */
async function sendWithRetry<T>(
  fn: () => Promise<T>,
  meta: Record<string, unknown>,
  maxRetries = 5,
  baseDelayMs = 400
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const e = err as {
        code?: number;
        message?: string;
        response?: { status?: number; data?: unknown };
        errors?: Array<{ reason?: string }>;
      } | undefined;
      const status: number | undefined = e?.code ?? e?.response?.status;
      let reasons: string[] = Array.isArray(e?.errors)
        ? e!.errors!.map((x) => x?.reason).filter(Boolean) as string[]
        : [];

      if (reasons.length === 0 && e?.response?.data && typeof e.response.data === 'object') {
        const data = e.response.data as { error?: { errors?: Array<{ reason?: string }> } };
        if (Array.isArray(data?.error?.errors)) {
          reasons = data.error.errors.map((x) => x?.reason).filter(Boolean) as string[];
        }
      }

      const retryable =
        status === 429 ||
        (typeof status === 'number' && status >= 500 && status < 600) ||
        reasons.includes('rateLimitExceeded') ||
        reasons.includes('backendError');

      if (!retryable || attempt >= maxRetries) {
        console.error(
          JSON.stringify({
            level: 'error',
            msg: 'Newsletter Gmail send failed',
            attempt,
            maxRetries,
            status,
            reasons,
            error_message: e?.message,
            ...meta,
          })
        );
        throw err;
      }

      // Full jitter backoff
      const delay = Math.min(30000, Math.random() * baseDelayMs * Math.pow(2, attempt));
      console.warn(
        JSON.stringify({
          level: 'warn',
          msg: 'Retrying newsletter Gmail send',
          attempt,
          next_delay_ms: Math.round(delay),
          status,
          reasons,
          ...meta,
        })
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

/**
 * Build raw email message for Gmail API
 */
function buildRawMessage(opts: { 
  from: string; 
  to: string[]; 
  subject: string; 
  text: string; 
  html?: string;
  replyTo?: string;
}): string {
  const boundary = '__newsletter_boundary__';
  const headers = [
    `From: ${opts.from}`,
    `To: ${opts.to.join(', ')}`,
    `Subject: ${opts.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];

  if (opts.replyTo) {
    headers.push(`Reply-To: ${opts.replyTo}`);
  }

  const headerString = headers.join('\r\n');

  const textPart = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    opts.text,
  ].join('\r\n');

  const htmlPart = opts.html
    ? [
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        '',
        opts.html,
      ].join('\r\n')
    : '';

  const footer = `\r\n--${boundary}--`;

  const message = `${headerString}\r\n\r\n${textPart}${htmlPart ? '\r\n' + htmlPart : ''}${footer}`;
  return Buffer.from(message).toString('base64url');
}

/**
 * Generate unsubscribe URL for a subscriber
 */
export function generateUnsubscribeUrl(subscriber: NewsletterSubscriber): string {
  const baseUrl = NEWSLETTER_CONFIG.BASE_URL;
  const token = subscriber.unsubscribeToken;
  const email = encodeURIComponent(subscriber.email);
  
  return `${baseUrl}/api/newsletter/unsubscribe?token=${token}&email=${email}`;
}

/**
 * Create email template for article notification
 */
export function createArticleEmailTemplate(
  article: ArticleNotification,
  subscriber: NewsletterSubscriber
): NewsletterEmailTemplate {
  const unsubscribeUrl = generateUnsubscribeUrl(subscriber);
  const articleUrl = `${NEWSLETTER_CONFIG.BASE_URL}/insights/${article.slug}`;
  const subscriberName = subscriber.name || 'there';

  // Email subject
  const subject = `New Insight: ${article.title}`;

  // HTML email content
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #2c5530; color: #ffffff; padding: 30px 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px; }
    .article-title { font-size: 22px; font-weight: 600; color: #2c5530; margin: 0 0 16px 0; line-height: 1.3; }
    .article-meta { color: #666; font-size: 14px; margin-bottom: 20px; }
    .article-excerpt { font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 30px; }
    .cta-button { display: inline-block; background-color: #2c5530; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; margin-bottom: 30px; }
    .cta-button:hover { background-color: #1e3a21; }
    .footer { background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef; font-size: 14px; color: #666; }
    .unsubscribe { margin-top: 20px; font-size: 12px; color: #999; }
    .unsubscribe a { color: #666; text-decoration: underline; }
    @media (max-width: 600px) {
      .container { width: 100% !important; }
      .header, .content, .footer { padding: 20px !important; }
      .article-title { font-size: 20px; }
      .cta-button { display: block; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Arena Fund Insights</h1>
    </div>
    
    <div class="content">
      <h2 class="article-title">${article.title}</h2>
      
      <div class="article-meta">
        ${article.category} • ${article.publishDate}${article.readTimeMinutes ? ` • ${article.readTimeMinutes} min read` : ''}
      </div>
      
      <div class="article-excerpt">
        ${article.excerpt}
      </div>
      
      <a href="${articleUrl}" class="cta-button">Read Full Article</a>
      
      <p>Hi ${subscriberName},</p>
      <p>We've published a new insight that we think you'll find valuable. Click the button above to read the full article on our website.</p>
      <p>Best regards,<br>The Arena Fund Team</p>
    </div>
    
    <div class="footer">
      <p>You're receiving this email because you subscribed to Arena Fund insights.</p>
      <div class="unsubscribe">
        <a href="${unsubscribeUrl}">Unsubscribe</a> from these notifications
      </div>
    </div>
  </div>
</body>
</html>`.trim();

  // Plain text email content
  const textContent = `
Arena Fund Insights

New Insight: ${article.title}

${article.category} • ${article.publishDate}${article.readTimeMinutes ? ` • ${article.readTimeMinutes} min read` : ''}

${article.excerpt}

Read the full article: ${articleUrl}

Hi ${subscriberName},

We've published a new insight that we think you'll find valuable. Visit the link above to read the full article on our website.

Best regards,
The Arena Fund Team

---

You're receiving this email because you subscribed to Arena Fund insights.
To unsubscribe from these notifications, visit: ${unsubscribeUrl}
`.trim();

  return {
    subject,
    htmlContent,
    textContent,
    unsubscribeUrl,
  };
}

/**
 * Send newsletter email to a single subscriber using Gmail API
 */
export async function sendNewsletterEmail(
  subscriber: NewsletterSubscriber,
  template: NewsletterEmailTemplate
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const jwt = getJwtClient();
    const gmail = google.gmail({ version: 'v1', auth: jwt });

    const fromAddress = `${NEWSLETTER_CONFIG.FROM_NAME} <${NEWSLETTER_CONFIG.FROM_EMAIL}>`;
    
    const raw = buildRawMessage({
      from: fromAddress,
      to: [subscriber.email],
      subject: template.subject,
      text: template.textContent,
      html: template.htmlContent,
      replyTo: NEWSLETTER_CONFIG.REPLY_TO,
    });

    const res = await sendWithRetry(
      () =>
        gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw },
        }),
      { 
        context: 'newsletter_email', 
        to: subscriber.email, 
        subject: template.subject,
        subscriberId: subscriber.id,
      }
    );

    const messageId = res.data.id || null;
    const threadId = res.data.threadId || null;

    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'Newsletter email sent via Gmail API',
        gmail_message_id: messageId,
        gmail_thread_id: threadId,
        to: subscriber.email,
        subject: template.subject,
        subscriber_id: subscriber.id,
      })
    );

    return { success: true, messageId: messageId || undefined };
  } catch (error) {
    console.error(`Failed to send newsletter email to ${subscriber.email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send article notification to all active subscribers
 */
export async function sendArticleNotification(
  article: ArticleNotification
): Promise<{
  success: boolean;
  totalSubscribers: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}> {
  try {
    console.log(`Starting article notification for: ${article.title}`);
    
    // Get all active subscribers
    const subscribers = await getActiveSubscribers();
    console.log(`Found ${subscribers.length} active subscribers`);
    
    if (subscribers.length === 0) {
      return {
        success: true,
        totalSubscribers: 0,
        successCount: 0,
        failureCount: 0,
        errors: [],
      };
    }

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Process subscribers in batches to avoid overwhelming the email system
    const batchSize = NEWSLETTER_CONFIG.BATCH_SIZE;
    const batches = [];
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize));
    }

    console.log(`Processing ${batches.length} batches of up to ${batchSize} subscribers each`);

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} subscribers)`);

      // Send emails for this batch in parallel
      const batchPromises = batch.map(async (subscriber) => {
        try {
          const template = createArticleEmailTemplate(article, subscriber);
          const result = await sendNewsletterEmail(subscriber, template);
          
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
            errors.push(`${subscriber.email}: ${result.error}`);
          }
        } catch (error) {
          failureCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${subscriber.email}: ${errorMessage}`);
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);

      // Add delay between batches to respect rate limits
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    console.log(`Article notification complete: ${successCount} success, ${failureCount} failures`);

    return {
      success: failureCount === 0,
      totalSubscribers: subscribers.length,
      successCount,
      failureCount,
      errors,
    };
  } catch (error) {
    console.error('Failed to send article notification:', error);
    return {
      success: false,
      totalSubscribers: 0,
      successCount: 0,
      failureCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Handle unsubscribe request
 */
export async function handleUnsubscribe(
  email: string,
  token: string,
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get subscriber to verify token
    const subscribers = await getActiveSubscribers();
    const subscriber = subscribers.find(s => 
      s.email.toLowerCase() === email.toLowerCase() && 
      s.unsubscribeToken === token
    );

    if (!subscriber) {
      return {
        success: false,
        error: 'Invalid unsubscribe link or subscriber not found',
      };
    }

    // Update subscriber status to unsubscribed
    const result = await updateSubscriberStatus(email, 'unsubscribed', {
      unsubscribedAt: new Date() as any,
      unsubscribeIP: ipAddress,
    });

    if (result.success) {
      console.log(`Subscriber unsubscribed: ${email}`);
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to update subscriber status',
      };
    }
  } catch (error) {
    console.error('Failed to handle unsubscribe:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send welcome email to new subscriber using Gmail API
 */
export async function sendWelcomeEmail(
  subscriber: NewsletterSubscriber
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const unsubscribeUrl = generateUnsubscribeUrl(subscriber);
    const { generateWelcomeTemplate } = await import('./newsletter-templates');
    const template = generateWelcomeTemplate(subscriber, unsubscribeUrl);
    
    const jwt = getJwtClient();
    const gmail = google.gmail({ version: 'v1', auth: jwt });

    const fromAddress = `${NEWSLETTER_CONFIG.FROM_NAME} <${NEWSLETTER_CONFIG.FROM_EMAIL}>`;
    
    const raw = buildRawMessage({
      from: fromAddress,
      to: [subscriber.email],
      subject: template.subject,
      text: template.text,
      html: template.html,
      replyTo: NEWSLETTER_CONFIG.REPLY_TO,
    });

    const res = await sendWithRetry(
      () =>
        gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw },
        }),
      { 
        context: 'welcome_email', 
        to: subscriber.email, 
        subject: template.subject,
        subscriberId: subscriber.id,
      }
    );

    const messageId = res.data.id || null;

    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'Welcome email sent via Gmail API',
        gmail_message_id: messageId,
        to: subscriber.email,
        subscriber_id: subscriber.id,
      })
    );

    return { success: true, messageId: messageId || undefined };
  } catch (error) {
    console.error(`Failed to send welcome email to ${subscriber.email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send unsubscribe confirmation email using Gmail API
 */
export async function sendUnsubscribeConfirmationEmail(
  subscriber: NewsletterSubscriber
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const { generateUnsubscribeConfirmationTemplate } = await import('./newsletter-templates');
    const template = generateUnsubscribeConfirmationTemplate(subscriber);
    
    const jwt = getJwtClient();
    const gmail = google.gmail({ version: 'v1', auth: jwt });

    const fromAddress = `${NEWSLETTER_CONFIG.FROM_NAME} <${NEWSLETTER_CONFIG.FROM_EMAIL}>`;
    
    const raw = buildRawMessage({
      from: fromAddress,
      to: [subscriber.email],
      subject: template.subject,
      text: template.text,
      html: template.html,
      replyTo: NEWSLETTER_CONFIG.REPLY_TO,
    });

    const res = await sendWithRetry(
      () =>
        gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw },
        }),
      { 
        context: 'unsubscribe_confirmation_email', 
        to: subscriber.email, 
        subject: template.subject,
        subscriberId: subscriber.id,
      }
    );

    const messageId = res.data.id || null;

    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'Unsubscribe confirmation email sent via Gmail API',
        gmail_message_id: messageId,
        to: subscriber.email,
        subscriber_id: subscriber.id,
      })
    );

    return { success: true, messageId: messageId || undefined };
  } catch (error) {
    console.error(`Failed to send unsubscribe confirmation email to ${subscriber.email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test email sending functionality using Gmail API
 */
export async function testNewsletterEmail(
  testEmail: string,
  testArticle?: Partial<ArticleNotification>
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const { generateTestTemplate } = await import('./newsletter-templates');
    const template = generateTestTemplate(
      testEmail, 
      testArticle?.excerpt || 'This is a test email to verify that the Gmail newsletter email infrastructure is working correctly.'
    );
    
    const jwt = getJwtClient();
    const gmail = google.gmail({ version: 'v1', auth: jwt });

    const fromAddress = `${NEWSLETTER_CONFIG.FROM_NAME} <${NEWSLETTER_CONFIG.FROM_EMAIL}>`;
    
    const raw = buildRawMessage({
      from: fromAddress,
      to: [testEmail],
      subject: template.subject,
      text: template.text,
      html: template.html,
      replyTo: NEWSLETTER_CONFIG.REPLY_TO,
    });

    const res = await sendWithRetry(
      () =>
        gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw },
        }),
      { 
        context: 'test_newsletter_email', 
        to: testEmail, 
        subject: template.subject,
      }
    );

    const messageId = res.data.id || null;

    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'Test newsletter email sent via Gmail API',
        gmail_message_id: messageId,
        to: testEmail,
      })
    );

    return { success: true, messageId: messageId || undefined };
  } catch (error) {
    console.error('Failed to send test newsletter email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get newsletter email sending statistics from logs
 * Note: This is a simplified version since Gmail API doesn't provide detailed stats
 */
export async function getNewsletterEmailStats(): Promise<{
  message: string;
  suggestion: string;
}> {
  return {
    message: 'Newsletter email statistics are available in Gmail API logs and Google Cloud Console.',
    suggestion: 'Check the application logs for detailed email sending information including message IDs and delivery status.',
  };
}