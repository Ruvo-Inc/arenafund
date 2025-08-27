import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  recordConsent, 
  withdrawConsent, 
  getConsentStatus, 
  getUserConsentHistory,
  generateUnsubscribeToken,
  verifyUnsubscribeToken
} from '../consent-tracking';

// Mock dependencies
vi.mock('../firebase-admin', () => ({
  getAdminDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      add: vi.fn().mockResolvedValue({ id: 'mock-doc-id' }),
      where: vi.fn(() => ({
        where: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => ({
              get: vi.fn().mockResolvedValue({ empty: true, docs: [] })
            })),
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                get: vi.fn().mockResolvedValue({ empty: true, docs: [] })
              })),
              get: vi.fn().mockResolvedValue({ empty: true, docs: [] })
            })),
            get: vi.fn().mockResolvedValue({ empty: true, docs: [] })
          }))
        })),
        limit: vi.fn(() => ({
          get: vi.fn().mockResolvedValue({ empty: true, docs: [] })
        })),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({ empty: true, docs: [] })
          })),
          get: vi.fn().mockResolvedValue({ empty: true, docs: [] })
        })),
        get: vi.fn().mockResolvedValue({ empty: true, docs: [] })
      }))
    }))
  }))
}));

vi.mock('../security-logging', () => ({
  logSecurityEvent: vi.fn()
}));

describe('Consent Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.IP_HASH_SALT = 'test-salt';
    process.env.UNSUBSCRIBE_TOKEN_SECRET = 'test-secret';
  });

  describe('recordConsent', () => {
    it('records consent with required fields', async () => {
      const consentOptions = {
        email: 'test@example.com',
        consentType: 'newsletter_subscription' as const,
        consentGiven: true,
        consentMethod: 'opt_in' as const,
        consentSource: 'newsletter-modal',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Browser',
        legalBasis: 'consent' as const,
        dataProcessingPurposes: ['newsletter_delivery', 'analytics']
      };

      const consentId = await recordConsent(consentOptions);

      expect(consentId).toBeTruthy();
      expect(consentId).toMatch(/^consent_\d+_[a-f0-9]+$/);
    });

    it('handles errors gracefully', async () => {
      // Mock a database error
      vi.doMock('../firebase-admin', () => ({
        getAdminDb: vi.fn(() => ({
          collection: vi.fn(() => ({
            add: vi.fn().mockRejectedValue(new Error('Database error'))
          }))
        }))
      }));

      await expect(recordConsent({
        email: 'test@example.com',
        consentType: 'newsletter_subscription',
        consentGiven: true,
        consentMethod: 'opt_in',
        consentSource: 'test'
      })).rejects.toThrow('Failed to record consent');
    });
  });

  describe('withdrawConsent', () => {
    it('withdraws consent without throwing error', async () => {
      await expect(withdrawConsent(
        'test@example.com',
        'newsletter_subscription',
        'user_request',
        '192.168.1.1',
        'Test Browser'
      )).resolves.not.toThrow();
    });
  });

  describe('getConsentStatus', () => {
    it('returns null for non-existent consent', async () => {
      const result = await getConsentStatus('test@example.com', 'newsletter_subscription');
      expect(result).toBeNull();
    });
  });

  describe('getUserConsentHistory', () => {
    it('returns empty array for user with no consent history', async () => {
      const result = await getUserConsentHistory('test@example.com');
      expect(result).toEqual([]);
    });
  });

  describe('Unsubscribe token functions', () => {
    it('generates and verifies valid unsubscribe token', () => {
      const email = 'test@example.com';
      const consentType = 'newsletter_subscription';
      
      const token = generateUnsubscribeToken(email, consentType);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      
      const isValid = verifyUnsubscribeToken(token, email, consentType);
      expect(isValid).toBe(true);
    });

    it('rejects invalid tokens', () => {
      const email = 'test@example.com';
      const consentType = 'newsletter_subscription';
      
      const isValid = verifyUnsubscribeToken('invalid-token', email, consentType);
      expect(isValid).toBe(false);
    });

    it('rejects tokens for different email', () => {
      const token = generateUnsubscribeToken('test@example.com', 'newsletter_subscription');
      
      const isValid = verifyUnsubscribeToken(token, 'different@example.com', 'newsletter_subscription');
      expect(isValid).toBe(false);
    });
  });
});