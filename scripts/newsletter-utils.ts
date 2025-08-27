#!/usr/bin/env npx tsx

/**
 * Newsletter Utilities Script
 * 
 * This script provides utilities for managing and testing the newsletter system.
 * Run with: npx tsx scripts/newsletter-utils.ts [command] [options]
 */

import { getActiveSubscribers, getSubscriberStats, createSubscriber } from '../src/lib/newsletter-db-schema';
import { testNewsletterEmail, sendArticleNotification, sendWelcomeEmail } from '../src/lib/newsletter-email';

// Command line argument parsing
const args = process.argv.slice(2);
const command = args[0];

async function showHelp() {
  console.log(`
Newsletter Utilities

Usage: npx tsx scripts/newsletter-utils.ts [command] [options]

Commands:
  stats                           Show subscriber statistics
  list [limit]                   List active subscribers (limit: default 10)
  test-email <email> [type]      Send test email (type: basic|welcome|article)
  add-subscriber <email> <name>  Add a test subscriber
  send-article <article-data>    Send article notification (JSON string)
  help                          Show this help message

Examples:
  npx tsx scripts/newsletter-utils.ts stats
  npx tsx scripts/newsletter-utils.ts test-email test@example.com basic
  npx tsx scripts/newsletter-utils.ts add-subscriber "test@example.com" "Test User"
  npx tsx scripts/newsletter-utils.ts list 5
`);
}

async function showStats() {
  try {
    console.log('📊 Newsletter Subscriber Statistics\n');
    
    const stats = await getSubscriberStats();
    
    console.log(`Total Subscribers: ${stats.total}`);
    console.log(`Active: ${stats.active}`);
    console.log(`Unsubscribed: ${stats.unsubscribed}`);
    console.log(`Bounced: ${stats.bounced}`);
    console.log('');
    
    console.log('By Source:');
    Object.entries(stats.bySource).forEach(([source, count]) => {
      console.log(`  ${source}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to get stats:', error);
    process.exit(1);
  }
}

async function listSubscribers(limit: number = 10) {
  try {
    console.log(`📋 Active Subscribers (showing up to ${limit})\n`);
    
    const subscribers = await getActiveSubscribers(limit);
    
    if (subscribers.length === 0) {
      console.log('No active subscribers found.');
      return;
    }
    
    subscribers.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.name} (${sub.email})`);
      console.log(`   Source: ${sub.source}`);
      console.log(`   Subscribed: ${sub.subscribedAt.toDate().toLocaleDateString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Failed to list subscribers:', error);
    process.exit(1);
  }
}

async function sendTestEmail(email: string, type: string = 'basic') {
  try {
    console.log(`📧 Sending ${type} test email to ${email}...\n`);
    
    let result;
    
    switch (type) {
      case 'basic':
        result = await testNewsletterEmail(email);
        break;
        
      case 'welcome':
        const mockSubscriber = {
          id: 'test-subscriber-' + Date.now(),
          name: 'Test User',
          email: email,
          status: 'active' as const,
          subscribedAt: new Date() as any,
          source: 'test',
          metadata: {
            lastUpdated: new Date() as any,
          },
          unsubscribeToken: 'test-token-' + Date.now(),
        };
        result = await sendWelcomeEmail(mockSubscriber);
        break;
        
      case 'article':
        const testArticle = {
          articleId: 'test-article-' + Date.now(),
          title: 'Test Article: Newsletter System Verification',
          excerpt: 'This is a test article notification sent via the newsletter utilities script to verify that the email infrastructure is working correctly.',
          slug: 'test-newsletter-system-verification',
          publishDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          category: 'System Test',
          author: 'Newsletter System',
          readTimeMinutes: 2,
        };
        result = await testNewsletterEmail(email, testArticle);
        break;
        
      default:
        console.error('❌ Invalid test type. Use: basic, welcome, or article');
        process.exit(1);
    }
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      if (result.messageId) {
        console.log(`Message ID: ${result.messageId}`);
      }
    } else {
      console.error('❌ Failed to send test email:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    process.exit(1);
  }
}

async function addTestSubscriber(email: string, name: string) {
  try {
    console.log(`👤 Adding test subscriber: ${name} (${email})...\n`);
    
    const result = await createSubscriber({
      name,
      email,
      source: 'test-script',
      userAgent: 'Newsletter Utils Script',
      ipAddress: '127.0.0.1',
    });
    
    if (result.success) {
      console.log('✅ Test subscriber added successfully!');
      console.log(`Subscriber ID: ${result.subscriberId}`);
    } else {
      console.error('❌ Failed to add subscriber:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Failed to add subscriber:', error);
    process.exit(1);
  }
}

async function sendArticleNotificationFromScript(articleDataJson: string) {
  try {
    console.log('📰 Sending article notification...\n');
    
    const articleData = JSON.parse(articleDataJson);
    
    // Validate required fields
    const requiredFields = ['articleId', 'title', 'excerpt', 'slug', 'publishDate', 'category'];
    const missingFields = requiredFields.filter(field => !articleData[field]);
    
    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
      process.exit(1);
    }
    
    const result = await sendArticleNotification(articleData);
    
    if (result.success) {
      console.log('✅ Article notification sent successfully!');
      console.log(`Total subscribers: ${result.totalSubscribers}`);
      console.log(`Successful: ${result.successCount}`);
      console.log(`Failed: ${result.failureCount}`);
      
      if (result.errors.length > 0) {
        console.log('\n⚠️  Errors:');
        result.errors.forEach(error => console.log(`  ${error}`));
      }
    } else {
      console.error('❌ Failed to send article notification');
      console.error(`Successful: ${result.successCount}`);
      console.error(`Failed: ${result.failureCount}`);
      
      if (result.errors.length > 0) {
        console.log('\nErrors:');
        result.errors.forEach(error => console.log(`  ${error}`));
      }
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Failed to send article notification:', error);
    process.exit(1);
  }
}

// Main command handler
async function main() {
  if (!command || command === 'help') {
    await showHelp();
    return;
  }
  
  switch (command) {
    case 'stats':
      await showStats();
      break;
      
    case 'list':
      const limit = args[1] ? parseInt(args[1]) : 10;
      await listSubscribers(limit);
      break;
      
    case 'test-email':
      if (!args[1]) {
        console.error('❌ Email address is required');
        process.exit(1);
      }
      await sendTestEmail(args[1], args[2]);
      break;
      
    case 'add-subscriber':
      if (!args[1] || !args[2]) {
        console.error('❌ Email and name are required');
        process.exit(1);
      }
      await addTestSubscriber(args[1], args[2]);
      break;
      
    case 'send-article':
      if (!args[1]) {
        console.error('❌ Article data JSON is required');
        process.exit(1);
      }
      await sendArticleNotificationFromScript(args[1]);
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      await showHelp();
      process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});