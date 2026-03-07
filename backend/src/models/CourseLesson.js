const mongoose = require('mongoose');

const courseLessonSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EducationalCourse',
    required: [true, 'Course is required']
  },
  
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  order: {
    type: Number,
    required: [true, 'Lesson order is required'],
    min: [1, 'Lesson order must be at least 1']
  },
  
  section: {
    type: String,
    trim: true
  },
  
  content: {
    type: String,
    enum: ['video', 'text', 'quiz', 'assignment', 'resource'],
    required: [true, 'Content type is required']
  },
  
  videoUrl: {
    type: String,
    trim: true
  },
  
  textContent: {
    type: String
  },
  
  resources: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'link', 'zip', 'other'],
      default: 'other'
    }
  }],
  
  duration: {
    type: Number, // in minutes
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  
  isFree: {
    type: Boolean,
    default: false
  },
  
  quiz: {
    questions: [{
      question: {
        type: String,
        required: true,
        trim: true
      },
      options: [{
        type: String,
        required: true,
        trim: true
      }],
      correctAnswer: {
        type: Number, // index of correct option
        required: true,
        min: 0
      },
      explanation: {
        type: String,
        trim: true
      }
    }],
    passingScore: {
      type: Number, // percentage
      default: 70,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true
});

// ========== Indexes for Performance Optimization ==========

// Index for querying lessons by course and order
courseLessonSchema.index({ course: 1, order: 1 });

// Index for querying free preview lessons
courseLessonSchema.index({ course: 1, isFree: 1 });

// Index for querying lessons by section
courseLessonSchema.index({ course: 1, section: 1, order: 1 });

// ========== Validation ==========

/**
 * Pre-save middleware to validate lesson order uniqueness within course
 */
courseLessonSchema.pre('save', async function(next) {
  // Only check if order or course changed
  if (this.isModified('order') || this.isModified('course')) {
    try {
      // Check if another lesson with same course and order exists
      const existingLesson = await this.constructor.findOne({
        course: this.course,
        order: this.order,
        _id: { $ne: this._id } // Exclude current document
      });
      
      if (existingLesson) {
        const error = new Error(`A lesson with order ${this.order} already exists for this course`);
        error.name = 'ValidationError';
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

/**
 * Validate that videoUrl is provided for video content type
 */
courseLessonSchema.pre('save', function(next) {
  if (this.content === 'video' && !this.videoUrl) {
    const error = new Error('Video URL is required for video content type');
    error.name = 'ValidationError';
    return next(error);
  }
  
  next();
});

/**
 * Validate that textContent is provided for text content type
 */
courseLessonSchema.pre('save', function(next) {
  if (this.content === 'text' && !this.textContent) {
    const error = new Error('Text content is required for text content type');
    error.name = 'ValidationError';
    return next(error);
  }
  
  next();
});

/**
 * Validate that quiz has at least one question for quiz content type
 */
courseLessonSchema.pre('save', function(next) {
  if (this.content === 'quiz' && (!this.quiz || !this.quiz.questions || this.quiz.questions.length === 0)) {
    const error = new Error('At least one quiz question is required for quiz content type');
    error.name = 'ValidationError';
    return next(error);
  }
  
  next();
});

/**
 * Validate that each quiz question has at least 2 options
 */
courseLessonSchema.pre('save', function(next) {
  if (this.content === 'quiz' && this.quiz && this.quiz.questions) {
    for (const question of this.quiz.questions) {
      if (!question.options || question.options.length < 2) {
        const error = new Error('Each quiz question must have at least 2 options');
        error.name = 'ValidationError';
        return next(error);
      }
      
      // Validate correctAnswer is within options range
      if (question.correctAnswer >= question.options.length) {
        const error = new Error(`Correct answer index (${question.correctAnswer}) is out of range for question with ${question.options.length} options`);
        error.name = 'ValidationError';
        return next(error);
      }
    }
  }
  
  next();
});

// ========== Instance Methods ==========

/**
 * Check if this lesson is a free preview
 * @returns {Boolean} True if lesson is free, false otherwise
 */
courseLessonSchema.methods.isPreview = function() {
  return this.isFree === true;
};

/**
 * Get lesson content based on type
 * @returns {Object} Content object with type-specific data
 */
courseLessonSchema.methods.getContent = function() {
  const content = {
    type: this.content,
    title: this.title,
    description: this.description,
    duration: this.duration
  };
  
  switch (this.content) {
    case 'video':
      content.videoUrl = this.videoUrl;
      break;
    case 'text':
      content.textContent = this.textContent;
      break;
    case 'quiz':
      content.quiz = this.quiz;
      break;
    case 'resource':
      content.resources = this.resources;
      break;
  }
  
  return content;
};

/**
 * Calculate quiz score
 * @param {Array} userAnswers - Array of user's answer indices
 * @returns {Object} Score object with percentage and pass status
 */
courseLessonSchema.methods.calculateQuizScore = function(userAnswers) {
  if (this.content !== 'quiz' || !this.quiz || !this.quiz.questions) {
    throw new Error('This lesson does not have a quiz');
  }
  
  if (!Array.isArray(userAnswers) || userAnswers.length !== this.quiz.questions.length) {
    throw new Error('Invalid number of answers provided');
  }
  
  let correctCount = 0;
  const totalQuestions = this.quiz.questions.length;
  
  this.quiz.questions.forEach((question, index) => {
    if (userAnswers[index] === question.correctAnswer) {
      correctCount++;
    }
  });
  
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentage >= this.quiz.passingScore;
  
  return {
    correctCount,
    totalQuestions,
    percentage,
    passed,
    passingScore: this.quiz.passingScore
  };
};

// ========== Static Methods ==========

/**
 * Get all lessons for a course, ordered by order field
 * @param {String} courseId - Course ID
 * @returns {Array} Array of lessons
 */
courseLessonSchema.statics.getLessonsByCourse = function(courseId) {
  return this.find({ course: courseId })
    .sort({ order: 1 })
    .exec();
};

/**
 * Get free preview lessons for a course
 * @param {String} courseId - Course ID
 * @returns {Array} Array of free lessons
 */
courseLessonSchema.statics.getPreviewLessons = function(courseId) {
  return this.find({ course: courseId, isFree: true })
    .sort({ order: 1 })
    .exec();
};

/**
 * Get lessons grouped by section
 * @param {String} courseId - Course ID
 * @returns {Object} Object with sections as keys and lessons as values
 */
courseLessonSchema.statics.getLessonsBySection = async function(courseId) {
  const lessons = await this.find({ course: courseId })
    .sort({ section: 1, order: 1 })
    .exec();
  
  const grouped = {};
  
  lessons.forEach(lesson => {
    const section = lesson.section || 'Uncategorized';
    if (!grouped[section]) {
      grouped[section] = [];
    }
    grouped[section].push(lesson);
  });
  
  return grouped;
};

/**
 * Get next lesson after a given lesson
 * @param {String} courseId - Course ID
 * @param {Number} currentOrder - Current lesson order
 * @returns {Object} Next lesson or null
 */
courseLessonSchema.statics.getNextLesson = function(courseId, currentOrder) {
  return this.findOne({ 
    course: courseId, 
    order: { $gt: currentOrder } 
  })
    .sort({ order: 1 })
    .exec();
};

/**
 * Get previous lesson before a given lesson
 * @param {String} courseId - Course ID
 * @param {Number} currentOrder - Current lesson order
 * @returns {Object} Previous lesson or null
 */
courseLessonSchema.statics.getPreviousLesson = function(courseId, currentOrder) {
  return this.findOne({ 
    course: courseId, 
    order: { $lt: currentOrder } 
  })
    .sort({ order: -1 })
    .exec();
};

/**
 * Count total lessons for a course
 * @param {String} courseId - Course ID
 * @returns {Number} Total lesson count
 */
courseLessonSchema.statics.countLessons = function(courseId) {
  return this.countDocuments({ course: courseId });
};

/**
 * Calculate total duration for a course
 * @param {String} courseId - Course ID
 * @returns {Number} Total duration in minutes
 */
courseLessonSchema.statics.calculateTotalDuration = async function(courseId) {
  const result = await this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
  ]);
  
  return result.length > 0 ? result[0].totalDuration : 0;
};

// ========== Virtuals ==========

/**
 * Virtual for duration in hours
 */
courseLessonSchema.virtual('durationInHours').get(function() {
  return Math.round((this.duration / 60) * 10) / 10; // Round to 1 decimal
});

/**
 * Virtual for quiz question count
 */
courseLessonSchema.virtual('quizQuestionCount').get(function() {
  if (this.content === 'quiz' && this.quiz && this.quiz.questions) {
    return this.quiz.questions.length;
  }
  return 0;
});

/**
 * Virtual for resource count
 */
courseLessonSchema.virtual('resourceCount').get(function() {
  return this.resources ? this.resources.length : 0;
});

// Ensure virtuals are included in JSON
courseLessonSchema.set('toJSON', { virtuals: true });
courseLessonSchema.set('toObject', { virtuals: true });

const CourseLesson = mongoose.model('CourseLesson', courseLessonSchema);

module.exports = CourseLesson;
