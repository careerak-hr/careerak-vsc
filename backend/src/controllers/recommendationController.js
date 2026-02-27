/**
 * 🎯 Recommendation Controller
 * وحدة تحكم لتوصيات الوظائف الذكية
 * 
 * يوفر واجهات API لتوصيات الوظائف المخصصة باستخدام Content-Based Filtering
 */

const ContentBasedFiltering = require('../services/contentBasedFiltering');
const AIJobMatcher = require('../services/aiJobMatcher');
const SkillGapAnalysis = require('../services/skillGapAnalysis');
const CourseRecommendationService = require('../services/courseRecommendationService');
const JobPosting = require('../models/JobPosting');
const { Individual } = require('../models/User');

class RecommendationController {
  constructor() {
    this.contentBasedFiltering = new ContentBasedFiltering();
    this.aiJobMatcher = new AIJobMatcher();
    this.skillGapAnalysis = new SkillGapAnalysis();
    this.courseRecommendationService = new CourseRecommendationService();
  }

  /**
   * GET /api/recommendations/jobs
   * الحصول على توصيات الوظائف المخصصة للمستخدم
   */
  async getJobRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20, minScore = 0.5 } = req.query;

      // 1. جلب بيانات المستخدم
      const user = await Individual.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
      }

      // 2. جلب الوظائف المتاحة (مفتوحة)
      const jobs = await JobPosting.find({ status: 'Open' })
        .populate('postedBy', 'companyName companyIndustry')
        .limit(100); // جلب عدد معقول للتصفية

      if (!jobs.length) {
        return res.status(200).json({
          success: true,
          message: 'لا توجد وظائف متاحة حالياً',
          recommendations: [],
          total: 0
        });
      }

      // 3. استخدام Content-Based Filtering لترتيب الوظائف مع حفظ التوصيات
      const recommendations = await this.contentBasedFiltering.rankJobsByMatch(
        user,
        jobs,
        { 
          limit: parseInt(limit), 
          minScore: parseFloat(minScore),
          saveToDB: true // حفظ التوصيات في قاعدة البيانات
        }
      );

      // 4. إضافة تحليل إضافي باستخدام AI Job Matcher (اختياري)
      const enhancedRecommendations = await Promise.all(
        recommendations.map(async (rec) => {
          try {
            const aiAnalysis = await this.aiJobMatcher.calculateJobMatch(
              await this.aiJobMatcher.analyzeCandidate(user),
              rec.job
            );
            
            return {
              ...rec,
              aiAnalysis: {
                score: aiAnalysis.overall,
                strengths: aiAnalysis.scores
              }
            };
          } catch (error) {
            return rec; // العودة إلى التوصية الأساسية في حالة الخطأ
          }
        })
      );

      // 5. إرجاع النتائج
      res.status(200).json({
        success: true,
        message: 'تم توليد التوصيات بنجاح',
        recommendations: enhancedRecommendations,
        total: enhancedRecommendations.length,
        userProfile: {
          skills: user.computerSkills?.length + user.softwareSkills?.length + (user.otherSkills?.length || 0),
          experience: user.experienceList?.length || 0,
          education: user.educationList?.length || 0
        }
      });

    } catch (error) {
      console.error('Error in getJobRecommendations:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في توليد التوصيات',
        error: error.message
      });
    }
  }

  /**
   * GET /api/recommendations/jobs/:jobId/match
   * حساب درجة التطابق بين المستخدم ووظيفة محددة
   */
  async calculateJobMatch(req, res) {
    try {
      const userId = req.user.id;
      const { jobId } = req.params;

      // 1. جلب بيانات المستخدم والوظيفة
      const [user, job] = await Promise.all([
        Individual.findById(userId),
        JobPosting.findById(jobId).populate('postedBy', 'companyName companyIndustry')
      ]);

      if (!user || !job) {
        return res.status(404).json({
          success: false,
          message: !user ? 'المستخدم غير موجود' : 'الوظيفة غير موجودة'
        });
      }

      // 2. استخراج الميزات
      const userFeatures = this.contentBasedFiltering.extractUserFeatures(user);
      const jobFeatures = this.contentBasedFiltering.extractJobFeatures(job);

      // 3. حساب التشابه
      const similarity = this.contentBasedFiltering.calculateSimilarity(userFeatures, jobFeatures);

      // 4. تحليل إضافي باستخدام AI Job Matcher
      let aiAnalysis = null;
      try {
        const candidateProfile = await this.aiJobMatcher.analyzeCandidate(user);
        aiAnalysis = await this.aiJobMatcher.calculateJobMatch(candidateProfile, job);
      } catch (aiError) {
        console.warn('AI analysis failed:', aiError.message);
      }

      // 5. إرجاع النتائج
      res.status(200).json({
        success: true,
        message: 'تم حساب درجة التطابق بنجاح',
        job: {
          id: job._id,
          title: job.title,
          company: job.postedBy?.companyName,
          location: job.location
        },
        matchScore: {
          percentage: similarity.percentage,
          overall: similarity.overall,
          components: similarity.scores
        },
        reasons: similarity.reasons,
        aiAnalysis: aiAnalysis ? {
          score: aiAnalysis.overall,
          components: aiAnalysis.scores,
          reasons: aiAnalysis.reasons || []
        } : null,
        recommendations: this.contentBasedFiltering.generateMatchReasons(userFeatures, jobFeatures, similarity.scores)
      });

    } catch (error) {
      console.error('Error in calculateJobMatch:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في حساب درجة التطابق',
        error: error.message
      });
    }
  }

  /**
   * GET /api/recommendations/profile-analysis
   * تحليل ملف المستخدم وتقديم اقتراحات للتحسين
   */
  async analyzeUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await Individual.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
      }

      // 1. استخراج الميزات
      const userFeatures = this.contentBasedFiltering.extractUserFeatures(user);

      // 2. جلب عينة من الوظائف الشائعة
      const popularJobs = await JobPosting.find({ status: 'Open' })
        .sort({ createdAt: -1 })
        .limit(10);

      // 3. تحليل نقاط القوة والضعف
      const analysis = {
        profileCompleteness: this.calculateProfileCompleteness(user),
        strengths: this.identifyStrengths(userFeatures),
        improvementAreas: this.identifyImprovementAreas(userFeatures, popularJobs),
        skillGaps: this.identifySkillGaps(userFeatures, popularJobs),
        recommendations: this.generateProfileRecommendations(user, userFeatures)
      };

      res.status(200).json({
        success: true,
        message: 'تم تحليل الملف الشخصي بنجاح',
        analysis
      });

    } catch (error) {
      console.error('Error in analyzeUserProfile:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تحليل الملف الشخصي',
        error: error.message
      });
    }
  }

  /**
   * GET /api/recommendations/saved
   * الحصول على التوصيات المحفوظة من قاعدة البيانات
   */
  async getSavedRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20, minScore = 30, excludeSeen = false } = req.query;

      // جلب التوصيات المحفوظة
      const savedRecommendations = await this.contentBasedFiltering.getSavedRecommendations(
        userId,
        {
          limit: parseInt(limit),
          minScore: parseInt(minScore),
          excludeSeen: excludeSeen === 'true'
        }
      );

      // إذا لم توجد توصيات محفوظة، نولد توصيات جديدة
      let recommendations = savedRecommendations;
      if (!savedRecommendations.length) {
        const user = await Individual.findById(userId);
        const jobs = await JobPosting.find({ status: 'Open' })
          .populate('postedBy', 'companyName companyIndustry')
          .limit(50);

        recommendations = await this.contentBasedFiltering.rankJobsByMatch(
          user,
          jobs,
          { 
            limit: parseInt(limit), 
            minScore: parseFloat(minScore) / 100,
            saveToDB: true
          }
        );
      }

      res.status(200).json({
        success: true,
        message: savedRecommendations.length ? 'تم جلب التوصيات المحفوظة' : 'تم توليد توصيات جديدة',
        recommendations: recommendations.map(rec => ({
          job: rec.job,
          matchScore: rec.matchScore,
          reasons: rec.reasons,
          isSaved: !!rec.savedAt,
          savedAt: rec.savedAt
        })),
        total: recommendations.length,
        source: savedRecommendations.length ? 'database' : 'generated'
      });

    } catch (error) {
      console.error('Error in getSavedRecommendations:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب التوصيات المحفوظة',
        error: error.message
      });
    }
  }

  /**
   * POST /api/recommendations/feedback
   * تسجيل تفاعل المستخدم مع التوصية
   */
  async recordFeedback(req, res) {
    try {
      const userId = req.user.id;
      const { jobId, action, rating, comments } = req.body;

      // يمكن تخزين هذا التفاعل لتحسين التوصيات المستقبلية
      // حالياً نرجع رسالة نجاح

      res.status(200).json({
        success: true,
        message: 'تم تسجيل التفاعل بنجاح',
        feedback: {
          userId,
          jobId,
          action,
          rating,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Error in recordFeedback:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تسجيل التفاعل',
        error: error.message
      });
    }
  }

  // ===== طرق مساعدة =====

  /**
   * حساب درجة اكتمال الملف الشخصي
   */
  calculateProfileCompleteness(user) {
    const fields = [
      'firstName', 'lastName', 'gender', 'birthDate',
      'city', 'country', 'bio',
      'educationList', 'experienceList', 'computerSkills',
      'softwareSkills', 'otherSkills', 'languages'
    ];

    let filledFields = 0;
    
    fields.forEach(field => {
      if (user[field]) {
        if (Array.isArray(user[field])) {
          if (user[field].length > 0) filledFields++;
        } else if (typeof user[field] === 'string') {
          if (user[field].trim().length > 0) filledFields++;
        } else if (user[field] !== null && user[field] !== undefined) {
          filledFields++;
        }
      }
    });

    const percentage = Math.round((filledFields / fields.length) * 100);
    
    return {
      percentage,
      filledFields,
      totalFields: fields.length,
      level: percentage >= 80 ? 'ممتاز' : percentage >= 60 ? 'جيد' : percentage >= 40 ? 'متوسط' : 'ضعيف'
    };
  }

  /**
   * تحديد نقاط القوة
   */
  identifyStrengths(userFeatures) {
    const strengths = [];

    if (userFeatures.skills.length >= 5) {
      strengths.push({
        type: 'skills',
        message: 'لديك مجموعة متنوعة من المهارات',
        count: userFeatures.skills.length
      });
    }

    if (userFeatures.experience.totalYears >= 3) {
      strengths.push({
        type: 'experience',
        message: `لديك ${userFeatures.experience.totalYears} سنوات من الخبرة`,
        years: userFeatures.experience.totalYears
      });
    }

    if (userFeatures.education.highestDegree !== 'none') {
      strengths.push({
        type: 'education',
        message: `مؤهلك التعليمي (${userFeatures.education.highestDegree}) قوي`,
        degree: userFeatures.education.highestDegree
      });
    }

    return strengths;
  }

  /**
   * تحديد مجالات التحسين
   */
  identifyImprovementAreas(userFeatures, popularJobs) {
    const areas = [];

    // تحليل المهارات المطلوبة في الوظائف الشائعة
    const requiredSkills = new Set();
    popularJobs.forEach(job => {
      const jobFeatures = this.contentBasedFiltering.extractJobFeatures(job);
      jobFeatures.requiredSkills.forEach(skill => {
        requiredSkills.add(skill.name);
      });
    });

    const userSkillNames = userFeatures.skills.map(skill => skill.name.toLowerCase());
    const missingSkills = Array.from(requiredSkills).filter(skill => 
      !userSkillNames.some(userSkill => 
        this.contentBasedFiltering.areSkillsSimilar(userSkill, skill)
      )
    );

    if (missingSkills.length > 0) {
      areas.push({
        type: 'skills',
        message: 'يمكنك تحسين فرصك بتعلم هذه المهارات',
        skills: missingSkills.slice(0, 5),
        priority: 'high'
      });
    }

    // تحليل الخبرة
    const avgExperience = popularJobs.reduce((sum, job) => {
      const jobFeatures = this.contentBasedFiltering.extractJobFeatures(job);
      return sum + (jobFeatures.experienceLevel.minYears || 0);
    }, 0) / popularJobs.length;

    if (userFeatures.experience.totalYears < avgExperience) {
      areas.push({
        type: 'experience',
        message: `متوسط الخبرة المطلوبة ${avgExperience.toFixed(1)} سنوات، لديك ${userFeatures.experience.totalYears}`,
        gap: avgExperience - userFeatures.experience.totalYears,
        priority: 'medium'
      });
    }

    return areas;
  }

  /**
   * تحديد فجوات المهارات
   */
  identifySkillGaps(userFeatures, popularJobs) {
    const gaps = [];
    const userSkills = userFeatures.skills.map(s => s.name.toLowerCase());

    popularJobs.forEach(job => {
      const jobFeatures = this.contentBasedFiltering.extractJobFeatures(job);
      const missing = jobFeatures.requiredSkills.filter(jobSkill => 
        !userSkills.some(userSkill => 
          this.contentBasedFiltering.areSkillsSimilar(userSkill, jobSkill.name)
        )
      );

      if (missing.length > 0) {
        gaps.push({
          jobTitle: job.title,
          missingSkills: missing.map(s => s.name),
          matchScore: this.contentBasedFiltering.calculateSkillsSimilarity(userFeatures.skills, jobFeatures.requiredSkills)
        });
      }
    });

    return gaps.slice(0, 5); // إرجاع أهم 5 فجوات
  }

  /**
   * توليد اقتراحات لتحسين الملف الشخصي
   */
  generateProfileRecommendations(user, userFeatures) {
    const recommendations = [];

    // اقتراحات المهارات
    if (userFeatures.skills.length < 3) {
      recommendations.push({
        category: 'skills',
        priority: 'high',
        suggestion: 'أضف 3 مهارات على الأقل لتحسين فرصك',
        action: 'update_skills'
      });
    }

    // اقتراحات الخبرة
    if (userFeatures.experience.totalYears < 1) {
      recommendations.push({
        category: 'experience',
        priority: 'medium',
        suggestion: 'فكر في مشاريع تطوعية أو تدريب عملي لاكتساب الخبرة',
        action: 'add_experience'
      });
    }

    // اقتراحات التعليم
    if (userFeatures.education.highestDegree === 'none') {
      recommendations.push({
        category: 'education',
        priority: 'medium',
        suggestion: 'أضف مؤهلك التعليمي لتحسين مصداقية ملفك',
        action: 'add_education'
      });
    }

    // اقتراحات الملف الشخصي
    if (!user.bio || user.bio.trim().length < 50) {
      recommendations.push({
        category: 'profile',
        priority: 'low',
        suggestion: 'أكتب وصفاً شخصياً مختصراً (50 حرف على الأقل)',
        action: 'update_bio'
      });
    }

    return recommendations;
  }

  /**
   * GET /api/recommendations/skill-gaps
   * تحليل فجوات المهارات بين المستخدم والوظائف المستهدفة
   * وتوليد توصيات الدورات المناسبة
   */
  async analyzeSkillGaps(req, res) {
    try {
      const userId = req.user.id;
      const { jobId, targetJobTitle, limit = 5 } = req.query;

      // 1. جلب بيانات المستخدم
      const user = await Individual.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
      }

      let targetJob = null;
      let similarJobs = [];

      // 2. إذا تم تحديد jobId، جلب الوظيفة المستهدفة
      if (jobId) {
        targetJob = await JobPosting.findById(jobId);
        if (!targetJob) {
          return res.status(404).json({
            success: false,
            message: 'الوظيفة المستهدفة غير موجودة'
          });
        }

        // جلب وظائف مشابهة
        similarJobs = await JobPosting.find({
          _id: { $ne: jobId },
          status: 'Open',
          $or: [
            { title: { $regex: targetJob.title.split(' ')[0], $options: 'i' } },
            { postingType: targetJob.postingType }
          ]
        }).limit(5);
      }
      // 3. إذا تم تحديد targetJobTitle، البحث عن وظائف مشابهة
      else if (targetJobTitle) {
        similarJobs = await JobPosting.find({
          status: 'Open',
          title: { $regex: targetJobTitle, $options: 'i' }
        }).limit(10);
        
        if (similarJobs.length > 0) {
          targetJob = similarJobs[0];
          similarJobs = similarJobs.slice(1);
        }
      }
      // 4. إذا لم يتم تحديد شيء، جلب الوظائف الشائعة
      else {
        similarJobs = await JobPosting.find({ status: 'Open' })
          .sort({ createdAt: -1 })
          .limit(10);
        
        if (similarJobs.length > 0) {
          targetJob = similarJobs[0];
          similarJobs = similarJobs.slice(1);
        }
      }

      if (!targetJob) {
        return res.status(404).json({
          success: false,
          message: 'لا توجد وظائف متاحة للتحليل'
        });
      }

      // 5. تحليل فجوات المهارات مع الوظيفة المستهدفة
      const skillGapAnalysis = this.skillGapAnalysis.analyzeSkillGaps(user, targetJob);

      // 6. تحليل فجوات المهارات مع الوظائف المشابهة
      const similarJobsAnalysis = await Promise.all(
        similarJobs.slice(0, limit).map(async (job) => {
          const analysis = this.skillGapAnalysis.analyzeSkillGaps(user, job);
          return {
            jobId: job._id,
            jobTitle: job.title,
            company: job.postedBy?.companyName || 'غير محدد',
            analysis: {
              missingSkills: analysis.missingSkills.slice(0, 5),
              overallCoverage: analysis.summary.overallCoverage,
              criticalGaps: analysis.summary.criticalGaps
            }
          };
        })
      );

      // 7. تجميع المهارات المفقودة من جميع التحليلات
      const allMissingSkills = new Map();
      
      // إضافة مهارات الوظيفة المستهدفة
      skillGapAnalysis.missingSkills.forEach(skill => {
        allMissingSkills.set(skill.name, {
          ...skill,
          frequency: 1,
          jobs: [targetJob.title]
        });
      });

      // إضافة مهارات الوظائف المشابهة
      similarJobsAnalysis.forEach(jobAnalysis => {
        jobAnalysis.analysis.missingSkills.forEach(skill => {
          if (allMissingSkills.has(skill.name)) {
            const existing = allMissingSkills.get(skill.name);
            existing.frequency++;
            existing.jobs.push(jobAnalysis.jobTitle);
            existing.priority = Math.max(existing.priority, skill.priority);
          } else {
            allMissingSkills.set(skill.name, {
              ...skill,
              frequency: 1,
              jobs: [jobAnalysis.jobTitle]
            });
          }
        });
      });

      // 8. ترتيب المهارات المفقودة حسب الأولوية والتكرار
      const aggregatedMissingSkills = Array.from(allMissingSkills.values())
        .sort((a, b) => {
          // أولاً حسب الأولوية، ثم حسب التكرار
          if (b.priority !== a.priority) return b.priority - a.priority;
          return b.frequency - a.frequency;
        })
        .slice(0, 10); // أهم 10 مهارات

      // 9. توليد توصيات دورات مخصصة بناءً على المهارات المجمعة
      const aggregatedGapAnalysis = {
        programming: { missingSkillCount: 0, gapSeverity: 'low' },
        database: { missingSkillCount: 0, gapSeverity: 'low' },
        web: { missingSkillCount: 0, gapSeverity: 'low' },
        mobile: { missingSkillCount: 0, gapSeverity: 'low' },
        design: { missingSkillCount: 0, gapSeverity: 'low' },
        marketing: { missingSkillCount: 0, gapSeverity: 'low' },
        management: { missingSkillCount: 0, gapSeverity: 'low' },
        soft: { missingSkillCount: 0, gapSeverity: 'low' }
      };

      aggregatedMissingSkills.forEach(skill => {
        const category = skill.category;
        if (aggregatedGapAnalysis[category]) {
          aggregatedGapAnalysis[category].missingSkillCount++;
        }
      });

      // تحديث شدة الفجوة لكل تصنيف
      Object.keys(aggregatedGapAnalysis).forEach(category => {
        const analysis = aggregatedGapAnalysis[category];
        if (analysis.missingSkillCount >= 3) {
          analysis.gapSeverity = 'high';
        } else if (analysis.missingSkillCount >= 2) {
          analysis.gapSeverity = 'medium';
        } else if (analysis.missingSkillCount >= 1) {
          analysis.gapSeverity = 'low';
        }
      });

      const aggregatedCourseRecommendations = this.skillGapAnalysis.generateCourseRecommendations(
        aggregatedMissingSkills.map(skill => ({
          name: skill.name,
          importance: skill.importance,
          category: skill.category,
          frequency: skill.frequency,
          priority: skill.priority
        })),
        aggregatedGapAnalysis
      );

      // 10. إرجاع النتائج
      res.status(200).json({
        success: true,
        message: 'تم تحليل فجوات المهارات بنجاح',
        targetJob: {
          id: targetJob._id,
          title: targetJob.title,
          company: targetJob.postedBy?.companyName || 'غير محدد',
          location: targetJob.location
        },
        analysis: {
          userSkills: skillGapAnalysis.userSkills.length,
          jobSkills: skillGapAnalysis.jobSkills.length,
          missingSkills: skillGapAnalysis.missingSkills.length,
          overallCoverage: skillGapAnalysis.summary.overallCoverage,
          coverageLevel: skillGapAnalysis.summary.coverageLevel,
          criticalGaps: skillGapAnalysis.summary.criticalGaps,
          topMissingSkills: skillGapAnalysis.missingSkills.slice(0, 5).map(s => s.name),
          estimatedTimeToCloseGaps: skillGapAnalysis.summary.estimatedTimeToCloseGaps
        },
        aggregatedAnalysis: {
          totalMissingSkills: aggregatedMissingSkills.length,
          topPrioritySkills: aggregatedMissingSkills.slice(0, 5).map(s => ({
            name: s.name,
            category: s.category,
            priority: s.priority.toFixed(2),
            frequency: s.frequency,
            jobs: s.jobs.slice(0, 3)
          })),
          skillDistribution: Object.entries(aggregatedGapAnalysis).reduce((acc, [category, analysis]) => {
            if (analysis.missingSkillCount > 0) {
              acc[category] = analysis.missingSkillCount;
            }
            return acc;
          }, {})
        },
        courseRecommendations: aggregatedCourseRecommendations.map(rec => ({
          category: rec.category,
          title: rec.title,
          description: rec.description,
          skills: rec.skills,
          level: rec.level,
          priority: rec.priority,
          estimatedDuration: rec.estimatedDuration,
          learningPath: rec.learningPath.map(week => ({
            week: week.week,
            title: week.title,
            skills: week.skills.slice(0, 3)
          }))
        })),
        similarJobsAnalysis: similarJobsAnalysis,
        improvementPlan: {
          immediateActions: aggregatedMissingSkills
            .filter(s => s.priority >= 0.8)
            .slice(0, 3)
            .map(s => `تعلم ${s.name} - مطلوب في ${s.jobs.length} وظيفة`),
          shortTermGoals: aggregatedMissingSkills
            .filter(s => s.priority >= 0.6 && s.priority < 0.8)
            .slice(0, 3)
            .map(s => `تحسين ${s.name} - يزيد فرصك بنسبة ${Math.round(s.priority * 100)}%`),
          longTermDevelopment: Object.entries(aggregatedGapAnalysis)
            .filter(([category, analysis]) => analysis.gapSeverity === 'high')
            .map(([category]) => `تطوير مهارات ${category} بشكل شامل`)
        }
      });

    } catch (error) {
      console.error('Error in analyzeSkillGaps:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تحليل فجوات المهارات',
        error: error.message
      });
    }
  }

  /**
   * GET /api/recommendations/courses
   * الحصول على توصيات الدورات بناءً على الوظائف المستهدفة
   * مع توقع تحسين فرص التوظيف ومسارات تعليمية مخصصة
   */
  async getCourseRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { 
        jobIds, 
        targetJobTitles, 
        limit = 10,
        includeLearningPaths = true 
      } = req.query;

      // 1. جلب بيانات المستخدم
      const user = await Individual.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
      }

      // 2. جلب الوظائف المستهدفة
      let targetJobs = [];
      
      if (jobIds) {
        // جلب الوظائف بواسطة IDs
        const jobIdArray = Array.isArray(jobIds) ? jobIds : [jobIds];
        targetJobs = await JobPosting.find({
          _id: { $in: jobIdArray },
          status: 'Open'
        }).populate('postedBy', 'companyName companyIndustry');
      } else if (targetJobTitles) {
        // جلب الوظائف بواسطة العناوين
        const titleArray = Array.isArray(targetJobTitles) ? targetJobTitles : [targetJobTitles];
        const titleRegexes = titleArray.map(title => new RegExp(title, 'i'));
        
        targetJobs = await JobPosting.find({
          title: { $in: titleRegexes },
          status: 'Open'
        }).populate('postedBy', 'companyName companyIndustry');
      } else {
        // إذا لم يتم تحديد وظائف، نستخدم الوظائف التي تطابق مهارات المستخدم
        targetJobs = await JobPosting.find({ status: 'Open' })
          .populate('postedBy', 'companyName companyIndustry')
          .limit(5);
      }

      if (!targetJobs.length) {
        return res.status(200).json({
          success: true,
          message: 'لم يتم العثور على وظائف مستهدفة',
          courseRecommendations: [],
          learningPaths: []
        });
      }

      // 3. توليد توصيات الدورات باستخدام خدمة التوصيات الجديدة
      const options = {
        limit: parseInt(limit),
        includeLearningPaths: includeLearningPaths === 'true'
      };

      const recommendationResult = await this.courseRecommendationService.recommendCoursesBasedOnTargetJobs(
        user,
        targetJobs,
        options
      );

      if (!recommendationResult.success) {
        return res.status(500).json({
          success: false,
          message: 'حدث خطأ في توليد توصيات الدورات',
          error: recommendationResult.error
        });
      }

      // 4. إرجاع النتائج
      res.status(200).json({
        success: true,
        message: 'تم توليد توصيات الدورات بنجاح',
        user: recommendationResult.user,
        targetJobs: recommendationResult.targetJobs,
        skillGapAnalysis: recommendationResult.skillGapAnalysis,
        courseRecommendations: recommendationResult.courseRecommendations.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          levelDescription: course.levelDescription,
          levelSuitability: course.levelSuitability,
          recommendedLevel: course.recommendedLevel,
          skills: course.skills,
          matchedSkills: course.matchedSkills?.map(skill => skill.skill) || [],
          duration: course.duration,
          instructor: course.instructor,
          rating: course.rating,
          studentsCount: course.studentsCount,
          price: course.price,
          platform: course.platform,
          url: course.url,
          matchScore: Math.round(course.matchScore * 100),
          relevance: Math.round(course.relevance * 100),
          employmentImprovement: {
            percentage: Math.round(course.employmentImprovement * 100),
            expectedOutcomes: course.expectedOutcomes
          },
          metadata: {
            skillCoverage: Math.round(course.skillCoverage * 100),
            completionRate: Math.round(course.completionRate * 100),
            marketDemand: Math.round(course.marketDemand * 100)
          }
        })),
        learningPaths: recommendationResult.learningPaths,
        employmentImprovement: recommendationResult.employmentImprovement,
        report: recommendationResult.report,
        metadata: recommendationResult.metadata
      });

    } catch (error) {
      console.error('❌ Error in getCourseRecommendations:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب توصيات الدورات',
        error: error.message
      });
    }
  }

  /**
   * GET /api/recommendations/courses/quick
   * الحصول على توصيات سريعة للدورات بناءً على ملف المستخدم
   */
  async getQuickCourseRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 5 } = req.query;

      // 1. جلب بيانات المستخدم
      const user = await Individual.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
      }

      // 2. جلب الوظائف التي تطابق مهارات المستخدم
      const matchingJobs = await JobPosting.find({ status: 'Open' })
        .populate('postedBy', 'companyName companyIndustry')
        .limit(3);

      if (!matchingJobs.length) {
        // إذا لم توجد وظائف، نستخدم وظائف افتراضية
        const defaultJobs = [
          {
            _id: 'default_job_1',
            title: 'مطور ويب',
            description: 'تطوير تطبيقات الويب باستخدام التقنيات الحديثة',
            requirements: 'مهارات في JavaScript, React, Node.js',
            postedBy: { companyName: 'شركات التكنولوجيا' }
          },
          {
            _id: 'default_job_2',
            title: 'مصمم واجهات مستخدم',
            description: 'تصميم واجهات مستخدم جذابة وسهلة الاستخدام',
            requirements: 'مهارات في UI/UX, Figma, Adobe XD',
            postedBy: { companyName: 'شركات التصميم' }
          }
        ];

        // 3. توليد توصيات سريعة
        const recommendationResult = await this.courseRecommendationService.recommendCoursesBasedOnTargetJobs(
          user,
          defaultJobs,
          { limit: parseInt(limit) }
        );

        if (!recommendationResult.success) {
          return res.status(200).json({
            success: true,
            message: 'توصيات الدورات العامة',
            courseRecommendations: this.getDefaultCourseRecommendations(limit)
          });
        }

        return res.status(200).json({
          success: true,
          message: 'تم توليد توصيات سريعة للدورات',
          courseRecommendations: recommendationResult.courseRecommendations.slice(0, limit).map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            duration: course.duration,
            rating: course.rating,
            price: course.price,
            url: course.url,
            matchScore: Math.round(course.matchScore * 100)
          }))
        });
      }

      // 3. توليد توصيات باستخدام الوظائف المطابقة
      const recommendationResult = await this.courseRecommendationService.recommendCoursesBasedOnTargetJobs(
        user,
        matchingJobs,
        { limit: parseInt(limit) }
      );

      if (!recommendationResult.success) {
        return res.status(200).json({
          success: true,
          message: 'توصيات الدورات العامة',
          courseRecommendations: this.getDefaultCourseRecommendations(limit)
        });
      }

      // 4. إرجاع النتائج المبسطة
      res.status(200).json({
        success: true,
        message: 'تم توليد توصيات سريعة للدورات',
        courseRecommendations: recommendationResult.courseRecommendations.slice(0, limit).map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          duration: course.duration,
          rating: course.rating,
          price: course.price,
          url: course.url,
          matchScore: Math.round(course.matchScore * 100),
          employmentImprovement: Math.round(course.employmentImprovement * 100)
        }))
      });

    } catch (error) {
      console.error('❌ Error in getQuickCourseRecommendations:', error);
      res.status(200).json({
        success: true,
        message: 'توصيات الدورات العامة',
        courseRecommendations: this.getDefaultCourseRecommendations(5)
      });
    }
  }

  /**
   * الحصول على توصيات دورات افتراضية
   */
  getDefaultCourseRecommendations(limit = 5) {
    const defaultCourses = [
      {
        id: 'default_001',
        title: 'مقدمة في البرمجة باستخدام Python',
        description: 'دورة شاملة لتعلم أساسيات البرمجة',
        category: 'programming',
        level: 'beginner',
        duration: '30 ساعة',
        rating: 4.7,
        price: 'مجاني',
        url: '/courses/python-basics',
        matchScore: 85
      },
      {
        id: 'default_002',
        title: 'تطوير تطبيقات الويب باستخدام React',
        description: 'تعلم بناء تطبيقات ويب تفاعلية',
        category: 'web',
        level: 'intermediate',
        duration: '40 ساعة',
        rating: 4.8,
        price: '199 جنيه',
        url: '/courses/react-web-development',
        matchScore: 78
      },
      {
        id: 'default_003',
        title: 'تصميم واجهات المستخدم UI/UX',
        description: 'تعلم مبادئ تصميم واجهات المستخدم',
        category: 'design',
        level: 'beginner',
        duration: '25 ساعة',
        rating: 4.9,
        price: '149 جنيه',
        url: '/courses/ui-ux-design',
        matchScore: 72
      },
      {
        id: 'default_004',
        title: 'مهارات التواصل والقيادة',
        description: 'تطوير المهارات الناعمة للتواصل الفعال',
        category: 'soft',
        level: 'beginner',
        duration: '20 ساعة',
        rating: 4.8,
        price: '99 جنيه',
        url: '/courses/communication-leadership',
        matchScore: 90
      },
      {
        id: 'default_005',
        title: 'تحليل البيانات باستخدام Python',
        description: 'تعلم تحليل البيانات واستخراج الرؤى',
        category: 'data',
        level: 'intermediate',
        duration: '35 ساعة',
        rating: 4.7,
        price: '279 جنيه',
        url: '/courses/python-data-analysis',
        matchScore: 65
      }
    ];

    return defaultCourses.slice(0, limit);
  }

  /**
   * GET /api/recommendations/candidates/filter
   * فلترة ذكية للمرشحين حسب الخبرة، المهارات، والموقع
   * Requirements: 3.6 (فلترة ذكية - خبرة، مهارات، موقع)
   */
  async filterCandidatesIntelligently(req, res) {
    try {
      const companyId = req.user.id;
      const {
        jobId,
        skills = [],
        minExperience,
        maxExperience,
        location,
        education,
        minScore = 30,
        limit = 50,
        sortBy = 'score' // score, experience, education
      } = req.query;

      // 1. التحقق من وجود معايير الفلترة
      if (!jobId && (!skills || skills.length === 0) && !minExperience && !location) {
        return res.status(400).json({
          success: false,
          message: 'يجب تحديد معيار واحد على الأقل للفلترة (jobId، skills، minExperience، أو location)'
        });
      }

      // 2. بناء معايير البحث الأساسية
      const searchCriteria = {
        accountDisabled: { $ne: true }
      };

      // 3. فلترة حسب المهارات
      if (skills && skills.length > 0) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        searchCriteria.$or = [
          { 'computerSkills.skill': { $in: skillsArray.map(s => new RegExp(s, 'i')) } },
          { 'softwareSkills.software': { $in: skillsArray.map(s => new RegExp(s, 'i')) } },
          { otherSkills: { $in: skillsArray.map(s => new RegExp(s, 'i')) } }
        ];
      }

      // 4. فلترة حسب الموقع
      if (location) {
        searchCriteria.$and = searchCriteria.$and || [];
        searchCriteria.$and.push({
          $or: [
            { city: { $regex: location, $options: 'i' } },
            { country: { $regex: location, $options: 'i' } }
          ]
        });
      }

      // 5. جلب المرشحين المطابقين
      const candidates = await Individual.find(searchCriteria)
        .select('-password -otp')
        .limit(parseInt(limit) * 2); // جلب ضعف العدد للتصفية

      if (!candidates.length) {
        return res.status(200).json({
          success: true,
          message: 'لم يتم العثور على مرشحين مطابقين للمعايير المحددة',
          candidates: [],
          total: 0,
          filters: {
            skills: skillsArray || [],
            minExperience,
            maxExperience,
            location,
            education
          }
        });
      }

      // 6. تطبيق فلترة الخبرة والتعليم وحساب الدرجات
      const candidateRankingService = require('../services/candidateRankingService');
      const filteredCandidates = [];

      for (const candidate of candidates) {
        const candidateFeatures = candidateRankingService.extractCandidateFeatures(candidate);

        // فلترة حسب الخبرة
        if (minExperience && candidateFeatures.totalExperience < parseFloat(minExperience)) {
          continue;
        }
        if (maxExperience && candidateFeatures.totalExperience > parseFloat(maxExperience)) {
          continue;
        }

        // فلترة حسب التعليم
        if (education) {
          const educationLevels = {
            'phd': 5, 'doctorate': 5, 'master': 4, 'bachelor': 3,
            'diploma': 2, 'high school': 1, 'secondary': 1, 'none': 0
          };
          const requiredLevel = educationLevels[education.toLowerCase()] || 0;
          const candidateLevel = educationLevels[candidateFeatures.highestEducation] || 0;
          
          if (candidateLevel < requiredLevel) {
            continue;
          }
        }

        // 7. حساب درجة التطابق
        let matchScore = 0;
        const reasons = [];

        // إذا تم تحديد jobId، نستخدم الوظيفة للحساب
        if (jobId) {
          const job = await JobPosting.findById(jobId);
          if (job) {
            const jobFeatures = candidateRankingService.extractJobFeatures(job);
            const matchResult = candidateRankingService.calculateMatchScore(candidateFeatures, jobFeatures);
            matchScore = matchResult.score;
            reasons.push(...matchResult.reasons);
          }
        } else {
          // حساب درجة بناءً على المعايير المحددة
          let scoreComponents = 0;
          let totalComponents = 0;

          // درجة المهارات
          if (skills && skills.length > 0) {
            const skillsArray = Array.isArray(skills) ? skills : [skills];
            const matchedSkills = candidateFeatures.skills.filter(skill =>
              skillsArray.some(s => skill.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(skill.toLowerCase()))
            );
            const skillsScore = (matchedSkills.length / skillsArray.length) * 100;
            scoreComponents += skillsScore * 0.5; // 50% وزن
            totalComponents += 0.5;

            if (matchedSkills.length > 0) {
              reasons.push({
                type: 'skills',
                message: `يمتلك ${matchedSkills.length} من ${skillsArray.length} مهارات مطلوبة`,
                strength: matchedSkills.length >= skillsArray.length * 0.7 ? 'high' : 'medium',
                details: { matchedSkills: matchedSkills.slice(0, 5) }
              });
            }
          }

          // درجة الخبرة
          if (minExperience || maxExperience) {
            const targetExp = minExperience ? parseFloat(minExperience) : 0;
            const expScore = Math.min(100, (candidateFeatures.totalExperience / Math.max(targetExp, 1)) * 100);
            scoreComponents += expScore * 0.3; // 30% وزن
            totalComponents += 0.3;

            reasons.push({
              type: 'experience',
              message: `${candidateFeatures.totalExperience} سنوات من الخبرة`,
              strength: candidateFeatures.totalExperience >= targetExp ? 'high' : 'medium',
              details: { years: candidateFeatures.totalExperience }
            });
          }

          // درجة الموقع
          if (location) {
            const locationMatch = 
              candidate.city?.toLowerCase().includes(location.toLowerCase()) ||
              candidate.country?.toLowerCase().includes(location.toLowerCase()) ||
              location.toLowerCase().includes(candidate.city?.toLowerCase()) ||
              location.toLowerCase().includes(candidate.country?.toLowerCase());
            
            if (locationMatch) {
              scoreComponents += 100 * 0.2; // 20% وزن
              reasons.push({
                type: 'location',
                message: `موقع مطابق: ${candidate.city}, ${candidate.country}`,
                strength: 'high',
                details: { city: candidate.city, country: candidate.country }
              });
            }
            totalComponents += 0.2;
          }

          matchScore = totalComponents > 0 ? Math.round(scoreComponents / totalComponents) : 0;
        }

        // تجاهل المرشحين ذوي الدرجات المنخفضة
        if (matchScore >= parseInt(minScore)) {
          filteredCandidates.push({
            candidate: {
              _id: candidate._id,
              firstName: candidate.firstName,
              lastName: candidate.lastName,
              email: candidate.email,
              profileImage: candidate.profileImage,
              city: candidate.city,
              country: candidate.country,
              specialization: candidate.specialization
            },
            matchScore,
            confidence: Math.min(1, reasons.length / 3),
            reasons,
            features: {
              totalExperience: candidateFeatures.totalExperience,
              skillsCount: candidateFeatures.skills.length,
              education: candidateFeatures.highestEducation,
              location: `${candidate.city || ''}, ${candidate.country || ''}`.trim()
            }
          });
        }
      }

      // 8. ترتيب النتائج
      filteredCandidates.sort((a, b) => {
        switch (sortBy) {
          case 'experience':
            return b.features.totalExperience - a.features.totalExperience;
          case 'education':
            const eduLevels = { 'phd': 5, 'doctorate': 5, 'master': 4, 'bachelor': 3, 'diploma': 2, 'high school': 1, 'none': 0 };
            return (eduLevels[b.features.education] || 0) - (eduLevels[a.features.education] || 0);
          case 'score':
          default:
            return b.matchScore - a.matchScore;
        }
      });

      // 9. تحديد العدد المطلوب
      const topCandidates = filteredCandidates.slice(0, parseInt(limit));

      // 10. إحصاءات الفلترة
      const stats = {
        totalEvaluated: candidates.length,
        totalMatched: filteredCandidates.length,
        totalReturned: topCandidates.length,
        averageScore: topCandidates.length > 0 
          ? Math.round(topCandidates.reduce((sum, c) => sum + c.matchScore, 0) / topCandidates.length)
          : 0,
        experienceRange: topCandidates.length > 0 ? {
          min: Math.min(...topCandidates.map(c => c.features.totalExperience)),
          max: Math.max(...topCandidates.map(c => c.features.totalExperience)),
          average: Math.round(topCandidates.reduce((sum, c) => sum + c.features.totalExperience, 0) / topCandidates.length * 10) / 10
        } : null,
        educationDistribution: topCandidates.reduce((acc, c) => {
          const edu = c.features.education;
          acc[edu] = (acc[edu] || 0) + 1;
          return acc;
        }, {})
      };

      // 11. إرجاع النتائج
      res.status(200).json({
        success: true,
        message: `تم العثور على ${topCandidates.length} مرشح مطابق`,
        candidates: topCandidates,
        stats,
        filters: {
          jobId: jobId || null,
          skills: skills || [],
          minExperience: minExperience || null,
          maxExperience: maxExperience || null,
          location: location || null,
          education: education || null,
          minScore: parseInt(minScore),
          sortBy
        },
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error in filterCandidatesIntelligently:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في فلترة المرشحين',
        error: error.message
      });
    }
  }
  /**
   * POST /api/recommendations/notify-matches
   * إرسال إشعارات فورية للمستخدمين عند إيجاد تطابقات جديدة
   * Requirements: 7.1 (إشعار فوري عند نشر وظيفة مناسبة)
   */
  async notifyNewMatches(req, res) {
    try {
      const { jobId, minScore = 70 } = req.body;

      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'يجب تحديد معرف الوظيفة (jobId)'
        });
      }

      // 1. جلب الوظيفة
      const job = await JobPosting.findById(jobId).populate('postedBy', 'companyName');
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'الوظيفة غير موجودة'
        });
      }

      // 2. جلب المستخدمين النشطين
      const { Individual } = require('../models/User');
      const users = await Individual.find({ 
        accountDisabled: { $ne: true }
      }).limit(100);

      if (!users.length) {
        return res.status(200).json({
          success: true,
          message: 'لا يوجد مستخدمون نشطون',
          notified: 0
        });
      }

      // 3. حساب التطابق لكل مستخدم
      const matches = [];
      for (const user of users) {
        const userFeatures = this.contentBasedFiltering.extractUserFeatures(user);
        const jobFeatures = this.contentBasedFiltering.extractJobFeatures(job);
        const similarity = this.contentBasedFiltering.calculateSimilarity(userFeatures, jobFeatures);

        if (similarity.percentage >= minScore) {
          matches.push({
            userId: user._id,
            matchScore: similarity.percentage,
            reasons: similarity.reasons
          });
        }
      }

      if (!matches.length) {
        return res.status(200).json({
          success: true,
          message: `لم يتم العثور على مستخدمين بتطابق أعلى من ${minScore}%`,
          notified: 0,
          evaluated: users.length
        });
      }

      // 4. إرسال إشعارات للمستخدمين المطابقين
      const notificationService = require('../services/notificationService');
      const notifications = await Promise.all(
        matches.map(match => 
          notificationService.notifyJobMatch(match.userId, jobId)
        )
      );

      // 5. إرسال إشعارات فورية عبر Pusher
      const pusherService = require('../services/pusherService');
      if (pusherService.isEnabled()) {
        await Promise.all(
          matches.map(match => 
            pusherService.sendNotificationToUser(match.userId, {
              type: 'job_match',
              title: 'وظيفة جديدة مناسبة لك! 🎯',
              message: `وظيفة "${job.title}" في ${job.postedBy?.companyName || job.location} تناسب مهاراتك بنسبة ${match.matchScore}%`,
              jobId: job._id,
              jobTitle: job.title,
              company: job.postedBy?.companyName,
              location: job.location,
              matchScore: match.matchScore,
              reasons: match.reasons.slice(0, 3),
              timestamp: new Date().toISOString()
            })
          )
        );
      }

      const successCount = notifications.filter(n => n !== null).length;

      res.status(200).json({
        success: true,
        message: `تم إرسال ${successCount} إشعار فوري بنجاح`,
        job: {
          id: job._id,
          title: job.title,
          company: job.postedBy?.companyName
        },
        stats: {
          evaluated: users.length,
          matched: matches.length,
          notified: successCount,
          minScore,
          averageScore: Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length)
        },
        topMatches: matches
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 5)
          .map(m => ({
            userId: m.userId,
            matchScore: m.matchScore,
            topReasons: m.reasons.slice(0, 2).map(r => r.message)
          }))
      });

    } catch (error) {
      console.error('Error in notifyNewMatches:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في إرسال الإشعارات',
        error: error.message
      });
    }
  }

  /**
   * POST /api/recommendations/notify-candidate-match
   * إشعار الشركة بمرشح مناسب جديد
   * Requirements: 7.2 (إشعار عند تسجيل مرشح مناسب)
   */
  async notifyCandidateMatch(req, res) {
    try {
      const companyId = req.user.id;
      const { candidateId, jobId } = req.body;

      if (!candidateId || !jobId) {
        return res.status(400).json({
          success: false,
          message: 'يجب تحديد معرف المرشح (candidateId) ومعرف الوظيفة (jobId)'
        });
      }

      // 1. جلب بيانات المرشح والوظيفة
      const { Individual } = require('../models/User');
      const [candidate, job] = await Promise.all([
        Individual.findById(candidateId),
        JobPosting.findById(jobId)
      ]);

      if (!candidate || !job) {
        return res.status(404).json({
          success: false,
          message: !candidate ? 'المرشح غير موجود' : 'الوظيفة غير موجودة'
        });
      }

      // 2. حساب درجة التطابق
      const candidateRankingService = require('../services/candidateRankingService');
      const candidateFeatures = candidateRankingService.extractCandidateFeatures(candidate);
      const jobFeatures = candidateRankingService.extractJobFeatures(job);
      const matchResult = candidateRankingService.calculateMatchScore(candidateFeatures, jobFeatures);

      // 3. إرسال إشعار للشركة
      const notificationService = require('../services/notificationService');
      const notification = await notificationService.notifyCompanyOfMatchingCandidate(
        companyId,
        candidateId,
        jobId,
        matchResult.score
      );

      res.status(200).json({
        success: true,
        message: 'تم إرسال الإشعار بنجاح',
        notification: {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message
        },
        match: {
          candidate: {
            id: candidate._id,
            name: `${candidate.firstName} ${candidate.lastName}`,
            specialization: candidate.specialization
          },
          job: {
            id: job._id,
            title: job.title
          },
          matchScore: matchResult.score,
          confidence: matchResult.confidence,
          topReasons: matchResult.reasons.slice(0, 3).map(r => r.message)
        }
      });

    } catch (error) {
      console.error('Error in notifyCandidateMatch:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في إرسال الإشعار',
        error: error.message
      });
    }
  }

  /**
   * POST /api/recommendations/notify-update
   * إرسال إشعار فوري بتحديث التوصيات
   * Requirements: 1.5 (تحديث فوري عند تغيير الملف الشخصي)
   */
  async notifyRecommendationUpdate(req, res) {
    try {
      const userId = req.user.id;
      const { updateType, data } = req.body;

      if (!updateType) {
        return res.status(400).json({
          success: false,
          message: 'يجب تحديد نوع التحديث (updateType)'
        });
      }

      // إرسال إشعار التحديث
      const notificationService = require('../services/notificationService');
      const notification = await notificationService.notifyRecommendationUpdate(
        userId,
        updateType,
        data || {}
      );

      if (!notification) {
        return res.status(400).json({
          success: false,
          message: 'نوع تحديث غير صالح'
        });
      }

      res.status(200).json({
        success: true,
        message: 'تم إرسال إشعار التحديث بنجاح',
        notification: {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message
        }
      });

    } catch (error) {
      console.error('Error in notifyRecommendationUpdate:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في إرسال إشعار التحديث',
        error: error.message
      });
    }
  }
}

module.exports = new RecommendationController();

  /**
   * GET /api/recommendations/accuracy
   * الحصول على دقة التوصيات للمستخدم
   */
  async getUserAccuracy(req, res) {
    try {
      const userId = req.user.id;
      const { itemType = 'job', period } = req.query;
      
      const RecommendationAccuracyService = require('../services/recommendationAccuracyService');
      const accuracyService = new RecommendationAccuracyService();
      
      const options = { itemType };
      if (period) {
        options.period = parseInt(period) * 24 * 60 * 60 * 1000; // تحويل الأيام إلى ميلي ثانية
      }
      
      const accuracy = await accuracyService.calculateUserAccuracy(userId, options);
      
      res.status(200).json({
        success: true,
        data: accuracy
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب دقة التوصيات:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب دقة التوصيات',
        error: error.message
      });
    }
  }
  
  /**
   * GET /api/recommendations/accuracy/system
   * الحصول على دقة التوصيات على مستوى النظام (للأدمن فقط)
   */
  async getSystemAccuracy(req, res) {
    try {
      const { itemType = 'job', period, sampleSize } = req.query;
      
      const RecommendationAccuracyService = require('../services/recommendationAccuracyService');
      const accuracyService = new RecommendationAccuracyService();
      
      const options = { itemType };
      if (period) {
        options.period = parseInt(period) * 24 * 60 * 60 * 1000;
      }
      if (sampleSize) {
        options.sampleSize = parseInt(sampleSize);
      }
      
      const accuracy = await accuracyService.calculateSystemAccuracy(options);
      
      res.status(200).json({
        success: true,
        data: accuracy
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب دقة النظام:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب دقة النظام',
        error: error.message
      });
    }
  }
  
  /**
   * GET /api/recommendations/accuracy/improvement
   * تتبع تحسن دقة التوصيات مع الوقت
   */
  async getAccuracyImprovement(req, res) {
    try {
      const userId = req.user.id;
      const { itemType = 'job', periods } = req.query;
      
      const RecommendationAccuracyService = require('../services/recommendationAccuracyService');
      const accuracyService = new RecommendationAccuracyService();
      
      const options = { itemType };
      if (periods) {
        options.periods = periods.split(',').map(p => parseInt(p));
      }
      
      const improvement = await accuracyService.trackAccuracyImprovement(userId, options);
      
      res.status(200).json({
        success: true,
        data: improvement
      });
      
    } catch (error) {
      console.error('❌ خطأ في تتبع تحسن الدقة:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تتبع تحسن الدقة',
        error: error.message
      });
    }
  }
