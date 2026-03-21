const mongoose = require('mongoose');

/**
 * نموذج تقييمات المواعيد
 * يحفظ تقييمات المستخدمين للمقابلات بعد اكتمالها
 *
 * Requirements: User Story 6 - نظام ملاحظات وتقييم
 */
const appointmentRatingSchema = new mongoose.Schema(
  {
    // معرف الموعد
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },

    // معرف المُقيِّم
    raterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // درجة التقييم (1-5)
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // تعليق التقييم (اختياري)
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// كل مستخدم يمكنه تقييم الموعد مرة واحدة فقط
appointmentRatingSchema.index({ appointmentId: 1, raterId: 1 }, { unique: true });

const AppointmentRating = mongoose.model('AppointmentRating', appointmentRatingSchema);

module.exports = AppointmentRating;
