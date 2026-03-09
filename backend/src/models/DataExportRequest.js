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
    required: true
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
  fileUrl: {
    type: String
  },
  fileSize: {
    type: Number // in bytes
  },
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
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    index: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient queries
dataExportRequestSchema.index({ userId: 1, requestedAt: -1 });
dataExportRequestSchema.index({ status: 1, expiresAt: 1 });

// TTL index - automatically delete expired exports
dataExportRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Update timestamp on save
dataExportRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('DataExportRequest', dataExportRequestSchema);
