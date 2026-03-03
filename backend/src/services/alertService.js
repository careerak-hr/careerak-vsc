const SavedSearch = require('../models/SavedSearch');
const JobPosting = require('../models/JobPosting');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

/**
 * خدمة التنبيهات الذكية
 * تتحقق من النتائج الجديدة وترسل تنبيهات للمستخدمين
 */
class AlertService {
  /**
   * فحص النتائج الجديدة لعملية بحث محفوظة
   * @param {Object} savedSearch - عملية البحث المحفوظة
   * @returns {Promise<Array>} - الوظائف الجديدة المطابقة
   */
  async checkNewResults(savedSearch) {
    try {
      const { searchParams, lastChecked, searchType } = savedSearch;

      if (searchType !== 'jobs') {
        // حالياً ندعم الوظائف فقط
        return [];
      }

      // بناء استعلام البحث
      const query = this.buildSearchQuery(searchParams, lastChecked);

      // البحث عن الوظائف الجديدة
      const newJobs = await JobPosting.find(query)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      return newJobs;
    } catch (error) {
      logger.error('Error checking new results:', error);
      throw error;
    }
  }

  /**
   * بناء استعلام البحث بناءً على معاملات البحث
   * @param {Object} searchParams - معاملات البحث
   * @param {Date} lastChecked - آخر تاريخ فحص
   * @returns {Object} - استعلام MongoDB
   */
  buildSearchQuery(searchParams, lastChecked) {
    const query = {
      status: 'Open', // Changed from 'active' to 'Open' to match JobPosting schema
      createdAt: { $gt: lastChecked }
    };

    // البحث النصي
    if (searchParams.query) {
      query.$text = { $search: searchParams.query };
    }

    // الموقع
    if (searchParams.location) {
      query.$or = [
        { 'location.city': new RegExp(searchParams.location, 'i') },
        { 'location.country': new RegExp(searchParams.location, 'i') }
      ];
    }

    // الراتب
    if (searchParams.salaryMin || searchParams.salaryMax) {
      query['salary.min'] = {};
      if (searchParams.salaryMin) {
        query['salary.min'].$gte = searchParams.salaryMin;
      }
      if (searchParams.salaryMax) {
        query['salary.max'] = { $lte: searchParams.salaryMax };
      }
    }

    // نوع العمل
    if (searchParams.workType && searchParams.workType.length > 0) {
      query.jobType = { $in: searchParams.workType };
    }

    // مستوى الخبرة
    if (searchParams.experienceLevel && searchParams.experienceLevel.length > 0) {
      query.experienceLevel = { $in: searchParams.experienceLevel };
    }

    // المهارات
    if (searchParams.skills && searchParams.skills.length > 0) {
      if (searchParams.skillsLogic === 'AND') {
        // يجب توفر جميع المهارات
        query.skills = { $all: searchParams.skills };
      } else {
        // يكفي توفر أي مهارة
        query.skills = { $in: searchParams.skills };
      }
    }

    // حجم الشركة
    if (searchParams.companySize && searchParams.companySize.length > 0) {
      query['company.size'] = { $in: searchParams.companySize };
    }

    return query;
  }

  /**
   * إرسال تنبيه للمستخدم
   * @param {String} userId - معرف المستخدم
   * @param {Object} savedSearch - عملية البحث المحفوظة
   * @param {Array} newJobs - الوظائف الجديدة
   * @returns {Promise<void>}
   */
  async sendAlert(userId, savedSearch, newJobs) {
    try {
      if (!newJobs || newJobs.length === 0) {
        return;
      }

      const jobCount = newJobs.length;
      const searchName = savedSearch.name;

      // إنشاء رسالة الإشعار
      const title = 'وظائف جديدة تطابق بحثك';
      const message = `تم العثور على ${jobCount} وظيفة جديدة تطابق "${searchName}"`;

      // إنشاء روابط مباشرة للوظائف
      const jobLinks = newJobs.map(job => ({
        jobId: job._id,
        jobTitle: job.title,
        jobUrl: `/job-postings/${job._id}`,
        company: job.company?.name || 'غير محدد',
        location: job.location || 'غير محدد'
      }));

      // إرسال الإشعار
      await notificationService.createNotification({
        recipient: userId,
        type: 'job_match',
        title,
        message,
        relatedData: {
          savedSearchId: savedSearch._id,
          jobPostings: newJobs.map(job => job._id),
          jobLinks, // روابط مباشرة للوظائف
          searchName: savedSearch.name
        },
        priority: 'high'
      });

      logger.info(`Alert sent to user ${userId} for ${jobCount} new jobs with direct links`);
    } catch (error) {
      logger.error('Error sending alert:', error);
      throw error;
    }
  }

  /**
   * معالجة وظيفة جديدة - فحص جميع عمليات البحث المحفوظة
   * @param {Object} jobPosting - الوظيفة الجديدة
   * @returns {Promise<void>}
   */
  async processNewJob(jobPosting) {
    try {
      // جلب جميع عمليات البحث المحفوظة مع التنبيهات المفعلة
      const savedSearches = await SavedSearch.find({
        alertEnabled: true,
        searchType: 'jobs',
        alertFrequency: 'instant' // فقط التنبيهات الفورية
      }).lean();

      logger.info(`Processing new job ${jobPosting._id} against ${savedSearches.length} saved searches`);

      // فحص كل عملية بحث
      for (const savedSearch of savedSearches) {
        const matches = await this.checkJobMatchesSavedSearch(jobPosting, savedSearch);
        
        if (matches) {
          // التحقق من عدم وجود تنبيه سابق لنفس الوظيفة
          const isDuplicate = await this.isDuplicateAlert(savedSearch.userId, jobPosting._id);
          
          if (!isDuplicate) {
            // إرسال تنبيه فوري
            await this.sendAlert(savedSearch.userId, savedSearch, [jobPosting]);
          } else {
            logger.info(`Skipping duplicate alert for user ${savedSearch.userId} and job ${jobPosting._id}`);
          }
        }
      }
    } catch (error) {
      logger.error('Error processing new job:', error);
      // لا نرمي الخطأ لعدم إيقاف عملية نشر الوظيفة
    }
  }

  /**
   * التحقق من مطابقة وظيفة لعملية بحث محفوظة
   * @param {Object} job - الوظيفة
   * @param {Object} savedSearch - عملية البحث المحفوظة
   * @returns {Promise<Boolean>} - true إذا كانت مطابقة
   */
  async checkJobMatchesSavedSearch(job, savedSearch) {
    try {
      const { searchParams } = savedSearch;

      // البحث النصي
      if (searchParams.query) {
        const searchText = searchParams.query.toLowerCase();
        const jobText = `${job.title} ${job.description} ${job.skills.join(' ')}`.toLowerCase();
        if (!jobText.includes(searchText)) {
          return false;
        }
      }

      // الموقع
      if (searchParams.location) {
        const locationRegex = new RegExp(searchParams.location, 'i');
        // job.location is a string, not an object
        const locationString = typeof job.location === 'string' ? job.location : '';
        if (!locationRegex.test(locationString)) {
          return false;
        }
      }

      // الراتب
      if (searchParams.salaryMin && job.salary?.min < searchParams.salaryMin) {
        return false;
      }
      if (searchParams.salaryMax && job.salary?.max > searchParams.salaryMax) {
        return false;
      }

      // نوع العمل
      if (searchParams.workType && searchParams.workType.length > 0) {
        if (!searchParams.workType.includes(job.jobType)) {
          return false;
        }
      }

      // مستوى الخبرة
      if (searchParams.experienceLevel && searchParams.experienceLevel.length > 0) {
        if (!searchParams.experienceLevel.includes(job.experienceLevel)) {
          return false;
        }
      }

      // المهارات
      if (searchParams.skills && searchParams.skills.length > 0) {
        const jobSkills = job.skills || [];
        if (searchParams.skillsLogic === 'AND') {
          // يجب توفر جميع المهارات
          const hasAllSkills = searchParams.skills.every(skill =>
            jobSkills.some(jobSkill => 
              jobSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );
          if (!hasAllSkills) {
            return false;
          }
        } else {
          // يكفي توفر أي مهارة
          const hasAnySkill = searchParams.skills.some(skill =>
            jobSkills.some(jobSkill => 
              jobSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );
          if (!hasAnySkill) {
            return false;
          }
        }
      }

      // حجم الشركة
      if (searchParams.companySize && searchParams.companySize.length > 0) {
        if (!searchParams.companySize.includes(job.company?.size)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Error checking job match:', error);
      return false;
    }
  }

  /**
   * تشغيل التنبيهات المجدولة (يومية/أسبوعية)
   * @param {String} frequency - التكرار ('daily' أو 'weekly')
   * @returns {Promise<void>}
   */
  async runScheduledAlerts(frequency) {
    try {
      logger.info(`Running ${frequency} alerts...`);

      // جلب عمليات البحث المحفوظة مع التكرار المحدد
      const savedSearches = await SavedSearch.find({
        alertEnabled: true,
        searchType: 'jobs',
        alertFrequency: frequency
      }).lean();

      logger.info(`Found ${savedSearches.length} saved searches with ${frequency} alerts`);

      // معالجة كل عملية بحث
      for (const savedSearch of savedSearches) {
        try {
          // فحص النتائج الجديدة
          const newJobs = await this.checkNewResults(savedSearch);

          if (newJobs.length > 0) {
            // تصفية الوظائف المكررة
            const uniqueJobs = [];
            for (const job of newJobs) {
              const isDuplicate = await this.isDuplicateAlert(savedSearch.userId, job._id);
              if (!isDuplicate) {
                uniqueJobs.push(job);
              }
            }

            // إرسال تنبيه فقط إذا كانت هناك وظائف غير مكررة
            if (uniqueJobs.length > 0) {
              await this.sendAlert(savedSearch.userId, savedSearch, uniqueJobs);
              logger.info(`Sent alert to user ${savedSearch.userId} for ${uniqueJobs.length} unique jobs (filtered ${newJobs.length - uniqueJobs.length} duplicates)`);
            } else {
              logger.info(`All ${newJobs.length} jobs were duplicates for user ${savedSearch.userId}, skipping alert`);
            }

            // تحديث lastChecked
            await SavedSearch.updateOne(
              { _id: savedSearch._id },
              { lastChecked: new Date() }
            );
          }
        } catch (error) {
          logger.error(`Error processing saved search ${savedSearch._id}:`, error);
          // نستمر في معالجة باقي عمليات البحث
        }
      }

      logger.info(`Completed ${frequency} alerts`);
    } catch (error) {
      logger.error(`Error running ${frequency} alerts:`, error);
      throw error;
    }
  }

  /**
   * منع التنبيهات المكررة
   * @param {String} userId - معرف المستخدم
   * @param {String} jobId - معرف الوظيفة
   * @returns {Promise<Boolean>} - true إذا تم إرسال تنبيه سابقاً
   */
  async isDuplicateAlert(userId, jobId) {
    try {
      const Notification = require('../models/Notification');
      
      // البحث عن إشعار سابق لنفس الوظيفة
      const existingNotification = await Notification.findOne({
        recipient: userId,
        type: 'job_match',
        'relatedData.jobPostings': jobId
      }).lean();

      return !!existingNotification;
    } catch (error) {
      logger.error('Error checking duplicate alert:', error);
      return false;
    }
  }
}

module.exports = new AlertService();
