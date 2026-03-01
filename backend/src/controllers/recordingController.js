const recordingService = require('../services/recordingService');
const recordingCleanupCron = require('../jobs/recordingCleanupCron');
const logger = require('../utils/logger');

/**
 * بدء تسجيل جديد
 */
exports.startRecording = async (req, res) => {
  try {
    const { interviewId, retentionDays } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: 'Interview ID is required'
      });
    }

    const recording = await recordingService.startRecording(
      interviewId,
      retentionDays || 90
    );

    res.status(201).json({
      success: true,
      message: 'Recording started successfully',
      data: recording
    });
  } catch (error) {
    logger.error('Error in startRecording:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start recording',
      error: error.message
    });
  }
};

/**
 * إيقاف التسجيل
 */
exports.stopRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const { fileUrl, fileSize, duration } = req.body;

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'File URL is required'
      });
    }

    const recording = await recordingService.stopRecording(
      recordingId,
      fileUrl,
      fileSize,
      duration
    );

    res.json({
      success: true,
      message: 'Recording stopped successfully',
      data: recording
    });
  } catch (error) {
    logger.error('Error in stopRecording:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop recording',
      error: error.message
    });
  }
};

/**
 * معالجة التسجيل
 */
exports.processRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;

    const recording = await recordingService.processRecording(recordingId);

    res.json({
      success: true,
      message: 'Recording processed successfully',
      data: recording
    });
  } catch (error) {
    logger.error('Error in processRecording:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process recording',
      error: error.message
    });
  }
};

/**
 * جدولة حذف التسجيل
 */
exports.scheduleDelete = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const { retentionDays } = req.body;

    const result = await recordingService.scheduleDelete(
      recordingId,
      retentionDays
    );

    res.json({
      success: true,
      message: 'Delete scheduled successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error in scheduleDelete:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule delete',
      error: error.message
    });
  }
};

/**
 * تحديث فترة الاحتفاظ
 */
exports.updateRetentionPeriod = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const { retentionDays } = req.body;

    if (!retentionDays || retentionDays < 1 || retentionDays > 365) {
      return res.status(400).json({
        success: false,
        message: 'Retention days must be between 1 and 365'
      });
    }

    const recording = await recordingService.updateRetentionPeriod(
      recordingId,
      retentionDays
    );

    res.json({
      success: true,
      message: 'Retention period updated successfully',
      data: recording
    });
  } catch (error) {
    logger.error('Error in updateRetentionPeriod:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update retention period',
      error: error.message
    });
  }
};

/**
 * حذف تسجيل يدوياً
 */
exports.deleteRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const recording = await recordingService.deleteRecording(
      recordingId,
      userId,
      reason || 'manual'
    );

    res.json({
      success: true,
      message: 'Recording deleted successfully',
      data: recording
    });
  } catch (error) {
    logger.error('Error in deleteRecording:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete recording',
      error: error.message
    });
  }
};

/**
 * الحصول على تسجيل
 */
exports.getRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;

    const recording = await recordingService.getRecording(recordingId);

    res.json({
      success: true,
      data: recording
    });
  } catch (error) {
    logger.error('Error in getRecording:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recording',
      error: error.message
    });
  }
};

/**
 * الحصول على تسجيلات مقابلة
 */
exports.getInterviewRecordings = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const recordings = await recordingService.getInterviewRecordings(interviewId);

    res.json({
      success: true,
      data: recordings
    });
  } catch (error) {
    logger.error('Error in getInterviewRecordings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interview recordings',
      error: error.message
    });
  }
};

/**
 * تحميل تسجيل
 */
exports.downloadRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;

    const recording = await recordingService.incrementDownloadCount(recordingId);

    res.json({
      success: true,
      message: 'Download URL generated',
      data: {
        downloadUrl: recording.fileUrl,
        expiresAt: recording.expiresAt
      }
    });
  } catch (error) {
    logger.error('Error in downloadRecording:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate download URL',
      error: error.message
    });
  }
};

/**
 * الحصول على إحصائيات التسجيلات
 */
exports.getRecordingStats = async (req, res) => {
  try {
    const stats = await recordingService.getRecordingStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error in getRecordingStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recording stats',
      error: error.message
    });
  }
};

/**
 * تشغيل التنظيف يدوياً (للأدمن فقط)
 */
exports.runCleanupManually = async (req, res) => {
  try {
    await recordingCleanupCron.runManually();

    const stats = recordingCleanupCron.getStats();

    res.json({
      success: true,
      message: 'Cleanup completed',
      data: stats
    });
  } catch (error) {
    logger.error('Error in runCleanupManually:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run cleanup',
      error: error.message
    });
  }
};

/**
 * الحصول على إحصائيات Cron Job
 */
exports.getCleanupStats = async (req, res) => {
  try {
    const stats = recordingCleanupCron.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error in getCleanupStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cleanup stats',
      error: error.message
    });
  }
};
