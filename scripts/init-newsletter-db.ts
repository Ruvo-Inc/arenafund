#!/usr/bin/env tsx

/**
 * Newsletter Database Initialization Script
 * 
 * This script initializes the newsletter database schema in Firebase Firestore.
 * It creates the collection structure, validates the setup, and provides
 * helpful information about the database configuration.
 * 
 * Usage:
 *   npm run init-newsletter-db
 *   or
 *   npx tsx scripts/init-newsletter-db.ts
 */

import { initializeNewsletterSchema, getSubscriberStats, NEWSLETTER_COLLECTION } from '../src/lib/newsletter-db-schema';
import { getAdminDb } from '../src/lib/firebase-admin';

async function main() {
  console.log('🚀 Starting newsletter database initialization...\n');
  
  try {
    // Initialize the schema
    await initializeNewsletterSchema();
    
    // Verify the setup
    console.log('🔍 Verifying database setup...');
    
    const db = getAdminDb();
    const collection = db.collection(NEWSLETTER_COLLECTION);
    
    // Check if collection exists and is accessible
    const testQuery = await collection.limit(1).get();
    console.log('✅ Collection is accessible');
    
    // Get current statistics
    try {
      const stats = await getSubscriberStats();
      console.log('📊 Current subscriber statistics:');
      console.log(`   Total subscribers: ${stats.total}`);
      console.log(`   Active: ${stats.active}`);
      console.log(`   Unsubscribed: ${stats.unsubscribed}`);
      console.log(`   Bounced: ${stats.bounced}`);
      
      if (Object.keys(stats.bySource).length > 0) {
        console.log('   By source:');
        Object.entries(stats.bySource).forEach(([source, count]) => {
          console.log(`     ${source}: ${count}`);
        });
      }
    } catch (error) {
      console.log('📊 No existing subscribers found (this is normal for new setups)');
    }
    
    console.log('\n✅ Newsletter database initialization completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy Firestore indexes: firebase deploy --only firestore:indexes');
    console.log('2. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('3. Test the newsletter subscription API endpoint');
    console.log('4. Verify email uniqueness validation is working');
    
    console.log('\n🔧 Database Configuration:');
    console.log(`   Collection: ${NEWSLETTER_COLLECTION}`);
    console.log('   Indexes: email, status, subscribedAt, source');
    console.log('   Security: Server-side only access');
    console.log('   Features: Email uniqueness, metadata tracking, unsubscribe tokens');
    
  } catch (error) {
    console.error('❌ Newsletter database initialization failed:', error);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  });
}

export { main as initNewsletterDatabase };