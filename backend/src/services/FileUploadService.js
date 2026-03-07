/**
 * FileUploadService - Handles file uploads to Cloudinary for job applications
 * 
 * Features:
 * - File validation (type, size)
 * - Upload to Cloudinary with progress tracking
 * - File deletion from Cloudinary
 * - Error handling and retry logic
 * - Support for multiple file types (PDF, DOC, DOCX, JPG, PNG)
 * 
 * Requirements: 4.3, 4.4, 4.6, 4.9
 * Design: FileUploadService class
 */

const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

class FileUploadService {
  constructor() {
    // Allowed file types for job applications
    this.ALLOWED_TYPES = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    // Maximum file size: 5MB
    this.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    // Retry configuration
    this.MAX_RETRIES = 3;
    this.RETRY_DELAY = 1000; // 1 second
  }

  /**
   * Validate file type and size
   * 
   * @param {Object} file - File object with mimetype and size
   * @returns {Object} Validation result { valid: boolean, error?: string }
   * 
   * Requirements: 4.3, 4.4, 4.5
   */
  validateFile(file) {
    if (!file) {
      return {
        valid: false,
        error: 'No file provided'
      };
    }

    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, PNG. Received: ${file.mimetype}`
      };
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File size exceeds 5MB limit. File size: ${sizeMB}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Upload file to Cloudinary with progress tracking
   * 
   * @param {Object} file - File object (from multer)
   * @param {Function} onProgress - Progress callback (progress: number 0-100)
   * @param {Object} options - Upload options
   * @param {string} options.folder - Cloudinary folder (default: 'careerak/applications')
   * @param {string} options.category - File category (resume, cover_letter, certificate, portfolio, other)
   * @returns {Promise<Object>} Uploaded file data
   * 
   * Requirements: 4.6
   */
  async uploadFile(file, onProgress = null, options = {}) {
    // Validate file first
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const {
      folder = 'careerak/applications',
      category = 'other'
    } = options;

    // Determine resource type based on file mimetype
    const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw';

    // Upload with retry logic
    return this._uploadWithRetry(file, resourceType, folder, category, onProgress);
  }

  /**
   * Upload with retry logic
   * 
   * @private
   */
  async _uploadWithRetry(file, resourceType, folder, category, onProgress, attempt = 1) {
    try {
      return await this._performUpload(file, resourceType, folder, category, onProgress);
    } catch (error) {
      if (attempt < this.MAX_RETRIES) {
        // Wait before retrying
        await this._delay(this.RETRY_DELAY * attempt);
        
        // Retry upload
        return this._uploadWithRetry(file, resourceType, folder, category, onProgress, attempt + 1);
      }
      
      // Max retries reached, throw error
      throw new Error(`Upload failed after ${this.MAX_RETRIES} attempts: ${error.message}`);
    }
  }

  /**
   * Perform the actual upload to Cloudinary
   * 
   * @private
   */
  async _performUpload(file, resourceType, folder, category, onProgress) {
    return new Promise((resolve, reject) => {
      // Create upload stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          tags: ['application', category],
          // Add transformations for images
          ...(resourceType === 'image' && {
            transformation: {
              fetch_format: 'auto',
              quality: 'auto'
            }
          })
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            // Return formatted file data
            resolve({
              id: result.public_id,
              name: file.originalname,
              size: file.size,
              type: file.mimetype,
              url: result.secure_url,
              cloudinaryId: result.public_id,
              category,
              uploadedAt: new Date()
            });
          }
        }
      );

      // Track upload progress
      if (onProgress) {
        let uploadedBytes = 0;
        const totalBytes = file.size;

        uploadStream.on('data', (chunk) => {
          uploadedBytes += chunk.length;
          const progress = Math.round((uploadedBytes / totalBytes) * 100);
          onProgress(progress);
        });
      }

      // Pipe file buffer to upload stream
      if (file.buffer) {
        // From multer memory storage - convert buffer to stream
        const bufferStream = Readable.from(file.buffer);
        bufferStream.pipe(uploadStream);
      } else if (file.path) {
        // From multer disk storage
        const fs = require('fs');
        fs.createReadStream(file.path).pipe(uploadStream);
      } else {
        reject(new Error('File buffer or path not found'));
      }
    });
  }

  /**
   * Delete file from Cloudinary
   * 
   * @param {string} cloudinaryId - Cloudinary public_id
   * @param {string} resourceType - Resource type ('image' or 'raw')
   * @returns {Promise<Object>} Deletion result
   * 
   * Requirements: 4.9
   */
  async deleteFile(cloudinaryId, resourceType = 'raw') {
    if (!cloudinaryId) {
      throw new Error('Cloudinary ID is required for deletion');
    }

    try {
      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(cloudinaryId, {
        resource_type: resourceType,
        invalidate: true // Invalidate CDN cache
      });

      if (result.result === 'ok' || result.result === 'not found') {
        return {
          success: true,
          cloudinaryId,
          message: result.result === 'ok' ? 'File deleted successfully' : 'File not found (already deleted)'
        };
      }

      throw new Error(`Deletion failed: ${result.result}`);
    } catch (error) {
      throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
    }
  }

  /**
   * Delete multiple files from Cloudinary
   * 
   * @param {Array<Object>} files - Array of file objects with cloudinaryId and type
   * @returns {Promise<Array<Object>>} Array of deletion results
   */
  async deleteMultipleFiles(files) {
    const deletionPromises = files.map(file => {
      const resourceType = file.type?.startsWith('image/') ? 'image' : 'raw';
      return this.deleteFile(file.cloudinaryId, resourceType)
        .catch(error => ({
          success: false,
          cloudinaryId: file.cloudinaryId,
          error: error.message
        }));
    });

    return Promise.all(deletionPromises);
  }

  /**
   * Utility: Delay for retry logic
   * 
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get file extension from mimetype
   * 
   * @param {string} mimetype - File mimetype
   * @returns {string} File extension
   */
  getFileExtension(mimetype) {
    const mimetypeMap = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png'
    };

    return mimetypeMap[mimetype] || 'unknown';
  }

  /**
   * Format file size for display
   * 
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size (e.g., "2.5 MB")
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = FileUploadService;
