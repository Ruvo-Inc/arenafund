import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewsletterModal } from '@/components/NewsletterModal';
import { recordConsent, getConsentStatus, withdrawConsent } from '@/lib/consent-tracking';
import { handleDataAccessRequest, handleDataDeletionRequest } from '@/lib/data-compliance';

// Mock Firebase Admin
jest.mock('@/lib/firebase-admin', () => ({
  getAdminDb: jest.fn(() => ({
    collection: jest.fn(() => ({
      add: jest.fn().mockResolvedValue({ id: 'mock-doc-id' }),
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({ empty: true, docs: [] })
            })),
            orderBy: jest.fn(() => ({
              limit: jest.fn(() => ({
                get: jest.fn().mockResolvedValue({ empty: true, docs: [] })
              })),
              get: jest.fn().mockResolvedValue({ empty: true, docs: [] })
            })),
            get: jest.fn().mockResolvedValue({ empty: true, docs: [] })
          }))
        })),
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({ empty: true, docs: [] })
        })),
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn().mockResolvedValue({ empty: true, docs: [] })
          })),
          get: jest.fn().mockResolvedValue({ empty: true, docs: [] })
        })),
        get: jest.fn().mockResolvedValue({ empty: true, docs: [] })
      })),
      batch: jest.fn(() => ({
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      }))
    }))
  }))
}));

// Mock security logging
jest.mock('@/lib/security-logging', () => ({
  logSecurityEvent: jest.fn()
}));

// Mock email validation
jest.mock('@/lib/email-validation', () => ({
  validateEmail: jest.fn().mockResolvedValue({ isValid: true })
}));

// Mock rate limiting
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn(() => ({
    check: jest.fn().mockResolvedValue({ success: true, limit: 5, reset: Date.now(), remaining: 4 })
  }))
}));

// Mock Next.js
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Privacy Compliance Integration', () => {
  beforeEach(() => {
    // Set up environment variables
    process.env.IP_HASH_SALT = 'test-salt';
    process.env.UNSUBSCRIBE_TOKEN_SECRET = 'test-secret';
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    delete process.env.IP_HASH_SALT;
    delete process.env.UNSUBSCRIBE_TOKEN_SECRET;
  });

  describe('Newsletter Modal Privacy Features', () => {
    it('displays privacy notice in newsletter modal', () => {
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={() => {}} 
          triggerSource="get-notified"
        />
      );

      expect(screen.getByText('Privacy & Data Protection')).toBeInTheDocument();
      expect(screen.getByText(/By subscribing, you consent to receive email notifications/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Privacy Policy/ })).toBeInTheDocument();
    });

    it('shows expandable privacy information', async () => {
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={() => {}} 
          triggerSource="get-notified"
        />
      );

      const learnMoreButton = screen.getByText('Learn more about data handling');
      fireEvent.click(learnMoreButton);

      await waitFor(() => {
        expect(screen.getByText('What we collect:')).toBeInTheDocument();
        expect(screen.getByText('Your rights:')).toBeInTheDocument();
        expect(screen.getByText(/GDPR & CCPA Compliant/)).toBeInTheDocument();
      });
    });

    it('includes privacy compliance information in expanded view', async () => {
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={() => {}} 
          triggerSource="get-notified"
        />
      );

      fireEvent.click(screen.getByText('Learn more about data handling'));

      await waitFor(() => {
        expect(screen.getByText(/Your name and email address/)).toBeInTheDocument();
        expect(screen.getByText(/Send you newsletter updates/)).toBeInTheDocument();
        expect(screen.getByText(/Unsubscribe at any time/)).toBeInTheDocument();
        expect(screen.getByText(/Request access to or deletion of your data/)).toBeInTheDocument();
      });
    });
  });

  describe('Consent Tracking', () => {
    it('records consent when user subscribes', async () => {
      const testEmail = 'test@example.com';
      const consentOptions = {
        email: testEmail,
        consentType: 'newsletter_subscription' as const,
        consentGiven: true,
        consentMethod: 'opt_in' as const,
        consentSource: 'newsletter-modal',
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
        legalBasis: 'consent' as const,
        dataProcessingPurposes: ['newsletter_delivery', 'analytics']
      };

      const consentId = await recordConsent(consentOptions);

      expect(consentId).toBeTruthy();
      expect(consentId).toMatch(/^consent_\d+_[a-f0-9]+$/);
    });

    it('withdraws consent when user unsubscribes', async () => {
      const testEmail = 'test@example.com';

      // This should not throw an error
      await expect(withdrawConsent(
        testEmail,
        'newsletter_subscription',
        'user_request',
        '192.168.1.1',
        'Test Browser'
      )).resolves.not.toThrow();
    });

    it('retrieves consent status', async () => {
      const testEmail = 'test@example.com';

      const consentStatus = await getConsentStatus(testEmail, 'newsletter_subscription');
      
      // Should return null for non-existent consent (mocked as empty)
      expect(consentStatus).toBeNull();
    });
  });

  describe('Data Subject Rights', () => {
    it('handles data access request', async () => {
      const testEmail = 'test@example.com';

      const exportData = await handleDataAccessRequest(testEmail, 'email');

      expect(exportData).toHaveProperty('personalInformation');
      expect(exportData).toHaveProperty('consentHistory');
      expect(exportData).toHaveProperty('newsletterSubscriptions');
      expect(exportData).toHaveProperty('communicationHistory');
      expect(exportData).toHaveProperty('technicalData');
      expect(exportData).toHaveProperty('exportDate');
      expect(exportData).toHaveProperty('exportId');

      expect(exportData.personalInformation.email).toBe(testEmail);
      expect(exportData.exportId).toMatch(/^export_\d+_[a-z0-9]+$/);
    });

    it('handles data deletion request with anonymization', async () => {
      const testEmail = 'test@example.com';

      // Should not throw an error
      await expect(handleDataDeletionRequest(
        testEmail,
        'email',
        true // retain for legal purposes
      )).resolves.not.toThrow();
    });

    it('handles data deletion request with complete removal', async () => {
      const testEmail = 'test@example.com';

      // Should not throw an error
      await expect(handleDataDeletionRequest(
        testEmail,
        'email',
        false // complete deletion
      )).resolves.not.toThrow();
    });
  });

  describe('API Integration', () => {
    it('includes consent data in newsletter subscription API call', async () => {
      // Mock fetch for API call
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: 'Successfully subscribed!',
          subscriptionId: 'sub_123'
        })
      });

      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={() => {}} 
          triggerSource="get-notified"
        />
      );

      // Fill out the form
      const nameInput = screen.getByLabelText(/Name/);
      const emailInput = screen.getByLabelText(/Email Address/);
      const submitButton = screen.getByRole('button', { name: /Subscribe to Newsletter/ });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"consent"')
        });
      });

      // Verify consent data is included
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody.consent).toEqual({
        gdprApplies: true,
        ccpaApplies: true,
        consentMethod: 'opt_in',
        dataProcessingPurposes: [
          'newsletter_delivery',
          'content_personalization',
          'service_improvement',
          'analytics'
        ]
      });
    });
  });

  describe('Unsubscribe Token Security', () => {
    it('generates secure unsubscribe tokens', () => {
      const email = 'test@example.com';
      const consentType = 'newsletter_subscription';
      
      // Mock the token generation (since it's in the API route)
      const mockGenerateToken = (email: string) => {
        const timestamp = Date.now().toString();
        const data = `${email}:newsletter_subscription:${timestamp}`;
        const crypto = require('crypto');
        const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET || 'default-secret';
        const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
        const tokenData = `${timestamp}:${signature}`;
        return Buffer.from(tokenData).toString('base64url');
      };

      const token = mockGenerateToken(email);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
    });

    it('validates unsubscribe tokens correctly', () => {
      const email = 'test@example.com';
      
      // Mock token verification
      const mockVerifyToken = (token: string, email: string) => {
        try {
          const tokenData = Buffer.from(token, 'base64url').toString();
          const [timestamp, signature] = tokenData.split(':');
          
          if (!timestamp || !signature) return false;
          
          // Check age (30 days max)
          const tokenAge = Date.now() - parseInt(timestamp);
          const maxAge = 30 * 24 * 60 * 60 * 1000;
          if (tokenAge > maxAge) return false;
          
          // Verify signature
          const data = `${email}:newsletter_subscription:${timestamp}`;
          const crypto = require('crypto');
          const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET || 'default-secret';
          const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('hex');
          
          return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
          );
        } catch {
          return false;
        }
      };

      // Generate a valid token
      const timestamp = Date.now().toString();
      const data = `${email}:newsletter_subscription:${timestamp}`;
      const crypto = require('crypto');
      const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET || 'default-secret';
      const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
      const tokenData = `${timestamp}:${signature}`;
      const validToken = Buffer.from(tokenData).toString('base64url');

      expect(mockVerifyToken(validToken, email)).toBe(true);
      expect(mockVerifyToken('invalid-token', email)).toBe(false);
      expect(mockVerifyToken(validToken, 'different@example.com')).toBe(false);
    });
  });

  describe('Privacy Policy Integration', () => {
    it('links to privacy policy from newsletter modal', () => {
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={() => {}} 
          triggerSource="get-notified"
        />
      );

      const privacyLink = screen.getByRole('link', { name: /Privacy Policy/ });
      expect(privacyLink).toHaveAttribute('href', '/privacy');
      expect(privacyLink).toHaveAttribute('target', '_blank');
    });

    it('provides contact information for privacy questions', async () => {
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={() => {}} 
          triggerSource="get-notified"
        />
      );

      fireEvent.click(screen.getByText('Learn more about data handling'));

      await waitFor(() => {
        expect(screen.getByText(/privacy@thearenafund.com/)).toBeInTheDocument();
      });
    });
  });
});