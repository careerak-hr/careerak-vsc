/**
 * Waiting Room Controller
 * معالج طلبات غرف الانتظار
 */

const waitingRoomService = require('../services/waitingRoomService');

/**
 * إنشاء غرفة انتظار
 */
exports.createWaitingRoom = async (req, res) => {
  try {
    const { interviewId, welcomeMessage } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: 'Interview ID is required'
      });
    }

    const waitingRoom = await waitingRoomService.createWaitingRoom(
      interviewId,
      welcomeMessage
    );

    res.status(201).json({
      success: true,
      data: waitingRoom
    });
  } catch (error) {
    console.error('Error in createWaitingRoom:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create waiting room'
    });
  }
};

/**
 * الانضمام لغرفة الانتظار
 */
exports.joinWaitingRoom = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user._id;

    const result = await waitingRoomService.addToWaitingRoom(interviewId, userId);

    res.status(200).json({
      success: true,
      data: result.waitingRoom,
      alreadyInRoom: result.alreadyInRoom
    });
  } catch (error) {
    console.error('Error in joinWaitingRoom:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to join waiting room'
    });
  }
};

/**
 * قبول مشارك
 */
exports.admitParticipant = async (req, res) => {
  try {
    const { interviewId, userId } = req.params;
    const hostId = req.user._id;

    const result = await waitingRoomService.admitParticipant(
      interviewId,
      userId,
      hostId
    );

    res.status(200).json({
      success: true,
      data: {
        waitingRoom: result.waitingRoom,
        interview: result.interview,
        participant: result.participant
      }
    });
  } catch (error) {
    console.error('Error in admitParticipant:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to admit participant'
    });
  }
};

/**
 * رفض مشارك
 */
exports.rejectParticipant = async (req, res) => {
  try {
    const { interviewId, userId } = req.params;
    const hostId = req.user._id;

    const result = await waitingRoomService.rejectParticipant(
      interviewId,
      userId,
      hostId
    );

    res.status(200).json({
      success: true,
      data: {
        waitingRoom: result.waitingRoom,
        participant: result.participant
      }
    });
  } catch (error) {
    console.error('Error in rejectParticipant:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject participant'
    });
  }
};

/**
 * الحصول على قائمة المنتظرين (للمضيف فقط)
 */
exports.getWaitingList = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const hostId = req.user._id;

    const result = await waitingRoomService.getWaitingList(interviewId, hostId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getWaitingList:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get waiting list'
    });
  }
};

/**
 * الحصول على معلومات غرفة الانتظار (للمشارك)
 */
exports.getWaitingRoomInfo = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user._id;

    const result = await waitingRoomService.getWaitingRoomInfo(interviewId, userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getWaitingRoomInfo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get waiting room info'
    });
  }
};

/**
 * تحديث رسالة الترحيب
 */
exports.updateWelcomeMessage = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { welcomeMessage } = req.body;
    const hostId = req.user._id;

    if (!welcomeMessage) {
      return res.status(400).json({
        success: false,
        message: 'Welcome message is required'
      });
    }

    const waitingRoom = await waitingRoomService.updateWelcomeMessage(
      interviewId,
      hostId,
      welcomeMessage
    );

    res.status(200).json({
      success: true,
      data: waitingRoom
    });
  } catch (error) {
    console.error('Error in updateWelcomeMessage:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update welcome message'
    });
  }
};

/**
 * مغادرة غرفة الانتظار
 */
exports.leaveWaitingRoom = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user._id;

    const result = await waitingRoomService.removeFromWaitingRoom(interviewId, userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in leaveWaitingRoom:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to leave waiting room'
    });
  }
};

/**
 * حذف غرفة الانتظار
 */
exports.deleteWaitingRoom = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const result = await waitingRoomService.deleteWaitingRoom(interviewId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in deleteWaitingRoom:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete waiting room'
    });
  }
};
