// src/types/application.ts
/**
 * Type definitions for application form and API interfaces
 */

export interface FormData {
  // Founder & Team Info
  fullName: string;
  role: string;
  email: string;
  phone: string;
  linkedin: string;
  companyName: string;
  website: string;
  
  // Startup Snapshot
  stage: string;
  industry: string;
  oneLineDescription: string;
  problem: string;
  solution: string;
  traction: string;
  revenue: string;
  
  // Pitch Deck
  deckFile: File | null;
  deckLink: string;
  videoPitch: string;
  
  // Validation & Edge
  enterpriseEngagement: string;
  keyHighlights: string;
  
  // Funding
  capitalRaised: string;
  capitalRaisedAmount: string;
  capitalSought: string;
  
  // Consent
  accuracyConfirm: boolean;
  understandingConfirm: boolean;
  signature: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApplicationResponse {
  success: boolean;
  id?: string;
  error?: string;
  validationErrors?: ValidationError[];
  retryAfter?: number; // For rate limiting
}

export interface FileUploadResponse {
  success: boolean;
  fileRef?: string;
  error?: string;
  uploadUrl?: string;
  expiresAt?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface SignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface SignedUrlResponse {
  uploadUrl: string;
  fileRef: string;
  expiresAt: string;
  maxSize: number;
  allowedTypes: string[];
}

// Investor application types
export type InvestorMode = '506b' | '506c';
export type InvestorType = 'individual' | 'family-office' | 'institutional' | 'other';
export type AccreditationStatus = 'yes' | 'no' | 'unsure';
export type CheckSize = '25k-50k' | '50k-250k' | '250k-plus';
export type VerificationMethod = 'letter' | 'third-party' | 'bank-brokerage';

export interface InvestorFormData {
  // Mode selection
  mode: InvestorMode;
  
  // Basic investor info
  fullName: string;
  email: string;
  country: string;
  state: string;
  investorType: InvestorType;
  accreditationStatus: AccreditationStatus;
  
  // Investment preferences
  checkSize: CheckSize;
  areasOfInterest: string[]; // ['enterprise-ai', 'healthcare-ai', 'fintech-ai', 'hi-tech']
  referralSource?: string;
  
  // 506(c) specific fields
  verificationMethod?: VerificationMethod;
  verificationFile?: File | null;
  verificationFileRef?: string; // Reference to uploaded file
  entityName?: string;
  jurisdiction?: string;
  custodianInfo?: string;
  
  // Consent and legal
  consentConfirm: boolean;
  signature: string;
}

// Form submission states
export type SubmissionState = 'idle' | 'validating' | 'uploading' | 'submitting' | 'success' | 'error';

export interface SubmissionStatus {
  state: SubmissionState;
  progress?: number;
  message?: string;
  errors?: ValidationError[];
  applicationId?: string;
}