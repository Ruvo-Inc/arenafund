export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

// Initialize Google Cloud Storage with Firebase credentials from environment
const storage = new Storage({
  projectId: process.env.FIREBASE_PROJECT_ID || 'arenafund',
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arenafund.appspot.com';

// Allowed file types for application uploads (PDF, JPEG, PNG)
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg", 
  "image/png"
]);

// Allowed file types for verification documents (PDF only)
const VERIFICATION_ALLOWED_TYPES = new Set([
  "application/pdf"
]);

// Maximum file size: 25MB for general uploads
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

// Maximum file size for verification documents: 10MB
const VERIFICATION_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// 10-minute expiration window for security
const EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Sanitize filename to prevent path traversal and other security issues
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^\w.\-]/g, "_") // Replace non-alphanumeric chars except dots and hyphens
    .slice(0, 128); // Limit length to 128 characters
}

/**
 * Generate unique file path for application uploads
 */
function generateFilePath(filename: string, purpose?: string): string {
  const timestamp = Date.now();
  const sanitizedName = sanitizeFilename(filename);
  
  if (purpose === 'verification') {
    return `applications/verification/${timestamp}-${sanitizedName}`;
  }
  
  return `applications/uploads/${timestamp}-${sanitizedName}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, fileType, fileSize, purpose } = body;

    // Validate required fields
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType are required" },
        { status: 400 }
      );
    }

    // Determine if this is a verification document upload
    const isVerificationUpload = purpose === 'verification' || req.headers.get('X-Upload-Type') === 'verification';
    
    // Select appropriate validation rules
    const allowedTypes = isVerificationUpload ? VERIFICATION_ALLOWED_TYPES : ALLOWED_TYPES;
    const maxFileSize = isVerificationUpload ? VERIFICATION_MAX_FILE_SIZE : MAX_FILE_SIZE;

    // Validate file type
    if (!allowedTypes.has(fileType)) {
      const typeDescription = isVerificationUpload 
        ? "Only PDF files are allowed for verification documents."
        : "Only PDF, JPEG, and PNG files are allowed.";
      
      return NextResponse.json(
        { 
          error: `Invalid file type. ${typeDescription}`,
          allowedTypes: Array.from(allowedTypes)
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize && fileSize > maxFileSize) {
      const sizeLimitMB = maxFileSize / (1024 * 1024);
      const documentType = isVerificationUpload ? "verification document" : "file";
      
      return NextResponse.json(
        { 
          error: `${documentType} size exceeds maximum limit of ${sizeLimitMB}MB`,
          maxSize: maxFileSize
        },
        { status: 400 }
      );
    }

    // Generate unique file path with purpose-specific directory
    const filePath = generateFilePath(fileName, purpose);
    
    // Get Firebase Storage bucket
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // Set metadata for verification documents
    const metadata = isVerificationUpload ? {
      metadata: {
        purpose: 'verification',
        uploadedAt: new Date().toISOString(),
        fileType: fileType,
        originalName: fileName
      }
    } : {};

    // Generate signed URL with 10-minute expiration
    const expirationTime = Date.now() + EXPIRATION_TIME;
    const signedUrlResponse = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: expirationTime,
      contentType: fileType,
      ...metadata
    });

    const uploadUrl = signedUrlResponse[0];
    
    return NextResponse.json({
      uploadUrl,
      fileRef: filePath,
      expiresAt: new Date(expirationTime).toISOString(),
      maxSize: maxFileSize,
      allowedTypes: Array.from(allowedTypes),
      purpose: isVerificationUpload ? 'verification' : 'general'
    });

  } catch (error: unknown) {
    console.error("Error generating signed URL:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to generate upload URL";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}