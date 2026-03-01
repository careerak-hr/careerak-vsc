/**
 * 🔔 Real-time Recommendation Notification Service
 * خدمة الإشعارات الفورية للتوصيات
 * 
 * توفر إشعارات فورية عند:
 * - نشر وظيفة جديدة تناسب المستخدم
 * - تسجيل مرشح جديد مناسب لوظيفة الشركة
 * - تحديث التوصيات بناءً على تغييرات الملف الشخصي
 * 
 * Requirements: 7.1, 7.2
 */

const notificationService = require('./notificationService');
const pusherService = require('./pusherService');
const ContentBasedFiltering = require('./contentBasedFiltering');
const JobPosting = require('../models/JobPosting');
const { Individual, Company } = require('../models/User');
const logger = require('../utils/logger');

class RealtimeRecommendationNotificationService {
  constructor() {
    this.contentBasedFiltering = new ContentBasedFiltering();
    this.minMatchScore = 60; // الحد الأدنى لنسبة التطابق للإشعار (60%)
  }

  /**
   * إشعار فوري عند نشر وظيفة جديدة
   * يبحث عن المستخدمين المناسبين ويرسل إشعارات فورية
   * 
   * @param {ObjectId} jobId - معرف الوظيفة الجديدة
   * @returns {Object} نتيجة الإشعارات
   */
  async notifyUsersForNewJob(jobId) {
    try {
      logger.info(`[Real-time Notifications] Processing new job: ${jobId}`);
      
      // 1. جلب بيانات الوظيفة
      const job = await JobPosting.findById(jobId)
        .populate('postedBy', 'companyName companyIndustry');
      
      if (!job) {
        logger.warn(`Job ${jobId} not found`);
        return { success: false, notified: 0, error: 'Job not found' };
      }

      // 2. جلب جميع المستخدمين النشطين (Individuals)
      const users = await Individual.find({ 
        accountStatus: 'Active',
        'preferences.tracking.enabled': { $ne: false } // فقط المستخدمين الذين لم يعطلوا التتبع
      }).limit(1000); // حد معقول لتجنب الحمل الزائد

      if (!users.length) {
        logger.info('No active users found');
        return { success: true, notified: 0, message: 'No active users' };
      }

      logger.info(`Found ${users.length} active users to check`);

      // 3. حساب التطابق لكل مستخدم
      const matchingUsers = [];
      
      for (const user of users) {
        try {
          const match = await this.contentBasedFiltering.calculateMatchScore(user, job);
          
          // إذا كان التطابق أعلى من الحد الأدنى
          if (match.score >= this.minMatchScore) {
            matchingUsers.push({
              userId: user._id,
              matchScore: match.score,
              reasons: match.reasons,
              user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
              }
            });
          }
        } catch (error) {
          logger.error(`Error calculating match for user ${user._id}:`, error);
        }
      }

      logger.info(`Found ${matchingUsers.length} matching users (score >= ${this.minMatchScore}%)`);

      if (!matchingUsers.length) {
        return { 
          success: true, 
          notified: 0, 
          message: 'No matching users found',
          jobTitle: job.title
        };
      }

      // 4. إرسال إشعارات فورية لجميع المستخدمين المطابقين
      const notifications = await Promise.allSettled(
        matchingUsers.map(match => 
          this.sendJobMatchNotification(match.userId, job, match.matchScore, match.reasons)
        )
      );

      const successCount = notifications.filter(n => n.status === 'fulfilled').length;
      const failedCount = notifications.filter(n => n.status === 'rejected').length;

      logger.info(`[Real-time Notifications] Job ${job.title}: ${successCount} sent, ${failedCount} failed`);

      return {
        success: true,
        notified: successCount,
        failed: failedCount,
        jobTitle: job.title,
        jobId: job._id,
        matchingUsers: matchingUsers.length,
        averageMatchScore: matchingUsers.reduce((sum, m) => sum + m.matchScore, 0) / matchingUsers.length
      };

    } catch (error) {
      logger.error('[Real-time Notifications] Error notifying users for new job:', error);
      return { 
        success: false, 
        notified: 0, 
        error: error.message 
      };
    }
  }

  /**
   * إرسال إشعار فوري لمستخدم واحد عن وظيفة مناسبة
   * 
   * @param {ObjectId} userId - معرف المستخدم
   * @param {Object} job - بيانات الوظيفة
   * @param {Number} matchScore - نسبة التطابق
   * @param {Array} reasons - أسباب التطابق
   */
  async sendJobMatchNotification(userId, job, matchScore, reasons) {
    try {
      // 1. إنشاء إشعار في قاعدة البيانات
      const notification = await notificationService.createNotification({
        recipient: userId,
        type: 'job_match',
        title: 'وظيفة جديدة مناسبة لك! 🎯',
        message: `وظيفة "${job.title}" في ${job.postedBy?.companyName || job.location} تناسب مهاراتك بنسبة ${matchScore}%`,
        relatedData: { 
          jobPosting: job._id,
          matchScore,
          reasons: reasons.slice(0, 3) // أول 3 أسباب فقط
        },
        priority: matchScore >= 80 ? 'high' : 'medium'
      });

      // 2. إرسال إشعار فوري عبر Pusher
      if (pusherService.isEnabled()) {
        await pusherService.sendNotificationToUser(userId, {
          type: 'job_match',
          notificationId: notification?._id,
          title: 'وظيفة جديدة مناسبة لك! 🎯',
          message: `وظيفة "${job.title}" تناسب مهاراتك بنسبة ${matchScore}%`,
          jobId: job._id,
          jobTitle: job.title,
          company: job.postedBy?.companyName,
          location: job.location,
          matchScore,
          reasons: reasons.slice(0, 3),
          timestamp: new Date().toISOString(),
          action: {
            type: 'view_job',
            url: `/job-postings/${job._id}`
          }
        });
        
        logger.debug(`Real-time notification sent to user ${userId} for job ${job.title}`);
      }

      return { success: true, userId, jobId: job._id };

    } catch (error) {
      logger.error(`Error sending job match notification to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * إشعار فوري للشركة عند تسجيل مرشح مناسب
   * 
   * @param {ObjectId} candidateId - معرف المرشح الجديد
   * @returns {Object} نتيجة الإشعارات
   */
  async notifyCompaniesForNewCandidate(candidateId) {
    try {
      logger.info(`[Real-time Notifications] Processing new candidate: ${candidateId}`);

      // 1. جلب بيانات المرشح
      const candidate = await Individual.findById(candidateId);
      
      if (!candidate) {
        logger.warn(`Candidate ${candidateId} not found`);
        return { success: false, notified: 0, error: 'Candidate not found' };
      }

      // 2. جلب الوظائف المفتوحة
      const jobs = await JobPosting.find({ status: 'Open' })
        .populate('postedBy', 'companyName')
        .limit(500); // حد معقول

      if (!jobs.length) {
        logger.info('No open jobs found');
        return { success: true, notified: 0, message: 'No open jobs' };
      }

      logger.info(`Found ${jobs.length} open jobs to check`);

      // 3. حساب التطابق مع كل وظيفة
      const matchingJobs = [];
      
      for (const job of jobs) {
        try {
          const match = await this.contentBasedFiltering.calculateMatchScore(candidate, job);
          
          // إذا كان التطابق أعلى من الحد الأدنى
          if (match.score >= this.minMatchScore) {
            matchingJobs.push({
              jobId: job._id,
              companyId: job.postedBy._id,
              matchScore: match.score,
              reasons: match.reasons,
              job: {
                title: job.title,
                location: job.location,
                companyName: job.postedBy.companyName
              }
            });
          }
        } catch (error) {
          logger.error(`Error calculating match for job ${job._id}:`, error);
        }
      }

      logger.info(`Found ${matchingJobs.length} matching jobs (score >= ${this.minMatchScore}%)`);

      if (!matchingJobs.length) {
        return { 
          success: true, 
          notified: 0, 
          message: 'No matching jobs found',
          candidateName: `${candidate.firstName} ${candidate.lastName}`
        };
      }

      // 4. إرسال إشعارات فورية للشركات
      const notifications = await Promise.allSettled(
        matchingJobs.map(match => 
          this.sendCandidateMatchNotification(
            match.companyId, 
            candidate, 
            match.job, 
            match.matchScore, 
            match.reasons
          )
        )
      );

      const successCount = notifications.filter(n => n.status === 'fulfilled').length;
      const failedCount = notifications.filter(n => n.status === 'rejected').length;

      logger.info(`[Real-time Notifications] Candidate ${candidate.firstName}: ${successCount} sent, ${failedCount} failed`);

      return {
        success: true,
        notified: successCount,
        failed: failedCount,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        candidateId: candidate._id,
        matchingJobs: matchingJobs.length,
        averageMatchScore: matchingJobs.reduce((sum, m) => sum + m.matchScore, 0) / matchingJobs.length
      };

    } catch (error) {
      logger.error('[Real-time Notifications] Error notifying companies for new candidate:', error);
      return { 
        success: false, 
        notified: 0, 
        error: error.message 
      };
    }
  }

  /**
   * إرسال إشعار فوري لشركة عن مرشح مناسب
   * 
   * @param {ObjectId} companyId - معرف الشركة
   * @param {Object} candidate - بيانات المرشح
   * @param {Object} job - بيانات الوظيفة
   * @param {Number} matchScore - نسبة التطابق
   * @param {Array} reasons - أسباب التطابق
   */
  async sendCandidateMatchNotification(companyId, candidate, job, matchScore, reasons) {
    try {
      // 1. إنشاء إشعار في قاعدة البيانات
      const notification = await notificationService.createNotification({
        recipient: companyId,
        type: 'candidate_match',
        title: 'مرشح مناسب لوظيفتك! 👤',
        message: `${candidate.firstName} ${candidate.lastName} (${candidate.specialization}) مناسب لوظيفة "${job.title}" بنسبة ${matchScore}%`,
        relatedData: { 
          candidate: candidate._id,
          jobPosting: job._id,
          matchScore,
          reasons: reasons.slice(0, 3)
        },
        priority: matchScore >= 80 ? 'high' : 'medium'
      });

      // 2. إرسال إشعار فوري عبر Pusher
      if (pusherService.isEnabled()) {
        await pusherService.sendNotificationToUser(companyId, {
          type: 'candidate_match',
          notificationId: notification?._id,
          title: 'مرشح مناسب لوظيفتك! 👤',
          message: `${candidate.firstName} ${candidate.lastName} مناسب لوظيفة "${job.title}"`,
          candidateId: candidate._id,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          candidateSpecialization: candidate.specialization,
          jobId: job._id,
          jobTitle: job.title,
          matchScore,
          reasons: reasons.slice(0, 3),
          timestamp: new Date().toISOString(),
          action: {
            type: 'view_candidate',
            url: `/candidates/${candidate._id}`
          }
        });
        
        logger.debug(`Real-time notification sent to company ${companyId} for candidate ${candidate.firstName}`);
      }

      return { success: true, companyId, candidateId: candidate._id };

    } catch (error) {
      logger.error(`Error sending candidate match notification to company ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * إشعار فوري عند تحديث الملف الشخصي
   * يعيد حساب التوصيات ويرسل إشعار إذا وجدت تطابقات جديدة عالية
   * 
   * @param {ObjectId} userId - معرف المستخدم
   * @param {Object} changes - التغييرات في الملف الشخصي
   * @returns {Object} نتيجة الإشعار
   */
  async notifyProfileUpdateRecommendations(userId, changes) {
    try {
      logger.info(`[Real-time Notifications] Profile updated for user: ${userId}`);

      // 1. جلب بيانات المستخدم المحدثة
      const user = await Individual.findById(userId);
      
      if (!user) {
        logger.warn(`User ${userId} not found`);
        return { success: false, error: 'User not found' };
      }

      // 2. جلب الوظائف المفتوحة
      const jobs = await JobPosting.find({ status: 'Open' })
        .populate('postedBy', 'companyName')
        .limit(100);

      if (!jobs.length) {
        logger.info('No open jobs found');
        return { success: true, notified: false, message: 'No open jobs' };
      }

      // 3. حساب التطابق مع الوظائف
      const highMatches = [];
      
      for (const job of jobs) {
        try {
          const match = await this.contentBasedFiltering.calculateMatchScore(user, job);
          
          // فقط التطابقات العالية جداً (80%+)
          if (match.score >= 80) {
            highMatches.push({
              job,
              matchScore: match.score,
              reasons: match.reasons
            });
          }
        } catch (error) {
          logger.error(`Error calculating match for job ${job._id}:`, error);
        }
      }

      logger.info(`Found ${highMatches.length} high matches (score >= 80%) after profile update`);

      // 4. إرسال إشعار إذا وجدت تطابقات عالية
      if (highMatches.length > 0) {
        // ترتيب حسب النسبة
        highMatches.sort((a, b) => b.matchScore - a.matchScore);
        const topMatch = highMatches[0];

        // إنشاء إشعار
        const notification = await notificationService.createNotification({
          recipient: userId,
          type: 'recommendation_update',
          title: 'تطابق عالي بعد تحديث ملفك! 🎯',
          message: `وجدنا ${highMatches.length} وظائف بتطابق عالي (80%+) بعد تحديث ملفك الشخصي`,
          relatedData: { 
            topMatch: {
              jobId: topMatch.job._id,
              jobTitle: topMatch.job.title,
              matchScore: topMatch.matchScore
            },
            totalHighMatches: highMatches.length,
            changes
          },
          priority: 'high'
        });

        // إرسال إشعار فوري عبر Pusher
        if (pusherService.isEnabled()) {
          await pusherService.sendNotificationToUser(userId, {
            type: 'recommendation_update',
            notificationId: notification?._id,
            title: 'تطابق عالي بعد تحديث ملفك! 🎯',
            message: `وجدنا ${highMatches.length} وظائف بتطابق عالي`,
            topMatch: {
              jobId: topMatch.job._id,
              jobTitle: topMatch.job.title,
              company: topMatch.job.postedBy?.companyName,
              matchScore: topMatch.matchScore,
              reasons: topMatch.reasons.slice(0, 3)
            },
            totalHighMatches: highMatches.length,
            timestamp: new Date().toISOString(),
            action: {
              type: 'view_recommendations',
              url: '/recommendations'
            }
          });
          
          logger.debug(`Profile update notification sent to user ${userId}`);
        }

        return {
          success: true,
          notified: true,
          highMatches: highMatches.length,
          topMatchScore: topMatch.matchScore
        };
      }

      return {
        success: true,
        notified: false,
        message: 'No high matches found after profile update'
      };

    } catch (error) {
      logger.error('[Real-time Notifications] Error notifying profile update:', error);
      return { 
        success: false, 
        notified: false, 
        error: error.message 
      };
    }
  }

  /**
   * تحديث الحد الأدنى لنسبة التطابق
   * 
   * @param {Number} minScore - الحد الأدنى الجديد (0-100)
   */
  setMinMatchScore(minScore) {
    if (minScore >= 0 && minScore <= 100) {
      this.minMatchScore = minScore;
      logger.info(`Min match score updated to ${minScore}%`);
    } else {
      logger.warn(`Invalid min match score: ${minScore}. Must be between 0 and 100.`);
    }
  }

  /**
   * الحصول على الحد الأدنى الحالي لنسبة التطابق
   * 
   * @returns {Number} الحد الأدنى
   */
  getMinMatchScore() {
    return this.minMatchScore;
  }
}

module.exports = new RealtimeRecommendationNotificationService();
