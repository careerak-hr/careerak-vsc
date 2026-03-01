const VideoInterview = require('../models/VideoInterview');
const recordingService = require('../services/recordingService');
const { v4: uuidv4 } = require('uuid');

/**
 * معالج طلبات مقابلات الفيديو
 * 
 * Requirements: 1.1, 2.1, 2.3, 2.4, 2.5, 5.1
 */

/**
 * إنشاء مقابلة فيديو جديدة
 * 
 * @route POST /api/interviews/create
 * @access Private
 */
exports.createInterview = async (req, res) => {
  try {
    const {
      appointmentId,
      participants,
      scheduledAt,
      settings,
      welcomeMessage,
    } = req.body;

    const hostId = req.user._id;

    // توليد roomId فريد
    const roomId = uuidv4();

    // إنشاء المقابلة
    const interview = new VideoInterview({
      roomId,
      hostId,
      appointmentId: appointmentId || null,
      participants: [
        { userId: hostId, role: 'host' },
        ...participants.map(p => ({ userId: p, role: 'participant' })),
      ],
      scheduledAt: scheduledAt || null,
      settings: settings || {},
      welcomeMessage: welcomeMessage || 'مرحباً بك! سيتم قبولك في المقابلة قريباً.',
    });

    await interview.save();

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المقابلة بنجاح',
      interview: {
        id: interview._id,
        roomId: interview.roomId,
        scheduledAt: interview.scheduledAt,
        settings: interview.settings,
      },
    });
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({
      success: false,
      message: 'فشل إنشاء المقابلة',
      error: error.message,
    });
  }
};

/**
 * الحصول على تفاصيل مقابلة
 * 
 * @route GET /api/interviews/:id
 * @access Private
 */
exports.getInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const interview = await VideoInterview.findById(id)
      .populate('hostId', 'name email profilePicture')
      .populate('participants.userId', 'name email profilePicture');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'المقابلة غير موجودة',
      });
    }

    // التحقق من أن المستخدم مشارك في المقابلة
    const isParticipant = interview.participants.some(
      p => p.userId._id.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية الوصول لهذه المقابلة',
      });
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error('Error getting interview:', error);
    res.status(500).json({
      success: false,
      message: 'فشل الحصول على تفاصيل المقابلة',
      error: error.message,
    });
  }
};

/**
 * الانضمام لمقابلة
 * 
 * @route POST /api/interviews/:id/join
 * @access Private
 */
exports.joinInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const interview = await VideoInterview.findById(id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'المقابلة غير موجودة',
      });
    }

    // التحقق من أن المستخدم مشارك في المقابلة
    const isParticipant = interview.participants.some(
      p => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية الانضمام لهذه المقابلة',
      });
    }

    // تسجيل الانضمام
    await interview.recordJoin(userId);

    // بدء المقابلة إذا كانت أول انضمام
    if (interview.status === 'scheduled' || interview.status === 'waiting') {
      await interview.start();
    }

    res.json({
      success: true,
      message: 'تم الانضمام للمقابلة بنجاح',
      interview: {
        roomId: interview.roomId,
        status: interview.status,
        settings: interview.settings,
      },
    });
  } catch (error) {
    console.error('Error joining interview:', error);
    res.status(500).json({
      success: false,
      message: 'فشل الانضمام للمقابلة',
      error: error.message,
    });
  }
};

/**
 * مغادرة مقابلة
 * 
 * @route POST /api/interviews/:id/leave
 * @access Private
 */
exports.leaveInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const interview = await VideoInterview.findById(id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'المقابلة غير موجودة',
      });
    }

    // تسجيل المغادرة
    await interview.recordLeave(userId);

    res.json({
      success: true,
      message: 'تم تسجيل مغادرتك للمقابلة',
    });
  } catch (error) {
    console.error('Error leaving interview:', error);
    res.status(500).json({
      success: false,
      message: 'فشل تسجيل المغادرة',
      error: error.message,
    });
  }
};

/**
 * إنهاء مقابلة
 * 
 * @route POST /api/interviews/:id/end
 * @access Private (Host only)
 */
exports.endInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const interview = await VideoInterview.findById(id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'المقابلة غير موجودة',
      });
    }

    // التحقق من أن المستخدم هو المضيف
    if (interview.hostId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'فقط المضيف يمكنه إنهاء المقابلة',
      });
    }

    // إنهاء المقابلة
    await interview.end();

    res.json({
      success: true,
      message: 'تم إنهاء المقابلة بنجاح',
      interview: {
        status: interview.status,
        duration: interview.duration,
      },
    });
  } catch (error) {
    console.error('Error ending interview:', error);
    res.status(500).json({
      success: false,
      message: 'فشل إنهاء المقابلة',
      error: error.message,
    });
  }
};

/**
 * بدء التسجيل
 * 
 * @route POST /api/interviews/:id/recording/start
 * @access Private (Host only)
 */
exports.startRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await recordingService.startRecording(id, userId);

    res.json(result);
  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل بدء التسجيل',
    });
  }
};

/**
 * إيقاف التسجيل
 * 
 * @route POST /api/interviews/:id/recording/stop
 * @access Private (Host only)
 */
exports.stopRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await recordingService.stopRecording(id, userId);

    res.json(result);
  } catch (error) {
    console.error('Error stopping recording:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل إيقاف التسجيل',
    });
  }
};

/**
 * رفع التسجيل
 * 
 * @route POST /api/interviews/:id/recording/upload
 * @access Private (Host only)
 */
exports.uploadRecording = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم رفع ملف',
      });
    }

    const result = await recordingService.uploadRecording(
      id,
      req.file.buffer,
      {
        filename: req.file.originalname,
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Error uploading recording:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل رفع التسجيل',
    });
  }
};

/**
 * الحصول على معلومات التسجيل
 * 
 * @route GET /api/interviews/:id/recording
 * @access Private
 */
exports.getRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await recordingService.getRecordingInfo(id, userId);

    res.json(result);
  } catch (error) {
    console.error('Error getting recording:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل الحصول على معلومات التسجيل',
    });
  }
};

/**
 * تسجيل تحميل التسجيل
 * 
 * @route POST /api/interviews/:id/recording/download
 * @access Private
 */
exports.recordDownload = async (req, res) => {
  try {
    const { id } = req.params;

    await recordingService.recordDownload(id);

    res.json({
      success: true,
      message: 'تم تسجيل التحميل',
    });
  } catch (error) {
    console.error('Error recording download:', error);
    res.status(500).json({
      success: false,
      message: 'فشل تسجيل التحميل',
    });
  }
};

/**
 * إضافة موافقة على التسجيل
 * 
 * @route POST /api/interviews/:id/recording/consent
 * @access Private
 */
exports.addRecordingConsent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { consented } = req.body;

    if (typeof consented !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد الموافقة (true أو false)',
      });
    }

    const result = await recordingService.addRecordingConsent(id, userId, consented);

    res.json(result);
  } catch (error) {
    console.error('Error adding recording consent:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل إضافة الموافقة',
    });
  }
};

/**
 * التحقق من موافقة جميع المشاركين
 * 
 * @route GET /api/interviews/:id/recording/consents
 * @access Private
 */
exports.checkAllConsents = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await recordingService.checkAllConsents(id);

    res.json(result);
  } catch (error) {
    console.error('Error checking consents:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل التحقق من الموافقات',
    });
  }
};

/**
 * الحصول على قائمة المقابلات
 * 
 * @route GET /api/interviews
 * @access Private
 */
exports.getInterviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 20, page = 1 } = req.query;

    const query = {
      'participants.userId': userId,
    };

    if (status) {
      query.status = status;
    }

    const interviews = await VideoInterview.find(query)
      .populate('hostId', 'name email profilePicture')
      .populate('participants.userId', 'name email profilePicture')
      .sort({ scheduledAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await VideoInterview.countDocuments(query);

    res.json({
      success: true,
      interviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error getting interviews:', error);
    res.status(500).json({
      success: false,
      message: 'فشل الحصول على قائمة المقابلات',
      error: error.message,
    });
  }
};

module.exports = exports;
