/**
 * Tests for useVerificationFileUpload Hook
 * Tests the file upload logic and state management
 */
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVerificationFileUpload } from '../useVerificationFileUpload';

// Mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console methods to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('useVerificationFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  const createMockFile = (name: string, type: string, size: number): File => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useVerificationFileUpload());

      expect(result.current.isUploading).toBe(false);
      expect(result.current.uploadProgress).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.fileRef).toBeNull();
      expect(result.current.uploadedFile).toBeNull();
      expect(typeof result.current.uploadFile).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('Successful Upload', () => {
    it('should handle successful PDF upload', async () => {
      const mockSignedUrlResponse = {
        success: true,
        uploadUrl: 'https://storage.googleapis.com/test-bucket/upload-url',
        fileRef: 'verification-files/test-file-123.pdf',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };

      // Mock signed URL generation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSignedUrlResponse,
      });

      // Mock file upload to signed URL
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('verification.pdf', 'application/pdf', 1024000);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.uploadProgress).toBe(100);
      expect(result.current.error).toBeNull();
      expect(result.current.fileRef).toBe('verification-files/test-file-123.pdf');
      expect(result.current.uploadedFile).toEqual({
        name: 'verification.pdf',
        size: 1024000,
        type: 'application/pdf',
        ref: 'verification-files/test-file-123.pdf',
      });
    });

    it('should handle successful image upload', async () => {
      const mockSignedUrlResponse = {
        success: true,
        uploadUrl: 'https://storage.googleapis.com/test-bucket/image-upload',
        fileRef: 'verification-files/document-456.jpg',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSignedUrlResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('document.jpg', 'image/jpeg', 512000);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.fileRef).toBe('verification-files/document-456.jpg');
      expect(result.current.uploadedFile?.type).toBe('image/jpeg');
    });

    it('should update progress during upload', async () => {
      const mockSignedUrlResponse = {
        success: true,
        uploadUrl: 'https://storage.googleapis.com/test-bucket/upload-url',
        fileRef: 'verification-files/test-file.pdf',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSignedUrlResponse,
      });

      let resolveUpload: (value: any) => void;
      const uploadPromise = new Promise(resolve => {
        resolveUpload = resolve;
      });
      mockFetch.mockReturnValueOnce(uploadPromise);

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('test.pdf', 'application/pdf', 1024);

      act(() => {
        result.current.uploadFile(file);
      });

      expect(result.current.isUploading).toBe(true);
      expect(result.current.uploadProgress).toBeGreaterThan(0);

      await act(async () => {
        resolveUpload!({
          ok: true,
          status: 200,
        });
        await uploadPromise;
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.uploadProgress).toBe(100);
    });
  });

  describe('File Validation', () => {
    it('should reject files that are too large', async () => {
      const { result } = renderHook(() => useVerificationFileUpload());
      const largeFile = createMockFile('large.pdf', 'application/pdf', 11 * 1024 * 1024); // 11MB

      await act(async () => {
        await result.current.uploadFile(largeFile);
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toContain('File size too large');
      expect(result.current.fileRef).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should reject unsupported file types', async () => {
      const { result } = renderHook(() => useVerificationFileUpload());
      const unsupportedFile = createMockFile('script.exe', 'application/x-executable', 1024);

      await act(async () => {
        await result.current.uploadFile(unsupportedFile);
      });

      expect(result.current.error).toContain('Unsupported file type');
      expect(result.current.fileRef).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should reject empty files', async () => {
      const { result } = renderHook(() => useVerificationFileUpload());
      const emptyFile = createMockFile('empty.pdf', 'application/pdf', 0);

      await act(async () => {
        await result.current.uploadFile(emptyFile);
      });

      expect(result.current.error).toContain('File cannot be empty');
      expect(result.current.fileRef).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should accept valid file types', async () => {
      const validTypes = [
        { name: 'document.pdf', type: 'application/pdf' },
        { name: 'image.jpg', type: 'image/jpeg' },
        { name: 'image.png', type: 'image/png' },
        { name: 'document.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      ];

      for (const fileType of validTypes) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            uploadUrl: 'https://example.com/upload',
            fileRef: `verification-files/${fileType.name}`,
            expiresAt: new Date().toISOString(),
          }),
        });

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
        });

        const { result } = renderHook(() => useVerificationFileUpload());
        const file = createMockFile(fileType.name, fileType.type, 1024);

        await act(async () => {
          await result.current.uploadFile(file);
        });

        expect(result.current.error).toBeNull();
        expect(result.current.fileRef).toBeTruthy();

        vi.clearAllMocks();
      }
    });
  });

  describe('Signed URL Generation Errors', () => {
    it('should handle signed URL generation failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'Failed to generate upload URL',
        }),
      });

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('test.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toBe('Failed to generate upload URL');
      expect(result.current.fileRef).toBeNull();
    });

    it('should handle network errors during signed URL generation', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('test.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.error).toContain('Network error');
      expect(result.current.fileRef).toBeNull();
    });

    it('should handle malformed signed URL response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('test.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.error).toContain('Failed to parse response');
      expect(result.current.fileRef).toBeNull();
    });
  });

  describe('File Upload Errors', () => {
    it('should handle file upload failure', async () => {
      const mockSignedUrlResponse = {
        success: true,
        uploadUrl: 'https://storage.googleapis.com/test-bucket/upload-url',
        fileRef: 'verification-files/test-file.pdf',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSignedUrlResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('test.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toContain('Upload failed');
      expect(result.current.fileRef).toBeNull();
    });

    it('should handle network errors during file upload', async () => {
      const mockSignedUrlResponse = {
        success: true,
        uploadUrl: 'https://storage.googleapis.com/test-bucket/upload-url',
        fileRef: 'verification-files/test-file.pdf',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSignedUrlResponse,
      });

      mockFetch.mockRejectedValueOnce(new Error('Upload network error'));

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('test.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.error).toContain('Upload network error');
      expect(result.current.fileRef).toBeNull();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset state to initial values', async () => {
      // First, upload a file to change state
      const mockSignedUrlResponse = {
        success: true,
        uploadUrl: 'https://storage.googleapis.com/test-bucket/upload-url',
        fileRef: 'verification-files/test-file.pdf',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSignedUrlResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('test.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.fileRef).toBeTruthy();
      expect(result.current.uploadedFile).toBeTruthy();

      // Now reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.uploadProgress).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.fileRef).toBeNull();
      expect(result.current.uploadedFile).toBeNull();
    });

    it('should reset after errors', async () => {
      const { result } = renderHook(() => useVerificationFileUpload());
      const largeFile = createMockFile('large.pdf', 'application/pdf', 11 * 1024 * 1024);

      await act(async () => {
        await result.current.uploadFile(largeFile);
      });

      expect(result.current.error).toBeTruthy();

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Request Format', () => {
    it('should send correct signed URL request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          uploadUrl: 'https://example.com/upload',
          fileRef: 'verification-files/test.pdf',
          expiresAt: new Date().toISOString(),
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('test.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/upload/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: 'test.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
        }),
      });
    });

    it('should send correct file upload request', async () => {
      const uploadUrl = 'https://storage.googleapis.com/test-bucket/upload-url';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          uploadUrl,
          fileRef: 'verification-files/test.pdf',
          expiresAt: new Date().toISOString(),
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('test.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(mockFetch).toHaveBeenCalledWith(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/pdf',
        },
        body: file,
      });
    });
  });

  describe('Concurrent Uploads', () => {
    it('should prevent multiple simultaneous uploads', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useVerificationFileUpload());
      const file1 = createMockFile('test1.pdf', 'application/pdf', 1024);
      const file2 = createMockFile('test2.pdf', 'application/pdf', 1024);

      // Start first upload
      act(() => {
        result.current.uploadFile(file1);
      });

      expect(result.current.isUploading).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Try to start second upload
      act(() => {
        result.current.uploadFile(file2);
      });

      // Should not make another request
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.current.isUploading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({
            success: true,
            uploadUrl: 'https://example.com/upload',
            fileRef: 'verification-files/test1.pdf',
            expiresAt: new Date().toISOString(),
          }),
        });
        await promise;
      });

      // Mock the actual file upload
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      // Wait for the upload to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isUploading).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle files with special characters in names', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          uploadUrl: 'https://example.com/upload',
          fileRef: 'verification-files/special-file.pdf',
          expiresAt: new Date().toISOString(),
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('José\'s "Document" & More.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.fileRef).toBeTruthy();
    });

    it('should handle very small files', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          uploadUrl: 'https://example.com/upload',
          fileRef: 'verification-files/tiny.pdf',
          expiresAt: new Date().toISOString(),
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() => useVerificationFileUpload());
      const file = createMockFile('tiny.pdf', 'application/pdf', 1); // 1 byte

      await act(async () => {
        await result.current.uploadFile(file);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.fileRef).toBeTruthy();
    });
  });
});