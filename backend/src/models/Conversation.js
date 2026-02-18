const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  // المشاركون في المحادثة
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['HR', 'Employee'],
      required: true
    },
    // آخر مرة قرأ فيها المستخدم المحادثة
    lastRead: {
      type: Date,
      default: Date.now
    },
    // عدد الرسائل غير المقروءة
    unreadCount: {
      type: Number,
      default: 0
    }
  }],
  
  // الوظيفة المرتبطة بالمحادثة (اختياري)
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting'
  },
  
  // طلب التوظيف المرتبط (اختياري)
  relatedApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobApplication'
  },
  
  // آخر رسالة في المحادثة (للعرض السريع)
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    type: {
      type: String,
      enum: ['text', 'file', 'image'],
      default: 'text'
    }
  },
  
  // حالة المحادثة
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },
  
  // تم الأرشفة بواسطة
  archivedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index مركب للبحث السريع
conversationSchema.index({ 'participants.user': 1, status: 1, updatedAt: -1 });
conversationSchema.index({ relatedJob: 1 });
conversationSchema.index({ relatedApplication: 1 });

// Method للحصول على المشارك الآخر
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(p => p.user.toString() !== userId.toString());
};

// Method لتحديث عدد الرسائل غير المقروءة
conversationSchema.methods.incrementUnread = async function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.unreadCount += 1;
    await this.save();
  }
};

// Method لتصفير عدد الرسائل غير المقروءة
conversationSchema.methods.markAsRead = async function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.unreadCount = 0;
    participant.lastRead = new Date();
    await this.save();
  }
};

// Static method للبحث عن محادثة بين مستخدمين
conversationSchema.statics.findBetweenUsers = async function(user1Id, user2Id) {
  return await this.findOne({
    'participants.user': { $all: [user1Id, user2Id] },
    status: { $ne: 'blocked' }
  });
};

module.exports = mongoose.model('Conversation', conversationSchema);
