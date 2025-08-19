#!/usr/bin/env node

/**
 * Simple Firebase Admin authentication test
 * Tests basic functionality without complex imports
 */

require('dotenv').config({ path: '.env.local' })

async function testFirebaseAdmin() {
  console.log('🧪 Simple Firebase Admin Authentication Test')
  console.log('=' .repeat(50))
  
  try {
    // Import the bulletproof Firebase Admin module
    const { getAdminAuth, getAdminDb, getAdminStorage } = require('./src/lib/firebase-admin-bulletproof.js')
    
    console.log('✅ Successfully imported Firebase Admin functions')
    
    // Test Auth initialization
    const auth = getAdminAuth()
    console.log('✅ Auth initialized - Project ID:', auth.app.options.projectId)
    
    // Test Database initialization
    const db = getAdminDb()
    console.log('✅ Database initialized - Project ID:', db.app.options.projectId)
    
    // Test Storage initialization
    const storage = getAdminStorage()
    console.log('✅ Storage initialized - Project ID:', storage.app.options.projectId)
    
    // Test singleton pattern
    const auth2 = getAdminAuth()
    const db2 = getAdminDb()
    const storage2 = getAdminStorage()
    
    console.log('✅ Singleton pattern verified:', {
      auth: auth === auth2,
      db: db === db2,
      storage: storage === storage2
    })
    
    // Test basic Firestore operation
    const testCollection = db.collection('_admin_test')
    const testDoc = {
      timestamp: new Date().toISOString(),
      test: 'Firebase Admin authentication verification',
      success: true
    }
    
    await testCollection.doc('verification').set(testDoc)
    console.log('✅ Firestore write operation successful')
    
    const docSnapshot = await testCollection.doc('verification').get()
    const readData = docSnapshot.data()
    console.log('✅ Firestore read operation successful:', {
      exists: docSnapshot.exists,
      timestamp: readData?.timestamp
    })
    
    // Cleanup
    await testCollection.doc('verification').delete()
    console.log('✅ Firestore delete operation successful')
    
    console.log('\n🎉 All Firebase Admin authentication tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Firebase Admin test failed:', error.message)
    return false
  }
}

// Run the test
testFirebaseAdmin()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Test execution failed:', error)
    process.exit(1)
  })
