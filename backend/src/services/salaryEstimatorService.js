const SalaryData = require('../models/SalaryData');
const JobPosting = require('../models/JobPosting');
const redis = require('../config/redis');
const logger = require('../utils/logger');

class SalaryEstimatorService {
  /**
   * تقدير الراتب لوظيفة معينة
   * @param {Object} job - الوظيفة
   * @returns {Object|null} - تقدير الراتب أو null إذا لم تكن هناك بيانات كافية
   */
  async estimateSalary(job) {
    try {
      // التحقق من وجود راتب في الوظيفة
      if (!job.salary || job.salary <= 0) {
        logger.warn(`Job ${job._id} has no salary information`);
        return null;
      }

      // البحث عن بيانات الرواتب المشابهة
      const salaryData = await SalaryData.findOne({
        jobTitle: { $regex: new RegExp(job.title, 'i') },
        field: job.field,
        location: job.location?.city || job.location,
        experienceLevel: job.experienceLevel || 'mid'
      });

      // التحقق من وجود بيانات كافية (على الأقل 5 وظائف)
      if (!salaryData || salaryData.statistics.count < 5) {
        logger.info(`Insufficient salary data for job ${job._id}`);
        return null;
      }

      const provided = job.salary;
      const market = salaryData.statistics;

      // حساب المقارنة
      let comparison, percentageDiff;

      if (provided < market.average * 0.9) {
        comparison = 'below';
        percentageDiff = Math.round(((market.average - provided) / market.average) * 100);
      } else if (provided > market.average * 1.1) {
        comparison = 'above';
        percentageDiff = Math.round(((provided - market.average) / market.average) * 100);
      } else {
        comparison = 'average';
        percentageDiff = 0;
      }

      return {
        provided,
        market: {
          average: Math.round(market.average),
          min: Math.round(market.min),
          max: Math.round(market.max),
          count: market.count
        },
        comparison,
        percentageDiff
      };
    } catch (error) {
      logger.error('Error estimating salary:', error);
      throw error;
    }
  }

  /**
   * تقدير الراتب لوظيفة بواسطة ID مع التخزين المؤقت
   * @param {String} jobId - معرف الوظيفة
   * @returns {Object|null} - تقدير الراتب
   */
  async estimateSalaryByJobId(jobId) {
    try {
      // التحقق من الـ cache أولاً
      const cacheKey = `salary_estimate:${jobId}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        logger.info(`Salary estimate cache hit for job ${jobId}`);
        return JSON.parse(cached);
      }

      // جلب الوظيفة
      const job = await JobPosting.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      // حساب التقدير
      const estimate = await this.estimateSalary(job);

      // حفظ في الـ cache لمدة 24 ساعة
      if (estimate) {
        await redis.setex(cacheKey, 86400, JSON.stringify(estimate));
      }

      return estimate;
    } catch (error) {
      logger.error('Error estimating salary by job ID:', error);
      throw error;
    }
  }

  /**
   * تحديث بيانات الرواتب من الوظائف النشطة
   * يجب تشغيله بشكل دوري (شهرياً)
   */
  async updateSalaryData() {
    try {
      logger.info('Starting salary data update...');

      // جلب جميع الوظائف النشطة التي لديها راتب
      const jobs = await JobPosting.find({
        status: 'active',
        salary: { $exists: true, $gt: 0 }
      }).select('title field location experienceLevel salary');

      logger.info(`Found ${jobs.length} jobs with salary information`);

      // تجميع الوظائف حسب: العنوان، المجال، الموقع، الخبرة
      const groups = {};

      for (const job of jobs) {
        const location = job.location?.city || job.location || 'unknown';
        const experienceLevel = job.experienceLevel || 'mid';
        const key = `${job.title}|${job.field}|${location}|${experienceLevel}`;

        if (!groups[key]) {
          groups[key] = {
            jobTitle: job.title,
            field: job.field,
            location: location,
            experienceLevel: experienceLevel,
            salaries: []
          };
        }

        groups[key].salaries.push({
          amount: job.salary,
          currency: 'SAR',
          jobId: job._id,
          reportedAt: new Date()
        });
      }

      logger.info(`Created ${Object.keys(groups).length} salary groups`);

      // حساب الإحصائيات لكل مجموعة وحفظها
      let updatedCount = 0;
      let createdCount = 0;

      for (const [key, group] of Object.entries(groups)) {
        // تخطي المجموعات التي لديها أقل من 3 وظائف
        if (group.salaries.length < 3) {
          continue;
        }

        const amounts = group.salaries.map(s => s.amount);
        const sorted = amounts.sort((a, b) => a - b);

        const statistics = {
          average: Math.round(amounts.reduce((a, b) => a + b) / amounts.length),
          median: sorted[Math.floor(sorted.length / 2)],
          min: sorted[0],
          max: sorted[sorted.length - 1],
          count: amounts.length
        };

        // تحديث أو إنشاء السجل
        const result = await SalaryData.findOneAndUpdate(
          {
            jobTitle: group.jobTitle,
            field: group.field,
            location: group.location,
            experienceLevel: group.experienceLevel
          },
          {
            salaries: group.salaries,
            statistics,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );

        if (result) {
          if (result.isNew) {
            createdCount++;
          } else {
            updatedCount++;
          }
        }
      }

      logger.info(`Salary data update completed: ${createdCount} created, ${updatedCount} updated`);

      return {
        success: true,
        totalJobs: jobs.length,
        groups: Object.keys(groups).length,
        created: createdCount,
        updated: updatedCount
      };
    } catch (error) {
      logger.error('Error updating salary data:', error);
      throw error;
    }
  }

  /**
   * حذف بيانات الرواتب القديمة (أكثر من 6 أشهر)
   */
  async cleanupOldData() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const result = await SalaryData.deleteMany({
        lastUpdated: { $lt: sixMonthsAgo }
      });

      logger.info(`Cleaned up ${result.deletedCount} old salary data records`);

      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      logger.error('Error cleaning up old salary data:', error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات بيانات الرواتب
   */
  async getStatistics() {
    try {
      const totalRecords = await SalaryData.countDocuments();
      const byField = await SalaryData.aggregate([
        {
          $group: {
            _id: '$field',
            count: { $sum: 1 },
            avgSalary: { $avg: '$statistics.average' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const recentUpdates = await SalaryData.find()
        .sort({ lastUpdated: -1 })
        .limit(5)
        .select('jobTitle field location statistics.average lastUpdated');

      return {
        totalRecords,
        byField,
        recentUpdates
      };
    } catch (error) {
      logger.error('Error getting salary statistics:', error);
      throw error;
    }
  }
}

module.exports = new SalaryEstimatorService();
