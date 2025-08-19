import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import * as fs from 'fs'
import * as path from 'path'

/**
 * BULLETPROOF FIREBASE ADMIN SDK INITIALIZATION
 * 
 * Production-grade, world-class authentication system with:
 * - Multi-strategy authentication with automatic fallback
 * - Comprehensive error handling and validation
 * - Memory-efficient singleton pattern
 * - Zero-downtime initialization
 * - Type-safe implementation
 */

interface ServiceAccountKey {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
  auth_provider_x509_cert_url: string
  client_x509_cert_url: string
  universe_domain?: string
}

let isInitialized = false
let initializationError: Error | null = null

/**
 * Initialize Firebase Admin SDK with bulletproof authentication
 * Tries multiple strategies in order of reliability
 */
function initializeFirebaseAdmin(): void {
  if (isInitialized) return
  if (initializationError) throw initializationError
  if (getApps().length > 0) {
    isInitialized = true
    return
  }

  try {
    console.log('🚀 Initializing bulletproof Firebase Admin SDK...')

    // Strategy 1: Local service account key file (most reliable)
    const serviceAccountPath = path.join(process.cwd(), 'arenafund-firebase-adminsdk.json')
    if (fs.existsSync(serviceAccountPath)) {
      console.log('🔑 Using local service account key file')
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')) as ServiceAccountKey
      
      validateServiceAccount(serviceAccount)
      
      initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          privateKey: serviceAccount.private_key,
          clientEmail: serviceAccount.client_email,
        }),
        projectId: serviceAccount.project_id,
      })
      
      console.log('✅ Firebase Admin SDK initialized with service account key')
      isInitialized = true
      return
    }

    // Strategy 2: GOOGLE_APPLICATION_CREDENTIALS
    const googleCredPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    if (googleCredPath && fs.existsSync(googleCredPath)) {
      console.log('🔑 Using GOOGLE_APPLICATION_CREDENTIALS')
      const serviceAccount = JSON.parse(fs.readFileSync(googleCredPath, 'utf8')) as ServiceAccountKey
      
      validateServiceAccount(serviceAccount)
      
      initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          privateKey: serviceAccount.private_key,
          clientEmail: serviceAccount.client_email,
        }),
        projectId: serviceAccount.project_id,
      })
      
      console.log('✅ Firebase Admin SDK initialized with GOOGLE_APPLICATION_CREDENTIALS')
      isInitialized = true
      return
    }

    // Strategy 3: Application Default Credentials
    console.log('🔑 Attempting Application Default Credentials')
    initializeApp({
      credential: applicationDefault(),
      projectId: 'arenafund',
    })
    
    console.log('✅ Firebase Admin SDK initialized with Application Default Credentials')
    isInitialized = true

  } catch (error) {
    initializationError = error as Error
    console.error('❌ Firebase Admin SDK initialization failed:', error)
    throw error
  }
}

/**
 * Validates service account key structure
 */
function validateServiceAccount(serviceAccount: any): asserts serviceAccount is ServiceAccountKey {
  const requiredFields = [
    'type', 'project_id', 'private_key_id', 'private_key',
    'client_email', 'client_id', 'auth_uri', 'token_uri'
  ]

  for (const field of requiredFields) {
    if (!serviceAccount[field]) {
      throw new Error(`Invalid service account: missing required field '${field}'`)
    }
  }

  if (serviceAccount.type !== 'service_account') {
    throw new Error(`Invalid service account: expected type 'service_account', got '${serviceAccount.type}'`)
  }

  if (!serviceAccount.private_key.includes('BEGIN PRIVATE KEY')) {
    throw new Error('Invalid service account: private_key appears to be malformed')
  }

  if (serviceAccount.project_id !== 'arenafund') {
    throw new Error(`Invalid service account: expected project_id 'arenafund', got '${serviceAccount.project_id}'`)
  }
}

// Lazy initialization - services are created on first access
let _adminAuth: ReturnType<typeof getAuth> | null = null
let _adminDb: ReturnType<typeof getFirestore> | null = null

export function getAdminAuth() {
  if (!_adminAuth) {
    initializeFirebaseAdmin()
    _adminAuth = getAuth()
  }
  return _adminAuth
}

export function getAdminDb() {
  if (!_adminDb) {
    initializeFirebaseAdmin()
    _adminDb = getFirestore()
  }
  return _adminDb
}

// Legacy exports for backward compatibility - use functions instead to avoid eager initialization
// export const adminAuth = getAdminAuth()
// export const adminDb = getAdminDb()

// Export initialization function for explicit calls
export { initializeFirebaseAdmin }

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  PROFILES: 'profiles',
  WAITLIST: 'waitlist',
  DEALS: 'deals',
  RAISES: 'raises',
  SETTINGS: 'settings',
  MAIL_QUEUE: 'mailQueue',
} as const
