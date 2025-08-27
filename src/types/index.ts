import { Timestamp } from 'firebase/firestore';

// User and Profile Types
export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  location?: string;
  accredited?: boolean;
  documents?: UserDocument[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserDocument {
  id: string;
  name: string;
  type: ContentType;
  size: number;
  uploadedAt: Timestamp;
  url?: string;
}

export type ContentType = 'application/pdf' | 'image/png' | 'image/jpeg';

// Raise and Investment Types
export type RaiseStatus = 'draft' | 'open' | 'closed';

export interface Raise {
  id: string;
  title: string;
  subtitle: string;
  status: RaiseStatus;
  spvOpen: boolean;
  spvExternalUrl: string | null;
  cfOpen: boolean;
  cfExternalUrl: string | null;
  minCheck: number;
  maxCheck: number;
  allocationUsd: number;
  closesAt: Timestamp;
  tags: string[];
  highlights: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserInterest {
  uid: string;
  raiseId: string;
  interestedAt: Timestamp;
  checkSize?: number;
  notes?: string;
}

// Form Types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  recaptchaToken?: string;
}

export interface WaitlistFormData {
  email: string;
  name?: string;
  recaptchaToken?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  downloadUrl: string;
  fileName: string;
}

// File Upload Types for Application Form
export interface SignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize?: number;
}

export interface SignedUrlResponse {
  uploadUrl: string;
  fileRef: string;
  expiresAt: string;
  maxSize: number;
  allowedTypes: string[];
}

export interface FileUploadResponse {
  success: boolean;
  fileRef?: string;
  error?: string;
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// Auth Types
export interface AuthState {
  user: any | null; // Firebase User type
  loading: boolean;
  error?: string;
}

// Environment Types
export interface EnvironmentConfig {
  env: 'development' | 'staging' | 'production';
  siteUrl: string;
  gaId?: string;
  uploadSignerUrl: string;
  recaptchaSiteKey?: string;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

// Re-export application form types
export * from './application';
