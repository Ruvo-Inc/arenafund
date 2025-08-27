import { getAdminDb } from './firebase-admin';
import { logSecurityEvent } from './security-logging';
import { getUserConsentHistory, withdrawConsent } from './consent-tracking';
import { Timestamp } from 'firebase-admin/firestore';

export interface DataSubjectRequest {
  id: string;
  email: string;
  requestType: 'access' | 'deletion' | 'portability' | 'rectification' | 'restriction';
  requestDate: Timestamp;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  completionDate?: Timestamp;
  requestDetails?: string;
  responseData?: any;
  verificationMethod: 'email' | 'manual' | 'authenticated';
  ipAddress?: string;
  userAgent?: string;
}

export interface UserDataExport {
  personalInformation: {
    name?: string;
    email: string;
    subscriptionDate?: string;
    subscriptionSource?: string;
    status?: string;
  };
  consentHistory: any[];
  newsletterSubscriptions: any[];
  communicationHistory: any[];
  technicalData: {
    ipAddresses: string[];
    userAgents: string[];
    lastActivity?: string;
  };
  exportDate: string;
  exportId: string;
}

/**
 * Handle GDPR/CCPA data access request
 */
export async function handleDataAccessRequest(email: string, verificationMethod: string = 'email'): Promise<UserDataExport> {
  try {
    const db = getAdminDb();
    const normalizedEmail = email.toLowerCase().trim();
    
    // Log the data access request
    logSecurityEvent('DATA_ACCESS_REQUEST', {
      email: normalizedEmail,
      verificationMethod,
      timestamp: new Date().toISOString()
    });
    
    // Collect user data from various collections
    const [
      newsletterData,
      consentHistory,
      communicationData
    ] = await Promise.all([
      getNewsletterData(normalizedEmail),
      getUserConsentHistory(normalizedEmail),
      getCommunicationHistory(normalizedEmail)
    ]);
    
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const userDataExport: UserDataExport = {
      personalInformation: {
        email: normalizedEmail,
        name: newsletterData?.name,
        subscriptionDate: newsletterData?.subscribedAt?.toDate().toISOString(),
        subscriptionSource: newsletterData?.source,
        status: newsletterData?.status
      },
      consentHistory,
      newsletterSubscriptions: newsletterData ? [newsletterData] : [],
      communicationHistory: communicationData,
      technicalData: {
        ipAddresses: extractIPAddresses(consentHistory, newsletterData),
        userAgents: extractUserAgents(consentHistory, newsletterData),
        lastActivity: getLastActivity(consentHistory, newsletterData)
      },
      exportDate: new Date().toISOString(),
      exportId
    };
    
    // Record the data access request
    await recordDataSubjectRequest({
      email: normalizedEmail,
      requestType: 'access',
      verificationMethod,
      responseData: { exportId, recordCount: getTotalRecordCount(userDataExport) }
    });
    
    return userDataExport;
  } catch (error) {
    console.error('Error handling data access request:', error);
    logSecurityEvent('DATA_ACCESS_REQUEST_ERROR', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw new Error('Failed to process data access request');
  }
}

/**
 * Handle GDPR/CCPA data deletion request
 */
export async function handleDataDeletionRequest(
  email: string, 
  verificationMethod: string = 'email',
  retainForLegal: boolean = true
): Promise<void> {
  try {
    const db = getAdminDb();
    const normalizedEmail = email.toLowerCase().trim();
    
    logSecurityEvent('DATA_DELETION_REQUEST', {
      email: normalizedEmail,
      verificationMethod,
      retainForLegal,
      timestamp: new Date().toISOString()
    });
    
    const batch = db.batch();
    let deletedRecords = 0;
    
    // Delete or anonymize newsletter subscription data
    const newsletterQuery = await db.collection('newsletter_subscribers')
      .where('email', '==', normalizedEmail)
      .get();
    
    newsletterQuery.docs.forEach(doc => {
      if (retainForLegal) {
        // Anonymize instead of delete for legal compliance
        batch.update(doc.ref, {
          name: '[DELETED]',
          email: `deleted_${Date.now()}@privacy-deleted.local`,
          status: 'deleted',
          'metadata.deletedAt': Timestamp.now(),
          'metadata.deletionReason': 'user_request'
        });
      } else {
        batch.delete(doc.ref);
      }
      deletedRecords++;
    });
    
    // Withdraw all consents
    await withdrawConsent(normalizedEmail, 'newsletter_subscription', 'data_deletion_request');
    
    // Delete communication history (if any)
    const communicationQuery = await db.collection('communications')
      .where('email', '==', normalizedEmail)
      .get();
    
    communicationQuery.docs.forEach(doc => {
      if (retainForLegal) {
        batch.update(doc.ref, {
          email: `deleted_${Date.now()}@privacy-deleted.local`,
          content: '[DELETED]',
          'metadata.deletedAt': Timestamp.now()
        });
      } else {
        batch.delete(doc.ref);
      }
      deletedRecords++;
    });
    
    // Execute batch deletion/anonymization
    await batch.commit();
    
    // Record the deletion request
    await recordDataSubjectRequest({
      email: normalizedEmail,
      requestType: 'deletion',
      verificationMethod,
      responseData: { 
        deletedRecords, 
        anonymized: retainForLegal,
        completedAt: new Date().toISOString()
      }
    });
    
    logSecurityEvent('DATA_DELETION_COMPLETED', {
      email: normalizedEmail,
      deletedRecords,
      anonymized: retainForLegal
    });
    
  } catch (error) {
    console.error('Error handling data deletion request:', error);
    logSecurityEvent('DATA_DELETION_REQUEST_ERROR', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw new Error('Failed to process data deletion request');
  }
}

/**
 * Handle data rectification request
 */
export async function handleDataRectificationRequest(
  email: string,
  corrections: Record<string, any>,
  verificationMethod: string = 'email'
): Promise<void> {
  try {
    const db = getAdminDb();
    const normalizedEmail = email.toLowerCase().trim();
    
    logSecurityEvent('DATA_RECTIFICATION_REQUEST', {
      email: normalizedEmail,
      corrections: Object.keys(corrections),
      verificationMethod
    });
    
    // Update newsletter subscription data
    const newsletterQuery = await db.collection('newsletter_subscribers')
      .where('email', '==', normalizedEmail)
      .get();
    
    const batch = db.batch();
    let updatedRecords = 0;
    
    newsletterQuery.docs.forEach(doc => {
      const updateData: any = {
        'metadata.lastUpdated': Timestamp.now(),
        'metadata.rectificationDate': Timestamp.now()
      };
      
      // Apply corrections
      if (corrections.name) updateData.name = corrections.name;
      if (corrections.email) updateData.email = corrections.email.toLowerCase().trim();
      
      batch.update(doc.ref, updateData);
      updatedRecords++;
    });
    
    await batch.commit();
    
    // Record the rectification request
    await recordDataSubjectRequest({
      email: normalizedEmail,
      requestType: 'rectification',
      verificationMethod,
      responseData: { 
        updatedRecords,
        corrections: Object.keys(corrections),
        completedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error handling data rectification request:', error);
    throw new Error('Failed to process data rectification request');
  }
}

// Helper functions

async function getNewsletterData(email: string) {
  const db = getAdminDb();
  const query = await db.collection('newsletter_subscribers')
    .where('email', '==', email)
    .limit(1)
    .get();
  
  return query.empty ? null : query.docs[0].data();
}

async function getCommunicationHistory(email: string) {
  const db = getAdminDb();
  const query = await db.collection('communications')
    .where('email', '==', email)
    .orderBy('timestamp', 'desc')
    .limit(100)
    .get();
  
  return query.docs.map(doc => doc.data());
}

function extractIPAddresses(consentHistory: any[], newsletterData: any): string[] {
  const ips = new Set<string>();
  
  consentHistory.forEach(consent => {
    if (consent.ipAddress) ips.add('[HASHED]'); // Don't expose actual IPs
  });
  
  if (newsletterData?.metadata?.ipAddress) {
    ips.add('[HASHED]');
  }
  
  return Array.from(ips);
}

function extractUserAgents(consentHistory: any[], newsletterData: any): string[] {
  const agents = new Set<string>();
  
  consentHistory.forEach(consent => {
    if (consent.userAgent) agents.add(consent.userAgent);
  });
  
  if (newsletterData?.metadata?.userAgent) {
    agents.add(newsletterData.metadata.userAgent);
  }
  
  return Array.from(agents);
}

function getLastActivity(consentHistory: any[], newsletterData: any): string | undefined {
  const dates: Date[] = [];
  
  consentHistory.forEach(consent => {
    if (consent.consentTimestamp) {
      dates.push(consent.consentTimestamp.toDate());
    }
  });
  
  if (newsletterData?.subscribedAt) {
    dates.push(newsletterData.subscribedAt.toDate());
  }
  
  if (dates.length === 0) return undefined;
  
  return new Date(Math.max(...dates.map(d => d.getTime()))).toISOString();
}

function getTotalRecordCount(exportData: UserDataExport): number {
  return (
    (exportData.personalInformation ? 1 : 0) +
    exportData.consentHistory.length +
    exportData.newsletterSubscriptions.length +
    exportData.communicationHistory.length
  );
}

async function recordDataSubjectRequest(request: {
  email: string;
  requestType: DataSubjectRequest['requestType'];
  verificationMethod: string;
  responseData?: any;
}): Promise<void> {
  const db = getAdminDb();
  const requestId = `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const requestRecord: DataSubjectRequest = {
    id: requestId,
    email: request.email,
    requestType: request.requestType,
    requestDate: Timestamp.now(),
    status: 'completed',
    completionDate: Timestamp.now(),
    responseData: request.responseData,
    verificationMethod: request.verificationMethod as any
  };
  
  await db.collection('data_subject_requests').add(requestRecord);
}