import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Limit each IP to 500 requests per minute
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await limiter.check(100, clientIP);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { event, timestamp, sessionId, metadata } = body;

    // Validate required fields
    if (!event || !timestamp || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: event, timestamp, sessionId' },
        { status: 400 }
      );
    }

    // Get client IP for analytics (hashed for privacy)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const hashedIp = await hashString(ip);

    // Prepare analytics data
    const analyticsData = {
      event,
      timestamp: new Date(timestamp),
      sessionId,
      hashedIp,
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: metadata || {},
      createdAt: new Date(),
    };

    // Store in Firebase
    await adminDb.collection('newsletter_analytics').add(analyticsData);

    // Update aggregated metrics
    await updateAggregatedMetrics(event, metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    // Don't fail the request if analytics fails
    return NextResponse.json({ success: false, error: 'Analytics tracking failed' }, { status: 200 });
  }
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function updateAggregatedMetrics(event: string, metadata: any): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const metricsRef = adminDb.collection('newsletter_metrics').doc(today);

    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(metricsRef);
      const currentData = doc.exists ? doc.data() : {};

      const updates: any = {
        date: today,
        lastUpdated: new Date(),
      };

      // Update event counters
      const eventKey = `events.${event}`;
      updates[eventKey] = (currentData?.events?.[event] || 0) + 1;

      // Update source counters for conversion events
      if (metadata?.source && event.includes('modal_open')) {
        const sourceKey = `sources.${metadata.source}`;
        updates[sourceKey] = (currentData?.sources?.[metadata.source] || 0) + 1;
      }

      // Update conversion funnel
      if (event === 'newsletter_modal_open') {
        updates['funnel.modalOpens'] = (currentData?.funnel?.modalOpens || 0) + 1;
      } else if (event === 'newsletter_form_submit') {
        updates['funnel.formSubmits'] = (currentData?.funnel?.formSubmits || 0) + 1;
      } else if (event === 'newsletter_subscription_success') {
        updates['funnel.subscriptions'] = (currentData?.funnel?.subscriptions || 0) + 1;
      }

      transaction.set(metricsRef, updates, { merge: true });
    });
  } catch (error) {
    console.error('Failed to update aggregated metrics:', error);
  }
}