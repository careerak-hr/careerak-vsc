/**
 * 🤖 Course Recommendation Service
 * خدمة توصيات الدورات الذكية
 * 
 * نظام توصيات الدورات بناءً على الوظائف المستهدفة وفجوات المهارات
 * مع توقع تحسين فرص التوظيف ومسارات تعليمية مخصصة
 * 
 * المتطلبات: 2.1, 2.2, 2.3 (توصيات الدورات لتطوير المهارات)
 * Task: 9.3 توصيات الدورات
 */

const SkillGapAnalysis = require('./skillGapAnalysis');
const ContentBasedFiltering = require('./contentBasedFiltering');

class CourseRecommendationService {
  constructor() {
    this.skillGapAnalysis = new SkillGapAnalysis();
    this.contentBasedFiltering = new ContentBasedFiltering();
    
    // قاعدة بيانات الدورات (يمكن استبدالها بقاعدة بيانات حقيقية)
    this.coursesDatabase = this.initializeCoursesDatabase();
    
    // معاملات توقع تحسين فرص التوظيف
    this.employmentImprovementFactors = {
      skillMatch: 0.4,        // تطابق المهارات (40%)
      courseLevel: 0.2,       // مستوى الدورة (20%)
      marketDemand: 0.2,      // طلب السوق (20%)
      completionRate: 0.1,    // معدل الإكمال (10%)
      userEngagement: 0.1     // تفاعل المستخدم (10%)
    };
    
    // مستويات الدورات
    this.courseLevels = {
      'beginner': {
        description: 'مبتدئ - مناسب للمبتدئين بدون خبرة سابقة',
        prerequisites: [],
        expectedDuration: '10-20 ساعة',
        targetAudience: 'المبتدئين، الخريجين الجدد'
      },
      'intermediate': {
        description: 'متوسط - يتطلب معرفة أساسية بالموضوع',
        prerequisites: ['خبرة أساسية', 'مقدمة في الموضوع'],
        expectedDuration: '20-40 ساعة',
        targetAudience: 'ذوي الخبرة الأساسية، المحترفين المبتدئين'
      },
      'advanced': {
        description: 'متقدم - للمحترفين ذوي الخبرة',
        prerequisites: ['خبرة متوسطة', 'مشاريع سابقة'],
        expectedDuration: '40-60 ساعة',
        targetAudience: 'المحترفين، المديرين، الخبراء'
      },
      'comprehensive': {
        description: 'شامل - يغطي الموضوع من البداية إلى الاحتراف',
        prerequisites: ['مستوى مبتدئ على الأقل'],
        expectedDuration: '60-100 ساعة',
        targetAudience: 'الراغبين في احتراف المجال'
      }
    };
  }
  
  /**
   * تهيئة قاعدة بيانات الدورات (مثال)
   * في التطبيق الحقيقي، سيتم جلب البيانات من قاعدة البيانات
   */
  initializeCoursesDatabase() {
    return [
      // برمجة
      {
        id: 'course_001',
        title: 'مقدمة في البرمجة باستخدام Python',
        description: 'دورة شاملة لتعلم أساسيات البرمجة باستخدام Python',
        category: 'programming',
        level: 'beginner',
        skills: ['python', 'programming', 'algorithms'],
        duration: '30 ساعة',
        instructor: 'د. أحمد محمد',
        rating: 4.7,
        studentsCount: 1250,
        completionRate: 0.85,
        marketDemand: 0.9,
        price: 'مجاني',
        platform: 'Careerak Academy',
        url: '/courses/python-basics'
      },
      {
        id: 'course_002',
        title: 'تطوير تطبيقات الويب باستخدام React',
        description: 'تعلم بناء تطبيقات ويب تفاعلية باستخدام React',
        category: 'web',
        level: 'intermediate',
        skills: ['react', 'javascript', 'frontend', 'web development'],
        duration: '40 ساعة',
        instructor: 'م. سارة علي',
        rating: 4.8,
        studentsCount: 890,
        completionRate: 0.78,
        marketDemand: 0.95,
        price: '199 جنيه',
        platform: 'Careerak Academy',
        url: '/courses/react-web-development'
      },
      {
        id: 'course_003',
        title: 'قواعد البيانات المتقدمة مع MongoDB',
        description: 'احتراف إدارة قواعد البيانات NoSQL باستخدام MongoDB',
        category: 'database',
        level: 'advanced',
        skills: ['mongodb', 'database', 'nosql', 'backend'],
        duration: '35 ساعة',
        instructor: 'د. خالد حسن',
        rating: 4.6,
        studentsCount: 540,
        completionRate: 0.72,
        marketDemand: 0.85,
        price: '299 جنيه',
        platform: 'Careerak Academy',
        url: '/courses/mongodb-advanced'
      },
      {
        id: 'course_004',
        title: 'تطوير تطبيقات الموبايل باستخدام React Native',
        description: 'بناء تطبيقات الموبايل لنظامي iOS و Android',
        category: 'mobile',
        level: 'intermediate',
        skills: ['react native', 'mobile', 'javascript', 'cross-platform'],
        duration: '45 ساعة',
        instructor: 'م. محمد عبدالله',
        rating: 4.5,
        studentsCount: 720,
        completionRate: 0.75,
        marketDemand: 0.88,
        price: '249 جنيه',
        platform: 'Careerak Academy',
        url: '/courses/react-native-mobile'
      },
      {
        id: 'course_005',
        title: 'تصميم واجهات المستخدم UI/UX',
        description: 'تعلم مبادئ تصميم واجهات المستخدم وتجربة المستخدم',
        category: 'design',
        level: 'beginner',
        skills: ['ui', 'ux', 'design', 'figma', 'adobe xd'],
        duration: '25 ساعة',
        instructor: 'م. نورا سعيد',
        rating: 4.9,
        studentsCount: 1100,
        completionRate: 0.88,
        marketDemand: 0.92,
        price: '149 جنيه',
        platform: 'Careerak Academy',
        url: '/courses/ui-ux-design'
      }
    ];
  }
  
  /**
   * توليد توصيات الدورات بناءً على الوظائف المستهدفة
   * @param {Object} user - بيانات المستخدم
   * @param {Array} targetJobs - الوظائف المستهدفة
   * @param {Object} options - خيارات إضافية
   * @returns {Object} - توصيات الدورات مع تحليل مفصل
   */
  async recommendCoursesBasedOnTargetJobs(user, targetJobs, options = {}) {
    try {
      // 1. تحليل فجوات المهارات مع كل وظيفة مستهدفة
      const skillGapAnalyses = await this.analyzeSkillGapsForTargetJobs(user, targetJobs);
      
      // 2. تجميع المهارات المفقودة من جميع الوظائف
      const aggregatedMissingSkills = this.aggregateMissingSkills(skillGapAnalyses);
      
      // 3. مطابقة الدورات مع المهارات المفقودة
      const matchedCourses = this.matchCoursesToMissingSkills(aggregatedMissingSkills);
      
      // 4. ترتيب الدورات حسب الأولوية
      const rankedCourses = this.rankCoursesByPriority(matchedCourses, aggregatedMissingSkills);
      
      // 5. تحديد مستوى الدورة المناسب للمستخدم
      const leveledCourses = this.assignCourseLevels(rankedCourses, user);
      
      // 6. توقع تحسين فرص التوظيف بعد كل دورة
      const coursesWithImprovement = this.predictEmploymentImprovement(leveledCourses, skillGapAnalyses);
      
      // 7. إنشاء مسارات تعليمية مخصصة
      const learningPaths = this.createPersonalizedLearningPaths(coursesWithImprovement, user);
      
      // 8. تحديد 5-10 دورات مقترحة (حسب الخيارات)
      const limit = options.limit || 10;
      const recommendedCourses = coursesWithImprovement.slice(0, limit);
      
      // 9. إنشاء تقرير شامل
      const report = this.generateRecommendationReport(
        user,
        targetJobs,
        skillGapAnalyses,
        recommendedCourses,
        learningPaths
      );
      
      return {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          currentLevel: this.assessUserLevel(user)
        },
        targetJobs: targetJobs.map(job => ({
          id: job._id,
          title: job.title,
          company: job.postedBy?.companyName || 'غير محدد'
        })),
        skillGapAnalysis: {
          totalMissingSkills: aggregatedMissingSkills.length,
          topMissingSkills: aggregatedMissingSkills.slice(0, 5).map(s => s.name),
          skillDistribution: this.getSkillDistribution(aggregatedMissingSkills)
        },
        courseRecommendations: recommendedCourses,
        learningPaths,
        employmentImprovement: this.calculateOverallImprovement(coursesWithImprovement),
        report,
        metadata: {
          totalCoursesAnalyzed: this.coursesDatabase.length,
          coursesMatched: matchedCourses.length,
          recommendationAlgorithm: 'content_based_with_skill_gap_analysis',
          generatedAt: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('❌ خطأ في توليد توصيات الدورات:', error);
      return {
        success: false,
        error: error.message,
        courseRecommendations: [],
        learningPaths: []
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
          analysis,
          missingSkills: analysis.missingSkills,
          gapSeverity: this.calculateGapSeverity(analysis)
        });
      } catch (error) {
        console.warn(`⚠️ خطأ في تحليل فجوات المهارات للوظيفة ${job.title}:`, error.message);
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
            requiredByJobs: []
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
        // أولوية أعلى للكفاءة الأعلى والتكرار الأعلى
        const priorityScoreA = (a.priority * 0.7) + (a.frequency / 10 * 0.3);
        const priorityScoreB = (b.priority * 0.7) + (b.frequency / 10 * 0.3);
        return priorityScoreB - priorityScoreA;
      });
  }
  
  /**
   * مطابقة الدورات مع المهارات المفقودة
   */
  matchCoursesToMissingSkills(missingSkills) {
    const matchedCourses = [];
    
    this.coursesDatabase.forEach(course => {
      const courseSkills = course.skills || [];
      const matchedSkills = [];
      
      // البحث عن المهارات المتطابقة
      missingSkills.forEach(skill => {
        if (this.doesCourseCoverSkill(course, skill)) {
          matchedSkills.push({
            skill: skill.name,
            category: skill.category,
            importance: skill.importance,
            matchScore: this.calculateSkillMatchScore(course, skill)
          });
        }
      });
      
      if (matchedSkills.length > 0) {
        // حساب درجة المطابقة الإجمالية
        const overallMatchScore = this.calculateCourseMatchScore(matchedSkills);
        
        matchedCourses.push({
          ...course,
          matchedSkills,
          matchScore: overallMatchScore,
          skillCoverage: matchedSkills.length / missingSkills.length,
          relevance: this.calculateCourseRelevance(course, matchedSkills)
        });
      }
    });
    
    return matchedCourses;
  }
  
  /**
   * التحقق مما إذا كانت الدورة تغطي المهارة
   */
  doesCourseCoverSkill(course, skill) {
    const courseSkills = course.skills || [];
    const skillName = skill.name.toLowerCase();
    
    // التحقق من التطابق المباشر
    if (courseSkills.some(courseSkill => 
      courseSkill.toLowerCase() === skillName)) {
      return true;
    }
    
    // التحقق من المرادفات
    const skillSynonyms = this.skillGapAnalysis.skillsSynonyms[skillName] || [];
    const allVariants = [skillName, ...skillSynonyms];
    
    return courseSkills.some(courseSkill => 
      allVariants.includes(courseSkill.toLowerCase())
    );
  }
  
  /**
   * حساب درجة مطابقة المهارة
   */
  calculateSkillMatchScore(course, skill) {
    let score = 0.5; // درجة أساسية
    
    // زيادة الدرجة بناءً على أهمية المهارة
    score += skill.importance * 0.3;
    
    // زيادة الدرجة إذا كانت المهارة مذكورة في عنوان الدورة
    const courseTitle = course.title.toLowerCase();
    const skillName = skill.name.toLowerCase();
    if (courseTitle.includes(skillName)) {
      score += 0.2;
    }
    
    // زيادة الدرجة بناءً على مستوى الدورة
    const levelScore = this.getCourseLevelScore(course.level);
    score += levelScore * 0.1;
    
    return Math.min(score, 1.0);
  }
  
  /**
   * حساب درجة مطابقة الدورة
   */
  calculateCourseMatchScore(matchedSkills) {
    if (matchedSkills.length === 0) return 0;
    
    const totalScore = matchedSkills.reduce((sum, skill) => 
      sum + skill.matchScore, 0);
    
    return totalScore / matchedSkills.length;
  }
  
  /**
   * حساب صلة الدورة
   */
  calculateCourseRelevance(course, matchedSkills) {
    let relevance = 0;
    
    // صلة بناءً على عدد المهارات المطابقة
    relevance += (matchedSkills.length / 5) * 0.4; // حتى 40%
    
    // صلة بناءً على متوسط درجة المطابقة
    const avgMatchScore = matchedSkills.reduce((sum, skill) => 
      sum + skill.matchScore, 0) / matchedSkills.length;
    relevance += avgMatchScore * 0.3; // حتى 30%
    
    // صلة ب��اءً على تقييم الدورة
    relevance += (course.rating / 5) * 0.2; // حتى 20%
    
    // صلة بناءً على طلب السوق
    relevance += course.marketDemand * 0.1; // حتى 10%
    
    return Math.min(relevance, 1.0);
  }
  
  /**
   * ترتيب الدورات حسب الأولوية
   */
  rankCoursesByPriority(courses, missingSkills) {
    return courses.sort((a, b) => {
      // حساب درجة الأولوية لكل دورة
      const priorityA = this.calculateCoursePriority(a, missingSkills);
      const priorityB = this.calculateCoursePriority(b, missingSkills);
      
      return priorityB - priorityA;
    });
  }
  
  /**
   * حساب أولوية الدورة
   */
  calculateCoursePriority(course, missingSkills) {
    let priority = 0;
    
    // أولوية بناءً على درجة المطابقة
    priority += course.matchScore * 0.4;
    
    // أولوية بناءً على صلة ا��دورة
    priority += course.relevance * 0.3;
    
    // أولوية بناءً على تقييم الدورة
    priority += (course.rating / 5) * 0.15;
    
    // أولوية بناءً على طلب السوق
    priority += course.marketDemand * 0.1;
    
    // أولوية بناءً على معدل الإكمال
    priority += course.completionRate * 0.05;
    
    return priority;
  }
  
  /**
   * تحديد مستوى الدورة المناسب للمستخدم
   */
  assignCourseLevels(courses, user) {
    const userLevel = this.assessUserLevel(user);
    
    return courses.map(course => {
      const levelSuitability = this.calculateLevelSuitability(course.level, userLevel);
      
      return {
        ...course,
        levelSuitability,
        recommendedLevel: this.getRecommendedLevel(course.level, userLevel),
        levelDescription: this.courseLevels[course.level]?.description || 'غير محدد'
      };
    });
  }
  
  /**
   * تقييم مستوى المستخدم
   */
  assessUserLevel(user) {
    // تحليل مستوى المستخدم بناءً على خبرته ومهاراته
    const experienceYears = this.extractUserExperienceYears(user);
    const skillCount = this.extractUserSkillCount(user);
    
    if (experienceYears >= 5 || skillCount >= 15) {
      return 'advanced';
    } else if (experienceYears >= 2 || skillCount >= 8) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }
  
  /**
   * استخراج سنوات خبرة المستخدم
   */
  extractUserExperienceYears(user) {
    if (!user.experienceList || !Array.isArray(user.experienceList)) {
      return 0;
    }
    
    let totalYears = 0;
    user.experienceList.forEach(exp => {
      if (exp.from && exp.to) {
        const from = new Date(exp.from);
        const to = new Date(exp.to);
        const years = (to - from) / (1000 * 60 * 60 * 24 * 365.25);
        totalYears += Math.max(0, years);
      }
    });
    
    return Math.round(totalYears * 10) / 10;
  }
  
  /**
   * استخراج عدد مهارات المستخدم
   */
  extractUserSkillCount(user) {
    let count = 0;
    
    if (user.computerSkills && Array.isArray(user.computerSkills)) {
      count += user.computerSkills.length;
    }
    
    if (user.softwareSkills && Array.isArray(user.softwareSkills)) {
      count += user.softwareSkills.length;
    }
    
    if (user.otherSkills && Array.isArray(user.otherSkills)) {
      count += user.otherSkills.length;
    }
    
    return count;
  }
  
  /**
   * حساب ملائمة المستوى
   */
  calculateLevelSuitability(courseLevel, userLevel) {
    const levelHierarchy = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'comprehensive': 4
    };
    
    const courseScore = levelHierarchy[courseLevel] || 1;
    const userScore = levelHierarchy[userLevel] || 1;
    
    const difference = courseScore - userScore;
    
    if (difference === 0) {
      return { score: 1.0, description: 'مستوى مثالي لك' };
    } else if (difference === 1) {
      return { score: 0.8, description: 'مستوى مناسب للتحدي' };
    } else if (difference === -1) {
      return { score: 0.6, description: 'مراجعة مفيدة' };
    } else if (difference > 1) {
      return { score: 0.4, description: 'مستوى متقدم - قد يكون صعباً' };
    } else {
      return { score: 0.7, description: 'مستوى أساسي - جيد للمراجعة' };
    }
  }
  
  /**
   * الحصول على المستوى الموصى به
   */
  getRecommendedLevel(courseLevel, userLevel) {
    const levelHierarchy = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'comprehensive': 4
    };
    
    const courseScore = levelHierarchy[courseLevel] || 1;
    const userScore = levelHierarchy[userLevel] || 1;
    
    if (courseScore > userScore + 1) {
      return 'قد يكون صعباً - نوصي بدورة مبتدئ أولاً';
    } else if (courseScore < userScore - 1) {
      return 'مستوى أساسي - جيد للمراجعة';
    } else {
      return 'مستوى مناسب';
    }
  }
  
  /**
   * توقع تحسين فرص التوظيف بعد الدورة
   */
  predictEmploymentImprovement(courses, skillGapAnalyses) {
    return courses.map(course => {
      const improvement = this.calculateEmploymentImprovement(course, skillGapAnalyses);
      
      return {
        ...course,
        employmentImprovement: improvement,
        expectedOutcomes: this.generateExpectedOutcomes(course, improvement)
      };
    });
  }
  
  /**
   * حساب تحسين فرص التوظيف
   */
  calculateEmploymentImprovement(course, skillGapAnalyses) {
    let improvement = 0;
    
    // تحسين بناءً على تطابق المهارات
    improvement += course.matchScore * this.employmentImprovementFactors.skillMatch;
    
    // تحسين بناءً على مستوى الدورة
    const levelScore = this.getCourseLevelScore(course.level);
    improvement += levelScore * this.employmentImprovementFactors.courseLevel;
    
    // تحسين بناءً على طلب السوق
    improvement += course.marketDemand * this.employmentImprovementFactors.marketDemand;
    
    // تحسين بناءً على معدل إكمال الدورة
    improvement += course.completionRate * this.employmentImprovementFactors.completionRate;
    
    // تحسين بناءً على تفاعل المستخدم (تقديري)
    improvement += 0.7 * this.employmentImprovementFactors.userEngagement;
    
    // تحسين إضافي بناءً على فجوات المهارات
    const gapImprovement = this.calculateGapBasedImprovement(course, skillGapAnalyses);
    improvement += gapImprovement * 0.2;
    
    return Math.min(improvement, 1.0);
  }
  
  /**
   * الحصول على درجة مستوى الدورة
   */
  getCourseLevelScore(level) {
    const scores = {
      'beginner': 0.6,
      'intermediate': 0.8,
      'advanced': 0.9,
      'comprehensive': 1.0
    };
    
    return scores[level] || 0.5;
  }
  
  /**
   * حساب التحسين بناءً على فجوات المهارات
   */
  calculateGapBasedImprovement(course, skillGapAnalyses) {
    let totalGapCoverage = 0;
    let jobCount = 0;
    
    skillGapAnalyses.forEach(({ analysis, missingSkills }) => {
      // Handle undefined or null missingSkills
      const skills = missingSkills || [];
      const coveredSkills = skills.filter(skill => 
        this.doesCourseCoverSkill(course, skill)
      ).length;
      
      if (skills.length > 0) {
        totalGapCoverage += coveredSkills / skills.length;
        jobCount++;
      }
    });
    
    return jobCount > 0 ? totalGapCoverage / jobCount : 0;
  }
  
  /**
   * توليد النتائج المتوقعة
   */
  generateExpectedOutcomes(course, improvement) {
    const improvementPercentage = Math.round(improvement * 100);
    
    return [
      `زيادة فرص التوظيف بنسبة ${improvementPercentage}%`,
      `تطوير ${course.matchedSkills.length} مهارة جديدة`,
      `تحسين الملف الشخصي في مجال ${course.category}`,
      `زيادة الثقة في التقديم على الوظائف ذات الصلة`,
      `توسيع شبكة المعارف المهنية`
    ];
  }
  
  /**
   * إنشاء مسارات تعليمية مخصصة
   */
  createPersonalizedLearningPaths(courses, user) {
    const paths = [];
    
    // مسار سريع (3 دورات)
    const quickPath = courses.slice(0, 3);
    if (quickPath.length > 0) {
      paths.push({
        id: 'quick_path',
        name: 'مسار التعلم السريع',
        description: 'مسار مكثف يركز على أهم المهارات المطلوبة',
        duration: this.calculatePathDuration(quickPath),
        courses: quickPath.map(course => ({
          id: course.id,
          title: course.title,
          order: 1
        })),
        targetCompletion: '4-6 أسابيع',
        suitability: 'للمستخدمين الذين يريدون تحسين سريع'
      });
    }
    
    // مسار شامل (5-7 دورات)
    const comprehensivePath = courses.slice(0, 7);
    if (comprehensivePath.length > 0) {
      paths.push({
        id: 'comprehensive_path',
        name: 'مسار التعلم الشامل',
        description: 'مسار شامل يغطي جميع المهارات المطلوبة',
        duration: this.calculatePathDuration(comprehensivePath),
        courses: comprehensivePath.map((course, index) => ({
          id: course.id,
          title: course.title,
          order: index + 1
        })),
        targetCompletion: '8-12 أسبوع',
        suitability: 'للمستخدمين الذين يريدون احتراف المجال'
      });
    }
    
    // مسار حسب المستوى
    const userLevel = this.assessUserLevel(user);
    const levelBasedPath = courses
      .filter(course => course.levelSuitability.score >= 0.7)
      .slice(0, 5);
    
    if (levelBasedPath.length > 0) {
      paths.push({
        id: 'level_based_path',
        name: `مسار التعلم لمستوى ${userLevel}`,
        description: `مسار مصمم خصيصاً لمستوى ${userLevel}`,
        duration: this.calculatePathDuration(levelBasedPath),
        courses: levelBasedPath.map((course, index) => ({
          id: course.id,
          title: course.title,
          order: index + 1
        })),
        targetCompletion: '6-10 أسابيع',
        suitability: `مصمم خصيصاً لمستوى ${userLevel}`
      });
    }
    
    return paths;
  }
  
  /**
   * حساب مدة المسار
   */
  calculatePathDuration(courses) {
    const totalHours = courses.reduce((sum, course) => {
      const durationMatch = course.duration.match(/(\d+)/);
      return sum + (durationMatch ? parseInt(durationMatch[1]) : 20);
    }, 0);
    
    return `${totalHours} ساعة`;
  }
  
  /**
   * توليد تقرير التوصيات
   */
  generateRecommendationReport(user, targetJobs, skillGapAnalyses, recommendedCourses, learningPaths) {
    const totalMissingSkills = skillGapAnalyses.reduce((sum, analysis) => 
      sum + analysis.missingSkills.length, 0);
    
    const avgImprovement = recommendedCourses.length > 0 ?
      recommendedCourses.reduce((sum, course) => 
        sum + course.employmentImprovement, 0) / recommendedCourses.length : 0;
    
    return {
      summary: `تم تحليل ${targetJobs.length} وظيفة مستهدفة و${skillGapAnalyses.length} تحليل فجوات مهارات`,
      keyFindings: [
        `تم تحديد ${totalMissingSkills} مهارة مفقودة`,
        `تمت مطابقة ${recommendedCourses.length} دورة مع المهارات المفقودة`,
        `متوسط تحسين فرص التوظيف المتوقع: ${Math.round(avgImprovement * 100)}%`,
        `تم إنشاء ${learningPaths.length} مسار تعليمي مخصص`
      ],
      recommendations: [
        'ابدأ بالمسار السريع للتحسين السريع',
        'ركز على المهارات ذات الأولوية العالية',
        'اختر الدورات المناسبة لمستواك الحالي',
        'تابع تقدمك باستمرار'
      ],
      nextSteps: [
        'اختر مسار التعلم المناسب لك',
        'سجل في الدورات المقترحة',
        'حدد جدولاً زمنياً واقعياً',
        'تابع تقدمك وقم بتحديث ملفك الشخصي'
      ]
    };
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
   * الحصول على توزيع المهارات
   */
  getSkillDistribution(missingSkills) {
    const distribution = {};
    
    missingSkills.forEach(skill => {
      if (!distribution[skill.category]) {
        distribution[skill.category] = 0;
      }
      distribution[skill.category]++;
    });
    
    return distribution;
  }
  
  /**
   * حساب التحسين الإجمالي
   */
  calculateOverallImprovement(courses) {
    if (courses.length === 0) return 0;
    
    const totalImprovement = courses.reduce((sum, course) => 
      sum + course.employmentImprovement, 0);
    
    return {
      average: totalImprovement / courses.length,
      max: Math.max(...courses.map(c => c.employmentImprovement)),
      min: Math.min(...courses.map(c => c.employmentImprovement)),
      formatted: `${Math.round((totalImprovement / courses.length) * 100)}%`
    };
  }
  
  /**
   * جلب الدورات من قاعدة البيانات (وهمي - للاختبار)
   */
  async getCoursesFromDatabase(filters = {}) {
    // في التطبيق الحقيقي، سيتم استعلام قاعدة البيانات
    let filteredCourses = [...this.coursesDatabase];
    
    // تطبيق الفلاتر
    if (filters.category) {
      filteredCourses = filteredCourses.filter(course => 
        course.category === filters.category);
    }
    
    if (filters.level) {
      filteredCourses = filteredCourses.filter(course => 
        course.level === filters.level);
    }
    
    if (filters.minRating) {
      filteredCourses = filteredCourses.filter(course => 
        course.rating >= filters.minRating);
    }
    
    return filteredCourses;
  }
}

module.exports = CourseRecommendationService;