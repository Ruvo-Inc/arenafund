/**
 * Simple test script to create a mail queue document in Firestore
 * This will trigger the Cloud Functions to test the Gmail mailer system
 */

const admin = require('firebase-admin');

// Use service account key for authentication
const serviceAccount = require('./arenafund-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'arenafund'
});

const db = admin.firestore();

async function createTestEmail() {
  try {
    console.log('🚀 Creating test email in Firestore...');
    
    const testEmail = {
      to: ['test@example.com'],
      cc: [],
      bcc: [],
      subject: 'Production Test - Arena Fund Gmail Mailer',
      html: '<h1>Gmail Mailer Test</h1><p>This email tests the production-grade Arena Fund Gmail mailer system.</p>',
      text: 'This is a production test of the Arena Fund Gmail mailer system.',
      replyTo: null,
      fromName: 'Arena Fund Test',
      messageIdHint: 'test-' + Date.now(),
      metadata: { 
        type: 'production_test', 
        timestamp: new Date().toISOString()
      },
      status: 'queued',
      attempts: 0,
      lastError: null,
      leaseOwner: null,
      leaseExpiresAt: null,
      notBefore: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      env: 'dev'
    };
    
    const docRef = await db.collection('mailQueue').add(testEmail);
    console.log('✅ Test email created with ID:', docRef.id);
    console.log('📧 Subject:', testEmail.subject);
    console.log('📬 Recipients:', testEmail.to.join(', '));
    
    console.log('\n⏳ Cloud Functions should now process this email...');
    console.log('🔍 Check Cloud Functions logs with:');
    console.log('   gcloud logging read "resource.type=cloud_function" --limit=20');
    
    // Wait and check status
    setTimeout(async () => {
      try {
        const doc = await docRef.get();
        const data = doc.data();
        
        console.log('\n📊 EMAIL STATUS UPDATE:');
        console.log('Status:', data.status);
        console.log('Attempts:', data.attempts);
        console.log('Last Error:', data.lastError || 'None');
        console.log('Lease Owner:', data.leaseOwner || 'None');
        
        if (data.status === 'sent') {
          console.log('🎉 SUCCESS: Email sent successfully!');
        } else if (data.status === 'failed') {
          console.log('❌ FAILED: Email failed to send');
        } else {
          console.log('⏳ Still processing...');
        }
        
      } catch (error) {
        console.error('Error checking status:', error.message);
      }
    }, 15000);
    
  } catch (error) {
    console.error('❌ Failed to create test email:', error.message);
  }
}

createTestEmail();
