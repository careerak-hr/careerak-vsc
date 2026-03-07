const mongoose = require('mongoose');

const jobShareSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['whatsapp', 'linkedin', 'twitter', 'facebook', 'copy', 'native'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  // معلومات إضافية للتحليلات
  metadata: {
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      default: 'desktop'
    },
    browser: String,
    os: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Indexes للأداء
jobShareSchema.index({ jobId: 1, timestamp: -1 });
jobShareSchema.index({ userId: 1, timestamp: -1 });
jobShareSchema.index({ platform: 1, timestamp: -1 });
jobShareSchema.index({ timestamp: -1 });

// Compound index للتحليلات
jobShareSchema.index({ jobId: 1, platform: 1 });
jobShareSchema.index({ userId: 1, jobId: 1 });

// منع spam - حد أقصى 10 مشاركات لنفس المستخدم لنفس الوظيفة في اليوم
jobShareSchema.index(
  { userId: 1, jobId: 1, timestamp: 1 },
  { 
    unique: false,
    partialFilterExpression: { 
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    }
  }
);

// Static method: حساب عدد المشاركات لوظيفة
jobShareSchema.statics.getShareCount = async function(jobId) {
  return await this.countDocuments({ jobId });
};

// Static method: حساب عدد المشاركات حسب المنصة
jobShareSchema.statics.getSharesByPlatform = async function(jobId) {
  return await this.aggregate([
    { $match: { jobId: new mongoose.Types.ObjectId(jobId) } },
    { 
      $group: {
        _id: '$platform',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method: حساب المشاركات في فترة زمنية
jobShareSchema.statics.getSharesInPeriod = async function(jobId, startDate, endDate) {
  return await this.countDocuments({
    jobId,
    timestamp: { $gte: startDate, $lte: endDate }
  });
};

// Static method: أكثر الوظائف مشاركة
jobShareSchema.statics.getMostSharedJobs = async function(limit = 10, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return await this.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: '$jobId',
        shareCount: { $sum: 1 },
        platforms: { $addToSet: '$platform' },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        jobId: '$_id',
        shareCount: 1,
        platformCount: { $size: '$platforms' },
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { shareCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'jobpostings',
        localField: 'jobId',
        foreignField: '_id',
        as: 'job'
      }
    },
    { $unwind: '$job' }
  ]);
};

// Static method: إحصائيات المشاركة لمستخدم
jobShareSchema.statics.getUserShareStats = async function(userId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return await this.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalShares: { $sum: 1 },
        platforms: { $addToSet: '$platform' },
        jobs: { $addToSet: '$jobId' }
      }
    },
    {
      $project: {
        _id: 0,
        totalShares: 1,
        platformCount: { $size: '$platforms' },
        jobCount: { $size: '$jobs' }
      }
    }
  ]);
};

// Instance method: التحقق من spam
jobShareSchema.methods.isSpam = async function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await this.constructor.countDocuments({
    userId: this.userId,
    jobId: this.jobId,
    timestamp: { $gte: oneDayAgo }
  });
  
  return count >= 10; // حد أقصى 10 مشاركات في اليوم
};

module.exports = mongoose.model('JobShare', jobShareSchema);
