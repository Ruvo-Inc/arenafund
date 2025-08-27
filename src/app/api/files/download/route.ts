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

// 1-hour expiration for download links
const DOWNLOAD_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Validate file reference for security
 */
function validateFileRef(fileRef: string): boolean {
  // Only allow files from specific directories
  const allowedPaths = [
    'applications/uploads/',
    'applications/verification/'
  ];
  
  return allowedPaths.some(path => fileRef.startsWith(path));
}

/**
 * Check if user has permission to download file (placeholder for future auth)
 */
function hasDownloadPermission(fileRef: string, userRole?: string): boolean {
  // For now, allow all downloads
  // In production, this would check user authentication and authorization
  // Verification documents should only be accessible to operations team
  
  if (fileRef.startsWith('applications/verification/')) {
    // In production, check if user has 'operations' or 'admin' role
    return true; // Placeholder - implement proper auth
  }
  
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileRef = searchParams.get('ref');
    const action = searchParams.get('action') || 'download'; // 'download' or 'view'

    // Validate required parameters
    if (!fileRef) {
      return NextResponse.json(
        { error: "File reference is required" },
        { status: 400 }
      );
    }

    // Validate file reference for security
    if (!validateFileRef(fileRef)) {
      return NextResponse.json(
        { error: "Invalid file reference" },
        { status: 403 }
      );
    }

    // Check permissions (placeholder for future implementation)
    if (!hasDownloadPermission(fileRef)) {
      return NextResponse.json(
        { error: "Insufficient permissions to access this file" },
        { status: 403 }
      );
    }

    // Get Firebase Storage bucket and file
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileRef);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Get file metadata
    const [metadata] = await file.getMetadata();
    const fileName = metadata.metadata?.originalName || fileRef.split('/').pop() || 'document.pdf';
    const fileSize = metadata.size;
    const contentType = metadata.contentType || 'application/pdf';

    // Generate signed URL for download
    const expirationTime = Date.now() + DOWNLOAD_EXPIRATION_TIME;
    const [downloadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: expirationTime,
      responseDisposition: action === 'download' 
        ? `attachment; filename="${fileName}"` 
        : `inline; filename="${fileName}"`,
      responseType: contentType
    });

    // Log download attempt for audit purposes
    console.log(`File ${action} requested:`, {
      fileRef,
      fileName,
      fileSize,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    });

    return NextResponse.json({
      downloadUrl,
      fileName,
      fileSize,
      contentType,
      expiresAt: new Date(expirationTime).toISOString(),
      action
    });

  } catch (error: unknown) {
    console.error("Error generating download URL:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to generate download URL";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileRef, action = 'download' } = body;

    // Validate required fields
    if (!fileRef) {
      return NextResponse.json(
        { error: "File reference is required" },
        { status: 400 }
      );
    }

    // Validate file reference for security
    if (!validateFileRef(fileRef)) {
      return NextResponse.json(
        { error: "Invalid file reference" },
        { status: 403 }
      );
    }

    // Check permissions
    if (!hasDownloadPermission(fileRef)) {
      return NextResponse.json(
        { error: "Insufficient permissions to access this file" },
        { status: 403 }
      );
    }

    // Get Firebase Storage bucket and file
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileRef);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Get file metadata
    const [metadata] = await file.getMetadata();
    const fileName = metadata.metadata?.originalName || fileRef.split('/').pop() || 'document.pdf';
    const fileSize = metadata.size;
    const contentType = metadata.contentType || 'application/pdf';

    // Generate signed URL for download
    const expirationTime = Date.now() + DOWNLOAD_EXPIRATION_TIME;
    const [downloadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: expirationTime,
      responseDisposition: action === 'download' 
        ? `attachment; filename="${fileName}"` 
        : `inline; filename="${fileName}"`,
      responseType: contentType
    });

    // Log download attempt for audit purposes
    console.log(`File ${action} requested via POST:`, {
      fileRef,
      fileName,
      fileSize,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    });

    return NextResponse.json({
      downloadUrl,
      fileName,
      fileSize,
      contentType,
      expiresAt: new Date(expirationTime).toISOString(),
      action
    });

  } catch (error: unknown) {
    console.error("Error generating download URL:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to generate download URL";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}