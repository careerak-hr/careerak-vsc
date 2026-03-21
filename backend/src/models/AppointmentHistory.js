const mongoose = require('mongoose');

/**
 * نموذج سجل تاريخ المواعيد (Audit Log)
 * يحفظ جميع عمليات الإلغاء وإعادة الجدولة
 * 
 * Requirements: User Story 4 - حفظ سجل الإلغاءات والتعديلات
 * 
 * ملاحظة: هذا السجل للقراءة فقط - لا يُسمح بحذف السجلات (immutable audit log)
 */
const appointmentHistorySchema = new mongoose.Schema({
  // معرف الموعد المرتبط
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true,
  },

  // نوع العملية
  action: {
    type: String,
    enum: ['cancelled', 'rescheduled'],
    required: true,
    index: true,
  },

  // المستخدم الذي أجرى العملية
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // الوقت القديم (قبل التعديل)
  previousStartTime: {
    type: Date,
    required: true,
  },

  // وقت الانتهاء القديم
  previousEndTime: {
    type: Date,
    required: true,
  },

  // الوقت الجديد (عند إعادة الجدولة فقط)
  newStartTime: {
    type: Date,
    default: null,
  },

  // وقت الانتهاء الجديد (عند إعادة الجدولة فقط)
  newEndTime: {
    type: Date,
    default: null,
  },

  // سبب الإلغاء أو إعادة الجدولة (اختياري)
  reason: {
    type: String,
    default: '',
    trim: true,
  },

}, {
  // createdAt فقط - لا updatedAt لأن السجل غير قابل للتعديل
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes للأداء
appointmentHistorySchema.index({ appointmentId: 1, createdAt: -1 });
appointmentHistorySchema.index({ performedBy: 1, createdAt: -1 });

/**
 * منع حذف السجلات - السجل للقراءة فقط (immutable audit log)
 * نمنع deleteOne و deleteMany و findOneAndDelete
 */
appointmentHistorySchema.pre('deleteOne', function(next) {
  const error = new Error('لا يمكن حذف سجلات التاريخ - هذا السجل للمراجعة والتدقيق فقط | Appointment history records cannot be deleted - this is an immutable audit log');
  error.statusCode = 403;
  error.code = 'IMMUTABLE_AUDIT_LOG';
  next(error);
});

appointmentHistorySchema.pre('deleteMany', function(next) {
  const error = new Error('لا يمكن حذف سجلات التاريخ - هذا السجل للمراجعة والتدقيق فقط | Appointment history records cannot be deleted - this is an immutable audit log');
  error.statusCode = 403;
  error.code = 'IMMUTABLE_AUDIT_LOG';
  next(error);
});

appointmentHistorySchema.pre('findOneAndDelete', function(next) {
  const error = new Error('لا يمكن حذف سجلات التاريخ - هذا السجل للمراجعة والتدقيق فقط | Appointment history records cannot be deleted - this is an immutable audit log');
  error.statusCode = 403;
  error.code = 'IMMUTABLE_AUDIT_LOG';
  next(error);
});

const AppointmentHistory = mongoose.model('AppointmentHistory', appointmentHistorySchema);

module.exports = AppointmentHistory;
