/**
 * Newsletter Email Templates
 * 
 * This module provides email template generation for different types of newsletter
 * communications, including article notifications, welcome emails, and system messages.
 * 
 * Requirements covered:
 * - 4.2: Include article title, excerpt, and link to full article
 * - 4.3: Include an unsubscribe link in each email
 */

import type { NewsletterSubscriber } from './newsletter-db-schema';
import type { ArticleNotification } from './newsletter-email';

// Base template configuration
export const TEMPLATE_CONFIG = {
  BRAND_NAME: 'Arena Fund',
  BRAND_COLOR: '#2c5530',
  BRAND_COLOR_HOVER: '#1e3a21',
  BACKGROUND_COLOR: '#f8f9fa',
  TEXT_COLOR: '#333333',
  SECONDARY_TEXT_COLOR: '#666666',
  BORDER_COLOR: '#e9ecef',
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://arenafund.com',
} as const;

// Common email styles
const EMAIL_STYLES = `
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
    line-height: 1.6; 
    color: ${TEMPLATE_CONFIG.TEXT_COLOR}; 
    margin: 0; 
    padding: 0; 
    background-color: ${TEMPLATE_CONFIG.BACKGROUND_COLOR}; 
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    background-color: #ffffff; 
  }
  .header { 
    background-color: ${TEMPLATE_CONFIG.BRAND_COLOR}; 
    color: #ffffff; 
    padding: 30px 40px; 
    text-align: center; 
  }
  .header h1 { 
    margin: 0; 
    font-size: 24px; 
    font-weight: 600; 
  }
  .content { 
    padding: 40px; 
  }
  .footer { 
    background-color: ${TEMPLATE_CONFIG.BACKGROUND_COLOR}; 
    padding: 30px 40px; 
    border-top: 1px solid ${TEMPLATE_CONFIG.BORDER_COLOR}; 
    font-size: 14px; 
    color: ${TEMPLATE_CONFIG.SECONDARY_TEXT_COLOR}; 
  }
  .unsubscribe { 
    margin-top: 20px; 
    font-size: 12px; 
    color: #999; 
  }
  .unsubscribe a { 
    color: ${TEMPLATE_CONFIG.SECONDARY_TEXT_COLOR}; 
    text-decoration: underline; 
  }
  .cta-button { 
    display: inline-block; 
    background-color: ${TEMPLATE_CONFIG.BRAND_COLOR}; 
    color: #ffffff; 
    text-decoration: none; 
    padding: 14px 28px; 
    border-radius: 6px; 
    font-weight: 600; 
    font-size: 16px; 
    margin-bottom: 30px; 
  }
  .cta-button:hover { 
    background-color: ${TEMPLATE_CONFIG.BRAND_COLOR_HOVER}; 
  }
  @media (max-width: 600px) {
    .container { width: 100% !important; }
    .header, .content, .footer { padding: 20px !important; }
    .cta-button { display: block; text-align: center; }
  }
`;

/**
 * Generate base HTML template structure
 */
function createBaseTemplate(title: string, content: string, unsubscribeUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${TEMPLATE_CONFIG.BRAND_NAME} Insights</h1>
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="footer">
      <p>You're receiving this email because you subscribed to ${TEMPLATE_CONFIG.BRAND_NAME} insights.</p>
      <div class="unsubscribe">
        <a href="${unsubscribeUrl}">Unsubscribe</a> from these notifications
      </div>
    </div>
  </div>
</body>
</html>`.trim();
}

/**
 * Generate article notification email template
 */
export function generateArticleTemplate(
  article: ArticleNotification,
  subscriber: NewsletterSubscriber,
  unsubscribeUrl: string
): { html: string; text: string; subject: string } {
  const articleUrl = `${TEMPLATE_CONFIG.BASE_URL}/insights/${article.slug}`;
  const subscriberName = subscriber.name || 'there';
  const subject = `New Insight: ${article.title}`;

  // HTML content
  const htmlContent = `
    <h2 style="font-size: 22px; font-weight: 600; color: ${TEMPLATE_CONFIG.BRAND_COLOR}; margin: 0 0 16px 0; line-height: 1.3;">
      ${article.title}
    </h2>
    
    <div style="color: ${TEMPLATE_CONFIG.SECONDARY_TEXT_COLOR}; font-size: 14px; margin-bottom: 20px;">
      ${article.category} • ${article.publishDate}${article.readTimeMinutes ? ` • ${article.readTimeMinutes} min read` : ''}
    </div>
    
    <div style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 30px;">
      ${article.excerpt}
    </div>
    
    <a href="${articleUrl}" class="cta-button">Read Full Article</a>
    
    <p>Hi ${subscriberName},</p>
    <p>We've published a new insight that we think you'll find valuable. Click the button above to read the full article on our website.</p>
    <p>Best regards,<br>The ${TEMPLATE_CONFIG.BRAND_NAME} Team</p>
  `;

  const html = createBaseTemplate(subject, htmlContent, unsubscribeUrl);

  // Plain text content
  const text = `
${TEMPLATE_CONFIG.BRAND_NAME} Insights

New Insight: ${article.title}

${article.category} • ${article.publishDate}${article.readTimeMinutes ? ` • ${article.readTimeMinutes} min read` : ''}

${article.excerpt}

Read the full article: ${articleUrl}

Hi ${subscriberName},

We've published a new insight that we think you'll find valuable. Visit the link above to read the full article on our website.

Best regards,
The ${TEMPLATE_CONFIG.BRAND_NAME} Team

---

You're receiving this email because you subscribed to ${TEMPLATE_CONFIG.BRAND_NAME} insights.
To unsubscribe from these notifications, visit: ${unsubscribeUrl}
`.trim();

  return { html, text, subject };
}

/**
 * Generate welcome email template for new subscribers
 */
export function generateWelcomeTemplate(
  subscriber: NewsletterSubscriber,
  unsubscribeUrl: string
): { html: string; text: string; subject: string } {
  const subscriberName = subscriber.name || 'there';
  const subject = `Welcome to ${TEMPLATE_CONFIG.BRAND_NAME} Insights!`;
  const insightsUrl = `${TEMPLATE_CONFIG.BASE_URL}/insights`;

  // HTML content
  const htmlContent = `
    <h2 style="font-size: 22px; font-weight: 600; color: ${TEMPLATE_CONFIG.BRAND_COLOR}; margin: 0 0 20px 0; line-height: 1.3;">
      Welcome to ${TEMPLATE_CONFIG.BRAND_NAME} Insights!
    </h2>
    
    <p>Hi ${subscriberName},</p>
    
    <p>Thank you for subscribing to ${TEMPLATE_CONFIG.BRAND_NAME} insights! We're excited to share our latest thinking on venture capital, startup growth, and market opportunities with you.</p>
    
    <p>You'll receive notifications whenever we publish new articles, including:</p>
    <ul style="margin: 20px 0; padding-left: 20px;">
      <li>Market analysis and investment trends</li>
      <li>Startup growth strategies and best practices</li>
      <li>Portfolio company spotlights and success stories</li>
      <li>Industry insights and thought leadership</li>
    </ul>
    
    <a href="${insightsUrl}" class="cta-button">Browse Our Latest Insights</a>
    
    <p>We're committed to providing valuable, actionable insights that help entrepreneurs and investors make better decisions.</p>
    
    <p>Welcome aboard!</p>
    <p>The ${TEMPLATE_CONFIG.BRAND_NAME} Team</p>
  `;

  const html = createBaseTemplate(subject, htmlContent, unsubscribeUrl);

  // Plain text content
  const text = `
${TEMPLATE_CONFIG.BRAND_NAME} Insights

Welcome to ${TEMPLATE_CONFIG.BRAND_NAME} Insights!

Hi ${subscriberName},

Thank you for subscribing to ${TEMPLATE_CONFIG.BRAND_NAME} insights! We're excited to share our latest thinking on venture capital, startup growth, and market opportunities with you.

You'll receive notifications whenever we publish new articles, including:
• Market analysis and investment trends
• Startup growth strategies and best practices
• Portfolio company spotlights and success stories
• Industry insights and thought leadership

Browse our latest insights: ${insightsUrl}

We're committed to providing valuable, actionable insights that help entrepreneurs and investors make better decisions.

Welcome aboard!
The ${TEMPLATE_CONFIG.BRAND_NAME} Team

---

You're receiving this email because you subscribed to ${TEMPLATE_CONFIG.BRAND_NAME} insights.
To unsubscribe from these notifications, visit: ${unsubscribeUrl}
`.trim();

  return { html, text, subject };
}

/**
 * Generate unsubscribe confirmation template
 */
export function generateUnsubscribeConfirmationTemplate(
  subscriber: NewsletterSubscriber
): { html: string; text: string; subject: string } {
  const subscriberName = subscriber.name || 'there';
  const subject = `You've been unsubscribed from ${TEMPLATE_CONFIG.BRAND_NAME} Insights`;
  const resubscribeUrl = `${TEMPLATE_CONFIG.BASE_URL}/insights`;

  // HTML content (no unsubscribe link needed for this template)
  const htmlContent = `
    <h2 style="font-size: 22px; font-weight: 600; color: ${TEMPLATE_CONFIG.BRAND_COLOR}; margin: 0 0 20px 0; line-height: 1.3;">
      You've been unsubscribed
    </h2>
    
    <p>Hi ${subscriberName},</p>
    
    <p>We've successfully unsubscribed you from ${TEMPLATE_CONFIG.BRAND_NAME} insights notifications. You will no longer receive email updates when we publish new articles.</p>
    
    <p>We're sorry to see you go! If you change your mind, you can always resubscribe by visiting our insights page.</p>
    
    <a href="${resubscribeUrl}" class="cta-button">Visit Our Insights Page</a>
    
    <p>Thank you for your interest in ${TEMPLATE_CONFIG.BRAND_NAME}.</p>
    
    <p>Best regards,<br>The ${TEMPLATE_CONFIG.BRAND_NAME} Team</p>
  `;

  const html = createBaseTemplate(subject, htmlContent, '');

  // Plain text content
  const text = `
${TEMPLATE_CONFIG.BRAND_NAME} Insights

You've been unsubscribed

Hi ${subscriberName},

We've successfully unsubscribed you from ${TEMPLATE_CONFIG.BRAND_NAME} insights notifications. You will no longer receive email updates when we publish new articles.

We're sorry to see you go! If you change your mind, you can always resubscribe by visiting our insights page.

Visit our insights page: ${resubscribeUrl}

Thank you for your interest in ${TEMPLATE_CONFIG.BRAND_NAME}.

Best regards,
The ${TEMPLATE_CONFIG.BRAND_NAME} Team
`.trim();

  return { html, text, subject };
}

/**
 * Generate test email template
 */
export function generateTestTemplate(
  testEmail: string,
  testMessage?: string
): { html: string; text: string; subject: string } {
  const subject = `${TEMPLATE_CONFIG.BRAND_NAME} Newsletter Test Email`;
  const message = testMessage || 'This is a test email to verify that the newsletter email infrastructure is working correctly.';

  // HTML content
  const htmlContent = `
    <h2 style="font-size: 22px; font-weight: 600; color: ${TEMPLATE_CONFIG.BRAND_COLOR}; margin: 0 0 20px 0; line-height: 1.3;">
      Newsletter System Test
    </h2>
    
    <p>Hello,</p>
    
    <p>${message}</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <strong>Test Details:</strong><br>
      Email: ${testEmail}<br>
      Timestamp: ${new Date().toISOString()}<br>
      System: ${TEMPLATE_CONFIG.BRAND_NAME} Newsletter Infrastructure
    </div>
    
    <p>If you received this email, the newsletter system is functioning correctly.</p>
    
    <p>Best regards,<br>The ${TEMPLATE_CONFIG.BRAND_NAME} Team</p>
  `;

  const html = createBaseTemplate(subject, htmlContent, '');

  // Plain text content
  const text = `
${TEMPLATE_CONFIG.BRAND_NAME} Newsletter System Test

Hello,

${message}

Test Details:
Email: ${testEmail}
Timestamp: ${new Date().toISOString()}
System: ${TEMPLATE_CONFIG.BRAND_NAME} Newsletter Infrastructure

If you received this email, the newsletter system is functioning correctly.

Best regards,
The ${TEMPLATE_CONFIG.BRAND_NAME} Team
`.trim();

  return { html, text, subject };
}

/**
 * Template validation helper
 */
export function validateTemplate(template: { html: string; text: string; subject: string }): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!template.subject || template.subject.trim().length === 0) {
    errors.push('Subject is required');
  }

  if (!template.html || template.html.trim().length === 0) {
    errors.push('HTML content is required');
  }

  if (!template.text || template.text.trim().length === 0) {
    errors.push('Text content is required');
  }

  // Check for required HTML elements
  if (template.html && !template.html.includes('<!DOCTYPE html>')) {
    errors.push('HTML template must include DOCTYPE declaration');
  }

  if (template.html && !template.html.includes('<meta name="viewport"')) {
    errors.push('HTML template must include viewport meta tag for mobile compatibility');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}