const express = require('express');
const router = express.Router();
const recordingController = require('../controllers/recordingController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/recordings/start
 * @desc    بدء تسجيل جديد
 * @access  Private
 */
router.post('/start', protect, recordingController.startRecording);

/**
 * @route   PUT /api/recordings/:recordingId/stop
 * @desc    إيقاف التسجيل
 * @access  Private
 */
router.put('/:recordingId/stop', protect, recordingController.stopRecording);

/**
 * @route   PUT /api/recordings/:recordingId/process
 * @desc    معالجة التسجيل
 * @access  Private
 */
router.put('/:recordingId/process', protect, recordingController.processRecording);

/**
 * @route   PUT /api/recordings/:recordingId/schedule-delete
 * @desc    جدولة حذف التسجيل
 * @access  Private
 */
router.put('/:recordingId/schedule-delete', protect, recordingController.scheduleDelete);

/**
 * @route   PUT /api/recordings/:recordingId/retention
 * @desc    تحديث فترة الاحتفاظ
 * @access  Private
 */
router.put('/:recordingId/retention', protect, recordingController.updateRetentionPeriod);

/**
 * @route   DELETE /api/recordings/:recordingId
 * @desc    حذف تسجيل يدوياً
 * @access  Private
 */
router.delete('/:recordingId', protect, recordingController.deleteRecording);

/**
 * @route   GET /api/recordings/:recordingId
 * @desc    الحصول على تسجيل
 * @access  Private
 */
router.get('/:recordingId', protect, recordingController.getRecording);

/**
 * @route   GET /api/recordings/interview/:interviewId
 * @desc    الحصول على تسجيلات مقابلة
 * @access  Private
 */
router.get('/interview/:interviewId', protect, recordingController.getInterviewRecordings);

/**
 * @route   GET /api/recordings/:recordingId/download
 * @desc    تحميل تسجيل
 * @access  Private
 */
router.get('/:recordingId/download', protect, recordingController.downloadRecording);

/**
 * @route   GET /api/recordings/stats/all
 * @desc    الحصول على إحصائيات التسجيلات
 * @access  Private (Admin)
 */
router.get('/stats/all', protect, authorize('admin'), recordingController.getRecordingStats);

/**
 * @route   POST /api/recordings/cleanup/run
 * @desc    تشغيل التنظيف يدوياً
 * @access  Private (Admin)
 */
router.post('/cleanup/run', protect, authorize('admin'), recordingController.runCleanupManually);

/**
 * @route   GET /api/recordings/cleanup/stats
 * @desc    الحصول على إحصائيات Cron Job
 * @access  Private (Admin)
 */
router.get('/cleanup/stats', protect, authorize('admin'), recordingController.getCleanupStats);

module.exports = router;
