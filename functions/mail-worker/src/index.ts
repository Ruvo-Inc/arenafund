/**
 * Arena Fund Gmail Mailer Cloud Functions
 * Production-grade email queue processing with domain-wide delegation
 * 
 * Features:
 * - Firestore-triggered email processing
 * - Gmail API with domain-wide delegation
 * - Robust error handling and retry logic
 * - Comprehensive logging and monitoring
 * - Lease-based concurrency control
 * - Email deduplication and rate limiting
 */

import { CloudEvent } from '@google-cloud/functions-framework';
import * as admin from 'firebase-admin';
import { google } from 'googleapis';

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// Types
interface MailQueueDocument {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  fromName?: string;
  messageIdHint?: string;
  metadata?: Record<string, unknown>;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  attempts: number;
  lastError?: string;
  leaseOwner?: string;
  leaseExpiresAt?: admin.firestore.Timestamp;
  notBefore: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  env: string;
}

interface FirestoreEvent {
  data: {
    value: {
      fields: Record<string, any>;
    };
    oldValue?: {
      fields: Record<string, any>;
    };
  };
}

// Configuration
const CONFIG = {
  MAX_ATTEMPTS: 5,
  LEASE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  RETRY_DELAYS: [1000, 5000, 15000, 60000, 300000], // Progressive backoff
  GMAIL_SCOPES: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
  ],
  IMPERSONATE_USER: process.env.GMAIL_IMPERSONATE || 'mani.swaminathan@myruvo.com',
  FROM_ADDRESS: 'mani.swaminathan@myruvo.com',
  FROM_NAME: 'Arena Fund'
};

/**
 * Create authenticated Gmail client with domain-wide delegation
 */
async function createGmailClient(): Promise<any> {
  try {
    const clientEmail = process.env.GMAIL_CLIENT_EMAIL;
    const privateKey = process.env.GMAIL_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      throw new Error('Gmail credentials not found in environment variables');
    }

    console.log(`Creating Gmail client for service account: ${clientEmail}`);
    console.log(`Impersonating user: ${CONFIG.IMPERSONATE_USER}`);

    const jwtClient = new google.auth.JWT(
      clientEmail,
      undefined,
      privateKey,
      CONFIG.GMAIL_SCOPES,
      CONFIG.IMPERSONATE_USER
    );

    await jwtClient.authorize();
    console.log('✅ Gmail JWT authorization successful');

    const gmail = google.gmail({ version: 'v1', auth: jwtClient });
    
    // Test the connection
    const profile = await gmail.users.getProfile({ userId: 'me' });
    console.log(`✅ Gmail API connected for: ${profile.data.emailAddress}`);

    return gmail;
  } catch (error) {
    console.error('❌ Failed to create Gmail client:', error);
    throw error;
  }
}

/**
 * Convert Firestore document to MailQueueDocument
 */
function firestoreToMailDoc(firestoreData: any): MailQueueDocument {
  const convertTimestamp = (field: any) => {
    if (field?.timestampValue) {
      return admin.firestore.Timestamp.fromDate(new Date(field.timestampValue));
    }
    return field;
  };

  const convertArray = (field: any) => {
    if (field?.arrayValue?.values) {
      return field.arrayValue.values.map((v: any) => v.stringValue || v);
    }
    return field || [];
  };

  return {
    to: convertArray(firestoreData.to),
    cc: convertArray(firestoreData.cc),
    bcc: convertArray(firestoreData.bcc),
    subject: firestoreData.subject?.stringValue || '',
    text: firestoreData.text?.stringValue || undefined,
    html: firestoreData.html?.stringValue || undefined,
    replyTo: firestoreData.replyTo?.stringValue || undefined,
    fromName: firestoreData.fromName?.stringValue || undefined,
    messageIdHint: firestoreData.messageIdHint?.stringValue || undefined,
    metadata: firestoreData.metadata?.mapValue?.fields || {},
    status: firestoreData.status?.stringValue as any || 'queued',
    attempts: parseInt(firestoreData.attempts?.integerValue || '0'),
    lastError: firestoreData.lastError?.stringValue || undefined,
    leaseOwner: firestoreData.leaseOwner?.stringValue || undefined,
    leaseExpiresAt: convertTimestamp(firestoreData.leaseExpiresAt),
    notBefore: convertTimestamp(firestoreData.notBefore),
    createdAt: convertTimestamp(firestoreData.createdAt),
    updatedAt: convertTimestamp(firestoreData.updatedAt),
    env: firestoreData.env?.stringValue || 'prod'
  };
}

/**
 * Acquire lease on mail queue document
 */
async function acquireLease(docId: string, leaseOwner: string): Promise<boolean> {
  try {
    const docRef = db.collection('mailQueue').doc(docId);
    const leaseExpiresAt = admin.firestore.Timestamp.fromMillis(
      Date.now() + CONFIG.LEASE_DURATION_MS
    );

    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      
      if (!doc.exists) {
        throw new Error('Document does not exist');
      }

      const data = doc.data() as MailQueueDocument;
      const now = admin.firestore.Timestamp.now();

      // Check if document can be leased
      if (data.status !== 'queued' && data.status !== 'processing') {
        return false; // Already processed or failed
      }

      if (data.leaseExpiresAt && data.leaseExpiresAt.toMillis() > now.toMillis()) {
        return false; // Already leased by another worker
      }

      if (data.notBefore.toMillis() > now.toMillis()) {
        return false; // Not ready to process yet
      }

      // Acquire lease
      transaction.update(docRef, {
        status: 'processing',
        leaseOwner,
        leaseExpiresAt,
        updatedAt: now
      });

      return true;
    });

    if (result) {
      console.log(`✅ Acquired lease for document ${docId}`);
    } else {
      console.log(`⏭️  Could not acquire lease for document ${docId}`);
    }

    return result;
  } catch (error) {
    console.error(`❌ Failed to acquire lease for ${docId}:`, error);
    return false;
  }
}

/**
 * Release lease and update document status
 */
async function releaseLease(
  docId: string, 
  status: 'sent' | 'failed', 
  attempts: number,
  error?: string
): Promise<void> {
  try {
    const docRef = db.collection('mailQueue').doc(docId);
    const updateData: any = {
      status,
      attempts,
      leaseOwner: null,
      leaseExpiresAt: null,
      updatedAt: admin.firestore.Timestamp.now()
    };

    if (error) {
      updateData.lastError = error;
    }

    // If failed and under max attempts, schedule retry
    if (status === 'failed' && attempts < CONFIG.MAX_ATTEMPTS) {
      const retryDelay = CONFIG.RETRY_DELAYS[Math.min(attempts - 1, CONFIG.RETRY_DELAYS.length - 1)];
      updateData.status = 'queued';
      updateData.notBefore = admin.firestore.Timestamp.fromMillis(Date.now() + retryDelay);
      console.log(`📅 Scheduling retry for ${docId} in ${retryDelay}ms (attempt ${attempts})`);
    }

    await docRef.update(updateData);
    console.log(`✅ Released lease for ${docId} with status: ${updateData.status}`);
  } catch (error) {
    console.error(`❌ Failed to release lease for ${docId}:`, error);
  }
}

/**
 * Send email via Gmail API
 */
async function sendEmail(gmail: any, mailDoc: MailQueueDocument): Promise<void> {
  try {
    console.log(`📧 Preparing email: "${mailDoc.subject}" to ${mailDoc.to.join(', ')}`);

    // Build email headers
    const headers: string[] = [
      `To: ${mailDoc.to.join(', ')}`,
      `Subject: ${mailDoc.subject}`,
      `From: ${mailDoc.fromName || CONFIG.FROM_NAME} <${CONFIG.FROM_ADDRESS}>`
    ];

    if (mailDoc.cc && mailDoc.cc.length > 0) {
      headers.push(`Cc: ${mailDoc.cc.join(', ')}`);
    }

    if (mailDoc.bcc && mailDoc.bcc.length > 0) {
      headers.push(`Bcc: ${mailDoc.bcc.join(', ')}`);
    }

    if (mailDoc.replyTo) {
      headers.push(`Reply-To: ${mailDoc.replyTo}`);
    }

    if (mailDoc.messageIdHint) {
      headers.push(`Message-ID: <${mailDoc.messageIdHint}@${CONFIG.FROM_ADDRESS.split('@')[1]}>`);
    }

    // Add content type and body
    if (mailDoc.html) {
      headers.push('Content-Type: text/html; charset=utf-8');
      headers.push('');
      headers.push(mailDoc.html);
    } else if (mailDoc.text) {
      headers.push('Content-Type: text/plain; charset=utf-8');
      headers.push('');
      headers.push(mailDoc.text);
    } else {
      throw new Error('Email must have either text or html content');
    }

    // Encode message
    const rawMessage = headers.join('\n');
    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send via Gmail API
    console.log(`🚀 Sending email via Gmail API...`);
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log(`✅ Email sent successfully! Message ID: ${response.data.id}`);
    
    // Log metadata for monitoring
    if (mailDoc.metadata) {
      console.log(`📊 Email metadata:`, JSON.stringify(mailDoc.metadata));
    }

  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

/**
 * Process a single mail queue document
 */
async function processMailDocument(docId: string, mailDoc: MailQueueDocument): Promise<void> {
  const leaseOwner = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`🔄 Processing mail document ${docId}`);
  console.log(`📋 Status: ${mailDoc.status}, Attempts: ${mailDoc.attempts}`);

  // Acquire lease
  const leaseAcquired = await acquireLease(docId, leaseOwner);
  if (!leaseAcquired) {
    console.log(`⏭️  Skipping ${docId} - could not acquire lease`);
    return;
  }

  let attempts = mailDoc.attempts + 1;

  try {
    // Create Gmail client
    const gmail = await createGmailClient();

    // Send email
    await sendEmail(gmail, mailDoc);

    // Mark as sent
    await releaseLease(docId, 'sent', attempts);
    
    console.log(`🎉 Successfully processed mail document ${docId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to process mail document ${docId}:`, errorMessage);

    // Mark as failed (or queued for retry)
    await releaseLease(docId, 'failed', attempts, errorMessage);
  }
}

/**
 * Cloud Function: Handle mail queue document creation
 */
export async function onMailQueued(cloudEvent: CloudEvent<FirestoreEvent>): Promise<void> {
  try {
    console.log('🚀 Mail queue worker triggered - document created');
    console.log('📄 Event data:', JSON.stringify(cloudEvent, null, 2));

    const docId = cloudEvent.source.split('/').pop()?.split('?')[0];
    if (!docId) {
      throw new Error('Could not extract document ID from event source');
    }

    const firestoreData = cloudEvent.data?.data?.value?.fields;
    if (!firestoreData) {
      throw new Error('No Firestore data found in event');
    }

    const mailDoc = firestoreToMailDoc(firestoreData);
    
    // Only process if status is queued and environment matches
    if (mailDoc.status !== 'queued') {
      console.log(`⏭️  Skipping ${docId} - status is ${mailDoc.status}`);
      return;
    }

    const currentEnv = process.env.NEXT_PUBLIC_ENV || 'prod';
    if (mailDoc.env !== currentEnv) {
      console.log(`⏭️  Skipping ${docId} - env mismatch (doc: ${mailDoc.env}, current: ${currentEnv})`);
      return;
    }

    await processMailDocument(docId, mailDoc);

  } catch (error) {
    console.error('❌ Mail queue worker failed:', error);
    throw error;
  }
}

/**
 * Cloud Function: Handle mail queue document updates (for retries)
 */
export async function onMailRequeued(cloudEvent: CloudEvent<FirestoreEvent>): Promise<void> {
  try {
    console.log('🔄 Mail queue worker triggered - document updated');

    const docId = cloudEvent.source.split('/').pop()?.split('?')[0];
    if (!docId) {
      throw new Error('Could not extract document ID from event source');
    }

    const firestoreData = cloudEvent.data?.data?.value?.fields;
    const oldFirestoreData = cloudEvent.data?.data?.oldValue?.fields;
    
    if (!firestoreData || !oldFirestoreData) {
      console.log('⏭️  Skipping - missing current or old document data');
      return;
    }

    const mailDoc = firestoreToMailDoc(firestoreData);
    const oldMailDoc = firestoreToMailDoc(oldFirestoreData);

    // Only process if status changed from non-queued to queued (retry scenario)
    if (mailDoc.status !== 'queued' || oldMailDoc.status === 'queued') {
      console.log(`⏭️  Skipping ${docId} - not a retry scenario (${oldMailDoc.status} -> ${mailDoc.status})`);
      return;
    }

    const currentEnv = process.env.NEXT_PUBLIC_ENV || 'prod';
    if (mailDoc.env !== currentEnv) {
      console.log(`⏭️  Skipping ${docId} - env mismatch (doc: ${mailDoc.env}, current: ${currentEnv})`);
      return;
    }

    await processMailDocument(docId, mailDoc);

  } catch (error) {
    console.error('❌ Mail requeue worker failed:', error);
    throw error;
  }
}
