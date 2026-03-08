const mongoose = require('mongoose');

const dataExportRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Request Details
  dataTypes: [{
    type: String,
    enum: ['profile', 'activity', 'messages', 'applications', 'courses'],
    required: true
  }],
  format: {
    type: String,
    enum: ['json', 'csv', 'pdf'],
    required: true,
    default: 'json'
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Result
  fileUrl: String,
  fileSize: Number, // in bytes
  downloadToken: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Timestamps
  requestedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedAt: Date,
  expiresAt: Date // 7 days after completion
}, {
  timestamps: true
});

// Compound Indexes
dataExportRequestSchema.index({ userId: 1, requestedAt: -1 });

// TTL Index - automatically delete expired exports
dataExportRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
dataExportRequestSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  this.progress = 0;
  return this.save();
};

dataExportRequestSchema.methods.updateProgress = function(progress) {
  this.progress = Math.min(100, Math.max(0, progress));
  return this.save();
};

dataExportRequestSchema.methods.markAsCompleted = function(fileUrl, fileSize) {
  this.status = 'completed';
  this.progress = 100;
  this.fileUrl = fileUrl;
  this.fileSize = fileSize;
  this.completedAt = new Date();
  // Set expiration to 7 days from now
  this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return this.save();
};

dataExportRequestSchema.methods.markAsFailed = function() {
  this.status = 'failed';
  return this.save();
};

dataExportRequestSchema.methods.generateDownloadToken = function() {
  const crypto = require('crypto');
  this.downloadToken = crypto.randomBytes(32).toString('hex');
  return this.save();
};

dataExportRequestSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  return this.save();
};

dataExportRequestSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Statics
dataExportRequestSchema.statics.findByToken = function(token) {
  return this.findOne({
    downloadToken: token,
    status: 'completed',
    expiresAt: { $gt: new Date() }
  });
};

dataExportRequestSchema.statics.getUserRequests = function(userId) {
  return this.find({ userId })
    .sort({ requestedAt: -1 })
    .limit(10);
};

const DataExportRequest = mongoose.model('DataExportRequest', dataExportRequestSchema);

module.exports = DataExportRequest;
