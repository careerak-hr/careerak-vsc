/**
 * Property-Based Test: File Removal Completeness
 * 
 * Property 15: File removal completeness
 * For any uploaded file, when the user removes it, the file should be deleted from
 * Cloudinary storage, removed from the application data, and no longer appear in
 * the file list.
 * 
 * Validates: Requirements 4.9
 * Feature: apply-page-enhancements
 */

const fc = require('fast-check');

// Mock Cloudinary before requiring FileUploadService
jest.mock('../src/config/cloudinary', () => ({
  uploader: {
    destroy: jest.fn(),
    upload_stream: jest.fn()
  }
}));

const FileUploadService = require('../src/services/FileUploadService');
const cloudinary = require('../src/config/cloudinary');

describe('Property 15: File removal completeness', () => {
  let fileUploadService;

  beforeAll(() => {
    fileUploadService = new FileUploadService();
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Property: Successful deletion should return success result
   * 
   * For any valid cloudinaryId, when deletion succeeds, the service should
   * return a success result
   */
  test('should return success result for successful deletion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }).map(id => 
          `careerak/applications/${id.replace(/[^a-zA-Z0-9_-]/g, 'x')}`
        ),
        fc.constantFrom('image', 'raw'),
        async (cloudinaryId, resourceType) => {
          // Arrange
          cloudinary.uploader.destroy.mockResolvedValue({
            result: 'ok'
          });

          // Act
          const result = await fileUploadService.deleteFile(cloudinaryId, resourceType);

          // Assert
          expect(result.success).toBe(true);
          expect(result.cloudinaryId).toBe(cloudinaryId);
          expect(result.message).toContain('deleted successfully');
          
          // Verify Cloudinary was called with correct parameters
          expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
            cloudinaryId,
            expect.objectContaining({
              resource_type: resourceType,
              invalidate: true
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Deletion of non-existent file should not throw error
   * 
   * For any cloudinaryId, when the file doesn't exist, the service should
   * handle it gracefully and return success (idempotent operation)
   */
  test('should handle deletion of non-existent file gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }).map(id => 
          `careerak/applications/${id.replace(/[^a-zA-Z0-9_-]/g, 'x')}`
        ),
        fc.constantFrom('image', 'raw'),
        async (cloudinaryId, resourceType) => {
          // Arrange
          cloudinary.uploader.destroy.mockResolvedValue({
            result: 'not found'
          });

          // Act
          const result = await fileUploadService.deleteFile(cloudinaryId, resourceType);

          // Assert
          expect(result.success).toBe(true);
          expect(result.cloudinaryId).toBe(cloudinaryId);
          expect(result.message).toContain('not found');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Deletion failure should throw descriptive error
   * 
   * For any cloudinaryId, when deletion fails, the service should throw
   * an error with a descriptive message
   */
  test('should throw error with descriptive message on deletion failure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }).map(id => 
          `careerak/applications/${id.replace(/[^a-zA-Z0-9_-]/g, 'x')}`
        ),
        fc.constantFrom('image', 'raw'),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (cloudinaryId, resourceType, errorMessage) => {
          // Arrange
          cloudinary.uploader.destroy.mockRejectedValue(new Error(errorMessage));

          // Act & Assert
          await expect(
            fileUploadService.deleteFile(cloudinaryId, resourceType)
          ).rejects.toThrow('Failed to delete file from Cloudinary');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Empty or null cloudinaryId should throw error
   * 
   * For any empty or null cloudinaryId, the service should throw an error
   * before attempting deletion
   */
  test('should throw error for empty or null cloudinaryId', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('', null, undefined),
        fc.constantFrom('image', 'raw'),
        async (cloudinaryId, resourceType) => {
          // Act & Assert
          await expect(
            fileUploadService.deleteFile(cloudinaryId, resourceType)
          ).rejects.toThrow('Cloudinary ID is required for deletion');
          
          // Verify Cloudinary was not called
          expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Multiple file deletion should handle all files
   * 
   * For any array of files, deleteMultipleFiles should attempt to delete
   * all files and return results for each
   */
  test('should delete all files in array and return results', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            cloudinaryId: fc.string({ minLength: 5, maxLength: 50 }).map(id => 
              `careerak/applications/${id.replace(/[^a-zA-Z0-9_-]/g, 'x')}`
            ),
            type: fc.constantFrom('image/jpeg', 'image/png', 'application/pdf')
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (files) => {
          // Arrange
          jest.clearAllMocks(); // Reset mocks for each property test run
          cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

          // Act
          const results = await fileUploadService.deleteMultipleFiles(files);

          // Assert
          expect(results).toHaveLength(files.length);
          expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(files.length);
          
          // All results should be successful
          results.forEach((result, index) => {
            expect(result.success).toBe(true);
            expect(result.cloudinaryId).toBe(files[index].cloudinaryId);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Deletion should invalidate CDN cache
   * 
   * For any file deletion, the service should request CDN cache invalidation
   */
  test('should request CDN cache invalidation on deletion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }).map(id => 
          `careerak/applications/${id.replace(/[^a-zA-Z0-9_-]/g, 'x')}`
        ),
        fc.constantFrom('image', 'raw'),
        async (cloudinaryId, resourceType) => {
          // Arrange
          cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

          // Act
          await fileUploadService.deleteFile(cloudinaryId, resourceType);

          // Assert
          expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
            cloudinaryId,
            expect.objectContaining({
              invalidate: true
            })
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Deletion should be idempotent
   * 
   * For any file, deleting it multiple times should not cause errors
   * (subsequent deletions should return "not found" but still succeed)
   */
  test('should be idempotent - multiple deletions should not cause errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }).map(id => 
          `careerak/applications/${id.replace(/[^a-zA-Z0-9_-]/g, 'x')}`
        ),
        fc.constantFrom('image', 'raw'),
        async (cloudinaryId, resourceType) => {
          // Arrange
          let callCount = 0;
          cloudinary.uploader.destroy.mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve({ result: 'ok' });
            }
            return Promise.resolve({ result: 'not found' });
          });

          // Act - delete multiple times
          const result1 = await fileUploadService.deleteFile(cloudinaryId, resourceType);
          const result2 = await fileUploadService.deleteFile(cloudinaryId, resourceType);
          const result3 = await fileUploadService.deleteFile(cloudinaryId, resourceType);

          // Assert - all should succeed
          expect(result1.success).toBe(true);
          expect(result2.success).toBe(true);
          expect(result3.success).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });
});
