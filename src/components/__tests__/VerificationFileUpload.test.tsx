import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import VerificationFileUpload from '@/components/ui/VerificationFileUpload';
import { ApplicationService } from '@/lib/application-service';

// Mock ApplicationService
vi.mock('@/lib/application-service', () => ({
  ApplicationService: {
    uploadVerificationDocument: vi.fn()
  }
}));

const mockApplicationService = ApplicationService as any;

describe('VerificationFileUpload', () => {
  const mockOnFileUpload = vi.fn();
  const mockOnFileRemove = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area correctly', () => {
    render(
      <VerificationFileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('Upload Verification Document')).toBeInTheDocument();
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('PDF only, max 10MB')).toBeInTheDocument();
  });

  it('shows required indicator when required prop is true', () => {
    render(
      <VerificationFileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        onError={mockOnError}
        required={true}
      />
    );

    expect(screen.getByText('Upload Verification Document *')).toBeInTheDocument();
  });

  it('validates file type and shows error for non-PDF files', async () => {
    render(
      <VerificationFileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        onError={mockOnError}
      />
    );

    const fileInput = document.getElementById('verification-file-upload') as HTMLInputElement;
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText('Only PDF files are allowed for verification documents')).toBeInTheDocument();
    });

    expect(mockOnError).toHaveBeenCalledWith('Only PDF files are allowed for verification documents');
    expect(mockOnFileUpload).not.toHaveBeenCalled();
  });

  it('validates file size and shows error for files over 10MB', async () => {
    render(
      <VerificationFileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        onError={mockOnError}
      />
    );

    const fileInput = document.getElementById('verification-file-upload') as HTMLInputElement;
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText('File size must be less than 10MB')).toBeInTheDocument();
    });

    expect(mockOnError).toHaveBeenCalledWith('File size must be less than 10MB');
    expect(mockOnFileUpload).not.toHaveBeenCalled();
  });

  it('successfully uploads valid PDF file', async () => {
    mockApplicationService.uploadVerificationDocument.mockResolvedValue({
      success: true,
      fileRef: 'applications/verification/123-test.pdf',
      expiresAt: '2024-01-01T00:00:00Z'
    });

    render(
      <VerificationFileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        onError={mockOnError}
      />
    );

    const fileInput = document.getElementById('verification-file-upload') as HTMLInputElement;
    const validFile = new File(['test pdf content'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Should show uploading state
    await waitFor(() => {
      expect(screen.getByText('Uploading test.pdf...')).toBeInTheDocument();
    });

    // Should complete upload
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Download')).toBeInTheDocument();
      expect(screen.getByText('Remove')).toBeInTheDocument();
    });

    expect(mockApplicationService.uploadVerificationDocument).toHaveBeenCalledWith(validFile);
    expect(mockOnFileUpload).toHaveBeenCalledWith('applications/verification/123-test.pdf', 'test.pdf');
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('handles upload failure gracefully', async () => {
    mockApplicationService.uploadVerificationDocument.mockResolvedValue({
      success: false,
      error: 'Upload failed due to network error'
    });

    render(
      <VerificationFileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        onError={mockOnError}
      />
    );

    const fileInput = document.getElementById('verification-file-upload') as HTMLInputElement;
    const validFile = new File(['test pdf content'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.getByText('Upload failed due to network error')).toBeInTheDocument();
    });

    expect(mockOnError).toHaveBeenCalledWith('Upload failed due to network error');
    expect(mockOnFileUpload).not.toHaveBeenCalled();
  });

  it('shows existing file when existingFileRef is provided', () => {
    render(
      <VerificationFileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        onError={mockOnError}
        existingFileRef="applications/verification/existing.pdf"
        existingFileName="existing-document.pdf"
      />
    );

    expect(screen.getByText('existing-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('calls onFileRemove when remove button is clicked', () => {
    render(
      <VerificationFileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        onError={mockOnError}
        existingFileRef="applications/verification/existing.pdf"
        existingFileName="existing-document.pdf"
      />
    );

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(mockOnFileRemove).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <VerificationFileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        onError={mockOnError}
        disabled={true}
      />
    );

    const fileInput = document.getElementById('verification-file-upload') as HTMLInputElement;
    expect(fileInput).toBeDisabled();
  });

  it('shows help text with verification document requirements', () => {
    render(
      <VerificationFileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('• Upload a verification letter from your CPA or attorney')).toBeInTheDocument();
    expect(screen.getByText('• Document must confirm your accredited investor status')).toBeInTheDocument();
    expect(screen.getByText('• File will be securely stored and accessible to our operations team')).toBeInTheDocument();
  });
});