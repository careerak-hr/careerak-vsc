const Appointment = require('../models/Appointment');
const VideoInterview = require('../models/VideoInterview');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * معالج طلبات المواعيد
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

/**
 * إنشاء موعد جديد (جدولة مقابلة)
 * 
 * @route POST /api/appointments
 * @access Private
 */
exports.createAppointment = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      participants,
      scheduledAt,
      duration,
      location,
      jobApplicationId,
      notes,
      videoInterviewSettings,
    } = req.body;

    const organizerId = req.user._id;

    // التحقق من صحة التاريخ
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن جدولة موعد في الماضي',
      });
    }

    // إنشاء الموعد
    const appointment = new Appointment({
      type: type || 'video_interview',
      title,
      description: description || '',
      organizerId,
      participants: participants.map(p => ({
        userId: p,
        status: 'pending',
      })),
      scheduledAt: scheduledDate,
      duration: duration || 60,
      location: location || null,
      jobApplicationId: jobApplicationId || null,
      notes: notes || '',
    });

    await appointment.save();

    // إذا كان نوع الموعد مقابلة فيديو، إنشاء VideoInterview
    if (type === 'video_interview') {
      const roomId = uuidv4();
      
      const videoInterview = new VideoInterview({
        roomId,
        appointmentId: appointment._id,
        hostId: organizerId,
        participants: [
          { userId: organizerId, role: 'host' },
          ...participants.map(p => ({ userId: p, role: 'participant' })),
        ],
        scheduledAt: scheduledDate,
        settings: videoInterviewSettings || {},
      });

      await videoInterview.save();

      // تحديث الموعد برابط المقابلة ومعرف VideoInterview
      appointment.meetingLink = `${process.env.FRONTEND_URL}/video-interview/${roomId}`;
      appointment.videoInterviewId = videoInterview._id;
      await appointment.save();
    }

    // إرسال إشعارات للمشاركين
    const { sendVideoInterviewInvitation } = require('../services/emailService');
    const User = require('../models/User');
    
    // جلب معلومات المشاركين
    const participantUsers = await User.find({ _id: { $in: participants } });
    
    for (const participantId of participants) {
      await notificationService.createNotification({
        userId: participantId,
        type: 'appointment_scheduled',
        title: 'موعد جديد',
        message: `تم جدولة موعد: ${title}`,
        data: {
          appointmentId: appointment._id,
          scheduledAt: scheduledDate,
          type: appointment.type,
        },
        priority: 'high',
      });
    }

    // إرسال بريد إلكتروني للمشاركين
    if (type === 'video_interview') {
      try {
        await sendVideoInterviewInvitation(appointment, videoInterview, participantUsers);
        logger.info('Video interview invitation emails sent', {
          appointmentId: appointment._id,
          participantCount: participantUsers.length
        });
      } catch (emailError) {
        logger.error('Failed to send video interview invitation emails', {
          error: emailError.message,
          appointmentId: appointment._id
        });
        // لا نفشل العملية إذا فشل إرسال البريد
      }
    }

    res.status(201).json({
      success: true,
      message: 'تم جدولة الموعد بنجاح',
      appointment: {
        id: appointment._id,
        title: appointment.title,
        scheduledAt: appointment.scheduledAt,
        duration: appointment.duration,
        meetingLink: appointment.meetingLink,
        status: appointment.status,
      },
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل جدولة الموعد',
      error: error.message,
    });
  }
};

/**
 * الحصول على تفاصيل موعد
 * 
 * @route GET /api/appointments/:id
 * @access Private
 */
exports.getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id)
      .populate('organizerId', 'name email profilePicture')
      .populate('participants.userId', 'name email profilePicture')
      .populate('videoInterviewId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود',
      });
    }

    // التحقق من أن المستخدم منظم أو مشارك
    const isOrganizer = appointment.organizerId._id.toString() === userId.toString();
    const isParticipant = appointment.participants.some(
      p => p.userId._id.toString() === userId.toString()
    );

    if (!isOrganizer && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية الوصول لهذا الموعد',
      });
    }

    res.json({
      success: true,
      appointment,
      canJoin: appointment.canJoin(),
    });
  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل الحصول على تفاصيل الموعد',
      error: error.message,
    });
  }
};

/**
 * الحصول على قائمة المواعيد
 * 
 * @route GET /api/appointments
 * @access Private
 */
exports.getAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, type, upcoming, limit = 20, page = 1 } = req.query;

    const query = {
      $or: [
        { organizerId: userId },
        { 'participants.userId': userId },
      ],
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (upcoming === 'true') {
      query.scheduledAt = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'confirmed'] };
    }

    const appointments = await Appointment.find(query)
      .populate('organizerId', 'name email profilePicture')
      .populate('participants.userId', 'name email profilePicture')
      .sort({ scheduledAt: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({
      success: false,
      message: 'فشل الحصول على قائمة المواعيد',
      error: error.message,
    });
  }
};

/**
 * تحديث حالة المشاركة (قبول/رفض)
 * 
 * @route PUT /api/appointments/:id/respond
 * @access Private
 */
exports.respondToAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { status } = req.body;

    if (!['accepted', 'declined', 'tentative'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'حالة غير صحيحة',
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود',
      });
    }

    // التحقق من أن المستخدم مشارك
    const isParticipant = appointment.participants.some(
      p => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية الرد على هذا الموعد',
      });
    }

    // تحديث حالة المشارك
    await appointment.updateParticipantStatus(userId, status);

    // إرسال إشعار للمنظم
    await notificationService.createNotification({
      userId: appointment.organizerId,
      type: 'appointment_response',
      title: 'رد على موعد',
      message: `${req.user.name} ${status === 'accepted' ? 'قبل' : status === 'declined' ? 'رفض' : 'ربما يحضر'} الموعد`,
      data: {
        appointmentId: appointment._id,
        participantId: userId,
        response: status,
      },
      priority: 'medium',
    });

    res.json({
      success: true,
      message: 'تم تحديث حالة المشاركة بنجاح',
      appointment: {
        id: appointment._id,
        status: appointment.status,
      },
    });
  } catch (error) {
    console.error('Error responding to appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل تحديث حالة المشاركة',
      error: error.message,
    });
  }
};

/**
 * إعادة جدولة موعد
 * 
 * @route PUT /api/appointments/:id/reschedule
 * @access Private (Organizer only)
 */
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { scheduledAt, duration, reason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود',
      });
    }

    // التحقق من أن المستخدم هو المنظم
    if (appointment.organizerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'فقط المنظم يمكنه إعادة جدولة الموعد',
      });
    }

    // التحقق من صحة التاريخ الجديد
    const newScheduledDate = new Date(scheduledAt);
    if (newScheduledDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن جدولة موعد في الماضي',
      });
    }

    // إنشاء موعد جديد
    const newAppointment = new Appointment({
      type: appointment.type,
      title: appointment.title,
      description: appointment.description,
      organizerId: appointment.organizerId,
      participants: appointment.participants.map(p => ({
        userId: p.userId,
        status: 'pending', // إعادة تعيين الحالة
      })),
      scheduledAt: newScheduledDate,
      duration: duration || appointment.duration,
      location: appointment.location,
      jobApplicationId: appointment.jobApplicationId,
      notes: appointment.notes,
      previousAppointmentId: appointment._id,
    });

    await newAppointment.save();

    // تحديث الموعد القديم
    appointment.status = 'rescheduled';
    appointment.rescheduledToId = newAppointment._id;
    appointment.cancellationReason = reason || 'تم إعادة الجدولة';
    await appointment.save();

    // إذا كان هناك مقابلة فيديو، إنشاء واحدة جديدة
    if (appointment.type === 'video_interview' && appointment.videoInterviewId) {
      const oldVideoInterview = await VideoInterview.findById(appointment.videoInterviewId);
      
      if (oldVideoInterview) {
        const roomId = uuidv4();
        
        const newVideoInterview = new VideoInterview({
          roomId,
          appointmentId: newAppointment._id,
          hostId: appointment.organizerId,
          participants: oldVideoInterview.participants.map(p => ({
            userId: p.userId,
            role: p.role,
          })),
          scheduledAt: newScheduledDate,
          settings: oldVideoInterview.settings,
        });

        await newVideoInterview.save();

        // تحديث الموعد الجديد برابط المقابلة
        newAppointment.meetingLink = `${process.env.FRONTEND_URL}/video-interview/${roomId}`;
        newAppointment.videoInterviewId = newVideoInterview._id;
        await newAppointment.save();

        // إلغاء المقابلة القديمة
        oldVideoInterview.status = 'cancelled';
        await oldVideoInterview.save();
      }
    }

    // إرسال إشعارات للمشاركين
    const { sendVideoInterviewInvitation } = require('../services/emailService');
    const User = require('../models/User');
    
    // جلب معلومات المشاركين
    const participantIds = appointment.participants.map(p => p.userId);
    const participantUsers = await User.find({ _id: { $in: participantIds } });
    
    for (const participant of appointment.participants) {
      await notificationService.createNotification({
        userId: participant.userId,
        type: 'appointment_rescheduled',
        title: 'تم إعادة جدولة موعد',
        message: `تم إعادة جدولة الموعد: ${appointment.title}`,
        data: {
          oldAppointmentId: appointment._id,
          newAppointmentId: newAppointment._id,
          newScheduledAt: newScheduledDate,
          reason: reason || 'تم إعادة الجدولة',
        },
        priority: 'high',
      });
    }

    // إرسال بريد إلكتروني للمشاركين
    if (appointment.type === 'video_interview' && newAppointment.videoInterviewId) {
      try {
        const newVideoInterview = await VideoInterview.findById(newAppointment.videoInterviewId);
        await sendVideoInterviewInvitation(newAppointment, newVideoInterview, participantUsers);
        logger.info('Rescheduled video interview invitation emails sent', {
          oldAppointmentId: appointment._id,
          newAppointmentId: newAppointment._id,
          participantCount: participantUsers.length
        });
      } catch (emailError) {
        logger.error('Failed to send rescheduled video interview invitation emails', {
          error: emailError.message,
          newAppointmentId: newAppointment._id
        });
        // لا نفشل العملية إذا فشل إرسال البريد
      }
    }

    res.json({
      success: true,
      message: 'تم إعادة جدولة الموعد بنجاح',
      appointment: {
        id: newAppointment._id,
        scheduledAt: newAppointment.scheduledAt,
        duration: newAppointment.duration,
        meetingLink: newAppointment.meetingLink,
        status: newAppointment.status,
      },
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل إعادة جدولة الموعد',
      error: error.message,
    });
  }
};

/**
 * إلغاء موعد
 * 
 * @route DELETE /api/appointments/:id
 * @access Private (Organizer only)
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود',
      });
    }

    // التحقق من أن المستخدم هو المنظم
    if (appointment.organizerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'فقط المنظم يمكنه إلغاء الموعد',
      });
    }

    // إلغاء الموعد
    await appointment.cancel(reason || 'تم الإلغاء');

    // إلغاء مقابلة الفيديو إذا كانت موجودة
    if (appointment.videoInterviewId) {
      const videoInterview = await VideoInterview.findById(appointment.videoInterviewId);
      if (videoInterview) {
        videoInterview.status = 'cancelled';
        await videoInterview.save();
      }
    }

    // إرسال إشعارات للمشاركين
    for (const participant of appointment.participants) {
      await notificationService.createNotification({
        userId: participant.userId,
        type: 'appointment_cancelled',
        title: 'تم إلغاء موعد',
        message: `تم إلغاء الموعد: ${appointment.title}`,
        data: {
          appointmentId: appointment._id,
          reason: reason || 'تم الإلغاء',
        },
        priority: 'high',
      });
    }

    res.json({
      success: true,
      message: 'تم إلغاء الموعد بنجاح',
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل إلغاء الموعد',
      error: error.message,
    });
  }
};

/**
 * تأكيد موعد
 * 
 * @route PUT /api/appointments/:id/confirm
 * @access Private (Organizer only)
 */
exports.confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود',
      });
    }

    // التحقق من أن المستخدم هو المنظم
    if (appointment.organizerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'فقط المنظم يمكنه تأكيد الموعد',
      });
    }

    // تأكيد الموعد
    await appointment.confirm();

    res.json({
      success: true,
      message: 'تم تأكيد الموعد بنجاح',
      appointment: {
        id: appointment._id,
        status: appointment.status,
      },
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل تأكيد الموعد',
      error: error.message,
    });
  }
};

module.exports = exports;
