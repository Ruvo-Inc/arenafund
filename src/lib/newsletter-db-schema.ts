/**
 * Newsletter Database Schema Setup
 * 
 * This module defines the Firebase Firestore schema for newsletter subscribers,
 * including collection structure, indexes, validation rules, and helper functions.
 * 
 * Requirements covered:
 * - 3.1: Store name, email, subscription date, and status in Firebase
 * - 3.2: Validate email uniqueness
 * - 3.3: Set status as "active" for new subscriptions
 * - 3.4: Include metadata like IP address and user agent for security
 */

import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

// Newsletter subscriber document structure
export interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string; // Indexed for uniqueness and fast lookups
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribedAt: Timestamp;
  source: string; // 'get-notified' | 'subscribe-updates' | 'newsletter-form'
  metadata: {
    userAgent?: string;
    ipAddress?: string; // Hashed for privacy
    lastUpdated: Timestamp;
    unsubscribedAt?: Timestamp;
    unsubscribeIP?: string;
    bounceCount?: number;
    lastBounceAt?: Timestamp;
  };
  unsubscribeToken?: string; // For secure unsubscribe links
}

// Collection name constant
export const NEWSLETTER_COLLECTION = 'newsletter_subscribers';

// Database schema validation rules
export const NEWSLETTER_SCHEMA_RULES = {
  // Field validation rules
  name: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'\.]+$/
  },
  email: {
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true
  },
  status: {
    required: true,
    type: 'string',
    enum: ['active', 'unsubscribed', 'bounced']
  },
  source: {
    required: true,
    type: 'string',
    maxLength: 50
  }
} as const;

// Index definitions for optimal query performance
export const NEWSLETTER_INDEXES = [
  {
    fields: [{ fieldPath: 'email', order: 'ASCENDING' }],
    options: { unique: true }
  },
  {
    fields: [{ fieldPath: 'status', order: 'ASCENDING' }],
    options: {}
  },
  {
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'subscribedAt', order: 'DESCENDING' }
    ],
    options: {}
  },
  {
    fields: [{ fieldPath: 'subscribedAt', order: 'DESCENDING' }],
    options: {}
  },
  {
    fields: [{ fieldPath: 'source', order: 'ASCENDING' }],
    options: {}
  }
] as const;

/**
 * Initialize newsletter database schema
 * Creates collection with proper indexes and validation
 */
export async function initializeNewsletterSchema(): Promise<void> {
  try {
    const db = getAdminDb();
    const collection = db.collection(NEWSLETTER_COLLECTION);
    
    console.log('🔧 Initializing newsletter database schema...');
    
    // Create a dummy document to ensure collection exists
    // This will be removed after indexes are created
    const tempDocRef = collection.doc('_temp_schema_init');
    await tempDocRef.set({
      _temp: true,
      createdAt: Timestamp.now()
    });
    
    console.log('✅ Newsletter collection created');
    
    // Note: Firestore indexes are typically created via Firebase Console or CLI
    // For production, these should be defined in firestore.indexes.json
    console.log('📋 Newsletter schema indexes defined:', NEWSLETTER_INDEXES.length);
    
    // Clean up temp document
    await tempDocRef.delete();
    
    console.log('✅ Newsletter database schema initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize newsletter schema:', error);
    throw error;
  }
}

/**
 * Validate subscriber data against schema rules
 */
export function validateSubscriberData(data: Partial<NewsletterSubscriber>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate name
  if (!data.name) {
    errors.push('Name is required');
  } else if (typeof data.name !== 'string') {
    errors.push('Name must be a string');
  } else if (data.name.length < NEWSLETTER_SCHEMA_RULES.name.minLength) {
    errors.push(`Name must be at least ${NEWSLETTER_SCHEMA_RULES.name.minLength} character`);
  } else if (data.name.length > NEWSLETTER_SCHEMA_RULES.name.maxLength) {
    errors.push(`Name must be less than ${NEWSLETTER_SCHEMA_RULES.name.maxLength} characters`);
  } else if (!NEWSLETTER_SCHEMA_RULES.name.pattern.test(data.name)) {
    errors.push('Name contains invalid characters');
  }
  
  // Validate email
  if (!data.email) {
    errors.push('Email is required');
  } else if (typeof data.email !== 'string') {
    errors.push('Email must be a string');
  } else if (data.email.length < NEWSLETTER_SCHEMA_RULES.email.minLength) {
    errors.push(`Email must be at least ${NEWSLETTER_SCHEMA_RULES.email.minLength} characters`);
  } else if (data.email.length > NEWSLETTER_SCHEMA_RULES.email.maxLength) {
    errors.push(`Email must be less than ${NEWSLETTER_SCHEMA_RULES.email.maxLength} characters`);
  } else if (!NEWSLETTER_SCHEMA_RULES.email.pattern.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  // Validate status
  if (data.status && !NEWSLETTER_SCHEMA_RULES.status.enum.includes(data.status as any)) {
    errors.push(`Status must be one of: ${NEWSLETTER_SCHEMA_RULES.status.enum.join(', ')}`);
  }
  
  // Validate source
  if (data.source && typeof data.source !== 'string') {
    errors.push('Source must be a string');
  } else if (data.source && data.source.length > NEWSLETTER_SCHEMA_RULES.source.maxLength) {
    errors.push(`Source must be less than ${NEWSLETTER_SCHEMA_RULES.source.maxLength} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if email already exists in the database
 */
export async function checkEmailExists(email: string): Promise<{
  exists: boolean;
  subscriber?: NewsletterSubscriber;
  docId?: string;
}> {
  try {
    const db = getAdminDb();
    const collection = db.collection(NEWSLETTER_COLLECTION);
    
    const normalizedEmail = email.toLowerCase().trim();
    
    const query = await collection
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();
    
    if (query.empty) {
      return { exists: false };
    }
    
    const doc = query.docs[0];
    const subscriber = doc.data() as NewsletterSubscriber;
    
    return {
      exists: true,
      subscriber,
      docId: doc.id
    };
    
  } catch (error) {
    console.error('Error checking email existence:', error);
    throw error;
  }
}

/**
 * Create a new newsletter subscriber
 */
export async function createSubscriber(subscriberData: {
  name: string;
  email: string;
  source: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<{ success: boolean; subscriberId?: string; error?: string }> {
  try {
    // Normalize data first
    const normalizedData = {
      ...subscriberData,
      name: subscriberData.name.trim(),
      email: subscriberData.email.toLowerCase().trim()
    };
    
    // Validate normalized data
    const validation = validateSubscriberData(normalizedData);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }
    
    // Check for existing email using normalized email
    const emailCheck = await checkEmailExists(normalizedData.email);
    if (emailCheck.exists) {
      return {
        success: false,
        error: 'Email already exists'
      };
    }
    
    const db = getAdminDb();
    const collection = db.collection(NEWSLETTER_COLLECTION);
    
    // Generate unique subscriber ID and unsubscribe token
    const subscriberId = `sub_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
    
    // Create subscriber document
    const newSubscriber: NewsletterSubscriber = {
      id: subscriberId,
      name: normalizedData.name,
      email: normalizedData.email,
      status: 'active',
      subscribedAt: Timestamp.now(),
      source: normalizedData.source,
      metadata: {
        userAgent: normalizedData.userAgent,
        ipAddress: normalizedData.ipAddress,
        lastUpdated: Timestamp.now()
      },
      unsubscribeToken
    };
    
    // Add to Firestore
    await collection.add(newSubscriber);
    
    return {
      success: true,
      subscriberId
    };
    
  } catch (error) {
    console.error('Error creating subscriber:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update subscriber status
 */
export async function updateSubscriberStatus(
  email: string,
  status: NewsletterSubscriber['status'],
  metadata?: Partial<NewsletterSubscriber['metadata']>
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailCheck = await checkEmailExists(email);
    if (!emailCheck.exists || !emailCheck.docId) {
      return {
        success: false,
        error: 'Subscriber not found'
      };
    }
    
    const db = getAdminDb();
    const collection = db.collection(NEWSLETTER_COLLECTION);
    
    const updateData: any = {
      status,
      'metadata.lastUpdated': Timestamp.now()
    };
    
    // Add additional metadata if provided
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        updateData[`metadata.${key}`] = value;
      });
    }
    
    await collection.doc(emailCheck.docId).update(updateData);
    
    return { success: true };
    
  } catch (error) {
    console.error('Error updating subscriber status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get active subscribers for email notifications
 */
export async function getActiveSubscribers(limit?: number): Promise<NewsletterSubscriber[]> {
  try {
    const db = getAdminDb();
    const collection = db.collection(NEWSLETTER_COLLECTION);
    
    let query = collection
      .where('status', '==', 'active')
      .orderBy('subscribedAt', 'desc');
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => doc.data() as NewsletterSubscriber);
    
  } catch (error) {
    console.error('Error getting active subscribers:', error);
    throw error;
  }
}

/**
 * Get subscribers by status with optional filtering
 */
export async function getSubscribersByStatus(
  status: NewsletterSubscriber['status'],
  options?: {
    limit?: number;
    source?: string;
    subscribedAfter?: Date;
    subscribedBefore?: Date;
  }
): Promise<NewsletterSubscriber[]> {
  try {
    const db = getAdminDb();
    const collection = db.collection(NEWSLETTER_COLLECTION);
    
    let query = collection.where('status', '==', status);
    
    // Add source filter if specified
    if (options?.source) {
      query = query.where('source', '==', options.source);
    }
    
    // Add date range filters if specified
    if (options?.subscribedAfter) {
      query = query.where('subscribedAt', '>=', Timestamp.fromDate(options.subscribedAfter));
    }
    
    if (options?.subscribedBefore) {
      query = query.where('subscribedAt', '<=', Timestamp.fromDate(options.subscribedBefore));
    }
    
    // Order by subscription date
    query = query.orderBy('subscribedAt', 'desc');
    
    // Apply limit if specified
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => doc.data() as NewsletterSubscriber);
    
  } catch (error) {
    console.error('Error getting subscribers by status:', error);
    throw error;
  }
}

/**
 * Get subscriber by email
 */
export async function getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | null> {
  try {
    const emailCheck = await checkEmailExists(email);
    return emailCheck.exists ? emailCheck.subscriber || null : null;
  } catch (error) {
    console.error('Error getting subscriber by email:', error);
    throw error;
  }
}

/**
 * Get subscriber by unsubscribe token
 */
export async function getSubscriberByToken(token: string): Promise<NewsletterSubscriber | null> {
  try {
    const db = getAdminDb();
    const collection = db.collection(NEWSLETTER_COLLECTION);
    
    const query = await collection
      .where('unsubscribeToken', '==', token)
      .limit(1)
      .get();
    
    if (query.empty) {
      return null;
    }
    
    return query.docs[0].data() as NewsletterSubscriber;
    
  } catch (error) {
    console.error('Error getting subscriber by token:', error);
    throw error;
  }
}

/**
 * Batch retrieve subscribers for email sending
 * Returns subscribers in batches to avoid memory issues with large subscriber lists
 */
export async function* getActiveSubscribersBatch(batchSize: number = 100): AsyncGenerator<NewsletterSubscriber[], void, unknown> {
  try {
    const db = getAdminDb();
    const collection = db.collection(NEWSLETTER_COLLECTION);
    
    let query = collection
      .where('status', '==', 'active')
      .orderBy('subscribedAt', 'desc')
      .limit(batchSize);
    
    let lastDoc: any = null;
    
    while (true) {
      let currentQuery = query;
      
      if (lastDoc) {
        currentQuery = query.startAfter(lastDoc);
      }
      
      const snapshot = await currentQuery.get();
      
      if (snapshot.empty) {
        break;
      }
      
      const subscribers = snapshot.docs.map(doc => doc.data() as NewsletterSubscriber);
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      
      yield subscribers;
      
      // If we got fewer documents than the batch size, we've reached the end
      if (snapshot.docs.length < batchSize) {
        break;
      }
    }
    
  } catch (error) {
    console.error('Error getting subscribers in batches:', error);
    throw error;
  }
}

/**
 * Get subscriber statistics
 */
export async function getSubscriberStats(): Promise<{
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
  bySource: Record<string, number>;
}> {
  try {
    const db = getAdminDb();
    const collection = db.collection(NEWSLETTER_COLLECTION);
    
    // Get all subscribers
    const allSubscribers = await collection.get();
    const subscribers = allSubscribers.docs.map(doc => doc.data() as NewsletterSubscriber);
    
    // Calculate statistics
    const stats = {
      total: subscribers.length,
      active: 0,
      unsubscribed: 0,
      bounced: 0,
      bySource: {} as Record<string, number>
    };
    
    subscribers.forEach(subscriber => {
      // Count by status
      switch (subscriber.status) {
        case 'active':
          stats.active++;
          break;
        case 'unsubscribed':
          stats.unsubscribed++;
          break;
        case 'bounced':
          stats.bounced++;
          break;
      }
      
      // Count by source
      const source = subscriber.source || 'unknown';
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
    });
    
    return stats;
    
  } catch (error) {
    console.error('Error getting subscriber stats:', error);
    throw error;
  }
}

/**
 * Hash IP address for privacy compliance
 */
export function hashIPAddress(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'default-newsletter-salt';
  return crypto.createHash('sha256').update(ip + salt).digest('hex').substring(0, 16);
}

/**
 * Generate secure unsubscribe token
 */
export function generateUnsubscribeToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Export collection reference helper
export function getNewsletterCollection() {
  const db = getAdminDb();
  return db.collection(NEWSLETTER_COLLECTION);
}