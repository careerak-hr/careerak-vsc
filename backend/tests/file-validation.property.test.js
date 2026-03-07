/**
 * Property-Based Test: File Validation Correctness
 * 
 * Property 4: File validation correctness
 * For any file upload attempt, the system should correctly accept files that meet
 * all criteria (type in [PDF, DOC, DOCX, JPG, PNG] AND size ≤ 5MB) and reject files
 * that fail any criterion, displaying an appropriate error message indicating the
 * specific validation failure.
 * 
 * Validates: Requirements 4.3, 4.4, 4.5
 * Feature: apply-page-enhancements
 */

const fc = require('fast-check');
const FileUploadService = require('../src/services/FileUploadService');

describe('Property 4: File validation correctness', () => {
  let fileUploadService;

  beforeAll(() => {
    fileUploadService = new FileUploadService();
  });

  // Arbitrary for valid file types
  const validFileTypeArbitrary = fc.constantFrom(
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
  );

  // Arbitrary for invalid file types
  const invalidFileTypeArbitrary = fc.constantFrom(
    'text/plain',
    'application/zip',
    'video/mp4',
    'audio/mpeg',
    'application/javascript',
    'text/html',
    'image/gif',
    'image/svg+xml'
  );

  // Arbitrary for valid file sizes (1 byte to 5MB)
  const validFileSizeArbitrary = fc.integer({ min: 1, max: 5 * 1024 * 1024 });

  // Arbitrary for invalid file sizes (over 5MB)
  const invalidFileSizeArbitrary = fc.integer({ min: 5 * 1024 * 1024 + 1, max: 100 * 1024 * 1024 });

  // Arbitrary for file names
  const fileNameArbitrary = fc.string({ minLength: 1, maxLength: 100 }).map(name => 
    name.replace(/[^a-zA-Z0-9._-]/g, '_') + '.pdf'
  );

  /**
   * Property: Valid files should be accepted
   * 
   * For any file with valid type and valid size, validation should pass
   */
  test('should accept all files with valid type and size ≤ 5MB', () => {
    fc.assert(
      fc.property(
        validFileTypeArbitrary,
        validFileSizeArbitrary,
        fileNameArbitrary,
        (mimetype, size, originalname) => {
          // Arrange
          const file = {
            mimetype,
            size,
            originalname
          };

          // Act
          const result = fileUploadService.validateFile(file);

          // Assert
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Files with invalid type should be rejected
   * 
   * For any file with invalid type (regardless of size), validation should fail
   * with appropriate error message
   */
  test('should reject all files with invalid type', () => {
    fc.assert(
      fc.property(
        invalidFileTypeArbitrary,
        validFileSizeArbitrary,
        fileNameArbitrary,
        (mimetype, size, originalname) => {
          // Arrange
          const file = {
            mimetype,
            size,
            originalname
          };

          // Act
          const result = fileUploadService.validateFile(file);

          // Assert
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain('Invalid file type');
          expect(result.error).toContain(mimetype);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Files exceeding size limit should be rejected
   * 
   * For any file with size > 5MB (regardless of type), validation should fail
   * with appropriate error message
   */
  test('should reject all files with size > 5MB', () => {
    fc.assert(
      fc.property(
        validFileTypeArbitrary,
        invalidFileSizeArbitrary,
        fileNameArbitrary,
        (mimetype, size, originalname) => {
          // Arrange
          const file = {
            mimetype,
            size,
            originalname
          };

          // Act
          const result = fileUploadService.validateFile(file);

          // Assert
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain('File size exceeds 5MB limit');
          expect(result.error).toContain('MB');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Files with both invalid type and size should be rejected
   * 
   * For any file with invalid type AND invalid size, validation should fail
   * (error message may indicate either issue)
   */
  test('should reject files with both invalid type and size', () => {
    fc.assert(
      fc.property(
        invalidFileTypeArbitrary,
        invalidFileSizeArbitrary,
        fileNameArbitrary,
        (mimetype, size, originalname) => {
          // Arrange
          const file = {
            mimetype,
            size,
            originalname
          };

          // Act
          const result = fileUploadService.validateFile(file);

          // Assert
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          // Should contain error about either type or size (type is checked first)
          expect(
            result.error.includes('Invalid file type') || 
            result.error.includes('File size exceeds')
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Null or undefined file should be rejected
   */
  test('should reject null or undefined file', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(null, undefined),
        (file) => {
          // Act
          const result = fileUploadService.validateFile(file);

          // Assert
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain('No file provided');
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Boundary test - exactly 5MB should be accepted
   */
  test('should accept file with exactly 5MB size', () => {
    const exactlyFiveMB = 5 * 1024 * 1024;

    fc.assert(
      fc.property(
        validFileTypeArbitrary,
        fileNameArbitrary,
        (mimetype, originalname) => {
          // Arrange
          const file = {
            mimetype,
            size: exactlyFiveMB,
            originalname
          };

          // Act
          const result = fileUploadService.validateFile(file);

          // Assert
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Boundary test - 5MB + 1 byte should be rejected
   */
  test('should reject file with 5MB + 1 byte size', () => {
    const fiveMBPlusOne = 5 * 1024 * 1024 + 1;

    fc.assert(
      fc.property(
        validFileTypeArbitrary,
        fileNameArbitrary,
        (mimetype, originalname) => {
          // Arrange
          const file = {
            mimetype,
            size: fiveMBPlusOne,
            originalname
          };

          // Act
          const result = fileUploadService.validateFile(file);

          // Assert
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain('File size exceeds 5MB limit');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Error messages should be specific and helpful
   * 
   * For any validation failure, the error message should indicate the specific
   * reason for rejection
   */
  test('should provide specific error messages for validation failures', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Invalid type with valid size
          fc.tuple(invalidFileTypeArbitrary, validFileSizeArbitrary).map(([type, size]) => ({
            file: { mimetype: type, size, originalname: 'test.txt' },
            expectedErrorKeyword: 'Invalid file type'
          })),
          // Valid type with invalid size
          fc.tuple(validFileTypeArbitrary, invalidFileSizeArbitrary).map(([type, size]) => ({
            file: { mimetype: type, size, originalname: 'test.pdf' },
            expectedErrorKeyword: 'File size exceeds'
          }))
        ),
        ({ file, expectedErrorKeyword }) => {
          // Act
          const result = fileUploadService.validateFile(file);

          // Assert
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain(expectedErrorKeyword);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Validation should be deterministic
   * 
   * For any file, validating it multiple times should produce the same result
   */
  test('should produce consistent validation results for the same file', () => {
    fc.assert(
      fc.property(
        fc.oneof(validFileTypeArbitrary, invalidFileTypeArbitrary),
        fc.oneof(validFileSizeArbitrary, invalidFileSizeArbitrary),
        fileNameArbitrary,
        (mimetype, size, originalname) => {
          // Arrange
          const file = {
            mimetype,
            size,
            originalname
          };

          // Act - validate multiple times
          const result1 = fileUploadService.validateFile(file);
          const result2 = fileUploadService.validateFile(file);
          const result3 = fileUploadService.validateFile(file);

          // Assert - all results should be identical
          expect(result1.valid).toBe(result2.valid);
          expect(result2.valid).toBe(result3.valid);
          expect(result1.error).toBe(result2.error);
          expect(result2.error).toBe(result3.error);
        }
      ),
      { numRuns: 100 }
    );
  });
});
