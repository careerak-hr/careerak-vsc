const mongoose = require('mongoose');

const waitingRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoInterview',
    required: true,
    index: true
  },
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
      enum: ['waiting', 'admitted', 'rejected'],
      default: 'waiting'
    },
    admittedAt: Date,
    rejectedAt: Date,
    admittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  welcomeMessage: {
    type: String,
    default: 'مرحباً بك في غرفة الانتظار. سيتم قبولك قريباً.'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes للأداء
waitingRoomSchema.index({ roomId: 1, 'participants.userId': 1 });
waitingRoomSchema.index({ interviewId: 1 });
waitingRoomSchema.index({ 'participants.status': 1 });

// Methods
waitingRoomSchema.methods.getWaitingParticipants = function() {
  return this.participants.filter(p => p.status === 'waiting');
};

waitingRoomSchema.methods.getAdmittedParticipants = function() {
  return this.participants.filter(p => p.status === 'admitted');
};

waitingRoomSchema.methods.getRejectedParticipants = function() {
  return this.participants.filter(p => p.status === 'rejected');
};

waitingRoomSchema.methods.isParticipantWaiting = function(userId) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );
  return participant && participant.status === 'waiting';
};

const WaitingRoom = mongoose.model('WaitingRoom', waitingRoomSchema);

module.exports = WaitingRoom;
