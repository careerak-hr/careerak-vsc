const mongoose = require('mongoose');

/**
 * نموذج التذكيرات التلقائية للمواعيد
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
const reminderSchema = new mongoose.Schema({
  // الموعد المرتبط
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true,
  },

  // المستخدم المستهدف
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // نوع التذكير: 24 ساعة أو 1 ساعة
  type: {
    type: String,
    enum: ['24h', '1h'],
    required: true,
  },

  // قناة الإرسال
  channel: {
    type: String,
    enum: ['notification', 'email', 'sms'],
    required: true,
    default: 'notification',
  },

  // حالة التذكير
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
    index: true,
  },

  // وقت الإرسال المجدول
  scheduledAt: {
    type: Date,
    required: true,
    index: true,
  },

  // وقت الإرسال الفعلي
  sentAt: {
    type: Date,
    default: null,
  },

  // سبب الفشل (إن وجد)
  failureReason: {
    type: String,
    default: null,
  },

  // أوقات تذكير مخصصة (بالدقائق قبل الموعد) - يُضاف من إعدادات المستخدم
  customReminders: {
    type: [Number],
    default: [],
  },
}, {
  timestamps: true,
});

// Index مركب لجلب التذكيرات المستحقة بكفاءة
reminderSchema.index({ status: 1, scheduledAt: 1 });
reminderSchema.index({ appointmentId: 1, userId: 1, type: 1, channel: 1 }, { unique: true });

module.exports = mongoose.model('Reminder', reminderSchema);
