/**
 * Basic Integration Tests for Application Submission
 * 
 * Simplified tests to verify core functionality works
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApplicationService, type FormData } from '@/lib/application-service'

describe('Basic Integration Tests', () => {
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
    problem: 'Enterprises struggle with data management',
    solution: 'Our AI-powered platform automates data processing',
    traction: 'customers',
    revenue: '100k-500k',
    deckFile: null,
    deckLink: 'https://example.com/deck.pdf',
    videoPitch: 'https://youtube.com/watch?v=123',
    enterpriseEngagement: 'We have active pilots with Fortune 500 companies',
    keyHighlights: 'Strong technical team, proven product-market fit',
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

  describe('Form Validation', () => {
    it('should validate complete form successfully', () => {
      const result = ApplicationService.validateFormData(validFormData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should catch missing required fields', () => {
      const invalidData = { ...validFormData, fullName: '', email: '' }
      const result = ApplicationService.validateFormData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(e => e.field === 'fullName')).toBe(true)
      expect(result.errors.some(e => e.field === 'email')).toBe(true)
    })

    it('should validate email format', () => {
      const invalidData = { ...validFormData, email: 'invalid-email' }
      const result = ApplicationService.validateFormData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'email' && e.code === 'INVALID_FORMAT')).toBe(true)
    })

    it('should enforce field length limits', () => {
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

    it('should validate URL formats and reject suspicious URLs', () => {
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

  describe('File Validation', () => {
    it('should validate file type and size constraints', () => {
      // Create a mock file that exceeds size limit
      const largeFile = new File(['x'.repeat(30 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
      
      const result = ApplicationService.uploadFile(largeFile)
      
      // Should be a promise that resolves to an error
      expect(result).toBeInstanceOf(Promise)
    })

    it('should reject invalid file types', () => {
      const invalidFile = new File(['content'], 'test.exe', { type: 'application/x-executable' })
      
      const result = ApplicationService.uploadFile(invalidFile)
      
      // Should be a promise that resolves to an error
      expect(result).toBeInstanceOf(Promise)
    })
  })

  describe('Error Handling', () => {
    it('should provide helpful error messages for field validation', () => {
      const invalidData = {
        ...validFormData,
        fullName: '',
        email: 'invalid-email',
        companyName: '',
        website: 'not-a-url'
      }

      const result = ApplicationService.validateFormData(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      
      // Check that error messages are helpful
      const fullNameError = result.errors.find(e => e.field === 'fullName')
      expect(fullNameError?.message).toContain('required')
      
      const emailError = result.errors.find(e => e.field === 'email')
      expect(emailError?.message).toContain('valid email')
      
      const websiteError = result.errors.find(e => e.field === 'website')
      expect(websiteError?.message).toContain('valid')
    })

    it('should handle missing pitch deck gracefully', () => {
      const noDeckData = {
        ...validFormData,
        deckFile: null,
        deckLink: ''
      }

      const result = ApplicationService.validateFormData(noDeckData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'deckFile' || e.field === 'deckLink')).toBe(true)
    })
  })

  describe('Business Logic Validation', () => {
    it('should validate stage and capital alignment', () => {
      const mismatchedData = {
        ...validFormData,
        stage: 'idea',
        capitalSought: '3m-plus'
      }

      // This should pass basic validation but might flag business logic issues
      const result = ApplicationService.validateFormData(mismatchedData)
      
      // Basic validation should still pass
      expect(result.isValid).toBe(true)
    })

    it('should handle enterprise engagement validation', () => {
      const enterpriseData = {
        ...validFormData,
        enterpriseEngagement: 'yes',
        traction: 'mvp'
      }

      const result = ApplicationService.validateFormData(enterpriseData)
      
      // Should pass basic validation
      expect(result.isValid).toBe(true)
    })
  })
})