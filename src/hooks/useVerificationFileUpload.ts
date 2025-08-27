'use client';

import { useState, useCallback } from 'react';
import { ApplicationService, FileUploadResponse, ValidationError } from '@/lib/application-service';

interface VerificationFileState {
  isUploading: boolean;
  progress: number;
  fileName: string | null;
  fileRef: string | null;
  error: string | null;
}

interface UseVerificationFileUploadReturn {
  uploadState: VerificationFileState;
  uploadFile: (file: File) => Promise<void>;
  removeFile: () => void;
  resetState: () => void;
  generateDownloadUrl: (fileRef: string) => string;
}

export function useVerificationFileUpload(): UseVerificationFileUploadReturn {
  const [uploadState, setUploadState] = useState<VerificationFileState>({
    isUploading: false,
    progress: 0,
    fileName: null,
    fileRef: null,
    error: null
  });

  // Reset upload state
  const resetState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      fileName: null,
      fileRef: null,
      error: null
    });
  }, []);

  // Remove file
  const removeFile = useCallback(() => {
    resetState();
  }, [resetState]);

  // Generate download URL for operations team
  const generateDownloadUrl = useCallback((fileRef: string) => {
    return `/api/files/download?ref=${encodeURIComponent(fileRef)}&action=view`;
  }, []);

  // Upload file with progress tracking and enhanced error handling
  const uploadFile = useCallback(async (file: File) => {
    try {
      // Reset any previous errors
      setUploadState(prev => ({ 
        ...prev, 
        error: null, 
        progress: 0,
        isUploading: true,
        fileName: file.name 
      }));

      // Validate file before upload
      const validationErrors = validateVerificationFile(file);
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors[0].message;
        setUploadState(prev => ({ 
          ...prev, 
          error: errorMessage,
          isUploading: false 
        }));
        return;
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadState(prev => {
          if (prev.progress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 200);

      // Upload file using ApplicationService
      const uploadResult: FileUploadResponse = await ApplicationService.uploadVerificationDocument(file);
      
      // Clear progress interval
      clearInterval(progressInterval);

      if (uploadResult.success && uploadResult.fileRef) {
        // Success
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: 100,
          fileRef: uploadResult.fileRef!,
          fileName: file.name,
          error: null
        }));

        // Clear progress after a delay
        setTimeout(() => {
          setUploadState(prev => ({ ...prev, progress: 0 }));
        }, 2000);

      } else {
        // Upload failed
        const errorMessage = uploadResult.error || 'File upload failed';
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: 0,
          error: errorMessage
        }));
      }

    } catch (error) {
      console.error('Verification file upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'File upload failed. Please try again.';
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: errorMessage
      }));
    }
  }, []);

  return {
    uploadState,
    uploadFile,
    removeFile,
    resetState,
    generateDownloadUrl
  };
}

// Validation helper function
function validateVerificationFile(file: File): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check file size (10MB limit for verification documents)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push({
      field: 'verificationFile',
      message: 'File size must be less than 10MB',
      code: 'FILE_TOO_LARGE'
    });
  }

  // Check file type (PDF only)
  if (file.type !== 'application/pdf') {
    errors.push({
      field: 'verificationFile',
      message: 'Only PDF files are allowed for verification documents',
      code: 'INVALID_FILE_TYPE'
    });
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (extension !== '.pdf') {
    errors.push({
      field: 'verificationFile',
      message: 'Only .pdf files are allowed for verification documents',
      code: 'INVALID_FILE_EXTENSION'
    });
  }

  // Check file name length
  if (file.name.length > 255) {
    errors.push({
      field: 'verificationFile',
      message: 'File name is too long (maximum 255 characters)',
      code: 'FILENAME_TOO_LONG'
    });
  }

  // Check for empty file
  if (file.size === 0) {
    errors.push({
      field: 'verificationFile',
      message: 'File appears to be empty',
      code: 'EMPTY_FILE'
    });
  }

  return errors;
}