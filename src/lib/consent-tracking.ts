import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from './firebase-admin';
import { logSecurityEvent } from './security-logging';
import crypto from 'crypto';

export interface ConsentRecord {
  id: string;
  email: string;
  consentType: 'newsletter_subscription' | 'data_processing' | 'marketing_communications';
  consentGiven: boolean;
  consentTimestamp: Timestamp;
  consentMethod: 'checkbox' | 'opt_in' | 'double_opt_in' | 'implied';
  consentSource: string; // e.g., 'newsletter-modal', 'contact-form'
  ipAddress?: string; // Hashed for privacy
  userAgent?: string;
  legalBasis: 'consent' | 'legitimate_interest' | 'contract' | 'legal_obligation';
  dataProcessingPurposes: string[];
  withdrawalTimestamp?: Timestamp;
  withdrawalMethod?: string;
  metadata: {
    gdprApplies: boolean;
    ccpaApplies: boolean;
    privacyPolicyVersion: string;
    consentVersion: string;
    lastUpdated: Timestamp;
  };
}

export interface ConsentOptions {
  email: string;
  consentType: ConsentRecord['consentType'];
  consentGiven: boolean;
  consentMethod: ConsentRecord['consentMethod'];
  consentSource: string;
  ipAddress?: string;
  userAgent?: string;
  legalBasis?: ConsentRecord['legalBasis'];
  dataProcessingPurposes?: string[];
  gdprApplies?: boolean;
  ccpaApplies?: boolean;
}

// Helper function to hash IP address for privacy compliance
function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'default-consent-salt';
  return crypto.createHash('sha256').update(ip + salt).digest('hex').substring(0, 16);
}

// Helper function to determine if GDPR applies based on IP geolocation
function determineGDPRApplicability(ipAddress?: string): boolean {
  // In a production environment, you would use a geolocation service
  // For now, we'll assume GDPR applies to be safe
  return true;
}

// Helper function to determine if CCPA applies
function determineCCPAApplicability(ipAddress?: string): boolean {
  // In a production environment, you would use a geolocation service
  // For now, we'll assume CCPA applies to be safe
  return true;
}

// Current privacy policy and consent versions
const PRIVACY_POLICY_VERSION = '2024.1';
const CONSENT_VERSION = '1.0';

/**
 * Record user consent for data processing
 */
export async function recordConsent(options: ConsentOptions): Promise<string> {
  try {
    const db = getAdminDb();
    const consentsCollection = db.collection('user_consents');
    
    const consentId = `consent_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const hashedIP = options.ipAddress ? hashIP(options.ipAddress) : undefined;
    
    const consentRecord: ConsentRecord = {
      id: consentId,
      email: options.email.toLowerCase().trim(),
      consentType: options.consentType,
      consentGiven: options.consentGiven,
      consentTimestamp: Timestamp.now(),
      consentMethod: options.consentMethod,
      consentSource: options.consentSource,
      ipAddress: hashedIP,
      userAgent: options.userAgent,
      legalBasis: options.legalBasis || 'consent',
      dataProcessingPurposes: options.dataProcessingPurposes || [
        'newsletter_delivery',
        'content_personalization',
        'service_improvement'
      ],
      metadata: {
        gdprApplies: options.gdprApplies ?? determineGDPRApplicability(options.ipAddress),
        ccpaApplies: options.ccpaApplies ?? determineCCPAApplicability(options.ipAddress),
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        consentVersion: CONSENT_VERSION,
        lastUpdated: Timestamp.now()
      }
    };
    
    // Store consent record
    await consentsCollection.add(consentRecord);
    
    // Log the consent event for audit purposes
    logSecurityEvent('CONSENT_RECORDED', {
      consentId,
      email: options.email,
      consentType: options.consentType,
      consentGiven: options.consentGiven,
      consentMethod: options.consentMethod,
      consentSource: options.consentSource,
      legalBasis: consentRecord.legalBasis,
      gdprApplies: consentRecord.metadata.gdprApplies,
      ccpaApplies: consentRecord.metadata.ccpaApplies
    });
    
    return consentId;
  } catch (error) {
    console.error('Error recording consent:', error);
    
    logSecurityEvent('CONSENT_RECORDING_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email: options.email,
      consentType: options.consentType
    });
    
    throw new Error('Failed to record consent');
  }
}

/**
 * Withdraw user consent
 */
export async function withdrawConsent(
  email: string, 
  consentType: ConsentRecord['consentType'],
  withdrawalMethod: string = 'user_request',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const db = getAdminDb();
    const consentsCollection = db.collection('user_consents');
    
    // Find the most recent consent record for this email and type
    const consentQuery = await consentsCollection
      .where('email', '==', email.toLowerCase().trim())
      .where('consentType', '==', consentType)
      .where('consentGiven', '==', true)
      .orderBy('consentTimestamp', 'desc')
      .limit(1)
      .get();
    
    if (!consentQuery.empty) {
      const consentDoc = consentQuery.docs[0];
      const hashedIP = ipAddress ? hashIP(ipAddress) : undefined;
      
      // Update the consent record to mark withdrawal
      await consentDoc.ref.update({
        consentGiven: false,
        withdrawalTimestamp: Timestamp.now(),
        withdrawalMethod,
        'metadata.lastUpdated': Timestamp.now(),
        ...(hashedIP && { withdrawalIPAddress: hashedIP }),
        ...(userAgent && { withdrawalUserAgent: userAgent })
      });
      
      // Log the withdrawal event
      logSecurityEvent('CONSENT_WITHDRAWN', {
        consentId: consentDoc.data().id,
        email,
        consentType,
        withdrawalMethod,
        withdrawalTimestamp: new Date().toISOString()
      });
    }
    
    // Also record a new withdrawal consent record for audit trail
    await recordConsent({
      email,
      consentType,
      consentGiven: false,
      consentMethod: 'opt_in',
      consentSource: withdrawalMethod,
      ipAddress,
      userAgent,
      legalBasis: 'consent'
    });
    
  } catch (error) {
    console.error('Error withdrawing consent:', error);
    
    logSecurityEvent('CONSENT_WITHDRAWAL_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email,
      consentType
    });
    
    throw new Error('Failed to withdraw consent');
  }
}

/**
 * Get consent status for a user
 */
export async function getConsentStatus(
  email: string, 
  consentType: ConsentRecord['consentType']
): Promise<ConsentRecord | null> {
  try {
    const db = getAdminDb();
    const consentsCollection = db.collection('user_consents');
    
    const consentQuery = await consentsCollection
      .where('email', '==', email.toLowerCase().trim())
      .where('consentType', '==', consentType)
      .orderBy('consentTimestamp', 'desc')
      .limit(1)
      .get();
    
    if (consentQuery.empty) {
      return null;
    }
    
    return consentQuery.docs[0].data() as ConsentRecord;
  } catch (error) {
    console.error('Error getting consent status:', error);
    throw new Error('Failed to retrieve consent status');
  }
}

/**
 * Get all consent records for a user (for data portability requests)
 */
export async function getUserConsentHistory(email: string): Promise<ConsentRecord[]> {
  try {
    const db = getAdminDb();
    const consentsCollection = db.collection('user_consents');
    
    const consentQuery = await consentsCollection
      .where('email', '==', email.toLowerCase().trim())
      .orderBy('consentTimestamp', 'desc')
      .get();
    
    return consentQuery.docs.map(doc => doc.data() as ConsentRecord);
  } catch (error) {
    console.error('Error getting user consent history:', error);
    throw new Error('Failed to retrieve consent history');
  }
}

/**
 * Update consent record when privacy policy changes
 */
export async function updateConsentForPolicyChange(
  email: string,
  consentType: ConsentRecord['consentType'],
  newPolicyVersion: string
): Promise<void> {
  try {
    const db = getAdminDb();
    const consentsCollection = db.collection('user_consents');
    
    // Find active consent records for this user and type
    const consentQuery = await consentsCollection
      .where('email', '==', email.toLowerCase().trim())
      .where('consentType', '==', consentType)
      .where('consentGiven', '==', true)
      .get();
    
    // Update all active consent records with new policy version
    const batch = db.batch();
    consentQuery.docs.forEach(doc => {
      batch.update(doc.ref, {
        'metadata.privacyPolicyVersion': newPolicyVersion,
        'metadata.lastUpdated': Timestamp.now()
      });
    });
    
    await batch.commit();
    
    logSecurityEvent('CONSENT_POLICY_UPDATE', {
      email,
      consentType,
      newPolicyVersion,
      recordsUpdated: consentQuery.docs.length
    });
    
  } catch (error) {
    console.error('Error updating consent for policy change:', error);
    throw new Error('Failed to update consent for policy change');
  }
}

/**
 * Generate unsubscribe token for secure email unsubscribe links
 */
export function generateUnsubscribeToken(email: string, consentType: string): string {
  const data = `${email}:${consentType}:${Date.now()}`;
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET || 'default-unsubscribe-secret';
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify unsubscribe token
 */
export function verifyUnsubscribeToken(
  token: string, 
  email: string, 
  consentType: string,
  maxAge: number = 30 * 24 * 60 * 60 * 1000 // 30 days default
): boolean {
  try {
    // In a production environment, you would store token metadata
    // For now, we'll implement a simple HMAC verification
    const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET || 'default-unsubscribe-secret';
    const expectedToken = crypto.createHmac('sha256', secret)
      .update(`${email}:${consentType}`)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    );
  } catch (error) {
    console.error('Error verifying unsubscribe token:', error);
    return false;
  }
}