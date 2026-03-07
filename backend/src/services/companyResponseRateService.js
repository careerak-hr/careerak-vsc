const JobApplication = require('../models/JobApplication');
const JobPosting = require('../models/JobPosting');

/**
 * خدمة حساب معدل استجابة الشركة
 * يحسب سرعة استجابة الشركة للطلبات بناءً على الوقت بين التقديم والمراجعة
 */
class CompanyResponseRateService {
  /**
   * حساب معدل استجابة الشركة
   * @param {String} companyId - معرف الشركة
   * @param {Number} periodDays - الفترة الزمنية بالأيام (افتراضي: 90 يوم)
   * @returns {Object} معدل الاستجابة والتصنيف
   */
  async calculateResponseRate(companyId, periodDays = 90) {
    try {
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - periodDays);

      // جلب جميع الوظائف للشركة في الفترة المحددة
      const companyJobs = await JobPosting.find({
        company: companyId,
        createdAt: { $gte: periodStart }
      }).select('_id');

      const jobIds = companyJobs.map(job => job._id);

      if (jobIds.length === 0) {
        return {
          percentage: null,
          label: null,
          averageResponseTime: null,
          totalApplications: 0,
          respondedApplications: 0,
          message: 'لا توجد بيانات كافية'
        };
      }

      // جلب جميع الطلبات للوظائف
      const applications = await JobApplication.find({
        jobPosting: { $in: jobIds },
        submittedAt: { $gte: periodStart }
      }).select('submittedAt reviewedAt status');

      const totalApplications = applications.length;

      if (totalApplications === 0) {
        return {
          percentage: null,
          label: null,
          averageResponseTime: null,
          totalApplications: 0,
          respondedApplications: 0,
          message: 'لا توجد طلبات في هذه الفترة'
        };
      }

      // حساب الطلبات التي تمت مراجعتها
      const respondedApplications = applications.filter(app => 
        app.reviewedAt && app.status !== 'Submitted'
      );

      const respondedCount = respondedApplications.length;

      // حساب متوسط وقت الاستجابة (بالساعات)
      let totalResponseTime = 0;
      respondedApplications.forEach(app => {
        const responseTime = (app.reviewedAt - app.submittedAt) / (1000 * 60 * 60); // بالساعات
        totalResponseTime += responseTime;
      });

      const averageResponseTime = respondedCount > 0 
        ? totalResponseTime / respondedCount 
        : null;

      // حساب نسبة الاستجابة
      const responsePercentage = (respondedCount / totalApplications) * 100;

      // تحديد التصنيف بناءً على متوسط وقت الاستجابة ونسبة الاستجابة
      const label = this.determineResponseLabel(averageResponseTime, responsePercentage);

      return {
        percentage: Math.round(responsePercentage),
        label,
        averageResponseTime: averageResponseTime ? Math.round(averageResponseTime) : null,
        averageResponseDays: averageResponseTime ? Math.round(averageResponseTime / 24) : null,
        totalApplications,
        respondedApplications: respondedCount,
        periodDays
      };
    } catch (error) {
      console.error('Error calculating company response rate:', error);
      throw error;
    }
  }

  /**
   * تحديد تصنيف الاستجابة (سريع، متوسط، بطيء)
   * @param {Number} avgResponseHours - متوسط وقت الاستجابة بالساعات
   * @param {Number} responsePercentage - نسبة الاستجابة
   * @returns {String} التصنيف: 'fast', 'medium', 'slow'
   */
  determineResponseLabel(avgResponseHours, responsePercentage) {
    // إذا لم تكن هناك بيانات كافية
    if (!avgResponseHours || responsePercentage < 20) {
      return null;
    }

    // معايير التصنيف:
    // سريع: استجابة خلال 48 ساعة ونسبة استجابة > 70%
    // متوسط: استجابة خلال 7 أيام ونسبة استجابة > 50%
    // بطيء: أكثر من 7 أيام أو نسبة استجابة < 50%

    const avgResponseDays = avgResponseHours / 24;

    if (avgResponseDays <= 2 && responsePercentage >= 70) {
      return 'fast';
    } else if (avgResponseDays <= 7 && responsePercentage >= 50) {
      return 'medium';
    } else {
      return 'slow';
    }
  }

  /**
   * الحصول على نص التصنيف بالعربية
   * @param {String} label - التصنيف: 'fast', 'medium', 'slow'
   * @returns {String} النص بالعربية
   */
  getResponseLabelText(label) {
    const labels = {
      fast: 'استجابة سريعة',
      medium: 'استجابة متوسطة',
      slow: 'استجابة بطيئة'
    };
    return labels[label] || 'غير محدد';
  }

  /**
   * الحصول على لون التصنيف
   * @param {String} label - التصنيف: 'fast', 'medium', 'slow'
   * @returns {String} اسم الكلاس CSS
   */
  getResponseLabelClass(label) {
    const classes = {
      fast: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      slow: 'bg-red-100 text-red-800'
    };
    return classes[label] || 'bg-gray-100 text-gray-800';
  }

  /**
   * تحديث معدل استجابة الشركة في CompanyInfo
   * @param {String} companyId - معرف الشركة
   */
  async updateCompanyResponseRate(companyId) {
    try {
      const CompanyInfo = require('../models/CompanyInfo');
      
      const responseRate = await this.calculateResponseRate(companyId);

      if (responseRate.label) {
        await CompanyInfo.findOneAndUpdate(
          { companyId },
          {
            'responseRate.percentage': responseRate.percentage,
            'responseRate.label': responseRate.label,
            'responseRate.averageResponseTime': responseRate.averageResponseTime,
            'responseRate.lastUpdated': new Date()
          },
          { upsert: true }
        );
      }

      return responseRate;
    } catch (error) {
      console.error('Error updating company response rate:', error);
      throw error;
    }
  }

  /**
   * تحديث معدلات الاستجابة لجميع الشركات
   * يُستخدم في cron job شهري
   */
  async updateAllCompaniesResponseRates() {
    try {
      const JobPosting = require('../models/JobPosting');
      
      // جلب جميع الشركات الفريدة
      const companies = await JobPosting.distinct('company');

      const results = {
        total: companies.length,
        updated: 0,
        failed: 0,
        errors: []
      };

      for (const companyId of companies) {
        try {
          await this.updateCompanyResponseRate(companyId);
          results.updated++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            companyId,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error updating all companies response rates:', error);
      throw error;
    }
  }
}

module.exports = new CompanyResponseRateService();
