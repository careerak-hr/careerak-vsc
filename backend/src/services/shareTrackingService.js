const JobShare = require('../models/JobShare');
const JobPosting = require('../models/JobPosting');
const mongoose = require('mongoose');

class ShareTrackingService {
  /**
   * تسجيل مشاركة وظيفة
   * @param {Object} data - بيانات المشاركة
   * @returns {Object} - نتيجة التسجيل
   */
  async trackShare(data) {
    try {
      const { jobId, userId, platform, ipAddress, userAgent, metadata } = data;

      // التحقق من وجود الوظيفة
      const job = await JobPosting.findById(jobId);
      if (!job) {
        return {
          success: false,
          error: 'Job not found'
        };
      }

      // إنشاء سجل المشاركة
      const share = new JobShare({
        jobId,
        userId,
        platform,
        ipAddress,
        userAgent,
        metadata: metadata || {}
      });

      // التحقق من spam
      const isSpam = await share.isSpam();
      if (isSpam) {
        return {
          success: false,
          error: 'Share limit exceeded. Maximum 10 shares per job per day.',
          spam: true
        };
      }

      // حفظ المشاركة
      await share.save();

      // تحديث عداد المشاركات في الوظيفة
      await JobPosting.findByIdAndUpdate(
        jobId,
        { $inc: { shareCount: 1 } }
      );

      return {
        success: true,
        share: {
          id: share._id,
          jobId: share.jobId,
          platform: share.platform,
          timestamp: share.timestamp
        },
        newShareCount: job.shareCount + 1
      };
    } catch (error) {
      console.error('Error tracking share:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * الحصول على إحصائيات المشاركة لوظيفة
   * @param {String} jobId - معرف الوظيفة
   * @returns {Object} - إحصائيات المشاركة
   */
  async getJobShareStats(jobId) {
    try {
      // التحقق من صحة معرف الوظيفة
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return {
          success: false,
          error: 'Invalid job ID'
        };
      }

      const job = await JobPosting.findById(jobId);
      if (!job) {
        return {
          success: false,
          error: 'Job not found'
        };
      }

      // إجمالي المشاركات
      const totalShares = await JobShare.getShareCount(jobId);

      // المشاركات حسب المنصة
      const sharesByPlatform = await JobShare.getSharesByPlatform(jobId);

      // المشاركات في آخر 7 أيام
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const sharesLast7Days = await JobShare.getSharesInPeriod(
        jobId,
        last7Days,
        new Date()
      );

      // المشاركات في آخر 30 يوم
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sharesLast30Days = await JobShare.getSharesInPeriod(
        jobId,
        last30Days,
        new Date()
      );

      // عدد المستخدمين الفريدين الذين شاركوا
      const uniqueUsers = await JobShare.distinct('userId', { jobId });

      // الاتجاه (trend) - مقارنة آخر 7 أيام مع الأسبوع السابق
      const previous7Days = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const sharesPrevious7Days = await JobShare.getSharesInPeriod(
        jobId,
        previous7Days,
        last7Days
      );

      const trend = sharesPrevious7Days > 0
        ? ((sharesLast7Days - sharesPrevious7Days) / sharesPrevious7Days * 100).toFixed(1)
        : sharesLast7Days > 0 ? 100 : 0;

      return {
        success: true,
        stats: {
          jobId,
          jobTitle: job.title,
          totalShares,
          uniqueSharers: uniqueUsers.length,
          sharesByPlatform: sharesByPlatform.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          recentActivity: {
            last7Days: sharesLast7Days,
            last30Days: sharesLast30Days,
            trend: `${trend > 0 ? '+' : ''}${trend}%`
          },
          averageSharesPerUser: uniqueUsers.length > 0
            ? (totalShares / uniqueUsers.length).toFixed(2)
            : 0
        }
      };
    } catch (error) {
      console.error('Error getting job share stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * الحصول على إحصائيات المشاركة لمستخدم
   * @param {String} userId - معرف المستخدم
   * @param {Number} days - عدد الأيام (افتراضي: 30)
   * @returns {Object} - إحصائيات المشاركة
   */
  async getUserShareStats(userId, days = 30) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      const stats = await JobShare.getUserShareStats(userId, days);

      if (!stats || stats.length === 0) {
        return {
          success: true,
          stats: {
            userId,
            period: `${days} days`,
            totalShares: 0,
            platformCount: 0,
            jobCount: 0
          }
        };
      }

      return {
        success: true,
        stats: {
          userId,
          period: `${days} days`,
          ...stats[0]
        }
      };
    } catch (error) {
      console.error('Error getting user share stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * الحصول على أكثر الوظائف مشاركة
   * @param {Number} limit - عدد النتائج (افتراضي: 10)
   * @param {Number} days - عدد الأيام (افتراضي: 30)
   * @returns {Object} - قائمة الوظائف الأكثر مشاركة
   */
  async getMostSharedJobs(limit = 10, days = 30) {
    try {
      const jobs = await JobShare.getMostSharedJobs(limit, days);

      return {
        success: true,
        period: `${days} days`,
        jobs: jobs.map(item => ({
          jobId: item.jobId,
          title: item.job.title,
          company: item.job.company?.name || 'N/A',
          shareCount: item.shareCount,
          uniqueSharers: item.uniqueUserCount,
          platformsUsed: item.platformCount,
          averageSharesPerUser: (item.shareCount / item.uniqueUserCount).toFixed(2)
        }))
      };
    } catch (error) {
      console.error('Error getting most shared jobs:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * الحصول على اتجاهات المشاركة (trends)
   * @param {String} jobId - معرف الوظيفة (اختياري)
   * @param {Number} days - عدد الأيام (افتراضي: 30)
   * @returns {Object} - اتجاهات المشاركة
   */
  async getShareTrends(jobId = null, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const matchStage = jobId
        ? { jobId: mongoose.Types.ObjectId(jobId), timestamp: { $gte: startDate } }
        : { timestamp: { $gte: startDate } };

      const trends = await JobShare.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              platform: '$platform'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } },
        {
          $group: {
            _id: '$_id.date',
            platforms: {
              $push: {
                platform: '$_id.platform',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        success: true,
        period: `${days} days`,
        jobId: jobId || 'all',
        trends: trends.map(item => ({
          date: item._id,
          total: item.total,
          byPlatform: item.platforms.reduce((acc, p) => {
            acc[p.platform] = p.count;
            return acc;
          }, {})
        }))
      };
    } catch (error) {
      console.error('Error getting share trends:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * حذف سجلات المشاركة القديمة (للصيانة)
   * @param {Number} days - حذف السجلات الأقدم من هذا العدد من الأيام
   * @returns {Object} - نتيجة الحذف
   */
  async cleanupOldShares(days = 365) {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const result = await JobShare.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      return {
        success: true,
        deletedCount: result.deletedCount,
        message: `Deleted ${result.deletedCount} share records older than ${days} days`
      };
    } catch (error) {
      console.error('Error cleaning up old shares:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ShareTrackingService();
