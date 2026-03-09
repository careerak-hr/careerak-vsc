const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema({
  // رقم فريد للشهادة (UUID)
  certificateId: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomUUID()
  },
  
  // المستخدم الحاصل على الشهادة
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // الدورة المرتبطة بالشهادة
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EducationalCourse',
    required: [true, 'Course is required']
  },
  
  // اسم الدورة (محفوظ للأرشفة)
  courseName: {
    type: String,
    required: true
  },
  
  // تاريخ الإصدار
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // تاريخ الانتهاء (اختياري)
  expiryDate: {
    type: Date,
    default: null
  },
  
  // QR Code data
  qrCode: {
    type: String,
    required: true
  },
  
  // رابط التحقق
  verificationUrl: {
    type: String,
    required: false // سيتم توليده تلقائياً في pre-save
  },
  
  // حالة الشهادة
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  
  // رابط ملف PDF
  pdfUrl: {
    type: String,
    default: null
  },
  
  // هل تمت المشاركة على LinkedIn
  linkedInShared: {
    type: Boolean,
    default: false
  },
  
  // تاريخ المشاركة على LinkedIn
  linkedInSharedAt: {
    type: Date,
    default: null
  },
  
  // قالب الشهادة المستخدم
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateTemplate',
    default: null
  },
  
  // معلومات الإلغاء (إذا تم إلغاء الشهادة)
  revocation: {
    revokedAt: Date,
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  },
  
  // معلومات إعادة الإصدار
  reissue: {
    isReissued: {
      type: Boolean,
      default: false
    },
    originalCertificateId: {
      type: String
    },
    reissuedAt: Date,
    reissuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  }
}, {
  timestamps: true
});

// ========== Indexes for Performance Optimization ==========

// Index for user's certificates
certificateSchema.index({ userId: 1, issueDate: -1 });

// Index for course certificates
certificateSchema.index({ courseId: 1, issueDate: -1 });

// Index for certificate verification
certificateSchema.index({ certificateId: 1 }, { unique: true });

// Index for status filtering
certificateSchema.index({ status: 1 });

// Index for expiry date (for cleanup jobs)
certificateSchema.index({ expiryDate: 1 });

// Compound index for user + course (one certificate per user per course)
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// ========== Instance Methods ==========

/**
 * Check if certificate is valid
 * @returns {Boolean} True if certificate is valid, false otherwise
 */
certificateSchema.methods.isValid = function() {
  // Check if revoked
  if (this.status === 'revoked') {
    return false;
  }
  
  // Check if expired
  if (this.expiryDate && new Date() > this.expiryDate) {
    return false;
  }
  
  return this.status === 'active';
};

/**
 * Revoke certificate
 * @param {String} userId - User ID who is revoking
 * @param {String} reason - Reason for revocation
 */
certificateSchema.methods.revoke = function(userId, reason) {
  this.status = 'revoked';
  this.revocation = {
    revokedAt: new Date(),
    revokedBy: userId,
    reason: reason || 'No reason provided'
  };
};

/**
 * Mark as shared on LinkedIn
 */
certificateSchema.methods.markAsShared = function() {
  this.linkedInShared = true;
  this.linkedInSharedAt = new Date();
};

/**
 * Get certificate details for display
 * @returns {Object} Certificate details
 */
certificateSchema.methods.getDetails = function() {
  return {
    certificateId: this.certificateId,
    courseName: this.courseName,
    issueDate: this.issueDate,
    expiryDate: this.expiryDate,
    status: this.status,
    verificationUrl: this.verificationUrl,
    pdfUrl: this.pdfUrl,
    isValid: this.isValid()
  };
};

// ========== Static Methods ==========

/**
 * Get user's certificates
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 * @returns {Array} Array of certificates
 */
certificateSchema.statics.getUserCertificates = function(userId, options = {}) {
  const query = { userId };
  
  // Filter by status if provided
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('courseId', 'title category level thumbnail')
    .sort({ issueDate: -1 })
    .exec();
};

/**
 * Get certificate by ID with full details
 * @param {String} certificateId - Certificate ID (UUID)
 * @returns {Object} Certificate with populated fields
 */
certificateSchema.statics.getByCertificateId = function(certificateId) {
  return this.findOne({ certificateId })
    .populate('userId', 'firstName lastName email profileImage')
    .populate('courseId', 'title category level instructor')
    .exec();
};

/**
 * Check if user already has certificate for course
 * @param {String} userId - User ID
 * @param {String} courseId - Course ID
 * @returns {Boolean} True if certificate exists, false otherwise
 */
certificateSchema.statics.hasCertificate = async function(userId, courseId) {
  const certificate = await this.findOne({ userId, courseId });
  return !!certificate;
};

/**
 * Get certificates for a course
 * @param {String} courseId - Course ID
 * @param {Object} options - Query options
 * @returns {Array} Array of certificates
 */
certificateSchema.statics.getCourseCertificates = function(courseId, options = {}) {
  const query = { courseId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email profileImage')
    .sort({ issueDate: -1 })
    .exec();
};

/**
 * Count certificates by status
 * @param {String} userId - User ID (optional)
 * @returns {Object} Count by status
 */
certificateSchema.statics.countByStatus = async function(userId) {
  const match = userId ? { userId: mongoose.Types.ObjectId(userId) } : {};
  
  const result = await this.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const counts = {
    active: 0,
    revoked: 0,
    expired: 0,
    total: 0
  };
  
  result.forEach(item => {
    counts[item._id] = item.count;
    counts.total += item.count;
  });
  
  return counts;
};

/**
 * Mark expired certificates
 * This should be run periodically (e.g., daily cron job)
 */
certificateSchema.statics.markExpired = async function() {
  const now = new Date();
  
  const result = await this.updateMany(
    {
      status: 'active',
      expiryDate: { $lte: now }
    },
    {
      $set: { status: 'expired' }
    }
  );
  
  return result.modifiedCount;
};

// ========== Virtuals ==========

/**
 * Virtual for certificate age in days
 */
certificateSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const ageMs = now - this.issueDate;
  return Math.floor(ageMs / (1000 * 60 * 60 * 24));
});

/**
 * Virtual for days until expiry
 */
certificateSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) {
    return null;
  }
  
  const now = new Date();
  const diffMs = this.expiryDate - now;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON
certificateSchema.set('toJSON', { virtuals: true });
certificateSchema.set('toObject', { virtuals: true });

// ========== Pre-save Middleware ==========

/**
 * Generate verification URL before saving
 */
certificateSchema.pre('save', function(next) {
  if (this.isNew && !this.verificationUrl) {
    // Generate verification URL
    const baseUrl = process.env.FRONTEND_URL || 'https://careerak.com';
    this.verificationUrl = `${baseUrl}/verify/${this.certificateId}`;
  }
  next();
});

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
