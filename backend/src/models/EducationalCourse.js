const mongoose = require('mongoose');

const educationalCourseSchema = new mongoose.Schema({
  // ========== Existing Fields ==========
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: String,
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    required: true
  },
  duration: {
    value: Number,
    unit: { type: String, enum: ['hours', 'days', 'weeks'] }
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  maxParticipants: Number,
  enrolledParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  },
  startDate: Date,
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // ========== Enhancement Fields ==========
  
  // Pricing information
  price: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    isFree: {
      type: Boolean,
      default: true
    }
  },
  
  // Main topics covered in the course
  topics: [{
    type: String,
    trim: true
  }],
  
  // Required knowledge/skills before taking the course
  prerequisites: [{
    type: String,
    trim: true
  }],
  
  // What students will learn/achieve
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  
  // Total number of lessons in the course
  totalLessons: {
    type: Number,
    default: 0
  },
  
  // Total duration in hours
  totalDuration: {
    type: Number,
    default: 0
  },
  
  // Course thumbnail image URL
  thumbnail: {
    type: String,
    trim: true
  },
  
  // Preview video URL
  previewVideo: {
    type: String,
    trim: true
  },
  
  // Course syllabus/curriculum
  syllabus: [{
    section: {
      type: String,
      required: true,
      trim: true
    },
    lessons: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      duration: {
        type: Number, // in minutes
        default: 0
      },
      isFree: {
        type: Boolean,
        default: false
      }
    }]
  }],
  
  // Instructor detailed information
  instructorInfo: {
    bio: {
      type: String,
      trim: true
    },
    credentials: [{
      type: String,
      trim: true
    }],
    socialLinks: {
      linkedin: {
        type: String,
        trim: true
      },
      twitter: {
        type: String,
        trim: true
      },
      website: {
        type: String,
        trim: true
      }
    }
  },
  
  // Course statistics
  stats: {
    totalEnrollments: {
      type: Number,
      default: 0
    },
    activeEnrollments: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number, // percentage
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    previewViews: {
      type: Number,
      default: 0
    }
  },
  
  // Course badges
  badges: [{
    type: {
      type: String,
      enum: ['most_popular', 'new', 'recommended', 'top_rated']
    },
    awardedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Course settings
  settings: {
    allowReviews: {
      type: Boolean,
      default: true
    },
    certificateEnabled: {
      type: Boolean,
      default: true
    },
    autoEnroll: {
      type: Boolean,
      default: false
    }
  },
  
  // Publication date
  publishedAt: {
    type: Date
  },
  
  // Referral tracking for course sharing
  referrals: [{
    token: {
      type: String,
      required: true,
      unique: true
    },
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    enrollments: {
      type: Number,
      default: 0
    },
    lastAccessedAt: {
      type: Date
    }
  }]
});

// ========== Indexes for Performance Optimization ==========

// Existing indexes
educationalCourseSchema.index({ createdAt: -1 }); // For time-based queries
educationalCourseSchema.index({ status: 1, createdAt: -1 }); // For filtering by status
educationalCourseSchema.index({ instructor: 1 }); // For instructor's courses
educationalCourseSchema.index({ category: 1 }); // For filtering by category
educationalCourseSchema.index({ level: 1 }); // For filtering by level
educationalCourseSchema.index({ startDate: 1 }); // For upcoming courses

// New indexes for enhancements
educationalCourseSchema.index({ level: 1, category: 1 }); // For combined level+category filtering
educationalCourseSchema.index({ 'price.isFree': 1 }); // For free/paid filtering
educationalCourseSchema.index({ 'stats.averageRating': -1 }); // For sorting by rating
educationalCourseSchema.index({ 'stats.totalEnrollments': -1 }); // For sorting by popularity
educationalCourseSchema.index({ publishedAt: -1 }); // For sorting by newest
educationalCourseSchema.index({ status: 1, publishedAt: -1 }); // For published courses by date

// Text index for search functionality
educationalCourseSchema.index({
  title: 'text',
  description: 'text',
  topics: 'text'
}, {
  weights: {
    title: 10,
    topics: 5,
    description: 1
  },
  name: 'course_search_index'
});

// Index for referral token lookup
educationalCourseSchema.index({ 'referrals.token': 1 });
educationalCourseSchema.index({ 'referrals.expiresAt': 1 });

module.exports = mongoose.model('EducationalCourse', educationalCourseSchema);
