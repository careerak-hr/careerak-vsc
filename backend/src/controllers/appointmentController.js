const Appointment = require('../models/Appointment');
const AppointmentHistory = require('../models/AppointmentHistory');
const VideoInterview = require('../models/VideoInterview');
const notificationService = require('../services/notificationService');
const appointmentService = require('../services/appointmentService');
const reminderService = require('../services/reminderService');
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

    // منع الحجز المزدوج: التحقق من عدم وجود تعارض في الوقت مع مراعاة maxConcurrent
    // Validates: Requirements 1.4, 6.1 - No Double Booking
    const durationMinutes = duration || 60;
    const endTime = new Date(scheduledDate.getTime() + durationMinutes * 60 * 1000);

    // جلب maxConcurrent من إعدادات الإتاحة للشركة
    const Availability = require('../models/Availability');
    const availability = await Availability.findOne({ companyId: organizerId, isActive: true });
    const maxConcurrent = availability ? availability.maxConcurrent : 1;

    const overlappingCount = await Appointment.countDocuments({
      organizerId,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
      scheduledAt: { $lt: endTime },
      endsAt: { $gt: scheduledDate },
    });

    if (overlappingCount >= maxConcurrent) {
      return res.status(409).json({
        success: false,
        message: 'هذا الوقت محجوز بالفعل - الحجز المزدوج غير مسموح',
        code: 'DOUBLE_BOOKING',
        overlappingCount,
        maxConcurrent,
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

    // إنشاء تذكيرات تلقائية للموعد (non-blocking)
    reminderService.createRemindersForAppointment(appointment).catch(err => {
      logger.error('Failed to create reminders for appointment:', { error: err.message, appointmentId: appointment._id });
    });

    // إذا كان نوع الموعد مقابلة فيديو، إنشاء VideoInterview
    let videoInterview = null;
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
    const { sendVideoInterviewInvitation, sendAppointmentConfirmationEmail } = require('../services/emailService');
    const User = require('../models/User');
    
    // جلب معلومات المشاركين
    const participantUsers = await User.find({ _id: { $in: participants } });
    
    // تحديد الشركة والباحث (المنظم هو الشركة، المشاركون هم الباحثون)
    const organizerUser = await User.findById(organizerId);
    
    for (const participantId of participants) {
      await notificationService.createNotification({
        recipient: participantId,
        type: 'appointment_confirmed',
        title: 'تم تأكيد موعد مقابلتك ✅',
        message: `تم تأكيد موعد مقابلتك: ${title}`,
        relatedData: {
          appointment: appointment._id,
          scheduledAt: scheduledDate,
          duration: appointment.duration,
          meetingLink: appointment.meetingLink || null,
          location: appointment.location || null,
        },
        priority: 'urgent',
      });
    }

    // إشعار للمنظم (الشركة) أيضاً
    await notificationService.createNotification({
      recipient: organizerId,
      type: 'appointment_confirmed',
      title: 'تم تأكيد الموعد ✅',
      message: `تم تأكيد موعد المقابلة: ${title}`,
      relatedData: {
        appointment: appointment._id,
        scheduledAt: scheduledDate,
        duration: appointment.duration,
        meetingLink: appointment.meetingLink || null,
        location: appointment.location || null,
      },
      priority: 'high',
    });

    // إرسال بريد إلكتروني تأكيد للطرفين
    try {
      for (const participantUser of participantUsers) {
        await sendAppointmentConfirmationEmail(appointment, organizerUser, participantUser);
      }
      logger.info('Appointment confirmation emails sent', {
        appointmentId: appointment._id,
        participantCount: participantUsers.length
      });
    } catch (emailError) {
      logger.error('Failed to send appointment confirmation emails', {
        error: emailError.message,
        appointmentId: appointment._id
      });
      // لا نفشل العملية إذا فشل إرسال البريد
    }

    // إرسال بريد دعوة مقابلة فيديو إضافي إذا كان النوع video_interview
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

    // إنشاء حدث Google Calendar (non-blocking)
    try {
      const googleCalendarService = require('../services/googleCalendarService');
      googleCalendarService.createEventForAppointment(appointment, organizerId).catch(err => {
        logger.warn('Google Calendar createEventForAppointment failed (non-blocking):', { error: err.message, appointmentId: appointment._id });
      });
    } catch (gcErr) {
      logger.warn('Google Calendar service unavailable:', gcErr.message);
    }

    // إرجاع تفاصيل الموعد الكاملة
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('organizerId', 'firstName lastName companyName email profilePicture')
      .populate('participants.userId', 'firstName lastName email profilePicture');

    res.status(201).json({
      success: true,
      message: 'تم جدولة الموعد بنجاح وإرسال التأكيد للطرفين',
      appointment: {
        id: populatedAppointment._id,
        title: populatedAppointment.title,
        description: populatedAppointment.description,
        type: populatedAppointment.type,
        status: populatedAppointment.status,
        scheduledAt: populatedAppointment.scheduledAt,
        endsAt: populatedAppointment.endsAt,
        duration: populatedAppointment.duration,
        meetingLink: populatedAppointment.meetingLink,
        location: populatedAppointment.location,
        notes: populatedAppointment.notes,
        organizer: populatedAppointment.organizerId,
        participants: populatedAppointment.participants,
        jobApplicationId: populatedAppointment.jobApplicationId,
        createdAt: populatedAppointment.createdAt,
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
      .populate('organizerId', 'firstName lastName companyName email profilePicture')
      .populate('participants.userId', 'firstName lastName email profilePicture specialization')
      .populate('videoInterviewId')
      .populate({
        path: 'jobApplicationId',
        select: 'jobTitle jobId',
        populate: { path: 'jobId', select: 'title company location' },
      });

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
 * يدعم role=company لعرض لوحة تحكم المقابلات للشركات مع pagination وفلترة متقدمة
 *
 * @route GET /api/appointments
 * @query role=company - لجلب مقابلات الشركة مع إحصائيات
 * @query status - فلترة حسب الحالة
 * @query type - فلترة حسب النوع
 * @query upcoming - جلب المواعيد القادمة فقط
 * @query search - بحث في اسم المرشح أو الوظيفة
 * @query startDate / endDate - فلترة حسب نطاق التاريخ
 * @query page / limit - pagination
 * @access Private
 */
exports.getAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      role,
      status,
      type,
      upcoming,
      search,
      startDate,
      endDate,
      limit = 20,
      page = 1,
    } = req.query;

    // --- لوحة تحكم الشركة ---
    if (role === 'company') {
      // الشركة هي المنظم دائماً
      const query = { organizerId: userId };

      if (status) query.status = status;
      if (type) query.type = type;

      // فلترة حسب نطاق التاريخ
      if (startDate || endDate) {
        query.scheduledAt = {};
        if (startDate) query.scheduledAt.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.scheduledAt.$lte = end;
        }
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      let appointmentsQuery = Appointment.find(query)
        .populate('organizerId', 'firstName lastName companyName email profilePicture')
        .populate('participants.userId', 'firstName lastName email profilePicture specialization')
        .populate('jobApplicationId', 'jobTitle')
        .sort({ scheduledAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const [appointments, total] = await Promise.all([
        appointmentsQuery.exec(),
        Appointment.countDocuments(query),
      ]);

      // فلترة بالبحث النصي (اسم المرشح) بعد populate
      let filtered = appointments;
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = appointments.filter((appt) => {
          const participantMatch = appt.participants.some((p) => {
            const u = p.userId;
            if (!u) return false;
            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
            return fullName.includes(q) || (u.email || '').toLowerCase().includes(q);
          });
          const titleMatch = (appt.title || '').toLowerCase().includes(q);
          return participantMatch || titleMatch;
        });
      }

      // إحصائيات سريعة
      const [statsTotal, statsUpcoming, statsCompleted, statsCancelled] = await Promise.all([
        Appointment.countDocuments({ organizerId: userId }),
        Appointment.countDocuments({
          organizerId: userId,
          status: { $in: ['scheduled', 'confirmed'] },
          scheduledAt: { $gte: new Date() },
        }),
        Appointment.countDocuments({ organizerId: userId, status: 'completed' }),
        Appointment.countDocuments({ organizerId: userId, status: 'cancelled' }),
      ]);

      return res.json({
        success: true,
        appointments: filtered,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
        stats: {
          total: statsTotal,
          upcoming: statsUpcoming,
          completed: statsCompleted,
          cancelled: statsCancelled,
          attendanceRate: statsTotal > 0
            ? Math.round((statsCompleted / statsTotal) * 100)
            : 0,
        },
      });
    }

    // --- المسار الافتراضي (للباحثين والمستخدمين العاديين) ---
    const query = {
      $or: [
        { organizerId: userId },
        { 'participants.userId': userId },
      ],
    };

    if (status) query.status = status;
    if (type) query.type = type;

    if (upcoming === 'true') {
      query.scheduledAt = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'confirmed'] };
    }

    const appointments = await Appointment.find(query)
      .populate('organizerId', 'firstName lastName companyName email profilePicture')
      .populate('participants.userId', 'firstName lastName email profilePicture')
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
 * يرفض إعادة الجدولة إذا كان الموعد أقل من 24 ساعة
 * 
 * @route POST /api/appointments/:id/reschedule
 * @route PUT  /api/appointments/:id/reschedule
 * @body { newDateTime: ISO string, reason?: string }
 * @access Private
 */
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // دعم كلا الاسمين: newDateTime (المتطلب الجديد) و scheduledAt (للتوافق مع القديم)
    const { newDateTime, scheduledAt, reason } = req.body;
    const targetDateTime = newDateTime || scheduledAt;

    if (!targetDateTime) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد الوقت الجديد للموعد (newDateTime) | newDateTime is required',
        code: 'MISSING_NEW_DATE_TIME',
      });
    }

    const { appointment, newAppointment } = await appointmentService.rescheduleAppointment(
      id,
      userId,
      targetDateTime,
      reason
    );

    // إذا كان نوع الموعد مقابلة فيديو، إنشاء VideoInterview جديدة
    if (appointment.type === 'video_interview' && appointment.videoInterviewId) {
      try {
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
            scheduledAt: newAppointment.scheduledAt,
            settings: oldVideoInterview.settings,
          });
          await newVideoInterview.save();

          newAppointment.meetingLink = `${process.env.FRONTEND_URL}/video-interview/${roomId}`;
          newAppointment.videoInterviewId = newVideoInterview._id;
          await newAppointment.save();

          oldVideoInterview.status = 'cancelled';
          await oldVideoInterview.save();
        }
      } catch (videoError) {
        logger.error('Failed to create new video interview for rescheduled appointment:', videoError.message);
      }
    }

    res.json({
      success: true,
      message: 'تم إعادة جدولة الموعد بنجاح | Appointment rescheduled successfully',
      appointment: {
        id: newAppointment._id,
        scheduledAt: newAppointment.scheduledAt,
        duration: newAppointment.duration,
        meetingLink: newAppointment.meetingLink || null,
        status: newAppointment.status,
      },
      previousAppointmentId: appointment._id,
      rescheduleHistory: newAppointment.rescheduleHistory,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const response = {
      success: false,
      message: error.message || 'فشل إعادة جدولة الموعد | Failed to reschedule appointment',
      code: error.code || 'INTERNAL_ERROR',
    };

    if (error.scheduledAt) response.scheduledAt = error.scheduledAt;
    if (error.hoursRemaining !== undefined) response.hoursRemaining = error.hoursRemaining;
    if (error.conflictingAppointmentId) response.conflictingAppointmentId = error.conflictingAppointmentId;

    logger.error('Error rescheduling appointment:', { error: error.message, code: error.code });
    res.status(statusCode).json(response);
  }
};

/**
 * إلغاء موعد
 * يرفض الإلغاء إذا كان الموعد أقل من ساعة واحدة
 * يُرسل إشعاراً تلقائياً للطرف الآخر
 * 
 * @route DELETE /api/appointments/:id
 * @access Private (Organizer or Participant)
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    // استخدام appointmentService الذي يتولى التحقق وإرسال الإشعارات للطرف الآخر
    const appointment = await appointmentService.cancelAppointment(id, userId, reason);

    // إلغاء مقابلة الفيديو إذا كانت موجودة
    if (appointment.videoInterviewId) {
      try {
        const videoInterview = await VideoInterview.findById(appointment.videoInterviewId);
        if (videoInterview) {
          videoInterview.status = 'cancelled';
          await videoInterview.save();
        }
      } catch (videoError) {
        logger.error('Failed to cancel video interview:', videoError.message);
      }
    }

    res.json({
      success: true,
      message: 'تم إلغاء الموعد بنجاح وإشعار الطرف الآخر',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        cancellationReason: appointment.cancellationReason,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const response = {
      success: false,
      message: error.message || 'فشل إلغاء الموعد',
      code: error.code || 'INTERNAL_ERROR',
    };

    if (error.scheduledAt) response.scheduledAt = error.scheduledAt;
    if (error.minutesRemaining !== undefined) response.minutesRemaining = error.minutesRemaining;

    logger.error('Error cancelling appointment:', { error: error.message, code: error.code });
    res.status(statusCode).json(response);
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

/**
 * الحصول على سجل تاريخ موعد معين (الإلغاءات والتعديلات)
 * 
 * @route GET /api/appointments/:id/history
 * @access Private (المنظم أو المشاركون أو الأدمن)
 */
exports.getAppointmentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // التحقق من وجود الموعد
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود | Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND',
      });
    }

    // التحقق من الصلاحية: يجب أن يكون المستخدم منظماً أو مشاركاً أو أدمن
    if (!isAdmin) {
      const isOrganizer = appointment.organizerId.toString() === userId.toString();
      const isParticipant = appointment.participants.some(
        p => p.userId.toString() === userId.toString()
      );

      if (!isOrganizer && !isParticipant) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية الوصول لسجل هذا الموعد | You do not have permission to view this appointment history',
          code: 'FORBIDDEN',
        });
      }
    }

    // جلب سجل التاريخ مرتباً من الأحدث للأقدم
    const history = await AppointmentHistory.find({ appointmentId: id })
      .populate('performedBy', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      appointmentId: id,
      history,
      total: history.length,
    });
  } catch (error) {
    logger.error('Error getting appointment history:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'فشل الحصول على سجل الموعد | Failed to get appointment history',
      error: error.message,
    });
  }
};

/**
 * إحصائيات المواعيد
 * Requirements: User Story 6 - إحصائيات (عدد المقابلات، معدل الحضور، إلخ)
 *
 * @route GET /api/appointments/stats
 * @query startDate - تاريخ البداية (اختياري)
 * @query endDate - تاريخ النهاية (اختياري)
 * @access Private (company / admin)
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    const { startDate, endDate } = req.query;

    // الأدمن يمكنه رؤية إحصائيات أي شركة عبر companyId query param
    const companyId = isAdmin && req.query.companyId ? req.query.companyId : userId;

    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const stats = await appointmentService.getAppointmentStats(companyId, filters);

    res.json({
      success: true,
      stats,
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  } catch (error) {
    logger.error('Error getting appointment stats:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'فشل الحصول على الإحصائيات | Failed to get appointment stats',
      error: error.message,
    });
  }
};

/**
 * تصدير بيانات المقابلات (Excel / CSV / PDF)
 * Validates: Requirements 6 - تصدير البيانات
 *
 * @route POST /api/appointments/export
 * @access Private (company / admin)
 */
exports.exportAppointments = async (req, res) => {
  try {
    const { format = 'excel', filters = {} } = req.body;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // التحقق من الصيغة المطلوبة
    if (!['excel', 'csv', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'صيغة التصدير غير صحيحة. يجب أن تكون excel أو csv أو pdf',
      });
    }

    // التحقق من نطاق التاريخ إن وُجد
    if (filters.dateRange) {
      if (!filters.dateRange.start || !filters.dateRange.end) {
        return res.status(400).json({
          success: false,
          message: 'يجب تحديد تاريخ البداية والنهاية',
        });
      }
      if (new Date(filters.dateRange.start) > new Date(filters.dateRange.end)) {
        return res.status(400).json({
          success: false,
          message: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية',
        });
      }
    }

    // غير الأدمن يرى مقابلاته فقط
    if (!isAdmin) {
      filters.organizerId = userId;
    }

    const exportService = require('../services/exportService');
    const activityLogService = require('../services/activityLogService');

    const result = await exportService.processExportJob({
      dataType: 'appointments',
      format,
      filters,
    });

    // تسجيل عملية التصدير
    await activityLogService.createActivityLog({
      actorId: userId,
      actorName: req.user.name,
      actionType: 'data_exported',
      targetType: 'appointments',
      targetId: userId,
      details: `تصدير بيانات المقابلات بصيغة ${format}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      downloadUrl: result.downloadUrl,
      expiresAt: result.expiresAt,
      filename: result.filename,
      size: result.size,
    });
  } catch (error) {
    logger.error('Error exporting appointments:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'فشل تصدير بيانات المقابلات | Failed to export appointments',
      error: error.message,
    });
  }
};

// ==================== ملاحظات المواعيد ====================

/**
 * إضافة ملاحظة على موعد
 * Requirements: User Story 6 - نظام ملاحظات وتقييم
 *
 * @route POST /api/appointments/:id/notes
 * @access Private
 */
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { content, noteType } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'نص الملاحظة مطلوب' });
    }

    if (!['pre_interview', 'post_interview'].includes(noteType)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الملاحظة يجب أن يكون pre_interview أو post_interview',
      });
    }

    // التحقق من وجود الموعد وصلاحية المستخدم
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
    }

    const isOrganizer = appointment.organizerId.toString() === userId.toString();
    const isParticipant = appointment.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isOrganizer && !isParticipant) {
      return res.status(403).json({ success: false, message: 'ليس لديك صلاحية إضافة ملاحظة على هذا الموعد' });
    }

    const AppointmentNote = require('../models/AppointmentNote');
    const note = await AppointmentNote.create({
      appointmentId: id,
      userId,
      content: content.trim(),
      noteType,
    });

    const populated = await note.populate('userId', 'firstName lastName email profilePicture');

    res.status(201).json({ success: true, message: 'تمت إضافة الملاحظة بنجاح', note: populated });
  } catch (error) {
    logger.error('Error adding appointment note:', { error: error.message });
    res.status(500).json({ success: false, message: 'فشل إضافة الملاحظة', error: error.message });
  }
};

/**
 * جلب ملاحظات موعد معين
 * Requirements: User Story 6 - نظام ملاحظات وتقييم
 *
 * @route GET /api/appointments/:id/notes
 * @access Private
 */
exports.getNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
    }

    const isOrganizer = appointment.organizerId.toString() === userId.toString();
    const isParticipant = appointment.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isParticipant && !isAdmin) {
      return res.status(403).json({ success: false, message: 'ليس لديك صلاحية عرض ملاحظات هذا الموعد' });
    }

    const AppointmentNote = require('../models/AppointmentNote');
    const notes = await AppointmentNote.find({ appointmentId: id })
      .populate('userId', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 });

    res.json({ success: true, notes, total: notes.length });
  } catch (error) {
    logger.error('Error getting appointment notes:', { error: error.message });
    res.status(500).json({ success: false, message: 'فشل جلب الملاحظات', error: error.message });
  }
};

// ==================== تقييمات المواعيد ====================

/**
 * إضافة تقييم لموعد (بعد اكتماله فقط)
 * Requirements: User Story 6 - نظام ملاحظات وتقييم
 *
 * @route POST /api/appointments/:id/rating
 * @access Private
 */
exports.addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { score, comment } = req.body;

    // التحقق من صحة الدرجة
    const parsedScore = parseInt(score, 10);
    if (!parsedScore || parsedScore < 1 || parsedScore > 5) {
      return res.status(400).json({ success: false, message: 'درجة التقييم يجب أن تكون بين 1 و 5' });
    }

    // التحقق من وجود الموعد
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
    }

    // التحقق من أن الموعد مكتمل
    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تقييم الموعد إلا بعد اكتماله',
        code: 'APPOINTMENT_NOT_COMPLETED',
      });
    }

    // التحقق من أن المستخدم منظم أو مشارك
    const isOrganizer = appointment.organizerId.toString() === userId.toString();
    const isParticipant = appointment.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isOrganizer && !isParticipant) {
      return res.status(403).json({ success: false, message: 'ليس لديك صلاحية تقييم هذا الموعد' });
    }

    const AppointmentRating = require('../models/AppointmentRating');

    // التحقق من عدم وجود تقييم سابق (مرة واحدة فقط)
    const existing = await AppointmentRating.findOne({ appointmentId: id, raterId: userId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'لقد قمت بتقييم هذا الموعد مسبقاً',
        code: 'ALREADY_RATED',
      });
    }

    const rating = await AppointmentRating.create({
      appointmentId: id,
      raterId: userId,
      score: parsedScore,
      comment: comment ? comment.trim() : '',
    });

    const populated = await rating.populate('raterId', 'firstName lastName email profilePicture');

    res.status(201).json({ success: true, message: 'تم إضافة التقييم بنجاح', rating: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'لقد قمت بتقييم هذا الموعد مسبقاً',
        code: 'ALREADY_RATED',
      });
    }
    logger.error('Error adding appointment rating:', { error: error.message });
    res.status(500).json({ success: false, message: 'فشل إضافة التقييم', error: error.message });
  }
};

/**
 * جلب تقييم موعد معين
 * Requirements: User Story 6 - نظام ملاحظات وتقييم
 *
 * @route GET /api/appointments/:id/rating
 * @access Private
 */
exports.getRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
    }

    const isOrganizer = appointment.organizerId.toString() === userId.toString();
    const isParticipant = appointment.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isParticipant && !isAdmin) {
      return res.status(403).json({ success: false, message: 'ليس لديك صلاحية عرض تقييم هذا الموعد' });
    }

    const AppointmentRating = require('../models/AppointmentRating');
    const ratings = await AppointmentRating.find({ appointmentId: id })
      .populate('raterId', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 });

    // حساب متوسط التقييم
    const avgScore =
      ratings.length > 0
        ? Math.round((ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length) * 10) / 10
        : null;

    // تقييم المستخدم الحالي
    const myRating = ratings.find((r) => r.raterId._id.toString() === userId.toString()) || null;

    res.json({
      success: true,
      ratings,
      total: ratings.length,
      averageScore: avgScore,
      myRating,
    });
  } catch (error) {
    logger.error('Error getting appointment rating:', { error: error.message });
    res.status(500).json({ success: false, message: 'فشل جلب التقييم', error: error.message });
  }
};

// ==================== الملاحظات الشخصية (User Story 7) ====================

/**
 * إضافة ملاحظة شخصية على موعد
 * الملاحظات خاصة بالباحث فقط - لا تظهر للشركة أو أي مستخدم آخر
 *
 * @route POST /api/appointments/:id/personal-notes
 * @access Private (الباحث المشارك في الموعد فقط)
 */
exports.addPersonalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'نص الملاحظة مطلوب' });
    }

    // التحقق من وجود الموعد
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
    }

    // التحقق من أن المستخدم مشارك في الموعد (باحث)
    const isParticipant = appointment.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'الملاحظات الشخصية متاحة للمشاركين في الموعد فقط',
      });
    }

    const PersonalNote = require('../models/PersonalNote');
    const note = await PersonalNote.create({
      appointmentId: id,
      userId,
      content: content.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'تمت إضافة الملاحظة الشخصية بنجاح',
      note: {
        _id: note._id,
        appointmentId: note.appointmentId,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Error adding personal note:', { error: error.message });
    res.status(500).json({ success: false, message: 'فشل إضافة الملاحظة الشخصية', error: error.message });
  }
};

/**
 * جلب الملاحظات الشخصية لموعد معين (للمالك فقط)
 *
 * @route GET /api/appointments/:id/personal-notes
 * @access Private (الباحث المالك فقط)
 */
exports.getPersonalNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // التحقق من وجود الموعد
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
    }

    // التحقق من أن المستخدم مشارك في الموعد
    const isParticipant = appointment.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'الملاحظات الشخصية متاحة للمشاركين في الموعد فقط',
      });
    }

    const PersonalNote = require('../models/PersonalNote');
    // جلب ملاحظات المستخدم الحالي فقط (خاصة به)
    const notes = await PersonalNote.find({ appointmentId: id, userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      notes,
      total: notes.length,
    });
  } catch (error) {
    logger.error('Error getting personal notes:', { error: error.message });
    res.status(500).json({ success: false, message: 'فشل جلب الملاحظات الشخصية', error: error.message });
  }
};

/**
 * تعديل ملاحظة شخصية
 *
 * @route PUT /api/appointments/:id/personal-notes/:noteId
 * @access Private (المالك فقط)
 */
exports.updatePersonalNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'نص الملاحظة مطلوب' });
    }

    const PersonalNote = require('../models/PersonalNote');
    const note = await PersonalNote.findOne({ _id: noteId, appointmentId: id, userId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'الملاحظة غير موجودة أو ليس لديك صلاحية تعديلها',
      });
    }

    note.content = content.trim();
    await note.save();

    res.json({
      success: true,
      message: 'تم تعديل الملاحظة الشخصية بنجاح',
      note: {
        _id: note._id,
        appointmentId: note.appointmentId,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Error updating personal note:', { error: error.message });
    res.status(500).json({ success: false, message: 'فشل تعديل الملاحظة الشخصية', error: error.message });
  }
};

/**
 * حذف ملاحظة شخصية
 *
 * @route DELETE /api/appointments/:id/personal-notes/:noteId
 * @access Private (المالك فقط)
 */
exports.deletePersonalNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const userId = req.user._id;

    const PersonalNote = require('../models/PersonalNote');
    const note = await PersonalNote.findOneAndDelete({ _id: noteId, appointmentId: id, userId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'الملاحظة غير موجودة أو ليس لديك صلاحية حذفها',
      });
    }

    res.json({
      success: true,
      message: 'تم حذف الملاحظة الشخصية بنجاح',
    });
  } catch (error) {
    logger.error('Error deleting personal note:', { error: error.message });
    res.status(500).json({ success: false, message: 'فشل حذف الملاحظة الشخصية', error: error.message });
  }
};

// ==================== مستندات الموعد (User Story 7) ====================

/**
 * رفع مستند للموعد (CV محدث، Portfolio)
 * Requirements: User Story 7 - رفع مستندات (CV محدث، Portfolio)
 *
 * @route POST /api/appointments/:id/documents
 * @access Private (المشاركون في الموعد فقط)
 */
exports.uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { type = 'other' } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'لم يتم رفع أي ملف' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
    }

    // التحقق من أن المستخدم مشارك في الموعد
    const isParticipant = appointment.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'رفع المستندات متاح للمشاركين في الموعد فقط',
      });
    }

    // رفع الملف إلى Cloudinary
    const cloudinary = require('../config/cloudinary');
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'careerak/appointment-documents', resource_type: 'raw' },
        (error, res) => (error ? reject(error) : resolve(res))
      );
      stream.end(req.file.buffer);
    });

    const doc = {
      name: req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      type: ['cv', 'portfolio', 'other'].includes(type) ? type : 'other',
      uploadedBy: userId,
      uploadedAt: new Date(),
    };

    appointment.documents.push(doc);
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'تم رفع المستند بنجاح',
      document: appointment.documents[appointment.documents.length - 1],
    });
  } catch (error) {
    logger.error('Error uploading appointment document:', { error: error.message });
    res.status(500).json({ success: false, message: 'فشل رفع المستند', error: error.message });
  }
};

/**
 * جلب مستندات الموعد
 *
 * @route GET /api/appointments/:id/documents
 * @access Private (المنظم والمشاركون)
 */
exports.getDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id)
      .populate('documents.uploadedBy', 'firstName lastName email profilePicture');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
    }

    const isOrganizer = appointment.organizerId.toString() === userId.toString();
    const isParticipant = appointment.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isOrganizer && !isParticipant) {
      return res.status(403).json({ success: false, message: 'ليس لديك صلاحية الوصول لمستندات هذا الموعد' });
    }

    res.json({
      success: true,
      documents: appointment.documents,
      total: appointment.documents.length,
    });
  } catch (error) {
    logger.error('Error getting appointment documents:', { error: error.message });
    res.status(500).json({ success: false, message: 'فشل جلب المستندات', error: error.message });
  }
};

/**
 * حذف مستند من الموعد
 *
 * @route DELETE /api/appointments/:id/documents/:docId
 * @access Private (من رفع المستند فقط)
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
    }

    const doc = appointment.documents.id(docId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'المستند غير موجود' });
    }

    if (doc.uploadedBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'يمكنك فقط حذف المستندات التي رفعتها' });
    }

    // حذف من Cloudinary (non-blocking)
    try {
      const cloudinary = require('../config/cloudinary');
      await cloudinary.uploader.destroy(doc.publicId, { resource_type: 'raw' });
    } catch (cloudErr) {
      logger.warn('Failed to delete document from Cloudinary:', { publicId: doc.publicId });
    }

    appointment.documents.pull(docId);
    await appointment.save();

    res.json({ success: true, message: 'تم حذف المستند بنجاح' });
  } catch (error) {
    logger.error('Error deleting appointment document:', { error: error.message });
    res.status(500).json({ success: false, message: 'فشل حذف المستند', error: error.message });
  }
};

// ==================== معلومات الشركة (User Story 7) ====================

/**
 * جلب معلومات الشركة المرتبطة بالموعد
 * Requirements: User Story 7 - روابط سريعة لمعلومات الشركة
 *
 * @route GET /api/appointments/:id/company-info
 * @access Private (المشاركون في الموعد فقط)
 */
exports.getCompanyInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // جلب الموعد مع populate للمنظم
    const appointment = await Appointment.findById(id)
      .populate('organizerId', 'firstName lastName companyName companyIndustry email profilePicture country city')
      .populate({
        path: 'jobApplicationId',
        select: 'jobPosting',
        populate: {
          path: 'jobPosting',
          select: 'title _id postedBy',
        },
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود | Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND',
      });
    }

    // التحقق من الصلاحية: منظم أو مشارك
    const isOrganizer = appointment.organizerId._id.toString() === userId.toString();
    const isParticipant = appointment.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية الوصول لهذا الموعد | Forbidden',
        code: 'FORBIDDEN',
      });
    }

    const organizer = appointment.organizerId;

    // جلب CompanyInfo إن وجدت
    const CompanyInfo = require('../models/CompanyInfo');
    const companyInfo = await CompanyInfo.findOne({ company: organizer._id });

    // بناء كائن معلومات الشركة
    const company = {
      id: organizer._id,
      name: organizer.companyName || `${organizer.firstName || ''} ${organizer.lastName || ''}`.trim(),
      industry: organizer.companyIndustry || null,
      logo: companyInfo?.logo || organizer.profilePicture || null,
      description: companyInfo?.description || null,
      location: companyInfo ? null : (organizer.city && organizer.country ? `${organizer.city}, ${organizer.country}` : organizer.country || null),
      website: companyInfo?.website || null,
      verified: companyInfo?.verified || false,
      responseRate: companyInfo?.responseRate || null,
      socialMedia: companyInfo?.socialMedia || null,
    };

    // معلومات الوظيفة المرتبطة
    let job = null;
    if (appointment.jobApplicationId?.jobPosting) {
      const jp = appointment.jobApplicationId.jobPosting;
      job = {
        id: jp._id,
        title: jp.title,
      };
    }

    // رابط المحادثة مع الشركة (إن وجد)
    const Conversation = require('../models/Conversation');
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, organizer._id] },
    }).select('_id');

    res.json({
      success: true,
      company,
      job,
      links: {
        companyPage: `/company/${organizer._id}`,
        jobPage: job ? `/job-postings/${job.id}` : null,
        chatConversationId: existingConversation?._id || null,
        startChat: `/chat?with=${organizer._id}`,
      },
    });
  } catch (error) {
    logger.error('Error getting company info for appointment:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'فشل جلب معلومات الشركة | Failed to get company info',
      error: error.message,
    });
  }
};

/**
 * تحديث حالة الحضور للموعد
 * يتيح للشركة تسجيل ما إذا حضر المرشح أم لا بعد انتهاء الموعد
 * Validates: KPI "معدل الحضور > 85%"
 *
 * @route PATCH /api/appointments/:id/attendance
 * @body { attendanceStatus: 'attended' | 'no_show' | 'cancelled' }
 * @access Private (Organizer / Company only)
 */
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { attendanceStatus } = req.body;

    const validStatuses = ['attended', 'no_show', 'cancelled'];
    if (!attendanceStatus || !validStatuses.includes(attendanceStatus)) {
      return res.status(400).json({
        success: false,
        message: `حالة الحضور يجب أن تكون إحدى القيم: ${validStatuses.join(', ')}`,
        code: 'INVALID_ATTENDANCE_STATUS',
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود',
        code: 'APPOINTMENT_NOT_FOUND',
      });
    }

    // فقط المنظم (الشركة) يمكنه تحديث حالة الحضور
    const isOrganizer = appointment.organizerId.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'فقط الشركة المنظمة يمكنها تحديث حالة الحضور',
        code: 'FORBIDDEN',
      });
    }

    // يجب أن يكون الموعد مكتملاً أو في الماضي
    const now = new Date();
    const appointmentEnd = appointment.endsAt || new Date(appointment.scheduledAt.getTime() + (appointment.duration || 60) * 60000);
    if (appointmentEnd > now && appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تحديث حالة الحضور قبل انتهاء الموعد',
        code: 'APPOINTMENT_NOT_ENDED',
      });
    }

    // تحديث حالة الحضور
    appointment.attendanceStatus = attendanceStatus;
    appointment.attendanceUpdatedAt = new Date();
    appointment.attendanceUpdatedBy = userId;

    // إذا كان الموعد لم يُكتمل بعد، نحدّث حالته
    if (appointment.status !== 'completed' && appointment.status !== 'cancelled') {
      appointment.status = 'completed';
    }

    await appointment.save();

    logger.info('Attendance status updated', {
      appointmentId: id,
      attendanceStatus,
      updatedBy: userId,
    });

    res.json({
      success: true,
      message: 'تم تحديث حالة الحضور بنجاح',
      appointment: {
        id: appointment._id,
        attendanceStatus: appointment.attendanceStatus,
        attendanceUpdatedAt: appointment.attendanceUpdatedAt,
        status: appointment.status,
      },
    });
  } catch (error) {
    logger.error('Error updating attendance status:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'فشل تحديث حالة الحضور',
      error: error.message,
    });
  }
};

module.exports = exports;
