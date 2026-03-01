const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const interviewRecordingSchema = new mongoose.Schema({
  recordingId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    required: true
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoInterview',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // بالثواني
    default: 0
  },
  fileSize: {
    type: Number, // بالبايتات
    default: 0
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['recording', 'processing', 'ready', 'deleted'],
    default: 'recording'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true // فهرس للبحث السريع عن التسجيلات المنتهية
  },
  retentionDays: {
    type: Number,
    default: 90, // قابل للتخصيص
    min: 1,
    max: 365
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletionReason: {
    type: String,
    enum: ['auto_expired', 'manual', 'user_request', 'admin_action'],
    default: 'auto_expired'
  }
}, {
  timestamps: true
});

// Index مركب للبحث عن التسجيلات المنتهية
interviewRecordingSchema.index({ status: 1, expiresAt: 1 });

// دالة لحساب تاريخ الانتهاء
interviewRecordingSchema.methods.calculateExpiryDate = function() {
  const retentionMs = this.retentionDays * 24 * 60 * 60 * 1000;
  return new Date(this.createdAt.getTime() + retentionMs);
};

// دالة للتحقق من انتهاء الصلاحية
interviewRecordingSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Middleware قبل الحفظ لحساب expiresAt تلقائياً
interviewRecordingSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = this.calculateExpiryDate();
  }
  next();
});

// Static method للحصول على التسجيلات المنتهية
interviewRecordingSchema.statics.findExpired = function() {
  return this.find({
    status: { $ne: 'deleted' },
    expiresAt: { $lt: new Date() }
  });
};

// Static method للحصول على التسجيلات التي ستنتهي قريباً
interviewRecordingSchema.statics.findExpiringSoon = function(daysAhead = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return this.find({
    status: { $ne: 'deleted' },
    expiresAt: {
      $gte: new Date(),
      $lte: futureDate
    }
  });
};

const InterviewRecording = mongoose.model('InterviewRecording', interviewRecordingSchema);

module.exports = InterviewRecording;
