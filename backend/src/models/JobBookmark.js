const mongoose = require('mongoose');

const jobBookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true,
    index: true
  },
  bookmarkedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  notifyOnChange: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index لضمان bookmark واحد فقط لكل مستخدم ووظيفة
jobBookmarkSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Index للبحث السريع
jobBookmarkSchema.index({ userId: 1, bookmarkedAt: -1 });
jobBookmarkSchema.index({ jobId: 1 });

// تحديث updatedAt تلقائياً
jobBookmarkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('JobBookmark', jobBookmarkSchema);
