/**
 * Interview File Service
 * خدمة إدارة الملفات المرسلة أثناء المقابلات
 */

const cloudinary = require('../config/cloudinary');
const path = require('path');

class InterviewFileService {
  /**
   * أنواع الملفات المسموح بها
   */
  static ALLOWED_FILE_TYPES = {
    // مستندات
    'application/pdf': { ext: '.pdf', category: 'document' },
    'application/msword': { ext: '.doc', category: 'document' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', category: 'document' },
    'application/vnd.ms-excel': { ext: '.xls', category: 'document' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: '.xlsx', category: 'document' },
    'application/vnd.ms-powerpoint': { ext: '.ppt', category: 'document' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: '.pptx', category: 'document' },
    'text/plain': { ext: '.txt', category: 'document' },
    
    // صور
    'image/jpeg': { ext: '.jpg', category: 'image' },
    'image/png': { ext: '.png', category: 'image' },
    'image/gif': { ext: '.gif', category: 'image' },
    'image/webp': { ext: '.webp', category: 'image' },
    
    // أرشيف
    'application/zip': { ext: '.zip', category: 'archive' },
    'application/x-rar-compressed': { ext: '.rar', category: 'archive' }
  };

  /**
   * الحد الأقصى لحجم الملف (10 MB)
   */
  static MAX_FILE_SIZE = 10 * 1024 * 1024;

  /**
   * التحقق من صحة الملف
   */
  static validateFile(file) {
    const errors = [];

    // التحقق من وجود الملف
    if (!file) {
      errors.push('لم يتم تحديد ملف');
      return { valid: false, errors };
    }

    // التحقق من نوع الملف
    if (!this.ALLOWED_FILE_TYPES[file.mimetype]) {
      errors.push(`نوع الملف غير مسموح به: ${file.mimetype}`);
    }

    // التحقق من حجم الملف
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`حجم الملف كبير جداً. الحد الأقصى: ${this.MAX_FILE_SIZE / (1024 * 1024)} MB`);
    }

    return {
      valid: errors.length === 0,
      errors,
      fileInfo: this.ALLOWED_FILE_TYPES[file.mimetype]
    };
  }

  /**
   * رفع ملف إلى Cloudinary
   */
  static async uploadFile(file, interviewId, userId) {
    try {
      // التحقق من صحة الملف
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const { category } = validation.fileInfo;

      // تحديد resource_type بناءً على الفئة
      const resourceType = category === 'image' ? 'image' : 'raw';

      // رفع الملف إلى Cloudinary
      const result = await cloudinary.uploader.upload(file.path || file.buffer, {
        folder: `careerak/interviews/${interviewId}/files`,
        resource_type: resourceType,
        public_id: `${userId}_${Date.now()}`,
        tags: ['interview', 'file-share', interviewId],
        context: {
          interview_id: interviewId,
          user_id: userId,
          original_name: file.originalname || file.name,
          category: category
        }
      });

      return {
        success: true,
        file: {
          url: result.secure_url,
          publicId: result.public_id,
          fileName: file.originalname || file.name,
          fileSize: file.size,
          fileType: file.mimetype,
          category: category,
          uploadedAt: new Date(),
          uploadedBy: userId
        }
      };
    } catch (error) {
      console.error('Error uploading interview file:', error);
      throw error;
    }
  }

  /**
   * حذف ملف من Cloudinary
   */
  static async deleteFile(publicId, category) {
    try {
      const resourceType = category === 'image' ? 'image' : 'raw';
      
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      return {
        success: result.result === 'ok',
        message: result.result === 'ok' ? 'تم حذف الملف بنجاح' : 'فشل حذف الملف'
      };
    } catch (error) {
      console.error('Error deleting interview file:', error);
      throw error;
    }
  }

  /**
   * الحصول على معلومات الملف
   */
  static getFileInfo(file) {
    const fileType = this.ALLOWED_FILE_TYPES[file.mimetype];
    
    return {
      name: file.originalname || file.name,
      size: file.size,
      sizeFormatted: this.formatFileSize(file.size),
      type: file.mimetype,
      category: fileType?.category || 'unknown',
      extension: fileType?.ext || path.extname(file.originalname || file.name)
    };
  }

  /**
   * تنسيق حجم الملف
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = InterviewFileService;
