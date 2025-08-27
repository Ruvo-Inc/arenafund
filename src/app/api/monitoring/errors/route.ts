import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100, // Limit each IP to 100 error reports per minute
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for error reporting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await limiter.check(50, clientIP);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { event, timestamp, sessionId, error, metadata } = body;

    // Validate required fields
    if (!event || !timestamp || !sessionId || !error) {
      return NextResponse.json(
        { error: 'Missing required fields: event, timestamp, sessionId, error' },
        { status: 400 }
      );
    }

    // Get client information
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const hashedIp = await hashString(ip);

    // Prepare error data
    const errorData = {
      event,
      timestamp: new Date(timestamp),
      sessionId,
      hashedIp,
      userAgent: request.headers.get('user-agent') || 'unknown',
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack,
        context: error.context || {},
      },
      metadata: metadata || {},
      severity: determineSeverity(error),
      createdAt: new Date(),
    };

    // Store error in Firebase
    await adminDb.collection('newsletter_errors').add(errorData);

    // Update error metrics
    await updateErrorMetrics(error, errorData.severity);

    // Log critical errors immediately
    if (errorData.severity === 'critical') {
      console.error('[CRITICAL ERROR] Newsletter:', errorData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error monitoring failed:', error);
    
    // Still return success to not impact user experience
    return NextResponse.json({ success: false, error: 'Error monitoring failed' }, { status: 200 });
  }
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function determineSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';

  // Critical errors
  if (
    message.includes('database') ||
    message.includes('firebase') ||
    code.includes('permission') ||
    code.includes('auth')
  ) {
    return 'critical';
  }

  // High severity errors
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    code.includes('500') ||
    code.includes('503')
  ) {
    return 'high';
  }

  // Medium severity errors
  if (
    message.includes('validation') ||
    code.includes('400') ||
    code.includes('422')
  ) {
    return 'medium';
  }

  // Default to low severity
  return 'low';
}

async function updateErrorMetrics(error: any, severity: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const metricsRef = adminDb.collection('newsletter_error_metrics').doc(today);

    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(metricsRef);
      const currentData = doc.exists ? doc.data() : {};

      const updates: any = {
        date: today,
        lastUpdated: new Date(),
      };

      // Update total error count
      updates['totalErrors'] = (currentData?.totalErrors || 0) + 1;

      // Update severity counters
      const severityKey = `severity.${severity}`;
      updates[severityKey] = (currentData?.severity?.[severity] || 0) + 1;

      // Update error type counters
      const errorType = error.code || 'unknown';
      const typeKey = `types.${errorType}`;
      updates[typeKey] = (currentData?.types?.[errorType] || 0) + 1;

      transaction.set(metricsRef, updates, { merge: true });
    });
  } catch (error) {
    console.error('Failed to update error metrics:', error);
  }
}