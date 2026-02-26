/**
 * 🎯 Learning Path Service
 * خدمة إدارة مسارات التعلم المخصصة
 * 
 * توليد وإدارة مسارات التعلم المخصصة بناءً على أهداف المستخدم المهنية وفجوات مهاراته
 * مع تتبع التقدم وتوليد توصيات تالية
 * 
 * المتطلبات: 2.3 (مسار تعليمي مخصص)
 * Task: 9.3 توصيات الدورات
 */

const LearningPath = require('../models/LearningPath');
const CourseRecommendationService = require('./courseRecommendationService');
const SkillGapAnalysis = require('./skillGapAnalysis');

class LearningPathService {
  constructor() {
    this.courseRecommendationService = new CourseRecommendationService();
    this.skillGapAnalysis = new SkillGapAnalysis();
    
    // أنماط المسارات
    this.pathPatterns = {
      'quick_skill_boost': {
        name: 'تعزيز سريع للمهارات',
        description: 'مسار مكثف يركز على أهم المهارات المطلوبة للوظائف المستهدفة',
        duration: '4-6 أسابيع',
        weeklyHours: 15,
        pace: 'fast'
      },
      'comprehensive_career_shift': {
        name: 'تحول مهني شامل',
        description: 'مسار شامل لإعادة تأهيل مهني كامل',
        duration: '6-9 أشهر',
        weeklyHours: 10,
        pace: 'moderate'
      },
      'skill_gap_filler': {
        name: 'سد فجوات المهارات',
        description: 'مسار يركز على سد فجوات مهارات محددة',
        duration: '2-3 أشهر',
        weeklyHours: 8,
        pace: 'moderate'
      },
      'career_advancement': {
        name: 'تقدم مهني',
        description: 'مسار لتطوير مهارات متقدمة للتقدم في المسار الحالي',
        duration: '3-4 أشهر',
        weeklyHours: 12,
        pace: 'moderate'
      }
    };
    
    // مراحل المسارات
    this.stageTemplates = {
      'foundation': {
        name: 'المؤسسة',
        description: 'بناء الأساسيات والمفاهيم الأساسية',
        objective: 'فهم المفاهيم الأساسية واكتساب المهارات التمهيدية'
      },
      'core_skills': {
        name: 'المهارات الأساسية',
        description: 'تطوير المهارات الأساسية المطلوبة',
        objective: 'إتقان المهارات الأساسية للوظيفة المستهدفة'
      },
      'advanced_topics': {
        name: 'مواضيع متقدمة',
        description: 'تعلم مواضيع متقدمة وتخصصية',
        objective: 'اكتساب مهارات متقدمة ومتخصصة'
      },
      'practical_application': {
        name: 'التطبيق العملي',
        description: 'تطبيق المهارات في مشاريع عملية',
        objective: 'بناء مشاريع عملية وتطبيق المهارات'
      },
      'portfolio_development': {
        name: 'تطوير المحفظة',
        description: 'بناء محفظة أعمال وتجهيز للتقديم',
        objective: 'إنشاء محفظة أعمال والتجهيز للتقديم على الوظائف'
      }
    };
  }
  
  /**
   * توليد مسار تعلم مخصص بناءً على الوظائف المستهدفة
   * @param {Object} user - بيانات المستخدم
   * @param {Array} targetJobs - الوظائف المستهدفة
   * @param {Object} options - خيارات إضافية
   * @returns {Object} - مسار التعلم المولد
   */
  async generatePersonalizedLearningPath(user, targetJobs, options = {}) {
    try {
      // 1. تحليل فجوات المهارات
      const skillGapAnalyses = await this.analyzeSkillGapsForTargetJobs(user, targetJobs);
      
      // 2. تجميع المهارات المفقودة
      const aggregatedMissingSkills = this.aggregateMissingSkills(skillGapAnalyses);
      
      // 3. توليد توصيات الدورات
      const courseRecommendations = await this.courseRecommendationService.recommendCoursesBasedOnTargetJobs(
        user,
        targetJobs,
        { limit: 20, includeLearningPaths: false }
      );
      
      if (!courseRecommendations.success) {
        throw new Error('Failed to generate course recommendations');
      }
      
      // 4. تحديد نمط المسار المناسب
      const pathPattern = this.determinePathPattern(aggregatedMissingSkills, targetJobs, options);
      
      // 5. تنظيم الدورات في مراحل
      const stages = this.organizeCoursesIntoStages(
        courseRecommendations.courseRecommendations,
        aggregatedMissingSkills,
        pathPattern
      );
      
      // 6. حساب مقاييس التحسين
      const improvementMetrics = this.calculateImprovementMetrics(
        aggregatedMissingSkills,
        courseRecommendations.courseRecommendations,
        targetJobs
      );
      
      // 7. توليد التوصيات التالية
      const nextRecommendations = this.generateNextRecommendations(stages, improvementMetrics);
      
      // 8. إنشاء مسار التعلم
      const learningPathData = {
        name: this.generatePathName(targetJobs, pathPattern),
        description: this.generatePathDescription(targetJobs, aggregatedMissingSkills, pathPattern),
        careerGoal: this.generateCareerGoal(targetJobs, user),
        stages,
        targetSkills: this.prepareTargetSkills(aggregatedMissingSkills),
        improvementMetrics,
        nextRecommendations,
        settings: this.getPathSettings(pathPattern, options),
        metadata: {
          algorithm: 'hybrid',
          generatedFrom: {
            jobIds: targetJobs.map(job => job._id),
            skillGapAnalysisId: 'generated_' + Date.now()
          }
        }
      };
      
      // 9. حساب ساعات التقديرية المتبقية
      const estimatedHoursRemaining = this.calculateEstimatedHoursRemaining(stages);
      learningPathData.progress = {
        estimatedHoursRemaining,
        overall: 0,
        completedStages: 0,
        completedCourses: 0,
        totalHoursCompleted: 0,
        lastActivity: new Date()
      };
      
      // 10. حساب تاريخ الاكتمال المستهدف
      const targetCompletionDate = this.calculateTargetCompletionDate(
        estimatedHoursRemaining,
        learningPathData.settings.weeklyHours
      );
      learningPathData.targetCompletionDate = targetCompletionDate;
      
      return {
        success: true,
        learningPath: learningPathData,
        analysis: {
          skillGapAnalyses,
          aggregatedMissingSkills,
          courseRecommendations: courseRecommendations.courseRecommendations.length,
          pathPattern,
          improvementMetrics
        }
      };
      
    } catch (error) {
      console.error('❌ Error generating learning path:', error);
      return {
        success: false,
        error: error.message,
        learningPath: null
      };
    }
  }
  
  /**
   * تحليل فجوات المهارات مع الوظائف المستهدفة
   */
  async analyzeSkillGapsForTargetJobs(user, targetJobs) {
    const analyses = [];
    
    for (const job of targetJobs) {
      try {
        const analysis = this.skillGapAnalysis.analyzeSkillGaps(user, job);
        analyses.push({
          jobId: job._id,
          jobTitle: job.title,
          company: job.postedBy?.companyName || 'غير محدد',
          analysis,
          missingSkills: analysis.missingSkills,
          gapSeverity: this.calculateGapSeverity(analysis)
        });
      } catch (error) {
        console.warn(`⚠️ Error analyzing skill gaps for job ${job.title}:`, error.message);
      }
    }
    
    return analyses;
  }
  
  /**
   * تجميع المهارات المفقودة من جميع التحليلات
   */
  aggregateMissingSkills(skillGapAnalyses) {
    const skillMap = new Map();
    
    skillGapAnalyses.forEach(({ jobId, jobTitle, missingSkills }) => {
      missingSkills.forEach(skill => {
        const key = skill.name.toLowerCase();
        
        if (!skillMap.has(key)) {
          skillMap.set(key, {
            name: skill.name,
            category: skill.category,
            importance: skill.importance,
            frequency: 0,
            priority: skill.priority,
            requiredByJobs: [],
            currentLevel: 'none',
            targetLevel: this.determineTargetLevel(skill.importance, skill.priority)
          });
        }
        
        const existingSkill = skillMap.get(key);
        existingSkill.frequency++;
        existingSkill.importance = Math.max(existingSkill.importance, skill.importance);
        existingSkill.priority = Math.max(existingSkill.priority, skill.priority);
        
        if (!existingSkill.requiredByJobs.some(job => job.id === jobId)) {
          existingSkill.requiredByJobs.push({
            id: jobId,
            title: jobTitle
          });
        }
      });
    });
    
    // تحويل الخريطة إلى مصفوفة وترتيب حسب الأولوية
    return Array.from(skillMap.values())
      .sort((a, b) => {
        const priorityScoreA = (a.priority * 0.7) + (a.frequency / 10 * 0.3);
        const priorityScoreB = (b.priority * 0.7) + (b.frequency / 10 * 0.3);
        return priorityScoreB - priorityScoreA;
      });
  }
  
  /**
   * تحديد مستوى الهدف للمهارة
   */
  determineTargetLevel(importance, priority) {
    if (priority >= 0.8 || importance >= 0.8) {
      return 'advanced';
    } else if (priority >= 0.6 || importance >= 0.6) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }
  
  /**
   * حساب شدة الفجوة
   */
  calculateGapSeverity(analysis) {
    const coverage = analysis.summary.overallCoverage;
    
    if (coverage < 50) return 'high';
    if (coverage < 75) return 'medium';
    return 'low';
  }
  
  /**
   * تحديد نمط المسار المناسب
   */
  determinePathPattern(missingSkills, targetJobs, options) {
    const totalMissingSkills = missingSkills.length;
    const highPrioritySkills = missingSkills.filter(s => s.priority >= 0.8).length;
    const jobCount = targetJobs.length;
    
    // إذا كانت الفجوات كبيرة والوظائف متعددة
    if (totalMissingSkills >= 10 && jobCount >= 3) {
      return 'comprehensive_career_shift';
    }
    
    // إذا كانت هناك مهارات عالية الأولوية
    if (highPrioritySkills >= 3) {
      return 'quick_skill_boost';
    }
    
    // إذا كانت الفجوات متوسطة
    if (totalMissingSkills >= 5) {
      return 'skill_gap_filler';
    }
    
    // إذا كانت الفجوات محددة
    return 'career_advancement';
  }
  
  /**
   * تنظيم الدورات في مراحل
   */
  organizeCoursesIntoStages(courses, missingSkills, pathPattern) {
    const stages = [];
    const pattern = this.pathPatterns[pathPattern];
    
    // تحديد عدد المراحل بناءً على نمط المسار
    let stageCount = 4;
    if (pathPattern === 'comprehensive_career_shift') {
      stageCount = 5;
    } else if (pathPattern === 'quick_skill_boost') {
      stageCount = 3;
    }
    
    // تجميع الدورات حسب المستوى والتصنيف
    const coursesByLevel = {
      beginner: [],
      intermediate: [],
      advanced: [],
      comprehensive: []
    };
    
    courses.forEach(course => {
      if (coursesByLevel[course.level]) {
        coursesByLevel[course.level].push(course);
      }
    });
    
    // إنشاء المراحل
    for (let i = 1; i <= stageCount; i++) {
      let stageCourses = [];
      let stageName = '';
      let stageDescription = '';
      
      switch (i) {
        case 1: // المرحلة الأولى: الأساسيات
          stageName = this.stageTemplates.foundation.name;
          stageDescription = this.stageTemplates.foundation.description;
          stageCourses = coursesByLevel.beginner.slice(0, 3);
          break;
          
        case 2: // المرحلة الثانية: المهارات الأساسية
          stageName = this.stageTemplates.core_skills.name;
          stageDescription = this.stageTemplates.core_skills.description;
          stageCourses = [
            ...coursesByLevel.beginner.slice(3, 5),
            ...coursesByLevel.intermediate.slice(0, 2)
          ];
          break;
          
        case 3: // المرحلة الثالثة: مواضيع متقدمة
          stageName = this.stageTemplates.advanced_topics.name;
          stageDescription = this.stageTemplates.advanced_topics.description;
          stageCourses = [
            ...coursesByLevel.intermediate.slice(2, 4),
            ...coursesByLevel.advanced.slice(0, 2)
          ];
          break;
          
        case 4: // المرحلة الرابعة: التطبيق العملي
          stageName = this.stageTemplates.practical_application.name;
          stageDescription = this.stageTemplates.practical_application.description;
          stageCourses = coursesByLevel.advanced.slice(2, 4);
          break;
          
        case 5: // المرحلة الخامسة: تطوير المحفظة
          stageName = this.stageTemplates.portfolio_development.name;
          stageDescription = this.stageTemplates.portfolio_development.description;
          stageCourses = coursesByLevel.comprehensive.slice(0, 2);
          break;
      }
      
      // تحضير دورات المرحلة
      const preparedCourses = stageCourses.map((course, index) => ({
        courseId: course.id,
        courseTitle: course.title,
        courseDescription: course.description,
        platform: course.platform,
        url: course.url,
        duration: course.duration,
        level: course.level,
        skillsCovered: course.skills || [],
        order: index + 1,
        status: 'not_started',
        progress: 0,
        employmentImprovement: {
          percentage: Math.round(course.employmentImprovement * 100),
          description: `زيادة فرص التوظيف بنسبة ${Math.round(course.employmentImprovement * 100)}%`
        }
      }));
      
      // حساب المدة التقديرية للمرحلة
      const estimatedDuration = this.calculateStageDuration(preparedCourses);
      
      stages.push({
        order: i,
        name: stageName,
        description: stageDescription,
        objective: this.stageTemplates[Object.keys(this.stageTemplates)[i - 1]]?.objective || '',
        estimatedDuration,
        courses: preparedCourses,
        prerequisites: i > 1 ? [i - 1] : [],
        status: 'not_started',
        progress: 0
      });
    }
    
    return stages;
  }
  
  /**
   * حساب مدة المرحلة
   */
  calculateStageDuration(courses) {
    let totalHours = 0;
    
    courses.forEach(course => {
      const durationMatch = course.duration?.match(/(\d+)/);
      if (durationMatch) {
        totalHours += parseInt(durationMatch[1]);
      } else {
        totalHours += 20; // قيمة افتراضية
      }
    });
    
    const weeks = Math.ceil(totalHours / 10); // بافتراض 10 ساعات أسبوعياً
    
    return {
      weeks,
      hours: totalHours
    };
  }
  
  /**
   * حساب مقاييس التحسين
   */
  calculateImprovementMetrics(missingSkills, courses, targetJobs) {
    let totalSkillCoverage = 0;
    let totalEmploymentImprovement = 0;
    let salaryIncreasePotential = 0;
    
    // حساب تغطية المهارات
    if (missingSkills.length > 0) {
      const coveredSkills = new Set();
      
      courses.forEach(course => {
        if (course.skills) {
          course.skills.forEach(skill => {
            coveredSkills.add(skill.toLowerCase());
          });
        }
      });
      
      const missingSkillNames = missingSkills.map(s => s.name.toLowerCase());
      const coveredMissingSkills = missingSkillNames.filter(skill => 
        coveredSkills.has(skill)
      ).length;
      
      totalSkillCoverage = missingSkills.length > 0 ? 
        (coveredMissingSkills / missingSkills.length) * 100 : 0;
    }
    
    // حساب تحسين فرص التوظيف
    if (courses.length > 0) {
      totalEmploymentImprovement = courses.reduce((sum, course) => 
        sum + (course.employmentImprovement || 0), 0) / courses.length * 100;
    }
    
    // حساب زيادة الراتب المحتملة (تقديري)
    salaryIncreasePotential = totalEmploymentImprovement * 100; // 1% تحسين = 100 جنيه زيادة
    
    return {
      skillCoverageIncrease: Math.round(totalSkillCoverage),
      employmentOpportunityIncrease: Math.round(totalEmploymentImprovement),
      salaryIncreasePotential: Math.round(salaryIncreasePotential),
      confidenceLevel: Math.min(0.9, totalSkillCoverage / 100 * 0.8 + totalEmploymentImprovement / 100 * 0.2)
    };
  }
  
  /**
   * توليد التوصيات التالية
   */
  generateNextRecommendations(stages, improvementMetrics) {
    const recommendations = [];
    
    // إذا كانت المرحلة الأولى لم تبدأ
    if (stages.length > 0 && stages[0].status === 'not_started') {
      recommendations.push({
        type: 'course',
        title: 'ابدأ بالمرحلة الأولى',
        description: 'ابدأ بدورة ' + (stages[0].courses[0]?.courseTitle || 'الأساسيات'),
        priority: 'high',
        action: 'start_stage_1',
        estimatedTime: 'اليوم',
        prerequisites: []
      });
    }
    
    // توصيات بناءً على مقاييس التحسين
    if (improvementMetrics.skillCoverageIncrease < 50) {
      recommendations.push({
        type: 'practice',
        title: 'ركز على المهارات الأساسية',
        description: 'تدرب على المهارات ذات الأولوية العالية',
        priority: 'medium',
        action: 'focus_on_core_skills',
        estimatedTime: 'أسبوع',
        prerequisites: ['complete_basics']
      });
    }
    
    if (improvementMetrics.employmentOpportunityIncrease > 60) {
      recommendations.push({
        type: 'job_application',
        title: 'تقديم على الوظائف',
        description: 'أنت جاهز للتقديم على الوظائف المستهدفة',
        priority: 'high',
        action: 'apply_to_jobs',
        estimatedTime: '2-3 أيام',
        prerequisites: ['complete_all_courses']
      });
    }
    
    // توصية عامة
    recommendations.push({
      type: 'assessment',
      title: 'تقييم المهارات',
      description: 'اختبر مهاراتك الجديدة',
      priority: 'low',
      action: 'take_assessment',
      estimatedTime: 'ساعة',
      prerequisites: []
    });
    
    return recommendations;
  }
  
  /**
   * توليد اسم المسار
   */
  generatePathName(targetJobs, pathPattern) {
    const pattern = this.pathPatterns[pathPattern];
    const jobTitles = targetJobs.slice(0, 2).map(job => job.title).join(' و ');
    
    return `${pattern.name}: ${jobTitles}`;
  }
  
  /**
   * توليد وصف المسار
   */
  generatePathDescription(targetJobs, missingSkills, pathPattern) {
    const pattern = this.pathPatterns[pathPattern];
    const jobCount = targetJobs.length;
    const skillCount = missingSkills.length;
    const topSkills = missingSkills.slice(0, 3).map(s => s.name).join('، ');
    
    return `${pattern.description}. يركز على ${skillCount} مهارة أساسية بما في ذلك ${topSkills} لتحقيق ${jobCount} هدف مهني.`;
  }
  
  /**
   * توليد الهدف المهني
   */
  generateCareerGoal(targetJobs, user) {
    const primaryJob = targetJobs[0];
    
    return {
      title: `الوصول إلى مستوى ${primaryJob.title}`,
      description: `تطوير المهارات اللازمة للعمل كـ ${primaryJob.title} في شركات رائدة`,
      targetJobs: targetJobs.slice(0, 3).map(job => ({
        jobId: job._id,
        jobTitle: job.title,
        company: job.postedBy?.companyName || 'شركات رائدة',
        matchScore: 85
      })),
      expectedSalaryRange: {
        min: 8000,
        max: 15000,
        currency: 'EGP'
      },
      timeline: 'medium_term'
    };
  }
  
  /**
   * تحضير المهارات المستهدفة
   */
  prepareTargetSkills(missingSkills) {
    return missingSkills.slice(0, 10).map(skill => ({
      skill: skill.name,
      category: skill.category,
      importance: skill.importance,
      currentLevel: skill.currentLevel,
      targetLevel: skill.targetLevel,
      coursesCovering: []
    }));
  }
  
  /**
   * الحصول على إعدادات المسار
   */
  getPathSettings(pathPattern, options) {
    const pattern = this.pathPatterns[pathPattern];
    
    return {
      notifications: {
        enabled: options.notifications !== false,
        frequency: options.notificationFrequency || 'weekly',
        reminders: {
          enabled: true,
          time: '09:00'
        }
      },
      pace: options.pace || pattern.pace,
      weeklyHours: options.weeklyHours || pattern.weeklyHours,
      autoUpdate: options.autoUpdate !== false
    };
  }
  
  /**
   * حساب الساعات التقديرية المتبقية
   */
  calculateEstimatedHoursRemaining(stages) {
    let totalHours = 0;
    
    stages.forEach(stage => {
      if (stage.estimatedDuration && stage.estimatedDuration.hours) {
        totalHours += stage.estimatedDuration.hours;
      }
    });
    
    return totalHours;
  }
  
  /**
   * حساب تاريخ الاكتمال المستهدف
   */
  calculateTargetCompletionDate(totalHours, weeklyHours) {
    const hoursPerWeek = weeklyHours || 10;
    const weeksNeeded = Math.ceil(totalHours / hoursPerWeek);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeksNeeded * 7));
    
    return targetDate;
  }
  
  /**
   * حفظ مسار التعلم في قاعدة البيانات
   */
  async saveLearningPath(userId, learningPathData) {
    try {
      const learningPath = await LearningPath.createLearningPath(userId, learningPathData);
      return {
        success: true,
        learningPath,
        message: 'تم حفظ مسار التعلم بنجاح'
      };
    } catch (error) {
      console.error('❌ Error saving learning path:', error);
      return {
        success: false,
        error: error.message,
        learningPath: null
      };
    }
  }
  
  /**
   * جلب مسارات تعلم المستخدم
   */
  async getUserLearningPaths(userId, options = {}) {
    try {
      const learningPaths = await LearningPath.getUserLearningPaths(userId, options);
      return {
        success: true,
        learningPaths,
        total: learningPaths.length
      };
    } catch (error) {
      console.error('❌ Error fetching learning paths:', error);
      return {
        success: false,
        error: error.message,
        learningPaths: []
      };
    }
  }
  
  /**
   * تحديث تقدم دورة في مسار التعلم
   */
  async updateCourseProgress(pathId, stageOrder, courseOrder, progressData) {
    try {
      const learningPath = await LearningPath.findById(pathId);
      if (!learningPath) {
        return {
          success: false,
          error: 'مسار التعلم غير موجود'
        };
      }
      
      await learningPath.updateCourseStatus(
        stageOrder,
        courseOrder,
        progressData.status,
        progressData.progress,
        progressData.notes
      );
      
      return {
        success: true,
        learningPath,
        message: 'تم تحديث تقدم الدورة بنجاح'
      };
    } catch (error) {
      console.error('❌ Error updating course progress:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * الحصول على إحصاءات مسارات التعلم للمستخدم
   */
  async getUserLearningStats(userId) {
    try {
      const stats = await LearningPath.getUserLearningStats(userId);
      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('❌ Error fetching learning stats:', error);
      return {
        success: false,
        error: error.message,
        stats: null
      };
    }
  }
  
  /**
   * توليد تقرير تقدم مسار التعلم
   */
  async generateProgressReport(pathId) {
    try {
      const learningPath = await LearningPath.findById(pathId);
      if (!learningPath) {
        return {
          success: false,
          error: 'مسار التعلم غير موجود'
        };
      }
      
      const progressSummary = learningPath.getProgressSummary();
      const developedSkills = learningPath.getDevelopedSkills();
      const nextRecommendation = learningPath.getNextRecommendation();
      
      return {
        success: true,
        report: {
          pathInfo: {
            name: learningPath.name,
            description: learningPath.description,
            status: learningPath.status,
            createdAt: learningPath.createdAt,
            targetCompletionDate: learningPath.targetCompletionDate
          },
          progress: progressSummary,
          skills: {
            developed: developedSkills,
            target: learningPath.targetSkills
          },
          improvement: learningPath.improvementMetrics,
          nextSteps: nextRecommendation ? [nextRecommendation] : [],
          recommendations: learningPath.nextRecommendations || []
        }
      };
    } catch (error) {
      console.error('❌ Error generating progress report:', error);
      return {
        success: false,
        error: error.message,
        report: null
      };
    }
  }
}

module.exports = LearningPathService;