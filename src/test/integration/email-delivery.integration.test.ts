/**
 * Email Delivery Integration Tests
 * 
 * Tests comprehensive email formatting and delivery for application submissions:
 * - HTML and text email formatting with all form sections
 * - Secure file download links in emails
 * - Email metadata and tracking
 * - Error handling for email delivery failures
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as applicationsPost } from '@/app/api/applications/route'

// Mock Firebase Admin SDK
const mockFirestore = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({
      id: 'test-email-app',
      set: vi.fn().mockResolvedValue(undefined)
    }))
  })),
  runTransaction: vi.fn().mockResolvedValue(undefined)
}

const mockAuth = {
  verifyIdToken: vi.fn().mockResolvedValue({
    uid: 'test-uid',
    email: 'test@example.com'
  })
}

vi.mock('firebase-admin', () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
    firestore: vi.fn(() => mockFirestore),
    auth: vi.fn(() => mockAuth)
  },
  firestore: {
    FieldValue: {
      serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
      increment: vi.fn((n) => ({ _methodName: 'increment', _value: n }))
    },
    Timestamp: {
      now: vi.fn(() => ({ seconds: Math.floor(Date.now() / 1000) }))
    }
  }
}))

// Mock Google Cloud Storage
const mockFile = {
  exists: vi.fn().mockResolvedValue([true]),
  getSignedUrl: vi.fn().mockResolvedValue(['https://storage.googleapis.com/secure-download-url'])
}

const mockBucket = {
  file: vi.fn(() => mockFile)
}

const mockStorage = {
  bucket: vi.fn(() => mockBucket)
}

vi.mock('@google-cloud/storage', () => ({
  Storage: vi.fn(() => mockStorage)
}))

// Mock email queue with detailed tracking
const mockEnqueueEmail = vi.fn().mockResolvedValue({ messageId: 'test-message-id' })
vi.mock('@/lib/mail/enqueueEmail', () => ({
  enqueueEmail: mockEnqueueEmail
}))

describe('Email Delivery Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset Firestore mocks
    mockFirestore.collection.mockImplementation((collectionName: string) => {
      if (collectionName === 'applications_meta') {
        return {
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({
              exists: false,
              get: vi.fn()
            }),
            set: vi.fn().mockResolvedValue(undefined)
          }))
        }
      }
      return {
        doc: vi.fn(() => ({
          id: 'test-email-app',
          set: vi.fn().mockResolvedValue(undefined)
        }))
      }
    })
  })

  describe('Comprehensive Email Formatting', () => {
    const completeApplicationPayload = {
      founderName: 'Jane Smith',
      founderEmail: 'jane@techstartup.com',
      role: 'CEO & Co-founder',
      phone: '+1-555-123-4567',
      linkedin: 'https://linkedin.com/in/janesmith',
      companyName: 'TechStartup Inc',
      companyUrl: 'https://techstartup.com',
      stage: 'series-a',
      industry: 'fintech',
      oneLineDescription: 'AI-powered financial analytics for enterprise clients',
      problem: 'Enterprise finance teams spend 80% of their time on manual data processing and struggle with real-time insights across multiple systems and data sources.',
      solution: 'Our AI platform automatically ingests data from 50+ financial systems, processes it in real-time, and provides intelligent insights through natural language queries.',
      traction: 'revenue',
      revenue: '1m-plus',
      deckUrl: 'https://drive.google.com/file/d/abc123/view',
      videoPitch: 'https://vimeo.com/123456789',
      enterpriseEngagement: 'We have signed contracts with 3 Fortune 500 companies (JPMorgan Chase, Goldman Sachs, and Wells Fargo) with a combined ARR of $2.5M. Additionally, we have active pilots with 5 other major financial institutions.',
      keyHighlights: 'Former Goldman Sachs team, 150% net revenue retention, partnerships with AWS and Snowflake, SOC 2 Type II certified',
      capitalRaised: 'yes',
      capitalRaisedAmount: '5m',
      capitalSought: '3m-plus',
      signature: 'Jane Smith',
      accuracyConfirm: true,
      understandingConfirm: true,
      websiteHoneypot: ''
    }

    it('should format comprehensive HTML email with all sections', async () => {
      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(completeApplicationPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await applicationsPost(request)

      expect(mockEnqueueEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringMatching(/<div[^>]*font-family: Arial[^>]*>/)
        })
      )

      const emailCall = mockEnqueueEmail.mock.calls[0][0]
      const htmlContent = emailCall.html

      // Verify all major sections are present
      expect(htmlContent).toContain('Company Overview')
      expect(htmlContent).toContain('Founder Information')
      expect(htmlContent).toContain('Business Details')
      expect(htmlContent).toContain('Enterprise Engagement')
      expect(htmlContent).toContain('Funding Information')
      expect(htmlContent).toContain('Pitch Materials')

      // Verify company information
      expect(htmlContent).toContain('TechStartup Inc')
      expect(htmlContent).toContain('https://techstartup.com')
      expect(htmlContent).toContain('series-a')
      expect(htmlContent).toContain('fintech')

      // Verify founder information
      expect(htmlContent).toContain('Jane Smith')
      expect(htmlContent).toContain('jane@techstartup.com')
      expect(htmlContent).toContain('CEO &amp; Co-founder')
      expect(htmlContent).toContain('+1-555-123-4567')
      expect(htmlContent).toContain('linkedin.com/in/janesmith')

      // Verify business details with proper HTML escaping
      expect(htmlContent).toContain('AI-powered financial analytics')
      expect(htmlContent).toContain('Enterprise finance teams')
      expect(htmlContent).toContain('AI platform automatically')

      // Verify enterprise engagement
      expect(htmlContent).toContain('JPMorgan Chase')
      expect(htmlContent).toContain('$2.5M')

      // Verify funding information
      expect(htmlContent).toContain('5m')
      expect(htmlContent).toContain('3m-plus')

      // Verify pitch materials
      expect(htmlContent).toContain('drive.google.com')
      expect(htmlContent).toContain('vimeo.com')

      // Verify proper HTML escaping
      expect(htmlContent).toContain('&amp;') // & should be escaped
      expect(htmlContent).not.toContain('<script') // No script tags
    })

    it('should format comprehensive text email with proper structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(completeApplicationPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await applicationsPost(request)

      const emailCall = mockEnqueueEmail.mock.calls[0][0]
      const textContent = emailCall.text

      // Verify section headers
      expect(textContent).toContain('=== COMPANY OVERVIEW ===')
      expect(textContent).toContain('=== FOUNDER INFORMATION ===')
      expect(textContent).toContain('=== BUSINESS DETAILS ===')
      expect(textContent).toContain('=== ENTERPRISE ENGAGEMENT ===')
      expect(textContent).toContain('=== FUNDING INFORMATION ===')
      expect(textContent).toContain('=== PITCH MATERIALS ===')

      // Verify structured data
      expect(textContent).toContain('Company: TechStartup Inc')
      expect(textContent).toContain('Website: https://techstartup.com')
      expect(textContent).toContain('Stage: series-a')
      expect(textContent).toContain('Industry: fintech')
      expect(textContent).toContain('Name: Jane Smith')
      expect(textContent).toContain('Email: jane@techstartup.com')
      expect(textContent).toContain('Role: CEO & Co-founder')

      // Verify application ID is included
      expect(textContent).toContain('Application ID: test-email-app')
      expect(textContent).toContain('Digital Signature: Jane Smith')
    })

    it('should handle missing optional fields gracefully', async () => {
      const minimalPayload = {
        founderName: 'John Minimal',
        founderEmail: 'john@minimal.com',
        role: 'Founder',
        companyName: 'Minimal Co',
        companyUrl: 'https://minimal.com',
        stage: 'pre-seed',
        industry: 'saas',
        oneLineDescription: 'Simple solution',
        problem: 'Simple problem',
        solution: 'Simple solution',
        traction: 'mvp',
        deckUrl: 'https://example.com/deck.pdf',
        enterpriseEngagement: 'Early stage',
        capitalSought: '500k-1m',
        signature: 'John Minimal',
        accuracyConfirm: true,
        understandingConfirm: true,
        websiteHoneypot: ''
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(minimalPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await applicationsPost(request)

      const emailCall = mockEnqueueEmail.mock.calls[0][0]
      const htmlContent = emailCall.html
      const textContent = emailCall.text

      // Should show "-" for missing optional fields
      expect(textContent).toContain('Phone: -')
      expect(textContent).toContain('LinkedIn: -')
      expect(textContent).toContain('Revenue: -')
      expect(textContent).toContain('Video Pitch: -')
      expect(textContent).toContain('Key Highlights: -')

      // HTML should also handle missing fields
      expect(htmlContent).toContain('<td>-</td>')
    })
  })

  describe('File Download Links in Emails', () => {
    it('should include secure download links for uploaded files', async () => {
      const payloadWithFile = {
        founderName: 'File Uploader',
        founderEmail: 'uploader@example.com',
        role: 'CEO',
        companyName: 'File Company',
        companyUrl: 'https://filecompany.com',
        stage: 'seed',
        industry: 'tech',
        oneLineDescription: 'File management solution',
        problem: 'File management is hard',
        solution: 'We make it easy',
        traction: 'customers',
        deckFileRef: 'applications/uploads/1234567890-pitch-deck.pdf',
        enterpriseEngagement: 'Growing customer base',
        capitalSought: '1m-3m',
        signature: 'File Uploader',
        accuracyConfirm: true,
        understandingConfirm: true,
        websiteHoneypot: ''
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(payloadWithFile),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await applicationsPost(request)

      const emailCall = mockEnqueueEmail.mock.calls[0][0]
      const htmlContent = emailCall.html
      const textContent = emailCall.text

      // Verify secure download link in HTML
      expect(htmlContent).toContain('Download Secure File')
      expect(htmlContent).toContain('https://storage.googleapis.com/secure-download-url')
      expect(htmlContent).toContain('expires in 7 days')

      // Verify secure download link in text
      expect(textContent).toContain('Secure download: https://storage.googleapis.com/secure-download-url')

      // Verify Google Cloud Storage was called correctly
      expect(mockStorage.bucket).toHaveBeenCalledWith('test-project.appspot.com')
      expect(mockBucket.file).toHaveBeenCalledWith('applications/uploads/1234567890-pitch-deck.pdf')
      expect(mockFile.getSignedUrl).toHaveBeenCalledWith({
        version: 'v4',
        action: 'read',
        expires: expect.any(Number)
      })
    })

    it('should handle file download link generation failures', async () => {
      // Mock file not found
      mockFile.exists.mockResolvedValueOnce([false])

      const payloadWithMissingFile = {
        founderName: 'Missing File',
        founderEmail: 'missing@example.com',
        role: 'CEO',
        companyName: 'Missing File Co',
        companyUrl: 'https://missingfile.com',
        stage: 'seed',
        industry: 'tech',
        oneLineDescription: 'File solution',
        problem: 'Files go missing',
        solution: 'We find them',
        traction: 'customers',
        deckFileRef: 'applications/uploads/missing-file.pdf',
        enterpriseEngagement: 'Growing',
        capitalSought: '1m-3m',
        signature: 'Missing File',
        accuracyConfirm: true,
        understandingConfirm: true,
        websiteHoneypot: ''
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(payloadWithMissingFile),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await applicationsPost(request)

      const emailCall = mockEnqueueEmail.mock.calls[0][0]
      const htmlContent = emailCall.html
      const textContent = emailCall.text

      // Should show fallback message when file link generation fails
      expect(htmlContent).toContain('File uploaded (download link unavailable)')
      expect(textContent).toContain('File uploaded (download link unavailable)')
    })

    it('should handle both file and URL in pitch materials', async () => {
      const payloadWithBoth = {
        founderName: 'Both Options',
        founderEmail: 'both@example.com',
        role: 'CEO',
        companyName: 'Both Co',
        companyUrl: 'https://both.com',
        stage: 'seed',
        industry: 'tech',
        oneLineDescription: 'Dual solution',
        problem: 'Need options',
        solution: 'We provide both',
        traction: 'customers',
        deckUrl: 'https://example.com/public-deck.pdf',
        deckFileRef: 'applications/uploads/private-deck.pdf',
        videoPitch: 'https://youtube.com/watch?v=demo',
        enterpriseEngagement: 'Multiple channels',
        capitalSought: '1m-3m',
        signature: 'Both Options',
        accuracyConfirm: true,
        understandingConfirm: true,
        websiteHoneypot: ''
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(payloadWithBoth),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await applicationsPost(request)

      const emailCall = mockEnqueueEmail.mock.calls[0][0]
      const htmlContent = emailCall.html
      const textContent = emailCall.text

      // Should show both URL and file download link
      expect(htmlContent).toContain('https://example.com/public-deck.pdf')
      expect(htmlContent).toContain('Download Secure File')
      expect(htmlContent).toContain('https://youtube.com/watch?v=demo')

      expect(textContent).toContain('Deck URL: https://example.com/public-deck.pdf')
      expect(textContent).toContain('Secure download:')
      expect(textContent).toContain('Video Pitch: https://youtube.com/watch?v=demo')
    })
  })

  describe('Email Metadata and Tracking', () => {
    it('should include proper email metadata', async () => {
      const payload = {
        founderName: 'Meta Data',
        founderEmail: 'metadata@example.com',
        role: 'CEO',
        companyName: 'Meta Company',
        companyUrl: 'https://metacompany.com',
        stage: 'seed',
        industry: 'tech',
        oneLineDescription: 'Metadata solution',
        problem: 'Missing metadata',
        solution: 'We add metadata',
        traction: 'customers',
        deckUrl: 'https://example.com/deck.pdf',
        enterpriseEngagement: 'Metadata-driven',
        capitalSought: '1m-3m',
        signature: 'Meta Data',
        accuracyConfirm: true,
        understandingConfirm: true,
        websiteHoneypot: ''
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await applicationsPost(request)

      expect(mockEnqueueEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['test@thearenafund.com'],
          subject: '[Arena] New founder application — Meta Company',
          fromName: 'Arena Intake',
          replyTo: 'metadata@example.com',
          messageIdHint: 'apply-test-email-app',
          metadata: {
            type: 'application',
            appId: 'test-email-app'
          }
        })
      )
    })

    it('should handle multiple recipient emails', async () => {
      // Mock multiple ops emails
      process.env.OPS_EMAILS = 'invest@thearenafund.com,ops@thearenafund.com,team@thearenafund.com'

      const payload = {
        founderName: 'Multi Recipient',
        founderEmail: 'multi@example.com',
        role: 'CEO',
        companyName: 'Multi Co',
        companyUrl: 'https://multi.com',
        stage: 'seed',
        industry: 'tech',
        oneLineDescription: 'Multi solution',
        problem: 'Single recipient',
        solution: 'Multiple recipients',
        traction: 'customers',
        deckUrl: 'https://example.com/deck.pdf',
        enterpriseEngagement: 'Multi-channel',
        capitalSought: '1m-3m',
        signature: 'Multi Recipient',
        accuracyConfirm: true,
        understandingConfirm: true,
        websiteHoneypot: ''
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await applicationsPost(request)

      expect(mockEnqueueEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['invest@thearenafund.com', 'ops@thearenafund.com', 'team@thearenafund.com']
        })
      )

      // Reset environment
      process.env.OPS_EMAILS = 'test@thearenafund.com'
    })

    it('should generate unique message IDs for tracking', async () => {
      const payload = {
        founderName: 'Unique ID',
        founderEmail: 'unique@example.com',
        role: 'CEO',
        companyName: 'Unique Co',
        companyUrl: 'https://unique.com',
        stage: 'seed',
        industry: 'tech',
        oneLineDescription: 'Unique solution',
        problem: 'Duplicate IDs',
        solution: 'Unique IDs',
        traction: 'customers',
        deckUrl: 'https://example.com/deck.pdf',
        enterpriseEngagement: 'Unique approach',
        capitalSought: '1m-3m',
        signature: 'Unique ID',
        accuracyConfirm: true,
        understandingConfirm: true,
        websiteHoneypot: ''
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await applicationsPost(request)

      const emailCall = mockEnqueueEmail.mock.calls[0][0]
      expect(emailCall.messageIdHint).toMatch(/^apply-/)
      expect(emailCall.metadata.appId).toBe('test-email-app')
      expect(emailCall.metadata.type).toBe('application')
    })
  })

  describe('Email Delivery Error Handling', () => {
    it('should not fail application submission if email fails', async () => {
      // Mock email queue failure
      mockEnqueueEmail.mockRejectedValueOnce(new Error('Email service unavailable'))

      const payload = {
        founderName: 'Email Fail',
        founderEmail: 'emailfail@example.com',
        role: 'CEO',
        companyName: 'Email Fail Co',
        companyUrl: 'https://emailfail.com',
        stage: 'seed',
        industry: 'tech',
        oneLineDescription: 'Email solution',
        problem: 'Emails fail',
        solution: 'Resilient system',
        traction: 'customers',
        deckUrl: 'https://example.com/deck.pdf',
        enterpriseEngagement: 'Fault-tolerant',
        capitalSought: '1m-3m',
        signature: 'Email Fail',
        accuracyConfirm: true,
        understandingConfirm: true,
        websiteHoneypot: ''
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await applicationsPost(request)
      const data = await response.json()

      // Application should still succeed
      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.id).toBe('test-email-app')

      // Email should have been attempted
      expect(mockEnqueueEmail).toHaveBeenCalled()
    })

    it('should handle email content sanitization', async () => {
      const payloadWithSpecialChars = {
        founderName: 'Special <>&"\'',
        founderEmail: 'special@example.com',
        role: 'CEO & Founder',
        companyName: 'Special "Chars" & Co',
        companyUrl: 'https://special.com',
        stage: 'seed',
        industry: 'tech',
        oneLineDescription: 'Solution with <special> chars & "quotes"',
        problem: 'Problems with <script>alert("xss")</script> content',
        solution: 'Safe & secure solutions',
        traction: 'customers',
        deckUrl: 'https://example.com/deck.pdf',
        enterpriseEngagement: 'Enterprise & government clients',
        keyHighlights: 'Strong team & proven results',
        capitalSought: '1m-3m',
        signature: 'Special <>&"\'',
        accuracyConfirm: true,
        understandingConfirm: true,
        websiteHoneypot: ''
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(payloadWithSpecialChars),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await applicationsPost(request)

      const emailCall = mockEnqueueEmail.mock.calls[0][0]
      const htmlContent = emailCall.html
      const textContent = emailCall.text

      // HTML should be properly escaped
      expect(htmlContent).toContain('&lt;special&gt;')
      expect(htmlContent).toContain('&amp;')
      expect(htmlContent).toContain('&quot;')
      expect(htmlContent).not.toContain('<script>')

      // Text should be sanitized
      expect(textContent).not.toContain('<script>')
      expect(textContent).toContain('Special')
      expect(textContent).toContain('&')
    })
  })
})