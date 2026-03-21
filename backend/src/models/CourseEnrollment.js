const mongoose = require('mongoose');

const courseEnrollmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EducationalCourse',
    required: [true, 'Course is required']
  },
  
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'expired'],
    default: 'active'
  },
  
  progress: {
    completedLessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseLesson'
    }],
    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseLesson'
    },
    percentageComplete: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastAccessedAt: {
      type: Date
    }
  },
  
  completedAt: {
    type: Date
  },
  
  certificateIssued: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: {
      type: Date
    },
    certificateUrl: {
      type: String
    },
    certificateId: {
      type: String
    }
  },
  
  payment: {
    amount: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    },
    transactionId: {
      type: String
    },
    paidAt: {
      type: Date
    }
  },
  
  // Referral tracking
  referral: {
    token: {
      type: String
    },
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    referredAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
// Unique compound index: one enrollment per student per course
courseEnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Index for querying student's enrollments by status
courseEnrollmentSchema.index({ student: 1, status: 1 });

// Index for querying course enrollments by status
courseEnrollmentSchema.index({ course: 1, status: 1 });

// Index for sorting by recent activity
courseEnrollmentSchema.index({ 'progress.lastAccessedAt': -1 });

/**
 * Calculate progress percentage based on completed lessons
 * @param {Number} totalLessons - Total number of lessons in the course
 * @returns {Number} Progress percentage (0-100)
 */
courseEnrollmentSchema.methods.calculateProgress = function(totalLessons) {
  if (!totalLessons || totalLessons === 0) {
    return 0;
  }
  
  const completedCount = this.progress.completedLessons.length;
  const percentage = Math.round((completedCount / totalLessons) * 100);
  
  // Ensure percentage is within valid range
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Check if student can submit a review for this course
 * Requirements: Must have completed at least 50% of the course
 * @returns {Boolean} True if student can review, false otherwise
 */
courseEnrollmentSchema.methods.canReview = function() {
  return this.progress.percentageComplete >= 50;
};

/**
 * Pre-save middleware to update percentageComplete
 */
courseEnrollmentSchema.pre('save', async function(next) {
  // Only recalculate if completedLessons changed
  if (this.isModified('progress.completedLessons')) {
    try {
      // Fetch the course to get total lessons
      const Course = mongoose.model('EducationalCourse');
      const course = await Course.findById(this.course).select('totalLessons settings');
      
      if (course && course.totalLessons) {
        const oldPercentage = this.progress.percentageComplete;
        this.progress.percentageComplete = this.calculateProgress(course.totalLessons);
        
        // Auto-complete if 100%
        if (this.progress.percentageComplete === 100 && this.status === 'active') {
          this.status = 'completed';
          this.completedAt = new Date();
          
          // Mark that certificate should be issued
          // The actual issuance will happen in post-save middleware
          this._shouldIssueCertificate = true;
          this._courseSettings = course.settings;
        }
      }
    } catch (error) {
      // Log error but don't block save
      console.error('Error calculating progress:', error);
    }
  }
  
  next();
});

/**
 * Post-save middleware to issue certificate automatically and award referral points
 * This runs after the enrollment is saved to avoid blocking the save operation
 */
courseEnrollmentSchema.post('save', async function(doc) {
  // Check if certificate should be issued
  if (doc._shouldIssueCertificate && !doc.certificateIssued.issued) {
    try {
      // Check if certificates are enabled for this course
      const certificateEnabled = doc._courseSettings && doc._courseSettings.certificateEnabled !== false;
      
      if (certificateEnabled) {
        // Import certificateService here to avoid circular dependency
        const certificateService = require('../services/certificateService');
        
        // Issue certificate and update enrollment record
        setImmediate(async () => {
          try {
            const result = await certificateService.issueCertificate(doc.student, doc.course);
            
            if (result && result.success && result.certificate) {
              const baseUrl = process.env.FRONTEND_URL || 'https://careerak.com';
              const certificateUrl = `${baseUrl}/certificates/${result.certificate.certificateId}`;
              
              // Update the enrollment to mark certificate as issued
              const CourseEnrollment = mongoose.model('CourseEnrollment');
              await CourseEnrollment.findByIdAndUpdate(doc._id, {
                'certificateIssued.issued': true,
                'certificateIssued.issuedAt': new Date(),
                'certificateIssued.certificateUrl': certificateUrl,
                'certificateIssued.certificateId': result.certificate.certificateId
              });
              
              console.log(`✅ Certificate issued automatically for user ${doc.student} on course ${doc.course}`);
            }
          } catch (error) {
            // If certificate already exists, just update the enrollment
            if (error.message && error.message.includes('Certificate already exists')) {
              console.log(`ℹ️ Certificate already exists for user ${doc.student} on course ${doc.course}`);
            } else {
              console.error('❌ Error issuing certificate automatically:', error.message);
            }
          }
        });
      }
    } catch (error) {
      // Log error but don't throw (post-save should not fail)
      console.error('Error in post-save certificate issuance:', error);
    }
  }

  // منح نقاط الإحالة عند إكمال الدورة
  if (doc._shouldIssueCertificate) {
    setImmediate(async () => {
      try {
        const rewardsService = require('../services/rewardsService');

        // مكافأة أول دورة
        await rewardsService.awardFirstCourseReward(doc.student);

        // مكافأة 5 دورات - التحقق من عدد الدورات المكتملة
        const CourseEnrollment = mongoose.model('CourseEnrollment');
        const completedCount = await CourseEnrollment.countDocuments({
          student: doc.student,
          status: 'completed'
        });
        if (completedCount >= 5) {
          await rewardsService.awardFiveCoursesReward(doc.student);
        }
      } catch (err) {
        console.error('❌ خطأ في منح نقاط إكمال الدورة:', err.message);
      }
    });
  }
});

/**
 * Static method to get enrollment with populated course and student
 * @param {String} enrollmentId - Enrollment ID
 * @returns {Object} Populated enrollment
 */
courseEnrollmentSchema.statics.findByIdWithDetails = function(enrollmentId) {
  return this.findById(enrollmentId)
    .populate('course', 'title totalLessons totalDuration level category thumbnail')
    .populate('student', 'fullName email profilePicture')
    .populate('progress.currentLesson', 'title order duration');
};

/**
 * Static method to get user's active enrollments sorted by recent activity
 * @param {String} studentId - Student user ID
 * @returns {Array} Array of enrollments
 */
courseEnrollmentSchema.statics.getActiveEnrollments = function(studentId) {
  return this.find({ 
    student: studentId, 
    status: 'active' 
  })
    .populate('course', 'title totalLessons totalDuration level category thumbnail instructor')
    .sort({ 'progress.lastAccessedAt': -1 })
    .exec();
};

/**
 * Static method to check if student is already enrolled
 * @param {String} studentId - Student user ID
 * @param {String} courseId - Course ID
 * @returns {Boolean} True if enrolled, false otherwise
 */
courseEnrollmentSchema.statics.isEnrolled = async function(studentId, courseId) {
  const enrollment = await this.findOne({ 
    student: studentId, 
    course: courseId 
  });
  return !!enrollment;
};

/**
 * Virtual for enrollment duration
 */
courseEnrollmentSchema.virtual('enrollmentDuration').get(function() {
  const endDate = this.completedAt || new Date();
  const durationMs = endDate - this.enrolledAt;
  return Math.floor(durationMs / (1000 * 60 * 60 * 24)); // days
});

// Ensure virtuals are included in JSON
courseEnrollmentSchema.set('toJSON', { virtuals: true });
courseEnrollmentSchema.set('toObject', { virtuals: true });

const CourseEnrollment = mongoose.model('CourseEnrollment', courseEnrollmentSchema);

module.exports = CourseEnrollment;
