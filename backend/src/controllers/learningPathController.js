/**
 * 🎯 Learning Path Controller
 * وحدة تحكم لمسارات التعلم المخصصة
 * 
 * يوفر واجهات API لإنشاء وإدارة مسارات التعلم المخصصة
 * مع تتبع التقدم وتوليد توصيات تالية
 * 
 * المتطلبات: 2.3 (مسار تعليمي مخصص)
 * Task: 9.3 توصيات الدورات
 */

const LearningPathService = require('../services/learningPathService');
const JobPosting = require('../models/JobPosting');
const { Individual } = require('../models/User');

class LearningPathController {
  constructor() {
    this.learningPathService = new LearningPathService();
  }

  /**
   * POST /api/learning-paths/generate
   * توليد مسار تعلم مخصص بناءً على الوظائف المستهدفة
   */
  async generateLearningPath(req, res) {
    try {
      const userId = req.user.id;
      const { jobIds, targetJobTitles, options = {} } = req.body;

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
      
      if (jobIds && jobIds.length > 0) {
        // جلب الوظائف بواسطة IDs
        targetJobs = await JobPosting.find({
          _id: { $in: jobIds },
          status: 'Open'
        }).populate('postedBy', 'companyName companyIndustry');
      } else if (targetJobTitles && targetJobTitles.length > 0) {
        // جلب الوظائف بواسطة العناوين
        const titleRegexes = targetJobTitles.map(title => new RegExp(title, 'i'));
        targetJobs = await JobPosting.find({
          title: { $in: titleRegexes },
          status: 'Open'
        }).populate('postedBy', 'companyName companyIndustry');
      } else {
        // إذا لم يتم تحديد وظائف، نستخدم الوظائف التي تطابق مهارات المستخدم
        targetJobs = await JobPosting.find({ status: 'Open' })
          .populate('postedBy', 'companyName companyIndustry')
          .limit(3);
      }

      if (!targetJobs.length) {
        return res.status(200).json({
          success: true,
          message: 'لم يتم العثور على وظائف مستهدفة',
          learningPath: null,
          analysis: null
        });
      }

      // 3. توليد مسار التعلم
      const generationResult = await this.learningPathService.generatePersonalizedLearningPath(
        user,
        targetJobs,
        options
      );

      if (!generationResult.success) {
        return res.status(500).json({
          success: false,
          message: 'حدث خطأ في توليد مسار التعلم',
          error: generationResult.error
        });
      }

      // 4. حفظ مسار التعلم في قاعدة البيانات
      const saveResult = await this.learningPathService.saveLearningPath(
        userId,
        generationResult.learningPath
      );

      if (!saveResult.success) {
        return res.status(500).json({
          success: false,
          message: 'حدث خطأ في حفظ مسار التعلم',
          error: saveResult.error
        });
      }

      // 5. إرجاع النتائج
      res.status(201).json({
        success: true,
        message: 'تم توليد مسار التعلم بنجاح',
        learningPath: this.formatLearningPath(saveResult.learningPath),
        analysis: generationResult.analysis,
        metadata: {
          generatedAt: new Date().toISOString(),
          targetJobsCount: targetJobs.length,
          totalStages: generationResult.learningPath.stages.length,
          totalCourses: generationResult.learningPath.stages.reduce((sum, stage) => 
            sum + (stage.courses?.length || 0), 0
          )
        }
      });

    } catch (error) {
      console.error('❌ Error in generateLearningPath:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في توليد مسار التعلم',
        error: error.message
      });
    }
  }

  /**
   * GET /api/learning-paths
   * جلب مسارات التعلم للمستخدم
   */
  async getLearningPaths(req, res) {
    try {
      const userId = req.user.id;
      const { 
        status, 
        limit = 20, 
        skip = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const options = {
        status,
        limit: parseInt(limit),
        skip: parseInt(skip),
        sortBy,
        sortOrder
      };

      const result = await this.learningPathService.getUserLearningPaths(userId, options);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'حدث خطأ في جلب مسارات التعلم',
          error: result.error
        });
      }

      res.status(200).json({
        success: true,
        message: 'تم جلب مسارات التعلم بنجاح',
        learningPaths: result.learningPaths.map(path => this.formatLearningPath(path)),
        total: result.total,
        pagination: {
          limit: options.limit,
          skip: options.skip,
          hasMore: result.total > options.skip + options.limit
        }
      });

    } catch (error) {
      console.error('❌ Error in getLearningPaths:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب مسارات التعلم',
        error: error.message
      });
    }
  }

  /**
   * GET /api/learning-paths/active
   * جلب مسار التعلم النشط للمستخدم
   */
  async getActiveLearningPath(req, res) {
    try {
      const userId = req.user.id;

      const result = await this.learningPathService.getUserLearningPaths(userId, {
        status: 'active',
        limit: 1
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'حدث خطأ في جلب مسار التعلم النشط',
          error: result.error
        });
      }

      if (!result.learningPaths.length) {
        return res.status(200).json({
          success: true,
          message: 'لا يوجد مسار تعلم نشط',
          learningPath: null
        });
      }

      res.status(200).json({
        success: true,
        message: 'تم جلب مسار التعلم النشط بنجاح',
        learningPath: this.formatLearningPath(result.learningPaths[0])
      });

    } catch (error) {
      console.error('❌ Error in getActiveLearningPath:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب مسار التعلم النشط',
        error: error.message
      });
    }
  }

  /**
   * GET /api/learning-paths/:pathId
   * جلب تفاصيل مسار تعلم محدد
   */
  async getLearningPathDetails(req, res) {
    try {
      const userId = req.user.id;
      const { pathId } = req.params;

      const result = await this.learningPathService.getUserLearningPaths(userId, {
        _id: pathId,
        limit: 1
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'حدث خطأ في جلب تفاصيل مسار التعلم',
          error: result.error
        });
      }

      if (!result.learningPaths.length) {
        return res.status(404).json({
          success: false,
          message: 'مسار التعلم غير موجود'
        });
      }

      const learningPath = result.learningPaths[0];
      
      // التحقق من أن المستخدم يملك المسار
      if (learningPath.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح بالوصول إلى هذا المسار'
        });
      }

      res.status(200).json({
        success: true,
        message: 'تم جلب تفاصيل مسار التعلم بنجاح',
        learningPath: this.formatLearningPath(learningPath, true) // تفاصيل كاملة
      });

    } catch (error) {
      console.error('❌ Error in getLearningPathDetails:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب تفاصيل مسار التعلم',
        error: error.message
      });
    }
  }

  /**
   * PATCH /api/learning-paths/:pathId/progress
   * تحديث تقدم دورة في مسار التعلم
   */
  async updateCourseProgress(req, res) {
    try {
      const userId = req.user.id;
      const { pathId } = req.params;
      const { stageOrder, courseOrder, status, progress, notes } = req.body;

      // التحقق من البيانات المطلوبة
      if (!stageOrder || !courseOrder || !status) {
        return res.status(400).json({
          success: false,
          message: 'بيانات غير مكتملة. يرجى تحديد stageOrder و courseOrder و status'
        });
      }

      // التحقق من أن المستخدم يملك المسار
      const ownershipCheck = await this.learningPathService.getUserLearningPaths(userId, {
        _id: pathId,
        limit: 1
      });

      if (!ownershipCheck.success || !ownershipCheck.learningPaths.length) {
        return res.status(404).json({
          success: false,
          message: 'مسار التعلم غير موجود أو غير مصرح بالوصول'
        });
      }

      // تحديث التقدم
      const result = await this.learningPathService.updateCourseProgress(
        pathId,
        stageOrder,
        courseOrder,
        { status, progress, notes }
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'حدث خطأ في تحديث تقدم الدورة',
          error: result.error
        });
      }

      res.status(200).json({
        success: true,
        message: 'تم تحديث تقدم الدورة بنجاح',
        learningPath: this.formatLearningPath(result.learningPath),
        updatedCourse: {
          stageOrder,
          courseOrder,
          status,
          progress,
          updatedAt: new Date()
        }
      });

    } catch (error) {
      console.error('❌ Error in updateCourseProgress:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تحديث تقدم الدورة',
        error: error.message
      });
    }
  }

  /**
   * GET /api/learning-paths/:pathId/report
   * توليد تقرير تقدم مسار التعلم
   */
  async generateProgressReport(req, res) {
    try {
      const userId = req.user.id;
      const { pathId } = req.params;

      // التحقق من أن المستخدم يملك المسار
      const ownershipCheck = await this.learningPathService.getUserLearningPaths(userId, {
        _id: pathId,
        limit: 1
      });

      if (!ownershipCheck.success || !ownershipCheck.learningPaths.length) {
        return res.status(404).json({
          success: false,
          message: 'مسار التعلم غير موجود أو غير مصرح بالوصول'
        });
      }

      // توليد التقرير
      const result = await this.learningPathService.generateProgressReport(pathId);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'حدث خطأ في توليد تقرير التقدم',
          error: result.error
        });
      }

      res.status(200).json({
        success: true,
        message: 'تم توليد تقرير التقدم بنجاح',
        report: result.report
      });

    } catch (error) {
      console.error('❌ Error in generateProgressReport:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في توليد تقرير التقدم',
        error: error.message
      });
    }
  }

  /**
   * GET /api/learning-paths/stats
   * جلب إحصاءات مسارات التعلم للمستخدم
   */
  async getLearningStats(req, res) {
    try {
      const userId = req.user.id;

      const result = await this.learningPathService.getUserLearningStats(userId);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'حدث خطأ في جلب إحصاءات مسارات التعلم',
          error: result.error
        });
      }

      res.status(200).json({
        success: true,
        message: 'تم جلب إحصاءات مسارات التعلم بنجاح',
        stats: result.stats
      });

    } catch (error) {
      console.error('❌ Error in getLearningStats:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب إحصاءات مسارات التعلم',
        error: error.message
      });
    }
  }

  /**
   * PATCH /api/learning-paths/:pathId/status
   * تحديث حالة مسار التعلم
   */
  async updatePathStatus(req, res) {
    try {
      const userId = req.user.id;
      const { pathId } = req.params;
      const { status } = req.body;

      if (!status || !['active', 'paused', 'completed', 'abandoned'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'حالة غير صالحة. القيم المسموحة: active, paused, completed, abandoned'
        });
      }

      // التحقق من أن المستخدم يملك المسار
      const ownershipCheck = await this.learningPathService.getUserLearningPaths(userId, {
        _id: pathId,
        limit: 1
      });

      if (!ownershipCheck.success || !ownershipCheck.learningPaths.length) {
        return res.status(404).json({
          success: false,
          message: 'مسار التعلم غير موجود أو غير مصرح بالوصول'
        });
      }

      const learningPath = ownershipCheck.learningPaths[0];
      learningPath.status = status;
      
      if (status === 'completed') {
        learningPath.actualCompletionDate = new Date();
      } else if (status === 'active' && learningPath.actualCompletionDate) {
        learningPath.actualCompletionDate = undefined;
      }

      await learningPath.save();

      res.status(200).json({
        success: true,
        message: `تم تحديث حالة المسار إلى "${status}" بنجاح`,
        learningPath: this.formatLearningPath(learningPath)
      });

    } catch (error) {
      console.error('❌ Error in updatePathStatus:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تحديث حالة المسار',
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/learning-paths/:pathId
   * حذف مسار تعلم
   */
  async deleteLearningPath(req, res) {
    try {
      const userId = req.user.id;
      const { pathId } = req.params;

      // التحقق من أن الم��تخدم يملك المسار
      const ownershipCheck = await this.learningPathService.getUserLearningPaths(userId, {
        _id: pathId,
        limit: 1
      });

      if (!ownershipCheck.success || !ownershipCheck.learningPaths.length) {
        return res.status(404).json({
          success: false,
          message: 'مسار التعلم غير موجود أو غير مصرح بالوصول'
        });
      }

      const learningPath = ownershipCheck.learningPaths[0];
      await learningPath.deleteOne();

      res.status(200).json({
        success: true,
        message: 'تم حذف مسار التعلم بنجاح',
        deletedPath: {
          id: pathId,
          name: learningPath.name,
          deletedAt: new Date()
        }
      });

    } catch (error) {
      console.error('❌ Error in deleteLearningPath:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في حذف ��سار التعلم',
        error: error.message
      });
    }
  }

  // ===== طرق مساعدة =====

  /**
   * تنسيق مسار التعلم للاستجابة
   */
  formatLearningPath(learningPath, fullDetails = false) {
    const baseFormat = {
      id: learningPath._id,
      name: learningPath.name,
      description: learningPath.description,
      careerGoal: learningPath.careerGoal,
      status: learningPath.status,
      progress: learningPath.progress,
      improvementMetrics: learningPath.improvementMetrics,
      settings: learningPath.settings,
      createdAt: learningPath.createdAt,
      updatedAt: learningPath.updatedAt,
      targetCompletionDate: learningPath.targetCompletionDate,
      actualCompletionDate: learningPath.actualCompletionDate,
      metadata: {
        version: learningPath.metadata?.version || '1.0',
        algorithm: learningPath.metadata?.algorithm || 'hybrid',
        stagesCount: learningPath.stages?.length || 0,
        coursesCount: learningPath.stages?.reduce((sum, stage) => 
          sum + (stage.courses?.length || 0), 0) || 0
      }
    };

    if (fullDetails) {
      return {
        ...baseFormat,
        stages: learningPath.stages?.map(stage => ({
          order: stage.order,
          name: stage.name,
          description: stage.description,
          objective: stage.objective,
          estimatedDuration: stage.estimatedDuration,
          courses: stage.courses?.map(course => ({
            order: course.order,
            courseTitle: course.courseTitle,
            courseDescription: course.courseDescription,
            platform: course.platform,
            url: course.url,
            duration: course.duration,
            level: course.level,
            skillsCovered: course.skillsCovered,
            status: course.status,
            progress: course.progress,
            startedAt: course.startedAt,
            completedAt: course.completedAt,
            employmentImprovement: course.employmentImprovement,
            notes: course.notes
          })) || [],
          prerequisites: stage.prerequisites,
          status: stage.status,
          progress: stage.progress,
          startedAt: stage.startedAt,
          completedAt: stage.completedAt
        })) || [],
        targetSkills: learningPath.targetSkills,
        nextRecommendations: learningPath.nextRecommendations
      };
    }

    return baseFormat;
  }
}

module.exports = new LearningPathController();