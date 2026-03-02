const mongoose = require('mongoose');

/**
 * نموذج المواعيد
 * يستخدم لجدولة مقابلات الفيديو والمواعيد الأخرى
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
const appointmentSchema = new mongoose.Schema({
  // نوع الموعد
  type: {
    type: String,
    enum: ['video_interview', 'phone_call', 'in_person', 'other'],
    default: 'video_interview',
    required: true,
  },

  // العنوان
  title: {
    type: String,
    required: true,
    trim: true,
  },

  // الوصف
  description: {
    type: String,
    default: '',
  },

  // المنظم (الشركة أو مسؤول التوظيف)
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // المشاركون
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'tentative'],
      default: 'pending',
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  }],

  // التاريخ والوقت
  scheduledAt: {
    type: Date,
    required: true,
    index: true,
  },

  // المدة المتوقعة (بالدقائق)
  duration: {
    type: Number,
    default: 60,
    min: 15,
    max: 480, // 8 ساعات كحد أقصى
  },

  // وقت الانتهاء المحسوب
  endsAt: {
    type: Date,
  },

  // الحالة
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled',
    index: true,
  },

  // رابط المقابلة (للمقابلات الفيديو)
  meetingLink: {
    type: String,
    default: null,
  },

  // معرف مقابلة الفيديو المرتبطة
  videoInterviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoInterview',
    default: null,
  },

  // الموقع (للمقابلات الشخصية)
  location: {
    type: String,
    default: null,
  },

  // ربط بطلب التوظيف
  jobApplicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobApplication',
    default: null,
  },

  // التذكيرات
  reminders: {
    // تذكير قبل 24 ساعة
    reminder24h: {
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: {
        type: Date,
        default: null,
      },
    },
    // تذكير قبل 15 دقيقة
    reminder15m: {
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: {
        type: Date,
        default: null,
      },
    },
  },

  // سبب الإلغاء أو إعادة الجدولة
  cancellationReason: {
    type: String,
    default: null,
  },

  // الموعد السابق (في حالة إعادة الجدولة)
  previousAppointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null,
  },

  // الموعد الجديد (في حالة إعادة الجدولة)
  rescheduledToId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null,
  },

  // ملاحظات
  notes: {
    type: String,
    default: '',
  },

}, {
  timestamps: true,
});

// Indexes للأداء
appointmentSchema.index({ organizerId: 1, status: 1 });
appointmentSchema.index({ 'participants.userId': 1, status: 1 });
appointmentSchema.index({ scheduledAt: 1, status: 1 });
appointmentSchema.index({ endsAt: 1 });

// حساب وقت الانتهاء قبل الحفظ
appointmentSchema.pre('save', function(next) {
  if (this.scheduledAt && this.duration) {
    this.endsAt = new Date(this.scheduledAt.getTime() + this.duration * 60000);
  }
  next();
});

// Virtual للحصول على المشاركين المقبولين
appointmentSchema.virtual('acceptedParticipants').get(function() {
  return this.participants.filter(p => p.status === 'accepted');
});

// Virtual للحصول على المشاركين المعلقين
appointmentSchema.virtual('pendingParticipants').get(function() {
  return this.participants.filter(p => p.status === 'pending');
});

// Method لإضافة مشارك
appointmentSchema.methods.addParticipant = function(userId, status = 'pending') {
  const exists = this.participants.some(p => p.userId.toString() === userId.toString());
  if (!exists) {
    this.participants.push({ userId, status });
  }
  return this.save();
};

// Method لتحديث حالة مشارك
appointmentSchema.methods.updateParticipantStatus = function(userId, status) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (participant) {
    participant.status = status;
    participant.respondedAt = new Date();
  }
  return this.save();
};

// Method لإلغاء الموعد
appointmentSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  return this.save();
};

// Method لتأكيد الموعد
appointmentSchema.methods.confirm = function() {
  this.status = 'confirmed';
  return this.save();
};

// Method لبدء الموعد
appointmentSchema.methods.start = function() {
  this.status = 'in_progress';
  return this.save();
};

// Method لإكمال الموعد
appointmentSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

// Method للتحقق من إمكانية الانضمام (قبل 5 دقائق من الموعد)
appointmentSchema.methods.canJoin = function() {
  const now = new Date();
  const scheduledTime = new Date(this.scheduledAt);
  const fiveMinutesBefore = new Date(scheduledTime.getTime() - 5 * 60000);
  
  return now >= fiveMinutesBefore && now <= this.endsAt;
};

// Method لتسجيل إرسال تذكير
appointmentSchema.methods.markReminderSent = function(reminderType) {
  if (reminderType === '24h') {
    this.reminders.reminder24h.sent = true;
    this.reminders.reminder24h.sentAt = new Date();
  } else if (reminderType === '15m') {
    this.reminders.reminder15m.sent = true;
    this.reminders.reminder15m.sentAt = new Date();
  }
  return this.save();
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
