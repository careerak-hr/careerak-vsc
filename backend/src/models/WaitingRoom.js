const mongoose = require('mongoose');

const waitingRoomSchema = new mongoose.Schema({
  // معرف الغرفة
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // ربط مع المقابلة
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoInterview',
    required: true,
    index: true
  },
  
  // المشاركون في الانتظار
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['waiting', 'admitted', 'rejected', 'left'],
      default: 'waiting'
    },
    admittedAt: Date,
    admittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String,
    leftAt: Date,
    // معلومات الجهاز
    deviceInfo: {
      platform: String,
      browser: String,
      deviceType: String,
      hasCamera: {
        type: Boolean,
        default: false
      },
      hasMicrophone: {
        type: Boolean,
        default: false
      }
    }
  }],
  
  // رسالة الترحيب
  welcomeMessage: {
    type: String,
    default: 'مرحباً بك في غرفة الانتظار. سيتم قبولك قريباً.'
  },
  
  // الإعدادات
  settings: {
    autoAdmit: {
      type: Boolean,
      default: false
    },
    maxWaitingTime: {
      type: Number, // بالدقائق
      default: 30
    },
    allowDeviceTest: {
      type: Boolean,
      default: true
    },
    showWaitingCount: {
      type: Boolean,
      default: true
    }
  },
  
  // الحالة
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // الإحصائيات
  stats: {
    totalJoined: {
      type: Number,
      default: 0
    },
    totalAdmitted: {
      type: Number,
      default: 0
    },
    totalRejected: {
      type: Number,
      default: 0
    },
    averageWaitTime: {
      type: Number, // بالدقائق
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes للأداء
waitingRoomSchema.index({ interviewId: 1, isActive: 1 });
waitingRoomSchema.index({ 'participants.userId': 1 });
waitingRoomSchema.index({ 'participants.status': 1 });

// Methods
waitingRoomSchema.methods.addParticipant = function(userId, deviceInfo = {}) {
  // تحقق من عدم وجود المشارك مسبقاً
  const existing = this.participants.find(
    p => p.userId.toString() === userId.toString() && p.status === 'waiting'
  );
  
  if (existing) {
    return this.save();
  }
  
  this.participants.push({
    userId,
    joinedAt: new Date(),
    status: 'waiting',
    deviceInfo
  });
  
  this.stats.totalJoined += 1;
  
  return this.save();
};

waitingRoomSchema.methods.admitParticipant = function(userId, admittedBy) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString() && p.status === 'waiting'
  );
  
  if (!participant) {
    throw new Error('Participant not found in waiting room');
  }
  
  participant.status = 'admitted';
  participant.admittedAt = new Date();
  participant.admittedBy = admittedBy;
  
  // حساب وقت الانتظار
  const waitTime = Math.round((participant.admittedAt - participant.joinedAt) / 60000);
  
  // تحديث متوسط وقت الانتظار
  const totalAdmitted = this.stats.totalAdmitted;
  this.stats.averageWaitTime = 
    (this.stats.averageWaitTime * totalAdmitted + waitTime) / (totalAdmitted + 1);
  
  this.stats.totalAdmitted += 1;
  
  return this.save();
};

waitingRoomSchema.methods.rejectParticipant = function(userId, rejectedBy, reason = '') {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString() && p.status === 'waiting'
  );
  
  if (!participant) {
    throw new Error('Participant not found in waiting room');
  }
  
  participant.status = 'rejected';
  participant.rejectedAt = new Date();
  participant.rejectedBy = rejectedBy;
  participant.rejectionReason = reason;
  
  this.stats.totalRejected += 1;
  
  return this.save();
};

waitingRoomSchema.methods.participantLeft = function(userId) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString() && p.status === 'waiting'
  );
  
  if (participant) {
    participant.status = 'left';
    participant.leftAt = new Date();
  }
  
  return this.save();
};

waitingRoomSchema.methods.getWaitingParticipants = function() {
  return this.participants.filter(p => p.status === 'waiting');
};

waitingRoomSchema.methods.getWaitingCount = function() {
  return this.participants.filter(p => p.status === 'waiting').length;
};

waitingRoomSchema.methods.clearWaitingRoom = function() {
  this.participants.forEach(p => {
    if (p.status === 'waiting') {
      p.status = 'left';
      p.leftAt = new Date();
    }
  });
  
  return this.save();
};

waitingRoomSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.clearWaitingRoom();
};

// Static methods
waitingRoomSchema.statics.findByInterview = function(interviewId) {
  return this.findOne({ interviewId, isActive: true });
};

waitingRoomSchema.statics.findActiveRooms = function() {
  return this.find({ isActive: true });
};

const WaitingRoom = mongoose.model('WaitingRoom', waitingRoomSchema);

module.exports = WaitingRoom;
