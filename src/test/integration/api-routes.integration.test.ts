/**
 * API Routes Integration Tests
 * 
 * Tests the actual API endpoints with real request/response cycles:
 * - /api/applications - Application submission endpoint
 * - /api/upload/signed-url - File upload signed URL generation
 * 
 * These tests verify the API layer works correctly with proper validation,
 * error handling, and response formatting.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as applicationsPost } from '@/app/api/applications/route'
import { POST as uploadPost } from '@/app/api/upload/signed-url/route'

// Mock Firebase Admin SDK
const mockFirestore = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({
      id: 'test-app-id',
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
  getSignedUrl: vi.fn().mockResolvedValue(['https://storage.googleapis.com/signed-url'])
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

// Mock email queue
vi.mock('@/lib/mail/enqueueEmail', () => ({
  enqueueEmail: vi.fn().mockResolvedValue({ messageId: 'test-message-id' })
}))

describe('API Routes Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset Firestore mocks
    mockFirestore.collection.mockReturnValue({
      doc: vi.fn(() => ({
        id: 'test-app-id',
        set: vi.fn().mockResolvedValue(undefined)
      }))
    })
    
    // Mock applications_meta collection for rate limiting
    const mockMetaDoc = {
      get: vi.fn().mockResolvedValue({
        exists: false,
        get: vi.fn()
      }),
      set: vi.fn().mockResolvedValue(undefined)
    }
    
    mockFirestore.collection.mockImplementation((collectionName: string) => {
      if (collectionName === 'applications_meta') {
        return {
          doc: vi.fn(() => mockMetaDoc)
        }
      }
      return {
        doc: vi.fn(() => ({
          id: 'test-app-id',
          set: vi.fn().mockResolvedValue(undefined)
        }))
      }
    })
  })

  describe('/api/applications endpoint', () => {
    const validPayload = {
      founderName: 'John Doe',
      founderEmail: 'john@example.com',
      role: 'CEO',
      phone: '+1234567890',
      linkedin: 'https://linkedin.com/in/johndoe',
      companyName: 'Test Company',
      companyUrl: 'https://testcompany.com',
      stage: 'seed',
      industry: 'enterprise',
      oneLineDescription: 'We solve enterprise problems',
      problem: 'Enterprises struggle with data management',
      solution: 'Our AI platform automates data processing',
      traction: 'customers',
      revenue: '100k-500k',
      deckUrl: 'https://example.com/deck.pdf',
      videoPitch: 'https://youtube.com/watch?v=123',
      enterpriseEngagement: 'We have active pilots with Fortune 500 companies',
      keyHighlights: 'Strong team, proven product-market fit',
      capitalRaised: 'yes',
      capitalRaisedAmount: '250k',
      capitalSought: '1m-3m',
      signature: 'John Doe',
      accuracyConfirm: true,
      understandingConfirm: true,
      websiteHoneypot: ''
    }

    it('should successfully process valid application submission', async () => {
      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(validPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await applicationsPost(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.id).toBe('test-app-id')
    })

    it('should validate required fields and return specific error messages', async () => {
      const invalidPayload = {
        ...validPayload,
        founderName: '',
        founderEmail: 'invalid-email',
        companyName: ''
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(invalidPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await applicationsPost(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('required')
    })

    it('should enforce rate limiting', async () => {
      // Mock rate limiting scenario
      mockFirestore.runTransaction.mockRejectedValueOnce(
        new Error('Please wait 30 seconds before submitting again.')
      )

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(validPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await applicationsPost(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('30 seconds')
    })

    it('should detect honeypot spam attempts', async () => {
      const spamPayload = {
        ...validPayload,
        websiteHoneypot: 'spam-content'
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(spamPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await applicationsPost(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Spam detected.')
    })

    it('should handle file references in applications', async () => {
      const payloadWithFile = {
        ...validPayload,
        deckUrl: '', // Clear URL
        deckFileRef: 'applications/uploads/test-deck.pdf'
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(payloadWithFile),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await applicationsPost(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
    })

    it('should validate URL formats', async () => {
      const invalidUrlPayload = {
        ...validPayload,
        companyUrl: 'not-a-valid-url',
        linkedin: 'also-not-valid',
        deckUrl: 'javascript:alert("xss")'
      }

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(invalidUrlPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await applicationsPost(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('valid')
    })

    it('should handle authentication tokens when provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(validPayload),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await applicationsPost(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid-token')
    })

    it('should handle invalid JSON payloads', async () => {
      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: 'invalid-json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await applicationsPost(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Invalid JSON payload.')
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockFirestore.collection.mockReturnValue({
        doc: vi.fn(() => ({
          id: 'test-app-id',
          set: vi.fn().mockRejectedValue(new Error('Database connection failed'))
        }))
      })

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(validPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await applicationsPost(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Failed to persist')
    })

    it('should trigger email notifications', async () => {
      const { enqueueEmail } = await import('@/lib/mail/enqueueEmail')

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(validPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await applicationsPost(request)

      expect(enqueueEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.arrayContaining(['test@thearenafund.com']),
          subject: expect.stringContaining('Test Company'),
          text: expect.stringContaining('COMPANY OVERVIEW'),
          html: expect.stringContaining('Company Overview')
        })
      )
    })
  })

  describe('/api/upload/signed-url endpoint', () => {
    const validUploadRequest = {
      fileName: 'test-deck.pdf',
      fileType: 'application/pdf',
      fileSize: 1024 * 1024 // 1MB
    }

    it('should generate signed URL for valid file upload request', async () => {
      mockFile.getSignedUrl.mockResolvedValue(['https://storage.googleapis.com/signed-upload-url'])

      const request = new NextRequest('http://localhost:3000/api/upload/signed-url', {
        method: 'POST',
        body: JSON.stringify(validUploadRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await uploadPost(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('uploadUrl')
      expect(data).toHaveProperty('fileRef')
      expect(data).toHaveProperty('expiresAt')
      expect(data).toHaveProperty('maxSize')
      expect(data).toHaveProperty('allowedTypes')
      expect(data.uploadUrl).toBe('https://storage.googleapis.com/signed-upload-url')
    })

    it('should validate required fields', async () => {
      const invalidRequest = {
        fileName: '',
        fileType: ''
      }

      const request = new NextRequest('http://localhost:3000/api/upload/signed-url', {
        method: 'POST',
        body: JSON.stringify(invalidRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await uploadPost(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('required')
    })

    it('should validate file types', async () => {
      const invalidTypeRequest = {
        ...validUploadRequest,
        fileType: 'application/x-executable'
      }

      const request = new NextRequest('http://localhost:3000/api/upload/signed-url', {
        method: 'POST',
        body: JSON.stringify(invalidTypeRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await uploadPost(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Invalid file type')
      expect(data).toHaveProperty('allowedTypes')
    })

    it('should validate file size limits', async () => {
      const largeSizeRequest = {
        ...validUploadRequest,
        fileSize: 30 * 1024 * 1024 // 30MB, exceeds 25MB limit
      }

      const request = new NextRequest('http://localhost:3000/api/upload/signed-url', {
        method: 'POST',
        body: JSON.stringify(largeSizeRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await uploadPost(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('exceeds maximum limit')
      expect(data).toHaveProperty('maxSize')
    })

    it('should handle Google Cloud Storage errors', async () => {
      mockFile.getSignedUrl.mockRejectedValue(new Error('Storage service unavailable'))

      const request = new NextRequest('http://localhost:3000/api/upload/signed-url', {
        method: 'POST',
        body: JSON.stringify(validUploadRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await uploadPost(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Storage service unavailable')
    })

    it('should sanitize file names for security', async () => {
      const maliciousNameRequest = {
        ...validUploadRequest,
        fileName: '../../../etc/passwd.pdf'
      }

      const request = new NextRequest('http://localhost:3000/api/upload/signed-url', {
        method: 'POST',
        body: JSON.stringify(maliciousNameRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await uploadPost(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.fileRef).not.toContain('../')
      expect(data.fileRef).toMatch(/^applications\/uploads\/\d+-.*\.pdf$/)
    })

    it('should set appropriate expiration times', async () => {
      const request = new NextRequest('http://localhost:3000/api/upload/signed-url', {
        method: 'POST',
        body: JSON.stringify(validUploadRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await uploadPost(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('expiresAt')
      
      const expirationTime = new Date(data.expiresAt).getTime()
      const now = Date.now()
      const tenMinutes = 10 * 60 * 1000
      
      expect(expirationTime).toBeGreaterThan(now)
      expect(expirationTime).toBeLessThanOrEqual(now + tenMinutes + 1000) // Allow 1s tolerance
    })

    it('should handle different allowed file types', async () => {
      const fileTypes = [
        { type: 'application/pdf', expected: true },
        { type: 'image/jpeg', expected: true },
        { type: 'image/png', expected: true },
        { type: 'text/plain', expected: false },
        { type: 'application/zip', expected: false }
      ]

      for (const { type, expected } of fileTypes) {
        const testRequest = {
          ...validUploadRequest,
          fileType: type
        }

        const request = new NextRequest('http://localhost:3000/api/upload/signed-url', {
          method: 'POST',
          body: JSON.stringify(testRequest),
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const response = await uploadPost(request)
        
        if (expected) {
          expect(response.status).toBe(200)
        } else {
          expect(response.status).toBe(400)
          const data = await response.json()
          expect(data.error).toContain('Invalid file type')
        }
      }
    })
  })
})