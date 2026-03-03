const cloudinary = require('../config/cloudinary');
const VideoInterview = require('../models/VideoInterview');
const InterviewRecording = require('../models/InterviewRecording');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Recording Service
 * إدارة تسجيل المقابلات: بدء، إيقاف، معالجة، رفع، حذف
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
class RecordingService {
  constructor() {
    // مجلد مؤقت للتسجيلات قبل الرفع
    this.tempRecordingsDir = path.join(__dirname, '../../temp/recordings');
    
    // إعدادات التسجيل
    this.recordingSettings = {
      mimeType: 'video/webm;codecs=vp9,opus', // VP9 للفيديو، Opus للصوت
      videoBitsPerSecond: 2500000, // 2.5 Mbps للفيديو
      audioBitsPerSecond: 128000,  // 128 kbps للصوت
    };

    // مدة الاحتفاظ الافتراضية (90 يوم)
    this.defaultRetentionDays = 90;

    // التسجيلات النشطة (في الذاكرة)
    this.activeRecordings = new Map();
  }

  /**
   * بدء تسجيل مقابلة
   * @param {string} interviewId - معرف المقابلة
   * @param {string} userId - معرف المستخدم الذي بدأ التسجيل
   * @returns {Promise<Object>} معلومات التسجيل
   */
  async startRecording(interviewId, userId) {
    try {
      // التحقق من وجود المقابلة
      const interview = await VideoInterview.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }

      // التحقق من أن المستخدم هو المضيف
      if (interview.hostId.toString() !== userId.toString()) {
        throw new Error('Only the host can start recording');
      }

      // التحقق من تفعيل التسجيل
      if (!interview.settings.recordingEnabled) {
        throw new Error('Recording is not enabled for this interview');
      }

      // التحقق من موافقة جميع المشاركين
      if (!interview.hasAllConsents()) {
        throw new Error('Not all participants have consented to recording');
      }

      // التحقق من عدم وجود تسجيل نشط
      if (interview.recording.status === 'recording') {
        throw new Error('Recording is already in progress');
      }

      // تحديث حالة التسجيل في المقابلة
      await interview.startRecording();

      // إنشاء سجل تسجيل جديد
      const recordingId = uuidv4();
      const recording = new InterviewRecording({
        recordingId,
        interviewId: interview._id,
        startTime: new Date(),
        status: 'recording',
        fileUrl: '', // سيتم تحديثه بعد الرفع
        retentionDays: this.defaultRetentionDays,
      });

      await recording.save();

      // تخزين معلومات التسجيل النشط
      this.activeRecordings.set(interviewId.toString(), {
        recordingId,
        startTime: new Date(),
        chunks: [],
      });

      return {
        success: true,
        recordingId,
        message: 'Recording started successfully',
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * إيقاف تسجيل مقابلة
   * @param {string} interviewId - معرف المقابلة
   * @param {string} userId - معرف المستخدم الذي أوقف التسجيل
   * @returns {Promise<Object>} معلومات التسجيل
   */
  async stopRecording(interviewId, userId) {
    try {
      // التحقق من وجود المقابلة
      const interview = await VideoInterview.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }

      // التحقق من أن المستخدم هو المضيف
      if (interview.hostId.toString() !== userId.toString()) {
        throw new Error('Only the host can stop recording');
      }

      // التحقق من وجود تسجيل نشط
      if (interview.recording.status !== 'recording') {
        throw new Error('No active recording found');
      }

      // تحديث حالة التسجيل في المقابلة
      await interview.stopRecording();

      // الحصول على معلومات التسجيل النشط
      const activeRecording = this.activeRecordings.get(interviewId.toString());
      if (!activeRecording) {
        throw new Error('Active recording data not found');
      }

      // تحديث سجل التسجيل
      const recording = await InterviewRecording.findOne({
        recordingId: activeRecording.recordingId,
      });

      if (recording) {
        recording.endTime = new Date();
        recording.duration = Math.floor((recording.endTime - recording.startTime) / 1000);
        recording.status = 'processing';
        await recording.save();
      }

      // إزالة من التسجيلات النشطة
      this.activeRecordings.delete(interviewId.toString());

      return {
        success: true,
        recordingId: activeRecording.recordingId,
        duration: recording ? recording.duration : 0,
        message: 'Recording stopped successfully',
      };
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  /**
   * حفظ chunk من التسجيل
   * @param {string} interviewId - معرف المقابلة
   * @param {Buffer} chunk - chunk من البيانات
   */
  async saveRecordingChunk(interviewId, chunk) {
    const activeRecording = this.activeRecordings.get(interviewId.toString());
    if (!activeRecording) {
      throw new Error('No active recording found');
    }

    activeRecording.chunks.push(chunk);
  }

  /**
   * معالجة التسجيل بعد الإيقاف
   * @param {string} recordingId - معرف التسجيل
   * @returns {Promise<Object>} معلومات التسجيل المعالج
   */
  async processRecording(recordingId) {
    try {
      // الحصول على سجل التسجيل
      const recording = await InterviewRecording.findOne({ recordingId });
      if (!recording) {
        throw new Error('Recording not found');
      }

      // التحقق من حالة التسجيل
      if (recording.status !== 'processing') {
        throw new Error('Recording is not in processing state');
      }

      // الحصول على المقابلة
      const interview = await VideoInterview.findById(recording.interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }

      // في بيئة حقيقية، سيتم معالجة الفيديو هنا
      // (ضغط، تحويل الصيغة، إلخ)
      // لكن في هذا التنفيذ، سنفترض أن الفيديو جاهز

      // تحديث حالة التسجيل
      recording.status = 'ready';
      interview.recording.status = 'ready';

      await recording.save();
      await interview.save();

      return {
        success: true,
        recordingId,
        status: 'ready',
        message: 'Recording processed successfully',
      };
    } catch (error) {
      console.error('Error processing recording:', error);
      
      // تحديث حالة التسجيل إلى failed
      const recording = await InterviewRecording.findOne({ recordingId });
      if (recording) {
        recording.status = 'failed';
        await recording.save();
      }

      throw error;
    }
  }

  /**
   * رفع التسجيل إلى Cloudinary
   * @param {string} recordingId - معرف التسجيل
   * @param {Buffer|string} file - ملف الفيديو (Buffer أو مسار)
   * @returns {Promise<Object>} معلومات الرفع
   */
  async uploadRecording(recordingId, file) {
    try {
      // الحصول على سجل التسجيل
      const recording = await InterviewRecording.findOne({ recordingId });
      if (!recording) {
        throw new Error('Recording not found');
      }

      // رفع الفيديو إلى Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file, {
        resource_type: 'video',
        folder: 'careerak/interview-recordings',
        public_id: recordingId,
        chunk_size: 6000000, // 6MB chunks
        eager: [
          { width: 1280, height: 720, crop: 'limit', format: 'mp4' }, // HD version
          { width: 640, height: 480, crop: 'limit', format: 'mp4' },  // SD version
        ],
        eager_async: true,
      });

      // تحديث معلومات التسجيل
      recording.fileUrl = uploadResult.secure_url;
      recording.fileSize = uploadResult.bytes;
      recording.status = 'ready';

      // الحصول على المقابلة وتحديثها
      const interview = await VideoInterview.findById(recording.interviewId);
      if (interview) {
        interview.recording.videoUrl = uploadResult.secure_url;
        interview.recording.cloudinaryPublicId = uploadResult.public_id;
        interview.recording.fileSize = uploadResult.bytes;
        interview.recording.status = 'ready';
        await interview.save();
      }

      await recording.save();

      // حذف الملف المؤقت إذا كان موجوداً
      if (typeof file === 'string') {
        try {
          await fs.unlink(file);
        } catch (err) {
          console.error('Error deleting temp file:', err);
        }
      }

      return {
        success: true,
        recordingId,
        fileUrl: uploadResult.secure_url,
        fileSize: uploadResult.bytes,
        message: 'Recording uploaded successfully',
      };
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  }

  /**
   * توليد صورة مصغرة للتسجيل
   * @param {string} recordingId - معرف التسجيل
   * @returns {Promise<Object>} معلومات الصورة المصغرة
   */
  async generateThumbnail(recordingId) {
    try {
      // الحصول على سجل التسجيل
      const recording = await InterviewRecording.findOne({ recordingId });
      if (!recording) {
        throw new Error('Recording not found');
      }

      // الحصول على المقابلة
      const interview = await VideoInterview.findById(recording.interviewId);
      if (!interview || !interview.recording.cloudinaryPublicId) {
        throw new Error('Recording video not found');
      }

      // توليد صورة مصغرة من الفيديو باستخدام Cloudinary
      const thumbnailUrl = cloudinary.url(interview.recording.cloudinaryPublicId, {
        resource_type: 'video',
        transformation: [
          { width: 640, height: 360, crop: 'fill' },
          { start_offset: '5', duration: '0.1' }, // أخذ لقطة من الثانية 5
          { format: 'jpg', quality: 'auto' },
        ],
      });

      // تحديث معلومات التسجيل
      recording.thumbnailUrl = thumbnailUrl;
      interview.recording.thumbnailUrl = thumbnailUrl;

      await recording.save();
      await interview.save();

      return {
        success: true,
        recordingId,
        thumbnailUrl,
        message: 'Thumbnail generated successfully',
      };
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  /**
   * جدولة حذف التسجيل بعد فترة معينة
   * @param {string} recordingId - معرف التسجيل
   * @param {number} retentionDays - عدد الأيام للاحتفاظ (افتراضي: 90)
   * @returns {Promise<Object>} معلومات الجدولة
   */
  async scheduleDelete(recordingId, retentionDays = null) {
    try {
      // الحصول على سجل التسجيل
      const recording = await InterviewRecording.findOne({ recordingId });
      if (!recording) {
        throw new Error('Recording not found');
      }

      // تحديد مدة الاحتفاظ
      const days = retentionDays || recording.retentionDays || this.defaultRetentionDays;

      // حساب تاريخ الانتهاء
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      // تحديث معلومات التسجيل
      recording.retentionDays = days;
      recording.expiresAt = expiresAt;

      // تحديث المقابلة
      const interview = await VideoInterview.findById(recording.interviewId);
      if (interview) {
        interview.recording.expiresAt = expiresAt;
        await interview.save();
      }

      await recording.save();

      return {
        success: true,
        recordingId,
        expiresAt,
        retentionDays: days,
        message: `Recording scheduled for deletion after ${days} days`,
      };
    } catch (error) {
      console.error('Error scheduling delete:', error);
      throw error;
    }
  }

  /**
   * حذف التسجيل
   * @param {string} recordingId - معرف التسجيل
   * @param {string} userId - معرف المستخدم الذي طلب الحذف
   * @param {string} reason - سبب الحذف
   * @returns {Promise<Object>} نتيجة الحذف
   */
  async deleteRecording(recordingId, userId = null, reason = 'manual') {
    try {
      // الحصول على سجل التسجيل
      const recording = await InterviewRecording.findOne({ recordingId });
      if (!recording) {
        throw new Error('Recording not found');
      }

      // الحصول على المقابلة
      const interview = await VideoInterview.findById(recording.interviewId);

      // حذف الفيديو من Cloudinary
      if (interview && interview.recording.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(interview.recording.cloudinaryPublicId, {
            resource_type: 'video',
          });
        } catch (err) {
          console.error('Error deleting from Cloudinary:', err);
        }
      }

      // تحديث حالة التسجيل
      recording.status = 'deleted';
      recording.deletedAt = new Date();
      recording.deletedBy = userId;
      recording.deletionReason = reason;

      // تحديث المقابلة
      if (interview) {
        interview.recording.status = 'deleted';
        interview.recording.videoUrl = null;
        interview.recording.cloudinaryPublicId = null;
        await interview.save();
      }

      await recording.save();

      return {
        success: true,
        recordingId,
        message: 'Recording deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting recording:', error);
      throw error;
    }
  }

  /**
   * حذف التسجيلات المنتهية تلقائياً
   * يتم استدعاء هذه الدالة بواسطة cron job
   * @returns {Promise<Object>} نتيجة الحذف
   */
  async deleteExpiredRecordings() {
    try {
      // الحصول على التسجيلات المنتهية
      const expiredRecordings = await InterviewRecording.findExpired();

      const results = {
        total: expiredRecordings.length,
        deleted: 0,
        failed: 0,
        errors: [],
      };

      // حذف كل تسجيل منتهي
      for (const recording of expiredRecordings) {
        try {
          await this.deleteRecording(recording.recordingId, null, 'auto_expired');
          results.deleted++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            recordingId: recording.recordingId,
            error: error.message,
          });
        }
      }

      console.log('Expired recordings cleanup:', results);
      return results;
    } catch (error) {
      console.error('Error deleting expired recordings:', error);
      throw error;
    }
  }

  /**
   * الحصول على التسجيلات التي ستنتهي قريباً
   * @param {number} daysAhead - عدد الأيام المستقبلية
   * @returns {Promise<Array>} قائمة التسجيلات
   */
  async getExpiringSoonRecordings(daysAhead = 7) {
    try {
      return await InterviewRecording.findExpiringSoon(daysAhead);
    } catch (error) {
      console.error('Error getting expiring soon recordings:', error);
      throw error;
    }
  }

  /**
   * زيادة عداد التحميل
   * @param {string} recordingId - معرف التسجيل
   */
  async incrementDownloadCount(recordingId) {
    try {
      const recording = await InterviewRecording.findOne({ recordingId });
      if (recording) {
        recording.downloadCount++;
        await recording.save();

        // تحديث المقابلة أيضاً
        const interview = await VideoInterview.findById(recording.interviewId);
        if (interview) {
          interview.recording.downloadCount++;
          await interview.save();
        }
      }
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  }

  /**
   * الحصول على معلومات التسجيل
   * @param {string} recordingId - معرف التسجيل
   * @returns {Promise<Object>} معلومات التسجيل
   */
  async getRecordingInfo(recordingId) {
    try {
      const recording = await InterviewRecording.findOne({ recordingId })
        .populate('interviewId');

      if (!recording) {
        throw new Error('Recording not found');
      }

      return recording;
    } catch (error) {
      console.error('Error getting recording info:', error);
      throw error;
    }
  }

  /**
   * التحقق من صلاحية الوصول للتسجيل
   * @param {string} recordingId - معرف التسجيل
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<boolean>} هل يمكن الوصول
   */
  async canAccessRecording(recordingId, userId) {
    try {
      const recording = await InterviewRecording.findOne({ recordingId })
        .populate('interviewId');

      if (!recording || !recording.interviewId) {
        return false;
      }

      const interview = recording.interviewId;

      // المضيف يمكنه الوصول دائماً
      if (interview.hostId.toString() === userId.toString()) {
        return true;
      }

      // المشاركون يمكنهم الوصول
      const isParticipant = interview.participants.some(
        p => p.userId.toString() === userId.toString()
      );

      return isParticipant;
    } catch (error) {
      console.error('Error checking recording access:', error);
      return false;
    }
  }
}

module.exports = RecordingService;
