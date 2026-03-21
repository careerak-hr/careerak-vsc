const mongoose = require('mongoose');

/**
 * نموذج الأوقات المتاحة
 * يدعم تحديد الأوقات المتاحة بشكل يومي أو أسبوعي
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

// نموذج الفترة الزمنية (slot)
const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // "09:00"
  endTime:   { type: String, required: true }, // "17:00"
}, { _id: false });

// نموذج يوم واحد في الجدول الأسبوعي
const weeklyScheduleSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0, // 0 = الأحد
    max: 6, // 6 = السبت
  },
  isAvailable: { type: Boolean, default: true },
  slots: [timeSlotSchema],
}, { _id: false });

// نموذج استثناء (إجازة أو وقت غير متاح)
const exceptionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  isAvailable: { type: Boolean, default: false }, // false = إجازة
  slots: [timeSlotSchema], // فترات بديلة إن وُجدت
  reason: { type: String, default: '' },
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  // صاحب الجدول (الشركة أو مسؤول التوظيف)
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // نوع الجدول: يومي أو أسبوعي
  scheduleType: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'weekly',
    required: true,
  },

  // مدة كل مقابلة بالدقائق
  slotDuration: {
    type: Number,
    enum: [15, 30, 45, 60, 90, 120],
    default: 60,
  },

  // عدد المقابلات المتزامنة
  maxConcurrent: {
    type: Number,
    default: 1,
    min: 1,
    max: 10,
  },

  // الجدول الأسبوعي (يُستخدم عند scheduleType = 'weekly')
  weeklySchedule: [weeklyScheduleSchema],

  // الجدول اليومي: تواريخ محددة بفترات مخصصة (scheduleType = 'daily')
  dailySchedule: [{
    date: { type: Date, required: true },
    slots: [timeSlotSchema],
    isAvailable: { type: Boolean, default: true },
  }],

  // الاستثناءات (إجازات، اجتماعات، إلخ)
  exceptions: [exceptionSchema],

  // تاريخ بداية وانتهاء صلاحية الجدول
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, default: null },

  isActive: { type: Boolean, default: true },

}, { timestamps: true });

availabilitySchema.index({ companyId: 1, isActive: 1 });
availabilitySchema.index({ companyId: 1, scheduleType: 1 });

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
