/**
 * Waiting Room Routes
 * مسارات API لغرف الانتظار
 */

const express = require('express');
const router = express.Router();
const waitingRoomController = require('../controllers/waitingRoomController');
const { protect } = require('../middleware/auth');

// جميع المسارات تحتاج authentication
router.use(protect);

/**
 * @route   POST /api/waiting-rooms
 * @desc    إنشاء غرفة انتظار جديدة
 * @access  Private (Host only)
 */
router.post('/', waitingRoomController.createWaitingRoom);

/**
 * @route   POST /api/waiting-rooms/:interviewId/join
 * @desc    الانضمام لغرفة الانتظار
 * @access  Private
 */
router.post('/:interviewId/join', waitingRoomController.joinWaitingRoom);

/**
 * @route   POST /api/waiting-rooms/:interviewId/admit/:userId
 * @desc    قبول مشارك من غرفة الانتظار
 * @access  Private (Host only)
 */
router.post('/:interviewId/admit/:userId', waitingRoomController.admitParticipant);

/**
 * @route   POST /api/waiting-rooms/:interviewId/reject/:userId
 * @desc    رفض مشارك من غرفة الانتظار
 * @access  Private (Host only)
 */
router.post('/:interviewId/reject/:userId', waitingRoomController.rejectParticipant);

/**
 * @route   GET /api/waiting-rooms/:interviewId/list
 * @desc    الحصول على قائمة المنتظرين
 * @access  Private (Host only)
 */
router.get('/:interviewId/list', waitingRoomController.getWaitingList);

/**
 * @route   GET /api/waiting-rooms/:interviewId/info
 * @desc    الحصول على معلومات غرفة الانتظار
 * @access  Private
 */
router.get('/:interviewId/info', waitingRoomController.getWaitingRoomInfo);

/**
 * @route   PUT /api/waiting-rooms/:interviewId/welcome-message
 * @desc    تحديث رسالة الترحيب
 * @access  Private (Host only)
 */
router.put('/:interviewId/welcome-message', waitingRoomController.updateWelcomeMessage);

/**
 * @route   DELETE /api/waiting-rooms/:interviewId/leave
 * @desc    مغادرة غرفة الانتظار
 * @access  Private
 */
router.delete('/:interviewId/leave', waitingRoomController.leaveWaitingRoom);

/**
 * @route   DELETE /api/waiting-rooms/:interviewId
 * @desc    حذف غرفة الانتظار
 * @access  Private (Host only)
 */
router.delete('/:interviewId', waitingRoomController.deleteWaitingRoom);

module.exports = router;
