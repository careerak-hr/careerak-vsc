const mongoose = require('mongoose');

/**
 * نموذج ملاحظات المواعيد
 * يحفظ ملاحظات المستخدمين على المواعيد (قبل/بعد المقابلة)
 *
 * Requirements: User Story 6 - نظام ملاحظات وتقييم
 */
const appointmentNoteSchema = new mongoose.Schema(
  {
    // معرف الموعد
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },

    // معرف المستخدم الذي أضاف الملاحظة
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // نص الملاحظة
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // نوع الملاحظة
    noteType: {
      type: String,
      enum: ['pre_interview', 'post_interview'],
      required: true,
      default: 'post_interview',
    },
  },
  {
    timestamps: true,
  }
);

appointmentNoteSchema.index({ appointmentId: 1, userId: 1 });

const AppointmentNote = mongoose.model('AppointmentNote', appointmentNoteSchema);

module.exports = AppointmentNote;
