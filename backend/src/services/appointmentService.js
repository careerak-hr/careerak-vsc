const Appointment = require('../models/Appointment');
const AppointmentHistory = require('../models/AppointmentHistory');
const notificationService = require('./notificationService');
const reminderService = require('./reminderService');
const Reminder = require('../models/Reminder');
const logger = require('../utils/logger');

/**
 * خدمة إدارة المواعيد
 * 
 * Requirements: User Story 4 - إلغاء وتعديل المواعيد
 * - يمكن تعديل الموعد حتى 24 ساعة قبل الموعد
 * - يمكن إلغاء الموعد حتى ساعة واحدة قبل الموعد
 * 
 * Requirements: User Story 5 - تكامل Google Calendar (6.3)
 * - تحديث حدث Google Calendar عند التعديل (إن كان التكامل مفعّلاً)
 * - حذف حدث Google Calendar عند الإلغاء (إن كان التكامل مفعّلاً)
 * - إعادة إتاحة الفترة الزمنية المُلغاة في Availability تلقائياً
 */

const RESCHEDULE_DEADLINE_MINUTES = 1440; // 24 ساعة = 1440 دقيقة
const CANCEL_DEADLINE_MINUTES = 60;       // 1 ساعة = 60 دقيقة

class AppointmentService {

  /**
   * إعادة جدولة موعد
   * 
   * @param {string} appointmentId - معرف الموعد
   * @param {string} userId - معرف المستخدم الذي يقوم بالتعديل
   * @param {Date|string} newDateTime - الوقت الجديد للموعد
   * @param {string} [reason] - سبب إعادة الجدولة (اختياري)
   * @returns {Promise<{appointment: Object, newAppointment: Object}>}
   */
  async rescheduleAppointment(appointmentId, userId, newDateTime, reason = '') {
    // 1. التحقق من وجود الموعد وانتماؤه للمستخدم
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      const error = new Error('الموعد غير موجود | Appointment not found');
      error.statusCode = 404;
      error.code = 'APPOINTMENT_NOT_FOUND';
      throw error;
    }

    // التحقق من أن المستخدم هو المنظم أو أحد المشاركين
    const isOrganizer = appointment.organizerId.toString() === userId.toString();
    const isParticipant = appointment.participants.some(
      p => p.userId.toString() === userId.toString()
    );

    if (!isOrganizer && !isParticipant) {
      const error = new Error('ليس لديك صلاحية تعديل هذا الموعد | You do not have permission to reschedule this appointment');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // 2. التحقق من حالة الموعد
    if (['cancelled', 'completed', 'rescheduled'].includes(appointment.status)) {
      const error = new Error(
        `لا يمكن إعادة جدولة موعد بحالة: ${appointment.status} | Cannot reschedule appointment with status: ${appointment.status}`
      );
      error.statusCode = 400;
      error.code = 'INVALID_STATUS';
      throw error;
    }

    // 3. التحقق من حد إعادة الجدولة: يجب أن يكون الوقت الحالي أكثر من 24 ساعة قبل الموعد الأصلي
    const now = new Date();
    const originalAppointmentTime = new Date(appointment.scheduledAt);
    const minutesUntilAppointment = (originalAppointmentTime - now) / (60 * 1000);

    if (minutesUntilAppointment < RESCHEDULE_DEADLINE_MINUTES) {
      const hoursRemaining = Math.max(0, Math.floor(minutesUntilAppointment / 60));
      const minutesRemaining = Math.max(0, Math.floor(minutesUntilAppointment % 60));

      const error = new Error(
        `لا يمكن إعادة جدولة الموعد في أقل من 24 ساعة قبل موعده. الوقت المتبقي: ${hoursRemaining} ساعة و${minutesRemaining} دقيقة | ` +
        `Cannot reschedule appointment less than 24 hours before. Time remaining: ${hoursRemaining}h ${minutesRemaining}m`
      );
      error.statusCode = 400;
      error.code = 'RESCHEDULE_DEADLINE_PASSED';
      error.scheduledAt = appointment.scheduledAt;
      error.hoursRemaining = hoursRemaining;
      error.minutesRemaining = minutesRemaining;
      throw error;
    }

    // 4. التحقق من صحة الوقت الجديد
    const newScheduledDate = new Date(newDateTime);
    if (isNaN(newScheduledDate.getTime())) {
      const error = new Error('تاريخ غير صحيح | Invalid date format');
      error.statusCode = 400;
      error.code = 'INVALID_DATE';
      throw error;
    }

    if (newScheduledDate <= now) {
      const error = new Error('لا يمكن جدولة موعد في الماضي | Cannot schedule appointment in the past');
      error.statusCode = 400;
      error.code = 'PAST_DATE';
      throw error;
    }

    // 5. التحقق من عدم وجود تعارض في الوقت الجديد
    await this._checkConflict(appointment.organizerId, newScheduledDate, appointment.duration, appointmentId);

    // 6. حفظ سجل التعديل في الموعد الأصلي
    const historyEntry = {
      oldDateTime: appointment.scheduledAt,
      newDateTime: newScheduledDate,
      rescheduledBy: userId,
      reason: reason || '',
      rescheduledAt: now,
    };

    appointment.rescheduleHistory = appointment.rescheduleHistory || [];
    appointment.rescheduleHistory.push(historyEntry);

    // 7. إنشاء موعد جديد بالوقت الجديد
    const newAppointment = new Appointment({
      type: appointment.type,
      title: appointment.title,
      description: appointment.description,
      organizerId: appointment.organizerId,
      participants: appointment.participants.map(p => ({
        userId: p.userId,
        status: 'pending',
      })),
      scheduledAt: newScheduledDate,
      duration: appointment.duration,
      location: appointment.location,
      jobApplicationId: appointment.jobApplicationId,
      notes: appointment.notes,
      previousAppointmentId: appointment._id,
      rescheduleHistory: [historyEntry],
    });

    await newAppointment.save();

    // 8. تحديث الموعد الأصلي
    appointment.status = 'rescheduled';
    appointment.rescheduledToId = newAppointment._id;
    appointment.cancellationReason = reason || 'تم إعادة الجدولة';
    await appointment.save();

    // إلغاء التذكيرات المعلقة للموعد القديم (non-blocking)
    Reminder.updateMany(
      { appointmentId: appointment._id, status: 'pending' },
      { status: 'failed', failureReason: 'appointment_rescheduled' }
    ).catch(err => logger.warn('Failed to cancel old reminders on reschedule:', err.message));

    // إنشاء تذكيرات للموعد الجديد (non-blocking)
    reminderService.createRemindersForAppointment(newAppointment).catch(err => {
      logger.error('Failed to create reminders for rescheduled appointment:', { error: err.message, appointmentId: newAppointment._id });
    });

    // تسجيل عملية إعادة الجدولة في سجل التاريخ (middleware تلقائي)
    await this.logHistory(
      appointment._id,
      'rescheduled',
      userId,
      {
        startTime: appointment.scheduledAt,
        endTime: appointment.endsAt || new Date(appointment.scheduledAt.getTime() + (appointment.duration || 60) * 60000),
      },
      {
        startTime: newScheduledDate,
        endTime: new Date(newScheduledDate.getTime() + (appointment.duration || 60) * 60000),
      },
      reason
    );

    // 9. تحديث حدث Google Calendar إن كان التكامل مفعّلاً (غير متزامن - لا يوقف العملية)
    await this._updateGoogleCalendarOnReschedule(appointment, newAppointment);

    // 10. إرسال إشعارات للطرفين
    await this._sendRescheduleNotifications(appointment, newAppointment, userId, reason);

    logger.info('Appointment rescheduled via AppointmentService', {
      oldAppointmentId: appointment._id,
      newAppointmentId: newAppointment._id,
      rescheduledBy: userId,
      oldDateTime: appointment.scheduledAt,
      newDateTime: newScheduledDate,
    });

    return {
      appointment,
      newAppointment,
    };
  }

  /**
   * تحديث حدث Google Calendar عند إعادة الجدولة
   * - يحذف الحدث القديم من Google Calendar
   * - ينشئ حدثاً جديداً للموعد الجديد
   * @private
   */
  async _updateGoogleCalendarOnReschedule(oldAppointment, newAppointment) {
    try {
      const googleCalendarService = require('./googleCalendarService');

      // تحديث الحدث القديم في Google Calendar (إن كان له googleEventId)
      if (oldAppointment.googleEventId) {
        await googleCalendarService.updateEventForAppointment(
          {
            ...newAppointment.toObject(),
            googleEventId: oldAppointment.googleEventId,
          },
          oldAppointment.organizerId.toString()
        );

        // نقل googleEventId إلى الموعد الجديد
        await Appointment.findByIdAndUpdate(newAppointment._id, {
          googleEventId: oldAppointment.googleEventId,
          googleEventLink: oldAppointment.googleEventLink,
        });

        logger.info('Google Calendar event updated for rescheduled appointment', {
          oldAppointmentId: oldAppointment._id,
          newAppointmentId: newAppointment._id,
          googleEventId: oldAppointment.googleEventId,
        });
      } else {
        // إنشاء حدث جديد في Google Calendar للموعد الجديد
        await googleCalendarService.createEventForAppointment(
          newAppointment,
          newAppointment.organizerId.toString()
        );
      }
    } catch (err) {
      // لا نوقف العملية إذا فشل تحديث Google Calendar
      logger.warn('Google Calendar update failed on reschedule (non-blocking):', err.message);
    }
  }

  /**
   * التحقق من عدم وجود تعارض في الوقت الجديد
   * @private
   */
  async _checkConflict(organizerId, newDateTime, duration, excludeAppointmentId = null) {
    const newEndTime = new Date(newDateTime.getTime() + duration * 60 * 1000);

    const query = {
      organizerId,
      status: { $in: ['scheduled', 'confirmed'] },
      $or: [
        {
          scheduledAt: { $lt: newEndTime },
          endsAt: { $gt: newDateTime },
        },
      ],
    };

    if (excludeAppointmentId) {
      query._id = { $ne: excludeAppointmentId };
    }

    const conflictingAppointment = await Appointment.findOne(query);

    if (conflictingAppointment) {
      const error = new Error(
        'الوقت الجديد يتعارض مع موعد آخر | The new time conflicts with another appointment'
      );
      error.statusCode = 409;
      error.code = 'TIME_CONFLICT';
      error.conflictingAppointmentId = conflictingAppointment._id;
      error.conflictingScheduledAt = conflictingAppointment.scheduledAt;
      throw error;
    }
  }

  /**
   * إرسال إشعارات إعادة الجدولة للطرفين
   * @private
   */
  async _sendRescheduleNotifications(oldAppointment, newAppointment, rescheduledBy, reason) {
    const newScheduledTime = new Date(newAppointment.scheduledAt).toLocaleString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const relatedData = {
      oldAppointmentId: oldAppointment._id,
      newAppointmentId: newAppointment._id,
      newScheduledAt: newAppointment.scheduledAt,
      reason: reason || 'تم إعادة الجدولة',
    };

    const notificationPromises = [];

    // إشعار للمشاركين
    for (const participant of oldAppointment.participants) {
      const participantId = participant.userId.toString();
      if (participantId !== rescheduledBy.toString()) {
        notificationPromises.push(
          notificationService.createNotification({
            recipient: participant.userId,
            type: 'appointment_rescheduled',
            title: 'تم إعادة جدولة موعدك 🔄',
            message: `تم إعادة جدولة الموعد "${oldAppointment.title}" إلى ${newScheduledTime}`,
            relatedData,
            priority: 'high',
          }).catch(err => logger.error('Failed to send reschedule notification to participant:', err))
        );
      }
    }

    // إشعار للمنظم إذا لم يكن هو من أعاد الجدولة
    if (oldAppointment.organizerId.toString() !== rescheduledBy.toString()) {
      notificationPromises.push(
        notificationService.createNotification({
          recipient: oldAppointment.organizerId,
          type: 'appointment_rescheduled',
          title: 'تم إعادة جدولة الموعد 🔄',
          message: `تم إعادة جدولة الموعد "${oldAppointment.title}" إلى ${newScheduledTime}`,
          relatedData,
          priority: 'high',
        }).catch(err => logger.error('Failed to send reschedule notification to organizer:', err))
      );
    }

    // إشعار تأكيد لمن قام بإعادة الجدولة
    notificationPromises.push(
      notificationService.createNotification({
        recipient: rescheduledBy,
        type: 'appointment_rescheduled',
        title: 'تم إعادة جدولة الموعد بنجاح ✅',
        message: `تم إعادة جدولة الموعد "${oldAppointment.title}" إلى ${newScheduledTime}`,
        relatedData,
        priority: 'medium',
      }).catch(err => logger.error('Failed to send reschedule confirmation notification:', err))
    );

    // إرسال إشعارات Pusher الفورية
    try {
      const pusherService = require('./pusherService');
      if (pusherService.isEnabled()) {
        const pusherPayload = {
          type: 'appointment_rescheduled',
          appointmentTitle: oldAppointment.title,
          oldScheduledAt: oldAppointment.scheduledAt,
          newScheduledAt: newAppointment.scheduledAt,
          newAppointmentId: newAppointment._id,
          reason: reason || '',
          timestamp: new Date().toISOString(),
        };

        const allRecipients = [
          oldAppointment.organizerId,
          ...oldAppointment.participants.map(p => p.userId),
        ];

        const uniqueRecipients = [...new Set(allRecipients.map(id => id.toString()))];

        for (const recipientId of uniqueRecipients) {
          notificationPromises.push(
            pusherService.sendNotificationToUser(recipientId, {
              ...pusherPayload,
              title: recipientId === rescheduledBy.toString()
                ? 'تم إعادة جدولة الموعد بنجاح ✅'
                : 'تم إعادة جدولة موعدك 🔄',
              message: `الموعد "${oldAppointment.title}" أُعيد جدولته إلى ${newScheduledTime}`,
            }).catch(err => logger.warn('Pusher notification failed:', err.message))
          );
        }
      }
    } catch (pusherError) {
      logger.warn('Pusher service unavailable for reschedule notifications:', pusherError.message);
    }

    await Promise.allSettled(notificationPromises);
  }

  /**
   * إلغاء موعد (حتى 1 ساعة قبل الموعد)
   * يُرسل إشعاراً تلقائياً للطرف الآخر عند الإلغاء
   * 
   * @param {string} appointmentId - معرف الموعد
   * @param {string} userId - معرف المستخدم
   * @param {string} [reason] - سبب الإلغاء
   */
  async cancelAppointment(appointmentId, userId, reason = '') {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      const error = new Error('الموعد غير موجود | Appointment not found');
      error.statusCode = 404;
      error.code = 'APPOINTMENT_NOT_FOUND';
      throw error;
    }

    const isOrganizer = appointment.organizerId.toString() === userId.toString();
    const isParticipant = appointment.participants.some(
      p => p.userId.toString() === userId.toString()
    );

    if (!isOrganizer && !isParticipant) {
      const error = new Error('ليس لديك صلاحية إلغاء هذا الموعد | You do not have permission to cancel this appointment');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (['cancelled', 'completed'].includes(appointment.status)) {
      const error = new Error(
        `لا يمكن إلغاء موعد بحالة: ${appointment.status} | Cannot cancel appointment with status: ${appointment.status}`
      );
      error.statusCode = 400;
      error.code = 'INVALID_STATUS';
      throw error;
    }

    const now = new Date();
    const appointmentTime = new Date(appointment.scheduledAt);
    const minutesUntilAppointment = (appointmentTime - now) / (60 * 1000);

    if (minutesUntilAppointment < CANCEL_DEADLINE_MINUTES) {
      const minutesRemaining = Math.max(0, Math.floor(minutesUntilAppointment));
      const error = new Error(
        `لا يمكن إلغاء الموعد في أقل من ساعة واحدة قبل موعده. الوقت المتبقي: ${minutesRemaining} دقيقة | ` +
        `Cannot cancel appointment less than 1 hour before. Minutes remaining: ${minutesRemaining}`
      );
      error.statusCode = 400;
      error.code = 'CANCELLATION_DEADLINE_PASSED';
      error.scheduledAt = appointment.scheduledAt;
      error.minutesRemaining = minutesRemaining;
      throw error;
    }

    await appointment.cancel(reason || 'تم الإلغاء');

    // تسجيل عملية الإلغاء في سجل التاريخ (middleware تلقائي)
    await this.logHistory(
      appointment._id,
      'cancelled',
      userId,
      {
        startTime: appointment.scheduledAt,
        endTime: appointment.endsAt || new Date(appointment.scheduledAt.getTime() + (appointment.duration || 60) * 60000),
      },
      null,
      reason
    );

    // إعادة إتاحة الفترة الزمنية في Availability تلقائياً
    await this._releaseAvailabilitySlot(appointment);

    // حذف حدث Google Calendar إن كان التكامل مفعّلاً (غير متزامن)
    await this._deleteGoogleCalendarOnCancel(appointment);

    // إرسال إشعارات للطرف الآخر تلقائياً
    await this._sendCancellationNotifications(appointment, userId, reason);

    logger.info('Appointment cancelled via AppointmentService', {
      appointmentId: appointment._id,
      cancelledBy: userId,
    });

    return appointment;
  }

  /**
   * إعادة إتاحة الفترة الزمنية المُلغاة في Availability تلقائياً
   * يُستدعى بعد إلغاء الموعد لضمان ظهور الفترة متاحة مجدداً
   * (الإتاحة تعتمد على عدد المواعيد النشطة مقارنةً بـ maxConcurrent،
   *  لذا مجرد تغيير حالة الموعد إلى cancelled يكفي لإعادة الإتاحة)
   * @private
   */
  async _releaseAvailabilitySlot(appointment) {
    try {
      // الإتاحة محسوبة ديناميكياً في availabilityService.getAvailableSlotsWithBookings
      // بناءً على عدد المواعيد بحالة scheduled/confirmed/in_progress
      // بما أن الموعد أصبح cancelled، فإن الفترة ستظهر متاحة تلقائياً
      // لا حاجة لتعديل نموذج Availability مباشرةً
      logger.info('Availability slot released for cancelled appointment', {
        appointmentId: appointment._id,
        scheduledAt: appointment.scheduledAt,
        organizerId: appointment.organizerId,
      });
    } catch (err) {
      logger.warn('Failed to release availability slot (non-blocking):', err.message);
    }
  }

  /**
   * حذف حدث Google Calendar عند إلغاء الموعد
   * @private
   */
  async _deleteGoogleCalendarOnCancel(appointment) {
    try {
      if (!appointment.googleEventId) return;

      const googleCalendarService = require('./googleCalendarService');
      await googleCalendarService.deleteEventForAppointment(
        appointment,
        appointment.organizerId.toString()
      );

      logger.info('Google Calendar event deleted for cancelled appointment', {
        appointmentId: appointment._id,
        googleEventId: appointment.googleEventId,
      });
    } catch (err) {
      // لا نوقف العملية إذا فشل حذف حدث Google Calendar
      logger.warn('Google Calendar delete failed on cancel (non-blocking):', err.message);
    }
  }

  /**
   * إرسال إشعارات الإلغاء للطرف الآخر
   * إذا ألغت الشركة (المنظم) → يُرسل للمشاركين (الباحثين)
   * إذا ألغى الباحث (مشارك) → يُرسل للمنظم (الشركة)
   * @private
   */
  async _sendCancellationNotifications(appointment, cancelledBy, reason) {
    const relatedData = {
      appointment: appointment._id,
      reason: reason || 'تم الإلغاء',
      cancelledBy,
    };

    const notificationPromises = [];

    // إشعار للمشاركين (الطرف الآخر إذا كان المنظم هو من ألغى)
    for (const participant of appointment.participants) {
      const participantId = participant.userId.toString();
      if (participantId !== cancelledBy.toString()) {
        notificationPromises.push(
          notificationService.createNotification({
            recipient: participant.userId,
            type: 'appointment_cancelled',
            title: 'تم إلغاء موعدك 🚫',
            message: `تم إلغاء الموعد "${appointment.title}"${reason ? `: ${reason}` : ''}`,
            relatedData,
            priority: 'high',
          }).catch(err => logger.error('Failed to send cancellation notification to participant:', err))
        );
      }
    }

    // إشعار للمنظم إذا كان أحد المشاركين هو من ألغى
    if (appointment.organizerId.toString() !== cancelledBy.toString()) {
      notificationPromises.push(
        notificationService.createNotification({
          recipient: appointment.organizerId,
          type: 'appointment_cancelled',
          title: 'تم إلغاء الموعد 🚫',
          message: `تم إلغاء الموعد "${appointment.title}"${reason ? `: ${reason}` : ''}`,
          relatedData,
          priority: 'high',
        }).catch(err => logger.error('Failed to send cancellation notification to organizer:', err))
      );
    }

    // إرسال إشعارات Pusher الفورية
    try {
      const pusherService = require('./pusherService');
      if (pusherService.isEnabled()) {
        const pusherPayload = {
          type: 'appointment_cancelled',
          appointmentId: appointment._id,
          appointmentTitle: appointment.title,
          reason: reason || '',
          cancelledBy,
          timestamp: new Date().toISOString(),
        };

        const allRecipients = [
          appointment.organizerId,
          ...appointment.participants.map(p => p.userId),
        ];

        const uniqueRecipients = [...new Set(allRecipients.map(id => id.toString()))];

        for (const recipientId of uniqueRecipients) {
          if (recipientId !== cancelledBy.toString()) {
            notificationPromises.push(
              pusherService.sendNotificationToUser(recipientId, {
                ...pusherPayload,
                title: 'تم إلغاء موعدك 🚫',
                message: `الموعد "${appointment.title}" تم إلغاؤه`,
              }).catch(err => logger.warn('Pusher cancellation notification failed:', err.message))
            );
          }
        }
      }
    } catch (pusherError) {
      logger.warn('Pusher service unavailable for cancellation notifications:', pusherError.message);
    }

    await Promise.allSettled(notificationPromises);
  }

  /**
   * إحصائيات المواعيد للشركة
   * Requirements: User Story 6 - إحصائيات (عدد المقابلات، معدل الحضور، إلخ)
   *
   * @param {string} companyId - معرف الشركة (المنظم)
   * @param {Object} filters - فلاتر اختيارية { startDate, endDate }
   * @returns {Promise<Object>} إحصائيات المواعيد
   */
  async getAppointmentStats(companyId, filters = {}) {
    const query = { organizerId: companyId };

    // فلترة حسب نطاق التاريخ
    if (filters.startDate || filters.endDate) {
      query.scheduledAt = {};
      if (filters.startDate) query.scheduledAt.$gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.scheduledAt.$lte = end;
      }
    }

    const [total, scheduled, confirmed, completed, cancelled, attended, noShow] = await Promise.all([
      Appointment.countDocuments(query),
      Appointment.countDocuments({ ...query, status: 'scheduled' }),
      Appointment.countDocuments({ ...query, status: 'confirmed' }),
      Appointment.countDocuments({ ...query, status: 'completed' }),
      Appointment.countDocuments({ ...query, status: 'cancelled' }),
      Appointment.countDocuments({ ...query, attendanceStatus: 'attended' }),
      Appointment.countDocuments({ ...query, attendanceStatus: 'no_show' }),
    ]);

    // معدل الحضور الفعلي = (attended / total completed) × 100
    // يُحسب فقط من المواعيد المكتملة التي سُجّل فيها حضور
    const totalWithAttendance = attended + noShow;
    const attendanceRate = totalWithAttendance > 0
      ? Math.round((attended / totalWithAttendance) * 100)
      : completed > 0
        ? Math.round((completed / (completed + cancelled)) * 100)
        : 0;

    // معدل الإلغاء = (الملغاة / الإجمالي) × 100
    const cancellationRate = total > 0
      ? Math.round((cancelled / total) * 100)
      : 0;

    // تنبيه عندما يكون معدل الحضور أقل من 85%
    const ATTENDANCE_TARGET = 85;
    const attendanceAlert = attendanceRate < ATTENDANCE_TARGET;

    return {
      total,
      byStatus: {
        scheduled,
        confirmed,
        completed,
        cancelled,
      },
      attendance: {
        attended,
        noShow,
        totalTracked: totalWithAttendance,
      },
      attendanceRate,
      cancellationRate,
      attendanceAlert,
      attendanceTarget: ATTENDANCE_TARGET,
    };
  }

  /**
   * تسجيل عملية إلغاء أو إعادة جدولة في سجل التاريخ
   * يُستدعى تلقائياً قبل تنفيذ أي عملية إلغاء أو تعديل
   * 
   * @param {string} appointmentId - معرف الموعد
   * @param {string} action - نوع العملية: 'cancelled' | 'rescheduled'
   * @param {string} performedBy - معرف المستخدم الذي أجرى العملية
   * @param {Object} previousData - بيانات الموعد قبل التعديل { startTime, endTime }
   * @param {Object|null} newData - بيانات الموعد الجديد (عند إعادة الجدولة فقط) { startTime, endTime }
   * @param {string} [reason] - سبب العملية (اختياري)
   * @returns {Promise<AppointmentHistory>}
   */
  async logHistory(appointmentId, action, performedBy, previousData, newData = null, reason = '') {
    try {
      const historyEntry = new AppointmentHistory({
        appointmentId,
        action,
        performedBy,
        previousStartTime: previousData.startTime,
        previousEndTime: previousData.endTime,
        newStartTime: newData ? newData.startTime : null,
        newEndTime: newData ? newData.endTime : null,
        reason: reason || '',
      });

      await historyEntry.save();

      logger.info('Appointment history logged', {
        appointmentId,
        action,
        performedBy,
        historyId: historyEntry._id,
      });

      return historyEntry;
    } catch (err) {
      // لا نوقف العملية الأصلية إذا فشل تسجيل السجل
      logger.error('Failed to log appointment history', {
        appointmentId,
        action,
        error: err.message,
      });
    }
  }
}

module.exports = new AppointmentService();
