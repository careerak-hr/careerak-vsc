const Reminder = require('../models/Reminder');
const Appointment = require('../models/Appointment');
const reminderService = require('../services/reminderService');
const logger = require('../utils/logger');

/**
 * جلب تذكيرات المستخدم
 * @route GET /reminders
 */
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id })
      .populate('appointmentId', 'title scheduledAt duration')
      .sort({ scheduledAt: 1 });

    res.json({ success: true, reminders });
  } catch (err) {
    logger.error('getReminders error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * تحديث أوقات التذكير المخصصة
 * @route PUT /reminders/:id
 */
exports.updateReminder = async (req, res) => {
  try {
    const { customReminders } = req.body;

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'التذكير غير موجود' });
    }

    if (Array.isArray(customReminders)) {
      // التحقق من أن القيم أرقام موجبة
      const valid = customReminders.every(v => typeof v === 'number' && v > 0);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: 'يجب أن تكون أوقات التذكير أرقاماً موجبة (بالدقائق)',
        });
      }
      reminder.customReminders = customReminders;
    }

    await reminder.save();
    res.json({ success: true, reminder });

    // جدولة التذكيرات المخصصة الجديدة بشكل غير متزامن
    if (Array.isArray(customReminders) && customReminders.length > 0) {
      reminderService.scheduleCustomReminders(reminder._id).catch(err =>
        logger.warn('scheduleCustomReminders failed:', err.message)
      );
    }
  } catch (err) {
    logger.error('updateReminder error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * حذف تذكير
 * @route DELETE /reminders/:id
 */
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'التذكير غير موجود' });
    }

    res.json({ success: true, message: 'تم حذف التذكير' });
  } catch (err) {
    logger.error('deleteReminder error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * إنشاء تذكير يدوي لموعد
 * @route POST /reminders
 */
exports.createReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { appointmentId, type, channel, customMinutes } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'appointmentId مطلوب' });
    }

    // التحقق من وجود الموعد وأن المستخدم مشارك أو منظم
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
    }

    const isOrganizer = appointment.organizerId.toString() === userId.toString();
    const isParticipant = appointment.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isOrganizer && !isParticipant) {
      return res.status(403).json({ success: false, message: 'ليس لديك صلاحية إنشاء تذكير لهذا الموعد' });
    }

    // التحقق من نوع التذكير
    const validTypes = ['24h', '1h'];
    const reminderType = type || '24h';
    if (!validTypes.includes(reminderType) && !customMinutes) {
      return res.status(400).json({
        success: false,
        message: `نوع التذكير يجب أن يكون أحد: ${validTypes.join(', ')} أو تحديد customMinutes`,
      });
    }

    // التحقق من قناة الإرسال
    const validChannels = ['notification', 'email', 'sms'];
    const reminderChannel = channel || 'notification';
    if (!validChannels.includes(reminderChannel)) {
      return res.status(400).json({
        success: false,
        message: `قناة الإرسال يجب أن تكون أحد: ${validChannels.join(', ')}`,
      });
    }

    // حساب وقت الإرسال المجدول
    const scheduledAt = new Date(appointment.scheduledAt);
    let offsetMs;

    if (customMinutes && customMinutes > 0) {
      offsetMs = customMinutes * 60 * 1000;
    } else if (reminderType === '24h') {
      offsetMs = 24 * 60 * 60 * 1000;
    } else {
      offsetMs = 1 * 60 * 60 * 1000;
    }

    const reminderScheduledAt = new Date(scheduledAt.getTime() - offsetMs);

    if (reminderScheduledAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'وقت التذكير المحسوب في الماضي - لا يمكن إنشاء تذكير',
      });
    }

    const reminder = await Reminder.create({
      appointmentId,
      userId,
      type: customMinutes ? '1h' : reminderType, // fallback type for custom
      channel: reminderChannel,
      status: 'pending',
      scheduledAt: reminderScheduledAt,
    });

    res.status(201).json({ success: true, reminder });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'تذكير مماثل موجود بالفعل لهذا الموعد' });
    }
    logger.error('createReminder error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
