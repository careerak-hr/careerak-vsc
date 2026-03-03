const mongoose = require('mongoose');

const videoInterviewSchema = new mongoose.Schema({
  // معلومات أساسية
  interviewId: {
    type: String,
    required: true,
    unique: true,
    default: () => `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // ربط مع الموعد
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false
  },
  
  // معرف الغرفة
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // المضيف
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // المشاركون
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['host', 'participant'],
      default: 'participant'
    },
    joinedAt: Date,
    leftAt: Date,
    connectionQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  }],
  
  // حالة المقابلة
  status: {
    type: String,
    enum: ['scheduled', 'waiting', 'active', 'ended', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  
  // التوقيت
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  startedAt: Date,
  endedAt: Date,
  duration: {
    type: Number, // بالدقائق
    default: 0
  },
  
  // الإعدادات
  settings: {
    recordingEnabled: {
      type: Boolean,
      default: false
    },
    waitingRoomEnabled: {
      type: Boolean,
      default: true
    },
    screenShareEnabled: {
      type: Boolean,
      default: true
    },
    chatEnabled: {
      type: Boolean,
      default: true
    },
    maxParticipants: {
      type: Number,
      default: 10,
      min: 2,
      max: 50
    }
  },
  
  // التسجيل
  recordingUrl: String,
  recordingConsent: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    consented: {
      type: Boolean,
      default: false
    },
    consentedAt: Date
  }],
  
  // الملاحظات
  notes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // التقييم
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ratedAt: Date
  },
  
  // معلومات إضافية
  metadata: {
    platform: String, // web, android, ios
    browser: String,
    deviceType: String, // desktop, mobile, tablet
    networkType: String // wifi, 4g, 5g
  }
}, {
  timestamps: true
});

// Indexes للأداء
videoInterviewSchema.index({ hostId: 1, status: 1 });
videoInterviewSchema.index({ 'participants.userId': 1 });
videoInterviewSchema.index({ scheduledAt: 1, status: 1 });
videoInterviewSchema.index({ createdAt: -1 });

// Methods
videoInterviewSchema.methods.addParticipant = function(userId, role = 'participant') {
  const existing = this.participants.find(p => p.userId.toString() === userId.toString());
  if (!existing) {
    this.participants.push({
      userId,
      role,
      joinedAt: new Date()
    });
  }
  return this.save();
};

videoInterviewSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (participant) {
    participant.leftAt = new Date();
  }
  return this.save();
};

videoInterviewSchema.methods.startInterview = function() {
  this.status = 'active';
  this.startedAt = new Date();
  return this.save();
};

videoInterviewSchema.methods.endInterview = function() {
  this.status = 'ended';
  this.endedAt = new Date();
  if (this.startedAt) {
    this.duration = Math.round((this.endedAt - this.startedAt) / 60000); // دقائق
  }
  return this.save();
};

videoInterviewSchema.methods.addConsent = function(userId) {
  const existing = this.recordingConsent.find(c => c.userId.toString() === userId.toString());
  if (!existing) {
    this.recordingConsent.push({
      userId,
      consented: true,
      consentedAt: new Date()
    });
  } else {
    existing.consented = true;
    existing.consentedAt = new Date();
  }
  return this.save();
};

videoInterviewSchema.methods.hasAllConsents = function() {
  if (!this.settings.recordingEnabled) return true;
  
  const activeParticipants = this.participants.filter(p => !p.leftAt);
  if (activeParticipants.length === 0) return false;
  
  return activeParticipants.every(p => {
    const consent = this.recordingConsent.find(c => c.userId.toString() === p.userId.toString());
    return consent && consent.consented;
  });
};

const VideoInterview = mongoose.model('VideoInterview', videoInterviewSchema);

module.exports = VideoInterview;
