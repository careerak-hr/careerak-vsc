const RecordingService = require('../services/recordingService');
const VideoInterview = require('../models/VideoInterview');
const InterviewRecording = require('../models/InterviewRecording');

const recordingService = new RecordingService();

/**
 * Recording Controller
 * معالجة طلبات التسجيل والموافقات
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

/**
 * بدء تسجيل مقابلة
 * POST /api/recordings/start
 */
const startRecording = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const userId = req.user._id;

    const result = await recordingService.startRecording(interviewId, userId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * إيقاف تسجيل مقابلة
 * POST /api/recordings/stop
 */
const stopRecording = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const userId = req.user._id;

    const result = await recordingService.stopRecording(interviewId, userId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error stopping recording:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * رفع تسجيل مقابلة
 * POST /api/recordings/upload
 */
const uploadRecording = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No recording file provided',
      });
    }

    const { interviewId, duration, fileSize } = req.body;
    const userId = req.user._id;

    // التحقق من صلاحية الوصول
    const interview = await VideoInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    if (interview.hostId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can upload recordings',
      });
    }

    // الحصول على recordingId من المقابلة
    const recording = await InterviewRecording.findOne({
      interviewId,
      status: 'processing',
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found',
      });
    }

    // رفع الملف
    const result = await recordingService.uploadRecording(
      recording.recordingId,
      req.file.buffer || req.file.path
    );

    // توليد صورة مصغرة
    await recordingService.generateThumbnail(recording.recordingId);

    // جدولة الحذف التلقائي
    await recordingService.scheduleDelete(recording.recordingId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error uploading recording:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * إضافة موافقة على التسجيل
 * POST /api/interviews/:interviewId/recording-consent
 */
const addRecordingConsent = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { consented } = req.body;
    const userId = req.user._id;

    const interview = await VideoInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // التحقق من أن المستخدم مشارك في المقابلة
    const isParticipant = interview.participants.some(
      p => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this interview',
      });
    }

    // إضافة الموافقة
    await interview.addRecordingConsent(userId, consented);

    res.status(200).json({
      success: true,
      message: consented ? 'Consent given successfully' : 'Consent denied',
      hasAllConsents: interview.hasAllConsents(),
    });
  } catch (error) {
    console.error('Error adding recording consent:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * الحصول على حالة الموافقات
 * GET /api/interviews/:interviewId/recording-consents
 */
const getRecordingConsents = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user._id;

    const interview = await VideoInterview.findById(interviewId)
      .populate('participants.userId', 'name email')
      .populate('recordingConsent.userId', 'name email');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // التحقق من صلاحية الوصول
    const isParticipant = interview.participants.some(
      p => p.userId._id.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this interview',
      });
    }

    // تنسيق الموافقات
    const consents = interview.recordingConsent.map(consent => ({
      userId: consent.userId._id,
      userName: consent.userId.name,
      consented: consent.consented,
      consentedAt: consent.consentedAt,
    }));

    res.status(200).json({
      success: true,
      consents,
      hasAllConsents: interview.hasAllConsents(),
    });
  } catch (error) {
    console.error('Error getting recording consents:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * الحصول على معلومات تسجيل
 * GET /api/recordings/:recordingId
 */
const getRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const userId = req.user._id;

    // التحقق من صلاحية الوصول
    const canAccess = await recordingService.canAccessRecording(recordingId, userId);
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this recording',
      });
    }

    const recording = await recordingService.getRecordingInfo(recordingId);

    res.status(200).json({
      success: true,
      recording,
    });
  } catch (error) {
    console.error('Error getting recording:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * تحميل تسجيل
 * GET /api/recordings/:recordingId/download
 */
const downloadRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const userId = req.user._id;

    // التحقق من صلاحية الوصول
    const canAccess = await recordingService.canAccessRecording(recordingId, userId);
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this recording',
      });
    }

    const recording = await recordingService.getRecordingInfo(recordingId);

    if (!recording || !recording.fileUrl) {
      return res.status(404).json({
        success: false,
        message: 'Recording file not found',
      });
    }

    // زيادة عداد التحميل
    await recordingService.incrementDownloadCount(recordingId);

    // إعادة توجيه إلى رابط Cloudinary
    res.redirect(recording.fileUrl);
  } catch (error) {
    console.error('Error downloading recording:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * حذف تسجيل
 * DELETE /api/recordings/:recordingId
 */
const deleteRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const userId = req.user._id;

    // التحقق من صلاحية الحذف (المضيف فقط)
    const recording = await recordingService.getRecordingInfo(recordingId);
    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found',
      });
    }

    const interview = recording.interviewId;
    if (interview.hostId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can delete recordings',
      });
    }

    const result = await recordingService.deleteRecording(recordingId, userId, 'manual');

    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * الحصول على التسجيلات التي ستنتهي قريباً
 * GET /api/recordings/expiring-soon
 */
const getExpiringSoonRecordings = async (req, res) => {
  try {
    const { daysAhead = 7 } = req.query;
    const userId = req.user._id;

    const recordings = await recordingService.getExpiringSoonRecordings(parseInt(daysAhead));

    // تصفية التسجيلات التي يمكن للمستخدم الوصول إليها
    const accessibleRecordings = [];
    for (const recording of recordings) {
      const canAccess = await recordingService.canAccessRecording(recording.recordingId, userId);
      if (canAccess) {
        accessibleRecordings.push(recording);
      }
    }

    res.status(200).json({
      success: true,
      recordings: accessibleRecordings,
      count: accessibleRecordings.length,
    });
  } catch (error) {
    console.error('Error getting expiring soon recordings:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// لا حاجة لإعادة التصدير - exports تم تعريفها بالفعل في الأعلى

module.exports = {
  startRecording,
  stopRecording,
  uploadRecording,
  addRecordingConsent,
  getRecordingConsents,
  getRecording,
  downloadRecording,
  deleteRecording,
  getExpiringSoonRecordings,
};
