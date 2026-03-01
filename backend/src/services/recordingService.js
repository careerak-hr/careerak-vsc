const InterviewRecording = require('../models/InterviewRecording');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

class RecordingService {
  /**
   * بدء تسجيل جديد
   */
  async startRecording(interviewId, retentionDays = 90) {
    try {
      const recording = new InterviewRecording({
        interviewId,
        startTime: new Date(),
        retentionDays,
        status: 'recording',
        fileUrl: '' // سيتم تحديثه لاحقاً
      });

      await recording.save();
      
      logger.info(`Recording started: ${recording.recordingId}`);
      return recording;
    } catch (error) {
      logger.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * إيقاف التسجيل
   */
  async stopRecording(recordingId, fileUrl, fileSize, duration) {
    try {
      const recording = await InterviewRecording.findOne({ recordingId });
      
      if (!recording) {
        throw new Error('Recording not found');
      }

      recording.endTime = new Date();
      recording.fileUrl = fileUrl;
      recording.fileSize = fileSize;
      recording.duration = duration;
      recording.status = 'processing';

      await recording.save();
      
      logger.info(`Recording stopped: ${recordingId}`);
      return recording;
    } catch (error) {
      logger.error('Error stopping recording:', error);
      throw error;
    }
  }

  /**
   * معالجة التسجيل (ضغط، توليد صورة مصغرة)
   */
  async processRecording(recordingId) {
    try {
      const recording = await InterviewRecording.findOne({ recordingId });
      
      if (!recording) {
        throw new Error('Recording not found');
      }

      // توليد صورة مصغرة (يمكن استخدام FFmpeg أو Cloudinary)
      // const thumbnailUrl = await this.generateThumbnail(recording.fileUrl);
      // recording.thumbnailUrl = thumbnailUrl;

      recording.status = 'ready';
      await recording.save();
      
      logger.info(`Recording processed: ${recordingId}`);
      return recording;
    } catch (error) {
      logger.error('Error processing recording:', error);
      throw error;
    }
  }

  /**
   * جدولة حذف التسجيل
   */
  async scheduleDelete(recordingId, retentionDays = null) {
    try {
      const recording = await InterviewRecording.findOne({ recordingId });
      
      if (!recording) {
        throw new Error('Recording not found');
      }

      // تحديث فترة الاحتفاظ إذا تم تحديدها
      if (retentionDays !== null) {
        recording.retentionDays = retentionDays;
        recording.expiresAt = recording.calculateExpiryDate();
      }

      await recording.save();
      
      logger.info(`Delete scheduled for ${recordingId}: expires at ${recording.expiresAt}`);
      return {
        recordingId: recording.recordingId,
        expiresAt: recording.expiresAt,
        retentionDays: recording.retentionDays,
        daysRemaining: Math.ceil((recording.expiresAt - new Date()) / (1000 * 60 * 60 * 24))
      };
    } catch (error) {
      logger.error('Error scheduling delete:', error);
      throw error;
    }
  }

  /**
   * تحديث فترة الاحتفاظ
   */
  async updateRetentionPeriod(recordingId, newRetentionDays) {
    try {
      const recording = await InterviewRecording.findOne({ recordingId });
      
      if (!recording) {
        throw new Error('Recording not found');
      }

      if (recording.status === 'deleted') {
        throw new Error('Cannot update deleted recording');
      }

      const oldExpiresAt = recording.expiresAt;
      recording.retentionDays = newRetentionDays;
      recording.expiresAt = recording.calculateExpiryDate();
      
      await recording.save();
      
      logger.info(`Retention updated for ${recordingId}: ${oldExpiresAt} -> ${recording.expiresAt}`);
      return recording;
    } catch (error) {
      logger.error('Error updating retention period:', error);
      throw error;
    }
  }

  /**
   * حذف تسجيل يدوياً
   */
  async deleteRecording(recordingId, userId, reason = 'manual') {
    try {
      const recording = await InterviewRecording.findOne({ recordingId });
      
      if (!recording) {
        throw new Error('Recording not found');
      }

      if (recording.status === 'deleted') {
        throw new Error('Recording already deleted');
      }

      // حذف من Cloudinary
      if (recording.fileUrl) {
        await this.deleteFromCloudinary(recording.fileUrl);
      }

      if (recording.thumbnailUrl) {
        await this.deleteFromCloudinary(recording.thumbnailUrl);
      }

      // تحديث حالة التسجيل
      recording.status = 'deleted';
      recording.deletedAt = new Date();
      recording.deletedBy = userId;
      recording.deletionReason = reason;
      
      await recording.save();
      
      logger.info(`Recording deleted manually: ${recordingId} by ${userId}`);
      return recording;
    } catch (error) {
      logger.error('Error deleting recording:', error);
      throw error;
    }
  }

  /**
   * حذف ملف من Cloudinary
   */
  async deleteFromCloudinary(fileUrl) {
    try {
      const urlParts = fileUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = filename.split('.')[0];
      
      await cloudinary.uploader.destroy(`careerak/recordings/${publicId}`, {
        resource_type: 'video'
      });
      
      return true;
    } catch (error) {
      logger.error('Error deleting from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * الحصول على تسجيل
   */
  async getRecording(recordingId) {
    try {
      const recording = await InterviewRecording.findOne({ recordingId })
        .populate('interviewId');
      
      if (!recording) {
        throw new Error('Recording not found');
      }

      return recording;
    } catch (error) {
      logger.error('Error getting recording:', error);
      throw error;
    }
  }

  /**
   * الحصول على تسجيلات مقابلة
   */
  async getInterviewRecordings(interviewId) {
    try {
      const recordings = await InterviewRecording.find({
        interviewId,
        status: { $ne: 'deleted' }
      }).sort({ createdAt: -1 });
      
      return recordings;
    } catch (error) {
      logger.error('Error getting interview recordings:', error);
      throw error;
    }
  }

  /**
   * زيادة عداد التحميل
   */
  async incrementDownloadCount(recordingId) {
    try {
      const recording = await InterviewRecording.findOneAndUpdate(
        { recordingId },
        { $inc: { downloadCount: 1 } },
        { new: true }
      );
      
      return recording;
    } catch (error) {
      logger.error('Error incrementing download count:', error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات التسجيلات
   */
  async getRecordingStats() {
    try {
      const stats = await InterviewRecording.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalSize: { $sum: '$fileSize' },
            totalDuration: { $sum: '$duration' }
          }
        }
      ]);

      const expiredCount = await InterviewRecording.countDocuments({
        status: { $ne: 'deleted' },
        expiresAt: { $lt: new Date() }
      });

      const expiringSoon = await InterviewRecording.countDocuments({
        status: { $ne: 'deleted' },
        expiresAt: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      return {
        byStatus: stats,
        expired: expiredCount,
        expiringSoon
      };
    } catch (error) {
      logger.error('Error getting recording stats:', error);
      throw error;
    }
  }
}

module.exports = new RecordingService();
