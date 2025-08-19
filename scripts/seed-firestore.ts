#!/usr/bin/env tsx

/**
 * Production-grade Firestore seeding script using Firebase Admin SDK
 * 
 * This script bypasses Firestore security rules using admin privileges
 * to seed test data for development and testing purposes.
 * 
 * Usage: npm run seed:firestore
 */

// Load environment variables from .env.local
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { getAdminDb, COLLECTIONS } from '../src/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

interface RaiseDocument {
  title: string
  subtitle: string
  status: 'open' | 'closed' | 'coming-soon'
  spvOpen: boolean
  spvExternalUrl: string
  cfOpen: boolean
  cfExternalUrl: string
  minCheck: number
  maxCheck: number
  allocationUsd: number
  closesAt: string
  tags: string[]
  highlights: string[]
  createdAt: string
  updatedAt: string
}

const SEED_DATA: Record<string, RaiseDocument> = {
  'acme-seed': {
    title: 'AcmeAI Seed SPV',
    subtitle: 'Agent for finance ops',
    status: 'open',
    spvOpen: true,
    spvExternalUrl: 'https://app.sydecar.io/acme-seed-spv',
    cfOpen: true,
    cfExternalUrl: 'https://republic.com/acme-ai',
    minCheck: 10000,
    maxCheck: 250000,
    allocationUsd: 1500000,
    closesAt: '2025-09-03T08:44:45.000Z',
    tags: ['B2B AI', 'Finance Ops'],
    highlights: [
      'Validated with three Fortune 500 buyers',
      'Pilot-to-PO motion scoped with Arena GTM'
    ],
    createdAt: '2025-08-13T08:44:45.000Z',
    updatedAt: '2025-08-13T08:44:45.000Z'
  },
  'current': {
    title: 'AcmeAI Seed SPV',
    subtitle: 'Agent for finance ops',
    status: 'open',
    spvOpen: true,
    spvExternalUrl: 'https://app.sydecar.io/acme-seed-spv',
    cfOpen: true,
    cfExternalUrl: 'https://republic.com/acme-ai',
    minCheck: 10000,
    maxCheck: 250000,
    allocationUsd: 1500000,
    closesAt: '2025-09-03T08:44:45.000Z',
    tags: ['B2B AI', 'Finance Ops'],
    highlights: [
      'Validated with three Fortune 500 buyers',
      'Pilot-to-PO motion scoped with Arena GTM'
    ],
    createdAt: '2025-08-13T08:44:45.000Z',
    updatedAt: '2025-08-13T08:44:45.000Z'
  }
}

async function seedFirestore(): Promise<void> {
  console.log('🌱 Starting Firestore seeding...')
  
  try {
    const adminDb = getAdminDb()
    const raisesRef = adminDb.collection(COLLECTIONS.RAISES)
    
    // Seed each document
    for (const [docId, data] of Object.entries(SEED_DATA)) {
      console.log(`📝 Creating document: ${docId}`)
      
      // Convert ISO strings to Firestore Timestamps
      const firestoreData = {
        ...data,
        closesAt: Timestamp.fromDate(new Date(data.closesAt)),
        createdAt: Timestamp.fromDate(new Date(data.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(data.updatedAt))
      }
      
      await raisesRef.doc(docId).set(firestoreData, { merge: true })
      console.log(`✅ Successfully created: ${docId}`)
    }
    
    // Verify seeding
    console.log('\n🔍 Verifying seeded data...')
    const snapshot = await raisesRef.get()
    console.log(`📊 Total documents in raises collection: ${snapshot.size}`)
    
    snapshot.forEach(doc => {
      const data = doc.data()
      console.log(`   - ${doc.id}: ${data.title} (${data.status})`)
    })
    
    console.log('\n🎉 Firestore seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Firestore seeding failed:', error)
    process.exit(1)
  }
}

async function main(): Promise<void> {
  try {
    await seedFirestore()
    process.exit(0)
  } catch (error) {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { seedFirestore }
