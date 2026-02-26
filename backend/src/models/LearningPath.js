/**
 * 🎯 LearningPath Model
 * نموذج مسارات التعلم المخصصة
 * 
 * يخزن مسارات التعلم المخصصة للمستخدمين بناءً على أهدافهم المهنية وفجوات مهاراتهم
 * مع تتبع التقدم والمراحل والتوصيات التالية
 * 
 * المتطلبات: 2.3 (مسار تعليمي مخصص)
 * Task: 9.3 توصيات الدورات
 */

const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  // المستخدم المالك للمسار
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // اسم المسار
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // وصف المسار
  description: {
    type: String,
    required: true
  },
  
  // الهدف المهني للمسار
  careerGoal: {
    title: {
      type: String,
      required: true
    },
    description: String,
    targetJobs: [{
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPosting'
      },
      jobTitle: String,
      company: String,
      matchScore: Number
    }],
    expectedSalaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'EGP'
      }
    },
    timeline: {
      type: String,
      enum: ['short_term', 'medium_term', 'long_term'],
      default: 'medium_term'
    }
  },
  
  // مراحل المسار
  stages: [{
    order: {
      type: Number,
      required: true,
      min: 1
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    objective: String,
    estimatedDuration: {
      weeks: Number,
      hours: Number
    },
    courses: [{
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainingCourse'
      },
      courseTitle: String,
      courseDescription: String,
      platform: String,
      url: String,
      duration: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'comprehensive']
      },
      skillsCovered: [String],
      order: Number,
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'skipped'],
        default: 'not_started'
      },
      startedAt: Date,
      completedAt: Date,
      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      notes: String,
      employmentImprovement: {
        percentage: Number,
        description: String
      }
    }],
    prerequisites: [Number], // مراجع لمراحل سابقة
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'blocked'],
      default: 'not_started'
    },
    startedAt: Date,
    completedAt: Date,
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  
  // المهارات المستهدفة في المسار
  targetSkills: [{
    skill: String,
    category: String,
    importance: {
      type: Number,
      min: 0,
      max: 1
    },
    currentLevel: {
      type: String,
      enum: ['none', 'beginner', 'intermediate', 'advanced', 'expert']
    },
    targetLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    coursesCovering: [{
      courseId: mongoose.Schema.Types.ObjectId,
      courseTitle: String,
      coveragePercentage: Number
    }]
  }],
  
  // تتبع التقدم
  progress: {
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    completedStages: {
      type: Number,
      default: 0
    },
    completedCourses: {
      type: Number,
      default: 0
    },
    totalHoursCompleted: {
      type: Number,
      default: 0
    },
    estimatedHoursRemaining: {
      type: Number,
      default: 0
    },
    lastActivity: Date,
    streak: {
      days: Number,
      lastActive: Date
    }
  },
  
  // إحصائيات التحسين
  improvementMetrics: {
    skillCoverageIncrease: {
      type: Number,
      min: 0,
      max: 100
    },
    employmentOpportunityIncrease: {
      type: Number,
      min: 0,
      max: 100
    },
    salaryIncreasePotential: {
      type: Number,
      min: 0
    },
    confidenceLevel: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  
  // التوصيات التالية
  nextRecommendations: [{
    type: {
      type: String,
      enum: ['course', 'practice', 'project', 'assessment', 'job_application']
    },
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    action: String,
    estimatedTime: String,
    prerequisites: [String]
  }],
  
  // الإعدادات
  settings: {
    notifications: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly'],
        default: 'weekly'
      },
      reminders: {
        enabled: {
          type: Boolean,
          default: true
        },
        time: String // وقت التذكير اليومي
      }
    },
    pace: {
      type: String,
      enum: ['slow', 'moderate', 'fast', 'intensive'],
      default: 'moderate'
    },
    weeklyHours: {
      type: Number,
      min: 1,
      max: 40,
      default: 10
    },
    autoUpdate: {
      type: Boolean,
      default: true
    }
  },
  
  // الحالة
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'abandoned'],
    default: 'active'
  },
  
  // التواريخ
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  targetCompletionDate: Date,
  actualCompletionDate: Date,
  
  // معلومات إضافية
  metadata: {
    version: {
      type: String,
      default: '1.0'
    },
    algorithm: {
      type: String,
      enum: ['skill_gap_based', 'career_goal_based', 'hybrid'],
      default: 'hybrid'
    },
    generatedFrom: {
      jobIds: [mongoose.Schema.Types.ObjectId],
      skillGapAnalysisId: mongoose.Schema.Types.ObjectId
    },
    lastRegenerated: Date,
    regenerationCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// فهارس مركبة للأداء
learningPathSchema.index({ userId: 1, status: 1, createdAt: -1 });
learningPathSchema.index({ userId: 1, 'progress.overall': -1 });
learningPathSchema.index({ 'careerGoal.targetJobs.jobId': 1 });
learningPathSchema.index({ 'targetSkills.skill': 1 });

// Middleware لتحديث updatedAt
learningPathSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // تحديث التقدم الإجمالي
  if (this.stages && this.stages.length > 0) {
    const completedStages = this.stages.filter(stage => stage.status === 'completed').length;
    const totalStages = this.stages.length;
    this.progress.completedStages = completedStages;
    this.progress.overall = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
    
    // تحديث عدد الدورات المكتملة
    let completedCourses = 0;
    let totalHoursCompleted = 0;
    
    this.stages.forEach(stage => {
      if (stage.courses && stage.courses.length > 0) {
        stage.courses.forEach(course => {
          if (course.status === 'completed') {
            completedCourses++;
            
            // استخراج الساعات من المدة
            const durationMatch = course.duration?.match(/(\d+)/);
            if (durationMatch) {
              totalHoursCompleted += parseInt(durationMatch[1]);
            }
          }
        });
      }
    });
    
    this.progress.completedCourses = completedCourses;
    this.progress.totalHoursCompleted = totalHoursCompleted;
  }
  
  // تحديث حالة المسار بناءً على التقدم
  if (this.progress.overall === 100) {
    this.status = 'completed';
    this.actualCompletionDate = new Date();
  } else if (this.status === 'completed' && this.progress.overall < 100) {
    this.status = 'active';
    this.actualCompletionDate = undefined;
  }
  
  next();
});

// طرق المثيل
learningPathSchema.methods = {
  /**
   * تحديث حالة دورة في مرحلة
   */
  updateCourseStatus(stageOrder, courseOrder, status, progress = null, notes = null) {
    const stage = this.stages.find(s => s.order === stageOrder);
    if (!stage) {
      throw new Error(`Stage ${stageOrder} not found`);
    }
    
    const course = stage.courses.find(c => c.order === courseOrder);
    if (!course) {
      throw new Error(`Course ${courseOrder} not found in stage ${stageOrder}`);
    }
    
    course.status = status;
    if (progress !== null) {
      course.progress = progress;
    }
    if (notes !== null) {
      course.notes = notes;
    }
    
    if (status === 'in_progress' && !course.startedAt) {
      course.startedAt = new Date();
    } else if (status === 'completed' && !course.completedAt) {
      course.completedAt = new Date();
      course.progress = 100;
    }
    
    // تحديث حالة المرحلة
    this.updateStageStatus(stageOrder);
    
    // تحديث آخر نشاط
    this.progress.lastActivity = new Date();
    
    return this.save();
  },
  
  /**
   * تحديث حالة مرحلة
   */
  updateStageStatus(stageOrder) {
    const stage = this.stages.find(s => s.order === stageOrder);
    if (!stage) {
      throw new Error(`Stage ${stageOrder} not found`);
    }
    
    // التحقق من مسبقات المرحلة
    if (stage.prerequisites && stage.prerequisites.length > 0) {
      const prerequisiteStages = this.stages.filter(s => 
        stage.prerequisites.includes(s.order)
      );
      
      const allPrerequisitesCompleted = prerequisiteStages.every(s => 
        s.status === 'completed'
      );
      
      if (!allPrerequisitesCompleted) {
        stage.status = 'blocked';
        return this.save();
      }
    }
    
    // تحديث حالة المرحلة بناءً على دوراتها
    if (stage.courses && stage.courses.length > 0) {
      const completedCourses = stage.courses.filter(c => c.status === 'completed').length;
      const totalCourses = stage.courses.length;
      
      stage.progress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
      
      if (completedCourses === totalCourses) {
        stage.status = 'completed';
        stage.completedAt = new Date();
      } else if (completedCourses > 0) {
        stage.status = 'in_progress';
        if (!stage.startedAt) {
          stage.startedAt = new Date();
        }
      } else {
        stage.status = 'not_started';
      }
    }
    
    return this.save();
  },
  
  /**
   * الحصول على التوصية التالية
   */
  getNextRecommendation() {
    if (!this.nextRecommendations || this.nextRecommendations.length === 0) {
      return null;
    }
    
    // إرجاع التوصية ذات الأولوية الأعلى
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return this.nextRecommendations.reduce((highest, current) => {
      const currentPriority = priorityOrder[current.priority] || 0;
      const highestPriority = priorityOrder[highest.priority] || 0;
      return currentPriority > highestPriority ? current : highest;
    });
  },
  
  /**
   * الحصول على ملخص التقدم
   */
  getProgressSummary() {
    const totalStages = this.stages.length;
    const completedStages = this.stages.filter(s => s.status === 'completed').length;
    const inProgressStages = this.stages.filter(s => s.status === 'in_progress').length;
    
    let totalCourses = 0;
    let completedCourses = 0;
    let inProgressCourses = 0;
    
    this.stages.forEach(stage => {
      if (stage.courses) {
        totalCourses += stage.courses.length;
        completedCourses += stage.courses.filter(c => c.status === 'completed').length;
        inProgressCourses += stage.courses.filter(c => c.status === 'in_progress').length;
      }
    });
    
    return {
      stages: {
        total: totalStages,
        completed: completedStages,
        inProgress: inProgressStages,
        percentage: totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0
      },
      courses: {
        total: totalCourses,
        completed: completedCourses,
        inProgress: inProgressCourses,
        percentage: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0
      },
      time: {
        completedHours: this.progress.totalHoursCompleted,
        estimatedRemainingHours: this.progress.estimatedHoursRemaining,
        totalEstimatedHours: this.progress.totalHoursCompleted + this.progress.estimatedHoursRemaining
      },
      overall: this.progress.overall
    };
  },
  
  /**
   * الحصول على المهارات التي تم تطويرها
   */
  getDevelopedSkills() {
    const developedSkills = new Map();
    
    this.stages.forEach(stage => {
      if (stage.courses) {
        stage.courses.forEach(course => {
          if (course.status === 'completed' && course.skillsCovered) {
            course.skillsCovered.forEach(skill => {
              if (!developedSkills.has(skill)) {
                developedSkills.set(skill, {
                  skill,
                  courses: [],
                  coverage: 0
                });
              }
              
              const skillData = developedSkills.get(skill);
              skillData.courses.push({
                courseTitle: course.courseTitle,
                courseId: course.courseId
              });
              skillData.coverage += 1;
            });
          }
        });
      }
    });
    
    return Array.from(developedSkills.values());
  },
  
  /**
   * التحقق مما إذا كان المسار نشطاً
   */
  isActive() {
    return this.status === 'active';
  },
  
  /**
   * إعادة توليد المسار بناءً على تحديثات المهارات
   */
  async regenerate(regenerationData) {
    this.metadata.lastRegenerated = new Date();
    this.metadata.regenerationCount += 1;
    
    // هنا يمكن إضافة منطق إعادة التوليد
    // في التطبيق الحقيقي، سيتم استدعاء خدمة إعادة التوليد
    
    return this.save();
  }
};

// طرق ثابتة
learningPathSchema.statics = {
  /**
   * جلب مسارات تعلم مستخدم
   */
  async getUserLearningPaths(userId, options = {}) {
    const {
      status,
      limit = 20,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;
    
    const query = { userId };
    
    if (status) {
      query.status = status;
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    return this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  },
  
  /**
   * جلب مسار تعلم نشط للمستخدم
   */
  async getActiveLearningPath(userId) {
    return this.findOne({
      userId,
      status: 'active'
    }).sort({ createdAt: -1 });
  },
  
  /**
   * إنشاء مسار تعلم جديد
   */
  async createLearningPath(userId, learningPathData) {
    const learningPath = new this({
      userId,
      ...learningPathData,
      startedAt: new Date(),
      progress: {
        overall: 0,
        completedStages: 0,
        completedCourses: 0,
        totalHoursCompleted: 0,
        estimatedHoursRemaining: learningPathData.progress?.estimatedHoursRemaining || 0,
        lastActivity: new Date()
      }
    });
    
    return learningPath.save();
  },
  
  /**
   * تحديث تقدم المسار
   */
  async updatePathProgress(pathId, progressData) {
    const learningPath = await this.findById(pathId);
    if (!learningPath) {
      throw new Error('Learning path not found');
    }
    
    Object.assign(learningPath.progress, progressData);
    learningPath.progress.lastActivity = new Date();
    
    return learningPath.save();
  },
  
  /**
   * إحصاءات مسارات التعلم للمستخدم
   */
  async getUserLearningStats(userId) {
    const stats = await this.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress.overall' },
          totalCompletedCourses: { $sum: '$progress.completedCourses' },
          totalHoursCompleted: { $sum: '$progress.totalHoursCompleted' }
        }
      }
    ]);
    
    const totalStats = await this.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalPaths: { $sum: 1 },
          activePaths: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedPaths: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalHours: { $sum: '$progress.totalHoursCompleted' }
        }
      }
    ]);
    
    return {
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat;
        return acc;
      }, {}),
      totals: totalStats[0] || {
        totalPaths: 0,
        activePaths: 0,
        completedPaths: 0,
        totalHours: 0
      }
    };
  },
  
  /**
   * حذف مسارات التعلم القديمة
   */
  async cleanupOldLearningPaths(days = 365) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.deleteMany({
      status: 'completed',
      actualCompletionDate: { $lt: cutoffDate }
    });
  }
};

const LearningPath = mongoose.model('LearningPath', learningPathSchema);

module.exports = LearningPath;