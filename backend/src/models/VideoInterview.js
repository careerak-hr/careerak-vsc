const mongoose = require('mongoose');

/**
 * نموذج مقابلة الفيديو
 * يحتوي على معلومات المقابلة، المشاركين، الإعدادات، والتسجيل
 * 
 * Requirements: 1.1, 2.1, 2.4, 4.1, 5.1, 7.1
 */
const videoInterviewSchema = new mongoose.Schema({
  // معرف فريد للغرفة
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  // ربط بموعد (إذا كانت مجدولة)
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null,
  },

  // المضيف (الشركة أو مسؤول التوظيف)
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // المشاركون في المقابلة
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['host', 'participant'],
      default: 'participant',
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    leftAt: {
      type: Date,
      default: null,
    },
  }],

  // حالة المقابلة
  status: {
    type: String,
    enum: ['scheduled', 'waiting', 'active', 'ended', 'cancelled', 'rescheduled'],
    default: 'scheduled',
    index: true,
  },

  // التوقيت
  scheduledAt: {
    type: Date,
    default: null,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  endedAt: {
    type: Date,
    default: null,
  },
  duration: {
    type: Number, // بالثواني
    default: 0,
  },

  // إعدادات المقابلة
  settings: {
    // تفعيل التسجيل
    recordingEnabled: {
      type: Boolean,
      default: false,
    },
    // تفعيل غرفة الانتظار
    waitingRoomEnabled: {
      type: Boolean,
      default: true,
    },
    // تفعيل مشاركة الشاشة
    screenShareEnabled: {
      type: Boolean,
      default: true,
    },
    // تفعيل الدردشة
    chatEnabled: {
      type: Boolean,
      default: true,
    },
    // الحد الأقصى للمشاركين
    maxParticipants: {
      type: Number,
      default: 2,
      min: 2,
      max: 10,
    },
  },

  // معلومات التسجيل
  recording: {
    // حالة التسجيل
    status: {
      type: String,
      enum: ['not_started', 'recording', 'stopped', 'processing', 'ready', 'failed'],
      default: 'not_started',
    },
    // وقت بدء التسجيل
    startedAt: {
      type: Date,
      default: null,
    },
    // وقت إيقاف التسجيل
    stoppedAt: {
      type: Date,
      default: null,
    },
    // مدة التسجيل (بالثواني)
    duration: {
      type: Number,
      default: 0,
    },
    // رابط الفيديو في Cloudinary
    videoUrl: {
      type: String,
      default: null,
    },
    // معرف Cloudinary العام
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
    // رابط الصورة المصغرة
    thumbnailUrl: {
      type: String,
      default: null,
    },
    // حجم الملف (بالبايت)
    fileSize: {
      type: Number,
      default: 0,
    },
    // تاريخ انتهاء الصلاحية (حذف تلقائي بعد 90 يوم)
    expiresAt: {
      type: Date,
      default: null,
    },
    // عدد مرات التحميل
    downloadCount: {
      type: Number,
      default: 0,
    },
  },

  // موافقة المشاركين على التسجيل
  recordingConsent: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    consented: {
      type: Boolean,
      required: true,
    },
    consentedAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // رسالة الترحيب في غرفة الانتظار
  welcomeMessage: {
    type: String,
    default: 'مرحباً بك! سيتم قبولك في المقابلة قريباً.',
  },

  // ملاحظات بعد المقابلة
  notes: {
    type: String,
    default: '',
  },

  // تقييم المرشح (للمضيف فقط)
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },

}, {
  timestamps: true,
});

// Indexes للأداء
videoInterviewSchema.index({ hostId: 1, status: 1 });
videoInterviewSchema.index({ 'participants.userId': 1 });
videoInterviewSchema.index({ scheduledAt: 1 });
videoInterviewSchema.index({ 'recording.expiresAt': 1 });

// Virtual للحصول على المشاركين النشطين
videoInterviewSchema.virtual('activeParticipants').get(function() {
  return this.participants.filter(p => p.joinedAt && !p.leftAt);
});

// Method لإضافة مشارك
videoInterviewSchema.methods.addParticipant = function(userId, role = 'participant') {
  const exists = this.participants.some(p => p.userId.toString() === userId.toString());
  if (!exists) {
    this.participants.push({ userId, role });
  }
  return this.save();
};

// Method لتسجيل انضمام مشارك
videoInterviewSchema.methods.recordJoin = function(userId) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (participant && !participant.joinedAt) {
    participant.joinedAt = new Date();
  }
  return this.save();
};

// Method لتسجيل مغادرة مشارك
videoInterviewSchema.methods.recordLeave = function(userId) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (participant && !participant.leftAt) {
    participant.leftAt = new Date();
  }
  return this.save();
};

// Method لبدء المقابلة
videoInterviewSchema.methods.start = function() {
  this.status = 'active';
  this.startedAt = new Date();
  return this.save();
};

// Method لإنهاء المقابلة
videoInterviewSchema.methods.end = function() {
  this.status = 'ended';
  this.endedAt = new Date();
  if (this.startedAt) {
    this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  return this.save();
};

// Method لبدء التسجيل
videoInterviewSchema.methods.startRecording = function() {
  this.recording.status = 'recording';
  this.recording.startedAt = new Date();
  return this.save();
};

// Method لإيقاف التسجيل
videoInterviewSchema.methods.stopRecording = function() {
  this.recording.status = 'stopped';
  this.recording.stoppedAt = new Date();
  if (this.recording.startedAt) {
    this.recording.duration = Math.floor((this.recording.stoppedAt - this.recording.startedAt) / 1000);
  }
  return this.save();
};

// Method لإضافة موافقة على التسجيل
videoInterviewSchema.methods.addRecordingConsent = function(userId, consented) {
  const exists = this.recordingConsent.find(c => c.userId.toString() === userId.toString());
  if (!exists) {
    this.recordingConsent.push({ userId, consented });
  } else {
    exists.consented = consented;
    exists.consentedAt = new Date();
  }
  return this.save();
};

// Method للتحقق من موافقة جميع المشاركين
videoInterviewSchema.methods.hasAllConsents = function() {
  const participantIds = this.participants.map(p => p.userId.toString());
  const consentedIds = this.recordingConsent
    .filter(c => c.consented)
    .map(c => c.userId.toString());
  
  return participantIds.every(id => consentedIds.includes(id));
};

const VideoInterview = mongoose.model('VideoInterview', videoInterviewSchema);

module.exports = VideoInterview;
