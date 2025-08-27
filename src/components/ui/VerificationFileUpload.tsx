'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Loader2,
  Download,
  Eye
} from 'lucide-react';
import { ApplicationService, FileUploadResponse, ValidationError } from '@/lib/application-service';

interface VerificationFileUploadProps {
  onFileUpload?: (fileRef: string, fileName: string) => void;
  onFileRemove?: () => void;
  onError?: (error: string) => void;
  existingFileRef?: string;
  existingFileName?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  fileName: string | null;
  fileRef: string | null;
}

export default function VerificationFileUpload({
  onFileUpload,
  onFileRemove,
  onError,
  existingFileRef,
  existingFileName,
  disabled = false,
  className = '',
  required = false
}: VerificationFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    fileName: existingFileName || null,
    fileRef: existingFileRef || null
  });

  // Reset upload state
  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      fileName: null,
      fileRef: null
    });
  }, []);

  // Validate file before upload
  const validateFile = useCallback((file: File): ValidationError[] => {
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
  }, []);

  // Handle file upload with progress tracking
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      // Reset any previous errors
      setUploadState(prev => ({ ...prev, error: null, progress: 0 }));

      // Validate file
      const validationErrors = validateFile(file);
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors[0].message;
        setUploadState(prev => ({ ...prev, error: errorMessage }));
        if (onError) {
          onError(errorMessage);
        }
        return;
      }

      // Start upload
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: true, 
        progress: 0,
        fileName: file.name 
      }));

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

        // Notify parent component
        if (onFileUpload) {
          onFileUpload(uploadResult.fileRef, file.name);
        }

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

        if (onError) {
          onError(errorMessage);
        }
      }

    } catch (error) {
      console.error('File upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'File upload failed. Please try again.';
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: errorMessage
      }));

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [validateFile, onFileUpload, onError]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input value to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileUpload]);

  // Handle file removal
  const handleFileRemove = useCallback(() => {
    resetUploadState();
    if (onFileRemove) {
      onFileRemove();
    }
  }, [resetUploadState, onFileRemove]);

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (disabled) return;

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [disabled, handleFileUpload]);

  // Generate download URL for operations team (placeholder - would need backend implementation)
  const generateDownloadUrl = useCallback((fileRef: string) => {
    // This would typically call an API endpoint to generate a secure download URL
    // For now, return a placeholder
    return `/api/files/download?ref=${encodeURIComponent(fileRef)}`;
  }, []);

  const hasFile = uploadState.fileName || existingFileName;
  const currentFileRef = uploadState.fileRef || existingFileRef;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Upload Verification Document {required && '*'}
      </label>
      
      {/* Upload Area */}
      <div
        className={`
          file-upload-mobile border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors touch-target
          ${disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-gray-400 cursor-pointer active:border-arena-gold active:bg-arena-cream'}
          ${uploadState.error ? 'border-red-300 bg-red-50' : ''}
          ${hasFile && !uploadState.error ? 'border-green-300 bg-green-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          disabled={disabled || uploadState.isUploading}
          className="hidden"
          id="verification-file-upload"
          style={{ fontSize: '16px' }} // Prevents zoom on iOS
        />

        {uploadState.isUploading ? (
          // Uploading state
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Uploading {uploadState.fileName}...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{uploadState.progress}% complete</p>
            </div>
          </div>
        ) : hasFile ? (
          // File uploaded state
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <FileText className="w-8 h-8" />
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                {uploadState.fileName || existingFileName}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                {currentFileRef && (
                  <>
                    <button
                      type="button"
                      onClick={() => window.open(generateDownloadUrl(currentFileRef), '_blank')}
                      className="touch-target-sm inline-flex items-center space-x-1 px-3 py-2 text-xs text-blue-600 hover:text-blue-800 active:text-blue-900 transition-colors rounded-md hover:bg-blue-50"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generateDownloadUrl(currentFileRef);
                        link.download = uploadState.fileName || existingFileName || 'verification-document.pdf';
                        link.click();
                      }}
                      className="touch-target-sm inline-flex items-center space-x-1 px-3 py-2 text-xs text-blue-600 hover:text-blue-800 active:text-blue-900 transition-colors rounded-md hover:bg-blue-50"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleFileRemove}
                  disabled={disabled}
                  className="touch-target-sm inline-flex items-center space-x-1 px-3 py-2 text-xs text-red-600 hover:text-red-800 active:text-red-900 transition-colors disabled:opacity-50 rounded-md hover:bg-red-50"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <X className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Default upload state
          <label htmlFor="verification-file-upload" className={`block w-full ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <Upload className={`w-8 h-8 mx-auto mb-3 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
            <p className={`mobile-text-base mb-2 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="block sm:inline">Tap to upload</span>
              <span className="hidden sm:inline"> or drag and drop</span>
            </p>
            <p className={`mobile-text-sm ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
              PDF only, max 10MB
            </p>
          </label>
        )}
      </div>

      {/* Error Display */}
      {uploadState.error && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{uploadState.error}</p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Upload a verification letter from your CPA or attorney</p>
        <p>• Document must confirm your accredited investor status</p>
        <p>• File will be securely stored and accessible to our operations team</p>
      </div>
    </div>
  );
}