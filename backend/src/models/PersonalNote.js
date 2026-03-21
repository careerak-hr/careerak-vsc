const mongoose = require('mongoose');

/**
 * نموذج الملاحظات الشخصية للباحثين عن عمل
 * هذه الملاحظات خاصة تماماً بالباحث ولا يراها أحد غيره (لا الشركة ولا أي مستخدم آخر)
 *
 * Requirements: User Story 7 - نظام ملاحظات شخصية
 */
const personalNoteSchema = new mongoose.Schema(
  {
    // معرف الموعد
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },

    // معرف الباحث (المالك الوحيد للملاحظة)
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
      maxlength: 10000,
    },
  },
  {
    timestamps: true, // createdAt و updatedAt تلقائياً
  }
);

// index مركب لتسريع الاستعلامات
personalNoteSchema.index({ appointmentId: 1, userId: 1 });

const PersonalNote = mongoose.model('PersonalNote', personalNoteSchema);

module.exports = PersonalNote;
