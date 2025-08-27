/**
 * Newsletter Database Schema Tests
 * 
 * Tests for the newsletter database schema setup, validation,
 * and helper functions.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  validateSubscriberData,
  checkEmailExists,
  createSubscriber,
  updateSubscriberStatus,
  getActiveSubscribers,
  getSubscriberStats,
  hashIPAddress,
  generateUnsubscribeToken,
  NEWSLETTER_COLLECTION,
  NEWSLETTER_SCHEMA_RULES
} from '../newsletter-db-schema';

// Mock Firebase Admin
const mockGet = vi.fn(() => Promise.resolve({ empty: true, docs: [] }));
const mockLimit = vi.fn(() => ({ get: mockGet }));
const mockOrderBy = vi.fn(() => ({ 
  limit: mockLimit,
  get: mockGet 
}));
const mockWhere = vi.fn(() => ({ 
  limit: mockLimit,
  orderBy: mockOrderBy,
  get: mockGet 
}));
const mockAdd = vi.fn(() => Promise.resolve({ id: 'mock-doc-id' }));
const mockUpdate = vi.fn(() => Promise.resolve());
const mockSet = vi.fn(() => Promise.resolve());
const mockDelete = vi.fn(() => Promise.resolve());
const mockDoc = vi.fn(() => ({
  update: mockUpdate,
  set: mockSet,
  delete: mockDelete
}));
const mockCollection = vi.fn(() => ({
  where: mockWhere,
  add: mockAdd,
  doc: mockDoc,
  orderBy: mockOrderBy,
  limit: mockLimit,
  get: mockGet
}));

vi.mock('../firebase-admin', () => ({
  getAdminDb: vi.fn(() => ({
    collection: mockCollection
  }))
}));

describe('Newsletter Database Schema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    mockGet.mockResolvedValue({ empty: true, docs: [] });
    mockWhere.mockReturnValue({ 
      limit: mockLimit,
      orderBy: mockOrderBy,
      get: mockGet 
    });
    mockOrderBy.mockReturnValue({ 
      limit: mockLimit,
      get: mockGet 
    });
    mockLimit.mockReturnValue({ get: mockGet });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Schema Constants', () => {
    it('should have correct collection name', () => {
      expect(NEWSLETTER_COLLECTION).toBe('newsletter_subscribers');
    });

    it('should have proper schema rules', () => {
      expect(NEWSLETTER_SCHEMA_RULES.name.required).toBe(true);
      expect(NEWSLETTER_SCHEMA_RULES.email.unique).toBe(true);
      expect(NEWSLETTER_SCHEMA_RULES.status.enum).toEqual(['active', 'unsubscribed', 'bounced']);
    });
  });

  describe('validateSubscriberData', () => {
    it('should validate valid subscriber data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active' as const,
        source: 'newsletter-form'
      };

      const result = validateSubscriberData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing required fields', () => {
      const invalidData = {};

      const result = validateSubscriberData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
      expect(result.errors).toContain('Email is required');
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      const result = validateSubscriberData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should reject invalid name characters', () => {
      const invalidData = {
        name: 'John@Doe#123',
        email: 'john@example.com'
      };

      const result = validateSubscriberData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name contains invalid characters');
    });

    it('should reject invalid status', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        status: 'invalid-status' as any
      };

      const result = validateSubscriberData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Status must be one of: active, unsubscribed, bounced');
    });

    it('should reject name that is too long', () => {
      const invalidData = {
        name: 'A'.repeat(101), // Exceeds 100 character limit
        email: 'john@example.com'
      };

      const result = validateSubscriberData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name must be less than 100 characters');
    });

    it('should reject email that is too long', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'a'.repeat(250) + '@example.com' // Exceeds 254 character limit
      };

      const result = validateSubscriberData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email must be less than 254 characters');
    });
  });

  describe('checkEmailExists', () => {
    it('should return false for non-existent email', async () => {
      const result = await checkEmailExists('nonexistent@example.com');
      expect(result.exists).toBe(false);
      expect(result.subscriber).toBeUndefined();
      expect(result.docId).toBeUndefined();
    });

    it('should normalize email before checking', async () => {
      await checkEmailExists('  JOHN@EXAMPLE.COM  ');
      
      expect(mockWhere).toHaveBeenCalledWith('email', '==', 'john@example.com');
    });
  });

  describe('createSubscriber', () => {
    it('should create subscriber with valid data', async () => {
      const subscriberData = {
        name: 'John Doe',
        email: 'john@example.com',
        source: 'newsletter-form',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1'
      };

      const result = await createSubscriber(subscriberData);
      expect(result.success).toBe(true);
      expect(result.subscriberId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid subscriber data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        source: 'test'
      };

      const result = await createSubscriber(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.subscriberId).toBeUndefined();
    });

    it('should normalize email and name', async () => {
      // Ensure email check returns false (email doesn't exist)
      mockGet.mockResolvedValueOnce({ empty: true, docs: [] });
      
      const subscriberData = {
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        source: 'newsletter-form'
      };

      const result = await createSubscriber(subscriberData);
      
      expect(result.success).toBe(true);
      expect(result.subscriberId).toBeDefined();
      
      // Verify the add was called with normalized data
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          status: 'active'
        })
      );
    });
  });

  describe('updateSubscriberStatus', () => {
    it('should update status for existing subscriber', async () => {
      // Mock existing subscriber
      const mockSubscriber = {
        id: 'sub_123',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active'
      };

      // Mock the query to return an existing subscriber
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [{
          id: 'doc-123',
          data: () => mockSubscriber
        }]
      });

      const result = await updateSubscriberStatus('john@example.com', 'unsubscribed');
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error for non-existent subscriber', async () => {
      const result = await updateSubscriberStatus('nonexistent@example.com', 'unsubscribed');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Subscriber not found');
    });
  });

  describe('Utility Functions', () => {
    describe('hashIPAddress', () => {
      it('should hash IP address consistently', () => {
        const ip = '192.168.1.1';
        const hash1 = hashIPAddress(ip);
        const hash2 = hashIPAddress(ip);
        
        expect(hash1).toBe(hash2);
        expect(hash1).toHaveLength(16);
        expect(hash1).not.toBe(ip);
      });

      it('should produce different hashes for different IPs', () => {
        const hash1 = hashIPAddress('192.168.1.1');
        const hash2 = hashIPAddress('192.168.1.2');
        
        expect(hash1).not.toBe(hash2);
      });
    });

    describe('generateUnsubscribeToken', () => {
      it('should generate unique tokens', () => {
        const token1 = generateUnsubscribeToken();
        const token2 = generateUnsubscribeToken();
        
        expect(token1).not.toBe(token2);
        expect(token1).toHaveLength(64); // 32 bytes = 64 hex characters
        expect(token2).toHaveLength(64);
      });

      it('should generate cryptographically secure tokens', () => {
        const token = generateUnsubscribeToken();
        
        // Should be hex string
        expect(token).toMatch(/^[a-f0-9]{64}$/);
      });
    });
  });

  describe('getActiveSubscribers', () => {
    it('should query for active subscribers only', async () => {
      await getActiveSubscribers();
      
      expect(mockWhere).toHaveBeenCalledWith('status', '==', 'active');
      expect(mockOrderBy).toHaveBeenCalledWith('subscribedAt', 'desc');
    });

    it('should apply limit when provided', async () => {
      await getActiveSubscribers(10);
      
      expect(mockWhere).toHaveBeenCalledWith('status', '==', 'active');
      expect(mockOrderBy).toHaveBeenCalledWith('subscribedAt', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(10);
    });
  });

  describe('getSubscriberStats', () => {
    it('should calculate statistics correctly', async () => {
      // Mock subscribers data
      const mockSubscribers = [
        { status: 'active', source: 'newsletter-form' },
        { status: 'active', source: 'get-notified' },
        { status: 'unsubscribed', source: 'newsletter-form' },
        { status: 'bounced', source: 'subscribe-updates' }
      ];

      mockGet.mockResolvedValueOnce({
        docs: mockSubscribers.map(sub => ({ data: () => sub }))
      });

      const stats = await getSubscriberStats();
      
      expect(stats.total).toBe(4);
      expect(stats.active).toBe(2);
      expect(stats.unsubscribed).toBe(1);
      expect(stats.bounced).toBe(1);
      expect(stats.bySource['newsletter-form']).toBe(2);
      expect(stats.bySource['get-notified']).toBe(1);
      expect(stats.bySource['subscribe-updates']).toBe(1);
    });
  });
});