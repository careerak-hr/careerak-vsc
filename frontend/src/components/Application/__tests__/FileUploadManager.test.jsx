/**
 * Unit Tests: FileUploadManager Component
 * 
 * Feature: apply-page-enhancements
 * Requirements: 4.1, 4.2, 4.5, 4.7, 4.8
 * 
 * Tests cover:
 * - Drag-and-drop functionality
 * - File selection via dialog
 * - Upload progress tracking
 * - File removal
 * - Validation errors (type, size, count)
 * - 10 file limit enforcement
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploadManager from '../FileUploadManager';
import { AppProvider } from '../../../context/AppContext';

// Mock fetch for Cloudinary uploads
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Helper to wrap component with AppProvider
const renderWithProvider = (component, language = 'en') => {
  return render(
    <AppProvider value={{ language }}>
      {component}
    </AppProvider>
  );
};

// Helper to create mock file
const createMockFile = (name, size, type) => {
  const file = new File(['content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('FileUploadManager Component', () => {
  let mockOnFilesChange;
  let mockOnUploadProgress;

  beforeEach(() => {
    mockOnFilesChange = jest.fn();
    mockOnUploadProgress = jest.fn();
    fetch.mockClear();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render drag-and-drop zone', () => {
      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      expect(screen.getByText(/drag files here/i)).toBeInTheDocument();
      expect(screen.getByText(/click to select/i)).toBeInTheDocument();
    });

    test('should render uploaded files section', () => {
      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      expect(screen.getByText(/uploaded files/i)).toBeInTheDocument();
      expect(screen.getByText(/no files uploaded yet/i)).toBeInTheDocument();
    });

    test('should display file count', () => {
      const mockFiles = [
        {
          id: '1',
          name: 'test.pdf',
          size: 1024,
          type: 'application/pdf',
          url: 'https://example.com/test.pdf',
          cloudinaryId: 'test_id'
        }
      ];

      renderWithProvider(
        <FileUploadManager
          files={mockFiles}
          maxFiles={10}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      expect(screen.getByText(/1\/10/)).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    test('should open file dialog on click', () => {
      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByText(/drag files here/i).closest('.drag-drop-zone');
      const fileInput = dropZone.querySelector('input[type="file"]');

      const clickSpy = jest.spyOn(fileInput, 'click');
      fireEvent.click(dropZone);

      expect(clickSpy).toHaveBeenCalled();
    });

    test('should handle file selection via input', async () => {
      // Mock successful upload
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          secure_url: 'https://cloudinary.com/test.pdf',
          public_id: 'test_id'
        })
      });

      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const fileInput = screen.getByRole('button', { hidden: true });
      const file = createMockFile('test.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalled();
      });
    });
  });

  describe('Drag and Drop', () => {
    test('should handle drag enter', () => {
      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByText(/drag files here/i).closest('.drag-drop-zone');

      fireEvent.dragEnter(dropZone);

      expect(dropZone).toHaveClass('dragging');
    });

    test('should handle drag leave', () => {
      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByText(/drag files here/i).closest('.drag-drop-zone');

      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass('dragging');

      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('dragging');
    });

    test('should handle file drop', async () => {
      // Mock successful upload
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          secure_url: 'https://cloudinary.com/test.pdf',
          public_id: 'test_id'
        })
      });

      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByText(/drag files here/i).closest('.drag-drop-zone');
      const file = createMockFile('test.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalled();
      });
    });
  });

  describe('File Validation', () => {
    test('should reject invalid file type', async () => {
      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByText(/drag files here/i).closest('.drag-drop-zone');
      const file = createMockFile('test.txt', 1024, 'text/plain');

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
      });

      expect(mockOnFilesChange).not.toHaveBeenCalled();
    });

    test('should reject oversized file', async () => {
      renderWithProvider(
        <FileUploadManager
          files={[]}
          maxSizePerFile={5}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByText(/drag files here/i).closest('.drag-drop-zone');
      const file = createMockFile('test.pdf', 10 * 1024 * 1024, 'application/pdf'); // 10MB

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await waitFor(() => {
        expect(screen.getByText(/file size exceeds/i)).toBeInTheDocument();
      });

      expect(mockOnFilesChange).not.toHaveBeenCalled();
    });

    test('should enforce 10 file limit', async () => {
      const existingFiles = Array.from({ length: 10 }, (_, i) => ({
        id: `file-${i}`,
        name: `test-${i}.pdf`,
        size: 1024,
        type: 'application/pdf',
        url: `https://example.com/test-${i}.pdf`,
        cloudinaryId: `test_id_${i}`
      }));

      renderWithProvider(
        <FileUploadManager
          files={existingFiles}
          maxFiles={10}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByText(/drag files here/i).closest('.drag-drop-zone');
      const file = createMockFile('test-11.pdf', 1024, 'application/pdf');

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await waitFor(() => {
        expect(screen.getByText(/maximum.*files/i)).toBeInTheDocument();
      });

      expect(mockOnFilesChange).not.toHaveBeenCalled();
    });
  });

  describe('File Upload', () => {
    test('should upload file to Cloudinary', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          secure_url: 'https://cloudinary.com/test.pdf',
          public_id: 'test_id_123'
        })
      });

      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByText(/drag files here/i).closest('.drag-drop-zone');
      const file = createMockFile('test.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('cloudinary.com'),
          expect.objectContaining({
            method: 'POST'
          })
        );
      });

      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'test.pdf',
              url: 'https://cloudinary.com/test.pdf',
              cloudinaryId: 'test_id_123'
            })
          ])
        );
      });
    });

    test('should display upload progress', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          secure_url: 'https://cloudinary.com/test.pdf',
          public_id: 'test_id'
        })
      });

      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByText(/drag files here/i).closest('.drag-drop-zone');
      const file = createMockFile('test.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      // Progress should be displayed during upload
      await waitFor(() => {
        expect(screen.queryByText(/uploading/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    test('should handle upload failure', async () => {
      fetch.mockRejectedValueOnce(new Error('Upload failed'));

      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByText(/drag files here/i).closest('.drag-drop-zone');
      const file = createMockFile('test.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
      });

      expect(mockOnFilesChange).not.toHaveBeenCalled();
    });
  });

  describe('File Removal', () => {
    test('should remove file from list', async () => {
      const mockFiles = [
        {
          id: 'file-1',
          name: 'test.pdf',
          size: 1024,
          type: 'application/pdf',
          url: 'https://example.com/test.pdf',
          cloudinaryId: 'test_id'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      renderWithProvider(
        <FileUploadManager
          files={mockFiles}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const removeButton = screen.getByLabelText(/remove test.pdf/i);
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalledWith([]);
      });
    });

    test('should delete file from Cloudinary', async () => {
      const mockFiles = [
        {
          id: 'file-1',
          name: 'test.pdf',
          size: 1024,
          type: 'application/pdf',
          url: 'https://example.com/test.pdf',
          cloudinaryId: 'test_id_123'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      renderWithProvider(
        <FileUploadManager
          files={mockFiles}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const removeButton = screen.getByLabelText(/remove test.pdf/i);
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/files/delete',
          expect.objectContaining({
            method: 'DELETE',
            body: JSON.stringify({ cloudinaryId: 'test_id_123' })
          })
        );
      });
    });
  });

  describe('Disabled State', () => {
    test('should not accept files when disabled', () => {
      renderWithProvider(
        <FileUploadManager
          files={[]}
          disabled={true}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByText(/drag files here/i).closest('.drag-drop-zone');
      expect(dropZone).toHaveClass('disabled');

      const file = createMockFile('test.pdf', 1024, 'application/pdf');
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      expect(mockOnFilesChange).not.toHaveBeenCalled();
    });

    test('should disable remove buttons when disabled', () => {
      const mockFiles = [
        {
          id: 'file-1',
          name: 'test.pdf',
          size: 1024,
          type: 'application/pdf',
          url: 'https://example.com/test.pdf',
          cloudinaryId: 'test_id'
        }
      ];

      renderWithProvider(
        <FileUploadManager
          files={mockFiles}
          disabled={true}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const removeButton = screen.getByLabelText(/remove test.pdf/i);
      expect(removeButton).toBeDisabled();
    });
  });

  describe('Multi-language Support', () => {
    test('should render in Arabic', () => {
      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />,
        'ar'
      );

      expect(screen.getByText(/اسحب الملفات هنا/)).toBeInTheDocument();
    });

    test('should render in French', () => {
      renderWithProvider(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />,
        'fr'
      );

      expect(screen.getByText(/Glissez les fichiers ici/)).toBeInTheDocument();
    });
  });
});
