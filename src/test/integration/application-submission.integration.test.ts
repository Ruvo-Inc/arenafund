/**
 * End-to-End Integration Tests for Application Submission Flow
 * 
 * Tests the complete application submission process including:
 * - Form validation and submission
 * - File upload with signed URLs
 * - Email delivery with comprehensive data formatting
 * - Rate limiting and security measures
 * - Error handling and retry logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { ApplicationService, type FormData } from '@/lib/application-service'

// Mock Firebase Admin SDK
vi.mock('firebase-admin', () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
    firestore: vi.fn(() => ({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          id: 'test-app-id',
          set: vi.fn().mockResolvedValue(undefined),
          get: vi.fn().mockResolvedValue({
            exists: false,
            get: vi.fn()
          })
        }))
      })),
      runTransaction: vi.fn().mockResolvedValue(undefined)
    })),
    auth: vi.fn(() => ({
      verifyIdToken: vi.fn().mockResolvedValue({
        uid: 'test-uid',
        email: 'test@example.com'
      })
    }))
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
vi.mock('@google-cloud/storage', () => ({
  Storage: vi.fn(() => ({
    bucket: vi.fn(() => ({
      file: vi.fn(() => ({
        exists: vi.fn().mockResolvedValue([true]),
        getSignedUrl: vi.fn().mockResolvedValue(['https://storage.googleapis.com/signed-url'])
      }))
    }))
  }))
}))

// Mock email queue
vi.mock('@/lib/mail/enqueueEmail', () => ({
  enqueueEmail: vi.fn().mockResolvedValue({ messageId: 'test-message-id' })
}))

describe('Application Submission Integration Tests', () => {
  const validFormData: FormData = {
    fullName: 'John Doe',
    role: 'CEO',
    email: 'john@example.com',
    phone: '+1234567890',
    linkedin: 'https://linkedin.com/in/johndoe',
    companyName: 'Test Company',
    website: 'https://testcompany.com',
    stage: 'seed',
    industry: 'enterprise',
    oneLineDescription: 'We solve enterprise problems with AI',
    problem: 'Enterprises struggle with data management and need better solutions for their complex workflows.',
    solution: 'Our AI-powered platform automates data processing and provides intelligent insights for enterprise teams.',
    traction: 'customers',
    revenue: '100k-500k',
    deckFile: null,
    deckLink: 'https://example.com/deck.pdf',
    videoPitch: 'https://youtube.com/watch?v=123',
    enterpriseEngagement: 'We have active pilots with 3 Fortune 500 companies and signed LOIs worth $2M in potential revenue.',
    keyHighlights: 'Strong technical team, proven product-market fit, enterprise partnerships',
    capitalRaised: 'yes',
    capitalRaisedAmount: '250k',
    capitalSought: '1m-3m',
    accuracyConfirm: true,
    understandingConfirm: true,
    signature: 'John Doe'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete Application Submission Flow', () => {
    it('should successfully submit application with all required data', async () => {
      // Mock successful API responses
      server.use(
        http.post('/api/applications', () => {
          return HttpResponse.json({ id: 'test-app-id' }, { status: 201 })
        })
      )

      const result = await ApplicationService.submitApplication(validFormData)

      expect(result.success).toBe(true)
      expect(result.id).toBe('test-app-id')
      expect(result.error).toBeUndefined()
    })

    it('should handle validation errors with specific field messages', async () => {
      const invalidFormData = {
        ...validFormData,
        fullName: '',
        email: 'invalid-email',
        companyName: ''
      }

      const result = await ApplicationService.submitApplication(invalidFormData)

      expect(result.success).toBe(false)
      expect(result.validationErrors).toBeDefined()
      expect(result.validationErrors!.length).toBeGreaterThan(0)
      
      const fieldErrors = result.validationErrors!.map(e => e.field)
      expect(fieldErrors).toContain('fullName')
      expect(fieldErrors).toContain('email')
      expect(fieldErrors).toContain('companyName')
    })

    it('should enforce rate limiting with proper error messages', async () => {
      server.use(
        http.post('/api/applications', () => {
          return HttpResponse.json(
            { error: 'Please wait 30 seconds before submitting again.', retryAfter: 30 },
            { status: 429 }
          )
        })
      )

      const result = await ApplicationService.submitApplication(validFormData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('30 seconds')
      expect(result.retryAfter).toBe(30)
    })

    it('should handle server errors with retry logic', async () => {
      let attemptCount = 0
      server.use(
        http.post('/api/applications', () => {
          attemptCount++
          if (attemptCount < 3) {
            return HttpResponse.json(
              { error: 'Internal server error' },
              { status: 500 }
            )
          }
          return HttpResponse.json({ id: 'test-app-id' }, { status: 201 })
        })
      )

      const result = await ApplicationService.submitApplication(validFormData)

      expect(result.success).toBe(true)
      expect(result.id).toBe('test-app-id')
      expect(attemptCount).toBe(3) // Should retry twice before succeeding
    })
  })

  describe('File Upload Integration', () => {
    const createTestFile = (name: string, type: string, size: number): File => {
      const content = 'test file content'.repeat(size / 17) // Approximate size
      return new File([content], name, { type })
    }

    it('should successfully upload file with signed URL flow', async () => {
      const testFile = createTestFile('test-deck.pdf', 'application/pdf', 1024)
      
      server.use(
        http.post('/api/upload/signed-url', () => {
          return HttpResponse.json({
            uploadUrl: 'https://storage.googleapis.com/signed-upload-url',
            fileRef: 'applications/uploads/test-deck.pdf',
            expiresAt: new Date(Date.now() + 600000).toISOString(),
            maxSize: 25 * 1024 * 1024,
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
          })
        }),
        http.put('https://storage.googleapis.com/signed-upload-url', () => {
          return new HttpResponse(null, { status: 200 })
        })
      )

      const result = await ApplicationService.uploadFile(testFile)

      expect(result.success).toBe(true)
      expect(result.fileRef).toBe('applications/uploads/test-deck.pdf')
      expect(result.error).toBeUndefined()
    })

    it('should validate file type and size constraints', async () => {
      const invalidFile = createTestFile('test.exe', 'application/x-executable', 1024)
      
      const result = await ApplicationService.uploadFile(invalidFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Only PDF, JPEG, and PNG files are allowed')
    })

    it('should handle file upload with form submission', async () => {
      const testFile = createTestFile('pitch-deck.pdf', 'application/pdf', 2048)
      const formDataWithFile = {
        ...validFormData,
        deckFile: testFile,
        deckLink: '' // Clear URL since we're uploading file
      }

      server.use(
        http.post('/api/upload/signed-url', () => {
          return HttpResponse.json({
            uploadUrl: 'https://storage.googleapis.com/signed-upload-url',
            fileRef: 'applications/uploads/pitch-deck.pdf',
            expiresAt: new Date(Date.now() + 600000).toISOString(),
            maxSize: 25 * 1024 * 1024,
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
          })
        }),
        http.put('https://storage.googleapis.com/signed-upload-url', () => {
          return new HttpResponse(null, { status: 200 })
        }),
        http.post('/api/applications', () => {
          return HttpResponse.json({ id: 'test-app-with-file' }, { status: 201 })
        })
      )

      const result = await ApplicationService.submitApplication(formDataWithFile)

      expect(result.success).toBe(true)
      expect(result.id).toBe('test-app-with-file')
    })

    it('should handle file upload failures gracefully', async () => {
      const testFile = createTestFile('test-deck.pdf', 'application/pdf', 1024)
      
      server.use(
        http.post('/api/upload/signed-url', () => {
          return HttpResponse.json({
            uploadUrl: 'https://storage.googleapis.com/signed-upload-url',
            fileRef: 'applications/uploads/test-deck.pdf',
            expiresAt: new Date(Date.now() + 600000).toISOString(),
            maxSize: 25 * 1024 * 1024,
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
          })
        }),
        http.put('https://storage.googleapis.com/signed-upload-url', () => {
          return HttpResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
          )
        })
      )

      const result = await ApplicationService.uploadFile(testFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Upload failed')
    })
  })

  describe('Email Delivery Integration', () => {
    it('should trigger email with comprehensive application data', async () => {
      const { enqueueEmail } = await import('@/lib/mail/enqueueEmail')
      
      server.use(
        http.post('/api/applications', () => {
          return HttpResponse.json({ id: 'test-email-app' }, { status: 201 })
        })
      )

      await ApplicationService.submitApplication(validFormData)

      expect(enqueueEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['test@thearenafund.com'],
          subject: expect.stringContaining('Test Company'),
          text: expect.stringContaining('COMPANY OVERVIEW'),
          html: expect.stringContaining('Company Overview'),
          fromName: 'Arena Intake',
          replyTo: 'john@example.com',
          messageIdHint: expect.stringContaining('apply-'),
          metadata: expect.objectContaining({
            type: 'application',
            appId: expect.any(String)
          })
        })
      )
    })

    it('should include file download links in email when files are uploaded', async () => {
      const testFile = createTestFile('deck.pdf', 'application/pdf', 1024)
      const formDataWithFile = {
        ...validFormData,
        deckFile: testFile,
        deckLink: ''
      }

      server.use(
        http.post('/api/upload/signed-url', () => {
          return HttpResponse.json({
            uploadUrl: 'https://storage.googleapis.com/signed-upload-url',
            fileRef: 'applications/uploads/deck.pdf',
            expiresAt: new Date(Date.now() + 600000).toISOString(),
            maxSize: 25 * 1024 * 1024,
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
          })
        }),
        http.put('https://storage.googleapis.com/signed-upload-url', () => {
          return new HttpResponse(null, { status: 200 })
        }),
        http.post('/api/applications', () => {
          return HttpResponse.json({ id: 'test-file-email' }, { status: 201 })
        })
      )

      const { enqueueEmail } = await import('@/lib/mail/enqueueEmail')
      
      await ApplicationService.submitApplication(formDataWithFile)

      expect(enqueueEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Download Secure File'),
          text: expect.stringContaining('Secure download:')
        })
      )
    })
  })

  describe('Security and Validation', () => {
    it('should detect and reject honeypot submissions', async () => {
      server.use(
        http.post('/api/applications', ({ request }) => {
          return request.json().then((body: any) => {
            if (body.websiteHoneypot && body.websiteHoneypot.trim() !== '') {
              return HttpResponse.json(
                { error: 'Spam detected.' },
                { status: 400 }
              )
            }
            return HttpResponse.json({ id: 'test-app-id' }, { status: 201 })
          })
        })
      )

      // Normal submission should work
      const result1 = await ApplicationService.submitApplication(validFormData)
      expect(result1.success).toBe(true)

      // Honeypot submission should be rejected
      // Note: The honeypot field is added internally by the service
      const spamFormData = { ...validFormData }
      // Simulate spam by modifying the internal payload
      const originalTransform = (ApplicationService as any).transformToApiPayload
      ;(ApplicationService as any).transformToApiPayload = vi.fn((formData, fileRef) => ({
        ...originalTransform(formData, fileRef),
        websiteHoneypot: 'spam-content'
      }))

      const result2 = await ApplicationService.submitApplication(spamFormData)
      expect(result2.success).toBe(false)
      expect(result2.error).toContain('Spam detected')

      // Restore original method
      ;(ApplicationService as any).transformToApiPayload = originalTransform
    })

    it('should sanitize and validate text content for security', async () => {
      const maliciousFormData = {
        ...validFormData,
        fullName: '<script>alert("xss")</script>John Doe',
        problem: 'javascript:alert("xss") This is a problem',
        solution: 'data:text/html,<script>alert("xss")</script> Solution'
      }

      const validation = ApplicationService.validateFormData(maliciousFormData)
      
      // Should detect suspicious content
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.code === 'SUSPICIOUS_CONTENT')).toBe(true)
    })

    it('should enforce field length limits', async () => {
      const longTextFormData = {
        ...validFormData,
        oneLineDescription: 'x'.repeat(200), // Exceeds 150 char limit
        problem: 'x'.repeat(400), // Exceeds 300 char limit
        solution: 'x'.repeat(400) // Exceeds 300 char limit
      }

      const validation = ApplicationService.validateFormData(longTextFormData)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.field === 'oneLineDescription' && e.code === 'MAX_LENGTH')).toBe(true)
      expect(validation.errors.some(e => e.field === 'problem' && e.code === 'MAX_LENGTH')).toBe(true)
      expect(validation.errors.some(e => e.field === 'solution' && e.code === 'MAX_LENGTH')).toBe(true)
    })

    it('should validate URL formats and reject suspicious URLs', async () => {
      const suspiciousUrlFormData = {
        ...validFormData,
        website: 'javascript:alert("xss")',
        linkedin: 'data:text/html,<script>alert("xss")</script>',
        deckLink: 'file:///etc/passwd',
        videoPitch: 'vbscript:msgbox("xss")'
      }

      const validation = ApplicationService.validateFormData(suspiciousUrlFormData)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.field === 'website' && e.code === 'INVALID_FORMAT')).toBe(true)
      expect(validation.errors.some(e => e.field === 'linkedin' && e.code === 'INVALID_FORMAT')).toBe(true)
      expect(validation.errors.some(e => e.field === 'deckLink' && e.code === 'INVALID_FORMAT')).toBe(true)
      expect(validation.errors.some(e => e.field === 'videoPitch' && e.code === 'INVALID_FORMAT')).toBe(true)
    })
  })

  describe('Webhook Integration', () => {
    it('should trigger webhook notifications on successful submission', async () => {
      let webhookCalled = false
      let webhookPayload: any = null

      server.use(
        http.post('/api/applications', () => {
          return HttpResponse.json({ id: 'test-webhook-app' }, { status: 201 })
        }),
        http.post('https://hooks.test.com/webhook', async ({ request }) => {
          webhookCalled = true
          webhookPayload = await request.json()
          return HttpResponse.json({ success: true })
        })
      )

      await ApplicationService.submitApplication(validFormData)

      // Give webhook time to be called
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(webhookCalled).toBe(true)
      expect(webhookPayload).toMatchObject({
        text: expect.stringContaining('Test Company'),
        application: expect.objectContaining({
          companyName: 'Test Company',
          founderName: 'John Doe'
        }),
        source: 'apply_api',
        env: 'test'
      })
    })

    it('should handle webhook failures gracefully without affecting submission', async () => {
      server.use(
        http.post('/api/applications', () => {
          return HttpResponse.json({ id: 'test-webhook-fail' }, { status: 201 })
        }),
        http.post('https://hooks.test.com/webhook', () => {
          return HttpResponse.json(
            { error: 'Webhook service unavailable' },
            { status: 500 }
          )
        })
      )

      const result = await ApplicationService.submitApplication(validFormData)

      // Submission should still succeed even if webhook fails
      expect(result.success).toBe(true)
      expect(result.id).toBe('test-webhook-fail')
    })
  })

  describe('Error Recovery and Resilience', () => {
    it('should handle network timeouts with proper error messages', async () => {
      server.use(
        http.post('/api/applications', () => {
          // Simulate timeout by delaying response beyond timeout limit
          return new Promise(() => {}) // Never resolves
        })
      )

      const result = await ApplicationService.submitApplication(validFormData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('timed out')
    })

    it('should handle partial failures in file upload + submission flow', async () => {
      const testFile = createTestFile('test-deck.pdf', 'application/pdf', 1024)
      const formDataWithFile = {
        ...validFormData,
        deckFile: testFile,
        deckLink: ''
      }

      // File upload succeeds but application submission fails
      server.use(
        http.post('/api/upload/signed-url', () => {
          return HttpResponse.json({
            uploadUrl: 'https://storage.googleapis.com/signed-upload-url',
            fileRef: 'applications/uploads/test-deck.pdf',
            expiresAt: new Date(Date.now() + 600000).toISOString(),
            maxSize: 25 * 1024 * 1024,
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
          })
        }),
        http.put('https://storage.googleapis.com/signed-upload-url', () => {
          return new HttpResponse(null, { status: 200 })
        }),
        http.post('/api/applications', () => {
          return HttpResponse.json(
            { error: 'Database connection failed' },
            { status: 500 }
          )
        })
      )

      const result = await ApplicationService.submitApplication(formDataWithFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Server error')
    })

    it('should provide helpful error messages for common issues', async () => {
      // Test various error scenarios
      const errorScenarios = [
        {
          status: 400,
          response: { error: 'Your full name is required.' },
          expectedError: 'Your full name is required.'
        },
        {
          status: 401,
          response: { error: 'Unauthorized' },
          expectedError: 'Authentication required'
        },
        {
          status: 429,
          response: { error: 'Rate limited', retryAfter: 30 },
          expectedError: 'Too many requests'
        },
        {
          status: 500,
          response: { error: 'Internal server error' },
          expectedError: 'Server error occurred'
        }
      ]

      for (const scenario of errorScenarios) {
        server.use(
          http.post('/api/applications', () => {
            return HttpResponse.json(scenario.response, { status: scenario.status })
          })
        )

        const result = await ApplicationService.submitApplication(validFormData)

        expect(result.success).toBe(false)
        expect(result.error).toContain(scenario.expectedError)
      }
    })
  })
})