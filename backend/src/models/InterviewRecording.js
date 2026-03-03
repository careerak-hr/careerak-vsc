const mongoose = require('mongoose');

const interviewRecordingSchema = new mongoose.Schema({
  // معرف فريد
  recordingId: {
    type: String,
    required: true,
    unique: true,
    default: () => `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // ربط مع المقابلة
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoInterview',
    required: true,
    index: true
  },
  
  // التوقيت
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: {
    type: Number, // بالثواني
    default: 0
  },
  
  // معلومات الملف
  fileSize: {
    type: Number, // بالبايتات
    default: 0
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  
  // الحالة
  status: {
    type: String,
    enum: ['recording', 'processing', 'ready', 'failed', 'deleted'],
    default: 'recording',
    index: true
  },
  
  // معلومات المعالجة
  processing: {
    startedAt: Date,
    completedAt: Date,
    error: String,
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // الحذف التلقائي
  expiresAt: {
    type: Date,
    required: true,
    index: true,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 يوم
  },
  autoDeleteScheduled: {
    type: Boolean,
    default: true
  },
  
  // الإحصائيات
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastAccessedAt: Date,
  
  // الوصول
  accessList: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessType: {
      type: String,
      enum: ['view', 'download'],
      default: 'view'
    },
    accessedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // معلومات التسجيل
  metadata: {
    codec: String,
    resolution: String, // e.g., "1280x720"
    bitrate: Number,
    frameRate: Number,
    audioCodec: String,
    format: {
      type: String,
      default: 'mp4'
    }
  },
  
  // الأمان
  encrypted: {
    type: Boolean,
    default: false
  },
  encryptionKey: String,
  
  // ملاحظات
  notes: String
}, {
  timestamps: true
});

// Indexes للأداء
interviewRecordingSchema.index({ interviewId: 1, status: 1 });
interviewRecordingSchema.index({ expiresAt: 1, status: 1 }); // للحذف التلقائي
interviewRecordingSchema.index({ createdAt: -1 });

// Methods
interviewRecordingSchema.methods.startProcessing = function() {
  this.status = 'processing';
  this.processing.startedAt = new Date();
  this.processing.progress = 0;
  return this.save();
};

interviewRecordingSchema.methods.updateProgress = function(progress) {
  this.processing.progress = Math.min(100, Math.max(0, progress));
  return this.save();
};

interviewRecordingSchema.methods.completeProcessing = function() {
  this.status = 'ready';
  this.processing.completedAt = new Date();
  this.processing.progress = 100;
  return this.save();
};

interviewRecordingSchema.methods.failProcessing = function(error) {
  this.status = 'failed';
  this.processing.error = error;
  return this.save();
};

interviewRecordingSchema.methods.stopRecording = function() {
  this.endTime = new Date();
  if (this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 1000); // ثواني
  }
  return this.save();
};

interviewRecordingSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

interviewRecordingSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

interviewRecordingSchema.methods.addAccess = function(userId, accessType = 'view') {
  this.accessList.push({
    userId,
    accessType,
    accessedAt: new Date()
  });
  
  if (accessType === 'view') {
    this.viewCount += 1;
  } else if (accessType === 'download') {
    this.downloadCount += 1;
  }
  
  this.lastAccessedAt = new Date();
  return this.save();
};

interviewRecordingSchema.methods.markAsDeleted = function() {
  this.status = 'deleted';
  return this.save();
};

interviewRecordingSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

interviewRecordingSchema.methods.extendExpiry = function(days = 30) {
  this.expiresAt = new Date(this.expiresAt.getTime() + days * 24 * 60 * 60 * 1000);
  return this.save();
};

// Static methods
interviewRecordingSchema.statics.findExpired = function() {
  return this.find({
    expiresAt: { $lt: new Date() },
    status: { $ne: 'deleted' },
    autoDeleteScheduled: true
  });
};

interviewRecordingSchema.statics.findByInterview = function(interviewId) {
  return this.find({ interviewId }).sort({ createdAt: -1 });
};

const InterviewRecording = mongoose.model('InterviewRecording', interviewRecordingSchema);

module.exports = InterviewRecording;
