// src/app/api/applications/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import admin from "firebase-admin";
import { enqueueEmail } from "@/lib/mail/enqueueEmail";
import { Storage } from "@google-cloud/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ensureAdmin() {
  if (admin.apps.length === 0) admin.initializeApp();
  return { db: admin.firestore(), auth: admin.auth() };
}

// Initialize Google Cloud Storage for secure file download links
const storage = new Storage({
  projectId: process.env.FIREBASE_PROJECT_ID || 'arenafund',
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arenafund.appspot.com';

/**
 * Generate secure download URL for uploaded files
 * Returns a signed URL that expires in 7 days for email access
 */
async function generateSecureDownloadUrl(fileRef: string): Promise<string | null> {
  try {
    if (!fileRef || fileRef.trim() === "") {
      return null;
    }
    
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileRef);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      console.warn(`File not found in storage: ${fileRef}`);
      return null;
    }
    
    // Generate signed URL with 7-day expiration for email access
    const [downloadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    });
    
    return downloadUrl;
  } catch (error) {
    console.error(`Error generating secure download URL for ${fileRef}:`, error);
    return null;
  }
}

type Stage = "pre-seed" | "seed" | "series-a" | "bootstrapped" | "other";
type InvestorMode = '506b' | '506c';
type InvestorType = 'individual' | 'family-office' | 'institutional' | 'other';
type AccreditationStatus = 'yes' | 'no' | 'unsure';
type CheckSize = '25k-50k' | '50k-250k' | '250k-plus';
type VerificationMethod = 'letter' | 'third-party' | 'bank-brokerage';

type ApplyPayload = {
  // Application type identifier
  applicationType?: 'founder' | 'investor';
  
  // Founder & Team Info (expanded with new required fields)
  founderName?: string;
  founderEmail?: string;
  role?: string;
  phone?: string;
  linkedin?: string;
  companyName?: string;
  companyUrl?: string;
  
  // Startup Snapshot (expanded with comprehensive fields)
  stage?: Stage;
  industry?: string;
  oneLineDescription?: string;
  problem?: string;
  solution?: string;
  traction?: string;
  revenue?: string;
  
  // Pitch Deck (enhanced with file support)
  deckUrl?: string;
  deckFileRef?: string; // Reference to uploaded file in GCS
  videoPitch?: string;
  
  // Validation & Edge (new comprehensive section)
  enterpriseEngagement?: string;
  keyHighlights?: string;
  
  // Funding (new comprehensive section)
  capitalRaised?: string;
  capitalRaisedAmount?: string;
  capitalSought?: string;
  
  // Consent (new required section)
  signature?: string;
  accuracyConfirm?: boolean;
  understandingConfirm?: boolean;
  
  // Legacy/Security (maintain backward compatibility)
  whyNow?: string;
  dataSources?: string;
  websiteHoneypot?: string;
};

type InvestorPayload = {
  // Application type identifier
  applicationType: 'investor';
  
  // Mode selection
  investorMode: InvestorMode;
  
  // Basic investor info
  fullName: string;
  email: string;
  country: string;
  state: string;
  investorType: InvestorType;
  accreditationStatus: AccreditationStatus;
  
  // Investment preferences
  checkSize: CheckSize;
  areasOfInterest: string[];
  referralSource?: string;
  
  // 506(c) specific fields
  verificationMethod?: VerificationMethod;
  verificationFileRef?: string;
  entityName?: string;
  jurisdiction?: string;
  custodianInfo?: string;
  
  // Consent and legal
  consentConfirm: boolean;
  signature: string;
  
  // Security
  websiteHoneypot?: string;
};

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}
function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
function clampLen(s: unknown, max: number): string {
  const v = typeof s === "string" ? s : "";
  return v.length > max ? v.slice(0, max) : v;
}
function bad(reason: string, status = 400) {
  return NextResponse.json({ error: reason }, { status });
}

// Investor-specific validation functions
const SUPPORTED_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'CH', 'SG', 'HK', 'JP', 'KR', 'IL'];
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];
const ALLOWED_INVESTOR_TYPES: InvestorType[] = ['individual', 'family-office', 'institutional', 'other'];
const ALLOWED_ACCREDITATION_STATUS: AccreditationStatus[] = ['yes', 'no', 'unsure'];
const ALLOWED_CHECK_SIZES: CheckSize[] = ['25k-50k', '50k-250k', '250k-plus'];
const ALLOWED_VERIFICATION_METHODS: VerificationMethod[] = ['letter', 'third-party', 'bank-brokerage'];
const ALLOWED_AREAS_OF_INTEREST = ['enterprise-ai', 'healthcare-ai', 'fintech-ai', 'hi-tech'];

function isValidCountry(country: string): boolean {
  return SUPPORTED_COUNTRIES.includes(country.toUpperCase());
}

function isValidUSState(state: string): boolean {
  return US_STATES.includes(state.toUpperCase());
}

function isValidInvestorType(type: string): boolean {
  return ALLOWED_INVESTOR_TYPES.includes(type as InvestorType);
}

function isValidAccreditationStatus(status: string): boolean {
  return ALLOWED_ACCREDITATION_STATUS.includes(status as AccreditationStatus);
}

function isValidCheckSize(size: string): boolean {
  return ALLOWED_CHECK_SIZES.includes(size as CheckSize);
}

function isValidVerificationMethod(method: string): boolean {
  return ALLOWED_VERIFICATION_METHODS.includes(method as VerificationMethod);
}

function areValidAreasOfInterest(areas: string[]): boolean {
  return areas.length > 0 && areas.every(area => ALLOWED_AREAS_OF_INTEREST.includes(area));
}

async function notifyOpsWebhook(summary: string, payload: Record<string, unknown>) {
  const hook = process.env.OPS_WEBHOOK_URL;
  if (!hook) return;
  try {
    await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: summary,
        application: payload,
        source: "apply_api",
        env: process.env.NEXT_PUBLIC_ENV || "prod",
      }),
    });
  } catch {/* best effort */}
}

async function sendFounderApplicationEmail(appRecord: any) {
  try {
    const opsTo = (process.env.OPS_EMAILS || "invest@thearenafund.com")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const subject = `[Arena] New founder application — ${appRecord.companyName}`;
    
    // Generate secure download URL for uploaded files
    let secureDownloadUrl: string | null = null;
    if (appRecord.deckFileRef) {
      secureDownloadUrl = await generateSecureDownloadUrl(appRecord.deckFileRef);
    }
    
    // Comprehensive text email format with proper escaping for security
    const text = [
      "=== COMPANY OVERVIEW ===",
      `Company: ${escapeTextContent(appRecord.companyName)}`,
      `Website: ${appRecord.companyUrl}`,
      `Stage: ${appRecord.stage}`,
      `Industry: ${escapeTextContent(appRecord.industry)}`,
      `Description: ${escapeTextContent(appRecord.oneLineDescription)}`,
      "",
      "=== FOUNDER INFORMATION ===",
      `Name: ${escapeTextContent(appRecord.founderName)}`,
      `Email: ${appRecord.founderEmail}`,
      `Role: ${escapeTextContent(appRecord.role)}`,
      `Phone: ${escapeTextContent(appRecord.phone || "-")}`,
      `LinkedIn: ${escapeTextContent(appRecord.linkedin || "-")}`,
      "",
      "=== BUSINESS DETAILS ===",
      `Problem: ${escapeTextContent(appRecord.problem)}`,
      `Solution: ${escapeTextContent(appRecord.solution)}`,
      `Traction: ${appRecord.traction}`,
      `Revenue: ${escapeTextContent(appRecord.revenue || "-")}`,
      "",
      "=== ENTERPRISE ENGAGEMENT ===",
      `${escapeTextContent(appRecord.enterpriseEngagement)}`,
      "",
      `Key Highlights: ${escapeTextContent(appRecord.keyHighlights || "-")}`,
      "",
      "=== FUNDING INFORMATION ===",
      `Capital Raised: ${escapeTextContent(appRecord.capitalRaised || "-")}`,
      `Amount Raised: ${escapeTextContent(appRecord.capitalRaisedAmount || "-")}`,
      `Capital Sought: ${escapeTextContent(appRecord.capitalSought)}`,
      "",
      "=== PITCH MATERIALS ===",
      `Deck URL: ${appRecord.deckUrl || "-"}`,
      `Deck File: ${appRecord.deckFileRef ? (secureDownloadUrl ? `Secure download: ${secureDownloadUrl}` : "File uploaded (download link unavailable)") : "-"}`,
      `Video Pitch: ${escapeTextContent(appRecord.videoPitch || "-")}`,
      "",
      "=== LEGACY FIELDS ===",
      `Why Now: ${escapeTextContent(appRecord.whyNow || "-")}`,
      `Data Sources: ${escapeTextContent(appRecord.dataSources || "-")}`,
      "",
      `Digital Signature: ${escapeTextContent(appRecord.signature)}`,
      `Application ID: ${appRecord.id}`,
    ].join("\n");

    // Comprehensive HTML email format
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #1a365d; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Company Overview</h2>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr><td style="font-weight: bold; width: 120px;">Company:</td><td>${escapeHtml(appRecord.companyName)}</td></tr>
          <tr><td style="font-weight: bold;">Website:</td><td><a href="${escapeAttr(appRecord.companyUrl)}">${escapeHtml(appRecord.companyUrl)}</a></td></tr>
          <tr><td style="font-weight: bold;">Stage:</td><td>${escapeHtml(appRecord.stage)}</td></tr>
          <tr><td style="font-weight: bold;">Industry:</td><td>${escapeHtml(appRecord.industry)}</td></tr>
          <tr><td style="font-weight: bold;">Description:</td><td>${escapeHtml(appRecord.oneLineDescription)}</td></tr>
        </table>

        <h2 style="color: #1a365d; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Founder Information</h2>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr><td style="font-weight: bold; width: 120px;">Name:</td><td>${escapeHtml(appRecord.founderName)}</td></tr>
          <tr><td style="font-weight: bold;">Email:</td><td><a href="mailto:${escapeAttr(appRecord.founderEmail)}">${escapeHtml(appRecord.founderEmail)}</a></td></tr>
          <tr><td style="font-weight: bold;">Role:</td><td>${escapeHtml(appRecord.role)}</td></tr>
          <tr><td style="font-weight: bold;">Phone:</td><td>${escapeHtml(appRecord.phone || "-")}</td></tr>
          <tr><td style="font-weight: bold;">LinkedIn:</td><td>${appRecord.linkedin ? `<a href="${escapeAttr(appRecord.linkedin)}">${escapeHtml(appRecord.linkedin)}</a>` : "-"}</td></tr>
        </table>

        <h2 style="color: #1a365d; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Business Details</h2>
        <div style="margin-bottom: 20px;">
          <p><strong>Problem:</strong><br/>${nl2br(escapeHtml(appRecord.problem))}</p>
          <p><strong>Solution:</strong><br/>${nl2br(escapeHtml(appRecord.solution))}</p>
          <p><strong>Traction:</strong> ${escapeHtml(appRecord.traction)}</p>
          <p><strong>Revenue:</strong> ${escapeHtml(appRecord.revenue || "-")}</p>
        </div>

        <h2 style="color: #1a365d; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Enterprise Engagement</h2>
        <div style="margin-bottom: 20px;">
          <p>${nl2br(escapeHtml(appRecord.enterpriseEngagement))}</p>
          ${appRecord.keyHighlights ? `<p><strong>Key Highlights:</strong><br/>${nl2br(escapeHtml(appRecord.keyHighlights))}</p>` : ""}
        </div>

        <h2 style="color: #1a365d; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Funding Information</h2>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr><td style="font-weight: bold; width: 150px;">Capital Raised:</td><td>${escapeHtml(appRecord.capitalRaised || "-")}</td></tr>
          <tr><td style="font-weight: bold;">Amount Raised:</td><td>${escapeHtml(appRecord.capitalRaisedAmount || "-")}</td></tr>
          <tr><td style="font-weight: bold;">Capital Sought:</td><td>${escapeHtml(appRecord.capitalSought)}</td></tr>
        </table>

        <h2 style="color: #1a365d; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Pitch Materials</h2>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr><td style="font-weight: bold; width: 120px;">Deck URL:</td><td>${appRecord.deckUrl ? `<a href="${escapeAttr(appRecord.deckUrl)}">${escapeHtml(appRecord.deckUrl)}</a>` : "-"}</td></tr>
          <tr><td style="font-weight: bold;">Deck File:</td><td>${appRecord.deckFileRef ? (secureDownloadUrl ? `<a href="${escapeAttr(secureDownloadUrl)}" style="color: #d4af37; text-decoration: none; font-weight: bold;">📎 Download Secure File</a> <span style="color: #666; font-size: 12px;">(expires in 7 days)</span>` : "File uploaded (download link unavailable)") : "-"}</td></tr>
          <tr><td style="font-weight: bold;">Video Pitch:</td><td>${appRecord.videoPitch ? `<a href="${escapeAttr(appRecord.videoPitch)}">${escapeHtml(appRecord.videoPitch)}</a>` : "-"}</td></tr>
        </table>

        ${appRecord.whyNow || appRecord.dataSources ? `
        <h2 style="color: #1a365d; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Legacy Information</h2>
        <div style="margin-bottom: 20px;">
          ${appRecord.whyNow ? `<p><strong>Why Now:</strong><br/>${nl2br(escapeHtml(appRecord.whyNow))}</p>` : ""}
          ${appRecord.dataSources ? `<p><strong>Data Sources:</strong><br/>${nl2br(escapeHtml(appRecord.dataSources))}</p>` : ""}
        </div>
        ` : ""}

        <div style="margin-top: 30px; padding: 15px; background-color: #f7fafc; border-left: 4px solid #d4af37;">
          <p style="margin: 0;"><strong>Digital Signature:</strong> ${escapeHtml(appRecord.signature)}</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Application ID: ${escapeHtml(appRecord.id)}</p>
        </div>
      </div>
    `;

    await enqueueEmail({
      to: opsTo,
      subject,
      text,
      html,
      fromName: "Arena Intake",
      replyTo: appRecord.founderEmail || undefined,
      messageIdHint: `apply-${appRecord.id}`,
      metadata: { type: "founder-application", appId: appRecord.id },
    });
  } catch {
    // Do not fail the API if queue insert fails
  }
}

async function sendInvestorApplicationEmail(appRecord: any) {
  try {
    const opsTo = (process.env.OPS_EMAILS || "invest@thearenafund.com")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const modeLabel = appRecord.investorMode === '506b' ? '506(b) Expression of Interest' : '506(c) Investment Application';
    const subject = `[Arena] New investor application — ${appRecord.fullName} (${modeLabel})`;
    
    // Generate secure download URL for verification files
    let secureDownloadUrl: string | null = null;
    if (appRecord.verificationFileRef) {
      secureDownloadUrl = await generateSecureDownloadUrl(appRecord.verificationFileRef);
    }
    
    // Comprehensive text email format for investor applications
    const text = [
      `=== INVESTOR APPLICATION (${appRecord.investorMode.toUpperCase()}) ===`,
      `Mode: ${modeLabel}`,
      `Name: ${escapeTextContent(appRecord.fullName)}`,
      `Email: ${appRecord.email}`,
      `Location: ${appRecord.country}${appRecord.state ? `, ${appRecord.state}` : ''}`,
      `Investor Type: ${appRecord.investorType}`,
      `Accreditation Status: ${appRecord.accreditationStatus}`,
      "",
      "=== INVESTMENT PREFERENCES ===",
      `Check Size: ${appRecord.checkSize}`,
      `Areas of Interest: ${appRecord.areasOfInterest.join(', ')}`,
      `Referral Source: ${escapeTextContent(appRecord.referralSource || "-")}`,
      "",
      ...(appRecord.investorMode === '506c' ? [
        "=== 506(C) VERIFICATION DETAILS ===",
        `Verification Method: ${appRecord.verificationMethod || "-"}`,
        `Entity Name: ${escapeTextContent(appRecord.entityName || "-")}`,
        `Jurisdiction: ${escapeTextContent(appRecord.jurisdiction || "-")}`,
        `Custodian Info: ${escapeTextContent(appRecord.custodianInfo || "-")}`,
        `Verification File: ${appRecord.verificationFileRef ? (secureDownloadUrl ? `Secure download: ${secureDownloadUrl}` : "File uploaded (download link unavailable)") : "-"}`,
        "",
      ] : []),
      `Digital Signature: ${escapeTextContent(appRecord.signature)}`,
      `Application ID: ${appRecord.id}`,
    ].join("\n");

    // Comprehensive HTML email format for investor applications
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #1a365d; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
          Investor Application (${appRecord.investorMode.toUpperCase()})
        </h2>
        <div style="background-color: ${appRecord.investorMode === '506c' ? '#fff3cd' : '#d1ecf1'}; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold; color: ${appRecord.investorMode === '506c' ? '#856404' : '#0c5460'};">
            ${modeLabel}
          </p>
        </div>

        <h3 style="color: #1a365d; border-bottom: 1px solid #d4af37; padding-bottom: 5px;">Investor Information</h3>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr><td style="font-weight: bold; width: 150px;">Name:</td><td>${escapeHtml(appRecord.fullName)}</td></tr>
          <tr><td style="font-weight: bold;">Email:</td><td><a href="mailto:${escapeAttr(appRecord.email)}">${escapeHtml(appRecord.email)}</a></td></tr>
          <tr><td style="font-weight: bold;">Location:</td><td>${escapeHtml(appRecord.country)}${appRecord.state ? `, ${escapeHtml(appRecord.state)}` : ''}</td></tr>
          <tr><td style="font-weight: bold;">Investor Type:</td><td>${escapeHtml(appRecord.investorType)}</td></tr>
          <tr><td style="font-weight: bold;">Accreditation:</td><td>${escapeHtml(appRecord.accreditationStatus)}</td></tr>
        </table>

        <h3 style="color: #1a365d; border-bottom: 1px solid #d4af37; padding-bottom: 5px;">Investment Preferences</h3>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr><td style="font-weight: bold; width: 150px;">Check Size:</td><td>${escapeHtml(appRecord.checkSize)}</td></tr>
          <tr><td style="font-weight: bold;">Areas of Interest:</td><td>${escapeHtml(appRecord.areasOfInterest.join(', '))}</td></tr>
          <tr><td style="font-weight: bold;">Referral Source:</td><td>${escapeHtml(appRecord.referralSource || "-")}</td></tr>
        </table>

        ${appRecord.investorMode === '506c' ? `
        <h3 style="color: #1a365d; border-bottom: 1px solid #d4af37; padding-bottom: 5px;">506(c) Verification Details</h3>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr><td style="font-weight: bold; width: 150px;">Verification Method:</td><td>${escapeHtml(appRecord.verificationMethod || "-")}</td></tr>
          <tr><td style="font-weight: bold;">Entity Name:</td><td>${escapeHtml(appRecord.entityName || "-")}</td></tr>
          <tr><td style="font-weight: bold;">Jurisdiction:</td><td>${escapeHtml(appRecord.jurisdiction || "-")}</td></tr>
          <tr><td style="font-weight: bold;">Custodian Info:</td><td>${escapeHtml(appRecord.custodianInfo || "-")}</td></tr>
          <tr><td style="font-weight: bold;">Verification File:</td><td>${appRecord.verificationFileRef ? (secureDownloadUrl ? `<a href="${escapeAttr(secureDownloadUrl)}" style="color: #d4af37; text-decoration: none; font-weight: bold;">📎 Download Verification Document</a> <span style="color: #666; font-size: 12px;">(expires in 7 days)</span>` : "File uploaded (download link unavailable)") : "-"}</td></tr>
        </table>
        ` : ''}

        <div style="margin-top: 30px; padding: 15px; background-color: #f7fafc; border-left: 4px solid #d4af37;">
          <p style="margin: 0;"><strong>Digital Signature:</strong> ${escapeHtml(appRecord.signature)}</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Application ID: ${escapeHtml(appRecord.id)}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: ${appRecord.investorMode === '506c' ? '#fff3cd' : '#d1ecf1'}; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px; color: ${appRecord.investorMode === '506c' ? '#856404' : '#0c5460'};">
            ${appRecord.investorMode === '506c' 
              ? '<strong>Next Steps:</strong> Review verification documents and process accreditation status. Upon approval, provide data room access.'
              : '<strong>Next Steps:</strong> Review expression of interest. Follow up within 2-3 weeks with investment opportunity details.'
            }
          </p>
        </div>
      </div>
    `;

    await enqueueEmail({
      to: opsTo,
      subject,
      text,
      html,
      fromName: "Arena Investor Relations",
      replyTo: appRecord.email || undefined,
      messageIdHint: `investor-${appRecord.id}`,
      metadata: { 
        type: "investor-application", 
        appId: appRecord.id, 
        investorMode: appRecord.investorMode,
        investorType: appRecord.investorType 
      },
    });
  } catch {
    // Do not fail the API if queue insert fails
  }
}

export async function POST(req: Request) {
  const { db, auth } = ensureAdmin();

  // Optional Firebase auth
  let uid = "";
  let idTokenEmail = "";
  const authz = req.headers.get("authorization") || "";
  if (authz.startsWith("Bearer ")) {
    try {
      const decoded = await auth.verifyIdToken(authz.slice("Bearer ".length).trim());
      uid = decoded.uid;
      idTokenEmail = typeof decoded.email === "string" ? decoded.email : "";
    } catch {/* ignore invalid token */}
  }

  let body: ApplyPayload | InvestorPayload;
  try {
    body = (await req.json()) as ApplyPayload | InvestorPayload;
  } catch {
    return bad("Invalid JSON payload.");
  }

  // Honeypot
  if (body.websiteHoneypot && body.websiteHoneypot.trim() !== "") {
    return bad("Spam detected.");
  }

  // Determine application type
  const applicationType = body.applicationType || 'founder';
  
  if (applicationType === 'investor') {
    return handleInvestorApplication(body as InvestorPayload, uid, idTokenEmail, db, req);
  } else {
    return handleFounderApplication(body as ApplyPayload, uid, idTokenEmail, db, req);
  }
}

async function handleFounderApplication(
  body: ApplyPayload, 
  uid: string, 
  idTokenEmail: string, 
  db: FirebaseFirestore.Firestore, 
  req: Request
) {
  // Required fields validation
  const founderName = clampLen(body.founderName, 100).trim();
  const founderEmail = clampLen(body.founderEmail, 254).trim();
  const role = clampLen(body.role, 100).trim();
  const companyName = clampLen(body.companyName, 120).trim();
  const companyUrl = clampLen(body.companyUrl, 200).trim();
  const oneLineDescription = clampLen(body.oneLineDescription, 150).trim();
  const problem = clampLen(body.problem, 300).trim();
  const solution = clampLen(body.solution, 300).trim();
  const traction = clampLen(body.traction, 50).trim();
  const enterpriseEngagement = clampLen(body.enterpriseEngagement, 2000).trim();
  const capitalSought = clampLen(body.capitalSought, 50).trim();
  const signature = clampLen(body.signature, 100).trim();

  // Required field validation with specific error messages
  if (!founderName) return bad("Your full name is required.");
  if (!founderEmail || !isEmail(founderEmail)) return bad("A valid email address is required.");
  if (!role) return bad("Your role at the company is required.");
  if (!companyName) return bad("Company name is required.");
  if (!companyUrl || !isHttpUrl(companyUrl)) return bad("A valid company website URL is required.");
  if (!oneLineDescription) return bad("A one-line description of your startup is required.");
  if (!problem) return bad("Problem description is required.");
  if (!solution) return bad("Solution description is required.");
  if (!traction) return bad("Traction stage selection is required.");
  if (!enterpriseEngagement) return bad("Enterprise engagement description is required.");
  if (!capitalSought) return bad("Capital sought amount is required.");
  if (!signature) return bad("Digital signature is required.");
  if (!body.accuracyConfirm) return bad("You must confirm the accuracy of your information.");
  if (!body.understandingConfirm) return bad("You must confirm your understanding of the process.");

  // Stage validation
  const stage = (["pre-seed", "seed", "series-a", "bootstrapped", "other"] as const).includes(
    (body.stage || "seed") as Stage
  ) ? ((body.stage || "seed") as Stage) : "seed";

  // Industry validation
  const industry = clampLen(body.industry, 100).trim();
  if (!industry) return bad("Industry selection is required.");

  // Optional fields with validation
  const phone = clampLen(body.phone, 20).trim();
  const linkedin = clampLen(body.linkedin, 200).trim();
  const revenue = clampLen(body.revenue, 50).trim();
  const videoPitch = clampLen(body.videoPitch, 200).trim();
  const keyHighlights = clampLen(body.keyHighlights, 1000).trim();
  const capitalRaised = clampLen(body.capitalRaised, 50).trim();
  const capitalRaisedAmount = clampLen(body.capitalRaisedAmount, 50).trim();

  // URL validations for optional fields
  if (linkedin && !isHttpUrl(linkedin)) return bad("LinkedIn URL must be a valid link.");
  if (videoPitch && !isHttpUrl(videoPitch)) return bad("Video pitch URL must be a valid link.");

  // Pitch deck validation (either URL or file reference required)
  const deckUrl = clampLen(body.deckUrl, 200).trim();
  const deckFileRef = clampLen(body.deckFileRef, 200).trim();
  if (deckUrl && !isHttpUrl(deckUrl)) return bad("Deck URL must be a valid link.");
  if (!deckUrl && !deckFileRef) return bad("Pitch deck is required (either upload a file or provide a URL).");

  // Legacy fields for backward compatibility
  const whyNow = clampLen(body.whyNow, 2000).trim();
  const dataSources = clampLen(body.dataSources, 1000).trim();

  // Rate limit by email hash, 30s
  const emailForRate = idTokenEmail || founderEmail;
  const emailHash = crypto.createHash("sha256").update(emailForRate.toLowerCase()).digest("hex");
  const metaRef = db.collection("applications_meta").doc(emailHash);
  const now = admin.firestore.Timestamp.now();

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(metaRef);
      const lastTs = snap.exists ? (snap.get("lastSubmittedAt") as admin.firestore.Timestamp | undefined) : undefined;
      if (lastTs && now.seconds - lastTs.seconds < 30) {
        throw new Error("Please wait 30 seconds before submitting again.");
      }
      tx.set(metaRef, { lastSubmittedAt: now, count: admin.firestore.FieldValue.increment(1) }, { merge: true });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return bad(msg, 429);
  }

  // Persist comprehensive application record
  const docRef = db.collection("applications").doc();
  const appRecord = {
    // System fields
    id: docRef.id,
    uid: uid || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    env: process.env.NEXT_PUBLIC_ENV || "prod",
    applicationType: 'founder' as const,
    
    // Founder & Team Info
    founderName,
    founderEmail,
    role,
    phone: phone || null,
    linkedin: linkedin || null,
    
    // Company Info
    companyName,
    companyUrl,
    stage,
    industry,
    oneLineDescription,
    
    // Business Details
    problem,
    solution,
    traction,
    revenue: revenue || null,
    
    // Pitch Materials
    deckUrl: deckUrl || null,
    deckFileRef: deckFileRef || null,
    videoPitch: videoPitch || null,
    
    // Validation & Edge
    enterpriseEngagement,
    keyHighlights: keyHighlights || null,
    
    // Funding
    capitalRaised: capitalRaised || null,
    capitalRaisedAmount: capitalRaisedAmount || null,
    capitalSought,
    
    // Consent
    signature,
    accuracyConfirm: body.accuracyConfirm || false,
    understandingConfirm: body.understandingConfirm || false,
    
    // Legacy fields (backward compatibility)
    whyNow: whyNow || null,
    dataSources: dataSources || null,
    
    // System metadata
    userEmailFromIdToken: idTokenEmail || null,
    userAgent: req.headers.get("user-agent") || null,
    ipHint: req.headers.get("x-forwarded-for") || null,
  } as const;

  try {
    await docRef.set(appRecord);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to persist: ${msg}` }, { status: 500 });
  }

  // Send founder application email
  await sendFounderApplicationEmail(appRecord);

  // Best-effort webhook
  await notifyOpsWebhook(
    `New founder application: ${appRecord.companyName} by ${appRecord.founderName} (${appRecord.founderEmail})`,
    appRecord as unknown as Record<string, unknown>,
  );

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}

async function handleInvestorApplication(
  body: InvestorPayload, 
  uid: string, 
  idTokenEmail: string, 
  db: FirebaseFirestore.Firestore, 
  req: Request
) {
  // Required fields validation with enhanced sanitization
  const fullName = sanitizeInvestorText(clampLen(body.fullName, 100), 'name');
  const email = clampLen(body.email, 254).trim().toLowerCase();
  const country = clampLen(body.country, 50).trim().toUpperCase();
  const state = clampLen(body.state, 50).trim().toUpperCase();
  const signature = sanitizeInvestorText(clampLen(body.signature, 100), 'name');

  // Required field validation with specific error messages
  if (!fullName) return bad("Your full name is required.");
  if (!email || !isEmail(email)) return bad("A valid email address is required.");
  if (!country) return bad("Country is required.");
  if (!isValidCountry(country)) return bad("Please select a supported country.");
  
  // State validation for US investors
  if (country.toUpperCase() === 'US') {
    if (!state) return bad("State is required for US investors.");
    if (!isValidUSState(state)) return bad("Please select a valid US state.");
  }

  if (!body.investorType || !isValidInvestorType(body.investorType)) {
    return bad("Please select a valid investor type.");
  }
  if (!body.accreditationStatus || !isValidAccreditationStatus(body.accreditationStatus)) {
    return bad("Please indicate your accreditation status.");
  }
  if (!body.checkSize || !isValidCheckSize(body.checkSize)) {
    return bad("Please select your investment check size.");
  }
  if (!body.areasOfInterest || !areValidAreasOfInterest(body.areasOfInterest)) {
    return bad("Please select valid areas of interest.");
  }
  if (!body.consentConfirm) return bad("You must confirm your consent to proceed.");
  if (!signature) return bad("Digital signature is required.");

  // Mode-specific validation
  if (body.investorMode === '506c') {
    if (!body.verificationMethod || !isValidVerificationMethod(body.verificationMethod)) {
      return bad("Please select a verification method for 506(c) offerings.");
    }
    if (!body.entityName?.trim()) return bad("Entity name is required for 506(c) offerings.");
    if (!body.jurisdiction?.trim()) return bad("Jurisdiction is required for 506(c) offerings.");
    if (body.accreditationStatus === 'no') {
      return bad("506(c) offerings are only available to accredited investors.");
    }
    if (body.verificationMethod === 'letter' && !body.verificationFileRef) {
      return bad("Verification letter is required for this method.");
    }
  }

  // Optional fields with enhanced sanitization
  const referralSource = body.referralSource ? sanitizeInvestorText(clampLen(body.referralSource, 200), 'general') : '';
  const entityName = body.entityName ? sanitizeInvestorText(clampLen(body.entityName, 120), 'entity') : '';
  const jurisdiction = body.jurisdiction ? sanitizeInvestorText(clampLen(body.jurisdiction, 100), 'jurisdiction') : '';
  const custodianInfo = body.custodianInfo ? sanitizeInvestorText(clampLen(body.custodianInfo, 500), 'general') : '';

  // Rate limit by email hash, 30s (more restrictive for investors)
  const emailForRate = idTokenEmail || email;
  const emailHash = crypto.createHash("sha256").update(emailForRate.toLowerCase()).digest("hex");
  const metaRef = db.collection("applications_meta").doc(emailHash);
  const now = admin.firestore.Timestamp.now();

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(metaRef);
      const lastTs = snap.exists ? (snap.get("lastSubmittedAt") as admin.firestore.Timestamp | undefined) : undefined;
      if (lastTs && now.seconds - lastTs.seconds < 30) {
        throw new Error("Please wait 30 seconds before submitting again.");
      }
      tx.set(metaRef, { lastSubmittedAt: now, count: admin.firestore.FieldValue.increment(1) }, { merge: true });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return bad(msg, 429);
  }

  // Persist investor application record
  const docRef = db.collection("applications").doc();
  const appRecord = {
    // System fields
    id: docRef.id,
    uid: uid || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    env: process.env.NEXT_PUBLIC_ENV || "prod",
    applicationType: 'investor' as const,
    
    // Investor-specific fields (sanitized)
    investorMode: body.investorMode,
    fullName,
    email,
    country,
    state: state || null,
    investorType: body.investorType,
    accreditationStatus: body.accreditationStatus,
    checkSize: body.checkSize,
    areasOfInterest: body.areasOfInterest.map(area => sanitizeInvestorText(area, 'general')),
    referralSource: referralSource || null,
    
    // 506(c) specific fields (sanitized)
    verificationMethod: body.verificationMethod || null,
    verificationFileRef: body.verificationFileRef || null,
    entityName: entityName || null,
    jurisdiction: jurisdiction || null,
    custodianInfo: custodianInfo || null,
    
    // Consent
    consentConfirm: body.consentConfirm,
    signature,
    
    // System metadata
    userEmailFromIdToken: idTokenEmail || null,
    userAgent: req.headers.get("user-agent") || null,
    ipHint: req.headers.get("x-forwarded-for") || null,
  } as const;

  try {
    await docRef.set(appRecord);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to persist: ${msg}` }, { status: 500 });
  }

  // Send investor application email
  await sendInvestorApplicationEmail(appRecord);

  // Best-effort webhook
  await notifyOpsWebhook(
    `New investor application: ${appRecord.fullName} (${appRecord.email}) - ${appRecord.investorMode.toUpperCase()}`,
    appRecord as unknown as Record<string, unknown>,
  );

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}

// tiny helpers
function escapeHtml(s: unknown): string {
  const t = typeof s === "string" ? s : "";
  return t.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));
}
function escapeAttr(s: unknown): string {
  return escapeHtml(s);
}
function nl2br(s: string): string {
  return s.replace(/\n/g, "<br/>");
}
function escapeTextContent(s: unknown): string {
  const t = typeof s === "string" ? s : "";
  // Remove HTML tags and dangerous characters from text content
  // This prevents XSS in text emails that might be interpreted as HTML
  let cleaned = t
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=, onload=
    .trim();
  
  // Remove dangerous protocols and their content completely
  const dangerousProtocols = [
    /javascript\s*:[^;\s]*/gi,
    /data\s*:[^;\s]*/gi,
    /vbscript\s*:[^;\s]*/gi,
    /file\s*:[^;\s]*/gi,
    /about\s*:[^;\s]*/gi
  ];
  
  dangerousProtocols.forEach(regex => {
    cleaned = cleaned.replace(regex, '');
  });
  
  // Additional safety: remove any remaining protocol-like patterns
  cleaned = cleaned.replace(/\w+\s*:\s*[^;\s]*/gi, (match) => {
    // Allow safe protocols like http:, https:, mailto:
    if (/^(https?|mailto|tel|ftp)\s*:/i.test(match)) {
      return match;
    }
    return '';
  });
  
  return cleaned.trim();
}

// Enhanced sanitization for investor-specific fields
function sanitizeInvestorText(text: string, fieldType: 'name' | 'entity' | 'jurisdiction' | 'general' = 'general'): string {
  if (!text || typeof text !== 'string') return '';
  
  let sanitized = escapeTextContent(text)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Field-specific sanitization
  switch (fieldType) {
    case 'name':
      // Names should only contain letters, spaces, hyphens, apostrophes, and periods
      sanitized = sanitized.replace(/[^a-zA-Z\s\-'.]/g, '');
      break;
      
    case 'entity':
      // Entity names can contain letters, numbers, spaces, and common business punctuation
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-'.,&()]/g, '');
      break;
      
    case 'jurisdiction':
      // Jurisdictions should only contain letters, spaces, and hyphens
      sanitized = sanitized.replace(/[^a-zA-Z\s\-]/g, '');
      break;
      
    case 'general':
    default:
      // General text allows most printable characters but removes dangerous ones
      sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');
      break;
  }
  
  return sanitized.substring(0, 10000); // Enforce length limit
}
