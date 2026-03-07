/**
 * Unit Tests: FileUploadService
 * 
 * Tests for file upload service functionality including:
 * - File validation (type, size)
 * - File upload to Cloudinary
 * - File deletion from Cloudinary
 * - Error handling
 * - Retry logic
 * 
 * Requirements: 4.3, 4.4, 4.6, 4.9
 * Feature: apply-page-enhancements
 */

// Mock Cloudinary before requiring FileUploadService
jest.mock('../src/config/cloudinary', () => ({
  uploader: {
    destroy: jest.fn(),
    upload_stream: jest.fn()
  }
}));

const FileUploadService = require('../src/services/FileUploadService');
const cloudinary = require('../src/config/cloudinary');
const { Readable } = require('stream');

describe('FileUploadService - Unit Tests', () => {
  let fileUploadService;

  beforeAll(() => {
    fileUploadService = new FileUploadService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFile', () => {
    describe('Valid files', () => {
      test('should accept PDF file with valid size', () => {
        const file = {
          mimetype: 'application/pdf',
          size: 3 * 1024 * 1024, // 3MB
          originalname: 'resume.pdf'
        };

        const result = fileUploadService.validateFile(file);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      test('should accept DOC file with valid size', () => {
        const file = {
          mimetype: 'application/msword',
          size: 2 * 1024 * 1024, // 2MB
          originalname: 'cover-letter.doc'
        };

        const result = fileUploadService.validateFile(file);

        expect(result.valid).toBe(true);
      });

      test('should accept DOCX file with valid size', () => {
        const file = {
          mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 4 * 1024 * 1024, // 4MB
          originalname: 'certificate.docx'
        };

        const result = fileUploadService.validateFile(file);

        expect(result.valid).toBe(true);
      });

      test('should accept JPEG file with valid size', () => {
        const file = {
          mimetype: 'image/jpeg',
          size: 1 * 1024 * 1024, // 1MB
          originalname: 'photo.jpg'
        };

        const result = fileUploadService.validateFile(file);

        expect(result.valid).toBe(true);
      });

      test('should accept PNG file with valid size', () => {
        const file = {
          mimetype: 'image/png',
          size: 2 * 1024 * 1024, // 2MB
          originalname: 'screenshot.png'
        };

        const result = fileUploadService.validateFile(file);

        expect(result.valid).toBe(true);
      });

      test('should accept file with exactly 5MB size', () => {
        const file = {
          mimetype: 'application/pdf',
          size: 5 * 1024 * 1024, // Exactly 5MB
          originalname: 'large-file.pdf'
        };

        const result = fileUploadService.validateFile(file);

        expect(result.valid).toBe(true);
      });
    });

    describe('Invalid file types', () => {
      test('should reject text file', () => {
        const file = {
          mimetype: 'text/plain',
          size: 1 * 1024 * 1024,
          originalname: 'document.txt'
        };

        const result = fileUploadService.validateFile(file);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid file type');
        expect(result.error).toContain('text/plain');
      });

      test('should reject ZIP file', () => {
        const file = {
          mimetype: 'application/zip',
          size: 2 * 1024 * 1024,
          originalname: 'archive.zip'
        };

        const result = fileUploadService.validateFile(file);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid file type');
      });

      test('should reject video file', () => {
        const file = {
          mimetype: 'video/mp4',
          size: 3 * 1024 * 1024,
          originalname: 'video.mp4'
        };

        const result = fileUploadService.validateFile(file);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid file type');
      });
    });

    describe('Invalid file sizes', () => {
      test('should reject file larger than 5MB', () => {
        const file = {
          mimetype: 'application/pdf',
          size: 6 * 1024 * 1024, // 6MB
          originalname: 'large-file.pdf'
        };

        const result = fileUploadService.validateFile(file);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('File size exceeds 5MB limit');
        expect(result.error).toContain('6.00MB');
      });

      test('should reject file with 5MB + 1 byte', () => {
        const file = {
          mimetype: 'application/pdf',
          size: 5 * 1024 * 1024 + 1,
          originalname: 'file.pdf'
        };

        const result = fileUploadService.validateFile(file);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('File size exceeds 5MB limit');
      });
    });

    describe('Edge cases', () => {
      test('should reject null file', () => {
        const result = fileUploadService.validateFile(null);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('No file provided');
      });

      test('should reject undefined file', () => {
        const result = fileUploadService.validateFile(undefined);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('No file provided');
      });

      test('should reject file with missing mimetype', () => {
        const file = {
          size: 1 * 1024 * 1024,
          originalname: 'file.pdf'
        };

        const result = fileUploadService.validateFile(file);

        expect(result.valid).toBe(false);
      });
    });
  });

  describe('deleteFile', () => {
    test('should successfully delete file from Cloudinary', async () => {
      // Arrange
      cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });
      const cloudinaryId = 'careerak/applications/test-file';
      const resourceType = 'raw';

      // Act
      const result = await fileUploadService.deleteFile(cloudinaryId, resourceType);

      // Assert
      expect(result.success).toBe(true);
      expect(result.cloudinaryId).toBe(cloudinaryId);
      expect(result.message).toContain('deleted successfully');
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        cloudinaryId,
        expect.objectContaining({
          resource_type: resourceType,
          invalidate: true
        })
      );
    });

    test('should handle non-existent file gracefully', async () => {
      // Arrange
      cloudinary.uploader.destroy.mockResolvedValue({ result: 'not found' });
      const cloudinaryId = 'careerak/applications/non-existent';

      // Act
      const result = await fileUploadService.deleteFile(cloudinaryId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('not found');
    });

    test('should throw error for empty cloudinaryId', async () => {
      // Act & Assert
      await expect(
        fileUploadService.deleteFile('')
      ).rejects.toThrow('Cloudinary ID is required for deletion');

      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });

    test('should throw error for null cloudinaryId', async () => {
      // Act & Assert
      await expect(
        fileUploadService.deleteFile(null)
      ).rejects.toThrow('Cloudinary ID is required for deletion');
    });

    test('should throw error when Cloudinary deletion fails', async () => {
      // Arrange
      cloudinary.uploader.destroy.mockRejectedValue(new Error('Network error'));
      const cloudinaryId = 'careerak/applications/test-file';

      // Act & Assert
      await expect(
        fileUploadService.deleteFile(cloudinaryId)
      ).rejects.toThrow('Failed to delete file from Cloudinary');
    });

    test('should invalidate CDN cache on deletion', async () => {
      // Arrange
      cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });
      const cloudinaryId = 'careerak/applications/test-file';

      // Act
      await fileUploadService.deleteFile(cloudinaryId);

      // Assert
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        cloudinaryId,
        expect.objectContaining({
          invalidate: true
        })
      );
    });
  });

  describe('deleteMultipleFiles', () => {
    test('should delete all files successfully', async () => {
      // Arrange
      cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });
      const files = [
        { cloudinaryId: 'file1', type: 'image/jpeg' },
        { cloudinaryId: 'file2', type: 'application/pdf' },
        { cloudinaryId: 'file3', type: 'image/png' }
      ];

      // Act
      const results = await fileUploadService.deleteMultipleFiles(files);

      // Assert
      expect(results).toHaveLength(3);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    test('should handle partial failures', async () => {
      // Arrange
      cloudinary.uploader.destroy
        .mockResolvedValueOnce({ result: 'ok' })
        .mockRejectedValueOnce(new Error('Deletion failed'))
        .mockResolvedValueOnce({ result: 'ok' });

      const files = [
        { cloudinaryId: 'file1', type: 'image/jpeg' },
        { cloudinaryId: 'file2', type: 'application/pdf' },
        { cloudinaryId: 'file3', type: 'image/png' }
      ];

      // Act
      const results = await fileUploadService.deleteMultipleFiles(files);

      // Assert
      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
      expect(results[2].success).toBe(true);
    });

    test('should use correct resource type for images', async () => {
      // Arrange
      cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });
      const files = [
        { cloudinaryId: 'image1', type: 'image/jpeg' },
        { cloudinaryId: 'image2', type: 'image/png' }
      ];

      // Act
      await fileUploadService.deleteMultipleFiles(files);

      // Assert
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        'image1',
        expect.objectContaining({ resource_type: 'image' })
      );
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        'image2',
        expect.objectContaining({ resource_type: 'image' })
      );
    });

    test('should use correct resource type for documents', async () => {
      // Arrange
      cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });
      const files = [
        { cloudinaryId: 'doc1', type: 'application/pdf' },
        { cloudinaryId: 'doc2', type: 'application/msword' }
      ];

      // Act
      await fileUploadService.deleteMultipleFiles(files);

      // Assert
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        'doc1',
        expect.objectContaining({ resource_type: 'raw' })
      );
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        'doc2',
        expect.objectContaining({ resource_type: 'raw' })
      );
    });
  });

  describe('Utility methods', () => {
    describe('getFileExtension', () => {
      test('should return correct extension for PDF', () => {
        expect(fileUploadService.getFileExtension('application/pdf')).toBe('pdf');
      });

      test('should return correct extension for DOC', () => {
        expect(fileUploadService.getFileExtension('application/msword')).toBe('doc');
      });

      test('should return correct extension for DOCX', () => {
        expect(fileUploadService.getFileExtension('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('docx');
      });

      test('should return correct extension for JPEG', () => {
        expect(fileUploadService.getFileExtension('image/jpeg')).toBe('jpg');
      });

      test('should return correct extension for PNG', () => {
        expect(fileUploadService.getFileExtension('image/png')).toBe('png');
      });

      test('should return unknown for unsupported mimetype', () => {
        expect(fileUploadService.getFileExtension('application/unknown')).toBe('unknown');
      });
    });

    describe('formatFileSize', () => {
      test('should format bytes correctly', () => {
        expect(fileUploadService.formatFileSize(0)).toBe('0 Bytes');
        expect(fileUploadService.formatFileSize(500)).toBe('500 Bytes');
      });

      test('should format KB correctly', () => {
        expect(fileUploadService.formatFileSize(1024)).toBe('1 KB');
        expect(fileUploadService.formatFileSize(2048)).toBe('2 KB');
      });

      test('should format MB correctly', () => {
        expect(fileUploadService.formatFileSize(1024 * 1024)).toBe('1 MB');
        expect(fileUploadService.formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
      });

      test('should format GB correctly', () => {
        expect(fileUploadService.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      });
    });
  });

  describe('Configuration', () => {
    test('should have correct allowed file types', () => {
      expect(fileUploadService.ALLOWED_TYPES).toContain('application/pdf');
      expect(fileUploadService.ALLOWED_TYPES).toContain('application/msword');
      expect(fileUploadService.ALLOWED_TYPES).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(fileUploadService.ALLOWED_TYPES).toContain('image/jpeg');
      expect(fileUploadService.ALLOWED_TYPES).toContain('image/jpg');
      expect(fileUploadService.ALLOWED_TYPES).toContain('image/png');
    });

    test('should have correct max file size (5MB)', () => {
      expect(fileUploadService.MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    });

    test('should have correct retry configuration', () => {
      expect(fileUploadService.MAX_RETRIES).toBe(3);
      expect(fileUploadService.RETRY_DELAY).toBe(1000);
    });
  });
});
