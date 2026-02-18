const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // نوع الرسالة
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'system'],
    default: 'text',
    required: true
  },
  
  // محتوى الرسالة
  content: {
    type: String,
    required: function() {
      return this.type === 'text' || this.type === 'system';
    }
  },
  
  // معلومات الملف (للملفات والصور)
  file: {
    url: String,
    name: String,
    size: Number,
    mimeType: String,
    cloudinaryId: String
  },
  
  // حالة الرسالة
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // تم القراءة بواسطة
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // الرد على رسالة (اختياري)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // تم الحذف بواسطة
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // تم التعديل
  edited: {
    type: Boolean,
    default: false
  },
  
  editedAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index مركب للاستعلامات السريعة
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Method لتحديد الرسالة كمقروءة
messageSchema.methods.markAsRead = async function(userId) {
  if (!this.readBy.some(r => r.user.toString() === userId.toString())) {
    this.readBy.push({ user: userId, readAt: new Date() });
    this.status = 'read';
    await this.save();
  }
};

// Method للتحقق من إمكانية الحذف
messageSchema.methods.canDelete = function(userId) {
  return this.sender.toString() === userId.toString();
};

// Method للتحقق من إمكانية التعديل
messageSchema.methods.canEdit = function(userId) {
  return this.sender.toString() === userId.toString() && this.type === 'text';
};

module.exports = mongoose.model('Message', messageSchema);
