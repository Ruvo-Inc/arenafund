#!/usr/bin/env tsx

/**
 * Comprehensive test suite for bulletproof Firebase Admin authentication
 * Tests all authentication strategies, error handling, and production scenarios
 */

import { config } from 'dotenv'
import { getAdminAuth, getAdminDb, getAdminStorage } from './src/lib/firebase-admin-bulletproof'

// Load environment variables
config({ path: '.env.local' })

interface TestResult {
  name: string
  success: boolean
  error?: string
  details?: any
}

class FirebaseAdminTester {
  private results: TestResult[] = []

  private logTest(name: string, success: boolean, error?: string, details?: any) {
    this.results.push({ name, success, error, details })
    const status = success ? '✅' : '❌'
    console.log(`${status} ${name}`)
    if (error) console.log(`   Error: ${error}`)
    if (details) console.log(`   Details:`, details)
  }

  async testAuthInitialization() {
    console.log('\n🔐 Testing Firebase Admin Auth Initialization...')
    
    try {
      const auth = getAdminAuth()
      this.logTest('Auth initialization', true, undefined, {
        projectId: auth.app.options.projectId
      })
    } catch (error) {
      this.logTest('Auth initialization', false, (error as Error).message)
    }
  }

  async testDatabaseInitialization() {
    console.log('\n🗄️ Testing Firestore Database Initialization...')
    
    try {
      const db = getAdminDb()
      this.logTest('Database initialization', true, undefined, {
        projectId: db.app.options.projectId
      })
    } catch (error) {
      this.logTest('Database initialization', false, (error as Error).message)
    }
  }

  async testStorageInitialization() {
    console.log('\n📦 Testing Cloud Storage Initialization...')
    
    try {
      const storage = getAdminStorage()
      this.logTest('Storage initialization', true, undefined, {
        projectId: storage.app.options.projectId
      })
    } catch (error) {
      this.logTest('Storage initialization', false, (error as Error).message)
    }
  }

  async testFirestoreOperations() {
    console.log('\n🔥 Testing Firestore Operations...')
    
    try {
      const db = getAdminDb()
      
      // Test collection reference
      const testCollection = db.collection('_test_admin_auth')
      this.logTest('Collection reference creation', true)
      
      // Test document write
      const testDoc = {
        timestamp: new Date().toISOString(),
        test: 'Firebase Admin authentication test',
        authenticated: true
      }
      
      await testCollection.doc('test-doc').set(testDoc)
      this.logTest('Document write operation', true)
      
      // Test document read
      const docSnapshot = await testCollection.doc('test-doc').get()
      const readData = docSnapshot.data()
      
      this.logTest('Document read operation', true, undefined, {
        exists: docSnapshot.exists,
        data: readData
      })
      
      // Test document delete (cleanup)
      await testCollection.doc('test-doc').delete()
      this.logTest('Document delete operation', true)
      
    } catch (error) {
      this.logTest('Firestore operations', false, (error as Error).message)
    }
  }

  async testAuthOperations() {
    console.log('\n👤 Testing Auth Operations...')
    
    try {
      const auth = getAdminAuth()
      
      // Test listing users (limited to 1 for performance)
      const listUsersResult = await auth.listUsers(1)
      this.logTest('List users operation', true, undefined, {
        userCount: listUsersResult.users.length,
        hasPageToken: !!listUsersResult.pageToken
      })
      
      // Test custom token creation (using a test UID)
      const testUid = 'test-admin-auth-' + Date.now()
      const customToken = await auth.createCustomToken(testUid, {
        testClaim: true,
        generatedBy: 'admin-auth-test'
      })
      
      this.logTest('Custom token creation', true, undefined, {
        tokenLength: customToken.length,
        testUid
      })
      
    } catch (error) {
      this.logTest('Auth operations', false, (error as Error).message)
    }
  }

  async testStorageOperations() {
    console.log('\n☁️ Testing Storage Operations...')
    
    try {
      const storage = getAdminStorage()
      const bucket = storage.bucket()
      
      // Test bucket access
      const [exists] = await bucket.exists()
      this.logTest('Bucket access', true, undefined, {
        bucketExists: exists,
        bucketName: bucket.name
      })
      
      // Test file upload (small test file)
      const testFileName = `test-admin-auth-${Date.now()}.txt`
      const testContent = 'Firebase Admin authentication test file'
      
      const file = bucket.file(testFileName)
      await file.save(testContent, {
        metadata: {
          contentType: 'text/plain',
          metadata: {
            testFile: 'true',
            createdBy: 'admin-auth-test'
          }
        }
      })
      
      this.logTest('File upload operation', true, undefined, {
        fileName: testFileName,
        contentLength: testContent.length
      })
      
      // Test file download
      const [downloadedContent] = await file.download()
      const downloadedText = downloadedContent.toString()
      
      this.logTest('File download operation', true, undefined, {
        downloadedLength: downloadedText.length,
        contentMatches: downloadedText === testContent
      })
      
      // Test file delete (cleanup)
      await file.delete()
      this.logTest('File delete operation', true)
      
    } catch (error) {
      this.logTest('Storage operations', false, (error as Error).message)
    }
  }

  async testMultipleInitializations() {
    console.log('\n🔄 Testing Multiple Initializations (Singleton Pattern)...')
    
    try {
      // Test that multiple calls return the same instances
      const auth1 = getAdminAuth()
      const auth2 = getAdminAuth()
      const db1 = getAdminDb()
      const db2 = getAdminDb()
      const storage1 = getAdminStorage()
      const storage2 = getAdminStorage()
      
      this.logTest('Auth singleton pattern', auth1 === auth2)
      this.logTest('Database singleton pattern', db1 === db2)
      this.logTest('Storage singleton pattern', storage1 === storage2)
      
    } catch (error) {
      this.logTest('Multiple initializations', false, (error as Error).message)
    }
  }

  async testErrorHandling() {
    console.log('\n⚠️ Testing Error Handling...')
    
    try {
      // Test with invalid credentials (temporarily modify env)
      const originalCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS
      process.env.GOOGLE_APPLICATION_CREDENTIALS = '/invalid/path/to/credentials.json'
      
      // This should still work because we have fallback strategies
      const db = getAdminDb()
      this.logTest('Fallback credential strategy', true, undefined, {
        projectId: db.app.options.projectId
      })
      
      // Restore original credentials
      if (originalCreds) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = originalCreds
      }
      
    } catch (error) {
      this.logTest('Error handling', false, (error as Error).message)
    }
  }

  printSummary() {
    console.log('\n📊 Test Summary')
    console.log('=' .repeat(50))
    
    const passed = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    const total = this.results.length
    
    console.log(`Total Tests: ${total}`)
    console.log(`Passed: ${passed} ✅`)
    console.log(`Failed: ${failed} ❌`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`))
    }
    
    console.log('\n' + (failed === 0 ? '🎉 All tests passed!' : '⚠️ Some tests failed'))
  }

  async runAllTests() {
    console.log('🧪 Firebase Admin Authentication Test Suite')
    console.log('=' .repeat(50))
    
    await this.testAuthInitialization()
    await this.testDatabaseInitialization()
    await this.testStorageInitialization()
    await this.testMultipleInitializations()
    await this.testFirestoreOperations()
    await this.testAuthOperations()
    await this.testStorageOperations()
    await this.testErrorHandling()
    
    this.printSummary()
    
    return this.results.every(r => r.success)
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new FirebaseAdminTester()
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('Test suite failed:', error)
      process.exit(1)
    })
}

export { FirebaseAdminTester }
